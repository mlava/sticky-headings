var stickyHeadingsState = false;
let myEventHandler = undefined;

export default {
    onload: ({ extensionAPI }) => {
        window.roamAlphaAPI.ui.commandPalette.addCommand({
            label: "Toggle Sticky Headings",
            callback: () => stickyHeadingsToggle()
        });
        stickyHeadingsState = false; //onload

        myEventHandler = function (e) {
            if (e.code === 'KeyS' && e.shiftKey && e.altKey) {
                e.preventDefault();
                stickyHeadingsToggle();
            }
        }
        window.addEventListener('keydown', myEventHandler, false);
    },
    onunload: () => {
        var head = document.getElementsByTagName("head")[0];
        if (document.getElementById("sticky-css")) {
            var cssStyles = document.getElementById("sticky-css");
            head.removeChild(cssStyles);
        }
        window.removeEventListener('keydown', myEventHandler, false);
    }
}

function RGBAToHexA(rgba, forceRemoveAlpha) { // courtesy of Lars Flieger at https://stackoverflow.com/questions/49974145/how-to-convert-rgba-to-hex-color-code-using-javascript
    return "#" + rgba.replace(/^rgba?\(|\s+|\)$/g, '') // Get's rgba / rgb string values
        .split(',') // splits them at ","
        .filter((string, index) => !forceRemoveAlpha || index !== 3)
        .map(string => parseFloat(string)) // Converts them to numbers
        .map((number, index) => index === 3 ? Math.round(number * 255) : number) // Converts alpha to 255 number
        .map(number => number.toString(16)) // Converts numbers to hex
        .map(string => string.length === 1 ? "0" + string : string) // Adds 0 when length of one number is 1
        .join("") // Puts the array to togehter to a string
}

function stickyHeadingsToggle() {
    console.info(stickyHeadingsState);
    if (stickyHeadingsState == false) {
        stickyHeadingsOn();
    } else {
        stickyHeadingsOff();
    }
}

function stickyHeadingsOn() {
    const app = document.querySelector(".roam-body .roam-app");
    const compApp = window.getComputedStyle(app);
    const h1 = document.querySelector(".rm-heading-level-1 > .rm-block-main.rm-block__self:first-child");
    const comph1 = window.getComputedStyle(h1);
    const h2 = document.querySelector(".rm-heading-level-2 > .rm-block-main.rm-block__self:first-child");
    const comph2 = window.getComputedStyle(h2);
    const h3 = document.querySelector(".rm-heading-level-3 > .rm-block-main.rm-block__self:first-child");
    const comph3 = window.getComputedStyle(h3);
    let h2Margin = parseInt(comph1.height) - 1;
    let h3Margin = parseInt(comph1.height) - 1 + parseInt(comph2.height);

    var appBG, h1BG, h2BG, h3BG;

    if (compApp["backgroundColor"] == "rgba(0, 0, 0, 0)") {
        appBG = "white";
    } else {
        appBG = RGBAToHexA(compApp["backgroundColor"], true);
    }
    if (comph1["backgroundColor"] == "rgba(0, 0, 0, 0)" || comph1["backgroundColor"] == "rgb(255, 255, 255)") {
        h1BG = appBG;
    } else {
        h1BG = RGBAToHexA(comph1["backgroundColor"], true);
    }
    if (comph2["backgroundColor"] == "rgba(0, 0, 0, 0)") {
        h2BG = appBG;
    } else {
        h2BG = RGBAToHexA(comph2["backgroundColor"], true);
    }
    if (comph3["backgroundColor"] == "rgba(0, 0, 0, 0)") {
        h3BG = appBG;
    } else {
        h3BG = RGBAToHexA(comph3["backgroundColor"], true);
    }

    // CSS adapted and modified from a post on Slack shared by Fabrice Gallet https://roamresearch.slack.com/archives/C016N2B66JU/p1667846823724739?thread_ts=1667816335.849789&cid=C016N2B66JU
    let h1CSS = ".rm-heading-level-1 > .rm-block-main.rm-block__self:first-child {background-color: " + h1BG + " !important; opacity: 1.0 !important; will-change: transform !important; position: sticky !important; z-index: 18 !important; top: -1px !important;}";
    let h2CSS = ".rm-heading-level-2 > .rm-block-main.rm-block__self:first-child {background-color: " + h2BG + " !important; opacity: 1.0 !important; will-change: transform !important; position: sticky !important; z-index: 17 !important; top: " + h2Margin + "px !important;}";
    let h3CSS = ".rm-heading-level-3 > .rm-block-main.rm-block__self:first-child {background-color: " + h3BG + " !important; opacity: 1.0 !important; will-change: transform !important; position: sticky !important; z-index: 16 !important; top: " + h3Margin + "px !important;}";
    let roamFixCSS = ".rm-article-wrapper {margin-top: -2px !important;}";

    var head = document.getElementsByTagName("head")[0];
    var style = document.createElement("style");
    style.id = "sticky-css";
    style.textContent = h1CSS + h2CSS + h3CSS + roamFixCSS;
    head.appendChild(style);
    stickyHeadingsState = true;
}

function stickyHeadingsOff() {
    var head = document.getElementsByTagName("head")[0];
    if (document.getElementById("sticky-css")) {
        var cssStyles = document.getElementById("sticky-css");
        head.removeChild(cssStyles);
    }
    stickyHeadingsState = false;
}