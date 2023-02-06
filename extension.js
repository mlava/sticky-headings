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
        window.roamAlphaAPI.ui.commandPalette.removeCommand({
            label: 'Toggle Sticky Headings'
        });
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
    if (stickyHeadingsState == false) {
        stickyHeadingsOn();
    } else {
        stickyHeadingsOff();
    }
}

function stickyHeadingsOn() {
    var comph1, comph2, comph3, appBG, h1BG, h2BG, h3BG, h1CSS, h2CSS, h3CSS, h4BG, h5BG, h6BG;
    var h2Margin = 0;
    var h3Margin = 0;
    var h4Margin = 0;
    var h5Margin = 0;
    var h6Margin = 0;
    var cssString = "";

    const body = document.body;
    const app = document.querySelector(".roam-body .roam-app");
    const compApp = window.getComputedStyle(app);
    if (body.classList[0] == "bp3-dark") { // this is Roam "Native" Dark dark mode
        appBG = "#30404d";
    } else {
        if (compApp["backgroundColor"] == "rgba(0, 0, 0, 0)") {
            appBG = "white";
        } else {
            appBG = RGBAToHexA(compApp["backgroundColor"], true);
        }
    }
    const appWidth = compApp["width"];
    const h1 = document.querySelector(".rm-heading-level-1 > .rm-block-main.rm-block__self:first-child");
    const h2 = document.querySelector(".rm-heading-level-2 > .rm-block-main.rm-block__self:first-child");
    const h3 = document.querySelector(".rm-heading-level-3 > .rm-block-main.rm-block__self:first-child");
    if (h1 != null) {
        comph1 = window.getComputedStyle(h1);
        if (body.classList[0] == "bp3-dark") { // this is Roam "Native" Dark dark mode
            h1BG = "#30404d";
        } else if (comph1["backgroundColor"] == "rgba(0, 0, 0, 0)" || comph1["backgroundColor"] == "rgb(255, 255, 255)") {
            h1BG = appBG;
        } else {
            h1BG = RGBAToHexA(comph1["backgroundColor"], true);
        }
        h2Margin = parseInt(comph1.height) - 1;
        h3Margin = parseInt(comph1.height) - 1;
        h4Margin = parseInt(comph1.height) - 1;
        h5Margin = parseInt(comph1.height) - 1;
        h6Margin = parseInt(comph1.height) - 1;
        h1CSS = ".rm-heading-level-1 > .rm-block-main.rm-block__self:first-child {background-color: " + h1BG + " !important; opacity: 1.0 !important; will-change: transform !important; position: sticky !important; z-index: 18 !important; top: -1px !important;} ";
        cssString += h1CSS;
    } else {
        h2Margin = h2Margin - 1;
        h3Margin = h3Margin - 1;
        h4Margin = h4Margin - 1;
        h5Margin = h5Margin - 1;
        h6Margin = h6Margin - 1;
    }
    if (h2 != null) {
        comph2 = window.getComputedStyle(h2);
        if (body.classList[0] == "bp3-dark") { // this is Roam "Native" Dark dark mode
            h2BG = "#30404d";
        } else if (comph2["backgroundColor"] == "rgba(0, 0, 0, 0)") {
            h2BG = appBG;
        } else {
            h2BG = RGBAToHexA(comph2["backgroundColor"], true);
        }
        h2CSS = ".rm-heading-level-2 > .rm-block-main.rm-block__self:first-child {background-color: " + h2BG + " !important; opacity: 1.0 !important; will-change: transform !important; position: sticky !important; z-index: 17 !important; top: " + h2Margin + "px !important;} ";
        cssString += h2CSS;
        h3Margin = h2Margin + parseInt(comph2.height);
    }
    if (h3 != null) {
        comph3 = window.getComputedStyle(h3);
        if (body.classList[0] == "bp3-dark") { // this is Roam "Native" Dark dark mode
            h3BG = "#30404d";
        } else if (comph3["backgroundColor"] == "rgba(0, 0, 0, 0)") {
            h3BG = appBG;
        } else {
            h3BG = RGBAToHexA(comph3["backgroundColor"], true);
        }
        h3CSS = ".rm-heading-level-3 > .rm-block-main.rm-block__self:first-child {background-color: " + h3BG + " !important; opacity: 1.0 !important; will-change: transform !important; position: sticky !important; z-index: 16 !important; top: " + h3Margin + "px !important;} ";
        cssString += h3CSS;
        h4Margin = h3Margin + parseInt(comph3.height);
    }
    if (localStorage.getItem("augmented_headings:h4")) {
        var h4Tag = localStorage.getItem("augmented_headings:h4");
        if (document.querySelector("[data-tag^='" + h4Tag + "'] + .rm-highlight")) {
            const h4 = document.querySelector("[data-page-links^='[\"" + h4Tag + "\"]'] > .rm-block-main.rm-block__self:first-child");
            var comph4 = window.getComputedStyle(h4);
            if (body.classList[0] == "bp3-dark") { // this is Roam "Native" Dark dark mode
                h4BG = "#30404d";
            } else if (comph4["backgroundColor"] == "rgba(0, 0, 0, 0)" || comph4["backgroundColor"] == "rgb(255, 255, 255)") {
                h4BG = appBG;
            } else {
                h4BG = RGBAToHexA(comph4["backgroundColor"], true);
            }
            var h4CSS = "[data-page-links^='[\"" + h4Tag + "\"]'] > .rm-block-main.rm-block__self:first-child {background-color: " + h4BG + " !important; opacity: 1.0 !important; will-change: transform !important; position: sticky !important; z-index: 15 !important; top: " + h4Margin + "px !important;} ";
            cssString += h4CSS;
            h5Margin = h4Margin + parseInt(comph4.height);
        }
    }
    if (localStorage.getItem("augmented_headings:h5")) {
        var h5Tag = localStorage.getItem("augmented_headings:h5");
        if (document.querySelector("[data-tag^='" + h5Tag + "'] + .rm-highlight")) {
            const h5 = document.querySelector("[data-page-links^='[\"" + h5Tag + "\"]'] > .rm-block-main.rm-block__self:first-child");
            var comph5 = window.getComputedStyle(h5);
            if (body.classList[0] == "bp3-dark") { // this is Roam "Native" Dark dark mode
                h5BG = "#30404d";
            } else if (comph5["backgroundColor"] == "rgba(0, 0, 0, 0)" || comph5["backgroundColor"] == "rgb(255, 255, 255)") {
                h5BG = appBG;
            } else {
                h5BG = RGBAToHexA(comph5["backgroundColor"], true);
            }
            var h5CSS = "[data-page-links^='[\"" + h5Tag + "\"]'] > .rm-block-main.rm-block__self:first-child {background-color: " + h5BG + " !important; opacity: 1.0 !important; will-change: transform !important; position: sticky !important; z-index: 14 !important; top: " + h5Margin + "px !important;} ";
            cssString += h5CSS;
            h6Margin = h5Margin + parseInt(comph5.height);
        }
    }
    if (localStorage.getItem("augmented_headings:h6")) {
        var h6Tag = localStorage.getItem("augmented_headings:h6");
        if (document.querySelector("[data-tag^='" + h6Tag + "'] + .rm-highlight")) {
            const h6 = document.querySelector("[data-page-links^='[\"" + h6Tag + "\"]'] > .rm-block-main.rm-block__self:first-child");
            var comph6 = window.getComputedStyle(h6);
            if (body.classList[0] == "bp3-dark") { // this is Roam "Native" Dark dark mode
                h6BG = "#30404d";
            } else if (comph6["backgroundColor"] == "rgba(0, 0, 0, 0)" || comph6["backgroundColor"] == "rgb(255, 255, 255)") {
                h6BG = appBG;
            } else {
                h6BG = RGBAToHexA(comph6["backgroundColor"], true);
            }
            var h6CSS = "[data-page-links^='[\"" + h6Tag + "\"]'] > .rm-block-main.rm-block__self:first-child {background-color: " + h6BG + " !important; opacity: 1.0 !important; will-change: transform !important; position: sticky !important; z-index: 13 !important; top: " + h6Margin + "px !important;} ";
            cssString += h6CSS;
        }
    }
    // CSS adapted and modified from a post on Slack shared by Fabrice Gallet https://roamresearch.slack.com/archives/C016N2B66JU/p1667846823724739?thread_ts=1667816335.849789&cid=C016N2B66JU

    let roamFixCSS = ".rm-article-wrapper {margin-top: -2px !important;}";
    cssString += roamFixCSS;
    var head = document.getElementsByTagName("head")[0];
    var style = document.createElement("style");
    style.id = "sticky-css";
    style.textContent = cssString;
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