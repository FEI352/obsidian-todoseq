/**
 * Minimal i18n system for TODOseq fork.
 * Usage: import { t } from './i18n/base';
 *        t('settings.general.title') // → "通用设置"
 */

import { moment } from 'obsidian';

type Lang = 'zh' | 'en';

let forcedLang: Lang | null = null;

export function setLang(lang: Lang): void {
    forcedLang = lang;
}

export function getLang(): Lang {
    if (forcedLang) return forcedLang;
    const locale = moment.locale().toLowerCase();
    if (locale === 'zh-cn' || locale === 'zh-tw' || locale === 'zh') return 'zh';
    return 'en';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache: Record<string, any> = {};

export function detectLang(): Lang {
    return getLang();
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
        'settings.display.language': '界面语言',
        'settings.display.language-desc': '切换插件界面语言。切换后刷新设置页面生效。',
        'settings.display.format-keywords': '高亮任务关键词',
        'settings.display.format-keywords-desc': '在编辑器中将任务关键词（如 TODO、DOING 等）以加粗加色彩的形式高亮显示。',
        'settings.display.smart-date': '启用智能日期识别',
        'settings.display.smart-date-desc': '自动将自然语言日期（如"今天"、"明天"、"下周三"）转换为结构化日期。',
        'settings.display.remove-date-keywords': '转换后移除日期关键词',
        'settings.display.remove-date-keywords-desc': '将自然语言日期（如"今天"、"明天"）转换为结构化日期后，删除原有的自然语言文本。',

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
    
        // ── Task list filters ──
        'filter.active': '进行中',
        'filter.archived': '已归档',
        'filter.completed': '已完成',
        'filter.inactive': '未激活',
        'filter.overdue': '已逾期',
        'filter.today': '今天',
        'filter.waiting': '等待中',

        // ── Commands ──
        'cmd.add-description': '添加描述',
        'cmd.copy-today': '复制任务到今日',
        'cmd.migrate-today': '迁移任务到今日',
        'cmd.move-today': '移动任务到今日',
        'cmd.open-context-menu': '打开右键菜单',
        'cmd.open-deadline-picker': '打开截止日期选择器',
        'cmd.open-scheduled-picker': '打开计划日期选择器',
        'cmd.open-in-new-tab': '在新标签页中打开',
        'cmd.search-tasks': '搜索任务…',
        'cmd.show-task-list': '显示任务列表',

        // ── Sort ──
        'sort.default-desc': '选择任务列表的默认排序方式。',

        // ── Errors ──
        'error.activate-task': '激活任务失败',
        'error.copy-task': '复制任务失败',
        'error.copy-today': '复制任务到今日失败',
        'error.source-file': '找不到源文件',
        'error.today-note': '无法获取或创建今日日记',
        'error.load-more': '加载更多任务失败',
        'error.migrate-today': '迁移任务到今日失败',
        'error.move-today': '移动任务到今日失败',
        'error.open-list': '打开任务列表失败',
        'error.open-location': '打开任务位置失败',
        'error.refresh-list': '刷新任务列表失败',
        'error.set-view': '设置视图状态失败',
        'error.context-menu': '显示右键菜单失败',
        'error.date-picker': '显示日期选择器失败',
        'error.update-source': '更新源任务失败',
        'error.update-task': '更新任务失败',
        'error.update-date': '更新任务日期失败',
        'error.update-deadline': '更新任务截止日期失败',
        'error.update-priority': '更新任务优先级失败',

        // ── Success messages ──
        'success.copied': '任务已复制到剪贴板',
        'success.copied-today': '任务已复制到今日日记',
        'success.migrated-today': '任务已迁移到今日日记',
        'success.moved-today': '任务已移动到今日日记',

        // ── Warnings ──
        'warn.already-in-file': '任务已在此文件中',
        'warn.already-on-today': '任务已在今日日记中',

        // ── Search ──
        'search.example-simple': '例如：agenda, overdue, work active',
        'search.example-advanced': '例如：scheduled:today, state:active, tag:work',

        // ── Programming languages ──
        'lang.cpp': 'C++',
        'lang.csharp': 'C#',
        'lang.dockerfile': 'Dockerfile',
        'lang.ini': 'INI',
        'lang.java': 'Java',
        'lang.javascript': 'JavaScript',
        'lang.kotlin': 'Kotlin',
        'lang.powershell': 'PowerShell',
        'lang.python': 'Python',
        'lang.ruby': 'Ruby',
        'lang.rust': 'Rust',
        'lang.shell': 'Shell',
        'lang.sql': 'SQL',
        'lang.swift': 'Swift',
        'lang.toml': 'TOML',
        'lang.typescript': 'TypeScript',
        'lang.yaml': 'YAML',

        'settings.display.deadline-notice': '截止前提醒天数',
        'settings.display.deadline-notice-desc': '任务接近截止日期时提前多少天开始警告。',
        'settings.display.scheduled-delay': '延迟警告天数',
        'settings.display.scheduled-delay-desc': '任务超过计划日期时延迟多少天后开始警告。',
        'settings.display.upcoming-period': '即将到来的天数',
        'settings.display.upcoming-period-desc': '任务列表中显示多少天内即将到来的任务。',
        'settings.display.task-descriptions': '任务描述',
        'settings.display.task-descriptions-desc': '启用后允许为任务添加详细描述（使用 DESCRIPTION: 标记）。',
        'settings.display.default-sort': '默认排序方式',
        'settings.display.default-sort-desc': '选择任务列表的默认排序方式。',
        'settings.display.ignore-delay': '有截止日期时忽略计划延迟',
        'settings.display.ignore-delay-desc': '勾选后，如果任务已设置截止日期，则不再触发计划日期延迟警告。',
        'settings.display.ignore-notice': '有计划日期时忽略截止前提醒',
        'settings.display.ignore-notice-desc': '勾选后，如果任务已设置计划日期，则不再触发截止前提醒。',
        'settings.scan.detect-org': '检测 org-mode 文件',
        'settings.scan.detect-org-desc': '启用后将 org-mode 文件视为任务来源文件。',
        'settings.scan.code-comments': '扫描代码文件注释',
        'settings.scan.code-comments-desc': '启用后扫描编程语言源代码中的注释（// TODO、# TODO 等）。',
        'common.cancel': '取消',
        'common.save': '保存',
        'common.search': '搜索',
        'common.scheduled': '已计划',
        'common.priority': '优先级',
        'YYYY-MM-DD': 'YYYY-MM-DD',
};
}
