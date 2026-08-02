import { TaskWriter } from '../src/services/task-writer';
import {
  createBaseTask,
  createTestKeywordManager,
} from './helpers/test-helper';
import { Task } from '../src/types/task';
import { TFile } from 'obsidian';
import { KeywordManager } from '../src/utils/keyword-manager';

// Extend the prototype of our mock file to make it an instance of TFile
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

function setupEditorMock(
  mockApp: any,
  lines: string[],
): { mockEditor: any; mockMarkdownView: any } {
  const state = [...lines];
  const mockEditor = {
    lineCount: jest.fn(() => state.length),
    getLine: jest.fn((i: number) => state[i]),
    replaceRange: jest.fn((text: string, from: any, to: any) => {
      // Apply the replacement to the in-memory state (supports line insertion
      // when from.ch === to.ch === 0 and text ends with \n, and in-place
      // replacement of a single line otherwise).
      if (text.endsWith('\n') && from.ch === 0 && to.ch === 0) {
        state.splice(from.line, 0, text.slice(0, -1));
      } else if (from.line === to.line) {
        const line = state[from.line] ?? '';
        const before = line.slice(0, from.ch ?? 0);
        const after = line.slice(to.ch ?? line.length);
        state[from.line] = before + text + after;
      } else {
        // Multi-line replace: replace [from.line..to.line] with text (rare in tests)
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

// Force a deterministic started time (2026-08-02 06:15) by mocking Date
const REAL_DATE = Date;
function mockNow(hour: number, minute: number, second = 0) {
  // @ts-expect-error test-only Date mock
  global.Date = class extends REAL_DATE {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(2026, 7, 2, hour, minute, second); // month is 0-indexed: 7 = August
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

describe('TaskWriter — STARTED time syncs leading HH:mm', () => {
  let mockApp: any;
  let mockPlugin: any;
  let taskWriter: TaskWriter;
  let keywordManager: KeywordManager;

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
    };
    mockPlugin = {
      app: mockApp,
      settings: {
        additionalInactiveKeywords: ['CUSTOM'],
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
    taskWriter = new TaskWriter(
      mockPlugin as any,
      keywordManager,
    );
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.Date = REAL_DATE;
  });

  it('source mode (Editor API): rewrites leading HH:mm to started time when marking DOING', async () => {
    mockNow(6, 15, 4);
    const { mockEditor } = setupEditorMock(mockApp, [
      '- [ ] 00:31 TODO Brush teeth-1 <sup>3 min</sup>',
      '',
    ]);
    const task: Task = createBaseTask({
      rawText: '- [ ] 00:31 TODO Brush teeth-1 <sup>3 min</sup>',
      state: 'TODO',
      completed: false,
    });
    // Task line index 0 in mock editor
    Object.assign(task, { line: 0 });

    const result = await taskWriter.applyLineUpdate(task, 'DOING');

    // The main line replacement must carry [/] and the synced 06:15 time.
    // applyLineUpdate issues two replaceRange calls for the task line:
    // 1) the raw keyword swap (still 00:31), 2) the STARTED time sync (06:15).
    // The final written line is the last one containing the task text.
    const lineCalls = mockEditor.replaceRange.mock.calls.map(
      (c: any[]) => c[0],
    );
    const taskLineCalls = lineCalls.filter((l: string) =>
      l.includes('Brush teeth-1'),
    );
    const mainLine = taskLineCalls[taskLineCalls.length - 1];
    expect(mainLine).toBeTruthy();
    expect(mainLine).toContain('[/]');
    expect(mainLine).toContain('06:15');
    expect(mainLine).not.toContain('00:31');
    // A STARTED line must be inserted below
    const startedLine = lineCalls.find((l: string) =>
      l.includes('STARTED:'),
    );
    expect(startedLine).toBeTruthy();
  });

  it('atomic (Vault API): rewrites leading HH:mm in vault.process callback', async () => {
    mockNow(6, 15, 4);
    // No active editor → falls to atomic vault.process path
    mockApp.workspace.getActiveViewOfType = jest.fn().mockReturnValue(null);
    mockApp.vault.getAbstractFileByPath = jest
      .fn()
      .mockReturnValue(new MockTFile());

    const task: Task = createBaseTask({
      rawText: '- [ ] 00:31 TODO Brush teeth-1 <sup>3 min</sup>',
      state: 'TODO',
      completed: false,
    });
    Object.assign(task, { line: 0 });

    await taskWriter.applyLineUpdate(task, 'DOING');

    // vault.process callback must rewrite lines[0]
    const processCalls = mockApp.vault.process.mock.calls;
    expect(processCalls.length).toBeGreaterThan(0);
    const callback = processCalls[0][1];
    const input = '- [ ] 00:31 TODO Brush teeth-1 <sup>3 min</sup>\n';
    const output = callback(input);
    const outputLines = output.split('\n');
    expect(outputLines[0]).toContain('[/]');
    expect(outputLines[0]).toContain('06:15');
    expect(outputLines[0]).not.toContain('00:31');
    // STARTED line inserted
    expect(outputLines.join('\n')).toContain('STARTED: [2026-08-02');
  });

  it('no leading HH:mm: inserts the started time when marking DOING (Vault API)', async () => {
    mockNow(6, 15, 4);
    mockApp.workspace.getActiveViewOfType = jest.fn().mockReturnValue(null);
    mockApp.vault.getAbstractFileByPath = jest
      .fn()
      .mockReturnValue(new MockTFile());

    const task: Task = createBaseTask({
      rawText: '- [ ] TODO Brush teeth-1 <sup>3 min</sup>',
      state: 'TODO',
      completed: false,
    });
    Object.assign(task, { line: 0 });

    await taskWriter.applyLineUpdate(task, 'DOING');

    const callback = mockApp.vault.process.mock.calls[0][1];
    const output = callback('- [ ] TODO Brush teeth-1 <sup>3 min</sup>\n');
    const outputLines = output.split('\n');
    // No leading HH:mm existed → the started time is INSERTED:
    // "- [ ] TODO ..." → "- [/] 06:15 DOING ..."
    expect(outputLines[0]).toContain('[/]');
    expect(outputLines[0]).toMatch(/\[\/\] 06:15 DOING Brush teeth-1/);
    // STARTED line still inserted below
    expect(outputLines.join('\n')).toContain('STARTED: [2026-08-02');
  });

  it('no leading HH:mm: inserts the started time when marking DOING (Editor API)', async () => {
    mockNow(6, 15, 4);
    const { mockEditor } = setupEditorMock(mockApp, [
      '- [ ] TODO 喝水 500ml <sup>3 min</sup>',
      '',
    ]);
    const task: Task = createBaseTask({
      rawText: '- [ ] TODO 喝水 500ml <sup>3 min</sup>',
      state: 'TODO',
      completed: false,
    });
    Object.assign(task, { line: 0 });

    await taskWriter.applyLineUpdate(task, 'DOING');

    const lineCalls = mockEditor.replaceRange.mock.calls.map(
      (c: any[]) => c[0],
    );
    const taskLineCalls = lineCalls.filter((l: string) =>
      l.includes('喝水 500ml'),
    );
    const mainLine = taskLineCalls[taskLineCalls.length - 1];
    expect(mainLine).toBeTruthy();
    expect(mainLine).toMatch(/\[\/\] 06:15 DOING 喝水 500ml/);
    // A STARTED line must be inserted below
    expect(lineCalls.find((l: string) => l.includes('STARTED:'))).toBeTruthy();
  });

  it('DONE keeps the STARTED time, not the old reserved placeholder (regression: DOING→DONE reverted time)', async () => {
    mockNow(6, 15, 4);
    // Simulate the bug scenario: task was DOING'd at 06:15 (STARTED written),
    // but the parsed rawText still carries the old reserved placeholder 05:35
    // (e.g. stale task snapshot). Completing it must keep 06:15, not revert.
    const { mockEditor } = setupEditorMock(mockApp, [
      '- [/] 05:35 DOING 吃两粒钙片 <sup>1 min</sup>',
      '  STARTED: [2026-08-02 Sun 06:15:04]',
    ]);
    const task: Task = createBaseTask({
      rawText: '- [/] 05:35 DOING 吃两粒钙片 <sup>1 min</sup>',
      state: 'DOING',
      completed: false,
    });
    Object.assign(task, { line: 0, startedDate: new REAL_DATE(2026, 7, 2, 6, 15, 4, 0) });

    await taskWriter.applyLineUpdate(task, 'DONE');

    const lineCalls = mockEditor.replaceRange.mock.calls.map(
      (c: any[]) => c[0],
    );
    const mainLine = lineCalls.find((l: string) =>
      l.includes('吃两粒钙片'),
    );
    expect(mainLine).toContain('[x]');
    // STARTED time must survive the DOING→DONE transition
    expect(mainLine).toContain('06:15');
    expect(mainLine).not.toContain('05:35');
  });
});
