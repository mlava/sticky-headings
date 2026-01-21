let stickyHeadingsState = false;
let alwaysOn = false;
let applyH456 = false;
let lastCssString = "";
let hashChange = undefined;
let themeObserver = null;
let appObserver = null;

const AUGMENTED_HEADING_PROP = "ah-level";
const MAX_QUERY_BATCH_SIZE = 25;

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
          name: "Apply to h4–h6 (Augmented Headings extension)",
          description:
            "Also stick blocks marked as h4–h6 via Augmented Headings props or legacy tags.",
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

async function stickyHeadingsOn() {
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

  // Optional h4–h6 via Augmented Headings props/tags
  const h4Tag = applyH456 ? localStorage.getItem("augmented_headings:h4") : null;
  const h5Tag = applyH456 ? localStorage.getItem("augmented_headings:h5") : null;
  const h6Tag = applyH456 ? localStorage.getItem("augmented_headings:h6") : null;
  const uidToLevel = applyH456 ? await getAugmentedHeadingLevels() : new Map();
  const hasTagged = !!(h4Tag || h5Tag || h6Tag || uidToLevel.size);

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
    h2Margin = Math.max(0, h1Height - 2); // fix for peek through on scroll
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

  if (applyH456) {
    const h4 = getFirstAugmentedHeadingEl("h4", uidToLevel) || selectAugHeadBlock(h4Tag);
    if (h4 && isLikelyHeadingBlock(h4)) {
      const comph4 = window.getComputedStyle(h4);
      const h4BG = resolveStickyBg(h4, appBG);
      const h4Height = pxToNumber(comph4.height);
      cssString += buildAugmentedHeadingCss("h4", uidToLevel, h4Margin, 15, h4BG);
      if (h4Tag) {
        cssString +=
          `[data-page-links^='["${cssEscape(h4Tag)}"]'] > .rm-block-main.rm-block__self:first-child {` +
          `background-color: ${h4BG} !important;` +
          `background-clip: padding-box !important;` +
          `position: sticky !important;` +
          `z-index: 15 !important;` +
          `top: ${h4Margin}px !important;` +
          `opacity: 1 !important;` +
          `}`;
      }
      h5Margin = h4Margin + h4Height;
    }
  }

  if (applyH456) {
    const h5 = getFirstAugmentedHeadingEl("h5", uidToLevel) || selectAugHeadBlock(h5Tag);
    if (h5 && isLikelyHeadingBlock(h5)) {
      const comph5 = window.getComputedStyle(h5);
      const h5BG = resolveStickyBg(h5, appBG);
      const h5Height = pxToNumber(comph5.height);
      cssString += buildAugmentedHeadingCss("h5", uidToLevel, h5Margin, 14, h5BG);
      if (h5Tag) {
        cssString +=
          `[data-page-links^='["${cssEscape(h5Tag)}"]'] > .rm-block-main.rm-block__self:first-child {` +
          `background-color: ${h5BG} !important;` +
          `background-clip: padding-box !important;` +
          `position: sticky !important;` +
          `z-index: 14 !important;` +
          `top: ${h5Margin}px !important;` +
          `opacity: 1 !important;` +
          `}`;
      }
      h6Margin = h5Margin + h5Height;
    }
  }

  if (applyH456) {
    const h6 = getFirstAugmentedHeadingEl("h6", uidToLevel) || selectAugHeadBlock(h6Tag);
    if (h6 && isLikelyHeadingBlock(h6)) {
      const h6BG = resolveStickyBg(h6, appBG);
      cssString += buildAugmentedHeadingCss("h6", uidToLevel, h6Margin, 13, h6BG);
      if (h6Tag) {
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

async function getAugmentedHeadingLevels() {
  if (!window.roamAlphaAPI?.q) return new Map();

  const uids = Array.from(
    new Set(
      Array.from(document.querySelectorAll("[data-block-uid]"))
        .map((el) => el.getAttribute("data-block-uid"))
        .filter(Boolean)
    )
  );

  if (!uids.length) return new Map();

  const uidToLevel = new Map();
  const chunks = [];
  for (let i = 0; i < uids.length; i += MAX_QUERY_BATCH_SIZE) {
    chunks.push(uids.slice(i, i + MAX_QUERY_BATCH_SIZE));
  }

  for (const chunk of chunks) {
    const uidList = chunk.map((u) => `"${u}"`).join(" ");
    const q = `[:find (pull ?b [:block/uid :block/props])
               :where [?b :block/uid ?uid]
                      [(contains? #{${uidList}} ?uid)]]`;

    let res = [];
    try {
      res = await window.roamAlphaAPI.q(q);
    } catch (err) {
      res = [];
    }

    if (!res.length) {
      for (const uid of chunk) {
        try {
          const pulled = await window.roamAlphaAPI.pull(
            "[:block/uid :block/props]",
            [":block/uid", uid]
          );
          res.push([{ uid: pulled?.[":block/uid"], props: pulled?.[":block/props"] }]);
        } catch (err) {
          // ignore
        }
      }
    }

    for (const row of res) {
      const b = row?.[0];
      const uid = b?.uid ?? b?.[":block/uid"];
      if (!uid) continue;
      const props = propsToObject(b?.[":block/props"] ?? b?.props);
      const level = String(getPropValue(props, AUGMENTED_HEADING_PROP) ?? "")
        .trim()
        .toLowerCase();
      if (level === "h4" || level === "h5" || level === "h6") {
        uidToLevel.set(uid, level);
      }
    }
  }

  return uidToLevel;
}

function getFirstAugmentedHeadingEl(level, uidToLevel) {
  if (!uidToLevel || uidToLevel.size === 0) return null;
  const containers = document.querySelectorAll("[data-block-uid]");
  for (const container of containers) {
    const uid = container.getAttribute("data-block-uid");
    if (!uid) continue;
    if (uidToLevel.get(uid) === level) {
      return container.querySelector(
        ".rm-block-main.rm-block__self:first-child"
      );
    }
  }
  return null;
}

function buildAugmentedHeadingCss(level, uidToLevel, top, zIndex, bg) {
  if (!uidToLevel || uidToLevel.size === 0) return "";
  const rules = [];
  for (const [uid, lvl] of uidToLevel.entries()) {
    if (lvl !== level) continue;
    const escUid = cssEscape(uid);
    rules.push(
      `[data-block-uid="${escUid}"] > .rm-block-main.rm-block__self:first-child {` +
        `background-color: ${bg} !important;` +
        `background-clip: padding-box !important;` +
        `position: sticky !important;` +
        `z-index: ${zIndex} !important;` +
        `top: ${top}px !important;` +
        `opacity: 1 !important;` +
        `}`
    );
  }
  return rules.join("");
}

function normalizePropKey(key) {
  return String(key ?? "").replace(/^:+/, "");
}

function propsToObject(props) {
  if (!props) return {};
  if (typeof props.toJS === "function") return props.toJS();
  if (typeof props.entries === "function") {
    try {
      return Object.fromEntries(props.entries());
    } catch {
      // fall through
    }
  }
  return typeof props === "object" ? props : {};
}

function getPropValue(props, key) {
  const obj = propsToObject(props);
  const base = normalizePropKey(key);
  for (const k of Object.keys(obj)) {
    if (normalizePropKey(k) === base) return obj[k];
  }
  return null;
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
