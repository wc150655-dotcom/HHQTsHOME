# CLAUDE.md — 恨海情天 纯LE 官网 · 团队代码规范

> 本文件是项目根目录的团队规范，**每次对话开始时自动加载**（Claude Code 默认读取 CLAUDE.md）。所有 AI 助手与开发者在本仓库工作时，必须遵守以下约定。

## 1. 项目定位

「恨海情天纯le」陪玩团官网：解构主义 + 极简杂志静奢风（希腊众神神话视觉语言），双端口架构：

- **老板端**（前台）：`/` 开场页、`/home` 主页、`/companions` 陪玩列表、`/companions/:id` 详情
- **超级管理员后台**：`/admin`（登录、站点设置、开场页、选项库、团队概况、卡项、陪玩、头牌、塔罗榜单、页脚台账、素材库、账号权限、操作日志）

**架构事实（重要）**：
- 纯前端项目：React 18 + TypeScript + Vite 5 + Tailwind CSS 3 + React Router 6 + Framer Motion + Lucide。
- **没有 Python、没有服务端、没有 SQL 数据库**（不存在 `src/api/auth.py` 之类的文件，请勿寻找或假设存在）。
- 数据层是浏览器 localStorage（键 `hhqt_db_v3`，容量约 5MB）+ IndexedDB（键库 `hhqt_blobs`，存大文件音频）。
- 所有「数据库」读写都经过 `src/lib/store.tsx` 的 `useStore()`：**绝对禁止**绕过 store 直接读写 localStorage。

## 2. 常用命令

```bash
npm run dev      # 开发服务器 http://localhost:5173
npm run build    # tsc --noEmit 类型检查 + vite build（提交前必须通过）
npm run preview  # 预览生产构建
```

无测试框架；验证手段 = `npm run build` + 浏览器实测。

## 3. 目录与职责

```
src/
├─ lib/          # 类型、store（数据库）、audio（音乐）、blobStore（IndexedDB）、assets（SVG 素材）、utils、auth
├─ hooks/        # useBeijingNow（北京时间）、useParallax（动捕）
├─ components/   # 前台组件（HalfClock / OpeningPage / Navbar / CardSection / TopSpenderPanel / Footer …）
└─ pages/        # 前台页面；admin/ 为后台（AdminApp 布局 + 各管理页 + controls 表单控件）
```

## 4. 铁律（最高优先级）

1. **前端零硬编码**：所有文案、图片、数据、配置必须来自 `db`（store），后台可改。新增展示内容必须配套后台管理 UI。唯一例外：代码中的技术性占位与默认素材（`lib/defaultData.ts`、`lib/assets.ts`）。
2. **空数据优雅占位**：任何列表/区块数据为空时渲染 `EmptyState` 或占位样式，禁止布局崩坏或白屏。
3. **敏感数据打码**：老板昵称匿名化、消费金额打码，前端必须服从 `db.settings.sensitive.globalMask` 与塔罗席位各自开关（`maskName` / `maskAmount`）。
4. **后台操作留痕**：管理员的一切修改调用 `update(fn, { module, action, detail, sensitive })`；账号、金额、导入导出等标记 `sensitive: true`。日志不可删除。
5. **安全**：
   - 禁止硬编码任何密钥/密码（默认账号 `default:` 标记是本地演示的已知例外，登录后自动升级）。
   - 密码存储一律 `hashPassword()`（PBKDF2-SHA256 + 盐）；比对用 `verifyPassword()`，不要自己写比较。
   - 用户可配置的外链必须经 `safeUrl()`（仅 http/https/mailto），防止 `javascript:` 协议注入（XSS）。
   - React 自动转义文本；禁止引入 `dangerouslySetInnerHTML`。
6. **不引入后端依赖**：除非用户明确要求接入服务端，否则保持纯前端可运行（`npm run dev` 一条命令起站）。

## 5. 风格规范

- **TypeScript**：strict 模式，类型定义集中在 `lib/types.ts`；禁止 `any`（确需时用 `unknown` + 收窄）。
- **组件**：一个文件一个组件（小组件可同文件聚合）；React 函数组件 + hooks；组件不写业务数据逻辑，数据一律从 store 取。
- **样式**：Tailwind + CSS 变量设计令牌。颜色只用 `var(--bg/--panel/--ink/--ink-soft/--muted/--line/--line-strong/--accent/--accent-soft/--glass-*)`，**禁止**任意十六进制颜色写死在 JSX 里。两个固定例外：SVG 素材文件 `lib/assets.ts`（内部常量 INK/MID/BRONZE 是线稿固定色）；塔罗实体卡面（`TopSpenderPanel` 中 `#F4F2EF`/`#1D1D1F` 等）模拟真实纸张卡片，不随主题变化。
- **设计语言**：解构主义 × 极简杂志 × 希腊神话（黑绘陶器、月桂、希腊回纹、星座连线、描边衬线数字）。黑白灰 90% + 青铜金强调 10%；克制留白；细线不厚重；玻璃拟态用 `.glass`；动效全部受 `db.settings.effects.*` 开关控制。
- **命名**：组件 PascalCase；hooks `use*`；工具函数 camelCase；常量 UPPER_SNAKE；CSS 类 kebab-case。
- **可访问性**：交互元素用语义化标签；必须有 `aria-label`；可见焦点态（`.focus-ring`）；模态框 `role="dialog" aria-modal` + Esc 关闭。
- **中文文案**：界面文案简体中文 + 少量英文/希腊文装饰铭文；语气克制优雅，与「静奢」调性一致。

## 6. 提交与协作

- 每次修改后必须跑 `npm run build`（类型 + 构建全绿）再交付。
- 涉及数据结构变更：更新 `lib/types.ts` → `lib/defaultData.ts` → store 的 `migrateToV4`（或新增迁移函数）保证老用户数据平滑升级；迁移只替换「仍是旧默认值」的字段，不得覆盖用户自定义内容。
- 涉及视觉：同时考虑日/夜双主题（`html.dark`）与 `.ink-block` 区块内的颜色变量覆盖，不可只测浅色。
- 移动端与桌面端都要自查（<768px 与 ≥1024px 两种断点）。
- 不要为了「炫技」增加依赖；优先用已有库（lucide-react 图标、framer-motion 动画）。

## 7. 已知边界（勿重复上报）

- localStorage 约 5MB：大图片走 `fileToCompressedDataUrl()` 自动压缩；音频走 IndexedDB（`putBlob`），上限 80MB/个。
- 跨设备同步需导出/导入备份（后台 → 总览 → 数据管理），本地演示无服务端。
- 自动播放受浏览器策略限制：首次用户手势后开始播放。
- 左侧半圆钟表为背景装饰层（z-0），被内容遮挡属预期。
