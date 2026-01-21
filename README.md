# Sticky Headings

Ever scroll deep into a page and lose track of where you are? **Sticky Headings** keeps your current headings visible by making Roam headings stick to the top of the page while you scroll.

Works with Roam's native headings (H1-H3) and (optionally) Augmented Headings (H4-H6) via block props or legacy tags.

---

## ✨ What it does

When enabled, the first heading block of each level on the page becomes sticky:

- H1 sticks to the very top
- H2 sticks beneath H1
- H3 sticks beneath H2
- Optional: H4-H6 stick beneath H3 when provided by the Augmented Headings extension

The extension also adapts to theme/background changes and re-applies itself when Roam/theming CSS changes.

---

## ✅ How to use

You can toggle Sticky Headings in either of these ways:

1. Command Palette -> `Toggle Sticky Headings`
2. Keyboard shortcut via Roam Settings -> Hotkeys
   (Roam supports user-defined hotkeys for extensions.)

Toggling turns Sticky Headings on/off for your current session.

---

## ⚙️ Settings (Roam Depot)

### Always on mode
Setting: `Always on mode`

- When enabled, Sticky Headings will automatically turn on as you navigate between pages.
- You can still toggle it off manually, but page navigation will re-enable it.

### Apply to h4-h6 (Augmented Headings)
Setting: `Apply to h4-h6 (Augmented Headings)`

- Enables sticky behavior for H4-H6 created by the Augmented Headings extension.
- Supports both the new block property (`ah-level`) and legacy tag-based headings.
- If you customize legacy tag names in Augmented Headings, make sure you are on a recent version so the tags are synced to localStorage.

---

## 🧩 Compatibility

- Works with Roam native headings (H1-H3)
- Compatible with Roam user-defined hotkeys
- Optional support for Augmented Headings (H4-H6 via props or legacy tags)
- Works across themes (including Roam Native dark and many community themes)
- Reacts to theme changes automatically (no manual refresh required in most cases)

---

## 🚀 Performance & safety notes

- No graph writes. This extension operates entirely via DOM/CSS.
- It injects a single `<style id="sticky-css">` tag when enabled.
- It uses CSS caching to avoid rewriting `<head>` when the computed CSS hasn't changed.
- It uses lightweight observers to re-apply only when theme-related changes occur.
- Sticky Headings removes its injected CSS and disconnects observers on unload.

---

## 🛠 Troubleshooting

### "Nothing happens"
- Ensure your page actually contains headings (H1-H3), or H4-H6 if you enabled that option.
- Try toggling Sticky Headings off and on again to force a refresh.

### "My headings look transparent / have the wrong background"
Sticky backgrounds are computed from your effective theme/app background. Some themes do unusual things with transparency.

Try:
1. Toggle Sticky Headings off/on
2. Switch theme modes (light/dark) and back
3. If it persists, please report the theme name and a screenshot

### "H4-H6 don't stick"
- Confirm Augmented Headings is installed.
- Confirm your H4/H5/H6 are set via Augmented Headings (props or legacy tags).
- Ensure the setting Apply to h4-h6 (Augmented Headings) is enabled in Roam Depot.

---

## 📷 Demo

![sticky-headings](https://user-images.githubusercontent.com/6857790/201614328-7db283d0-15f0-41b7-8c6a-3f0e44d48ef7.gif)
