TODO test description
DESCRIPTION: typing /desc is a quick way to add the description line if / commands are enabled

TODO test description with formatting
DESCRIPTION: format with **bold** and _italic_ and ~~strikethrough~~ and ==highlight== and `code`

TODO test description with [links](https://example.com)
DESCRIPTION: format with [[Test Embeds]] and [Example URL](https://example.com)

TODO test task that also has a very long title and description to see how well the truncation and text wrapping is working
DESCRIPTION: this is a long description to make the task wrap over more words that can be included on a single task line so it will need to wrap or truncate the content to be a maximum words 256 characters, so this line has to keep going just to make sure the test is long enough to be truncated.
SCHEDULED: <2026-07-12 Sun ++1w -3d>
DEADLINE: <2026-07-19 Sun -3d>

default (dynamic) layout

```todoseq
search: file:"Test Descriptions.md"
```

wrapped layout

```todoseq
search: file:"Test Descriptions.md"
show-description: true
wrap-content: true
```

dynamic layout icon-only with dates

```todoseq
search: file:"Test Descriptions.md"
show-description: show
show-scheduled-date: true
show-deadline-date: true
wrap-content: dynamic
```

wrapped icon-only with dates

```todoseq
search: file:"Test Descriptions.md"
show-description: show
show-scheduled-date: true
show-deadline-date: true
wrap-content: wrap
```

dynamic with dates

```todoseq
search: file:"Test Descriptions.md"
show-description: show
show-scheduled-date: true
show-deadline-date: true
wrap-content: dynamic
```

no-wrap with dates

```todoseq
search: file:"Test Descriptions.md"
show-description: show
show-scheduled-date: true
show-deadline-date: true
wrap-content: false
```

wrapped

```todoseq
search: file:"Test Descriptions.md"
show-description: true
show-scheduled-date: true
show-deadline-date: true
wrap-content: true
```
