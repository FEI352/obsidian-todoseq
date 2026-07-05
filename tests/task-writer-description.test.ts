import { TaskWriter } from '../src/services/task-writer';
import { Task } from '../src/types/task';
import {
  createTestKeywordManager,
  createBaseTask,
} from './helpers/test-helper';

describe('TaskWriter - Description methods', () => {
  const keywordManager = createTestKeywordManager();

  describe('calcDateLineInsertIndex', () => {
    const writer = new TaskWriter(null as never, keywordManager);
    const calc = (
      lines: string[],
      taskLine: number,
      dateType: 'SCHEDULED' | 'DEADLINE' | 'CLOSED',
    ) =>
      (writer as never)['calcDateLineInsertIndex'](
        lines,
        taskLine,
        dateType,
        '',
      );

    it('should insert SCHEDULED after task when no lines exist', () => {
      const lines = ['- [ ] TODO Task'];
      expect(calc(lines, 0, 'SCHEDULED')).toBe(1);
    });

    it('should insert SCHEDULED before DEADLINE', () => {
      const lines = ['- [ ] TODO Task', 'DEADLINE: <2026-07-12>'];
      expect(calc(lines, 0, 'SCHEDULED')).toBe(1);
    });

    it('should insert DEADLINE after SCHEDULED', () => {
      const lines = ['- [ ] TODO Task', 'SCHEDULED: <2026-07-10>'];
      expect(calc(lines, 0, 'DEADLINE')).toBe(2);
    });

    it('should insert DEADLINE after SCHEDULED and DESCRIPTION', () => {
      const lines = [
        '- [ ] TODO Task',
        'DESCRIPTION: Notes',
        'SCHEDULED: <2026-07-10>',
      ];
      expect(calc(lines, 0, 'DEADLINE')).toBe(3);
    });

    it('should insert CLOSED after DEADLINE', () => {
      const lines = [
        '- [ ] TODO Task',
        'SCHEDULED: <2026-07-10>',
        'DEADLINE: <2026-07-12>',
      ];
      expect(calc(lines, 0, 'CLOSED')).toBe(3);
    });

    it('should insert CLOSED after SCHEDULED when no DEADLINE', () => {
      const lines = ['- [ ] TODO Task', 'SCHEDULED: <2026-07-10>'];
      expect(calc(lines, 0, 'CLOSED')).toBe(2);
    });

    it('should insert in order: description, scheduled, deadline, closed', () => {
      const lines = ['- [ ] TODO Task'];
      const writer2 = new TaskWriter(null as never, keywordManager);
      const w = writer2 as never;

      // Add CLOSED first
      let result = w['updateOrInsertDateLine'](
        [...lines],
        0,
        'CLOSED',
        '<2026-07-15>',
        createBaseTask({ line: 0, rawText: lines[0], indent: '' }),
      );
      expect(result.lines).toEqual([
        '- [ ] TODO Task',
        expect.stringContaining('CLOSED:'),
      ]);

      // Add DEADLINE - should go before CLOSED
      result = w['updateOrInsertDateLine'](
        [...lines],
        0,
        'DEADLINE',
        '<2026-07-12>',
        createBaseTask({ line: 0, rawText: lines[0], indent: '' }),
      );
      expect(result.lines).toEqual([
        '- [ ] TODO Task',
        expect.stringContaining('DEADLINE:'),
      ]);

      // Add SCHEDULED - should go before DEADLINE
      result = w['updateOrInsertDateLine'](
        [...lines],
        0,
        'SCHEDULED',
        '<2026-07-10>',
        createBaseTask({ line: 0, rawText: lines[0], indent: '' }),
      );
      expect(result.lines).toEqual([
        '- [ ] TODO Task',
        expect.stringContaining('SCHEDULED:'),
      ]);
    });

    it('should insert SCHEDULED after DESCRIPTION', () => {
      const lines = ['- [ ] TODO Task', 'DESCRIPTION: Notes'];
      expect(calc(lines, 0, 'SCHEDULED')).toBe(2);
    });

    it('should insert DEADLINE after DESCRIPTION and SCHEDULED', () => {
      const lines = [
        '- [ ] TODO Task',
        'DESCRIPTION: Notes',
        'SCHEDULED: <2026-07-10>',
      ];
      expect(calc(lines, 0, 'DEADLINE')).toBe(3);
    });
  });
});
