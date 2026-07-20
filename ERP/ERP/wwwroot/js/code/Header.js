function chToPx(ch, element) {

    const canvas = chToPx.canvas || (chToPx.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");

    const style = window.getComputedStyle(element);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    const oneCh = ctx.measureText("0").width;

    return Math.ceil(ch * oneCh);
}
function getTextWidth(text, element) {

    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");

    const style = window.getComputedStyle(element);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    return Math.ceil(ctx.measureText(text).width);
}

function fitInputWidth1(input, minWidth, maxWidth = null) {

    if (typeof input === "string") {
        input = document.getElementById(input);
    }

    if (!input) return;

    let width = Math.max(minWidth, (input.value || "").length);

    if (maxWidth !== null) {
        width = Math.min(width, maxWidth);
    }

    input.style.width = width + "ch";
}

function fitInputWidth(input, minWidth, maxWidth = null) {

    if (typeof input === "string") {
        input = document.getElementById(input);
    }

    if (!input) return;

    const text = input.value || "";

    // Measure actual text width in pixels
    let width = getTextWidth(text || " ", input) + 20; // 20px for padding/caret

    // Convert min/max from ch to px
    const minPx = chToPx(minWidth, input);
    const maxPx = maxWidth !== null ? chToPx(maxWidth, input) : null;

    width = Math.max(width, minPx);

    if (maxPx !== null) {
        width = Math.min(width, maxPx);
    }

    input.style.setProperty("width", width + "px", "important");
    input.style.setProperty("min-width", width + "px", "important");
    input.style.setProperty("max-width", width + "px", "important");
}