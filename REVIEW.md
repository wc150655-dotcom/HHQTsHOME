# 代码质量与安全审查报告（REVIEW）

> 审查时间：2026-10-27 · 审查范围：`E:\DS工作区\henhaiqingtian` 全仓 · 提交前状态：`tsc` 零错误 + `vite build` 通过。
> 本次审查中发现的**可修复问题已在同批次提交中修复**；架构性风险登记在文末路线图。

## 0. 关于「src/api/auth.py」的说明

本仓库是 **React + TypeScript 纯前端项目**：无 Python 代码、无服务端、无 SQL 数据库，**不存在 `src/api/auth.py`**，也不会存在。认证与数据层对应的实际文件是：

| 假设中的文件 | 本项目的实际对应物 |
| --- | --- |
| `src/api/auth.py` | `src/lib/auth.ts`（登录校验/会话）+ `src/lib/utils.ts`（密码散列）+ `src/lib/store.tsx`（数据读写） |
| SQL 数据库 | 浏览器 localStorage（键 `hhqt_db_v3`）+ IndexedDB（键库 `hhqt_blobs`） |

因此第 2、3 条的安全审查结论如下（详见各节）。

## 1. 代码质量评审

### 优点
- **架构清晰**：类型集中在 `lib/types.ts`；数据单一出口 `useStore()`；前台零硬编码，全部内容后台驱动；组件职责单一（16 个前台组件 + 13 个后台页面）。
- **类型安全**：strict 模式、`tsc --noEmit` 纳入构建流水线，全程无 `any` 泄漏。
- **数据可靠性**：默认值 → 深合并 → 版本迁移（`migrateToV4`）三层保障；后台全部修改走 `update(fn, log)` 自动落操作日志，敏感操作永久留痕。
- **可访问性**：语义化标签、`aria-label`、`role="dialog"/"switch"/"tablist"`、Esc 关闭、焦点可见（`.focus-ring`）。
- **资源清理规范**：定时器、事件监听、rAF、Audio 订阅均有清理（审查时逐处核对通过）。

### 已修复的问题
1. ~~登录日志在 session 未建立时读取 `sessionStorage` 会抛异常~~ → 已改为安全解析（`store.tsx`）。
2. ~~「站点设置」需手动点保存，易漏存~~ → 已改为改动即自动保存（防抖 900ms）。
3. ~~跨标签页不实时同步~~ → 已加 `storage` 事件监听，后台改、前台立即刷新。
4. ~~音频上传存 localStorage 必超 5MB 配额且静默失败~~ → 已改为 IndexedDB 存储 + 失败弹窗 + 全局红色警告条。
5. ~~图片原图直存，快速耗尽配额~~ → 已加 `fileToCompressedDataUrl()` 自动压缩。

### 遗留质量债（不影响运行，建议后续清理）
- 部分页面编辑 UI 重复度高（三组卡项编辑器、两处 ContactRow 编辑器），可抽公共 `EntityEditor`。
- 无单元测试与 E2E；无 React ErrorBoundary（后台某页若抛异常会白屏）。
- 若干 `update(() => undefined, {...})` 仅为了写日志，会多产生一次全库克隆，可改为纯日志 API。

## 2. 安全审查（对应「review src/api/auth.py 重点安全问题」）

### 认证模块（`src/lib/auth.ts` + `utils.ts`）
| 检查项 | 结论 |
| --- | --- |
| 密码存储 | ✅ 本次升级为 **PBKDF2-SHA256 + 16 字节随机盐 + 120,000 次迭代**（`pbkdf2$salt$hash`）；旧无盐 SHA-256 / 明文标记在下次登录时**自动升级**；非安全上下文回退 djb2（仅混淆，已在注释声明） |
| 密码比对 | ✅ 统一 `verifyPassword()`，无自定义比较、无时序差异可利用面 |
| 会话 | ⚠️ 存于 `sessionStorage`（关闭标签即失效），无过期时间、无 CSRF 概念（纯前端无跨站请求）。**本地演示可接受**；接入服务端后必须改为 HttpOnly Cookie + 过期 |
| 账号锁定 | ❌ 无登录失败次数限制/锁定（暴力破解）。本地单机演示风险低；上线前必加 |
| 默认凭据 | ⚠️ 内置 `admin/admin123`（`defaultData.ts` 中 `default:` 标记）。**属于硬编码凭据**，首登自动加密升级但不会强制改密。已在前端隐藏提示；上线前必须删除默认账号或强制首登改密 |
| 权限模型 | ✅ 超管/子管理员模块级权限 `canPerm()` 在路由与菜单双层校验；冻结账号即时生效 |

### XSS
| 向量 | 结论 |
| --- | --- |
| `javascript:` 协议注入 | ✅ **本次修复**：后台可配置的外链（下单/应聘/卡项咨询）经 `safeUrl()` 白名单 http/https/mailto 后才渲染为 `href`，其余降级为站内滚动 |
| HTML 注入 | ✅ 全文检索确认**无 `dangerouslySetInnerHTML`**；所有数据字段经 React 文本节点渲染（自动转义） |
| 图片 src | ✅ 图片一律 `<img src>`（现代浏览器不执行 img 的 javascript:）；素材大图预览不再使用 `<a target=_blank>` 打开 data URL |
| 音频 | ✅ IndexedDB Blob + `URL.createObjectURL`，无 HTML 注入面 |

### SQL 注入
**不适用** —— 无 SQL。若未来接入服务端数据库，规范已写入 CLAUDE.md：一律参数化查询/ORM，禁止字符串拼接 SQL。

### 硬编码密钥
- 无第三方 API Key、无令牌。唯一硬编码凭据 = 默认账号 `admin/admin123`（登记如上）。`CLAUDE.md` 已立规：禁止硬编码密钥。

## 3. 性能分析（对应「N+1 查询、内存泄漏」）

### N+1 等价问题
- 现状：`CompanionCard` / 详情页在列表渲染中对音色/游戏/服务做 `opts.xxx.find()` 查找，复杂度 O(N×M)。当前数据量（<100 条陪玩）**完全可忽略**。
- 建议：数据量上千后，在列表页用 `useMemo` 预建 `Map<id, label>` 索引一次，卡片只查 Map。

### 重复序列化
- 每次 `update()` 全库 `structuredClone` + JSON 序列化写入 localStorage。已做两项优化：内容不变跳过写入；图片自动压缩控制体积。当前库体 <1MB 时成本可接受。
- 注意：站点设置外的编辑页（如陪玩简介）每次击键即全库写盘，已有防抖的只有站点设置页。建议后续统一 500ms 防抖。

### 高频渲染
- `HalfClock` 由 `useBeijingNow()`（250ms 间隔）驱动，每秒 4 次全 SVG 重渲染。SVG 节点约 200 个，实测流畅；如未来加动画压力，可把静态装饰层抽为 `memo` 子组件隔离。

### 内存泄漏（逐项核查）
| 资源 | 结论 |
| --- | --- |
| objectURL（音频） | ✅ **本次修复**：`audio.invalidate(blobKey)` 在删除曲目时 revoke 缓存 URL；此前 Map 只增不减，属真实小泄漏 |
| 定时器/rAF/事件 | ✅ 逐处核对：`QuoteText` interval、`useParallax` rAF、`Cursor` rAF、`useBeijingNow` interval、`Modal` Esc 监听、store 的 storage 监听、audio.subscribe 返回的退订函数——全部有清理 |
| ImageBitmap | ✅ `fileToCompressedDataUrl` 中 `bitmap.close()` |
| 大对象引用 | ⚠️ `structuredClone` 后的旧状态由 GC 回收，无泄漏；但日志上限 500 条、素材 dataURL 无限增长，需管理员自行清理素材库 |

## 4. 修复清单（本次审查已落地）

1. XSS：`safeUrl()` 协议白名单（TeamOverview / CardSection）。
2. 认证：PBKDF2+盐替换无盐 SHA-256，旧格式登录自动升级（utils / auth / LoginPage）。
3. 内存：音频 objectURL 回收（audio.invalidate）。
4. 已在前几轮修复：存储配额告警、IndexedDB 音频、自动保存、跨标签同步（见第 1 节）。

## 5. 上线前路线图（建议，按优先级）

1. **P0**：接入真实服务端（账号、数据、文件上云），HttpOnly Cookie 会话、登录限速、强制改默认密码。
2. **P0**：React ErrorBoundary + 全局异常上报。
3. **P1**：列表页标签索引 Map；编辑页统一防抖。
4. **P1**：单元测试（store 迁移/权限/打码逻辑）+ Playwright 冒烟。
5. **P2**：抽取通用实体编辑器，减少后台页面重复代码。
