
function HandleSearchSelection(input, rows, messageSelector, rightPane, resultsSelector) {

    input = $(input);
    rows = $(rows);

    let txt = $.trim(input.val());

    // Empty textbox -> first row
    if (txt === "") {

        if (rows.length)
            rows.eq(0).trigger("click");

        return;
    }

    // Only one row
    if (rows.length === 1) {
        rows.eq(0).trigger("click");
        return;
    }

    // Highlighted row
    let currentRow = rows.filter(".current-row");

    if (currentRow.length === 1) {
        currentRow.trigger("click");
        return;
    }

    // Matching row
    let matchedRows = rows.filter(".match-row");

    if (matchedRows.length === 1) {
        matchedRows.trigger("click");
        return;
    }

    if (matchedRows.length > 1 || rows.length > 1) {

        input.removeData("selectedIndex");

        $(messageSelector)
            .html("Too many Choices!<br/>Select any one.")
            .show();
        input.focus();
        $(rightPane).addClass("show");
        $(resultsSelector).show();
    }
    // No records found
    if (rows.length === 0) {

        input.removeData("selectedIndex");

        $(messageSelector)
            .html("No records found.")
            .show();

        input.focus();
        $(rightPane).addClass("show");
        $(resultsSelector).show();

        return;
    }
}


function HandleSearchKeyDown(e, textbox, rightPaneId, resultClass, messageId) {

    let input = $(textbox);

    let rightPane = $(rightPaneId);
    let resultsDiv = rightPane.find(resultClass);

    rightPane.addClass("show");
    resultsDiv.show();

    let rows = resultsDiv.find("tbody tr");

    if (!resultsDiv.is(":visible") || rows.length === 0)
        return;

    let selectedIndex = input.data("selectedIndex");

    if (selectedIndex == null || selectedIndex >= rows.length)
        selectedIndex = -1;

    switch (e.key) {

        case "ArrowDown":

            e.preventDefault();

            // First ArrowDown after search: select the last matched row.
            let lastMatch = input.data("lastMatch");

            if (lastMatch !== undefined) {

                selectedIndex = lastMatch;

                // Keep the match-row highlight.
                // Clear only the stored match indexes so this runs once.
                input.removeData("firstMatch");
                input.removeData("lastMatch");
            }
            else {

                // No matched rows and no current selection.
                if (selectedIndex === -1)
                    selectedIndex = rows.length - 1;
                else
                    selectedIndex = (selectedIndex < rows.length - 1)
                        ? selectedIndex + 1
                        : 0;
            }

            HighlightRow(rows, selectedIndex);
            input.data("selectedIndex", selectedIndex);
            break;


        case "ArrowUp":

            e.preventDefault();

            // First ArrowUp after search: select the first matched row.
            let firstMatch = input.data("firstMatch");

            if (firstMatch !== undefined) {

                selectedIndex = firstMatch;

                // Keep the match-row highlight.
                // Clear only the stored match indexes so this runs once.
                input.removeData("firstMatch");
                input.removeData("lastMatch");
            }
            else {

                // No matched rows and no current selection.
                if (selectedIndex === -1)
                    selectedIndex = 0;
                else
                    selectedIndex = (selectedIndex > 0)
                        ? selectedIndex - 1
                        : rows.length - 1;
            }

            HighlightRow(rows, selectedIndex);
            input.data("selectedIndex", selectedIndex);
            break;


        case "Enter":

            e.preventDefault();

            let currentRow = rows.filter(".current-row");
            let matchedRows = rows.filter(".match-row");

            if (currentRow.length === 1) {
                currentRow.trigger("click");
                return;
            }

            if (matchedRows.length === 1) {
                matchedRows.trigger("click");
                return;
            }

            if (matchedRows.length > 1 || rows.length > 1) {

                $(messageId)
                    .html("Too many Choices !<br/> Select any one.")
                    .show();

                rightPane.addClass("show");
                resultsDiv.show();
                input.focus();
            }

            break;
    }
}


function SelectBuyer(
    cust,
    customerNameId,
    customerNumberId,
    currencyNameId,
    currencyNumberId,
    warehouseId,
    rightPaneId,
    resultClass
) {

    // Customer
    $(customerNameId).val(cust.cuS_Name);
    $(customerNumberId).val(cust.cuS_Number);

    // Currency
    $(currencyNameId).val(cust.cuS_CUR_Name);
    $(currencyNumberId).val(cust.cuS_CUR_Number);

    // Warehouse
    $(warehouseId).val(cust.cuS_WH_Number);

    // Hide search results
    $(rightPaneId)
        .removeClass("show")
        .find(resultClass)
        .hide()
        .empty();
}
function OnBuyerSelect(inputElement, rightPaneId, resultClass) {

    var rightPane = $(rightPaneId);
    var resultsDiv = rightPane.find(resultClass);

    // If results are already loaded, just show them
    if (resultsDiv.find("tbody tr").length > 0) {

        rightPane.addClass("show");
        resultsDiv.show();

        let rows = resultsDiv.find("tbody tr");

        if (rows.filter(".current-row").length === 0) {
            $(inputElement).removeData("selectedIndex");
        }
    }
    else {
        // First time - load data
        SearchBuyer(inputElement);
    }
}

//#region common set  width

function getTextWidth(text, element) {

    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");

    const style = window.getComputedStyle(element);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    return Math.ceil(ctx.measureText(text).width);
}

// Converts characters (ch) to pixels
// 1ch = width of the "0" character in the current font
function chToPx(ch, element) {

    const canvas = chToPx.canvas || (chToPx.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");

    const style = window.getComputedStyle(element);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    const oneCh = ctx.measureText("0").width;

    return Math.ceil(ch * oneCh);
}



function ApplyFieldWidths({
    fields,
    container = "#ItemTable",
    tempRow = "#TempRow",
    tableBody = "#TableBody",
    searchTable = "#tblsearch",
    checkWidth = 40
}) {

    const $container = $(container);

    // Checkbox column width
    $container.find("thead th:first-child, tfoot td:first-child").each(function () {
        this.style.setProperty("width", checkWidth + "px", "important");
        this.style.setProperty("min-width", checkWidth + "px", "important");
        this.style.setProperty("max-width", checkWidth + "px", "important");
        this.style.setProperty("text-align", "center", "important");
    });

    // Body checkbox
    $container.find("tbody > tr > td:first-child").each(function () {
        this.style.setProperty("width", checkWidth + "px", "important");
        this.style.setProperty("min-width", checkWidth + "px", "important");
        this.style.setProperty("max-width", checkWidth + "px", "important");
        this.style.setProperty("text-align", "center", "important");
    });

    fields.forEach(f => {

        let selector;

        if (tempRow) {
            selector = `${tempRow} ${f.cls}, ${tableBody} > tr.NewRow ${f.cls}`;
        } else {
            selector = `${tableBody} ${f.cls}`;
        }

        const controls = $container.find(selector).filter(function () {
            return $(this).closest(searchTable).length === 0;
        });

        if (!controls.length)
            return;

        const sample = controls.first()[0];

        const minWidth = chToPx(f.min, sample);
        const maxWidth = f.max != null
            ? chToPx(f.max, sample)
            : Number.MAX_SAFE_INTEGER;

        let requiredWidth = minWidth;

        controls.each(function () {

            let text = "";

            if (this.tagName === "SELECT") {
                text = this.options[this.selectedIndex]?.text || "";
            }
            else if (this.tagName === "INPUT" || this.tagName === "TEXTAREA") {
                text = this.value || "";
            }
            else {
                text = this.textContent || "";
            }

            requiredWidth = Math.max(
                requiredWidth,
                getTextWidth(text.trim(), this)
            );
        });

        requiredWidth = Math.min(requiredWidth, maxWidth);

        if (f.extraPadding) {
            requiredWidth = Math.min(requiredWidth + f.extraPadding, maxWidth);
        }

        controls.each(function () {

            const td = $(this).closest("td")[0];
            const controlHeight = f.height || 27;

            if ($(td).closest(searchTable).length === 0) {

                // TD
                td.style.setProperty("width", requiredWidth + "px", "important");
                td.style.setProperty("min-width", minWidth + "px", "important");
                td.style.setProperty("max-width", maxWidth + "px", "important");

                td.style.setProperty("height", controlHeight + "px", "important");
                td.style.setProperty("min-height", controlHeight + "px", "important");
                td.style.setProperty("max-height", controlHeight + "px", "important");

                td.style.setProperty("padding", "0.1em", "important");
                td.style.setProperty("margin", "0", "important");
                td.style.setProperty("vertical-align", "middle", "important");
                td.style.setProperty("text-align", f.align, "important");

                // TH
                const th = $container.find("thead th").eq(td.cellIndex)[0];

                if (th) {
                    th.style.setProperty("width", requiredWidth + "px", "important");
                    th.style.setProperty("min-width", minWidth + "px", "important");
                    th.style.setProperty("max-width", maxWidth + "px", "important");
                    th.style.setProperty("padding", "0.4rem", "important");
                    th.style.setProperty("text-align", f.align, "important");
                }

                // Actual TD Width
                const actualWidth = td.getBoundingClientRect().width;

                // Control
                this.style.setProperty("width", "100%", "important");
                this.style.setProperty("min-width", "100%", "important");
                this.style.setProperty("max-width", "100%", "important");
                this.style.setProperty("box-sizing", "border-box", "important");

                this.style.setProperty("height", controlHeight + "px", "important");
                this.style.setProperty("min-height", controlHeight + "px", "important");
                this.style.setProperty("max-height", controlHeight + "px", "important");

                this.style.setProperty("box-sizing", "border-box", "important");
             //   this.style.setProperty("padding", "0", "important");
                this.style.setProperty("margin", "0", "important");
                this.style.setProperty("border-radius", "0", "important");
                this.style.setProperty("text-align", f.align, "important");
                this.style.setProperty("resize", "none", "important");
                this.style.setProperty("overflow", "hidden", "important");
         
                if (this.tagName === "LABEL" || this.tagName === "TEXTAREA") {

                    this.style.setProperty("display", "block", "important");
                    this.style.setProperty("width", "100%", "important");
                    this.style.setProperty("white-space", "normal", "important");
                    this.style.setProperty("word-break", "break-word", "important");
                    this.style.setProperty("padding", "0.4rem", "important");
                    this.style.removeProperty("height");
                    this.style.removeProperty("min-height");
                    this.style.removeProperty("max-height");
                    this.style.setProperty("resize", "none", "important");
                    this.style.setProperty("overflow", "hidden", "important");
                    td.style.removeProperty("height");
                    td.style.removeProperty("min-height");
                    td.style.removeProperty("max-height");
                    // Make label height equal to td height
                    this.style.setProperty("height", td.offsetHeight + "px", "important");
                    this.style.setProperty("box-sizing", "border-box", "important");
                }
            }
        });
    });

    ApplyHeaderAlignment(fields,container);
}


function ApplyHeaderAlignment(fields, container = "#ItemTable") {

    fields.forEach(f => {

        const elements = $(container)
            .find("thead th, tbody td")
            .filter(function () {
                return $(this).hasClass(f.cls.replace(".", ""));
            });

        elements.each(function () {

            this.style.setProperty("text-align", f.align, "important");

            switch (f.align) {
                case "left":
                    this.style.setProperty("padding-left", ".5rem", "important");
                    this.style.setProperty("padding-right", "0", "important");
                    break;

                case "right":
                    this.style.setProperty("padding-right", ".5rem", "important");
                    this.style.setProperty("padding-left", "0", "important");
                    break;

                default: // center
                    this.style.setProperty("padding-left", "0", "important");
                    this.style.setProperty("padding-right", "0", "important");
                    break;
            }

        });

    });

}
//#endregion
//#region show right panes
function ShowCustomerPane() {
    $("#RightPane").show();
    $("#RightPane_Item").hide();
}

function ShowItemPane() {
    $("#RightPane").hide();
    $("#RightPane_Item").show();
}

//#endregion 
