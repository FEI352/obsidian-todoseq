import { t } from '../i18n/base';
/**
 * TimeLineRecorder — records task state changes to a JSONL timeline file.
 * 
 * When a task transitions between states (todo→doing→done), appends one line
 * to notes/quickilynotes/task-timeline/YYYY-MM-DD.jsonl
 * 
 * The timeline file syncs via FNS to the server, where Hermes reads it
 * to compute actual task durations (replacing the buggy sub/sup system).
 */

import { App, TFile, TFolder } from 'obsidian';
import { Task } from '../types/task';

export interface TimelineEvent {
    id: string;        // "path:line" — unique task identifier
    file: string;      // vault-relative path
    line: number;      // line number
    action: 'start' | 'done' | 'cancel' | 'cycle';
    at: string;        // ISO timestamp
    state: string;     // new state keyword
    title: string;     // task text
    tags?: string[];
}

export class TimeLineRecorder {
    private app: App;
    private basePath = 'notes/quickilynotes/task-timeline';

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Called when a task's completed status changes.
     * Compares old and new task to determine what happened.
     */
    async record(oldTask: Task, newTask: Task): Promise<void> {
        const events = this.buildEvent(oldTask, newTask);
        if (!events || events.length === 0) return;

        const dateStr = window.moment().format('YYYY-MM-DD');
        const dirPath = this.basePath;
        const filePath = `${dirPath}/${dateStr}.jsonl`;
        // Append all events as separate lines
        const lines = events.map(e => JSON.stringify(e)).join('\n') + '\n';

        try {
            // Ensure directory exists
            const dir = this.app.vault.getAbstractFileByPath(dirPath);
            if (!dir) {
                await this.app.vault.createFolder(dirPath);
            }

            // Append to timeline file (create if not exists)
            const file = this.app.vault.getAbstractFileByPath(filePath);
            if (file instanceof TFile) {
                await this.app.vault.append(file, lines);
            } else {
                await this.app.vault.create(filePath, lines);
            }
        } catch (err) {
            console.error('[TimeLineRecorder] failed to record event:', err);
        }
    }

    private buildEvent(oldTask: Task, newTask: Task): TimelineEvent[] {
        const id = `${newTask.path}:${newTask.line}`;
        const title = newTask.text || newTask.rawText;
        const events: TimelineEvent[] = [];

        // Todo → Doing (start)
        if (!oldTask.completed && oldTask.state !== 'DOING' && newTask.state === 'DOING') {
            events.push({
                id, file: newTask.path, line: newTask.line,
                action: 'start', at: new Date().toISOString(),
                state: newTask.state, title,
                tags: newTask.tags,
            });
        }

        // Todo → Done directly (start+done at same time)
        if (!oldTask.completed && !oldTask.state.match(/DOING|NOW|IN-PROGRESS/) &&
            newTask.completed && !events.some(e => e.action === 'start')) {
            const now = new Date().toISOString();
            events.push({
                id, file: newTask.path, line: newTask.line,
                action: 'start', at: now,
                state: 'DOING', title,
                tags: newTask.tags,
            });
        }

        // Doing → Done
        if (oldTask.state === 'DOING' && newTask.completed) {
            events.push({
                id, file: newTask.path, line: newTask.line,
                action: 'done', at: new Date().toISOString(),
                state: newTask.state, title,
                tags: newTask.tags,
            });
        }

        // Any → Completed (no DOING intermediate)
        if (oldTask.state !== 'DOING' && newTask.completed && !events.some(e => e.action === 'done')) {
            events.push({
                id, file: newTask.path, line: newTask.line,
                action: 'done', at: new Date().toISOString(),
                state: newTask.state, title,
                tags: newTask.tags,
            });
        }

        // Any → Cancelled
        if (!oldTask.completed && newTask.state === 'CANCELED') {
            events.push({
                id, file: newTask.path, line: newTask.line,
                action: 'cancel', at: new Date().toISOString(),
                state: newTask.state, title,
                tags: newTask.tags,
            });
        }

        // Any other state change (cycle)
        if (oldTask.state !== newTask.state && newTask.state !== 'CANCELED' && !newTask.completed && oldTask.state !== 'DOING' && newTask.state !== 'DOING') {
            events.push({
                id, file: newTask.path, line: newTask.line,
                action: 'cycle', at: new Date().toISOString(),
                state: newTask.state, title,
                tags: newTask.tags,
            });
        }

        return events;
    }
}
