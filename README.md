# Home-Assistant-Matter-Hub

!["Home-Assistant-Matter-Hub"](./docs/assets/hamh-logo-small.png)

---

> [!IMPORTANT]  
> ⚠️ **Project Status: End of Maintenance**
>
> As of **January 2026**, this project is no longer actively maintained.
>
> I previously announced a search for a new maintainer, but unfortunately no one has stepped forward
> to take over the project. Due to personal time constraints, I am no longer able to continue development or provide support.
>
> **What this means:**
> - ❌ No further feature development
> - ❌ No bug fixes or updates
> - ❌ No guaranteed support
>
> The repository will remain available for reference and forking.
>
> 💡 I would be very happy to see this project continued by the community.  
> If you plan to fork it and continue development: **may the best fork prevail.**
>
> Thank you to everyone who used, tested, and contributed to this project ❤️

---

> [!IMPORTANT]
> You should definitely consider switching to [RiDDiX/home-assistant-matter-hub](https://github.com/RiDDiX/home-assistant-matter-hub/) !

---

## About

This project simulates bridges to publish your entities from Home Assistant to any Matter-compatible controller like
Alexa, Apple Home or Google Home. Using Matter, those can be connected easily using local communication without the need
of port forwarding etc.

---

## Documentation

Please see the [documentation](https://t0bst4r.github.io/home-assistant-matter-hub) for installation instructions,
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
