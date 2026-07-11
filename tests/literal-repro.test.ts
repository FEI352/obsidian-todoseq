
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

describe('user screenshot lines (literal repro)', () => {
  it('line 1: - [x] 12:29 继续玩蛋仔派对-3 (no keyword at all)', () => {
    const parser = buildParser();
    const task = parser.parseLineAsTask('- [x] 12:29 继续玩蛋仔派对-3', 1, 'd.md');
    expect(task).not.toBeNull();
  });

  it('line 2: - [ ] 12:46 DOING Wash hands. (user actual scenario)', () => {
    const parser = buildParser();
    const task = parser.parseLineAsTask('- [ ] 12:46 DOING Wash hands.', 1, 'd.md');
    console.log('parsed:', task);
    expect(task).not.toBeNull();
    if (!task) return;
    expect(task.state).toBe('DOING');
    expect(task.text).toContain('Wash hands');
  });

  it('line 3: - [ ] DOING Wash hands. (no timestamp, baseline)', () => {
    const parser = buildParser();
    const task = parser.parseLineAsTask('- [ ] DOING Wash hands.', 1, 'd.md');
    expect(task).not.toBeNull();
    if (!task) return;
    expect(task.state).toBe('DOING');
  });
});
