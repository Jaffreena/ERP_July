// ---- right pane show/hide (Vendor / Item search)
function ShowVendorPane() {
    $("#RightPane").show().addClass("show");
    $("#RightPane .buyer-search-results").show();

    $("#RightPane_Item").hide().removeClass("show");
    $("#RightPane_Item .search-results").hide();
}

if (typeof ShowItemPane !== "function") {
    window.ShowItemPane = function () {
        $("#RightPane_Item").show().addClass("show");
        $("#RightPane_Item .search-results").show();

        $("#RightPane").hide().removeClass("show");
        $("#RightPane .buyer-search-results").hide();
    };
}

// ---- current Receipt Note number (hidden header field, else ?JORNH_Number=)
function GetJORNH() {
    let v = parseInt($("#Header_JORNH_Number").val());
    if (v > 0) return v;
    return parseInt(new URLSearchParams(window.location.search).get("JORNH_Number")) || 0;
}

// ---- case-insensitive property read (works with any JSON naming policy)
function JV(obj, name) {
    if (!obj) return undefined;
    let n = name.toLowerCase();
    for (let k in obj) { if (k.toLowerCase() === n) return obj[k]; }
    return undefined;
}

// ---- vendor search result : column names (case-insensitive lookup)
const VENDOR_KEYS = {
    name: ["JWV_JW_VendorName", "JW_VendorName", "VendorName", "Name"],
    number: ["JWV_Number", "JW_Vendor_Number", "VendorNumber", "Number"],
    currency: ["JWV_Currency_Number", "Currency_Number"],
    warehouse: ["JWV_WH_Number", "WH_Number"]
};
function VendorVal(obj, keys) {
    if (!obj) return "";
    const lower = {};
    Object.keys(obj).forEach(function (k) { lower[k.toLowerCase()] = obj[k]; });
    for (let i = 0; i < keys.length; i++) {
        const v = lower[keys[i].toLowerCase()];
        if (v !== undefined && v !== null) return v;
    }
    return "";
}

// ---- Used Qty lock : a row already used downstream cannot change Item / WH / UoM or be deleted
function IsRowLocked(row) {
    return (parseFloat(removeComma(row.find(".JORNI_UsedQty").val())) || 0) > 0;
}
function ApplyRowLocks() {
    $("#ItemTable tbody tr.NewRow").each(function () {
        let row = $(this);
        if (!IsRowLocked(row)) return;
        row.addClass("row-locked");
        row.find(".JORNI_Item_Code").prop("readonly", true).attr("tabindex", "-1").css("pointer-events", "none");
        row.find(".JORNI_WH_Number, .JORNI_UoM_Number").css("pointer-events", "none").attr("tabindex", "-1");
    });
}

$(document).ready(function () {
    //#region JW_Vendor – Focus In
    // Handled via inline onfocus="ShowVendorPane();OnBuyerSelectCall(this)"
    // in the .cshtml — no delegated binding needed.
    //#endregion

    //#region JW_Vendor – Text change
    // Handled via inline oninput="OnBuyerInput(this)" in the .cshtml.
    //#endregion

    //#region JW_Vendor – Focus Out
    $(document).on("focusout", "#Header_JORNH_JW_Vendor_Name", function () {
        if (isMouseSelectingBuyer)
            return;
        let input = $(this);
        let rows = $("#RightPane .buyer-search-results tbody tr");

        if ($.trim(input.val()) === "" && rows.length > 0 &&
            !rows.filter(".current-row, .match-row").length) {

            isMouseSelectingBuyer = true;
            rows.first().trigger("mousedown");
            return;
        }

        HandleSearchSelection(
            input,
            rows,
            "#BuyerMessage",
            "#RightPane",
            "#RightPane .buyer-search-results"
        );
    });
    //#endregion

    //#region JW_Vendor – Keydown
    $(document).on("keydown", "#Header_JORNH_JW_Vendor_Name", function (e) {

        if (e.key !== "ArrowDown" && e.key !== "ArrowUp" &&
            e.key !== "Enter" && e.key !== "Escape") {
            return;
        }

        let input = $(this);
        let rows = $("#RightPane .buyer-search-results tbody tr");

        if ((e.key === "Enter" || e.key === "Escape") &&
            $.trim(input.val()) === "" && rows.length > 0 &&
            !rows.filter(".current-row, .match-row").length) {

            e.preventDefault();

            isMouseSelectingBuyer = true;
            rows.first().trigger("mousedown");
            return;
        }

        if (e.key === "Escape" || e.key === "Enter") {
            HandleSearchSelection(
                input,
                rows,
                "#BuyerMessage",
                "#RightPane",
                "#RightPane .buyer-search-results"
            );
            return;
        }

        HandleSearchKeyDown(
            e,
            this,
            "#RightPane",
            ".buyer-search-results",
            "#BuyerMessage"
        );
    });
    //#endregion

    //#region Item_Code – Focus In
    // Handled via inline onfocus (OnEditFocusItem or equivalent) in
    // the .cshtml — the re-trigger-loop guard lives inside that
    // function itself.
    //#endregion

    //#region Item_Code – Text change
    // Handled via inline oninput in the .cshtml.
    //#endregion

    //#region Item_Code – Keydown
    $(document).on("keydown", ".JORNI_Item_Code", function (e) {

        if (e.key !== "ArrowDown" && e.key !== "ArrowUp" &&
            e.key !== "Enter" && e.key !== "Escape") {
            return;
        }

        let rows = $("#RightPane_Item .search-results tbody tr");

        if ((e.key === "Enter" || e.key === "Escape") &&
            $.trim($(this).val()) === "" && rows.length > 0 &&
            !rows.filter(".current-row, .match-row").length) {

            e.preventDefault();

            isSelectingItem = true;
            rows.first().trigger("mousedown");
            return;
        }

        if (e.key === "Escape") {

            let input = $(this);

            HandleSearchSelection(
                input,
                rows,
                "#ItemMessage",
                "#RightPane_Item",
                "#RightPane_Item .search-results"
            );
            return;
        }

        HandleSearchKeyDown(
            e,
            this,
            "#RightPane_Item",
            ".search-results",
            "#ItemMessage",
            "#Header_JORNH_MS_Number"
        );
    });

    // mousedown -> (re)open the item pane and load/refresh the search.
    $(document).on("mousedown", ".JORNI_Item_Code", function (e) {

        if ($.trim($("#Header_JORNH_MS_Number").val()) === "") {
            $("#Header_JORNH_MS_Number").prop("selectedIndex", 1);
            return;
        }

        $("#RightPane").removeClass("show");
        $("#RightPane .buyer-search-results").hide();

        SearchEditItemJORNI(this);

        $("#RightPane_Item").addClass("show");
        $("#RightPane_Item .search-results").show();
    });
    //#endregion

    //#region Item_Code – Focus Out
    $(document).on("focusout", ".JORNI_Item_Code", function () {

        if (isSelectingItem)
            return;

        let input = $(this);
        let rows = $("#RightPane_Item .search-results tbody tr");

        if ($.trim(input.val()) === "" && rows.length > 0 &&
            !rows.filter(".current-row, .match-row").length) {

            isSelectingItem = true;
            rows.first().trigger("mousedown");
            return;
        }

        HandleSearchSelection(
            input,
            rows,
            "#ItemMessage",
            "#RightPane_Item",
            "#RightPane_Item .search-results"
        );
    });
    //#endregion

});
let isMouseSelectingBuyer = false;


let buyerSearchXHR = null;
//#region numeric-only typing (same rules as Create in receiptnote.js)

// ---- Amend Qty: digits only
$(document).on("keypress", ".JORNI_Qty", function (e) {
    if (e.ctrlKey || e.metaKey) return;   // Ctrl+V / Ctrl+A / Ctrl+C
    let charCode = e.which ? e.which : e.keyCode;
    let charStr = String.fromCharCode(charCode);

    if (!/[0-9]/.test(charStr)) {
        e.preventDefault();
    }
});

// strip anything that slips in via paste / drag-drop / autofill (also removes the commas of the formatted value)
$(document).on("input", ".JORNI_Qty", function () {
    let cleaned = $(this).val().replace(/[^0-9]/g, "");

    if (cleaned !== $(this).val()) {
        $(this).val(cleaned);
    }
});

// ---- Unit Price: digits + one dot, max 2 decimals
const EDIT_UNITPRICE_INPUT = "#ItemTable .JORNI_UnitPrice";
const EDIT_UNITPRICE_PATTERN = /^\d*\.?\d{0,2}$/;

// remove commas while editing (focusout adds them back)
$(document).on("focusin", EDIT_UNITPRICE_INPUT, function () {
    $(this).val(($(this).val() || "").replace(/,/g, ""));
});

// block a keystroke if the resulting value breaks the pattern
$(document).on("keypress", EDIT_UNITPRICE_INPUT, function (e) {
    if (e.ctrlKey || e.metaKey) return;   // Ctrl+V / Ctrl+A / Ctrl+C
    if (e.which < 32) return;             // Enter, Backspace etc.

    let el = this;
    let newVal = el.value.slice(0, el.selectionStart)
        + String.fromCharCode(e.which)
        + el.value.slice(el.selectionEnd);

    if (!EDIT_UNITPRICE_PATTERN.test(newVal)) {
        e.preventDefault();
    }
});

// clean paste / drag-drop / autofill
$(document).on("input", EDIT_UNITPRICE_INPUT, function () {
    let v = $(this).val();

    if (!EDIT_UNITPRICE_PATTERN.test(v)) {
        v = v.replace(/[^0-9.]/g, "");
        let parts = v.split(".");
        v = parts.length > 1
            ? parts[0] + "." + parts.slice(1).join("").slice(0, 2)
            : parts[0];
        $(this).val(v);
    }
});

// a lone "." is not a number
$(document).on("focusout", EDIT_UNITPRICE_INPUT, function () {
    if ($(this).val() === ".") $(this).val("");
});

// ---- Batch popup Delivered Qty: digits only
$(document).on("keypress", ".JORNI_BCH_QtyReceived", function (e) {
    if (e.ctrlKey || e.metaKey) return;
    let charCode = e.which ? e.which : e.keyCode;
    let charStr = String.fromCharCode(charCode);

    if (!/[0-9]/.test(charStr)) {
        e.preventDefault();
    }
});

$(document).on("input", ".JORNI_BCH_QtyReceived", function () {
    let cleaned = $(this).val().replace(/[^0-9]/g, "");

    if (cleaned !== $(this).val()) {
        $(this).val(cleaned);
    }
});
//#endregion

//#region VIEW MODE - same page as Edit, read-only (the hidden IsViewMode field is set by the View action)
function isViewModePage() {
    return $("#IsViewMode").val() === "1";
}

function ApplyViewMode() {
    if (!isViewModePage()) return;

    // 1) badge
    $(".panel-header .h6").first().append('<span class="badge bg-warning text-dark ms-2">VIEW ONLY</span>');

    // 2) remove every button that changes data (removed, not hidden: a hidden button can still be clicked by code)
    $("#btnUpdate, #EditAddRowButton, #RemoveItemRowButton_Edit").remove();
    $(".right-menu a.btn").filter(function () {
        return $.trim($(this).text()) === "Clear All";
    }).remove();

    // 3) fields: text boxes read-only, drop-downs and check boxes disabled.
    //    Row tick boxes stay live (the Batch button needs them).
    $("#ReceiptNoteForm input, #ReceiptNoteForm textarea, #ReceiptNoteForm select").each(function () {
        let el = $(this);
        let type = (el.attr("type") || "").toLowerCase();

        if (type === "hidden") return;
        if (el.is(".CheckItem, .IndexAllCheckItem, #IndexAllCheckItem")) return;

        if (el.is("select") || type === "checkbox") {
            el.prop("disabled", true);
        } else {
            el.prop("readonly", true).attr("tabindex", "-1");
        }
    });

    // boxes that open a search or run a check on focus cannot be clicked at all
    $(".JORNI_Item_Code, .JORNI_Qty, .JORNI_UnitPrice, #Header_JORNH_JW_Vendor_Name")
        .css("pointer-events", "none");

    // date picker: no calendar
    let dn = document.getElementById("Header_JORNH_RN_Date");
    if (dn && dn._flatpickr) {
        dn._flatpickr.set("clickOpens", false);
        if (dn._flatpickr.altInput) {
            dn._flatpickr.altInput.readOnly = true;
            dn._flatpickr.altInput.tabIndex = -1;
            dn._flatpickr.altInput.style.pointerEvents = "none";
        }
    }

    // keep disabled drop-downs looking like normal ones
    $("<style>").text(
        "#ReceiptNoteForm select:disabled { background-color:#fff; color:#212529; opacity:1; }"
    ).appendTo("head");

    // 4) Batch popup: shows the SAVED batches, read-only, with a Close button
    $(document).off("click", ".OpenBatchPopup").on("click", ".OpenBatchPopup", function (e) {
        e.preventDefault();

        let checked = $(".CheckItem:checked");
        if (checked.length <= 0) {
            alert("Please select at least one row");
            return false;
        }
        if (checked.length > 1) {
            alert("Please select only one row");
            return false;
        }

        let row = checked.closest("tr");
        $("#BatchPopupQty").text(row.find(".JORNI_Qty").val());

        $.ajax({
            url: "/joboutward/transactions/receipt-note/get-saved-batch-details",
            type: "GET",
            data: {
                FromWarehouse: row.find(".JORNI_WH_Number").val(),
                JORNI_Number: row.find(".JORNI_Number").val()
            },
            success: function (response) {
                ReceiptNoteBatchList_Edit = [];

                if (response && response.length > 0) {
                    $.each(response, function (i, b) {
                        ReceiptNoteBatchList_Edit.push({
                            JORNI_BCH_WH_Number: 0,
                            JORNI_BCH_JORNI_Number: row.find(".JORNI_Item_Number").val(),
                            JORNI_BCH_WH_Name: b.wareHouseCode,
                            JORNI_BCH_BatchDate: b.batchDate,
                            JORNI_BCH_BatchNo: b.batchNo,
                            JORNI_BCH_QtyAvailable: 0,
                            JORNI_BCH_QtyReserved: 0,
                            JORNI_BCH_QtyReceived: b.batchQty,
                            JORNI_BCH_UsedQty: b.usedQty || 0,
                            JORNI_BCH_BatchUnitPrice: b.batchUnitPrice,
                            JORNI_BCH_BatchValue: b.batchValue,
                            JORNI_BCH_Number: 0,
                            JORNI_Number: row.find(".JORNI_Number").val(),
                            JORNH_Number: $("#Header_JORNH_Number").val(),
                            RefBatch_Number: 0
                        });
                    });
                } else {
                    ReceiptNoteBatchList_Edit.push({});
                }

                BindReceiptNoteBatchTable();

                // stock columns mean nothing on a saved note; nothing in the popup is editable
                $("#ReceiptNoteBatchTableBody .JORNI_BCH_QtyAvailable, #ReceiptNoteBatchTableBody .JORNI_BCH_QtyReserved").val("");
                $("#TotalAvailableQty, #TotalReservedQty").val("");
                $("#ReceiptNoteBatchTableBody input").prop("readonly", true);
                ApplyBatchFieldWidths("#ReceiptNoteBatchList");

                $("#ReceiptNoteBatchModal").modal("show");
            },
            error: function () {
                alert("Error loading batch details");
            }
        });
    });

    $(document).off("click", "#SaveBatchButton");
    $("#SaveBatchButton").text("Close").attr("data-bs-dismiss", "modal");
    $("#Other-tab").closest("li").hide();      // other-warehouse stock is not part of a saved note
}

$(document).ready(function () {
    // run after every other ready handler and after the top-level handlers are bound
    setTimeout(ApplyViewMode, 0);
});
//#endregion

let deletedRows = [];
var G_JINI_Number = 0;
var G_JINH_Number = 0;
$(window).on("load", function () {
    setTimeout(function () {

        ApplyFieldWidths({
            fields: ItemTableFields,
            container: "#ItemTable",
            tempRow: "#TempRow",
            tableBody: "#TableBody",
            searchTable: "#tblsearch"
        });

    }, 200);
});

function ResizeColumns() {
    ApplyFieldWidths({
        fields: ItemTableFields,
        container: "#ItemTable",
        tempRow: "#TempRow",
        tableBody: "#TableBody",
        searchTable: "#tblsearch"
    });
}


const ItemTableFields = [
    { cls: ".JORNI_JPRS_Number", min: 10, max: 25, align: "left" },
    { cls: ".JORNI_Item_Code", min: 10, max: 15, align: "left" },
    { cls: ".JORNI_Item_Description", min: 40, max: 40, align: "left" },

    { cls: ".JORNI_OuterDia", min: 8, max: 8, align: "center" },
    { cls: ".JORNI_Thickness", min: 8, max: 8, align: "center" },
    { cls: ".JORNI_Length", min: 8, max: 8, align: "center" },

    { cls: ".JORNI_MaterialGrade", min: 10, max: 25, align: "left" },
    { cls: ".JORNI_ItemGroup", min: 10, max: 30, align: "left" },
    { cls: ".JORNI_WH_Number", min: 10, max: 25, align: "left" },

    { cls: ".JORNI_UoM_Number", min: 10, max: 15, align: "center" },

    { cls: ".JORNI_OriginalQty", min: 10, max: 20, align: "center" }, // Extra field
    { cls: ".JORNI_UsedQty", min: 10, max: 20, align: "center" }, // Extra field
    { cls: ".JORNI_Qty", min: 10, max: 20, align: "center" },
    { cls: ".JORNI_Qty_Kgs", min: 10, max: 20, align: "center" },

    { cls: ".JORNI_UnitPrice", min: 10, max: 20, align: "right" },
    { cls: ".JORNI_Amount", min: 13, max: 25, align: "right" },


    { cls: ".JORNI_JOJWI_SVOH_Number", min: 10, max: 25, align: "left" },// Extra field
    { cls: ".JORNI_FromWH_Number", min: 10, max: 25, align: "left" },
    { cls: ".JORNI_ToWH_Number", min: 10, max: 25, align: "left" },
    { cls: ".JORNI_JOFRT_SVOH_Number", min: 10, max: 25, align: "left" }
];
//#region batch grid alignment


function ResizeBatchPopup(tableSelector = "#BatchTable", modalSelector = "#IBatch") {

    const table = document.querySelector(tableSelector);
    const dialog = document.querySelector(modalSelector + " .modal-dialog");

    if (!table || !dialog) return;

    // Actual table width
    const tableWidth = table.offsetWidth;

    // Extra space for modal padding/borders
    const popupWidth = tableWidth + 40;

    dialog.style.setProperty("width", popupWidth + "px", "important");
    dialog.style.setProperty("max-width", popupWidth + "px", "important");
}


function GetTableWidth(container = "#ReceiptNoteBatchList") {

    const $table = $(container);
    let totalWidth = 0;

    $table.find("thead th").each(function (index) {

        let maxWidth = getTextWidth($(this).text().trim(), this);

        $table.find("tbody tr:visible").each(function () {

            const cell = this.cells[index];
            if (!cell) return;

            const control = $(cell).find("input, select, textarea")[0];

            let text = "";

            if (control) {
                if (control.tagName === "SELECT")
                    text = control.options[control.selectedIndex]?.text || "";
                else
                    text = control.value || "";

                maxWidth = Math.max(maxWidth, getTextWidth(text, control));
            } else {
                text = cell.textContent || "";
                maxWidth = Math.max(maxWidth, getTextWidth(text, cell));
            }
        });

        // Add some padding for the cell
        totalWidth += maxWidth + 23;
    });

    return totalWidth;
}
function ApplyBatchFieldWidths(container = "#ReceiptNoteBatchList") {

    const fields = [
        { cls: ".JORNI_BCH_WH_Name", min: 10, max: 25, align: "left" },
        { cls: ".JORNI_BCH_BatchDate", min: 10, max: 10, align: "center" },
        { cls: ".JORNI_BCH_BatchNo", min: 20, max: 50, align: "left" },
        { cls: ".JORNI_BCH_QtyAvailable", min: 10, max: 20, align: "center" },
        { cls: ".JORNI_BCH_QtyReserved", min: 10, max: 20, align: "center" },
        { cls: ".JORNI_BCH_QtyReceived", min: 10, max: 20, align: "center" },
        { cls: ".JORNI_BCH_BatchUnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".JORNI_BCH_BatchValue", min: 13, max: 25, align: "right" }
    ];


    const $container = $(container);

    fields.forEach(f => {

        const controls = $container.find(
            "#ReceiptNoteBatchTableBody > #ReceiptNoteBatchTemplateRow " + f.cls +
            ", #ReceiptNoteBatchTableBody > tr.ReceiptNoteBatchRow " + f.cls
        );

        if (!controls.length) return;

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
            } else if (this.tagName === "INPUT" || this.tagName === "TEXTAREA") {
                text = this.value || "";
            } else {
                text = this.textContent || "";
            }

            text = text.trim();

            requiredWidth = Math.max(requiredWidth, getTextWidth(text, this));
        });

        requiredWidth = Math.min(requiredWidth, maxWidth);

        if (
            f.cls === ".JORNI_BCH_BatchUnitPrice" ||
            f.cls === ".JORNI_BCH_BatchValue"
        ) {
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

            const th = $container.find("thead th").eq(td.cellIndex)[0];
            if (th) {
                th.style.setProperty("width", requiredWidth + "px", "important");
                th.style.setProperty("min-width", minWidth + "px", "important");
                th.style.setProperty("max-width", maxWidth + "px", "important");
                th.style.setProperty("text-align", f.align, "important");
                th.style.setProperty("padding", "2px", "important");

            }
        });
    });

    const tableWidth = GetTableWidth("#ReceiptNoteBatchList");
    SetReceiptNoteBatchModalWidth(tableWidth);
}
function SetReceiptNoteBatchModalWidth(tableWidth) {

    const dialog = document.querySelector("#ReceiptNoteBatchModal .modal-dialog");

    if (!dialog) return;

    // Add space for modal padding and borders
    const width = (tableWidth + 40) + "px";

    dialog.style.setProperty("width", width, "important");
    dialog.style.setProperty("max-width", width, "important");
    dialog.style.setProperty("height", "528px", "important");
    dialog.style.setProperty("max-height", "528px", "important");
}

function ApplyOtherBatchFieldWidths(container = "#ReceiptNoteOtherBatchList") {

    const fields = [
        { cls: ".JORNI_BCH_WH_Name", min: 15, max: 30, align: "left" },
        { cls: ".JORNI_BCH_BatchDate", min: 12, max: 12, align: "center" },
        { cls: ".JORNI_BCH_BatchNo", min: 20, max: 35, align: "left" },
        { cls: ".JORNI_BCH_AvailableQty", min: 11, max: 20, align: "center" },
        { cls: ".JORNI_BCH_BatchUnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".JORNI_BCH_BatchValue", min: 13, max: 25, align: "right" }
    ];

    const $container = $(container);

    fields.forEach(f => {

        const controls = $container.find(
            "#ReceiptNoteOtherBatchTableBody > #ReceiptNoteOtherBatchTemplateRow " + f.cls +
            ", #ReceiptNoteOtherBatchTableBody > tr.ReceiptNoteOtherBatchNewRow " + f.cls
        );

        if (!controls.length) return;

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

            text = text.trim();

            requiredWidth = Math.max(requiredWidth, getTextWidth(text, this));
        });

        requiredWidth = Math.min(requiredWidth, maxWidth);

        if (
            f.cls === ".JORNI_BCH_BatchUnitPrice" ||
            f.cls === ".JORNI_BCH_BatchValue"
        ) {
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

            const th = $container.find("thead th").eq(td.cellIndex)[0];
            if (th) {
                th.style.setProperty("width", requiredWidth + "px", "important");
                th.style.setProperty("min-width", minWidth + "px", "important");
                th.style.setProperty("max-width", maxWidth + "px", "important");
                th.style.setProperty("text-align", f.align, "important");
                th.style.setProperty("padding", "2px", "important");
            }
        });
    });

    const tableWidth = GetTableWidth("#ReceiptNoteOtherBatchList");
    SetReceiptNoteOtherBatchModalWidth(tableWidth);
}
function SetReceiptNoteOtherBatchModalWidth(tableWidth) {

    const dialog = document.querySelector("#ReceiptNoteOtherBatchModal .modal-dialog");

    if (!dialog) return;

    // Add space for modal padding and borders
    const width = (tableWidth + 40) + "px";

    dialog.style.setProperty("width", width, "important");
    dialog.style.setProperty("max-width", width, "important");
    dialog.style.setProperty("height", "528px", "important");
    dialog.style.setProperty("max-height", "528px", "important");
}


//#endregion 
//#region item grid alignment
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
function getTextWidth(text, element) {

    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");

    const style = window.getComputedStyle(element);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    return Math.ceil(ctx.measureText(text).width);
}

//#endregion


//#region COMMON FUNCTIONS

function DecimalIndianRupees(value) {
    if (value === "" || isNaN(value)) {
        return "0.00";
    }

    var formattedValue = parseFloat(value).toFixed(2);

    var parts = formattedValue.split(".");
    parts[0] = parts[0].replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");
    return parts.join(".");
}
function QtyDecimalRupees(value, decimalPlaces) {
    if (value === "" || isNaN(value)) return "0";

    var formattedValue = parseFloat(value).toFixed(decimalPlaces);
    var parts = formattedValue.split(".");
    if (parts.length > 1) {
        parts[1] = parts[1].replace(/0+$/, "");
        if (parts[1].length === 0) parts.pop();
    }

    parts[0] = parts[0].replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");

    return parts.join(".");
}
function UnitDecimalRupees(value, UnitDecimalPlaces) {
    if (value === "" || isNaN(value)) return "0";

    var num = parseFloat(value);

    var formattedValue = num.toFixed(UnitDecimalPlaces);
    var parts = formattedValue.split(".");

    if (parts.length > 1) {
        parts[1] = parts[1].replace(/0+$/, "");

        if (parts[1].length < 2) {
            parts[1] = parts[1].padEnd(2, "0");
        }
    } else {
        parts.push("00");
    }

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return parts.join(".");
}
//#endregion COMMON FUNCTIONS

function HighlightRow(rows, index) {

    rows.removeClass("current-row");

    if (index < 0 || index >= rows.length)
        return;

    $(rows[index]).addClass("current-row");

    rows[index].scrollIntoView({
        block: "nearest"
    });
}
const FREIGHT_PRS_NUMBER = 40008;
function AutoFit() {
    fitInputWidth("Header_JORNH_RN_No", 20, 25);
    fitInputWidth("Header_JORNH_MS_Number", 20, 30);
    fitInputWidth("Header_JORNH_JW_Vendor_Name", 40, 50);
    fitInputWidth("Header_JORNH_Currency_Number", 10, 10);
    fitInputWidth("Header_JORNH_WH_Number", 20, 25);
    fitInputWidth("Header_JORNH_Remarks", 40, 40);
}
// Header Freight Applicable toggle (show/hide item-grid freight columns)
function ToggleFreightColumns_DN() {
    let isFreight = $("#Header_Freight_Applicable").is(":checked");

    let freightCols = ".FreightApplicableHeader, .FreightApplicableCell, .FreightApplicableFooterCell, " +
        ".FromWHHeader, .FromWHCell, .FromWHFooterCell, " +
        ".ToWHHeader, .ToWHCell, .ToWHFooterCell, " +
        ".FreightSOHeader, .FreightSOCell, .FreightSOFooterCell";

    if (isFreight) {
        $(freightCols).show();
    } else {
        $(freightCols).hide();
    }
}

$(document).on("change", "#Header_Freight_Applicable", function () {
    ToggleFreightColumns_DN();

    // When turning Freight off at the header level, clear every row's
    // own Freight Applicable flag too — otherwise the row-level 'Yes'
    // persists in the DB and re-checks the header on next reload
    if (!$(this).is(":checked")) {
        $("#ItemTable tbody tr.NewRow").each(function () {
            let row = $(this);
            row.find(".JORNI_IsFreightApplicable").prop("checked", false);
            row.find(".JORNI_FromWH_Number").val("");
            row.find(".JORNI_ToWH_Number").val("");
            row.find(".JORNI_JOFRT_SVOH_Number").html('<option value="0"></option>');
            row.find(".JORNI_JOFRT_SVOI_Number_Row").val("0");
        });
    }
});

$(document).ready(function () {
    // Auto-check header toggle if any saved row already has Freight
    // Applicable checked — otherwise the freight columns stay hidden
    // even though the data needs them shown
    if ($("#ItemTable tbody tr.NewRow .JORNI_IsFreightApplicable:checked").length > 0) {
        $("#Header_Freight_Applicable").prop("checked", true);
    }

    // Footer Total Qty / Total Amount on page load
    calculateTotal();

    // Same look as Create after typing: Unit Price with 2 decimals, quantities with Indian grouping
    $("#ItemTable tbody tr.NewRow").each(function () {
        let row = $(this);

        let price = row.find(".JORNI_UnitPrice");
        if ($.trim(price.val()) !== "") {
            price.val(addComma(price.val(), "c"));
        }

        row.find(".JORNI_Qty, .JORNI_OriginalQty, .JORNI_UsedQty, .JORNI_Qty_Kgs").each(function () {
            if ($.trim($(this).val()) !== "") {
                $(this).val(addComma($(this).val(), "q"));
            }
        });
    });

    // Freight columns show/hide on load, based on header checkbox
    ToggleFreightColumns_DN();

    // rows already used downstream : Item / WH / UoM locked, delete blocked
    ApplyRowLocks();

    // loaded rows : fetch Item x UoM conversion (Qty Kgs shown from DB stays as it is)
    $("#ItemTable tbody tr.NewRow").each(function () {
        LoadUnitConversion($(this), false);
    });

    $("#ItemTable tbody tr.NewRow").each(function () {
        let row = $(this);
        if (row.find(".JORNI_IsJW_InvoiceApplicable").is(":checked")) {
            BindServiceOrder(
                row,
                $("#Header_JORNH_JW_Vendor_Number").val(),
                row.find(".JORNI_JPRS_Number").val(),
                row.find(".JORNI_Item_Number").val(),
                row.find(".JORNI_UoM_Number").val()
            );
        }
    });

    $("#ItemTable tbody tr.NewRow").each(function () {
        let row = $(this);
        if (row.find(".JORNI_IsFreightApplicable").is(":checked")) {
            BindFreightServiceOrder_DN(
                row,
                $("#Header_JORNH_JW_Vendor_Number").val(),
                row.find(".JORNI_UoM_Number").val(),
                row.find(".JORNI_FromWH_Number").val(),
                row.find(".JORNI_ToWH_Number").val()
            );
        }
    });
    //#region item code right pane search JORNI_Item_Code
    // Item_Code – Keydown (incl. Escape): moved to <script> block
    // Item_Code – Mousedown: moved to <script> block
    // Item_Code – Focus Out: moved to <script> block
    //#endregion
    //#region Header_JORNH_JW_Vendor_Name
    // JW_Vendor – Focus Out: moved to <script> block
    // JW_Vendor – Keydown: moved to <script> block
    //#endregion
    $(document).on("mousedown", ".search-results tbody tr", function () {

        let rows = $(".search-results tbody tr");

        // Remove previous current row
        rows.removeClass("current-row");

        // Make clicked row the current row
        $(this).addClass("current-row");
    });


    //#region batch grid alignment
    $(document).on("input change blur", "#ReceiptNoteBatchList input, #ReceiptNoteBatchList textarea, #ReceiptNoteBatchList select", function () {
        ApplyBatchFieldWidths("#ReceiptNoteBatchList");
    });
    ApplyBatchFieldWidths("#ReceiptNoteBatchList");
    $(document).on(
        "input change blur",
        "#ReceiptNoteOtherBatchList input, #ReceiptNoteOtherBatchList textarea, #ReceiptNoteOtherBatchList select",
        function () {
            ApplyOtherBatchFieldWidths("#ReceiptNoteOtherBatchList");
        }
    );

    ApplyOtherBatchFieldWidths("#ReceiptNoteOtherBatchList");
    //#endregion
    //#region item grid alignment


    $(document).on("input", "#ItemTable input", function () {
        ResizeColumns();
    });

    $(document).on("change", "#ItemTable select", function () {
        ResizeColumns();
    });
    //#endregion
    AutoFit();
    //#region Header AutoFit - KeyUp

    $(document).on("keyup change input",
        "#Header_JORNH_RN_No, #Header_JORNH_MS_Number, #Header_JORNH_JW_Vendor_Name, #Header_JORNH_Currency_Number, #Header_JORNH_WH_Number, #Header_JORNH_Remarks",
        function () {

            const widths = {
                Header_JORNH_RN_No: [20, 25],
                Header_JORNH_MS_Number: [20, 30],
                Header_JORNH_JW_Vendor_Name: [40, 50],
                Header_JORNH_Currency_Number: [10, 10],
                Header_JORNH_WH_Number: [20, 25],
                Header_JORNH_Remarks: [40, 40]
            };

            const [min, max] = widths[this.id];
            fitInputWidth(this, min, max);
        });

    //#endregion


    //#region JORNI_IsJW_InvoiceApplicable change

    $(document).on(
        "change",
        ".JORNI_IsJW_InvoiceApplicable, .JORNI_JPRS_Number, .JORNI_Item_Code, .JORNI_UoM_Number",
        function () {

            let row = $(this).closest("tr");

            if (row.find(".JORNI_IsJW_InvoiceApplicable").is(":checked")) {
                BindServiceOrder(
                    row,
                    $("#Header_JORNH_JW_Vendor_Number").val(),
                    row.find(".JORNI_JPRS_Number").val(),
                    row.find(".JORNI_Item_Number").val(),
                    row.find(".JORNI_UoM_Number").val()
                );
            } else {
                row.find(".JORNI_JOJWI_SVOH_Number").html('<option value="0"></option>');
            }
        }
    );

    // Freight Applicable change handler — auto-refresh Freight SO dropdown
    $(document).on(
        "change",
        ".JORNI_IsFreightApplicable, .JORNI_UoM_Number, .JORNI_FromWH_Number, .JORNI_ToWH_Number",
        function () {

            let row = $(this).closest("tr");

            if (row.find(".JORNI_IsFreightApplicable").is(":checked")) {
                BindFreightServiceOrder_DN(
                    row,
                    $("#Header_JORNH_JW_Vendor_Number").val(),
                    row.find(".JORNI_UoM_Number").val(),
                    row.find(".JORNI_FromWH_Number").val(),
                    row.find(".JORNI_ToWH_Number").val()
                );
            } else {
                row.find(".JORNI_JOFRT_SVOH_Number").html('<option value="0"></option>');
            }
        }
    );

    // Renamed vs Create's BindFreightServiceOrder to avoid clashing with
    // BindServiceOrder below (different signature, different endpoint)
    function BindFreightServiceOrder_DN(row, vendorId, uomNumber = null, fromWHNumber = null, toWHNumber = null) {

        let dropdown = row.find(".JORNI_JOFRT_SVOH_Number");
        // Same pattern as BindServiceOrder: the select only ever renders a
        // bare "0" option server-side, so capture the saved value from the
        // data attribute BEFORE clearing — this restore step was missing,
        // which is why the dropdown went blank after Update.
        let selectedValue = dropdown.attr("data-saved-value") || dropdown.val();

        dropdown.html('<option value="0"></option>');
        if (!vendorId) return;

        $.get("/joboutward/transactions/receipt-note/get-freight-service-order",
            { vendorId, uomNumber, fromWHNumber, toWHNumber, excludeJORNH: GetJORNH() },
            data => {
                // Reset again right here, immediately before appending —
                // guards against duplicate options from overlapping calls
                dropdown.html('<option value="0"></option>');

                $.each(data, (_, item) => {
                    if (!item.value || item.value === "" || item.value === "0") return;

                    dropdown.append(
                        `<option value="${item.value}" data-jisvoi="${item.jisvoiNumber || 0}">${item.text}</option>`
                    )
                });

                dropdown.val(selectedValue); // restore selection
            }
        );
    }

    function BindServiceOrder(row, vendorId, prsNumber = null, itemNumber = null, uomNumber = null) {

        let dropdown = row.find(".JORNI_JOJWI_SVOH_Number");
        // ViewBag.SON is empty server-side (pre-existing gap), so the
        // dropdown never has a real pre-selected value — read the saved
        // value from the data attribute set at Razor render time instead
        let selectedValue = dropdown.attr("data-saved-value") || dropdown.val();

        dropdown.html('<option value="0"></option>');

        if (!vendorId) return;

        $.get("/joboutward/transactions/receipt-note/get-service-order",
            { vendorId, prsNumber, itemNumber, uomNumber, excludeJORNH: GetJORNH() },
            function (data) {

                // Reset again right here, immediately before appending —
                // guards against duplicate options if this function was
                // triggered more than once for the same row before the
                // first AJAX call returned (race condition)
                dropdown.html('<option value="0"></option>');

                $.each(data, function (_, item) {
                    // NEW: skip entries with no real value/text — server
                    // occasionally returns a blank item, duplicating the
                    // default blank option.
                    if (!item.value || item.value === "" || item.value === "0") return;

                    dropdown.append(
                        `<option value="${item.value}" data-jisvoi="${item.jisvoiNumber || 0}">${item.text}</option>`
                    );
                });

                dropdown.val(selectedValue); // restore selection
            }
        );
    }

    function GetOtherRowsQtyForSO(jisvohNumber, currentRow) {
        let total = 0;

        $("#ItemTable tbody tr.NewRow").each(function () {
            let row = $(this);

            if (row.is(currentRow)) return;
            if (row.find(".JORNI_IsDeleted").val() === "1" ||
                row.find(".JORNI_IsDeleted").val() === "true") return;

            let rowSO = row.find(".JORNI_JOJWI_SVOH_Number").val() || 0;
            let rowFreightSO = row.find(".JORNI_JOFRT_SVOH_Number").val() || 0;

            if (rowSO == jisvohNumber || rowFreightSO == jisvohNumber) {
                total += parseFloat(removeComma(row.find(".JORNI_Qty").val())) || 0;
            }
        });

        return total;
    }

    // JW Invoice SO changed : remember the SO item id, then check the SO qty is not exceeded
    $(document).on("change", ".JORNI_JOJWI_SVOH_Number", function () {

        let row = $(this).closest("tr");
        let jisvohNumber = $(this).val();
        let prsNumber = row.find(".JORNI_JPRS_Number").val();
        let itemNumber = row.find(".JORNI_Item_Number").val();
        let uomNumber = row.find(".JORNI_UoM_Number").val();
        let originalQty = parseFloat(removeComma(row.find(".JORNI_Qty").val())) || 0;

        // SO item id comes with the option (data-jisvoi)
        let selectedJisvoi = $(this).find("option:selected").attr("data-jisvoi") || 0;
        row.find(".JORNI_JOJWI_SVOI_Number_Row").val(selectedJisvoi);

        if (!jisvohNumber || jisvohNumber === "0") return;

        $.get("/joboutward/transactions/receipt-note/check-received-qty-exceeded", {
            jisvohNumber,
            prsNumber,
            itemNumber,
            uomNumber,
            excludeJORNH: GetJORNH()
        }, function (res) {

            if (!res || res.length === 0) return;
            let receivedQty = parseFloat(res[0].receivedQty) || 0;
            let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;

            // RealReceivedQty = DB_ReceivedQty (other notes) + OtherRowsQty(SO)
            let otherRowsQty = GetOtherRowsQtyForSO(jisvohNumber, row);
            let realReceivedQty = receivedQty + otherRowsQty;

            if ((realReceivedQty + originalQty) > jisvoiQty) {
                alert("Qty Allowed: " + (jisvoiQty - realReceivedQty));
                setTimeout(function () {
                    row.find(".JORNI_Qty").focus().select();
                    row.find(".JORNI_JOJWI_SVOH_Number").val("0");
                    row.find(".JORNI_JOJWI_SVOI_Number_Row").val("0");
                }, 300);
            }
        });
    });

    // Qty typed : re-check both SOs of the row
    $(document).on("focusout", ".JORNI_Qty", function () {

        let row = $(this).closest("tr");
        let originalQty = parseFloat(removeComma(row.find(".JORNI_Qty").val())) || 0;

        let jisvohNumber = row.find(".JORNI_JOJWI_SVOH_Number").val();
        if (jisvohNumber && jisvohNumber !== "0") {
            $.get("/joboutward/transactions/receipt-note/check-received-qty-exceeded", {
                jisvohNumber,
                prsNumber: row.find(".JORNI_JPRS_Number").val(),
                itemNumber: row.find(".JORNI_Item_Number").val(),
                uomNumber: row.find(".JORNI_UoM_Number").val(),
                excludeJORNH: GetJORNH()
            }, function (res) {
                if (!res || res.length === 0) return;
                let receivedQty = parseFloat(res[0].receivedQty) || 0;
                let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;
                let realReceivedQty = receivedQty + GetOtherRowsQtyForSO(jisvohNumber, row);

                if ((realReceivedQty + originalQty) > jisvoiQty) {
                    alert("Qty Allowed: " + (jisvoiQty - realReceivedQty));
                    setTimeout(function () {
                        row.find(".JORNI_Qty").focus().select();
                        row.find(".JORNI_JOJWI_SVOH_Number").val("0");
                        row.find(".JORNI_JOJWI_SVOI_Number_Row").val("0");
                    }, 300);
                }
            });
        }

        let freightSO = row.find(".JORNI_JOFRT_SVOH_Number").val();
        if (freightSO && freightSO !== "0") {
            $.get("/joboutward/transactions/receipt-note/check-received-qty-exceeded-freight", {
                jisvohNumber: freightSO,
                uomNumber: row.find(".JORNI_UoM_Number").val(),
                fromWHNumber: row.find(".JORNI_FromWH_Number").val(),
                toWHNumber: row.find(".JORNI_ToWH_Number").val(),
                excludeJORNH: GetJORNH()
            }, function (res) {
                if (!res || res.length === 0) return;
                let receivedQty = parseFloat(res[0].receivedQty) || 0;
                let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;
                let realReceivedQty = receivedQty + GetOtherRowsQtyForSO(freightSO, row);

                if ((realReceivedQty + originalQty) > jisvoiQty) {
                    alert("Freight Qty Allowed: " + (jisvoiQty - realReceivedQty));
                    setTimeout(function () {
                        row.find(".JORNI_Qty").focus().select();
                        row.find(".JORNI_JOFRT_SVOH_Number").val("0");
                        row.find(".JORNI_JOFRT_SVOI_Number_Row").val("0");
                    }, 300);
                }
            });
        }
    });

    // Freight SO changed : remember the SO item id, then check the Freight SO qty
    $(document).on("change", ".JORNI_JOFRT_SVOH_Number", function () {

        let row = $(this).closest("tr");
        let freightSO = $(this).val();

        let selectedJisvoi = $(this).find("option:selected").attr("data-jisvoi") || 0;
        row.find(".JORNI_JOFRT_SVOI_Number_Row").val(selectedJisvoi);

        if (!freightSO || freightSO === "0") return;

        let originalQty = parseFloat(removeComma(row.find(".JORNI_Qty").val())) || 0;

        $.get("/joboutward/transactions/receipt-note/check-received-qty-exceeded-freight", {
            jisvohNumber: freightSO,
            uomNumber: row.find(".JORNI_UoM_Number").val(),
            fromWHNumber: row.find(".JORNI_FromWH_Number").val(),
            toWHNumber: row.find(".JORNI_ToWH_Number").val(),
            excludeJORNH: GetJORNH()
        }, function (res) {

            if (!res || res.length === 0) return;

            let receivedQty = parseFloat(res[0].receivedQty) || 0;
            let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;
            let realReceivedQty = receivedQty + GetOtherRowsQtyForSO(freightSO, row);

            if ((realReceivedQty + originalQty) > jisvoiQty) {
                alert("Freight Qty Allowed: " + (jisvoiQty - realReceivedQty));
                setTimeout(function () {
                    row.find(".JORNI_Qty").focus().select();
                    row.find(".JORNI_JOFRT_SVOH_Number").val("0");
                    row.find(".JORNI_JOFRT_SVOI_Number_Row").val("0");
                }, 300);
            }
        });
    });
    //#endregion

    //#region Unit Price Format

    //#region comma format on focusout
    $(document).on("focusout", ".JORNI_Qty, .JORNI_UnitPrice, .JORNI_Amount", function () {

        let type = $(this).hasClass("JORNI_Qty") ? "q" : "c";

        $(this).val(addComma($(this).val(), type));
    });
    //#endregion

    //#endregion

    //#region INPUT CLICK SELECT ALL

    $(document).on("click", "#ReceiptNoteBatchList input", function (e) {
        e.stopPropagation();

        let input = this;
        input.focus();

        setTimeout(function () {
            input.select();
        }, 10);
    });


    //#endregion

    //#region CLOSE DELIVERY NOTE BATCH MODAL

    $("#ReceiptNoteBatchClose").on("click", function () {

        // Get modal element
        var modalEl = document.getElementById("ReceiptNoteBatchModal");

        // Get existing bootstrap modal instance
        var modal = bootstrap.Modal.getInstance(modalEl);

        // Close modal
        if (modal) {
            modal.hide();
        }
    });

    //#endregion





    //#region Initialize Flatpickr
    InitializeGstFlatpickrs();

    function InitializeGstFlatpickrs() {
        $(".datepicker").flatpickr({
            dateFormat: "d-M-Y",   // 30-Apr-2026
            altInput: true,        // shows formatted date
            altFormat: "d-M-Y",   // display format
            allowInput: true,     // user can type manually
            defaultDate: new Date() // optional: today default
        });
    }
    //#endregion Initialize Flatpickr
    //#region onkeypress qty and unit
    $(document).on("keyup change", ".JORNI_Qty, .JORNI_UnitPrice", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat((row.find(".JORNI_Qty").val() || "0").replace(/,/g, "")) || 0;
        let price = parseFloat((row.find(".JORNI_UnitPrice").val() || "0").replace(/,/g, "")) || 0;

        let amount = qty * price;

        // Only set row amount (read-only field)
        row.find(".JORNI_Amount").val(formatIndianCurrency(amount));

        // Update footer totals separately
        calculateTotal();

        // Auto add row
        autoAddRow(row);
    });
    //#endregion onkeypress qty and unitS

    //#region validate Amend Qty against Invoiced Qty
    // RULE: Amend Qty cannot go below Invoiced Qty -> alert + reset to Invoiced Qty
    // (grid column JORNI_UsedQty holds the invoiced qty)
    $(document).on("change", ".JORNI_Qty", function () {

        let row = $(this).closest("tr");

        let amendQty = parseFloat(removeComma($(this).val())) || 0;
        let usedQty = parseFloat(removeComma(row.find(".JORNI_UsedQty").val())) || 0;

        if (usedQty > 0 && amendQty < usedQty) {
            alert("Amend Qty cannot be less than Invoiced Qty (" + usedQty + ")");
            $(this).val(addComma(usedQty, "q")).trigger("input").trigger("keyup");
        }
    });
    //#endregion validate Amend Qty against Invoiced Qty

    //#region auto add row function
    function autoAddRow(currentRow) {

        let qty = parseFloat(removeComma(currentRow.find(".JORNI_Qty").val())) || 0;
        let price = parseFloat(removeComma(currentRow.find(".JORNI_UnitPrice").val())) || 0;

        let itemCode = currentRow.find(".JORNI_Item_Code").val();
        let prsNo = currentRow.find(".JORNI_JPRS_Number").val();

        // validate current row
        let isRowValid =
            itemCode &&
            qty > 0 &&
            price > 0 &&
            prsNo &&
            prsNo !== "0";

        // allow only last row
        let isLastRow =
            currentRow.is("#ItemTable tbody tr.NewRow:last");

        if (isRowValid && isLastRow) {

            // prevent multiple empty rows
            let nextRow = currentRow.next("tr");

            if (nextRow.length === 0) {

                $("#EditAddRowButton").trigger("click");
            }
        }
    }
    //#endregion auto add row function

    //#region Edit add row item grid

    let editRowIndex = $("#ItemTable tbody tr.NewRow").length;

    $("#EditAddRowButton").on("click", function () {

        let isValid = true;

        $("#ItemTable tbody tr.NewRow:last")
            .find("input, select")
            .each(function () {

                let el = $(this);

                // SKIP DELETE FLAG
                if (el.hasClass("JORNI_IsDeleted"))
                    return;

                // ITEM CODE
                if (el.hasClass("JORNI_Item_Code")) {

                    if (!el.val()) {

                        isValid = false;

                        el.focus();

                        return false;
                    }
                }

                // QTY
                if (el.hasClass("JORNI_Qty")) {

                    if (!el.val() || parseFloat(removeComma(el.val())) <= 0) {

                        isValid = false;

                        el.focus();

                        return false;
                    }
                }

                // UNIT PRICE
                if (el.hasClass("JORNI_UnitPrice")) {

                    if (!el.val() || parseFloat(removeComma(el.val())) <= 0) {

                        isValid = false;

                        el.focus();

                        return false;
                    }
                }

                // PROCESS
                if (el.hasClass("JORNI_JPRS_Number")) {

                    if (!el.val() || el.val() === "0") {

                        isValid = false;

                        el.focus();

                        return false;
                    }
                }
            });

        // VALIDATION FAILED
        if (!isValid) {

            alert("Please fill required fields before adding new row.");

            return;
        }

        // CLONE LAST ROW
        let $newRow = $("#ItemTable tbody tr.NewRow:last").clone();

        $newRow.removeAttr("id");

        // CLEAR VALUES
        $newRow.find("input, select, textarea").each(function () {

            let el = $(this);

            // CHECKBOX
            if (el.attr("type") === "checkbox") {

                el.prop("checked", false);
            }

            // HIDDEN FIELDS
            if (
                el.hasClass("JORNI_Number") ||
                el.hasClass("JORNI_Item_Number")
            ) {

                el.val("");
            }

            // DELETE FLAG
            else if (el.hasClass("JORNI_IsDeleted")) {

                el.val("false");
            }

            // USED QTY - new row has nothing used yet
            else if (el.hasClass("JORNI_UsedQty")) {

                el.val("0");
            }

            // NORMAL INPUT / TEXTAREA
            else if (
                el.is("input") ||
                el.is("textarea")
            ) {

                el.val("");
            }

            // SELECT
            else if (el.is("select")) {

                el.prop("selectedIndex", 0);
            }

            // UPDATE NAME
            let name = el.attr("name");

            if (name) {

                let updatedName = name.replace(/\[\d+\]/, `[${editRowIndex}]`);

                el.attr("name", updatedName);
            }

            // UPDATE ID
            let id = el.attr("id");

            if (id) {

                let updatedId = id.replace(/_\d+__/, `_${editRowIndex}__`);

                el.attr("id", updatedId);
            }
        });

        // APPEND ROW
        $("#TableBody").append($newRow);

        editRowIndex++;

        // TOTAL
        calculateTotal();
        //#region item grid alignment
        setTimeout(function () {

            ApplyFieldWidths({
                fields: ItemTableFields,
                container: "#ItemTable",
                tempRow: "#TempRow",
                tableBody: "#TableBody",
                searchTable: "#tblsearch"
            });

        }, 200);
        //#endregion
    });

    //#endregion Edit add row item grid



    //#region remove checked rows
    $("#RemoveItemRowButton_Edit").on("click", function () {

        let checkedRows =
            $("#ItemTable tbody tr.NewRow:visible")
                .has(".CheckItem:checked");

        // minimum one row should exist
        let totalVisibleRows =
            $("#ItemTable tbody tr.NewRow:visible").length;

        if (checkedRows.length === 0) {

            alert("Please select row.");
            return;
        }

        if ((totalVisibleRows - checkedRows.length) < 0) {

            alert("At least one row required.");
            return;
        }
        if (checkedRows.length > 1) {
            alert("Please select only one row");
            return false;
        }
        if (IsRowLocked(checkedRows.first())) {
            alert("This row is already invoiced (Invoiced Qty > 0). It cannot be deleted.");
            return false;
        }

        checkedRows.each(function () {

            let currentRow = $(this);

            // visible row index
            let ItemGridindex =
                currentRow.index(
                    "#ItemTable tbody tr.NewRow:visible"
                ) + 1;
            let currentRow_temp = $(this).closest("tr");



            // Get values from current row
            let JORNI_Number = currentRow_temp.find(".JORNI_Number").val();

            let JORNH_Number =
                GetJORNH();

            let DBCH_Item_Number =
                currentRow_temp.find(".JORNI_Item_Number").val();

            let DBCH_DBCH_Number =
                parseInt(currentRow_temp.find(".JORNI_DBCH_Number").val()) || 0;


            deletedRows.push({
                ItemGridindex: ItemGridindex,
                JORNI_Number: parseInt(JORNI_Number) || 0,
                JORNH_Number: parseInt(JORNH_Number) || 0,
                DBCH_Item_Number: parseInt(DBCH_Item_Number) || 0,
                DBCH_DBCH_Number: DBCH_DBCH_Number
            });

            console.log(deletedRows);




            $.ajax({

                url: '/joboutward/transactions/receipt-note/delete-temp-batch-row',

                type: 'POST',

                data: { index: ItemGridindex },

                success: function (response) {
                    // remove selected row
                    currentRow.remove();
                    calculateTotal();
                    SaveTempBatch_Edit();
                },

                error: function (xhr) {

                    console.log(xhr.responseText);
                }
            });

        });



    });
    //#endregion remove checked rows

    //#region JORNI_IsJW_InvoiceApplicable
    $("#ItemTable .JORNI_IsJW_InvoiceApplicable").each(function () {
        $(this).trigger("change");
    });
    //#endregion JORNI_IsJW_InvoiceApplicable
});


let ReceiptNoteBatchList_Edit = [];
let ReceiptNoteItemBatchList_Edit = [];
let CurrentBatchItemRow_Edit = null;
let CurrentItemGridRowIndex = 0;

//#region Calculate Total
function CalculateQtyKgDN(row) {
    let qty = parseFloat(removeComma(row.find(".JORNI_Qty").val() || "0")) || 0;
    let uomText = row.find(".JORNI_UoM_Number option:selected").text().trim().toUpperCase();

    let qtyKg;
    if (uomText === "KGS") {
        qtyKg = qty * 1;
    } else {
        let fromQty = parseFloat(row.find(".FromQty").val()) || 0;
        let toQty = parseFloat(row.find(".ToQty").val()) || 0;
        qtyKg = fromQty > 0 ? (qty * (toQty / fromQty)) : 0;
    }

    row.find(".JORNI_Qty_Kgs").val(qtyKg === 0 ? "" : addComma(qtyKg, "c"));
    calculateTotal();
}

// fetch the Item x UoM conversion for a row (recalc = true -> refresh Qty Kgs too)
function LoadUnitConversion(row, recalc) {
    let itemNumber = row.find(".JORNI_Item_Number").val();
    let fromUnit = row.find(".JORNI_UoM_Number").val();
    if (!itemNumber || !fromUnit) return;

    $.ajax({
        url: '/receiptnote/transactions/receiptnote/get-item-unit-conversion',
        type: 'GET',
        data: { itemNumber: itemNumber, fromUnit: fromUnit },
        success: function (res) {
            row.find(".FromQty").val(res.fromQty);
            row.find(".ToQty").val(res.toQty);
            if (recalc) CalculateQtyKgDN(row);
        }
    });
}

$(document).on("input", ".JORNI_Qty", function () {
    CalculateQtyKgDN($(this).closest("tr"));
});

$(document).on("change", ".JORNI_UoM_Number", function () {
    LoadUnitConversion($(this).closest("tr"), true);
});

function calculateTotal() {

    let totalQtyKgs = 0;
    let totalQty = 0;
    let totalAmount = 0;
    let totalOriginalQty = 0;
    let totalUsedQty = 0;

    // Loop through each row (only active rows)
    $("#ItemTable tbody tr.NewRow").each(function () {

        let row = $(this);

        // Skip deleted rows
        if (row.find(".JORNI_IsDeleted").val() === "1" ||
            row.find(".JORNI_IsDeleted").val() === "true") {
            return;
        }


        // Original / Used Qty (read-only columns)
        let originalQty = parseFloat(removeComma(row.find(".JORNI_OriginalQty").val())) || 0;
        let usedQty = parseFloat(removeComma(row.find(".JORNI_UsedQty").val())) || 0;
        // Get Qty
        let qty = parseFloat(removeComma(row.find(".JORNI_Qty").val())) || 0;

        // Get Unit Price
        let unitPrice = parseFloat(removeComma(row.find(".JORNI_UnitPrice").val())) || 0;

        // Row Amount = Qty × Unit Price
        let amount = qty * unitPrice;

        // Set row amount field
        row.find(".JORNI_Amount").val(addComma(amount, "c"));

        // Add to totals
        totalQty += qty;
        totalQtyKgs += parseFloat(removeComma(row.find(".JORNI_Qty_Kgs").val())) || 0;
        totalOriginalQty += originalQty;
        totalUsedQty += usedQty;
        totalAmount += amount;
    });

    // Footer totals
    $("#TotalOriginalQty").val(addComma(totalOriginalQty, "q"));
    $("#TotalUsedQty").val(addComma(totalUsedQty, "q"));
    $("#TotalQty").val(addComma(totalQty, "q"));
    $("#TotalQtyKgs").val(addComma(totalQtyKgs, "c"));
    $("#TotalAmount").val(addComma(totalAmount, "c"));
}
//#endregion Calculate Total

//#region Edit Vendor Search Functions
//#region vendor Search Functions
//#region JW Vendor Search Functions

function OnBuyerSelectCall(inputElement) {

    OnBuyerSelect(inputElement, "#RightPane", ".buyer-search-results");
}
function OnBuyerInput(inputElement) {
    SearchBuyer(inputElement);
}


function OnBuyerInput(inputElement) {

    // User is only selecting text
    if (inputElement.selectionStart !== inputElement.selectionEnd) {
        return;
    }

    SearchBuyer(inputElement);
}

function SearchBuyer(inputElement) {

    var JWVendor = inputElement.value;
    var SIHDate = $("#Header_JORNH_RN_Date").val();
    var resultsDiv = $("#RightPane").find(".buyer-search-results");

    if (buyerSearchXHR) {
        buyerSearchXHR.abort();
    }

    buyerSearchXHR = $.ajax({
        url: '/joboutward/transactions/receipt-note/vendor',
        type: 'GET',
        data: {
            Vendor: JWVendor,
            RNDate: SIHDate
        },
        success: function (data) {

            resultsDiv.empty();
            $("#BuyerMessage").hide().text("");
            if (data && data.length > 0) {

                $("#RightPane").addClass("show");   // <-- Add this line
                resultsDiv.show();
                let selectedIndex = -1;
                var table = $(
                    '<div class="card-body modal-content batchPopup p-0" style="z-index:999;">' +
                    '<table class="table table-bordered table-hover table-fixed table-grid mb-0 w-100">' +
                    '<thead>' +
                    '<tr class="table-info">' +
                    '<th>JW Vendor Name</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody></tbody>' +
                    '</table>' +
                    '</div>'
                );

                $.each(data, function (i, cust) {

                    var row = $("<tr></tr>").css("height", "24px");
                    row.data("vendor", cust);
                    row.append("<td>" + VendorVal(cust, VENDOR_KEYS.name) + "</td>");


                    table.find("tbody").append(row);

                    // Removed: duplicate row "click" handler (raced
                    // with the "mousedown" handler below; extra field
                    // population merged into it, with the mousedown
                    // handler's Currency_Number-passed-twice bug fixed
                    // to Currency_Name).
                });


                table.find("tbody").on("mousedown", "tr", function (e) {

                    e.preventDefault();

                    const clickedVendor = $(this).data("vendor");
                    isMouseSelectingBuyer = true;

                    $(inputElement).val(VendorVal(clickedVendor, VENDOR_KEYS.name));

                    $("#Header_JORNH_JW_Vendor_Number")
                        .val(VendorVal(clickedVendor, VENDOR_KEYS.number))
                        .trigger("change");

                    // auto-fill Currency and Warehouse from the vendor master
                    let cur = VendorVal(clickedVendor, VENDOR_KEYS.currency);
                    if (cur) $("#Header_JORNH_Currency_Number").val(cur).trigger("change");

                    let wh = VendorVal(clickedVendor, VENDOR_KEYS.warehouse);
                    if (wh) $("#Header_JORNH_WH_Number").val(wh).trigger("change");

                    $("#RightPane").removeClass("show");
                    $("#RightPane .buyer-search-results").hide();

                    setTimeout(function () {
                        isMouseSelectingBuyer = false;
                    }, 100);
                });

                resultsDiv.append(table);

                resultsDiv.append(`
<div id="BuyerMessage"
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

                // Store all rows
                let rows = resultsDiv.find("tbody tr");

                // Clear previous styles
                rows.removeClass("match-row current-row");

                // No row selected initially
                $(inputElement).removeData("selectedIndex");

                let searchText = JWVendor.trim().toLowerCase();

                let firstMatch = -1;
                let lastMatch = -1;

                rows.each(function (i) {

                    let vendor = $(this).find("td:first").text().trim().toLowerCase();

                    if (searchText !== "" && vendor.startsWith(searchText)) {

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
                resultsDiv.append(GetBuyerEmptyView());

                $("#RightPane").addClass("show");
                $("#RightPane .buyer-search-results").show();

            }
        },
        error: function (xhr, status) {

            if (status === "abort") {
                return;
            }
            resultsDiv.text("Error loading data.").show();
        }
    });
}

// Hide search when clicking outside

// Hide search when clicking outside

//#endregion vendor Search Functions

//#endregion Edit Vendor Search Functions

//#region Edit item grid fetch item details

function OnEditInputItem(inputElement) {

    if (inputElement.selectionStart !== inputElement.selectionEnd) {
        return;
    }

    SearchEditItemJORNI(inputElement);
}

function OnEditFocusItem(inputElement) {

    if (isSelectingItem) {
        return;
    }

    // Guard against a feedback loop: HandleSearchSelection's own
    // input.focus() (to keep a message/empty-view visible) can
    // synchronously re-fire this handler.
    let resultsDiv = $("#RightPane_Item").find(".search-results");
    let messageVisible = $("#ItemMessage").is(":visible") ||
        $("#ItemEmptyView").is(":visible");
    let alreadyOpen = $("#RightPane_Item").hasClass("show") &&
        (resultsDiv.find("tbody tr").length > 0 || messageVisible);

    if (alreadyOpen) {
        return;
    }

    SearchEditItemJORNI(inputElement);
}
var ItemChanged = 0;

function SearchEditItemJORNI(inputElement) {

    let itemCode = inputElement.value;
    let row = $(inputElement).closest("tr");
    let JORNI_Number = row.find(".JORNI_Number").val();
    let JORNH_Number = GetJORNH();
    let DBCH_Item_Number = row.find(".JORNI_Item_Number").val();
    let DBCH_DBCH_Number = row.find(".JORNI_DBCH_Number").val();

    let resultsDiv = $("#RightPane_Item").find(".search-results");
    let ItemGridindex =
        $("#TableBody tr.NewRow:visible")
            .index(row) + 1;


    let material = $("#Header_JORNH_MS_Number").val();


    if (!material) return;

    if (itemSearchXHR) {
        itemSearchXHR.abort();
    }

    itemSearchXHR = $.ajax({
        url: '/joboutward/transactions/receipt-note/item',
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
                    <div class="card-body batchPopup modal-content p-0 table-responsive">
                        <table class="table table-bordered table-hover table-fixed mb-0 table-grid" id="tblsearch">
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

                data.forEach(function (item) {

                    let tr = $(`
                        <tr>
                            <td>${item.itemCode}</td>
                            <td>${item.itemDescription}</td>
                           
                        </tr>
                    `);
                    tr.css("height", "24px");
                    // CLICK SELECT
                    // Changed from "click" to "mousedown" so that the
                    // common HandleSearchSelection's rows.trigger("mousedown")
                    // (used for Tab/Enter auto-select and "Too many
                    // choices") actually fires row selection here.
                    tr.on("mousedown", function (e) {

                        e.preventDefault();

                        isSelectingItem = true;

                        $("#ItemMessage").hide().text("");
                        $("#ItemTable .CheckItem").prop("checked", false);
                        row.find(".CheckItem").prop("checked", true);
                        // ✔ Visible field
                        row.find(".JORNI_Item_Code").val(item.itemCode);

                        // ✔ Hidden fields
                        row.find(".JORNI_Item_Number").val(item.itemNumber);
                        //    row.find(".JORNI_Number").val(item.itemNumber);

                        // ✔ Fill details
                        row.find(".JORNI_Item_Description").val(item.itemDescription);
                        row.find(".JORNI_OuterDia").val(item.outerDia);
                        row.find(".JORNI_Thickness").val(item.thickness);
                        row.find(".JORNI_Length").val(item.length);
                                        row.find(".JORNI_MaterialGrade").val(item.materialGrade);
                        row.find(".JORNI_ItemGroup").val(item.itemGroup);

                        // ✔ Dropdowns
                        row.find(".JORNI_UoM_Number").val(item.uoM);
                        row.find(".JORNI_WH_Number").val(item.saleWarehouse);

                        // ✔ Move to Qty
                        let qtyInput = row.find(".JORNI_Qty");
                        let qtyUnitprice = row.find(".JORNI_UnitPrice");
                        qtyInput.focus();

                        setTimeout(function () {
                            // Item changed on a row : its batch rows are cleared, user picks again
                            EditItemRowTempTable(item.itemNumber, item.saleWarehouse, JORNI_Number, JORNH_Number, ItemGridindex);
                            LoadUnitConversion(row, true);

                        }, 100);



                        setTimeout(function () {
                            qtyInput.select();


                            ItemChanged = 1;
                            isSelectingItem = false;
                        }, 100);

                        // ✔ Decimal format (if needed)
                        let decimalPlaces = item.decimalPlaces || 2;

                        qtyInput.val(formatIndianQty(removeComma(qtyInput.val())));
                        qtyUnitprice.val(formatIndianCurrency(removeComma(qtyUnitprice.val())));
                        //#region item grid alignment
                        setTimeout(function () {

                            ApplyFieldWidths({
                                fields: ItemTableFields,
                                container: "#ItemTable",
                                tempRow: "#TempRow",
                                tableBody: "#TableBody",
                                searchTable: "#tblsearch"
                            });
                        
                            // on screen when tabbing/entering into the next line.
                            resultsDiv.empty();
                            resultsDiv.hide();
                            $("#RightPane_Item").removeClass("show");
                        }, 200);
                        //#endregion

                    });

                    table.find("tbody").append(tr);
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

                // Store all rows
                let rows = resultsDiv.find("tbody tr");

                // Clear previous styles
                rows.removeClass("match-row current-row");

                // No row selected initially
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
                //resultsDiv.append(closeButton);


            } else {
                resultsDiv.append(GetItemEmptyView());

                $("#RightPane_Item").addClass("show");
                $("#RightPane_Item .search-results").show();
            }
        },
        error: function (xhr, status) {

            if (status === "abort") {
                return;
            }
            resultsDiv.text("Error loading data.");
            resultsDiv.show();
        }
    });
}


//#endregion Edit item grid fetch item details

//#region Edit grid
// Item / Warehouse changed on a row (existing or new) -> its temp batch rows are cleared
function EditItemRowTempTable(DBCH_Item_Number, n_warehouse, JORNI_Number, JORNH_Number, DBCH_Index) {

    $.ajax({

        url: '/joboutward/transactions/receipt-note/temp-batch-change-item',

        type: 'POST',

        data: {
            JORNI_Number: parseInt(JORNI_Number) || 0,
            JORNH_Number: parseInt(JORNH_Number) || GetJORNH(),
            DBCH_Index: parseInt(DBCH_Index) || 0
        },

        success: function (response) {

            calculateTotal();

        },

        error: function (xhr) {

            console.log(xhr.responseText);
        }
    });
}

//#endregion



//#region SHOW BATCH

$(document).on("click", ".OpenBatchPopup", function (e) {

    e.preventDefault();
    //console.log("ROW ID :", rowID);


    let checkedCheckbox = $(".CheckItem:checked");

    //#region VALIDATION

    if (checkedCheckbox.length <= 0) {
        alert("Please select at least one row");
        return false;
    }

    if (checkedCheckbox.length > 1) {
        alert("Please select only one row");
        return false;
    }

    //#endregion

    let selectedRow = checkedCheckbox.closest("tr");

    CurrentBatchItemRow_Edit = selectedRow;


    //let ItemGridindex =
    //    CurrentBatchItemRow_Edit.closest("tbody")
    //        .find("tr")
    //        .index(CurrentBatchItemRow_Edit) + 1;

    //CurrentItemGridRowIndex = ItemGridindex;
    let ItemGridindex =
        checkedCheckbox
            .closest("tr")
            .index("#ItemTable tbody tr.NewRow:visible") + 1;

    //#region GET VALUES

    let fromWarehouse =
        selectedRow.find(".JORNI_WH_Number").val();

    let lineItemNumber =
        selectedRow.find(".JORNI_Item_Number").val();
    let jIDNI_Number =
        selectedRow.find(".JORNI_Number").val();
    G_JINI_Number = jIDNI_Number;


    let invoiceQty =
        selectedRow.find(".JORNI_Qty").val();

    $("#BatchPopupQty").text(invoiceQty);
    let p_JORNH_Number =
        GetJORNH();
    G_JINH_Number = p_JORNH_Number;

    //#endregion


    // CLEAR TEMP ARRAY
    ReceiptNoteBatchList_Edit = [];

    // CLEAR OLD ROWS
    $("#ReceiptNoteBatchTableBody")
        .find(".ReceiptNoteBatchRow")
        .remove();



    //#region AJAX

    $.ajax({

        url: "/joboutward/transactions/receipt-note/get-batch-details",

        type: "GET",

        data: {
            FromWarehouse: fromWarehouse,
            LineItem_Number: lineItemNumber,
            ItemGridIndex: ItemGridindex
        },

        success: function (response) {

            console.log(response);

            ReceiptNoteBatchList_Edit = [];

            if (response && response.length > 0) {

                $.each(response, function (i, batch) {

                    ReceiptNoteBatchList_Edit.push({

                        JORNI_BCH_WH_Number: batch.fromWarehouse,
                        JORNI_BCH_JORNI_Number: lineItemNumber,
                        JORNI_BCH_WH_Name: batch.wareHouseCode,
                        JORNI_BCH_BatchDate: batch.batchDate,
                        JORNI_BCH_BatchNo: batch.batchNo,
                        JORNI_BCH_QtyAvailable: batch.availableQty,
                        JORNI_BCH_QtyReserved: batch.reservedQty,
                        JORNI_BCH_QtyReceived: batch.receivedQty,
                        JORNI_BCH_UsedQty: batch.usedQty || 0,
                        JORNI_BCH_BatchUnitPrice: batch.batchUnitPrice,
                        JORNI_BCH_BatchValue: batch.batchValue,
                        JORNI_BCH_Number: batch.lineBatch_Number,
                        JORNI_Number: G_JINI_Number,
                        JORNH_Number: G_JINH_Number,
                        RefBatch_Number: batch.refBatch_Number
                    });

                });

            } else {

                ReceiptNoteBatchList_Edit.push({});
            }

            BindReceiptNoteBatchTable();
            BindOtherBatch(fromWarehouse, lineItemNumber, ItemGridindex);

            // NEW: BindReceiptNoteBatchTable() only appends rows — it never
            // applied alignment/widths, so Qty Available / Qty Reserved /
            // Delivered Qty stayed right-aligned (Bootstrap's text-end) until
            // the user typed into a field and triggered the delegated
            // input/change/blur handler further down.
            ApplyBatchFieldWidths("#ReceiptNoteBatchList");

            $("#ReceiptNoteBatchModal").modal("show");
        },
        error: function (xhr, status, error) {

            console.log("Status:", status);
            console.log("Error:", error);
            console.log("Response Text:", xhr.responseText);

            alert("Error loading batch details");
        }

    });

    //#endregion


});

$("#ReceiptNoteBatchModal").on("shown.bs.modal", function () {

    setTimeout(function () {

        let input = document.querySelector(
            '#ReceiptNoteBatchTableBody tr:not([style*="display:none"]) .JORNI_BCH_QtyReceived'
        );

        if (input) {
            input.focus();
            input.select();
        }

    }, 200);

});

//#endregion SHOW BATCH



function BindReceiptNoteBatchTable() {

    $("#ReceiptNoteBatchTableBody").find(".ReceiptNoteBatchRow").remove();

    $.each(ReceiptNoteBatchList_Edit, function (index, data) {

        // Check required values
        if (
            data.JORNI_BCH_WH_Number != undefined &&
            data.JORNI_BCH_JORNI_Number != undefined &&
            data.JORNI_BCH_WH_Name != undefined &&
            data.JORNI_BCH_BatchDate != undefined &&
            data.JORNI_BCH_BatchNo != undefined &&
            data.JORNI_BCH_QtyAvailable != undefined
        ) {

            let row =
                $("#ReceiptNoteBatchTemplateRow")
                    .clone()
                    .removeAttr("id")
                    .removeAttr("style")
                    .show()
                    .addClass("ReceiptNoteBatchRow");

            row.find(".JORNI_BCH_WH_Number")
                .val(data.JORNI_BCH_WH_Number);

            row.find(".JORNI_BCH_JORNI_Number")
                .val(data.JORNI_BCH_JORNI_Number);

            row.find(".JORNI_BCH_WH_Name")
                .val(data.JORNI_BCH_WH_Name);

            row.find(".JORNI_BCH_BatchDate")
                .val(data.JORNI_BCH_BatchDate);

            row.find(".JORNI_BCH_BatchNo")
                .val(data.JORNI_BCH_BatchNo);
            row.find(".JORNI_BCH_Number")
                .val(data.JORNI_BCH_Number);

            row.find(".JORNI_BCH_QtyAvailable").val(addComma(data.JORNI_BCH_QtyAvailable, "q"));
            row.find(".JORNI_BCH_QtyReserved").val(addComma(data.JORNI_BCH_QtyReserved, "q"));
            row.find(".JORNI_BCH_QtyReceived").val(addComma(data.JORNI_BCH_QtyReceived, "q"));
            row.find(".JORNI_BCH_UsedQty").val(addComma(data.JORNI_BCH_UsedQty || 0, "q"));
            row.find(".JORNI_BCH_BatchUnitPrice").val(addComma(data.JORNI_BCH_BatchUnitPrice, "c"));
            row.find(".JORNI_BCH_BatchValue").val(addComma(data.JORNI_BCH_BatchValue, "c"));

            row.find(".JORNI_Number")
                .val(data.JORNI_Number);

            row.find(".JORNH_Number")
                .val(data.JORNH_Number);
            row.find(".RefBatch_Number")
                .val(data.RefBatch_Number);

            $("#ReceiptNoteBatchTableBody").append(row);

        }

    });

    CalculateBatchFooter();
}

//#region FOOTER TOTAL
function CalculateBatchFooter() {

    let totalQty = 0;
    let totalValue = 0;
    let totalAvailableQty = 0;

    $("#ReceiptNoteBatchTableBody tr.ReceiptNoteBatchRow")
        .each(function () {

            totalQty += parseFloat(removeComma($(this).find(".JORNI_BCH_QtyReceived").val())) || 0;
            totalAvailableQty += parseFloat(removeComma($(this).find(".JORNI_BCH_QtyAvailable").val())) || 0;
            totalValue += parseFloat(removeComma($(this).find(".JORNI_BCH_BatchValue").val())) || 0;
        });
    $("#TotalBatchQty").val(addComma(totalQty, "q"));
    $("#TotalBatchValue").val(addComma(totalValue, "c"));
    $("#TotalAvailableQty").val(addComma(totalAvailableQty, "q"));
}
//#endregion

function BindReceiptNoteOtherBatchTable(response) {

    let tbody = $("#ReceiptNoteOtherBatchTableBody");

    // Clear all rows except template
    tbody.find(".ReceiptNoteOtherBatchRow").remove();

    $.each(response, function (index, data) {

        let row =
            $("#ReceiptNoteOtherBatchTemplateRow")
                .clone()
                .removeAttr("id")
                .removeAttr("style")
                .show()
                .addClass("ReceiptNoteOtherBatchRow");

        row.find(".JORNI_BCH_Number")
            .val(data.lineBatch_Number);

        row.find(".JORNI_BCH_WH_Number")
            .val(data.fromWarehouse);

        row.find(".JORNI_BCH_WH_Name")
            .val(data.wareHouseCode);

        row.find(".JORNI_BCH_BatchDate")
            .val(data.batchDate);

        row.find(".JORNI_BCH_BatchNo")
            .val(data.batchNo);

        row.find(".JORNI_BCH_AvailableQty")
            .val(addComma(data.availableQty, "q"));

        row.find(".JORNI_BCH_BatchUnitPrice")
            .val(data.batchUnitPrice);

        row.find(".JORNI_BCH_BatchValue")
            .val(data.batchValue);

        tbody.append(row);

    });

    // CalculateOtherBatchFooter();
}


function BindOtherBatch(fromWarehouse, lineItemNumber, ItemGridindex) {
    //#region AJAX

    $.ajax({

        url: "/joboutward/transactions/receipt-note/get-other-batch-details",

        type: "GET",

        data: {
            FromWarehouse: fromWarehouse,
            LineItem_Number: lineItemNumber,
            ItemGridIndex: ItemGridindex
        },

        success: function (response) {

            console.log(response);
            BindReceiptNoteOtherBatchTable(response);

        },

        error: function (xhr, status, error) {

            console.log("Status:", status);
            console.log("Error:", error);
            console.log("Response Text:", xhr.responseText);

            alert("Error loading batch details");
        }

    });

    //#endregion
}


$(document).on('input', ".JORNI_BCH_QtyReceived", function (event) {

    var row = $(this).closest("tr");

    var QtyAvailable =
        parseFloat(removeComma(row.find(".JORNI_BCH_QtyAvailable").val())) || 0;

    var QtyReserved =
        parseFloat(removeComma(row.find(".JORNI_BCH_QtyReserved").val())) || 0;

    var QtyInvoiceInput = row.find(".JORNI_BCH_QtyReceived");

    var QtyInvoice =
        parseFloat(removeComma(QtyInvoiceInput.val())) || 0;

    var UsedQty =
        parseFloat(removeComma(row.find(".JORNI_BCH_UsedQty").val())) || 0;

    var BalanceQty = QtyAvailable - QtyReserved;

    if (QtyInvoice > BalanceQty) {

        alert(
            "Received Qty (" + QtyInvoice +
            ") cannot be greater than Available Qty - Reserved Qty (" + BalanceQty + ").\n" +
            "It will be reset to maximum allowed: " + BalanceQty
        );

        QtyInvoiceInput.val(addComma(BalanceQty, "q"));
        QtyInvoice = BalanceQty;

        QtyInvoiceInput.focus().select();
    }

    CalculateBatchFooter();
});


//#region BATCH VALUE CALCULATION (Edit) - Value = Delivered Qty x Unit Price, same as Create
$(document).on(
    "input",
    ".JORNI_BCH_QtyReceived, .JORNI_BCH_BatchUnitPrice",
    function () {
        let row = $(this).closest("tr");
        let qty = parseFloat(removeComma(row.find(".JORNI_BCH_QtyReceived").val())) || 0;
        let price = parseFloat(removeComma(row.find(".JORNI_BCH_BatchUnitPrice").val())) || 0;
        row.find(".JORNI_BCH_BatchValue").val(addComma(qty * price, "c"));
        CalculateBatchFooter();
    });
//#endregion

//#region Batch Received Qty cannot go below Used Qty (checked when leaving the box)
$(document).on("focusout", ".JORNI_BCH_QtyReceived", function () {
    let row = $(this).closest("tr");
    let used = parseFloat(removeComma(row.find(".JORNI_BCH_UsedQty").val())) || 0;
    let qty = parseFloat(removeComma($(this).val())) || 0;
    if (used > 0 && qty < used) {
        alert("Received Qty cannot be less than Used Qty (" + used + ")");
        $(this).val(addComma(used, "q"));
        row.find(".JORNI_BCH_BatchValue").val(addComma(
            used * (parseFloat(removeComma(row.find(".JORNI_BCH_BatchUnitPrice").val())) || 0), "c"));
        CalculateBatchFooter();
    }
});
//#endregion

//#region VALIDATE EXISTING BATCH ROWS

function ValidateExistingBatchRows_Edit() {

    let isValid = true;

    $("#ReceiptNoteBatchTableBody tr.ReceiptNoteBatchRow")
        .each(function () {

            let row = $(this);

            row.removeClass("table-danger");

            let batchNo =
                row.find(".JORNI_BCH_BatchNo")
                    .val()
                    ?.trim();

            let qty =
                row.find(".JORNI_BCH_QtyReceived")
                    .val()
                    ?.trim();

            let price =
                row.find(".JORNI_BCH_BatchUnitPrice")
                    .val()
                    ?.trim();

            if (
                batchNo == "" ||
                qty == "" ||
                qty == "0" ||
                price == "" ||
                price == "0"
            ) {

                row.addClass("table-danger");

                isValid = false;

                return false;
            }

        });

    return isValid;
}

//#endregion


//#region BATCH QTY = ITEM QTY VALIDATION
function ValidateBatchQty_Edit() {

    let InvoiceQty =
        parseFloat(removeComma($("#BatchPopupQty").text())) || 0;

    let BatchQty = $("#ReceiptNoteBatchTableBody tr")
        .not("#ReceiptNoteBatchTemplateRow")
        .map(function () {

            return parseFloat(
                removeComma(
                    $(this).find(".JORNI_BCH_QtyReceived").val()
                )
            ) || 0;

        }).get()
        .reduce((sum, qty) => sum + qty, 0);

    console.log("InvoiceQty :", InvoiceQty);
    console.log("BatchQty :", BatchQty);

    if (InvoiceQty !== BatchQty) {

        alert("Qty Mismatch !");

        CloseReceiptNoteBatchModal_Edit();


        return false;
    }

    return true;
}
//#endregion

//#region closepop
function CloseReceiptNoteBatchModal_Edit() {

    const modal = $("#ReceiptNoteBatchModal");

    modal.one("hidden.bs.modal", function () {

        setTimeout(function () {
            FocusItemGridQty_Edit();
        }, 500);

    });

    modal.modal("hide");
}
//#endregion

//#region  focus item grid on qty mismatch
function FocusItemGridQty_Edit() {

    if (!CurrentBatchItemRow_Edit)
        return;

    let rowID =
        CurrentBatchItemRow_Edit.attr("data-rowid");

    let QtyInput =
        $("#TableBody")
            .find(`tr[data-rowid='${rowID}']`)
            .find(".JORNI_Qty");

    if (QtyInput.length > 0) {

        QtyInput.focus();
        QtyInput.select();

    }

}
//#endregion

// stock (source) batch of a popup row : RefBatch when the row is already saved, else its own number
function StockBatchNo(row) {
    return parseInt(row.find(".RefBatch_Number").val()) ||
           parseInt(row.find(".JORNI_BCH_Number").val()) || 0;
}

//#region SAVE TEMP BATCH (BULK VERSION)
function SaveTempBatch_Edit() {

    let batchList = [];

    $("#ReceiptNoteBatchTableBody tr.ReceiptNoteBatchRow:visible").each(function () {

        let currentRow = $(this);

        if (currentRow.length == 0)
            return;
        let Qty = parseFloat(removeComma(currentRow.find(".JORNI_BCH_QtyReceived").val())) || 0;


        if (Qty <= 0)
            return;

        let rowID = CurrentBatchItemRow_Edit.closest("tr").attr("data-rowid");

        let checkedCheckbox = $(".CheckItem:checked");

        //#region VALIDATION

        if (checkedCheckbox.length <= 0) {
            alert("Please select at least one row");
            return false;
        }

        if (checkedCheckbox.length > 1) {
            alert("Please select only one row");
            return false;
        }

        //#endregion

        let selectedRow = checkedCheckbox.closest("tr");

        CurrentBatchItemRow_Edit = selectedRow;


        let ItemGridindex =
            checkedCheckbox.closest("tr")
                .index("#ItemTable tbody tr.NewRow:visible") + 1;

        CurrentItemGridRowIndex = ItemGridindex;




        let model = {
            DBCH_RowGuid: rowID,
                        // saved rows keep their number inside the DAO (looked up by the stock batch)
            DBCH_Number: 0,
            DBCH_Index:
                parseInt(CurrentItemGridRowIndex) || 0,
            // stock (source) batch number
            DBCH_DBCH_Number: StockBatchNo(currentRow),

            DBCH_Item_Number:
                parseInt(currentRow.find(".JORNI_BCH_JORNI_Number").val()) || 0,

            DBCH_Warehouse_Number:
                parseInt(currentRow.find(".JORNI_BCH_WH_Number").val()) || 0,

            DBCH_Date:
                new Date(currentRow.find(".JORNI_BCH_BatchDate").val()).toISOString(),

            DBCH_No:
                currentRow.find(".JORNI_BCH_BatchNo").val(),

            DBCH_Qty: Qty,

            DBCH_UnitPrice: parseFloat(removeComma(currentRow.find(".JORNI_BCH_BatchUnitPrice").val())) || 0,
            DBCH_Value: parseFloat(removeComma(currentRow.find(".JORNI_BCH_BatchValue").val())) || 0,

            JORNI_NUMBER:
                parseInt(currentRow.find(".JORNI_Number").val()) || 0,

            JORNH_NUMBER:
                parseInt(currentRow.find(".JORNH_Number").val()) || 0,

            RefBatch_Number: StockBatchNo(currentRow),
            Mode: 1,
            CreatorCode: 1,
            CreatorDate: new Date().toISOString()
        };

        batchList.push(model);
    });

    if (batchList.length === 0) {
        console.log("No valid batch data to save.");
        return;
    }
    console.log("No valid batch data to save." + JSON.stringify(batchList));
    $.ajax({

        url: '/joboutward/transactions/receipt-note/save-temp-batch',

        type: 'POST',

        contentType: 'application/json',

        data: JSON.stringify(batchList),

        success: function (response) {

            console.log('Batch save completed');
            console.log(batchList);
            console.log(response);
        },

        error: function (xhr) {

            console.log(xhr.responseText);
        }
    });
}
//#endregion


//#region SAVE BATCH

$(document).on(
    "click",
    "#SaveBatchButton",
    function (e) {

        if (CurrentBatchItemRow_Edit == null)
            return;

        // VALIDATE BATCH ROWS
        let valid =
            ValidateExistingBatchRows_Edit();
        if (!ValidateBatchQty_Edit()) {
            e.preventDefault();
            return false;
        }


        CloseReceiptNoteBatchModal_Edit();

        //if (!valid) {
        //
        //    showAlert(
        //        "Please fill all batch rows before saving"
        //    );
        //
        //    return;
        //}

        let rowID = CurrentBatchItemRow_Edit.closest("tr").attr("data-rowid");



        let batchList = [];

        $("#ReceiptNoteBatchTableBody tr.ReceiptNoteBatchRow")
            .each(function () {

                let row = $(this);

                let batchObj = {

                    RowID: rowID,

                    JORNI_BCH_WH_Number:
                        row.find(".JORNI_BCH_WH_Number").val(),
                    JORNI_BCH_JORNI_Number:
                        row.find(".JORNI_BCH_JORNI_Number").val(),
                    JORNI_BCH_WH_Name:
                        row.find(".JORNI_BCH_WH_Name").val(),

                    JORNI_BCH_BatchDate:
                        row.find(".JORNI_BCH_BatchDate").val(),

                    JORNI_BCH_Number:
                        row.find(".JORNI_BCH_Number").val(),

                    JORNI_BCH_BatchNo:
                        row.find(".JORNI_BCH_BatchNo").val(),

                    JORNI_BCH_QtyAvailable:
                        row.find(".JORNI_BCH_QtyAvailable").val(),

                    JORNI_BCH_QtyReserved:
                        row.find(".JORNI_BCH_QtyReserved").val(),

                    JORNI_BCH_QtyReceived:
                        row.find(".JORNI_BCH_QtyReceived").val(),

                    JORNI_BCH_BatchUnitPrice:
                        row.find(".JORNI_BCH_BatchUnitPrice").val(),

                    JORNI_BCH_BatchValue:
                        row.find(".JORNI_BCH_BatchValue").val(),
                    JORNI_NUMBER:
                        parseInt(row.find(".JORNI_Number").val()) || 0,

                    JORNH_NUMBER:
                        parseInt(row.find(".JORNH_Number").val()) || 0,

                                        RefBatch_Number:
                        parseInt(row.find(".RefBatch_Number").val()) || 0,
                    JORNI_BCH_UsedQty:
                        row.find(".JORNI_BCH_UsedQty").val()
                };
                batchList.push(batchObj);
                //    SaveTempBatch(row);

            });

        // REMOVE OLD SAME ROW DATA
        ReceiptNoteItemBatchList_Edit =
            ReceiptNoteItemBatchList_Edit.filter(
                x => x.RowID != rowID
            );

        // SAVE NEW DATA
        ReceiptNoteItemBatchList_Edit.push({

            RowID: rowID,

            BatchList: batchList
        });

        //#region CONSOLE

        // console.clear();

        console.log("CURRENT ROW ID");
        console.log(rowID);
        let firstRecord = batchList[0];

        if (firstRecord.JORNI_NUMBER == "") {
            SaveTempBatch_Edit();
        } else if (parseInt(firstRecord.JORNI_NUMBER) > 0) {
            SaveTempBatch_Edit();
        }



        //#endregion

        $("#ReceiptNoteBatchModal")
            .modal("hide");

    });

//#endregion
//#region ALERT MESSAGE
function showAlert(message, focusSelector = null) {

    $('#AlertMessage').html(message);

    const modalElement = document.getElementById('ModelAlert');
    const modal = new bootstrap.Modal(modalElement);

    modal.show();

    if (focusSelector) {

        $(modalElement).off('hidden.bs.modal').on('hidden.bs.modal', function () {

            $(focusSelector).focus();

        });
    }
}
//#endregion ALERT MESSAGE


//#region SUBMIT VALIDATION
function validateHeaderById_Edit() {

    // 1. RN No
    if ($("#Header_JORNH_RN_No").val().trim() === "") {
        showAlert('Receipt Note No. is required', '#Header_JORNH_RN_No');

        return false;
    }

    // 2. RN Date
    if ($("#Header_JORNH_RN_Date").val().trim() === "") {
        showAlert('RN Date is required', '#Header_JORNH_RN_Date');
        return false;
    }

    // 2b. Vendor DC No / Date
    if ($("#Header_JORNH_VendorDC_No").val().trim() === "") {
        showAlert('Vendor DC No. is required', '#Header_JORNH_VendorDC_No');
        return false;
    }
    if ($("#Header_JORNH_VendorDC_Date").val().trim() === "") {
        showAlert('Vendor DC Date is required', '#Header_JORNH_VendorDC_Date');

        return false;
    }

    // 3. Material Segregation
    if ($("#Header_JORNH_MS_Number").val() === "" || $("#Header_JORNH_MS_Number").val() === "0") {
        showAlert('Material Segregation is required', '#Header_JORNH_MS_Number');

        return false;
    }

    // 4. JW Vendor
    if ($("#Header_JORNH_JW_Vendor_Number").val().trim() === "" ||
        $("#Header_JORNH_JW_Vendor_Name").val().trim() === "") {

        showAlert('JW Vendor is required', '#Header_JORNH_JW_Vendor_Name');

        return false;
    }

    // 5. Currency
    if ($("#Header_JORNH_Currency_Number").val() === "" || $("#Header_JORNH_Currency_Number").val() === "0") {
        showAlert('Currency is required', '#Header_JORNH_Currency_Number');

        return false;
    }

    // 6. Warehouse
    if ($("#Header_JORNH_WH_Number").val() === "" || $("#Header_JORNH_WH_Number").val() === "0") {
        showAlert('Warehouse is required', '#Header_JORNH_WH_Number');

        return false;
    }




    // =========================
    // GRID VALIDATION CALL
    // =========================
    if (!validateItemGrid_Edit()) {
        return false;
    }
        //if (!validateReceiptNoteBatchList_Edit()) {
    //    return false;
    //}
    if (!validateBatchDetailsDB()) {
        return false;
    }
    if (!validate_Amended_BatchQtyDB()) {
        return false;
    }





    return true;
}
//#endregion
//#region VALIDATE ITEM GRID,batchgrid



function validateItemGrid_Edit() {

    let hasValidRow = false;

    let isValid = true;

    $("#ItemTable tbody tr").each(function () {

        let row = $(this);

        // skip template row
        if (row.hasClass("TempRow")) return;

        // skip deleted row
        if (row.find(".JORNI_IsDeleted").val() === "1") return;

        let process = row.find(".JORNI_JPRS_Number").val();
        let itemCode = row.find(".JORNI_Item_Code").val();
        let qty = row.find(".JORNI_Qty").val();
        let unitPrice = row.find(".JORNI_UnitPrice").val();

        // check if row has ANY data
        let isRowStarted =
            (process && process.trim() !== "") ||
            (itemCode && itemCode.trim() !== "") ||
            (qty && qty.trim() !== "") ||
            (unitPrice && unitPrice.trim() !== "");

        // if row is empty → skip
        if (!isRowStarted) return;

        // row is considered active
        hasValidRow = true;

        // validate Process
        if (!process || process.trim() === "" || process === "0") {
            showAlert(
                'Process is required',
                row.find(".JORNI_JPRS_Number")
            );
            isValid = false;
            return false; // break loop
        }

        // validate Item Code
        if (!itemCode || itemCode.trim() === "") {
            showAlert('Item Code is required', row.find(".JORNI_Item_Code"));

            isValid = false;
            return false;
        }

        // validate Qty
        if (!qty || qty.trim() === "" || (parseFloat(removeComma(qty)) || 0) <= 0) {
            showAlert('Qty is required', row.find(".JORNI_Qty"));

            isValid = false;
            return false;
        }

        // Amend Qty cannot be less than Invoiced Qty
        let invoicedQtyRow = parseFloat(removeComma(row.find(".JORNI_UsedQty").val())) || 0;
        if (invoicedQtyRow > 0 && (parseFloat(removeComma(qty)) || 0) < invoicedQtyRow) {
            showAlert(
                'Amend Qty cannot be less than Invoiced Qty (' + invoicedQtyRow + ')',
                row.find(".JORNI_Qty")
            );

            isValid = false;
            return false;
        }

        // validate Unit Price
        if (!unitPrice || unitPrice.trim() === "" || (parseFloat(removeComma(unitPrice)) || 0) <= 0) {
            showAlert('Unit Price is required', row.find(".JORNI_UnitPrice"));

            isValid = false;
            return false;
        }

        // validate From WH / To WH when Freight Applicable is checked
        if (row.find(".JORNI_IsFreightApplicable").is(":checked")) {

            let fromWH = row.find(".JORNI_FromWH_Number").val();
            let toWH = row.find(".JORNI_ToWH_Number").val();

            if (!fromWH || fromWH === "0") {
                showAlert("From WH is required.", row.find(".JORNI_FromWH_Number"));
                isValid = false;
                return false;
            }

            if (!toWH || toWH === "0") {
                showAlert("To WH is required.", row.find(".JORNI_ToWH_Number"));
                isValid = false;
                return false;
            }
        }

    });

    // no valid row added
    if (!hasValidRow) {
        showAlert('Please add at least one item in grid', "#ItemTable tbody tr:first .JORNI_JPRS_Number");
        //row.find(".JORNI_JPRS_Number").focus();
        return false;
    }

    return isValid;
}


//#endregion VALIDATE ITEM GRID

//#region VALIDATE DELIVERY NOTE BATCH LIST

function validateReceiptNoteBatchList_Edit() {

    let batchRows =
        $("#ReceiptNoteBatchList tbody tr")
            .not("#ReceiptNoteBatchTemplateRow");

    let hasValidQty = false;

    batchRows.each(function () {

        let row = $(this);

        let qty = removeComma(row.find(".JORNI_BCH_QtyReceived").val());
        qty = parseFloat(qty) || 0;

        if (qty > 0) {

            hasValidQty = true;

            return false;
        }

    });

    if (!hasValidQty) {

        showAlert(
            "Please enter Received Qty in batch details",
            '#ReceiptNoteBatchList tbody tr:visible:first .JORNI_BCH_QtyReceived'
        );

        return false;
    }

    return true;
}
//#endregion


//#region Save Function
$("#btnUpdate").on("click", function (e) {
    let $btn = $(this);

    // Prevent double click
    if ($btn.prop("disabled")) {
        e.preventDefault();
        return false;
    }

    if (!validateHeaderById_Edit()) {
        e.preventDefault();
        return false;
    }
    else {

        // Disable button
        $btn.prop("disabled", true);

        var model = CreateReceiptNoteModel_Edit();
        DeleteRemovedRows(model);





    }

});
function DeleteRemovedRows(model) {

    $.ajax({

        url: '/joboutward/transactions/receipt-note/delete-removed-rows',

        type: 'POST',

        contentType: 'application/json',

        data: JSON.stringify(deletedRows),

        success: function () {

            UpdateReceiptNote(model);
        },

        error: function (xhr) {

            console.log(xhr.responseText);
            showAlert('Update failed: ' + xhr.responseText);
            $("#btnUpdate").prop("disabled", false);

        }

    });
}

function UpdateReceiptNote(model) {
    $.ajax({

        url: '/joboutward/transactions/receipt-note/update',

        type: 'POST',

        contentType: 'application/json',

        data: JSON.stringify(model),

        success: function (response) {

            if (response.success) {

                showAlert('Record Updated');

                // Reload only after the user clicks OK (modal hidden),
                // not on a fixed timer
                $('#ModelAlert').off('hidden.bs.modal').on('hidden.bs.modal', function () {
                    window.location.reload();
                });

                console.log(JSON.stringify(model));
            } else {

                console.log(response.message);
                showAlert('Update failed: ' + response.message);
                $("#btnUpdate").prop("disabled", false);
            }


        },

        error: function (xhr) {

            console.log(xhr.responseText);
            showAlert('Update failed: ' + xhr.responseText);
            $("#btnUpdate").prop("disabled", false);

        }

    });
}

function CreateReceiptNoteBatchModel_Edit() {

    let receiptNoteBatches = [];

    $.each(ReceiptNoteItemBatchList_Edit, function () {

        let itemBatch = this;

        // Skip empty batch list
        if (!itemBatch.BatchList || itemBatch.BatchList.length <= 0) {
            return true;
        }

        $.each(itemBatch.BatchList, function () {

            let batch = this;

            // Skip empty qty
            if (
                !batch.JORNI_BCH_QtyReceived ||
                parseFloat((batch.JORNI_BCH_QtyReceived || "0").toString().replace(/,/g, "")) <= 0
            ) {
                return true;
            }

            //#region FORMAT DATE

            let formattedBatchDate = null;

            if (batch.JORNI_BCH_BatchDate) {

                let date = new Date(batch.JORNI_BCH_BatchDate);

                if (!isNaN(date.getTime())) {
                    formattedBatchDate = date.toISOString();
                }
            }

            //#endregion

            let receiptNoteBatch = {

                // saved rows keep their number; the server decides from the temp table
                JORNI_BCH_Number:
                    parseInt(batch.RefBatch_Number) > 0 ? parseInt(batch.JORNI_BCH_Number) || 0 : 0,

                JORNI_BCH_JORNH_Number:
                    parseInt(batch.JORNI_BCH_JORNH_Number) || 0,

                JORNI_BCH_JORNI_Number:
                    parseInt(batch.JORNI_BCH_JORNI_Number) || 0,

                JORNI_BCH_WH_Number:
                    parseInt(batch.JORNI_BCH_WH_Number) || 0,

                // FIXED DATE FORMAT
                JORNI_BCH_BatchDate:
                    formattedBatchDate,

                JORNI_BCH_BatchNo:
                    batch.JORNI_BCH_BatchNo || "",

                JORNI_BCH_BatchQty:
                    parseFloat((batch.JORNI_BCH_QtyReceived || "0").toString().replace(/,/g, "")) || 0,

                JORNI_BCH_BatchUnitPrice:
                    parseFloat((batch.JORNI_BCH_BatchUnitPrice || "0").toString().replace(/,/g, "")) || 0,

                JORNI_BCH_BatchValue:
                    parseFloat((batch.JORNI_BCH_BatchValue || "0").toString().replace(/,/g, "")) || 0,

                // stock (source) batch
                JORNI_BCH_Ref_Batch:
                    parseInt(batch.RefBatch_Number) || parseInt(batch.JORNI_BCH_Number) || 0,

                RefBatch_Number:
                    parseInt(batch.RefBatch_Number) || 0,

                JORNH_Number:
                    parseInt(batch.JORNH_Number) || 0,

                JORNI_Number:
                    parseInt(batch.JORNI_Number) || 0
            };

            receiptNoteBatches.push(receiptNoteBatch);

        });

    });

    return receiptNoteBatches;
}

function CreateReceiptNoteModel_Edit() {

    // =====================================
    // HEADER
    // =====================================
    var header = {

        JORNH_Number:
            parseInt($("#Header_JORNH_Number").val()) || 0,

        JORNH_RN_No:
            $("#Header_JORNH_RN_No").val(),

        JORNH_RN_Date:
            new Date($("#Header_JORNH_RN_Date").val())
                .toISOString(),

        JORNH_VendorDC_No:
            $("#Header_JORNH_VendorDC_No").val(),

        JORNH_VendorDC_Date:
            new Date($("#Header_JORNH_VendorDC_Date").val())
                .toISOString(),

        JORNH_MS_Number:
            parseInt($("#Header_JORNH_MS_Number").val()) || 0,

        JORNH_JW_Vendor_Number:
            parseInt($("#Header_JORNH_JW_Vendor_Number").val()) || 0,

        JORNH_JW_Vendor_Name:
            $("#Header_JORNH_JW_Vendor_Name").val(),

        JORNH_Currency_Number:
            parseInt($("#Header_JORNH_Currency_Number").val()) || 0,

        JORNH_WH_Number:
            parseInt($("#Header_JORNH_WH_Number").val()) || 0,

        JORNH_Remarks:
            $("#Header_JORNH_Remarks").val(),

        JORNH_IsFreightApplicable:
            $("#Header_Freight_Applicable").is(":checked") ? "Yes" : "No"
    };

    // =====================================
    // ITEMS
    // =====================================
    var items = [];

    $("#ItemTable tbody tr.NewRow").each(function () {

        let row = $(this);

        // Skip deleted rows
        if (row.find(".JORNI_IsDeleted").val() == "true") {
            return;
        }

        // Skip empty rows
        if (!row.find(".JORNI_Item_Number").val()) {
            return;
        }

        let item = {

            JORNI_JORNH_Number:
                parseInt(row.find(".JORNI_JORNH_Number").val()) || 0,

            JORNI_Number:
                parseInt(row.find(".JORNI_Number").val()) || 0,

            JORNI_JPRS_Number:
                parseInt(row.find(".JORNI_JPRS_Number").val()) || 0,

            JORNI_Item_Number:
                parseInt(row.find(".JORNI_Item_Number").val()) || 0,

            JORNI_WH_Number:
                parseInt(row.find(".JORNI_WH_Number").val()) || 0,

            JORNI_UoM_Number:
                parseInt(row.find(".JORNI_UoM_Number").val()) || 0,

            JORNI_Qty:
                parseFloat((row.find(".JORNI_Qty").val() || "0").replace(/,/g, "")) || 0,

            JORNI_Qty_Kgs:
                parseFloat((row.find(".JORNI_Qty_Kgs").val() || "0").replace(/,/g, "")) || 0,

            JORNI_UnitPrice:
                parseFloat((row.find(".JORNI_UnitPrice").val() || "0").replace(/,/g, "")) || 0,

            JORNI_Amount:
                parseFloat((row.find(".JORNI_Amount").val() || "0").replace(/,/g, "")) || 0,

            JORNI_IsJW_InvoiceApplicable:
                row.find(".JORNI_IsJW_InvoiceApplicable").is(":checked")
                    ? "Yes"
                    : "No",

            JORNI_JOJWI_SVOH_Number:
                parseInt(row.find(".JORNI_JOJWI_SVOH_Number").val()) || 0,

            JORNI_IsFreightApplicable:
                row.find(".JORNI_IsFreightApplicable").is(":checked")
                    ? "Yes"
                    : "No",

            JORNI_JOFRT_SVOH_Number:
                parseInt(row.find(".JORNI_JOFRT_SVOH_Number").val()) || 0,

            JORNI_FromWH_Number:
                parseInt(row.find(".JORNI_FromWH_Number").val()) || null,

            JORNI_ToWH_Number:
                parseInt(row.find(".JORNI_ToWH_Number").val()) || null,

            // SO Item IDs — needed by USP_CheckDeliveredQtyExceeded_Freight's
            // receipt-side calculation
            JORNI_JOJWI_SVOI_Number:
                parseInt(row.find(".JORNI_JOJWI_SVOI_Number_Row").val()) || 0,

            JORNI_JOFRT_SVOI_Number:
                parseInt(row.find(".JORNI_JOFRT_SVOI_Number_Row").val()) || 0
        };

        items.push(item);

    });



    // =====================================
    // FINAL MODEL
    // =====================================
    var receiptNoteModel = {

        Header: header,
        Items: items,
        receiptNoteBatches: CreateReceiptNoteBatchModel_Edit()

    };
    console.log(receiptNoteModel)

    return receiptNoteModel;

}

//#endregion Save Function




//#region clear all
function ClearAll() {
    $(".left-menu")
        .find("input, textarea, select")
        .each(function () {

            if ($(this).is(":hidden")) {
                $(this).val("");
            }
            else if ($(this).is("select")) {
                $(this).prop("selectedIndex", 0);
            }
            else {
                $(this).val("");
            }
        });
    $("#ItemTable tbody").empty();
    $(".jwvendor-search-results").hide().html("");

}
//#endregion

//#region datebind
function DateBind() {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var formattedDate = day + "-" + months[today.getMonth()] + "-" + today.getFullYear();

    var fp = document.getElementById("Header_JORNH_RN_Date")._flatpickr;
    if (fp) fp.setDate(formattedDate, true, "d-M-Y");
}
//#endregion


function validateBatchDetailsDB() {

    let isValid = true;
    let p_JORNH_Number =
        GetJORNH();
    G_JINH_Number = p_JORNH_Number;

    $.ajax({

        url: "/joboutward/transactions/receipt-note/validate-batch-details",

        type: "GET",

        async: false,

        data: {
            JORNH_Number: G_JINH_Number
        },

        success: function (response) {

            if (!response.status) {

                showAlert(
                    response.message,
                    "#ReceiptNoteBatchList tbody tr:visible:first .JORNI_BCH_QtyReceived"
                );

                isValid = false;
            }
        },

        error: function () {

            isValid = false;
        }
    });

    return isValid;
}
function validate_Amended_BatchQtyDB() {

    let isValid = true;

    let p_JORNH_Number =
        GetJORNH();

    G_JINH_Number = p_JORNH_Number;

    $.ajax({

        url: "/joboutward/transactions/receipt-note/validate-amended-batch-qty",
        type: "GET",
        async: false,
        data: {
            JORNH_Number: G_JINH_Number
        },

        success: function (response) {

            if (!response.status) {
                isValid = false;
                return;
            }

            let dbData = response.data;

            $("#ItemTable tbody tr.NewRow:visible").each(function (index) {

                let row = $(this);

                let gridQty = parseFloat(
                    removeComma(row.find(".JORNI_Qty").val())
                ) || 0;

                let dbchIndex = index + 1;

                let dbRow = dbData.find(x =>
                    parseInt(JV(x, "DBCH_Index")) === dbchIndex
                );

                let dbQty = dbRow
                    ? parseFloat(JV(dbRow, "DBCH_Qty"))
                    : 0;

                if (gridQty !== dbQty) {

                    isValid = false;

                    showAlert(
                        "Qty mismatch at Row " + dbchIndex +
                        " (DB: " + dbQty + ", Grid: " + gridQty + ")",
                        row.find(".JORNI_Qty")
                    );

                    return false; // break loop
                }
            });
        },

        error: function () {
            isValid = false;
        }
    });

    return isValid;
}

$(document).on("change", ".JORNI_WH_Number, .JORNI_Item_Code", function () {

    let row = $(this).closest("tr");
    let DBCH_Index =
        row.index(
            "#ItemTable tbody tr.NewRow:visible"
        ) + 1;
    let itemNumber = row.find(".JORNI_Item_Number").val();
    let warehouseNumber = row.find(".JORNI_WH_Number").val();
    let JORNI_Number = row.find(".JORNI_Number").val();
    let JORNH_Number = GetJORNH();
    setTimeout(function () {
        SaveTempBatch_Edit();
        EditItemRowTempTable(itemNumber, warehouseNumber, JORNI_Number, JORNH_Number, DBCH_Index);
    }, 100);

});




//#region comma format on focusout - Batch WH row fields (Edit)
$(document).on("focusout",
    ".JORNI_BCH_QtyAvailable, .JORNI_BCH_QtyReserved, .JORNI_BCH_QtyReceived, .JORNI_BCH_BatchUnitPrice, .JORNI_BCH_BatchValue",
    function () {

        let isQty =
            $(this).hasClass("JORNI_BCH_QtyAvailable") ||
            $(this).hasClass("JORNI_BCH_QtyReserved") ||
            $(this).hasClass("JORNI_BCH_QtyReceived");

        let type = isQty ? "q" : "c";

        $(this).val(addComma($(this).val(), type));
    });
//#endregion