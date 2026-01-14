let stickyHeadingsState = false;
let alwaysOn = false;
let applyH456 = false;
let lastCssString = "";
let hashChange = undefined;
let themeObserver = null;
let appObserver = null;

export default {
  onload: ({ extensionAPI }) => {
    const config = {
      tabTitle: "Sticky Headings",
      settings: [
        {
          id: "sh-alwaysOn",
          name: "Always on mode",
          description: "Keep Sticky Headings always enabled",
          action: { type: "switch", onChange: (evt) => setAlwaysOn(evt) },
        },
        {
          id: "sh-applyH456",
          name: "Apply to h4–h6 (tagged)",
          description:
            "Also stick blocks tagged as h4–h6 via Augmented Headings tags.",
          action: {
            type: "switch",
            onChange: (value) => {
              applyH456 = value?.target?.checked === true;
              if (stickyHeadingsState) {
                stickyHeadingsOff();
                stickyHeadingsOn();
              }
            },
          },
        },
      ],
    };
    extensionAPI.settings.panel.create(config);

    applyH456 = extensionAPI.settings.get("sh-applyH456") === true;
    if (extensionAPI.settings.get("sh-alwaysOn") === true) {
      alwaysOn = true;
      stickyHeadingsOn();
    }

    async function setAlwaysOn(evt) {
      if (evt?.target?.checked) {
        alwaysOn = true;
        stickyHeadingsOn();
      } else {
        alwaysOn = false;
        stickyHeadingsOff();
      }
    }

    // Re-evaluate when the page hash changes (navigation)
    hashChange = async () => {
      applyH456 = extensionAPI.settings.get("sh-applyH456") === true;
      if (extensionAPI.settings.get("sh-alwaysOn") === true) {
        alwaysOn = true;
        stickyHeadingsOn();
      } else {
        alwaysOn = false;
        stickyHeadingsOff();
      }
    };
    window.addEventListener("hashchange", hashChange);

    extensionAPI.ui.commandPalette.addCommand({
      label: "Toggle Sticky Headings",
      callback: () => stickyHeadingsToggle(),
    });

    setupThemeObservers();
  },

  onunload: () => {
    // Remove injected CSS
    const head = document.getElementsByTagName("head")[0];
    const css = document.getElementById("sticky-css");
    if (css) head.removeChild(css);

    // Tear down listeners/observers
    window.removeEventListener("hashchange", hashChange);
    if (themeObserver) {
      themeObserver.disconnect();
      themeObserver = null;
    }
    if (appObserver) {
      appObserver.disconnect();
      appObserver = null;
    }
  },
};

function stickyHeadingsToggle() {
  if (stickyHeadingsState === false) {
    stickyHeadingsOn();
  } else {
    stickyHeadingsOff();
  }
}

function stickyHeadingsOn() {
  // First visible h1–h3
  const h1 = document.querySelector(
    ".rm-heading-level-1 > .rm-block-main.rm-block__self:first-child"
  );
  const h2 = document.querySelector(
    ".rm-heading-level-2 > .rm-block-main.rm-block__self:first-child"
  );
  const h3 = document.querySelector(
    ".rm-heading-level-3 > .rm-block-main.rm-block__self:first-child"
  );

  // Optional h4–h6 via Augmented Headings tags
  const h4Tag = applyH456 ? localStorage.getItem("augmented_headings:h4") : null;
  const h5Tag = applyH456 ? localStorage.getItem("augmented_headings:h5") : null;
  const h6Tag = applyH456 ? localStorage.getItem("augmented_headings:h6") : null;
  const hasTagged = !!(h4Tag || h5Tag || h6Tag);

  if (!h1 && !h2 && !h3 && !hasTagged) {
    const cssString = `.rm-article-wrapper {margin-top: -2px !important;}`;
    applyStickyCss(cssString);
    stickyHeadingsState = true;
    return;
  }

  const app = document.querySelector(".roam-body .roam-app");
  const appBG = getEffectiveBgColor(app || document.body);

  let cssString = "";
  let h2Margin = 0;
  let h3Margin = 0;
  let h4Margin = 0;
  let h5Margin = 0;
  let h6Margin = 0;

  if (h1) {
    const comph1 = window.getComputedStyle(h1);
    const h1BG = resolveStickyBg(h1, appBG);
    const h1Height = pxToNumber(comph1.height);
    h2Margin = Math.max(0, h1Height - 1);
    h3Margin = h2Margin;
    h4Margin = h2Margin;
    h5Margin = h2Margin;
    h6Margin = h2Margin;

    cssString +=
      `.rm-heading-level-1 > .rm-block-main.rm-block__self:first-child {` +
      `background-color: ${h1BG} !important;` +
      `background-clip: padding-box !important;` +
      `position: sticky !important;` +
      `z-index: 18 !important;` +
      `top: -1px !important;` +
      `opacity: 1 !important;` +
      `}`;
  } else {
    h2Margin -= 1;
    h3Margin -= 1;
    h4Margin -= 1;
    h5Margin -= 1;
    h6Margin -= 1;
  }

  if (h2) {
    const comph2 = window.getComputedStyle(h2);
    const h2BG = resolveStickyBg(h2, appBG);
    const h2Height = pxToNumber(comph2.height);
    cssString +=
      `.rm-heading-level-2 > .rm-block-main.rm-block__self:first-child {` +
      `background-color: ${h2BG} !important;` +
      `background-clip: padding-box !important;` +
      `position: sticky !important;` +
      `z-index: 17 !important;` +
      `top: ${h2Margin}px !important;` +
      `opacity: 1 !important;` +
      `}`;
    h3Margin = h2Margin + h2Height;
  }

  if (h3) {
    const comph3 = window.getComputedStyle(h3);
    const h3BG = resolveStickyBg(h3, appBG);
    const h3Height = pxToNumber(comph3.height);
    cssString +=
      `.rm-heading-level-3 > .rm-block-main.rm-block__self:first-child {` +
      `background-color: ${h3BG} !important;` +
      `background-clip: padding-box !important;` +
      `position: sticky !important;` +
      `z-index: 16 !important;` +
      `top: ${h3Margin}px !important;` +
      `opacity: 1 !important;` +
      `}`;
    h4Margin = h3Margin + h3Height;
  }

  if (h4Tag) {
    const h4 = selectAugHeadBlock(h4Tag);
    if (h4 && isLikelyHeadingBlock(h4)) {
      const comph4 = window.getComputedStyle(h4);
      const h4BG = resolveStickyBg(h4, appBG);
      const h4Height = pxToNumber(comph4.height);
      cssString +=
        `[data-page-links^='["${cssEscape(h4Tag)}"]'] > .rm-block-main.rm-block__self:first-child {` +
        `background-color: ${h4BG} !important;` +
        `background-clip: padding-box !important;` +
        `position: sticky !important;` +
        `z-index: 15 !important;` +
        `top: ${h4Margin}px !important;` +
        `opacity: 1 !important;` +
        `}`;
      h5Margin = h4Margin + h4Height;
    }
  }

  if (h5Tag) {
    const h5 = selectAugHeadBlock(h5Tag);
    if (h5 && isLikelyHeadingBlock(h5)) {
      const comph5 = window.getComputedStyle(h5);
      const h5BG = resolveStickyBg(h5, appBG);
      const h5Height = pxToNumber(comph5.height);
      cssString +=
        `[data-page-links^='["${cssEscape(h5Tag)}"]'] > .rm-block-main.rm-block__self:first-child {` +
        `background-color: ${h5BG} !important;` +
        `background-clip: padding-box !important;` +
        `position: sticky !important;` +
        `z-index: 14 !important;` +
        `top: ${h5Margin}px !important;` +
        `opacity: 1 !important;` +
        `}`;
      h6Margin = h5Margin + h5Height;
    }
  }

  if (h6Tag) {
    const h6 = selectAugHeadBlock(h6Tag);
    if (h6 && isLikelyHeadingBlock(h6)) {
      const h6BG = resolveStickyBg(h6, appBG);
      cssString +=
        `[data-page-links^='["${cssEscape(h6Tag)}"]'] > .rm-block-main.rm-block__self:first-child {` +
        `background-color: ${h6BG} !important;` +
        `background-clip: padding-box !important;` +
        `position: sticky !important;` +
        `z-index: 13 !important;` +
        `top: ${h6Margin}px !important;` +
        `opacity: 1 !important;` +
        `}`;
    }
  }

  cssString += `.rm-article-wrapper {margin-top: -2px !important;}`;

  applyStickyCss(cssString);

  stickyHeadingsState = true;
}

function stickyHeadingsOff() {
  const head = document.getElementsByTagName("head")[0];
  const css = document.getElementById("sticky-css");
  if (css) head.removeChild(css);
  lastCssString = "";
  stickyHeadingsState = false;
}

/* =========================
   Theme Reactivity
   ========================= */

function setupThemeObservers() {
  const debouncedReapply = debounce(() => {
    if (alwaysOn || stickyHeadingsState) {
      stickyHeadingsOn();
    }
  }, 50);

  const isStickyStyleNode = (node) =>
    node &&
    node.nodeType === 1 &&
    node.tagName === "STYLE" &&
    node.id === "sticky-css";

  // Observe html/body attribute flips (class/style/data-theme)
  themeObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (
        m.type === "attributes" &&
        (m.attributeName === "class" ||
          m.attributeName === "style" ||
          m.attributeName === "data-theme")
      ) {
        debouncedReapply();
        return;
      }
      if (m.type === "childList") {
        const added = Array.from(m.addedNodes || []);
        const removed = Array.from(m.removedNodes || []);
        const addedOnlySticky = added.length > 0 && added.every(isStickyStyleNode);
        const removedOnlySticky =
          removed.length > 0 && removed.every(isStickyStyleNode);
        if (
          (addedOnlySticky && removed.length === 0) ||
          (removedOnlySticky && added.length === 0) ||
          (addedOnlySticky && removedOnlySticky)
        ) {
          continue;
        }
        if (
          added.some(
            (n) =>
              n.nodeType === 1 &&
              ((n.tagName === "STYLE") ||
                (n.tagName === "LINK" &&
                  (n).rel &&
                  (n).rel.toLowerCase() === "stylesheet"))
          ) ||
          removed.some(
            (n) =>
              n.nodeType === 1 &&
              ((n.tagName === "STYLE") ||
                (n.tagName === "LINK" &&
                  (n).rel &&
                  (n).rel.toLowerCase() === "stylesheet"))
          )
        ) {
          debouncedReapply();
          return;
        }
      }
    }
  });
  
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "style", "data-theme"],
    subtree: false,
  });
  themeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class", "style", "data-theme"],
    subtree: false,
  });
  const head = document.head || document.getElementsByTagName("head")[0];
  if (head) {
    themeObserver.observe(head, { childList: true, subtree: true });
  }
  
  const app = document.querySelector(".roam-body .roam-app");
  if (app) {
    appObserver = new MutationObserver(() => debouncedReapply());
    appObserver.observe(app, {
      attributes: true,
      attributeFilter: ["class", "style"],
      subtree: false,
    });
  }
}

/* ========================
   Helpers
   ======================== */

function pxToNumber(px) {
  const n = parseFloat(px);
  return Number.isFinite(n) ? n : 0;
}

function getEffectiveBgColor(el) {
  let cur = el;
  while (cur && cur !== document.documentElement) {
    const bg = getComputedStyle(cur).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
    cur = cur.parentElement || cur.parentNode;
  }
  const root = getComputedStyle(document.documentElement).backgroundColor;
  if (root && root !== "rgba(0, 0, 0, 0)" && root !== "transparent") return root;

  const bodyBG = getComputedStyle(document.body).backgroundColor;
  return bodyBG || "transparent";
}

function resolveStickyBg(el, appBG) {
  const own = getComputedStyle(el).backgroundColor;
  if (own && own !== "rgba(0, 0, 0, 0)" && own !== "transparent") return own;

  const eff = getEffectiveBgColor(el);
  if (eff && eff !== "rgba(0, 0, 0, 0)" && eff !== "transparent") return eff;

  return appBG || "inherit";
}

function selectAugHeadBlock(tag) {
  if (!tag) return null;
  const escaped = cssEscape(tag);
  return document.querySelector(
    `[data-page-links^='["${escaped}"]'] > .rm-block-main.rm-block__self:first-child`
  );
}

function isLikelyHeadingBlock(el) {
  if (!el) return false;
  if (
    el.closest(".rm-heading-level-1, .rm-heading-level-2, .rm-heading-level-3")
  ) {
    return true;
  }
  const h = pxToNumber(getComputedStyle(el).height);
  return h > 0 && h < 120;
}

function cssEscape(str) {
  return String(str).replace(/["\\]/g, "\\$&");
}

function applyStickyCss(cssString) {
  if (cssString === lastCssString) return;
  const head = document.getElementsByTagName("head")[0];
  const existing = document.getElementById("sticky-css");
  const style = existing || document.createElement("style");
  style.id = "sticky-css";
  style.textContent = cssString;
  if (!existing) head.appendChild(style);
  lastCssString = cssString;
}

function debounce(fn, wait) {
  let t = null;
  return function (...args) {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}
