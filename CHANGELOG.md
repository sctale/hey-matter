# Changelog

All notable changes to this fork (`sctale/home-assistant-matter-hub`) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Inline Drawer Editor**: Bridge configuration can now be edited from the details page via a right-side Drawer, eliminating 4-step navigation to a separate edit page.
- **Manual Refresh Button**: Added a refresh icon button on the bridge details page to immediately reload device states.
- **Auto-Refreshing Bridge List**: The bridges list page now auto-refreshes every 30 seconds to reflect newly created or deleted bridges.
- `useTimer` hook now returns a `refreshNow` function to support manual trigger + timer reset.

### Fixed
- Corrected the polling tooltip on the bridge details page from "every 30 seconds" to "every 10 seconds" to match the actual polling interval.

### Changed
- `BridgeMoreMenu` now accepts an optional `onEdit` callback; when provided, the "Edit" menu item opens the Drawer instead of navigating to the edit route. The edit route is retained for deep-link compatibility.
