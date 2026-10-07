import { TimeLineRecorder } from '../src/services/timeline-recorder';
import { Task } from '../src/types/task';

describe('TimeLineRecorder lowercase state transitions', () => {
  it('should record start event for lowercase todo -> doing', () => {
    const recorder = new TimeLineRecorder({} as any);
    const oldTask: Task = {
      path: 'daily.md',
      line: 10,
      rawText: '- [ ] todo wash dishes',
      indent: '',
      listMarker: '- ',
      text: 'wash dishes',
      state: 'todo',
      completed: false,
      priority: null,
      scheduledDate: null,
      scheduledDateRepeat: null,
      deadlineDate: null,
      deadlineDateRepeat: null,
      closedDate: null,
      scheduledWarningPeriod: null,
      deadlineWarningPeriod: null,
      urgency: null,
      isDailyNote: true,
      dailyNoteDate: '2026-10-07',
      subtaskCount: 0,
      subtaskCompletedCount: 0,
    };
    const newTask: Task = {
      ...oldTask,
      state: 'doing',
      rawText: '- [/] doing wash dishes',
    };

    const events = (recorder as any).buildEvent(oldTask, newTask);
    expect(events).toHaveLength(1);
    expect(events[0].action).toBe('start');
    expect(events[0].state).toBe('doing');
  });

  it('should record done event for lowercase doing -> done', () => {
    const recorder = new TimeLineRecorder({} as any);
    const oldTask: Task = {
      path: 'daily.md',
      line: 10,
      rawText: '- [/] doing wash dishes',
      indent: '',
      listMarker: '- ',
      text: 'wash dishes',
      state: 'doing',
      completed: false,
      priority: null,
      scheduledDate: null,
      scheduledDateRepeat: null,
      deadlineDate: null,
      deadlineDateRepeat: null,
      closedDate: null,
      scheduledWarningPeriod: null,
      deadlineWarningPeriod: null,
      urgency: null,
      isDailyNote: true,
      dailyNoteDate: '2026-10-07',
      subtaskCount: 0,
      subtaskCompletedCount: 0,
    };
    const newTask: Task = {
      ...oldTask,
      state: 'done',
      completed: true,
      rawText: '- [x] done wash dishes',
    };

    const events = (recorder as any).buildEvent(oldTask, newTask);
    expect(events).toHaveLength(1);
    expect(events[0].action).toBe('done');
    expect(events[0].state).toBe('done');
  });
});
