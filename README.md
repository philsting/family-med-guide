# 家庭医疗信息指南

Astro + Markdown + Cloudflare Workers 静态资源。中文大字、手机卡片导航；不含客户端 JavaScript、第三方统计、外部字体、表单或数据库。

## 本地运行

项目 `.npmrc` 固定使用 legacy-peer-deps 安装策略，避免拉入未使用的可选集成依赖；`npm ci` 会自动使用相同策略。

安装 Node.js 22.12 或更高版本（推荐 Node 22 LTS），在项目目录执行：

```sh
npm ci
npm run dev
```

打开终端显示的本地地址。发布前运行：

```sh
npm run check
npm run build
npm run preview
```

`dist/` 是纯静态输出。Astro 本地预览不模拟 Cloudflare `_headers`；检查真实安全响应头可运行 `npx wrangler dev`（先 build），或在上线后检查。

## 编辑 Markdown

- `src/content/guides/medicine.md`：购药和厂家公开电话
- `first-injection.md`：第一次注射、电话话术、DTP与冷链提示
- `injection.md`：注射点状态说明
- `insurance.md`：医保咨询与官方入口
- `followup.md`：通用复诊准备清单
- `src/content/locations/*.md`：候选方向与机构记录

以上指南均位于 `src/content/guides/`。Markdown 顶部 `---` 中使用 JSON 格式的 YAML frontmatter，便于校验；正文使用普通 Markdown。`order` 控制首页排序，`updated` 为内容整理日期。更新日期不代表电话确认。

电话按钮由 `calls` 字段生成，只能填写机构公开电话。官方外链由 `links` 字段生成。可复用组件位于 `src/components/`：CallButton、ExternalLinkCard、Notice、PriorityCard。

注射点状态只允许“候选”“已电话确认”“不接受自带药”。记录字段包括 title、status、address、phone（公开电话）、source（官方网址）、confirmedAt（电话确认日期）、conditions（接收条件）。标记为“已电话确认”前必须真实核实，填写电话、日期、来源和具体条件；不得把售药资格当作注射资格。不要保存通话人员私人电话或患者信息。现有三个条目仅为咨询方向，没有已确认机构。

新增指南：在 guides 目录增加 `.md` 文件并填写同样的字段，路由与首页卡片会自动生成。

## 隐私与来源

仅迁移原《派格宾购买与吉林医保咨询.html》的公开药品名称、厂家联系方式、医保咨询问题和官方入口。未复制原文件或任何医疗附件。新增注射/随访页为通用办事清单，不提供个人剂量、诊断或复查安排。

厂家与吉林医保公开链接、电话在 2026-09-29 核对。内容中保留来源入口和政策发布日期；政策入口不是个人报销资格证明。

**不要提交患者姓名、身份证、病历号、个人电话、基因检测比例、处方照片、检查报告、医疗录音等。** 私有 GitHub 仓库不等于网站私有。`noindex` 和 robots.txt 是爬虫提示，并非访问密码。

`public/_headers` 包含 CSP、no-referrer、X-Frame-Options DENY、X-Robots-Tag、nosniff 和权限限制；HTML 也包含 robots 与 referrer 元标签。CSS 独立输出，适配禁止内联样式/脚本的 CSP。`frame-ancestors` 必须通过响应头生效。Cloudflare Workers Static Assets 会处理 `_headers`；未来添加动态 Worker 响应时需为动态响应单独设置安全头。

## GitHub 提交与推送

目标仓库：https://github.com/philsting/family-med-guide

```sh
git status
git add src public astro.config.mjs wrangler.jsonc package.json package-lock.json tsconfig.json README.md .gitignore .nvmrc .npmrc
git diff --cached
git commit -m "Update public family guide"
git push -u origin main
```

提交前检查暂存差异中没有个人资料。不要强制推送。

如果遇到 `Invalid username or token`：在本机通过 GitHub CLI 的 `gh auth login` 完成浏览器登录（尚未安装 CLI 时先安装），再执行 `gh auth setup-git`。或者用 GitHub Desktop 登录并打开该仓库。不要在聊天、命令文本或仓库中粘贴访问令牌。

本次无法读取远端，项目是在本地初始化的待同步仓库。恢复认证后先 `git fetch origin`，确认远端是否为空；若已有 main 历史，先合并内容并保留远端历史，再推送，不使用 force。首次远端为空时可直接 `git push -u origin main`。

## Cloudflare Workers 自动部署

需先完成 GitHub 推送，再操作控制台：

1. 登录 Cloudflare → **Workers & Pages** → **Create application**。
2. 选择 **Import a repository / Continue with GitHub**（界面文字可能略有差异），连接 GitHub。
3. 授权访问私有仓库 `philsting/family-med-guide`，选择该仓库。
4. Worker 名称填 `family-med-guide`，与 `wrangler.jsonc` 的 `name` 一致；生产分支选 `main`，根目录为仓库根目录。
5. 构建命令填 `npm run build`；部署命令填 `npx wrangler deploy`。不选择 Pages，不填 Pages 输出目录。
6. 构建环境使用 Node 22.12+；如需固定，在构建变量中设置 `NODE_VERSION=22`。提交的 lockfile 用于一致安装依赖。
7. 点击 **Deploy**。成功后打开生成的 `workers.dev` 地址，检查手机页面、电话按钮、官方链接及安全响应头。
8. 后续每次 push 到 `main`，Workers Builds 自动构建和部署；失败时查看该 Worker 的 Builds 日志。

`wrangler.jsonc` 的 `assets.directory` 指向 `./dist`，无需 Worker 入口或 Cloudflare Astro 适配器；自定义 404 已包含。当前未创建 Cloudflare 项目、未部署线上网站。

若以后启用访问控制，另行配置 Cloudflare Access，并检查 workers.dev、预览地址及自定义域名是否都受到保护，避免旁路。当前站点按“只含可公开信息”设计。

## 后续扩展

内容集合可增加标签、坐标及更新时间字段。搜索可生成本地索引，地图可先提供外链，访问控制可放在 Cloudflare 边缘。加入脚本、地图嵌入或后端时，按需要调整 CSP，并重新审查隐私。保持默认静态生成，无需提前引入框架适配器或数据库。

## 官方部署资料

- [Astro on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- [Workers Builds 配置](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [静态资源响应头](https://developers.cloudflare.com/workers/static-assets/headers/)

## 首次验证结果

2026-09-29：`npm run check` 无错误、警告或提示；`npm run build` 生成 7 个静态页面（含 404）。已检查内部链接、公开电话白名单、无内联脚本/样式/表单、robots 和 referrer 元标签；通过 Wrangler 本地服务核实了全部内容页及 404 的安全响应头。浏览器检查了首页和购药页，首页在 320/390px 宽度下无横向溢出。Cloudflare 线上行为仍需部署后复核。

兼容日期固定为本地运行时支持的 `2026-09-26`。TypeScript 固定为 6.x，与当前 `astro check` 兼容。
