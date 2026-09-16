# IELTS Vocabulary Practice · 英语单词练习

[![Vue 3](https://img.shields.io/badge/Vue.js-3-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)

> A Vue 3 IELTS vocabulary practice app with random questions, sentence ordering, pronunciation, and local progress tracking.
>
> 基于 Vue 3 的雅思词汇练习应用，支持随机题目、单词排序、句子重组、语音朗读和本地学习进度保存。

**Keywords:** IELTS vocabulary, IELTS words, English vocabulary, English learning, vocabulary practice, sentence ordering, word game, Vue 3, TypeScript, Vite, Element Plus, 雅思词汇, 英语单词, 英语学习

[中文](#中文) | [English](#english)


## 在线体验地址 

https://ielts.xiuxiumomo.com/

## 中文

基于 Vue 3 和 TypeScript 的英语词汇练习页面，通过单词释义、语音朗读和句子排序，在语境中练习 IELTS 词汇。

页面入口：`/`。启动项目后，可访问 `http://localhost:8844/`（端口以实际启动输出为准）。

### 当前功能

- **单词信息**：展示核心单词、音标和中文释义，并提供中文例句提示。
- **语音朗读**：支持朗读单词和完整英文句子；进入或切换题目时尝试自动朗读，也可以点击“再听一遍”。使用浏览器语音合成，语言为 `en-US`，语速为 `0.85`。
- **句子排序**：将英文答案拆分为随机排列的词块。点击待选单词，将其加入句子；在句子区域拖动词块调整顺序。
- **自动检查**：所有词块选入后自动检查答案；顺序有误时可以继续拖动调整。答对后显示提示，并锁定当前句子的拖动操作。
- **题目切换**：展示当前题号和题目总数，支持上一题、下一题，首尾循环切换。
- **重新练习**：清空当前拼接结果并重新打乱词块，不会清除已完成标记。
- **完成记录**：答对后按核心单词记录完成状态，保存在当前浏览器的 `localStorage`，再次访问时显示“已完成”。
- **Excel 题库**：从 `public/iets.xlsx` 读取第一张工作表；提供加载提示、空题库提示和加载失败后的重试入口。
- **响应式界面**：暖白背景、灰绿强调色、衬线单词标题和卡片布局；窄屏下词块自动换行，提示区纵向排列。
- **基础无障碍支持**：待选词块可通过 Tab 聚焦，并用 Enter 或空格选入；结果区提供辅助技术状态播报。句子拖动排序目前没有对应的键盘操作。

### 使用流程

1. 查看单词释义和中文语境提示，聆听英文句子。
2. 按预期顺序点击待选词块，组成完整句子。
3. 全部选入后等待自动检查；如顺序不正确，在上方拖动词块调整。
4. 答对后点击“下一题”，或点击“重新练习”再次练习当前题目。

### 题库格式

修改项目根目录下的 `public/iets.xlsx` 即可维护题目。第一张工作表的首行应使用以下字段名，每行对应一道题。

| 字段 | 必填 | 说明 | 示例 |
| --- | --- | --- | --- |
| `keyword` | 是 | 核心单词，也是完成记录的标识 | `emperor` |
| `answer` | 是 | 用于拆词、朗读和校验的英文句子 | `The emperor ruled the country for more than thirty years.` |
| `chinese` | 否 | 单词中文释义 | `n. 皇帝，君主` |
| `phonetic` | 否 | 音标，页面自动在两侧显示斜线 | `ˈempərər` |
| `example` | 否 | 中文例句或语境提示 | `这位皇帝统治国家三十多年。` |

加载时会去除 `keyword` 和 `answer` 的首尾空白，并将答案中的连续空白统一为一个空格。缺少有效 `keyword` 或 `answer` 的行会被过滤。答案校验区分大小写，标点保留在对应词块中。

### 完成记录与使用说明

- 存储键为 `ielts-vocab-completed`，内容为已完成核心单词的数组。
- 相同 `keyword` 的题目共享完成标记，建议需要独立记录的题目使用不同的核心单词。
- 仅保存完成标记，不保存当前题号或尚未完成的词块顺序；刷新后从第一题开始。
- 完成记录仅保存在当前浏览器、当前站点下，不提供账号登录或跨设备同步。清除站点数据会删除记录。
- 朗读效果取决于浏览器与系统提供的语音；自动朗读可能受浏览器策略限制，可以手动点击朗读按钮。浏览器不支持语音合成时，仍可进行句子排序。
- 页面目前不提供题库上传、题目搜索、错题本或间隔复习功能。

### 文件与技术

| 文件 | 职责 |
| --- | --- |
| [index.vue](./index.vue) | 页面布局、题库读取、题目切换、完成记录和加载状态 |
| [components/words-sort.vue](./components/words-sort.vue) | 单词信息、语音朗读、词块交互和答案校验 |
| [../../../public/iets.xlsx](../../../public/iets.xlsx) | Excel 题库 |

主要使用 Vue 3 Composition API、TypeScript、Element Plus、Axios、SheetJS（`xlsx`）、`vue-draggable-plus` 和 Less。语音与完成记录分别使用浏览器的 Speech Synthesis API 和 `localStorage`。

## English

An English vocabulary practice page built with Vue 3 and TypeScript. It combines definitions, speech playback, and sentence ordering to help learners practice IELTS vocabulary in context.

Route: `/`. After starting the project, open `http://localhost:8844/` (use the actual port reported by the development server).

### Current features

- **Word details**: Displays the keyword, phonetic transcription, Chinese definition, and a Chinese sentence hint.
- **Speech playback**: Reads individual words and complete English sentences. The page attempts to read the sentence when a question opens or changes, and offers a replay button. Browser speech synthesis uses `en-US` at a rate of `0.85`.
- **Sentence ordering**: Splits the English answer into shuffled word tiles. Click available tiles to add them to the sentence, then drag selected tiles to rearrange them.
- **Automatic checking**: Checks the answer once all tiles have been selected. Incorrect sequences can be rearranged and checked again. A correct answer displays feedback and disables dragging for that attempt.
- **Question navigation**: Shows the current question number and total count. Previous and next buttons wrap around at either end of the question list.
- **Retry a question**: Clears the assembled sentence and reshuffles its tiles without removing the saved completion marker.
- **Completion records**: Saves successfully completed keywords in the current browser's `localStorage` and displays their completed status on later visits.
- **Excel question bank**: Reads the first worksheet of `public/iets.xlsx`, with loading and empty states and a retry action when loading fails.
- **Responsive design**: Uses a warm off-white background, muted green accents, serif word headings, and a card layout. Tiles wrap on smaller screens, and the hint area switches to a vertical layout.
- **Basic accessibility**: Available tiles can be focused with Tab and selected with Enter or Space. Answer feedback is announced through a live status region. Drag-based sentence reordering currently has no keyboard equivalent.

### How to practice

1. Read the definition and Chinese context hint, then listen to the English sentence.
2. Click the available tiles in the intended order to build the sentence.
3. Wait for automatic checking after selecting every tile. If needed, drag the selected tiles to correct their order.
4. After a correct answer, select “下一题” (Next question), or “重新练习” (Practice again) to retry the current question.

### Question bank format

Edit `public/iets.xlsx` at the project root to maintain the question bank. Use the following column names in the first row of the first worksheet, with one question per subsequent row.

| Field | Required | Description | Example |
| --- | --- | --- | --- |
| `keyword` | Yes | Core word, also used as the completion identifier | `emperor` |
| `answer` | Yes | English sentence used for tiles, speech, and validation | `The emperor ruled the country for more than thirty years.` |
| `chinese` | No | Chinese definition | `n. 皇帝，君主` |
| `phonetic` | No | Phonetic transcription; the page adds surrounding slashes | `ˈempərər` |
| `example` | No | Chinese sentence translation or context hint | `这位皇帝统治国家三十多年。` |

Loading trims surrounding whitespace from `keyword` and `answer` and normalizes consecutive whitespace in answers to a single space. Rows without a valid `keyword` or `answer` are skipped. Answer checking is case-sensitive, and punctuation remains attached to its word tile.

### Completion records and usage notes

- The storage key is `ielts-vocab-completed`, containing an array of completed keywords.
- Questions with the same `keyword` share a completion marker. Use distinct keywords when independent completion tracking is needed.
- Only completion markers are saved. The current question number and unfinished tile order are not persisted; refreshing returns to the first question.
- Records are local to the current browser and site. There is no account login or cross-device synchronization. Clearing site data removes these records.
- Speech quality depends on browser and operating-system voices. Browser policies may block automatic playback; use the playback buttons to trigger speech manually. Sentence ordering remains available when speech synthesis is unsupported.
- Question bank uploads, question search, a mistake notebook, and spaced repetition are not currently implemented.

### Files and technology

| File | Responsibility |
| --- | --- |
| [index.vue](./index.vue) | Page layout, question loading, navigation, completion records, and loading states |
| [components/words-sort.vue](./components/words-sort.vue) | Word details, speech playback, tile interactions, and answer checking |
| [../../../public/iets.xlsx](../../../public/iets.xlsx) | Excel question bank |

The page uses the Vue 3 Composition API, TypeScript, Element Plus, Axios, SheetJS (`xlsx`), `vue-draggable-plus`, and Less. Speech playback and completion records use the browser's Speech Synthesis API and `localStorage`, respectively.
