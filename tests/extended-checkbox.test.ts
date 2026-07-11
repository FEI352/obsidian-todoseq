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
