# Hey Matter

!["Hey Matter"](./docs/assets/hamh-logo-small.png)

---

> [!IMPORTANT]
> 🌱 **活跃 Fork**
>
> 这是上游项目 [`t0bst4r/home-assistant-matter-hub`](https://github.com/t0bst4r/home-assistant-matter-hub)（已停止维护）的活跃 Fork。
>
> 上游项目于 2026 年 1 月停止维护。本 Fork（`sctale/hey-matter`）以 **Hey Matter** 的名义继续开发，持续进行前端 UX 优化与问题修复。
>
> 为避免与上游项目冲突，npm 包名、CLI 二进制、环境变量前缀（`HM_`）和默认存储路径（`.hey-matter`）均已改名。**从上游版本升级的用户需迁移数据和环境变量。**

---

## 关于

本项目模拟 Bridge，将 Home Assistant 中的实体发布到任意 Matter 兼容控制器（如 Alexa、Apple Home、Google Home）。借助 Matter 协议，设备可通过局域网通信轻松连接，无需端口转发等额外配置。

---

## 文档

请查阅 [文档](https://github.com/sctale/hey-matter#readme) 获取安装说明、已知问题、限制和 使用指南。

---

## Home Assistant Addon 安装

1. 在 HA 的「设置 → 加载项 → 加载项商店」右上角点击「⋮」→「仓库」，添加：`https://github.com/sctale/hey-matter`
2. 刷新加载项商店，找到「Hey Matter」点击安装
   > 如果 `hey-matter/config.yaml` 中配置了 `image` 字段，Home Assistant Supervisor 会直接拉取对应架构的预构建镜像，无需在设备本地构建。
3. 安装后点击「启动」，即可在左侧边栏看到 Hey Matter 面板
4. 如需配置，进入加载项的「配置」标签页调整日志级别等选项

---

## 前端 UX 优化（Fork 改进）

本 Fork 对 Web UI 体验进行了以下优化：

### 1. 内嵌 Drawer 编辑器
- Bridge 配置现在可以**不离开详情页**直接编辑。
- 在 Bridge 详情页点击**编辑**图标（或「编辑」菜单项），会从右侧滑出 **Drawer** 抽屉，内含完整的配置编辑器。
- 将原先的 4 步跳转（列表 → 详情 → 更多菜单 → 编辑页）减少为**零跳转**。

### 2. 手动刷新按钮
- Bridge 详情页新增**刷新**按钮，可立即重载设备状态，无需等待下一次轮询。

### 3. 修复轮询提示
- 此前端详情页的 Tooltip 误显示「每 30 秒」，而实际轮询间隔为 10 秒，现已修正。

### 4. Bridge 列表自动刷新
- Bridge 列表页现在**每 30 秒自动刷新**，新建或删除的 Bridge 无需手动刷新浏览器即可显示。

### 5. 过滤器配置的实体自动补全
- 配置 Bridge 过滤器时，**value 字段由纯文本输入改为 Autocomplete 自动补全**。
- 可通过实体的**友好名称**（如「客厅灯」）搜索选中，无需手动输入实体 ID（如 `light.living_room`）。
- 候选选项根据 matcher 类型自适应：`domain`/`platform`/`label`/`area`/`entity_category` 显示去重后的候选值；`pattern` 显示全量实体列表（含友好名称）。
- `pattern` 类型支持自由文本输入，仍可手动输入通配 pattern（如 `light.*`）。

### 6. Bridge 卡片状态色边与图标化指标
- 每个 Bridge 卡片左侧新增**状态色竖边**（蓝色=启动中、绿色=运行中、橙色=已停止、红色=失败），便于一眼识别状态。
- 副信息（Fabrics / 设备 / 端口）改为**图标化**展示，卡片在 hover 时阴影提升，视觉反馈更佳。

### 7. 过滤器 Chip 友好名称与信息分层
- Bridge 详情页的过滤器 Chip 在 `pattern` 类型且为完整实体 ID 时，会显示**实体友好名称**而非裸 ID。
- 详情面板使用 Divider **分层展示**（基本信息与配对 / 过滤器），外层采用 outlined 卡片样式，信息层次更清晰。

### 8. 返回按钮与全面中文化（v0.3.1）
- Bridge 详情页、新建页、编辑页顶部均新增**返回按钮**，可快速回到上一页。
- 前端 UI 文案**全面中文化**，涵盖所有页面、组件和底部栏。
- Addon 配置描述中文化，并补充配置项含义说明。
- 术语策略：Bridge / Fabric 保留英文（Matter 协议核心术语）；Endpoint → 端点；Commissioning → 配对；Factory Reset → 恢复出厂设置。

---
