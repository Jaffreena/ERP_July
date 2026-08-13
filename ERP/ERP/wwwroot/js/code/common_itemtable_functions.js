// Hide batch popup when Escape key is pressed
$(document).on("keydown", function (e) {

    if (e.key === "Escape") {
        $(".batchPopup:visible").hide();
        $(document.activeElement).blur();
    }
});

    //#endregion
//#region Row Click - Single Selection
$("#ItemTable").on("click focusin", "tbody tr.NewRow", function (e) {

    // Ignore direct checkbox click
    if ($(e.target).closest(".CheckItem").length) {
        return;
    }

    // Uncheck all row checkboxes
    $("#ItemTable .CheckItem").prop("checked", false);

    // Check only current row
    $(this).find(".CheckItem").prop("checked", true);
});
//#endregion

//#region Checkbox Click - Multiple Selection
$("#ItemTable").on("click", ".CheckItem", function (e) {

    // Prevent row click event
    e.stopPropagation();
});
//#endregion

$(document).on("click focusin", "#ItemTable input", function (e) {
    e.stopPropagation();

    let input = this;
    input.focus();

    setTimeout(function () {
        input.select();
    }, 10);
});
// Header checkbox -> Check/Uncheck all
$(document).on("change", "#IndexAllCheckItem", function () {
    $(".CheckItem").prop("checked", this.checked);
});

// Individual checkbox -> Update header checkbox
$(document).on("change", ".CheckItem", function () {
    $("#IndexAllCheckItem").prop(
        "checked",
        $(".CheckItem").length === $(".CheckItem:checked").length
    );
});
//#region Remove Checked Rows
//#region common set width

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

                // Control
                this.style.setProperty("width", "100%", "important");
                this.style.setProperty("min-width", "100%", "important");
                this.style.setProperty("max-width", "100%", "important");
                this.style.setProperty("box-sizing", "border-box", "important");

                this.style.setProperty("height", "100%", "important");
                this.style.setProperty("min-height", "100%", "important");
                this.style.setProperty("max-height", "100%", "important");

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
                    this.style.setProperty("height", "100%", "important");
                    this.style.setProperty("box-sizing", "border-box", "important");
                }
            }
        });
    });

    ApplyHeaderAlignment(fields, container);
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
//#region Conversion field widths

const ConversionConsumptionFields = [
    { cls: ".JIDNI_Item_Code", min: 12, max: 20, align: "left" },
    { cls: ".JIDNI_Item_Description", min: 30, max: 40, align: "left" },
    { cls: ".JIDNI_OuterDia", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_Thickness", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_Length", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_Width", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_MaterialGrade", min: 10, max: 20, align: "left" },
    { cls: ".JIDNI_ItemGroup", min: 10, max: 20, align: "left" },
    { cls: ".JIDNI_WH_Number", min: 10, max: 20, align: "left" },
    { cls: ".JIDNI_UoM_Number", min: 10, max: 15, align: "center" },
    { cls: ".JIDNI_Qty", min: 10, max: 20, align: "right", extraPadding: 8 }
];

const ConversionProductionFields = [
    { cls: ".JIDNI_Item_Code", min: 12, max: 20, align: "left" },
    { cls: ".JIDNI_Item_Description", min: 30, max: 40, align: "left" },
    { cls: ".JIDNI_OuterDia", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_Thickness", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_Length", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_Width", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_MaterialGrade", min: 10, max: 20, align: "left" },
    { cls: ".JIDNI_ItemGroup", min: 10, max: 20, align: "left" },
    { cls: ".JIDNI_WH_Number", min: 10, max: 20, align: "left" },
    { cls: ".JIDNI_UoM_Number", min: 10, max: 15, align: "center" },
    { cls: ".JIDNI_Qty", min: 10, max: 20, align: "right", extraPadding: 8 }
];

const ConversionScrapFields = [
    { cls: ".JIDNI_Item_Code", min: 12, max: 20, align: "left" },
    { cls: ".JIDNI_Item_Description", min: 30, max: 40, align: "left" },
    { cls: ".JIDNI_OuterDia", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_Thickness", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_Length", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_Width", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_MaterialGrade", min: 10, max: 20, align: "left" },
    { cls: ".JIDNI_ItemGroup", min: 10, max: 20, align: "left" },
    { cls: ".JIDNI_WH_Number", min: 10, max: 20, align: "left" },
    { cls: ".JIDNI_UoM_Number", min: 10, max: 15, align: "center" },
    { cls: ".JIDNI_Qty", min: 10, max: 20, align: "right", extraPadding: 8 }
];

//#endregion 
//#region Conversion resize functions

 


//#region batch
//#region batch

function ApplyBatchFieldWidths(tbodySelector = "#IBatTableBody", modalSelector = "#IBatch") {

    const fields = [
        { cls: ".RNI_BCH_Date", min: 10, max: 10, align: "center" },
        { cls: ".RNI_BCH_No", min: 20, max: 50, align: "left" },
        { cls: ".RNI_BCH_Qty", min: 10, max: 20, align: "center" },
        { cls: ".RNI_BCH_UnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".RNI_BCH_Value", min: 13, max: 25, align: "right" }
    ];

    const $tbody = $(tbodySelector);
    const $table = $tbody.closest("table");
    if (!$table.length) return;

    fields.forEach(f => {
        const controls = $tbody.find("#IBatTempRow " + f.cls + ", tr.IBatNewRow " + f.cls);
        if (!controls.length) return;

        const sample = controls.first()[0];
        const minWidth = chToPx(f.min, sample);
        const maxWidth = f.max != null ? chToPx(f.max, sample) : Number.MAX_SAFE_INTEGER;
        let requiredWidth = minWidth;

        controls.each(function () {
            let text = this.tagName === "SELECT"
                ? (this.options[this.selectedIndex]?.text || "")
                : (this.value || this.textContent || "");
            requiredWidth = Math.max(requiredWidth, getTextWidth(text.trim(), this));
        });

        requiredWidth = Math.min(requiredWidth, maxWidth);
        if (f.cls === ".RNI_BCH_UnitPrice" || f.cls === ".RNI_BCH_Value") {
            requiredWidth = Math.min(requiredWidth + 8, maxWidth);
        }

        controls.each(function () {
            this.style.removeProperty("padding");
            this.style.setProperty("width", "100%", "important");
            this.style.setProperty("min-width", "100%", "important");
            this.style.setProperty("max-width", "100%", "important");
            this.style.setProperty("box-sizing", "border-box", "important");
            this.style.setProperty("text-align", f.align, "important");
            this.style.setProperty("padding", "2px", "important");

            const td = $(this).closest("td")[0];
            td.style.setProperty("width", requiredWidth + "px", "important");
            td.style.setProperty("min-width", minWidth + "px", "important");
            td.style.setProperty("max-width", maxWidth + "px", "important");
            td.style.setProperty("text-align", f.align, "important");
            td.style.setProperty("padding", "2px", "important");

            const th = $table.find("thead th").eq(td.cellIndex)[0];
            if (th) {
                th.style.setProperty("width", requiredWidth + "px", "important");
                th.style.setProperty("min-width", minWidth + "px", "important");
                th.style.setProperty("max-width", maxWidth + "px", "important");
                th.style.setProperty("text-align", f.align, "important");
                th.style.setProperty("padding", "2px", "important");
            }
        });
    });

    ResizeBatchPopup($table[0], modalSelector);
}

function ResizeBatchPopup(table, modalSelector = "#IBatch") {
    const dialog = document.querySelector(modalSelector + " .modal-dialog");
    if (!table || !dialog) return;

    const popupWidth = table.offsetWidth + 40;
    dialog.style.setProperty("width", popupWidth + "px", "important");
    dialog.style.setProperty("max-width", popupWidth + "px", "important");
}

function ApplyConsumptionBatchFieldWidths(tbodySelector = "#DeliveryNoteBatchTableBody", modalSelector = "#DeliveryNoteBatchModal") {

    const fields = [
        { cls: ".JIDNI_BCH_WH_Name", min: 10, max: 20, align: "left" },
        { cls: ".JIDNI_BCH_BatchDate", min: 10, max: 10, align: "center" },
        { cls: ".JIDNI_BCH_BatchNo", min: 20, max: 50, align: "left" },
        { cls: ".JIDNI_BCH_QtyAvailable", min: 10, max: 20, align: "right" },
        { cls: ".JIDNI_BCH_QtyReserved", min: 10, max: 20, align: "right" },
        { cls: ".JIDNI_BCH_QtyInvoice", min: 10, max: 20, align: "right" },
        { cls: ".JIDNI_BCH_BatchUnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".JIDNI_BCH_BatchValue", min: 13, max: 25, align: "right" }
    ];

    const $tbody = $(tbodySelector);
    const $table = $tbody.closest("table");
    if (!$table.length) return;

    fields.forEach(f => {
        const controls = $tbody.find("#DeliveryNoteBatchTemplateRow " + f.cls + ", tr:not(#DeliveryNoteBatchTemplateRow) " + f.cls);
        if (!controls.length) return;

        const sample = controls.first()[0];
        const minWidth = chToPx(f.min, sample);
        const maxWidth = f.max != null ? chToPx(f.max, sample) : Number.MAX_SAFE_INTEGER;
        let requiredWidth = minWidth;

        controls.each(function () {
            let text = this.tagName === "SELECT"
                ? (this.options[this.selectedIndex]?.text || "")
                : (this.value || "");
            requiredWidth = Math.max(requiredWidth, getTextWidth(text.trim(), this));
        });

        requiredWidth = Math.min(requiredWidth, maxWidth);
        if (f.cls === ".JIDNI_BCH_BatchUnitPrice" || f.cls === ".JIDNI_BCH_BatchValue") {
            requiredWidth = Math.min(requiredWidth + 8, maxWidth);
        }

        controls.each(function () {
            this.style.setProperty("width", "100%", "important");
            this.style.setProperty("text-align", f.align, "important");

            const td = $(this).closest("td")[0];
            td.style.setProperty("width", requiredWidth + "px", "important");
            td.style.setProperty("min-width", minWidth + "px", "important");
            td.style.setProperty("max-width", maxWidth + "px", "important");
            td.style.setProperty("text-align", f.align, "important");

            const th = $table.find("thead th").eq(td.cellIndex)[0];
            if (th) {
                th.style.setProperty("width", requiredWidth + "px", "important");
                th.style.setProperty("text-align", f.align, "important");
            }
        });
    });

    ResizeBatchPopup(tbodySelector, modalSelector);
}

$(document).on("input change blur", "#IBatTableBody_P input, #IBatTableBody_P textarea, #IBatTableBody_P select", function () {
    ApplyBatchFieldWidths("#IBatTableBody_P", "#IBatch");
});

$(document).on("input change blur", "#DeliveryNoteBatchTableBody input, #DeliveryNoteBatchTableBody select", function () {
    ApplyConsumptionBatchFieldWidths("#DeliveryNoteBatchTableBody", "#DeliveryNoteBatchModal");
});

$(document).on("input change blur", "#IBatTableBody_S input, #IBatTableBody_S textarea, #IBatTableBody_S select", function () {
    ApplyBatchFieldWidths("#IBatTableBody_S", "#IBatch_S");
});

//#endregion
//#endregion
function OnFocus(inputElement) {

    $(inputElement).data("oldItemCode", $(inputElement).val());
    $(inputElement).data("oldItemNumber",
        $(inputElement).closest("tr").find(".Item_Number").val());

    if (inputElement.value) {
        $(inputElement).select();
    }

    OpenItemCodeSearch(inputElement);
}

function OpenItemCodeSearch(inputElement) {

    if ($.trim($("#Header_JIDNH_MS_Number").val()) === "" || $("#Header_JIDNH_MS_Number").val() === "0") {
        $("#Header_JIDNH_MS_Number").prop("selectedIndex", 1);
    }

    $("#RightPane").hide();
    $("#RightPane").removeClass("show");
    $("#RightPane .buyer-search-results").hide();

    $("#RightPane_Item").show();
    $("#RightPane_Item").addClass("show");
    $("#RightPane_Item .search-results").show();

    searchItemJIDNI(inputElement);
}

 
function HandleSearchSelection(input, rows, messageSelector, rightPane, resultsSelector) {


    input = $(input);
    rows = $(rows);

    let txt = $.trim(input.val());

    // Empty textbox -> first row
    //if (txt === "") {

    //    if (rows.length)
    //        rows.eq(0).trigger("click");

    //    return;
    //}

    // Only one row
    if (rows.length === 1) {
        rows.eq(0).trigger("click");
        return;
    }
    console.log("HandleSearchSelection");

    // Highlighted row
    let currentRow = rows.filter(".current-row");
    console.log(currentRow.length);
    if (currentRow.length === 1) {
        currentRow.trigger("click");
        console.log("trigger finished");
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


let itemSearchXHR = null;
function HighlightRow(rows, index) {

    rows.removeClass("current-row");

    if (index < 0 || index >= rows.length)
        return;

    $(rows[index]).addClass("current-row");

    rows[index].scrollIntoView({
        block: "nearest"
    });
}
function searchItemJIDNI(inputElement) {
    if (itemSearchXHR) itemSearchXHR.abort()
    let itemCode = inputElement.value.trim();
    let row = $(inputElement).closest("tr");

    let resultsDiv = $("#RightPane_Item").find(".search-results");

    let material = $("#Header_JIDNH_MS_Number").val();

    if (!material) return;

    itemSearchXHR = $.ajax({
        url: '/jobinward/transactions/conversion/item',
        type: 'GET',
        data: {
            ItemCode: itemCode,
            MS: material
        },
        success: function (data) {

            resultsDiv.empty();
            $("#ItemMessage").hide().text("");

            if (data && data.length > 0) {

                $("#RightPane_Item").addClass("show");
                resultsDiv.show();

                let table = $(`
<div class="card-body modal-content batchPopup p-0" style="z-index:999;">
    <table class="table table-bordered table-hover table-fixed table-grid mb-0 w-100" id="tblsearch">
        <thead>
            <tr class="table-info">
                  <th style="width:30%;">Item Code</th>
        <th style="width:70%;">Description</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
</div>
`);

                $.each(data, function (i, item) {

                    let tr = $("<tr></tr>").css({
                        height: "24px",
                        cursor: "pointer"
                    });

                    tr.append('<td style="width:30%;">' + item.itemCode + '</td>');
                    tr.append('<td style="width:70%;">' + item.itemDescription + '</td>');

                    table.find("tbody").append(tr);

                    tr.on("click", function () {

                        $("#ItemMessage").hide().text("");

                        row.find(".JIDNI_Item_Code").val(item.itemCode);
                        row.find(".JIDNI_Item_Number").val(item.itemNumber);

                        $(inputElement).data("oldItemCode", item.itemCode);
                        $(inputElement).data("oldItemNumber", item.itemNumber);

                        row.find(".JIDNI_Item_Description").val(item.itemDescription);
                        row.find(".JIDNI_OuterDia").val(item.outerDia);
                        row.find(".JIDNI_Thickness").val(item.thickness);
                        row.find(".JIDNI_Length").val(item.length);
                        row.find(".JIDNI_Width").val(item.width);
                        row.find(".JIDNI_MaterialGrade").val(item.materialGrade);
                        row.find(".JIDNI_ItemGroup").val(item.itemGroup);

                        row.find(".JIDNI_UoM_Number").val(item.uoM);
                        row.find(".JIDNI_WH_Number").val(item.saleWarehouse);

                        let qtyInput = row.find(".JIDNI_Qty");

                        qtyInput.focus();

                        setTimeout(function () {
                            qtyInput.select();
                        }, 100);

                        qtyInput.val(formatIndianQty(qtyInput.val()));

                        resultsDiv.hide();
                        $("#RightPane_Item").removeClass("show");
                    });

                });

                resultsDiv.append(table);

                resultsDiv.append(`
<div id="ItemMessage"
     style="
        display:none;
        background:#bdbdbd;
        border-top:1px solid #ced4da;
        color:#dc3545;
        font-weight:bold;
        text-align:center;
        padding:4px 52px;
        font-size:18px;
        position:absolute;
        bottom:0;
        left:-2px;
        right:0;
        z-index:10;
        box-sizing:border-box;">
</div>
`);
                // Keyboard Navigation
                //#region search logic highlight

                let rows = resultsDiv.find("tbody tr");

                rows.removeClass("match-row current-row");

                $(inputElement).removeData("selectedIndex");

                let searchText = itemCode.trim().toLowerCase();

                let firstMatch = -1;
                let lastMatch = -1;

                rows.each(function (i) {

                    let code = $(this).find("td:first").text().trim().toLowerCase();

                    if (searchText !== "" && code.startsWith(searchText)) {

                        $(this).addClass("match-row");

                        if (firstMatch === -1)
                            firstMatch = i;

                        lastMatch = i;
                    }
                });

                if (firstMatch >= 0) {

                    $(inputElement).data("firstMatch", firstMatch);
                    $(inputElement).data("lastMatch", lastMatch);
                }
                else {

                    $(inputElement).removeData("firstMatch");
                    $(inputElement).removeData("lastMatch");
                }

                //#endregion

            } else {

                resultsDiv.append(GetItemEmptyView());

                $("#RightPane_Item").addClass("show");
                $("#RightPane_Item .search-results").show();
            }
        },
        error: function () {

            resultsDiv.text("Error loading data.").show();
        }
    });
}