import { TaskParser } from '../src/parser/task-parser';
import { KeywordManager } from '../src/utils/keyword-manager';
import { TodoTrackerSettings } from '../src/settings/settings-types';

function buildParser(): TaskParser {
  const settings: Partial<TodoTrackerSettings> = {
    useExtendedCheckboxStyles: true,
    additionalInactiveKeywords: [],
    additionalActiveKeywords: [],
    additionalCompletedKeywords: [],
    additionalWaitingKeywords: [],
    additionalArchivedKeywords: [],
    stateTransitions: {
      defaultInactive: 'TODO',
      defaultActive: 'DOING',
      defaultCompleted: 'DONE',
      transitionStatements: [],
    },
  };
  const km = new KeywordManager(settings);
  return TaskParser.create(km, null);
}

describe('extended checkbox states', () => {
  it('recognises - [/] HH:mm DOING 吃早餐 as DOING state (not HH:mm)', () => {
    const parser = buildParser();
    const task = parser.parseLine('- [/] HH:mm DOING 吃早餐', 1, 'd.md');
    expect(task).not.toBeNull();
    if (!task) return;
    expect(task.completed).toBe(false);
    expect(task.state).toBe('DOING');
  });

  it('recognises - [-] DOING 任务 as not completed', () => {
    const parser = buildParser();
    const task = parser.parseLine('- [-] DOING 任务', 1, 'd.md');
    expect(task).not.toBeNull();
    if (!task) return;
    expect(task.completed).toBe(false);
  });

  it('recognises - [X] DOING 任务 as completed (uppercase X)', () => {
    const parser = buildParser();
    const task = parser.parseLine('- [X] DOING 任务', 1, 'd.md');
    expect(task).not.toBeNull();
    if (!task) return;
    expect(task.completed).toBe(true);
  });

  it('still parses classic - [x] DOING task correctly', () => {
    const parser = buildParser();
    const task = parser.parseLineAsTask('- [x] DOING task', 1, 'd.md');
    expect(task).not.toBeNull();
    if (!task) return;
    expect(task.completed).toBe(true);
    expect(task.state).toBe('DOING');
  });

  it('still parses classic - [ ] TODO task correctly', () => {
    const parser = buildParser();
    const task = parser.parseLine('- [ ] TODO 任务', 1, 'd.md');
    expect(task).not.toBeNull();
    if (!task) return;
    expect(task.completed).toBe(false);
    expect(task.state).toBe('TODO');
  });
});

describe('isTaskLine fallback for HH:mm timestamps', () => {
  function buildParser() {
    // local import re-resolution
    const { TaskParser } = require('../src/parser/task-parser');
    const { KeywordManager } = require('../src/utils/keyword-manager');
    const settings = {
      useExtendedCheckboxStyles: true,
      additionalInactiveKeywords: [],
      additionalActiveKeywords: [],
      additionalCompletedKeywords: [],
      additionalWaitingKeywords: [],
      additionalArchivedKeywords: [],
      stateTransitions: {
        defaultInactive: 'TODO',
        defaultActive: 'DOING',
        defaultCompleted: 'DONE',
        transitionStatements: [],
      },
    };
    const km = new KeywordManager(settings);
    return TaskParser.create(km, null);
  }

  it('isTaskLine returns true for - [ ] HH:mm DOING task (was false in v0.20.1)', () => {
    const parser = buildParser();
    expect(parser.isTaskLine('- [ ] 12:46 DOING Wash hands.')).toBe(true);
  });

  it('isTaskLine returns true for - [/] HH:mm DOING task', () => {
    const parser = buildParser();
    expect(parser.isTaskLine('- [/] 12:46 DOING Wash hands.')).toBe(true);
  });

  it('isTaskLine returns false for // TODO comment line (strict regex still gates)', () => {
    const parser = buildParser();
    expect(parser.isTaskLine('// TODO ignored')).toBe(false);
  });
});
