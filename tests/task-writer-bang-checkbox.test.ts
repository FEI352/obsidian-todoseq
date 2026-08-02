import { TaskWriter } from '../src/services/task-writer';
import {
  createBaseTask,
  createTestKeywordManager,
} from './helpers/test-helper';
import { Task } from '../src/types/task';
import { TFile } from 'obsidian';
import { KeywordManager } from '../src/utils/keyword-manager';
import { TaskParser } from '../src/parser/task-parser';

class MockTFile extends TFile {
  constructor() {
    super();
  }
  path = 'test.md';
  stat: any = {};
  basename = 'test';
  extension = 'md';
  name = 'test.md';
}

function setupEditorMock(mockApp: any, lines: string[]) {
  const state = [...lines];
  const mockEditor = {
    lineCount: jest.fn(() => state.length),
    getLine: jest.fn((i: number) => state[i]),
    replaceRange: jest.fn((text: string, from: any, to: any) => {
      if (text.endsWith('\n') && from.ch === 0 && to.ch === 0) {
        state.splice(from.line, 0, text.slice(0, -1));
      } else if (from.line === to.line) {
        const line = state[from.line] ?? '';
        const before = line.slice(0, from.ch ?? 0);
        const after = line.slice(to.ch ?? line.length);
        state[from.line] = before + text + after;
      } else {
        state.splice(from.line, to.line - from.line + 1, text);
      }
    }),
    getCursor: jest.fn().mockReturnValue({ line: 0, ch: 0 }),
    setCursor: jest.fn(),
  };
  const mockMarkdownView = {
    file: { path: 'test.md' },
    editor: mockEditor,
    getViewType: jest.fn().mockReturnValue('markdown'),
    getMode: jest.fn().mockReturnValue('source'),
  };
  mockApp.workspace.getActiveViewOfType = jest
    .fn()
    .mockReturnValue(mockMarkdownView);
  mockApp.vault.getAbstractFileByPath = jest
    .fn()
    .mockReturnValue(new MockTFile());
  return { mockEditor, mockMarkdownView };
}

const REAL_DATE = Date;
function mockNow(hour: number, minute: number, second = 0) {
  // @ts-expect-error test-only Date mock
  global.Date = class extends REAL_DATE {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(2026, 7, 2, hour, minute, second);
      } else {
        // @ts-expect-error spread
        super(...args);
      }
    }
    static now() {
      return new REAL_DATE(2026, 7, 2, hour, minute, second).getTime();
    }
  };
}

describe('Bang [!] checkbox tasks (zombie marker in daily notes)', () => {
  let mockApp: any;
  let mockPlugin: any;
  let taskWriter: TaskWriter;
  let keywordManager: KeywordManager;
  let parser: TaskParser;

  beforeEach(() => {
    const mockTFile = new MockTFile();
    mockApp = {
      vault: {
        getAbstractFileByPath: jest.fn().mockReturnValue(mockTFile),
        process: jest.fn().mockResolvedValue(''),
      },
      workspace: {
        getActiveViewOfType: jest.fn(),
      },
      metadataCache: {},
    };
    mockPlugin = {
      app: mockApp,
      settings: {
        additionalInactiveKeywords: [],
        trackClosedDate: true,
        trackStartedDate: true,
        stateTransitions: {
          defaultInactive: 'TODO',
          defaultActive: 'DOING',
          defaultCompleted: 'DONE',
          transitionStatements: [],
        },
      },
    };
    mockPlugin.keywordManager = createTestKeywordManager(mockPlugin.settings);
    keywordManager = mockPlugin.keywordManager;
    taskWriter = new TaskWriter(mockPlugin as any, keywordManager);
    parser = TaskParser.create(keywordManager, mockApp as any);
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.Date = REAL_DATE;
  });

  it('parses - [!] 06:45 TODO ... as a checkbox task', () => {
    const line = '- [!] 06:45 TODO 写作 50字  <sup>5 min</sup>';
    expect(parser.isTaskLine(line)).toBe(true);
    const task = parser.parseLineAsTask(line, 0, 'test.md');
    expect(task).toBeTruthy();
    expect(task!.state).toBe('TODO');
  });

  it('TODO→DOING keeps text and inserts HH:mm, checkbox becomes [/]', async () => {
    mockNow(6, 15, 4);
    const { mockEditor } = setupEditorMock(mockApp, [
      '- [!] 06:45 TODO 写作 50字  <sup>5 min</sup>',
      '',
    ]);
    const task: Task = createBaseTask({
      rawText: '- [!] 06:45 TODO 写作 50字  <sup>5 min</sup>',
      state: 'TODO',
      completed: false,
    });
    Object.assign(task, { line: 0 });

    const result = await taskWriter.applyLineUpdate(task, 'DOING');

    // [!] is a zombie/inactive marker; marking DOING maps it to [/] per the
    // standard checkbox-state mapping (same as [ ] → [/])
    expect(result.rawText).toMatch(/\[\/\] 06:15 DOING 写作 50字/);
    expect(result.rawText).toContain('<sup>5 min</sup>');
  });

  it('TODO→DONE keeps text, checkbox becomes [x]', async () => {
    mockNow(6, 15, 4);
    const { mockEditor } = setupEditorMock(mockApp, [
      '- [!] 06:45 TODO 写作 50字  <sup>5 min</sup>',
      '',
    ]);
    const task: Task = createBaseTask({
      rawText: '- [!] 06:45 TODO 写作 50字  <sup>5 min</sup>',
      state: 'TODO',
      completed: false,
    });
    Object.assign(task, { line: 0 });

    await taskWriter.applyLineUpdate(task, 'DONE');

    const lineCalls = mockEditor.replaceRange.mock.calls.map(
      (c: any[]) => c[0],
    );
    const taskLineCalls = lineCalls.filter((l: string) =>
      l.includes('写作 50字'),
    );
    const mainLine = taskLineCalls[taskLineCalls.length - 1];
    expect(mainLine).toBeTruthy();
    expect(mainLine).toMatch(/\[x\] 06:45 DONE 写作 50字/);
    expect(mainLine).toContain('<sup>5 min</sup>');
  });

  it.each(['[?]', '[<]', '[>]'])(
    'parses and cycles %s marker checkbox tasks',
    async (marker) => {
      const raw = `- ${marker} 08:00 TODO 测试任务 <sup>5 min</sup>`;
      const parsed = parser.parseLineAsTask(raw, 0, 'test.md');
      expect(parsed).toBeTruthy();
      expect(parsed!.state).toBe('TODO');

      mockNow(6, 15, 4);
      const { mockEditor } = setupEditorMock(mockApp, [raw, '']);
      const task: Task = createBaseTask({
        rawText: raw,
        state: 'TODO',
        completed: false,
      });
      Object.assign(task, { line: 0 });

      const result = await taskWriter.applyLineUpdate(task, 'DOING');
      expect(result.rawText).toMatch(/\[\/\] 06:15 DOING 测试任务/);
      expect(result.rawText).toContain('<sup>5 min</sup>');
    },
  );
});
