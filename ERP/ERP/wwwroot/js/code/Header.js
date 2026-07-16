function fitInputWidth(input, minWidth, maxWidth = null) {

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