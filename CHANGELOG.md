# Changelog

All notable changes to this fork (`sctale/hey-matter`, product name **Hey Matter**) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.3] - 2026-07-10

### Fixed
- **表单字段标签中文化**：修复新建/编辑 Bridge 页面表单字段标签为英文的问题。根因是 JSON Schema（bridge-config-schema.ts）中的 title/description 字段为英文，RJSF 表单渲染时直接使用这些值作为字段标签。现已全部中文化（名称、端口、国家代码、包含、排除、类型、值、功能开关等）。
- **RJSF 按钮文本中文化**：通过自定义 translateString 将 RJSF 表单的数组操作按钮（添加、删除、上移、下移、复制、清除）的 title 提示中文化。

## [0.3.2] - 2026-07-10

### Fixed
- **重新构建前端产物**：v0.3.1 的 package.tgz 可能未包含最新中文化代码，v0.3.2 清理旧 dist 后重新构建并验证产物包含中文文案和返回按钮代码。
- **BridgeConfigEditor 标签提示优化**：移除冗余的英文括注 `（labels）`，简化为「特别是使用标签时」。

## [0.3.1] - 2026-07-09

### Added
- **返回按钮**：Bridge 详情页、新建页、编辑页顶部均新增返回按钮，可快速回到上一页。
- **Addon 图标**：HA Add-on 商店页面新增 icon.png 和 logo.png，显示项目图标。

### Changed
- **前端 UI 全面中文化**：pages（BridgeDetailsPage/CreateBridgePage/EditBridgePage/BridgesPage/BridgeMoreMenu）、components（BridgeConfigEditor/BridgeCard/BridgeDetails/EndpointList/EndpointState/EndpointIcon/FabricIcon/JsonEditor）、theme（AppFooter）共 15 个文件的 UI 文案改为中文。
  - 术语策略：Bridge / Fabric 保留英文（Matter 协议核心术语）；Endpoint → 端点；Commissioning → 配对；Factory Reset → 恢复出厂设置。
- **Addon 配置中文化**：config.yaml 的 description 改为中文，并补充配置项含义说明（app_log_level/disable_log_colors/mdns_network_interface）。
- **认证修复**：config.yaml 新增 `homeassistant_api: true`，Supervisor 才会注入有效的 SUPERVISOR_TOKEN。
- **HA Addon 仓库结构修复**：根目录新增 repository.yaml，addon 文件移至 hey-matter/ 子目录，符合 HA 官方 addon 仓库规范。

## [0.3.0] - 2026-07-09

### Added
- **实体自动补全**：bridge filter 配置的 value 字段由纯文本输入改为 Autocomplete 自动补全。可搜索实体的友好名称（friendly_name）选中实体，无需手动输入 entity ID。
  - 根据 matcher type 动态提供候选：`domain`/`platform`/`label`/`area`/`entity_category` 提供去重后的候选值列表；`pattern` 类型提供全量实体（显示友好名称，选中填入 entity ID）。
  - `pattern` 类型支持 `freeSolo`，可手动输入通配 pattern（如 `light.*`），保留通配能力。
  - 新增后端 `GET /api/matter/entities` 端点暴露 HA 全量实体列表（含 friendly_name）。
- **filter Chip 友好名称显示**：bridge 详情页的过滤器 Chip 在 `pattern` 类型且为完整 entity ID 时，反查并显示实体的友好名称，而非裸 ID。

### Changed
- **BridgeCard 卡片优化**：左侧增加状态色竖边（starting=蓝/running=绿/stopped=橙/failed=红），副信息（Fabrics/Devices/Port）改为图标化展示，hover 时阴影提升。
- **BridgeDetails 信息分层**：详情页内容用 Divider 分隔为「基本信息与配对」「过滤器」两块，外层 Paper 改为 outlined 样式，层次更清晰。
- **GitHub 仓库改名**：`sctale/home-assistant-matter-hub` → `sctale/hey-matter`，所有代码与文档中的仓库/bugs/issues URL 同步更新。

## [0.2.0] - 2026-07-09

### Changed - BREAKING (Rename)
- **Project renamed to "Hey Matter"** to avoid conflicts with the upstream `t0bst4r/home-assistant-matter-hub`.
- npm package name: `home-assistant-matter-hub` → `hey-matter`
- CLI binary: `home-assistant-matter-hub` → `hey-matter`
- Workspace scope: `@home-assistant-matter-hub/*` → `@hey-matter/*`
- Environment variable prefix: `HAMH_` → `HM_`
- Default storage path: `~/.home-assistant-matter-hub` → `~/.hey-matter`
- Matter vendor name: `t0bst4r` → `sctale`; product name `MatterHub` → `HeyMatter`
- App directory: `apps/home-assistant-matter-hub` → `apps/hey-matter`
- Repository/bugs URLs repointed to `sctale/home-assistant-matter-hub` (GitHub repo name unchanged)
- Documentation URLs repointed to the repository README (no standalone docs site)
- **Migration required**: existing users must rename env vars (`HAMH_*` → `HM_*`) and move data directory (`~/.home-assistant-matter-hub` → `~/.hey-matter`). Already-paired Matter devices may need re-pairing due to vendor/product name change.

### Added (UX)
- **Inline Drawer Editor**: Bridge configuration can now be edited from the details page via a right-side Drawer, eliminating 4-step navigation to a separate edit page.
- **Manual Refresh Button**: Added a refresh icon button on the bridge details page to immediately reload device states.
- **Auto-Refreshing Bridge List**: The bridges list page now auto-refreshes every 30 seconds to reflect newly created or deleted bridges.
- `useTimer` hook now returns a `refreshNow` function to support manual trigger + timer reset.

### Fixed
- Corrected the polling tooltip on the bridge details page from "every 30 seconds" to "every 10 seconds" to match the actual polling interval.

### Changed (UX)
- `BridgeMoreMenu` now accepts an optional `onEdit` callback; when provided, the "Edit" menu item opens the Drawer instead of navigating to the edit route. The edit route is retained for deep-link compatibility.

## [0.1.0] - 2026-07-09

### Added
- Initial fork UX improvements: inline Drawer editor, manual refresh, auto-refreshing bridge list, fixed polling tooltip.
