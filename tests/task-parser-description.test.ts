import { TaskParser } from '../src/parser/task-parser';
import {
  createTestKeywordManager,
  createCheckboxTask,
} from './helpers/test-helper';

describe('TaskParser - Description extraction', () => {
  const keywordManager = createTestKeywordManager();
  const parser = TaskParser.create(keywordManager, null);

  describe('parseFile', () => {
    it('should extract description from DESCRIPTION: line after task', () => {
      const content = `- [ ] TODO Buy groceries\nDESCRIPTION: Pick up milk, eggs, and bread`;
      const tasks = parser.parseFile(content, 'test.md');
      expect(tasks[0].description).toBe('Pick up milk, eggs, and bread');
    });

    it('should handle DESCRIPTION: before SCHEDULED:', () => {
      const content = `- [ ] TODO Buy groceries\nDESCRIPTION: Milk and eggs\nSCHEDULED: <2026-07-10>`;
      const tasks = parser.parseFile(content, 'test.md');
      expect(tasks[0].description).toBe('Milk and eggs');
      expect(tasks[0].scheduledDate).toBeTruthy();
    });

    it('should handle DESCRIPTION: after SCHEDULED:', () => {
      const content = `- [ ] TODO Buy groceries\nSCHEDULED: <2026-07-10>\nDESCRIPTION: Milk and eggs`;
      const tasks = parser.parseFile(content, 'test.md');
      expect(tasks[0].description).toBe('Milk and eggs');
      expect(tasks[0].scheduledDate).toBeTruthy();
    });

    it('should handle DESCRIPTION: between SCHEDULED: and DEADLINE:', () => {
      const content = `- [ ] TODO Buy groceries\nSCHEDULED: <2026-07-10>\nDESCRIPTION: Important items\nDEADLINE: <2026-07-12>`;
      const tasks = parser.parseFile(content, 'test.md');
      expect(tasks[0].description).toBe('Important items');
      expect(tasks[0].scheduledDate).toBeTruthy();
      expect(tasks[0].deadlineDate).toBeTruthy();
    });

    it('should handle task with no description', () => {
      const content = `- [ ] TODO Buy groceries\nSCHEDULED: <2026-07-10>`;
      const tasks = parser.parseFile(content, 'test.md');
      expect(tasks[0].description).toBeUndefined();
    });

    it('should handle quoted DESCRIPTION:', () => {
      const content = `> - [ ] TODO Buy groceries\n> DESCRIPTION: Quoted description`;
      const tasks = parser.parseFile(content, 'test.md');
      expect(tasks[0].description).toBe('Quoted description');
    });

    it('should handle nested quoted DESCRIPTION:', () => {
      const content = `> > - [ ] TODO Buy groceries\n> > DESCRIPTION: Nested quoted description`;
      const tasks = parser.parseFile(content, 'test.md');
      expect(tasks[0].description).toBe('Nested quoted description');
    });

    it('should not treat non-DESCRIPTION: lines as description', () => {
      const content = `- [ ] TODO Buy groceries\nNOTES: This is not a description`;
      const tasks = parser.parseFile(content, 'test.md');
      expect(tasks[0].description).toBeUndefined();
    });

    it('should handle indented DESCRIPTION:', () => {
      const content = `  - [ ] TODO Buy groceries\n  DESCRIPTION: Indented description`;
      const tasks = parser.parseFile(content, 'test.md');
      expect(tasks[0].description).toBe('Indented description');
    });

    it('should ignore empty DESCRIPTION:', () => {
      const content = `- [ ] TODO Buy groceries\nDESCRIPTION:`;
      const tasks = parser.parseFile(content, 'test.md');
      expect(tasks[0].description).toBeUndefined();
    });

    it('should handle DESCRIPTION: with only whitespace', () => {
      const content = `- [ ] TODO Buy groceries\nDESCRIPTION:   `;
      const tasks = parser.parseFile(content, 'test.md');
      expect(tasks[0].description).toBeUndefined();
    });
  });
});
