# Changelog

All notable changes to this fork (`sctale/home-assistant-matter-hub`, product name **Hey Matter**) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
