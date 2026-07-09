# Hey Matter

!["Hey Matter"](./docs/assets/hamh-logo-small.png)

---

> [!IMPORTANT]
> 🌱 **Active Fork**
>
> This is an active fork of the (now end-of-maintenance) upstream
> [`t0bst4r/home-assistant-matter-hub`](https://github.com/t0bst4r/home-assistant-matter-hub).
>
> The upstream project stopped maintenance in January 2026. This fork
> (`sctale/hey-matter`) continues development under the
> **Hey Matter** name, with frontend UX improvements and ongoing fixes.
>
> The npm package, CLI binary, environment prefix (`HM_`) and default
> storage path (`.hey-matter`) have been renamed to avoid conflicts with
> the upstream project. **Existing users need to migrate their data and
> environment variables when upgrading from the upstream version.**

---

## About

This project simulates bridges to publish your entities from Home Assistant to any Matter-compatible controller like
Alexa, Apple Home or Google Home. Using Matter, those can be connected easily using local communication without the need
of port forwarding etc.

---

## Documentation

Please see the [documentation](https://github.com/sctale/hey-matter#readme) for installation instructions,
known issues, limitations and guides.

---

## Frontend UX Enhancements (Fork Improvements)

This fork enhances the web UI experience with the following improvements:

### 1. Inline Drawer Editor
- Bridge configuration can now be edited **without leaving the details page**.
- Click the **Edit** icon (or the "Edit" menu item) on the bridge details page to open a right-side **Drawer** containing the full configuration editor.
- Reduces the previous 4-step navigation (list → details → more menu → edit page) to **zero page jumps**.

### 2. Manual Refresh Button
- A **Refresh** button is now available on the bridge details page to immediately reload device states, without waiting for the next polling cycle.

### 3. Fixed Polling Tooltip
- The tooltip previously stated "every 30 seconds" while the actual polling interval was 10 seconds. This has been corrected.

### 4. Auto-Refreshing Bridge List
- The bridges list page now **auto-refreshes every 30 seconds**, so newly created or deleted bridges appear without a manual browser refresh.

### 5. Entity Autocomplete for Filter Configuration
- When configuring bridge filters, the **value field is now an Autocomplete** instead of a plain text input.
- Search and select entities by their **friendly name** (e.g. "客厅灯") instead of typing raw entity IDs (e.g. `light.living_room`).
- Candidate options adapt to the matcher type: `domain`/`platform`/`label`/`area`/`entity_category` show deduplicated candidate values; `pattern` shows the full entity list with friendly names.
- The `pattern` type supports free-text input, so wildcard patterns like `light.*` can still be entered manually.

### 6. Bridge Card Status Color Bar & Icon Metrics
- Each bridge card now displays a **left status color bar** (blue=starting, green=running, orange=stopped, red=failed) for at-a-glance status recognition.
- Secondary metrics (Fabrics / Devices / Port) are now **iconified** and the card elevates on hover for better visual feedback.

### 7. Filter Chip Friendly Names & Layered Details
- On the bridge details page, filter chips now show the **entity friendly name** (instead of the raw entity ID) when the matcher is a `pattern` matching a full entity ID.
- The details panel is now **layered with dividers** (basic info / commissioning vs. filters) using an outlined card style for clearer information hierarchy.

---
