
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

describe('user screenshot reproduction', () => {
  it('handles - [ ] HH:mm DOING Wash hands. (literal user input)', () => {
    const parser = buildParser();
    const task = parser.parseLineAsTask('- [ ] 12:46 DOING Wash hands.', 1, 'd.md');
    expect(task).not.toBeNull();
    if (!task) return;
    expect(task.state).toBe('DOING');
    expect(task.text).toContain('Wash hands');
  });

  it('handles - [/] HH:mm DOING Wash hands.', () => {
    const parser = buildParser();
    const task = parser.parseLineAsTask('- [/] 12:46 DOING Wash hands.', 1, 'd.md');
    expect(task).not.toBeNull();
    if (!task) return;
    expect(task.state).toBe('DOING');
  });

  it('handles - [ ] DOING Wash hands. (no timestamp)', () => {
    const parser = buildParser();
    const task = parser.parseLineAsTask('- [ ] DOING Wash hands.', 1, 'd.md');
    expect(task).not.toBeNull();
    if (!task) return;
    expect(task.state).toBe('DOING');
  });
});
