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
> (`sctale/home-assistant-matter-hub`) continues development under the
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

Please see the [documentation](https://github.com/sctale/home-assistant-matter-hub#readme) for installation instructions,
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

---
