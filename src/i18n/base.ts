/**
 * Minimal i18n system for TODOseq fork.
 * Usage: import { t } from './i18n/base';
 *        t('settings.general.title') // → "通用设置"
 */

import { moment } from 'obsidian';

type Lang = 'zh' | 'en';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache: Record<string, any> = {};

export function detectLang(): Lang {
    const locale = moment.locale().toLowerCase();
    if (locale === 'zh-cn' || locale === 'zh-tw' || locale === 'zh') return 'zh';
    return 'en';
}

/**
 * Get a translation by dot-separated key.
 * Falls back to the key itself if translation not found.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
    const lang = detectLang();
    let translations: Record<string, string>;

    if (lang === 'zh') {
        translations = cache.zh ?? (cache.zh = loadZh());
    } else {
        return key; // English fallback: return key as-is
    }

    let text = translations[key] ?? key;
    if (vars) {
        for (const [k, v] of Object.entries(vars)) {
            text = text.replace(`{${k}}`, String(v));
        }
    }
    return text;
}

function loadZh(): Record<string, string> {
    return {
        // ── Settings: General ──
        'settings.general.title': '通用设置',
        'settings.general.migrated-state': '迁移后状态关键词',
        'settings.general.migrated-state-desc': '迁移任务到今日后源任务设置的状态关键词。留空则禁用。',
        'settings.general.default-inactive': '默认未激活状态',
        'settings.general.default-inactive-desc': '新任务的默认未激活关键词（如 TODO、LATER）。',
        'settings.general.default-active': '默认进行中状态',
        'settings.general.default-active-desc': '进行中任务的关键词（如 DOING、NOW）。',
        'settings.general.default-completed': '默认已完成状态',
        'settings.general.default-completed-desc': '完成任务时使用的关键词（如 DONE）。',
        'settings.general.track-closed': '记录完成时间',
        'settings.general.track-closed-desc': '任务完成时添加 closed: 时间戳。',
        'settings.general.state-transitions': '状态转换',
        'settings.general.state-transitions-desc': '每行一个转换规则。格式：关键词A -> 关键词B。使用 | 分隔多个目标。',
        'settings.general.week-start': '每周起始日',
        'settings.general.week-start-desc': '选择日期过滤器的每周起始日。',
        'settings.general.completed-tasks': '已完成任务',
        'settings.general.completed-tasks-desc': '选择任务列表中已完成项目的显示方式。',
        'settings.general.future-tasks': '未来日期任务',
        'settings.general.future-tasks-desc': '选择未来日期任务的显示方式。',

        // ── Settings: Scan ──
        'settings.scan.title': '扫描设置',
        'settings.scan.include-callout': '包含引用和标注块内的任务',
        'settings.scan.include-callout-desc': '启用后扫描引用块 (>) 和标注块内的任务。',
        'settings.scan.include-comments': '包含注释内的任务',
        'settings.scan.include-comments-desc': '启用后扫描注释 (%%...%%) 内的任务。',
        'settings.scan.include-code': '包含代码块内的任务',
        'settings.scan.include-code-desc': '启用后扫描代码块内的任务。',
        'settings.scan.lang-comment': '启用语言注释支持',
        'settings.scan.lang-comment-desc': '启用后扫描编程语言注释中的 TODO 标记（如 // TODO）。',

        // ── Settings: Display ──
        'settings.display.title': '显示设置',
        'settings.display.extended-checkbox': '使用扩展复选框样式',
        'settings.display.extended-checkbox-desc': '启用后进行中显示 - [/]，已取消显示 - [-]（需要主题支持）。',

        // ── Notices ──
        'notice.refresh-failed': '刷新任务列表失败',
        'notice.update-failed': '更新任务失败',
        'notice.view-state-failed': '设置视图状态失败',
        'notice.scan-failed': '扫描库失败',

        // ── Task list view ──
        'tasklist.title': '任务列表',
        'tasklist.no-tasks': '没有任务',
        'tasklist.search-placeholder': '搜索任务...',
        'tasklist.filter-all': '全部',
        'tasklist.filter-today': '今天',
        'tasklist.filter-active': '进行中',
        'tasklist.filter-completed': '已完成',
        'tasklist.filter-overdue': '已逾期',
        'tasklist.sort-due': '按截止日期排序',
        'tasklist.sort-priority': '按优先级排序',
        'tasklist.sort-state': '按状态排序',
        'tasklist.sort-urgency': '按紧急度排序',
        'tasklist.group-file': '按文件分组',
        'tasklist.group-tag': '按标签分组',
        'tasklist.group-state': '按状态分组',
        'tasklist.group-priority': '按优先级分组',

        // ── Commands ──
        'cmd.show-tasks': '显示任务列表',
        'cmd.show-tasks-tab': '在新标签页中打开任务列表',
        'cmd.rescan': '重新扫描库',
        'cmd.toggle-state': '切换任务状态',
        'cmd.cycle-state': '循环切换任务状态',
        'cmd.add-scheduled': '添加计划日期',
        'cmd.add-deadline': '添加截止日期',
        'cmd.set-priority-high': '设置优先级为高',
        'cmd.set-priority-medium': '设置优先级为中',
        'cmd.set-priority-low': '设置优先级为低',

        // ── Task card ──
        'task.created': '创建于',
        'task.scheduled': '计划',
        'task.deadline': '截止',
        'task.closed': '完成于',
        'task.duration': '耗时',
        'task.subtasks': '子任务',
        'task.tags': '标签',
    };
}
