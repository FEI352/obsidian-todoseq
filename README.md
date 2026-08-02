# TODOseq for Obsidian

[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22todoseq%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=todoseq)
[![GitHub Release](https://img.shields.io/github/v/release/FEI352/obsidian-todoseq?logo=github&color=blue)](https://github.com/FEI352/obsidian-todoseq/releases/latest)
[![License](https://img.shields.io/github/license/FEI352/obsidian-todoseq)](LICENSE)

**Keyword-based task management for Obsidian. No checkboxes required.**

TODOseq ("to-do-seek") scans your vault for tasks marked with simple state keywords like `TODO`, `DOING`, and `DONE`, then presents them in a unified Task List view. Inspired by [Logseq](https://logseq.com/) and [Org-mode](https://orgmode.org/), it lets you capture tasks naturally within your notes without disrupting your writing flow.

![TODOseq Screenshot](screenshot.png)

## Why TODOseq?

Most task managers force you into a separate system. TODOseq meets you where you already work—inside your Obsidian notes. Type `TODO Write report` anywhere in your vault, and it appears instantly in your Task List. No switching contexts, no special syntax to remember, no checkboxes to click.

## Core Features

**Natural Task Capture** — Write tasks as plain text using keywords: `TODO`, `DOING`, `DONE`, `LATER`, `NOW`, `WAIT`, and more. Add priorities `[#A]`, `[#B]`, `[#C]` and dates using natural language or structured Org-mode syntax.

**Smart Date Recognition** — Type dates using everyday language like "today", "tomorrow", "every Friday", or "daily 20:00". TODOseq automatically converts them to structured format when you finish typing.

**Unified Task List** — See all tasks from across your vault in one searchable, sortable panel. Filter by state, priority, date, tags, or use advanced boolean queries. Sort by urgency to surface what matters most right now.

**Works Everywhere** — Tasks remain functional in both Edit mode and Reader view. Click any keyword to cycle through states. Right-click for direct state selection. Use `Ctrl+Enter` to toggle tasks from your keyboard.

**Code-Aware** — Extracts tasks from code comments in 20+ languages. Capture `// TODO Refactor this` from JavaScript, `# TODO Optimize query` from SQL, or `-- TODO Update schema` from SQL.

**Embedded Lists** — Render filtered task lists directly in your notes using `todoseq` code blocks. Create dynamic dashboards showing "High Priority Work Tasks" or "Overdue Items" that update automatically.

**Subtasks** — Break down complex tasks with indented checkbox items. The Task List shows subtask progress as `[1/3]` indicating completed and total subtasks.

**Repeating Tasks** — Automatically advance scheduled and deadline dates when completed. Use natural language like "every day" or Org-mode repeaters like `.+1d`, `++1w`, or `+1m` to create recurring tasks.

**Closed Date Tracking** — Optional CLOSED date on completed tasks, following Org-mode syntax. Records when tasks were marked as done and automatically manages the date when tasks are reactivated.

**Logseq Compatible** — Use the same task format across both tools. Existing Logseq tasks work without modification. Dual-use your vault or migrate at your own pace.

**Experimental Features** — Additional capabilities including Org-mode file support are available as experimental features. See [documentation](docs/experimental-features.md) for details.

## Fork Improvements（相对原版 scross01/obsidian-todoseq）

本 fork（FEI352/obsidian-todoseq，v0.20.22）在原版基础上新增以下能力：

**中文界面（i18n）** — 完整简体中文翻译 + 语言切换器，可在设置中切换 zh-CN / en。原版仅英文。

**任务时间追踪（STARTED / CLOSED 时间戳）** — 标记 DOING 时自动在任务下方写入 `STARTED: <2026-08-03 05:27:04>`，标记 DONE 时写入 `CLOSED:`，含秒级精度，默认开启。原版仅支持 CLOSED 且默认关闭。

**行内 HH:mm 自动同步** — 日记排期友好：任务行可携带预留时间槽（`- [ ] 05:27 TODO 喝水 500ml <sup>3 min</sup>`）。标记 DOING 时：
- 已有时间槽 → 覆盖为实际开始时间
- 无时间槽 → 自动插入实际开始时间（`- [ ] TODO 喝水` → `- [/] 05:27 DOING 喝水`）
- DOING → DONE 全程保留开始时间，不回退到旧预留值

**HH:mm 前缀任务全链路支持** — 解析、点击、状态循环、keyword swap 全部兼容 `- [ ] HH:mm TODO 任务` / `- [/] HH:mm DOING 任务` 格式，checkbox 字符随状态同步更新（`[ ]` → `[/]` → `[x]`）。

**扩展 checkbox 样式默认开启** — DOING/NOW 渲染 `[/]`，CANCELED 渲染 `[-]`，`[X]` 大写同样识别；Editor 实时预览与 Reading 视图双选择器覆盖（li + input）。

**JSONL 任务时间线（TimeLineRecorder）** — 记录每次任务状态变更（TODO→DOING→DONE 的时间、耗时）到 `notes/quickilynotes/task-timeline/YYYY-MM-DD.jsonl`，供外部工具精确计算任务耗时，替代手工记录。

**自动注入 <sub> 耗时元素** — 状态转换时自动在任务行注入 `<sub>实际耗时 min</sub>` 元素，配合日记模板展示实际耗时。

**Debug 日志 UI** — 设置页内置 Open / Copy 日志按钮，调试问题无需打开 DevTools，直接复制日志给开发者。

## Quick Start

### Basic Tasks with Natural Language Dates

```markdown
TODO [#A] Finish quarterly report #work tomorrow
DOING [#B] Review pull requests #coding
DONE Submit expense report
```

Or use structured Org-mode dates:

```markdown
TODO [#A] Finish quarterly report #work
SCHEDULED: <2025-03-15>

DOING [#B] Review pull requests #coding

DONE Submit expense report
DEADLINE: <2025-03-10>
```

1. **Install** from Obsidian Community Plugins (search "TODOseq")
2. **Create tasks** by typing `TODO`, `DOING`, `DONE`, etc. in any note
3. **Add dates** using natural language ("today", "tomorrow", "every Friday") or structured format
4. **Open Task List** — it appears automatically in the right sidebar (or use Command Palette → "TODOseq: Show task list")
5. **Click keywords** to cycle states, or click task text to jump to source
6. **Search** using natural language or advanced filters like `priority:high deadline:this week`

## Installation

### From Obsidian Community Plugins (Upstream Only)

Settings → Community plugins → Browse → Search "TODOseq" → Install → Enable

> 注意：社区版是原版（无本文档 Fork Improvements 章节的功能）。要使用本 fork 的全部改进，请用 BRAT 安装。

### Via BRAT (Recommended for This Fork)

1. 安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 插件
2. BRAT Settings → Add Beta Plugin → 输入 `FEI352/obsidian-todoseq`
3. 启用 TODOseq，然后在 BRAT 中 Check for updates 获取最新版本

### Manual Installation

```bash
cd /path/to/your/vault/.obsidian/plugins
git clone https://github.com/FEI352/obsidian-todoseq.git todoseq
cd todoseq
npm install
npm run build
```

Then enable "TODOseq" in Settings → Community plugins.

## Documentation

Comprehensive documentation is available at **[scross01.github.io/obsidian-todoseq](https://scross01.github.io/obsidian-todoseq/)**

- [Introduction & Philosophy](https://scross01.github.io/obsidian-todoseq/introduction.html) — Task management approach and Logseq compatibility
- [Task List](https://scross01.github.io/obsidian-todoseq/task-list.html) — Using the dedicated task panel
- [Task Entry](https://scross01.github.io/obsidian-todoseq/task-entry.html) — Task syntax, keywords, and lifecycle
- [Editor Integration](https://scross01.github.io/obsidian-todoseq/editor.html) — Working with tasks in Edit mode
- [Reader View](https://scross01.github.io/obsidian-todoseq/reader.html) — Working with tasks in Reading mode
- [Search](https://scross01.github.io/obsidian-todoseq/search.html) — Advanced search syntax and filters
- [Embedded Lists](https://scross01.github.io/obsidian-todoseq/embedded-task-lists.html) — Dynamic task lists in notes
- [Settings](https://scross01.github.io/obsidian-todoseq/settings.html) — Configuration and customization

## Examples

### Basic Tasks

```markdown
TODO Draft proposal
DOING Review feedback
DONE Submit final version
```

### With Priorities and Dates

**Natural Language Dates:**

```markdown
TODO [#A] Critical security patch tomorrow
DOING [#B] Update documentation next Friday
DONE [#C] Quarterly review monthly
```

**Structured Org-mode Dates:**

```markdown
TODO [#A] Critical security patch
DEADLINE: <2025-03-12>

DOING [#B] Update documentation
SCHEDULED: <2025-03-15>
```

**Recurring Tasks:**

```markdown
TODO Daily standup every day 9am
DOING Weekly team meeting every Friday 14:00
DONE Monthly review every month
```

### In Code Blocks

```python
# TODO Add input validation
# FIXME Handle edge case when user is null
def process_user(user):
    pass
```

### In Org-Mode Files _(Experimental)_

> **Note**: Org-mode support is an experimental feature. Enable it in Settings → TODOseq → Experimental features.

```org
* TODO [#A] Critical security patch
  DEADLINE: <2025-03-12>

** DOING [#B] Update documentation
   SCHEDULED: <2025-03-15>

*** DONE Submit expense report
```

### Embedded Task List

````markdown
```todoseq
search: tag:work priority:high
sort: urgency
show-completed: hide
limit: 10
title: High Priority Work
```
````

## Support

- ⭐ Star this repo if you find it useful
- 🐛 [Report issues](https://github.com/scross01/obsidian-todoseq/issues) or request features
- 📝 [Contribute](CONTRIBUTING.md) improvements via pull requests

## License

MIT License — see [LICENSE](LICENSE) for details.
