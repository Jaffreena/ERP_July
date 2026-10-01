$(document).ready(function () {
    //#region JW_Customer – Focus In
    // Handled via inline onfocus="ShowCustomerPane();OnBuyerSelectCall(this)"
    // in the .cshtml — no delegated binding needed.
    //#endregion

    //#region JW_Customer – Text change
    // Handled via inline oninput="OnBuyerInput(this)" in the .cshtml.
    //#endregion

    //#region JW_Customer – Focus Out
    $(document).on("focusout", "#Header_JODNH_JW_Vendor_Name", function () {
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

    //#region JW_Customer – Keydown
    $(document).on("keydown", "#Header_JODNH_JW_Vendor_Name", function (e) {

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
    $(document).on("keydown", ".JODNI_Item_Code", function (e) {

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
            "#Header_JODNH_MS_Number"
        );
    });

    // mousedown -> (re)open the item pane and load/refresh the search.
    $(document).on("mousedown", ".JODNI_Item_Code", function (e) {

        if ($.trim($("#Header_JODNH_MS_Number").val()) === "") {
            $("#Header_JODNH_MS_Number").prop("selectedIndex", 1);
            return;
        }

        $("#RightPane").removeClass("show");
        $("#RightPane .buyer-search-results").hide();

        SearchEditItemJIDNI(this);

        $("#RightPane_Item").addClass("show");
        $("#RightPane_Item .search-results").show();
    });
    //#endregion

    //#region Item_Code – Focus Out
    $(document).on("focusout", ".JODNI_Item_Code", function () {

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
//#region address width
const DeliveryNoteAddressFields = [
    { cls: ".JODNA_ADTP_Number", min: 10, max: 25, align: "left", extraPadding: 20 },
    { cls: ".JODNA_Address_ID", min: 10, max: 25, align: "left", extraPadding: 20 },
    { cls: ".JODNA_Address", min: 40, max: 40, align: "left" },
    { cls: ".JODNA_City", min: 10, max: 25, align: "left" },
    { cls: ".JODNA_State", min: 10, max: 25, align: "left" },
    { cls: ".JODNA_Country", min: 10, max: 25, align: "left" },
    { cls: ".JODNA_PIN", min: 10, max: 10, align: "left" },
    { cls: ".JODNA_GSTIN", min: 15, max: 15, align: "left" }
];
//#endregion
let isMouseSelectingBuyer = false;


let buyerSearchXHR = null;
//#region numeric-only typing (same rules as Create in deliverynote.js)

// ---- Amend Qty: digits only
$(document).on("keypress", ".JODNI_Qty", function (e) {
    if (e.ctrlKey || e.metaKey) return;   // Ctrl+V / Ctrl+A / Ctrl+C
    let charCode = e.which ? e.which : e.keyCode;
    let charStr = String.fromCharCode(charCode);

    if (!/[0-9]/.test(charStr)) {
        e.preventDefault();
    }
});

// strip anything that slips in via paste / drag-drop / autofill (also removes the commas of the formatted value)
$(document).on("input", ".JODNI_Qty", function () {
    let cleaned = $(this).val().replace(/[^0-9]/g, "");

    if (cleaned !== $(this).val()) {
        $(this).val(cleaned);
    }
});

// ---- Unit Price: digits + one dot, max 2 decimals
const EDIT_UNITPRICE_INPUT = "#ItemTable .JODNI_UnitPrice";
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
$(document).on("keypress", ".JODNI_BCH_QtyInvoice", function (e) {
    if (e.ctrlKey || e.metaKey) return;
    let charCode = e.which ? e.which : e.keyCode;
    let charStr = String.fromCharCode(charCode);

    if (!/[0-9]/.test(charStr)) {
        e.preventDefault();
    }
});

$(document).on("input", ".JODNI_BCH_QtyInvoice", function () {
    let cleaned = $(this).val().replace(/[^0-9]/g, "");

    if (cleaned !== $(this).val()) {
        $(this).val(cleaned);
    }
});
//#endregion

//#region VIEW MODE - same page as Edit, read-only (the hidden IsViewMode field is set by delivery-note/view)
function isViewModePage() {
    return $("#IsViewMode").val() === "1";
}

function ApplyViewMode() {
    if (!isViewModePage()) return;

    // 1) badge
    $(".panel-header .h6").first().append('<span class="badge bg-warning text-dark ms-2">VIEW ONLY</span>');

    // 2) remove every button that changes data (removed, not hidden: a hidden button can still be clicked by code)
    $("#btnUpdate, #EditAddRowButton, #RemoveItemRowButton_Edit, #AddressAddButton").remove();
    $(".right-menu a.btn").filter(function () {
        return $.trim($(this).text()) === "Clear All";
    }).remove();

    // 3) fields: text boxes read-only, drop-downs and check boxes disabled.
    //    Row tick boxes stay live (the Batch button needs them).
    $("#DeliveryNoteForm input, #DeliveryNoteForm textarea, #DeliveryNoteForm select").each(function () {
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
    $(".JODNI_Item_Code, .JODNI_Qty, .JODNI_UnitPrice, #Header_JODNH_JW_Vendor_Name")
        .css("pointer-events", "none");

    // date picker: no calendar
    let dn = document.getElementById("Header_JODNH_DN_Date");
    if (dn && dn._flatpickr) {
        dn._flatpickr.set("clickOpens", false);
        if (dn._flatpickr.altInput) {
            dn._flatpickr.altInput.readOnly = true;
            dn._flatpickr.altInput.tabIndex = -1;
            dn._flatpickr.altInput.style.pointerEvents = "none";
        }
    }

    // keep disabled drop-downs looking like normal ones; no delete icons in the address popup
    $("<style>").text(
        "#DeliveryNoteForm select:disabled { background-color:#fff; color:#212529; opacity:1; }" +
        "#BuyerAddress .AddRowRemove { display:none; }"
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
        $("#BatchPopupQty").text(row.find(".JODNI_Qty").val());

        $.ajax({
            url: "/joboutward/transactions/delivery-note/saved-batch-details",
            type: "GET",
            data: {
                JODNH_Number: $("#Header_JODNH_Number").val(),
                JODNI_Number: row.find(".JODNI_Number").val()
            },
            success: function (response) {
                DeliveryNoteBatchList_Edit = [];

                if (response && response.length > 0) {
                    $.each(response, function (i, b) {
                        DeliveryNoteBatchList_Edit.push({
                            JODNI_BCH_WH_Number: 0,
                            JODNI_BCH_JODNI_Number: row.find(".JODNI_Item_Number").val(),
                            JODNI_BCH_WH_Name: b.wareHouseCode,
                            JODNI_BCH_BatchDate: b.batchDate,
                            JODNI_BCH_BatchNo: b.batchNo,
                            JODNI_BCH_QtyAvailable: 0,
                            JODNI_BCH_QtyReserved: 0,
                            JODNI_BCH_QtyInvoice: b.batchQty,
                            JODNI_BCH_BatchUnitPrice: b.batchUnitPrice,
                            JODNI_BCH_BatchValue: b.batchValue,
                            JODNI_BCH_Number: b.lineBatch_Number,
                            JODNI_Number: row.find(".JODNI_Number").val(),
                            JODNH_Number: $("#Header_JODNH_Number").val(),
                            RefBatch_Number: 0
                        });
                    });
                } else {
                    DeliveryNoteBatchList_Edit.push({});
                }

                BindDeliveryNoteBatchTable();

                // stock columns mean nothing on a saved note; nothing in the popup is editable
                $("#DeliveryNoteBatchTableBody .JODNI_BCH_QtyAvailable, #DeliveryNoteBatchTableBody .JODNI_BCH_QtyReserved").val("");
                $("#TotalAvailableQty, #TotalReservedQty").val("");
                $("#DeliveryNoteBatchTableBody input").prop("readonly", true);
                ApplyBatchFieldWidths("#DeliveryNoteBatchList");

                $("#DeliveryNoteBatchModal").modal("show");
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
function ResizeAddressColumns() {
    ApplyFieldWidths({
        fields: DeliveryNoteAddressFields,
        container: "#AddressTable",
        tempRow: "#AddTempRow",
        tableBody: "#AddTableBody"
    });
}

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
    { cls: ".JODNI_JPRS_Number", min: 10, max: 25, align: "left" },
    { cls: ".JODNI_Item_Code", min: 10, max: 15, align: "left" },
    { cls: ".JODNI_Item_Description", min: 40, max: 40, align: "left" },

    { cls: ".JODNI_OuterDia", min: 8, max: 8, align: "center" },
    { cls: ".JODNI_Thickness", min: 8, max: 8, align: "center" },
    { cls: ".JODNI_Length", min: 8, max: 8, align: "center" },
    { cls: ".JODNI_Width", min: 8, max: 8, align: "center" },

    { cls: ".JODNI_MaterialGrade", min: 10, max: 25, align: "left" },
    { cls: ".JODNI_ItemGroup", min: 10, max: 30, align: "left" },
    { cls: ".JODNI_WH_Number", min: 10, max: 25, align: "left" },

    { cls: ".JODNI_UoM_Number", min: 10, max: 15, align: "center" },

    { cls: ".JODNI_OriginalQty", min: 10, max: 20, align: "center" }, // Extra field
    { cls: ".JODNI_InvoicedQty", min: 10, max: 20, align: "center" }, // Extra field
    { cls: ".JODNI_Qty", min: 10, max: 20, align: "center" },

    { cls: ".JODNI_UnitPrice", min: 10, max: 20, align: "right" },
    { cls: ".JODNI_Amount", min: 13, max: 25, align: "right" },


    { cls: ".JODNI_FromWH_Number", min: 10, max: 25, align: "left" },
    { cls: ".JODNI_ToWH_Number", min: 10, max: 25, align: "left" },
    { cls: ".JODNI_JOFRT_SVOH_Number", min: 10, max: 25, align: "left" }
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


function GetTableWidth(container = "#DeliveryNoteBatchList") {

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
function ApplyBatchFieldWidths(container = "#DeliveryNoteBatchList") {

    const fields = [
        { cls: ".JODNI_BCH_WH_Name", min: 10, max: 25, align: "left" },
        { cls: ".JODNI_BCH_BatchDate", min: 10, max: 10, align: "center" },
        { cls: ".JODNI_BCH_BatchNo", min: 20, max: 50, align: "left" },
        { cls: ".JODNI_BCH_QtyAvailable", min: 10, max: 20, align: "center" },
        { cls: ".JODNI_BCH_QtyReserved", min: 10, max: 20, align: "center" },
        { cls: ".JODNI_BCH_QtyInvoice", min: 10, max: 20, align: "center" },
        { cls: ".JODNI_BCH_BatchUnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".JODNI_BCH_BatchValue", min: 13, max: 25, align: "right" }
    ];


    const $container = $(container);

    fields.forEach(f => {

        const controls = $container.find(
            "#DeliveryNoteBatchTableBody > #DeliveryNoteBatchTemplateRow " + f.cls +
            ", #DeliveryNoteBatchTableBody > tr.DeliveryNoteBatchRow " + f.cls
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
            f.cls === ".JODNI_BCH_BatchUnitPrice" ||
            f.cls === ".JODNI_BCH_BatchValue"
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

    const tableWidth = GetTableWidth("#DeliveryNoteBatchList");
    SetDeliveryNoteBatchModalWidth(tableWidth);
}
function SetDeliveryNoteBatchModalWidth(tableWidth) {

    const dialog = document.querySelector("#DeliveryNoteBatchModal .modal-dialog");

    if (!dialog) return;

    // Add space for modal padding and borders
    const width = (tableWidth + 40) + "px";

    dialog.style.setProperty("width", width, "important");
    dialog.style.setProperty("max-width", width, "important");
    dialog.style.setProperty("height", "528px", "important");
    dialog.style.setProperty("max-height", "528px", "important");
}

function ApplyOtherBatchFieldWidths(container = "#DeliveryNoteOtherBatchList") {

    const fields = [
        { cls: ".JODNI_BCH_WH_Name", min: 15, max: 30, align: "left" },
        { cls: ".JODNI_BCH_BatchDate", min: 12, max: 12, align: "center" },
        { cls: ".JODNI_BCH_BatchNo", min: 20, max: 35, align: "left" },
        { cls: ".JODNI_BCH_AvailableQty", min: 11, max: 20, align: "center" },
        { cls: ".JODNI_BCH_BatchUnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".JODNI_BCH_BatchValue", min: 13, max: 25, align: "right" }
    ];

    const $container = $(container);

    fields.forEach(f => {

        const controls = $container.find(
            "#DeliveryNoteOtherBatchTableBody > #DeliveryNoteOtherBatchTemplateRow " + f.cls +
            ", #DeliveryNoteOtherBatchTableBody > tr.DeliveryNoteOtherBatchNewRow " + f.cls
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
            f.cls === ".JODNI_BCH_BatchUnitPrice" ||
            f.cls === ".JODNI_BCH_BatchValue"
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

    const tableWidth = GetTableWidth("#DeliveryNoteOtherBatchList");
    SetDeliveryNoteOtherBatchModalWidth(tableWidth);
}
function SetDeliveryNoteOtherBatchModalWidth(tableWidth) {

    const dialog = document.querySelector("#DeliveryNoteOtherBatchModal .modal-dialog");

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
    fitInputWidth("Header_JODNH_DN_No", 20, 25);
    fitInputWidth("Header_JODNH_MS_Number", 20, 30);
    fitInputWidth("Header_JODNH_JW_Vendor_Name", 40, 50);
    fitInputWidth("Header_JODNH_Currency_Number", 10, 10);
    fitInputWidth("Header_JODNH_WH_Number", 20, 25);
    fitInputWidth("Header_JODNH_PaymentTerms", 30, 40);
    fitInputWidth("Header_JODNH_DeliveryTerms", 30, 40);
    fitInputWidth("Header_JODNH_DeliveryMode", 30, 40);
    fitInputWidth("Header_JODNH_DespatchDocumentNo", 30, 40);
    fitInputWidth("Header_JODNH_DespatchedThrough", 30, 40);
    fitInputWidth("Header_JODNH_Remarks", 40, 40);
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
            row.find(".JODNI_IsFreightApplicable").prop("checked", false);
            row.find(".JODNI_FromWH_Number").val("");
            row.find(".JODNI_ToWH_Number").val("");
            row.find(".JODNI_JOFRT_SVOH_Number").html('<option value="0"></option>');
            row.find(".JODNI_JOFRT_SVOI_Number_Row").val("0");
        });
    }
});

$(document).ready(function () {
    // Auto-check header toggle if any saved row already has Freight
    // Applicable checked — otherwise the freight columns stay hidden
    // even though the data needs them shown
    if ($("#ItemTable tbody tr.NewRow .JODNI_IsFreightApplicable:checked").length > 0) {
        $("#Header_Freight_Applicable").prop("checked", true);
    }

    // Footer Total Qty / Total Amount on page load
    calculateTotal();

    // Same look as Create after typing: Unit Price with 2 decimals, quantities with Indian grouping
    $("#ItemTable tbody tr.NewRow").each(function () {
        let row = $(this);

        let price = row.find(".JODNI_UnitPrice");
        if ($.trim(price.val()) !== "") {
            price.val(addComma(price.val(), "c"));
        }

        let kgs = row.find(".JODNI_Qty_Kgs");
        if (parseFloat(kgs.val()) > 0) {
            kgs.val(addComma(kgs.val(), "c"));
        } else {
            kgs.val("");
        }

        row.find(".JODNI_Qty, .JODNI_OriginalQty").each(function () {
            if ($.trim($(this).val()) !== "") {
                $(this).val(addComma($(this).val(), "q"));
            }
        });
    });

    // Freight columns show/hide on load, based on header checkbox
    ToggleFreightColumns_DN();

    $("#ItemTable tbody tr.NewRow").each(function () {
        let row = $(this);
        if (row.find(".JODNI_IsFreightApplicable").is(":checked")) {
            BindFreightServiceOrder_DN(
                row,
                $("#Header_JODNH_JW_Vendor_Number").val(),
                row.find(".JODNI_UoM_Number").val(),
                row.find(".JODNI_FromWH_Number").val(),
                row.find(".JODNI_ToWH_Number").val()
            );
        }
    });
    //#region item code right pane search JODNI_Item_Code
    // Item_Code – Keydown (incl. Escape): moved to <script> block
    // Item_Code – Mousedown: moved to <script> block
    // Item_Code – Focus Out: moved to <script> block
    //#endregion
    //#region Header_JODNH_JW_Vendor_Name
    // JW_Customer – Focus Out: moved to <script> block
    // JW_Customer – Keydown: moved to <script> block
    //#endregion
    $(document).on("mousedown", ".search-results tbody tr", function () {

        let rows = $(".search-results tbody tr");

        // Remove previous current row
        rows.removeClass("current-row");

        // Make clicked row the current row
        $(this).addClass("current-row");
    });
    //#region address width
    // Textboxes
    $(document).on("input", "#AddressTable input", function () {
        ResizeAddressColumns();
    });

    // Dropdowns
    $(document).on("change", "#AddressTable select", function () {
        ResizeAddressColumns();
    });

    // Optional: when a readonly field gets focus after being populated
    $(document).on("focusin",
        "#BuyerAddress .JODNA_Address, " +
        "#BuyerAddress .JODNA_City, " +
        "#BuyerAddress .JODNA_State, " +
        "#BuyerAddress .JODNA_Country, " +
        "#BuyerAddress .JODNA_PIN, " +
        "#BuyerAddress .JODNA_GSTIN",
        function () {
            ResizeAddressColumns();
        });
    //#endregion


    //#region batch grid alignment
    $(document).on("input change blur", "#DeliveryNoteBatchList input, #DeliveryNoteBatchList textarea, #DeliveryNoteBatchList select", function () {
        ApplyBatchFieldWidths("#DeliveryNoteBatchList");
    });
    ApplyBatchFieldWidths("#DeliveryNoteBatchList");
    $(document).on(
        "input change blur",
        "#DeliveryNoteOtherBatchList input, #DeliveryNoteOtherBatchList textarea, #DeliveryNoteOtherBatchList select",
        function () {
            ApplyOtherBatchFieldWidths("#DeliveryNoteOtherBatchList");
        }
    );

    ApplyOtherBatchFieldWidths("#DeliveryNoteOtherBatchList");
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
        "#Header_JODNH_DN_No, #Header_JODNH_MS_Number, #Header_JODNH_JW_Vendor_Name, #Header_JODNH_Currency_Number, #Header_JODNH_WH_Number, #Header_JODNH_PaymentTerms, #Header_JODNH_DeliveryTerms, #Header_JODNH_DeliveryMode, #Header_JODNH_DespatchDocumentNo, #Header_JODNH_DespatchedThrough, #Header_JODNH_Remarks",
        function () {

            const widths = {
                Header_JODNH_DN_No: [20, 25],
                Header_JODNH_MS_Number: [20, 30],
                Header_JODNH_JW_Vendor_Name: [40, 50],
                Header_JODNH_Currency_Number: [10, 10],
                Header_JODNH_WH_Number: [20, 25],
                Header_JODNH_PaymentTerms: [30, 40],
                Header_JODNH_DeliveryTerms: [30, 40],
                Header_JODNH_DeliveryMode: [30, 40],
                Header_JODNH_DespatchDocumentNo: [30, 40],
                Header_JODNH_DespatchedThrough: [30, 40],
                Header_JODNH_Remarks: [40, 40]
            };

            const [min, max] = widths[this.id];
            fitInputWidth(this, min, max);
        });

    //#endregion


    // Freight Applicable change handler — auto-refresh Freight SO dropdown
    $(document).on(
        "change",
        ".JODNI_IsFreightApplicable, .JODNI_UoM_Number, .JODNI_FromWH_Number, .JODNI_ToWH_Number",
        function () {

            let row = $(this).closest("tr");

            if (row.find(".JODNI_IsFreightApplicable").is(":checked")) {
                BindFreightServiceOrder_DN(
                    row,
                    $("#Header_JODNH_JW_Vendor_Number").val(),
                    row.find(".JODNI_UoM_Number").val(),
                    row.find(".JODNI_FromWH_Number").val(),
                    row.find(".JODNI_ToWH_Number").val()
                );
            } else {
                row.find(".JODNI_JOFRT_SVOH_Number").html('<option value="0"></option>');
            }
        }
    );

    // Edit-page version: works on one row and restores the saved selection
    function BindFreightServiceOrder_DN(row, customerId, uomNumber = null, fromWHNumber = null, toWHNumber = null) {

        let dropdown = row.find(".JODNI_JOFRT_SVOH_Number");
        // The select only ever renders a bare "0" option server-side, so
        // capture the saved value from the
        // data attribute BEFORE clearing — this restore step was missing,
        // which is why the dropdown went blank after Update.
        let selectedValue = dropdown.attr("data-saved-value") || dropdown.val();

        dropdown.html('<option value="0"></option>');
        if (!customerId) return;

        $.get("/joboutward/transactions/delivery-note/get-freight-service-order",
            { vendorId: customerId, uomNumber, fromWHNumber, toWHNumber },
            data => {
                // Reset again right here, immediately before appending —
                // guards against duplicate options from overlapping calls
                dropdown.html('<option value="0"></option>');

                $.each(data, (_, item) => {
                    if (!item.value || item.value === "" || item.value === "0") return;

                    dropdown.append(
                        `<option value="${item.value}" data-svoi="${item.svoiNumber || 0}">${item.text}</option>`
                    )
                });

                dropdown.val(selectedValue); // restore selection
            }
        );
    }

    function GetOtherRowsQtyForSO(svohNumber, currentRow) {
        let total = 0;

        $("#ItemTable tbody tr.NewRow").each(function () {
            let row = $(this);

            if (row.is(currentRow)) return;
            if (row.find(".JODNI_IsDeleted").val() === "1" ||
                row.find(".JODNI_IsDeleted").val() === "true") return;

            let rowFreightSO = row.find(".JODNI_JOFRT_SVOH_Number").val() || 0;

            if (rowFreightSO == svohNumber) {
                total += parseFloat(removeComma(row.find(".JODNI_Qty").val())) || 0;
            }
        });

        return total;
    }

    // Freight Qty-Exceeded validation — mirrors Create's change handler
    $(document).on("change", ".JODNI_JOFRT_SVOH_Number", function () {

        let row = $(this).closest("tr");
        let freightSO = $(this).val();

        // capture SO item id for JODNI_JOFRT_SVOI_Number (needed for the
        // qty-exceeded calc, same as GetOtherRowsQtyForSO linkage)
        let selectedSvoi = $(this).find("option:selected").attr("data-svoi") || 0;
        row.find(".JODNI_JOFRT_SVOI_Number_Row").val(selectedSvoi);

        if (!freightSO || freightSO === "0") return;

        let uomNumber = row.find(".JODNI_UoM_Number").val();
        let fromWHNumber = row.find(".JODNI_FromWH_Number").val();
        let toWHNumber = row.find(".JODNI_ToWH_Number").val();
        let originalQty = parseFloat(removeComma(row.find(".JODNI_Qty").val())) || 0;

        $.get("/joboutward/transactions/delivery-note/check-delivered-qty-exceeded-freight", {
            svohNumber: freightSO,
            uomNumber,
            fromWHNumber,
            toWHNumber
        }, function (res) {

            if (!res || res.length === 0) return;

            let deliveredQty = parseFloat(res[0].deliveredQty) || 0;
            let svoiQty = parseFloat(res[0].svoiQty) || 0;

            let otherRowsQty = GetOtherRowsQtyForSO(freightSO, row);
            let realDeliveredQty = deliveredQty + otherRowsQty;

            if ((realDeliveredQty + originalQty) > svoiQty) {
                alert("Freight Qty Allowed: " + (svoiQty - realDeliveredQty));
                setTimeout(function () {
                    row.find(".JODNI_Qty")
                        .focus()
                        .select();
                    row.find(".JODNI_JOFRT_SVOH_Number").val("0");
                }, 300);
            }
        });
    });
    //#endregion

    //#region Unit Price Format

    //#region comma format on focusout
    $(document).on("focusout", ".JODNI_Qty, .JODNI_UnitPrice, .JODNI_Amount", function () {

        let type = $(this).hasClass("JODNI_Qty") ? "q" : "c";

        $(this).val(addComma($(this).val(), type));
    });
    //#endregion

    //#endregion

    //#region INPUT CLICK SELECT ALL

    $(document).on("click", "#DeliveryNoteBatchList input", function (e) {
        e.stopPropagation();

        let input = this;
        input.focus();

        setTimeout(function () {
            input.select();
        }, 10);
    });


    //#endregion

    //#region CLOSE DELIVERY NOTE BATCH MODAL

    $("#DeliveryNoteBatchClose").on("click", function () {

        // Get modal element
        var modalEl = document.getElementById("DeliveryNoteBatchModal");

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
    $(document).on("keyup change", ".JODNI_Qty, .JODNI_UnitPrice", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat((row.find(".JODNI_Qty").val() || "0").replace(/,/g, "")) || 0;
        let price = parseFloat((row.find(".JODNI_UnitPrice").val() || "0").replace(/,/g, "")) || 0;

        let amount = qty * price;

        // Only set row amount (read-only field)
        row.find(".JODNI_Amount").val(formatIndianCurrency(amount));

        // Update footer totals separately
        calculateTotal();

        // Auto add row
        autoAddRow(row);
    });
    //#endregion onkeypress qty and unitS

    //#region validate amend qty against invoiced qty
    // FORMULA: if AmendQty < InvoicedQty -> alert + reset AmendQty = InvoicedQty
    $(document).on("change", ".JODNI_Qty", function () {

        let row = $(this).closest("tr");

        let amendQty = parseFloat(removeComma($(this).val())) || 0;
        let invoicedQty = parseFloat(removeComma(row.find(".JODNI_InvoicedQty").val())) || 0;

        if (amendQty < invoicedQty) {
            alert("Amend Qty cannot be less than Invoiced Qty (" + invoicedQty + ")");
            $(this).val(addComma(invoicedQty, "q"));
        }
    });
    //#endregion validate amend qty against invoiced qty

    //#region auto add row function
    function autoAddRow(currentRow) {

        let qty = parseFloat(removeComma(currentRow.find(".JODNI_Qty").val())) || 0;
        let price = parseFloat(removeComma(currentRow.find(".JODNI_UnitPrice").val())) || 0;

        let itemCode = currentRow.find(".JODNI_Item_Code").val();
        let prsNo = currentRow.find(".JODNI_JPRS_Number").val();

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
                if (el.hasClass("JODNI_IsDeleted"))
                    return;

                // ITEM CODE
                if (el.hasClass("JODNI_Item_Code")) {

                    if (!el.val()) {

                        isValid = false;

                        el.focus();

                        return false;
                    }
                }

                // QTY
                if (el.hasClass("JODNI_Qty")) {

                    if (!el.val() || parseFloat(removeComma(el.val())) <= 0) {

                        isValid = false;

                        el.focus();

                        return false;
                    }
                }

                // UNIT PRICE
                if (el.hasClass("JODNI_UnitPrice")) {

                    if (!el.val() || parseFloat(removeComma(el.val())) <= 0) {

                        isValid = false;

                        el.focus();

                        return false;
                    }
                }

                // PROCESS
                if (el.hasClass("JODNI_JPRS_Number")) {

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
                el.hasClass("JODNI_Number") ||
                el.hasClass("JODNI_Item_Number")
            ) {

                el.val("");
            }

            // DELETE FLAG
            else if (el.hasClass("JODNI_IsDeleted")) {

                el.val("false");
            }

            // INVOICED QTY - new row has nothing invoiced yet
            else if (el.hasClass("JODNI_InvoicedQty")) {

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
        checkedRows.each(function () {

            let currentRow = $(this);

            // visible row index
            let ItemGridindex =
                currentRow.index(
                    "#ItemTable tbody tr.NewRow:visible"
                ) + 1;
            let currentRow_temp = $(this).closest("tr");



            // Get values from current row
            let JODNI_Number = currentRow_temp.find(".JODNI_Number").val();

            let JODNH_Number =
                new URLSearchParams(window.location.search)
                    .get("JODNH_Number");

            let DBCH_Item_Number =
                currentRow_temp.find(".JODNI_Item_Number").val();

            let DBCH_DBCH_Number =
                currentRow_temp.find(".JODNI_DBCH_Number").val();


            deletedRows.push({
                ItemGridindex: ItemGridindex,
                JODNI_Number: JODNI_Number,
                JODNH_Number: JODNH_Number,
                DBCH_Item_Number: DBCH_Item_Number,
                DBCH_DBCH_Number: DBCH_DBCH_Number
            });

            console.log(deletedRows);




            $.ajax({

                url: '/joboutward/transactions/delivery-note/delete-temp-batch-row',

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

    //#region JODNI_JW_InvoiceTracking
    $("#ItemTable .JODNI_JW_InvoiceTracking").each(function () {
        $(this).trigger("change");
    });
    //#endregion JODNI_JW_InvoiceTracking
});


let DeliveryNoteBatchList_Edit = [];
let DeliveryNoteItemBatchList_Edit = [];
let CurrentBatchItemRow_Edit = null;
let CurrentItemGridRowIndex = 0;

//#region Calculate Total
function calculateTotal() {

    let totalQty = 0;
    let totalAmount = 0;
    let totalOriginalQty = 0;
    let totalInvoicedQty = 0;

    // Loop through each row (only active rows)
    $("#ItemTable tbody tr.NewRow").each(function () {

        let row = $(this);

        // Skip deleted rows
        if (row.find(".JODNI_IsDeleted").val() === "1" ||
            row.find(".JODNI_IsDeleted").val() === "true") {
            return;
        }


        // Original / Invoiced Qty (read-only columns)
        let originalQty = parseFloat(removeComma(row.find(".JODNI_OriginalQty").val())) || 0;
        let invoicedQty = parseFloat(removeComma(row.find(".JODNI_InvoicedQty").val())) || 0;
        // Get Qty
        let qty = parseFloat(removeComma(row.find(".JODNI_Qty").val())) || 0;

        // Get Unit Price
        let unitPrice = parseFloat(removeComma(row.find(".JODNI_UnitPrice").val())) || 0;

        // Row Amount = Qty × Unit Price
        let amount = qty * unitPrice;

        // Set row amount field
        row.find(".JODNI_Amount").val(addComma(amount, "c"));

        // Add to totals
        totalQty += qty;
        totalOriginalQty += originalQty;
        totalInvoicedQty += invoicedQty;
        totalAmount += amount;
    });

    // Footer totals
    $("#TotalOriginalQty").val(addComma(totalOriginalQty, "q"));
    $("#TotalInvoicedQty").val(addComma(totalInvoicedQty, "q"));
    $("#TotalQty").val(addComma(totalQty, "q"));
    $("#TotalAmount").val(addComma(totalAmount, "c"));

    // Qty (Kgs) footer total
    let totalQtyKgs = 0;
    $("#ItemTable tbody tr.NewRow").each(function () {
        let r = $(this);
        if (r.find(".JODNI_IsDeleted").val() === "1" ||
            r.find(".JODNI_IsDeleted").val() === "true") return;
        totalQtyKgs += parseFloat(removeComma(r.find(".JODNI_Qty_Kgs").val())) || 0;
    });
    $("#TotalQtyKgs").val(addComma(totalQtyKgs, "c"));
}
//#endregion Calculate Total

//#region Qty (Kgs) conversion
function CalculateQtyKgDN(row) {
    let qty = parseFloat(removeComma(row.find(".JODNI_Qty").val())) || 0;
    let uomText = row.find(".JODNI_UoM_Number option:selected").text().trim().toUpperCase();

    let qtyKg;
    if (uomText === "KGS") {
        qtyKg = qty;
    } else {
        let fromQty = parseFloat(row.find(".FromQty").val()) || 0;
        let toQty = parseFloat(row.find(".ToQty").val()) || 0;
        qtyKg = fromQty > 0 ? (qty * (toQty / fromQty)) : 0;
    }

    row.find(".JODNI_Qty_Kgs").val(qtyKg === 0 ? "" : addComma(qtyKg, "c"));
    calculateTotal();
}

// fetch the item's unit conversion only when it is not loaded yet
function RefreshQtyKgDN(row, forceFetch) {
    let itemNumber = row.find(".JODNI_Item_Number").val();
    let fromUnit = row.find(".JODNI_UoM_Number").val();
    let uomText = row.find(".JODNI_UoM_Number option:selected").text().trim().toUpperCase();

    if (uomText === "KGS" || !itemNumber || !fromUnit ||
        (!forceFetch && $.trim(row.find(".FromQty").val()) !== "")) {
        CalculateQtyKgDN(row);
        return;
    }

    $.ajax({
        url: '/receiptnote/transactions/receiptnote/get-item-unit-conversion',
        type: 'GET',
        data: { itemNumber: itemNumber, fromUnit: fromUnit },
        success: function (res) {
            row.find(".FromQty").val(res.fromQty);
            row.find(".ToQty").val(res.toQty);
            CalculateQtyKgDN(row);
        }
    });
}

$(document).on("input", ".JODNI_Qty", function () {
    RefreshQtyKgDN($(this).closest("tr"), false);
});

$(document).on("change", ".JODNI_UoM_Number", function () {
    RefreshQtyKgDN($(this).closest("tr"), true);
});
//#endregion Qty (Kgs) conversion

//#region Edit Customer Search Functions
//#region customer Search Functions
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

    var JWCustomer = inputElement.value;
    var SIHDate = $("input[name='Header.JODNH_DN_Date']").val();
    var resultsDiv = $("#RightPane").find(".buyer-search-results");

    if (buyerSearchXHR) {
        buyerSearchXHR.abort();
    }

    buyerSearchXHR = $.ajax({
        url: '/joboutward/transactions/delivery-note/vendor',
        type: 'GET',
        data: {
            Vendor: JWCustomer,
            DNDate: SIHDate
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
                    row.data("customer", cust);
                    row.append("<td>" + cust.jwV_JW_VendorName + "</td>");


                    table.find("tbody").append(row);

                    // Removed: duplicate row "click" handler (raced
                    // with the "mousedown" handler below; extra field
                    // population merged into it, with the mousedown
                    // handler's Currency_Number-passed-twice bug fixed
                    // to Currency_Name).
                });


                table.find("tbody").on("mousedown", "tr", function (e) {

                    e.preventDefault();

                    const clickedCust = $(this).data("customer");
                    isMouseSelectingBuyer = true;

                    $("#BuyerMessage").hide().text("");

                    $(inputElement).val(clickedCust.jwV_JW_VendorName);

                    $("#Header_JODNH_JW_Vendor_Number")
                        .val(clickedCust.jwV_Number)
                        .trigger("change");

                    $("#Header_JODNH_Currency_Number")
                        .val(clickedCust.jwV_Currency_Number)
                        .trigger("change");

                    $("#Header_JODNH_WH_Number")
                        .val(clickedCust.jwV_WH_Number)
                        .trigger("change");

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

                let searchText = JWCustomer.trim().toLowerCase();

                let firstMatch = -1;
                let lastMatch = -1;

                rows.each(function (i) {

                    let customer = $(this).find("td:first").text().trim().toLowerCase();

                    if (searchText !== "" && customer.startsWith(searchText)) {

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

//#endregion customer Search Functions

//#endregion Edit Customer Search Functions

//#region Edit item grid fetch item details

function OnEditInputItem(inputElement) {

    if (inputElement.selectionStart !== inputElement.selectionEnd) {
        return;
    }

    SearchEditItemJIDNI(inputElement);
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

    SearchEditItemJIDNI(inputElement);
}
var ItemChanged = 0;

function SearchEditItemJIDNI(inputElement) {

    let itemCode = inputElement.value;
    let row = $(inputElement).closest("tr");
    let JODNI_Number = row.find(".JODNI_Number").val();
    let JODNH_Number = new URLSearchParams(window.location.search).get("JODNH_Number");
    let DBCH_Item_Number = row.find(".JODNI_Item_Number").val();
    let DBCH_DBCH_Number = row.find(".JODNI_DBCH_Number").val();

    let resultsDiv = $("#RightPane_Item").find(".search-results");
    let ItemGridindex =
        $("#TableBody tr.NewRow:visible")
            .index(row) + 1;


    let material = $("#Header_JODNH_MS_Number").val();


    if (!material) return;

    if (itemSearchXHR) {
        itemSearchXHR.abort();
    }

    itemSearchXHR = $.ajax({
        url: '/joboutward/transactions/delivery-note/item',
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
                        row.find(".JODNI_Item_Code").val(item.itemCode);

                        // ✔ Hidden fields
                        row.find(".JODNI_Item_Number").val(item.itemNumber);
                        //    row.find(".JODNI_Number").val(item.itemNumber);

                        // ✔ Fill details
                        row.find(".JODNI_Item_Description").val(item.itemDescription);
                        row.find(".JODNI_OuterDia").val(item.outerDia);
                        row.find(".JODNI_Thickness").val(item.thickness);
                        row.find(".JODNI_Length").val(item.length);
                        row.find(".JODNI_Width").val(item.width);
                        row.find(".JODNI_MaterialGrade").val(item.materialGrade);
                        row.find(".JODNI_ItemGroup").val(item.itemGroup);

                        // ✔ Dropdowns
                        row.find(".JODNI_UoM_Number").val(item.uoM);
                        row.find(".JODNI_WH_Number").val(item.saleWarehouse);

                        // ✔ Move to Qty
                        let qtyInput = row.find(".JODNI_Qty");
                        let qtyUnitprice = row.find(".JODNI_UnitPrice");
                        qtyInput.focus();

                        setTimeout(function () {
                            if (JODNI_Number == "") {
                                SaveTempBatch_AddRow(ItemGridindex);
                            } else {
                                EditItemRowTempTable(item.itemNumber, item.saleWarehouse, JODNI_Number, JODNH_Number);
                            }

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

//#region delete grid
function DeleteItemRowTempTable(inputElement) {
    let ItemGridindex =
        $(inputElement)
            .closest("tr")
            .index("#ItemTable tbody tr.NewRow:visible") + 1;
    $.ajax({

        url: '/joboutward/transactions/delivery-note/temp-batch-delete-change-item',

        type: 'POST',

        data: { index: ItemGridindex },

        success: function (response) {

            calculateTotal();
        },

        error: function (xhr) {

            console.log(xhr.responseText);
        }
    });
}



//#endregion



//#region Edit grid
function EditItemRowTempTable(DBCH_Item_Number, n_warehouse, JODNI_Number, JODNH_Number, DBCH_Index) {



    $.ajax({

        url: '/joboutward/transactions/delivery-note/temp-batch-edit-change-item',

        type: 'POST',

        data: { DBCH_Item_Number: DBCH_Item_Number, warehouse: n_warehouse, JODNI_Number: JODNI_Number, JODNH_Number: JODNH_Number, DBCH_Index: DBCH_Index },

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
        selectedRow.find(".JODNI_WH_Number").val();

    let lineItemNumber =
        selectedRow.find(".JODNI_Item_Number").val();
    let jIDNI_Number =
        selectedRow.find(".JODNI_Number").val();
    G_JINI_Number = jIDNI_Number;


    let invoiceQty =
        selectedRow.find(".JODNI_Qty").val();

    $("#BatchPopupQty").text(invoiceQty);
    let p_JODNH_Number =
        new URLSearchParams(window.location.search)
            .get("JODNH_Number");
    G_JINH_Number = p_JODNH_Number;

    //#endregion


    // CLEAR TEMP ARRAY
    DeliveryNoteBatchList_Edit = [];

    // CLEAR OLD ROWS
    $("#DeliveryNoteBatchTableBody")
        .find(".DeliveryNoteBatchRow")
        .remove();



    //#region AJAX

    $.ajax({

        url: "/joboutward/transactions/delivery-note/batch-details-edit",

        type: "GET",

        data: {
            FromWarehouse: fromWarehouse,
            LineItem_Number: lineItemNumber,
            JODNI_Number: jIDNI_Number,
            ItemGridIndex: ItemGridindex,
            JODNH_Number: G_JINH_Number
        },

        success: function (response) {

            console.log(response);

            DeliveryNoteBatchList_Edit = [];

            if (response && response.length > 0) {

                $.each(response, function (i, batch) {

                    DeliveryNoteBatchList_Edit.push({

                        JODNI_BCH_WH_Number: batch.fromWarehouse,
                        JODNI_BCH_JODNI_Number: lineItemNumber,
                        JODNI_BCH_WH_Name: batch.wareHouseCode,
                        JODNI_BCH_BatchDate: batch.batchDate,
                        JODNI_BCH_BatchNo: batch.batchNo,
                        JODNI_BCH_QtyAvailable: batch.availableQty,
                        JODNI_BCH_QtyReserved: batch.reservedQty,
                        JODNI_BCH_QtyInvoice: batch.deliveredQty,
                        JODNI_BCH_BatchUnitPrice: batch.batchUnitPrice,
                        JODNI_BCH_BatchValue: batch.batchValue,
                        JODNI_BCH_Number: batch.lineBatch_Number,
                        JODNI_Number: G_JINI_Number,
                        JODNH_Number: G_JINH_Number,
                        RefBatch_Number: batch.refBatch_Number
                    });

                });

            } else {

                DeliveryNoteBatchList_Edit.push({});
            }

            BindDeliveryNoteBatchTable();
            BindOtherBatch(fromWarehouse, lineItemNumber, ItemGridindex);

            // NEW: BindDeliveryNoteBatchTable() only appends rows — it never
            // applied alignment/widths, so Qty Available / Qty Reserved /
            // Delivered Qty stayed right-aligned (Bootstrap's text-end) until
            // the user typed into a field and triggered the delegated
            // input/change/blur handler further down.
            ApplyBatchFieldWidths("#DeliveryNoteBatchList");

            $("#DeliveryNoteBatchModal").modal("show");
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

$("#DeliveryNoteBatchModal").on("shown.bs.modal", function () {

    setTimeout(function () {

        let input = document.querySelector(
            '#DeliveryNoteBatchTableBody tr:not([style*="display:none"]) .JODNI_BCH_QtyInvoice'
        );

        if (input) {
            input.focus();
            input.select();
        }

    }, 200);

});

//#endregion SHOW BATCH



function BindDeliveryNoteBatchTable() {

    $("#DeliveryNoteBatchTableBody").find(".DeliveryNoteBatchRow").remove();

    $.each(DeliveryNoteBatchList_Edit, function (index, data) {

        // Check required values
        if (
            data.JODNI_BCH_WH_Number != undefined &&
            data.JODNI_BCH_JODNI_Number != undefined &&
            data.JODNI_BCH_WH_Name != undefined &&
            data.JODNI_BCH_BatchDate != undefined &&
            data.JODNI_BCH_BatchNo != undefined &&
            data.JODNI_BCH_QtyAvailable != undefined
        ) {

            let row =
                $("#DeliveryNoteBatchTemplateRow")
                    .clone()
                    .removeAttr("id")
                    .removeAttr("style")
                    .show()
                    .addClass("DeliveryNoteBatchRow");

            row.find(".JODNI_BCH_WH_Number")
                .val(data.JODNI_BCH_WH_Number);

            row.find(".JODNI_BCH_JODNI_Number")
                .val(data.JODNI_BCH_JODNI_Number);

            row.find(".JODNI_BCH_WH_Name")
                .val(data.JODNI_BCH_WH_Name);

            row.find(".JODNI_BCH_BatchDate")
                .val(data.JODNI_BCH_BatchDate);

            row.find(".JODNI_BCH_BatchNo")
                .val(data.JODNI_BCH_BatchNo);
            row.find(".JODNI_BCH_Number")
                .val(data.JODNI_BCH_Number);

            row.find(".JODNI_BCH_QtyAvailable").val(addComma(data.JODNI_BCH_QtyAvailable, "q"));
            row.find(".JODNI_BCH_QtyReserved").val(addComma(data.JODNI_BCH_QtyReserved, "q"));
            row.find(".JODNI_BCH_QtyInvoice").val(addComma(data.JODNI_BCH_QtyInvoice, "q"));
            row.find(".JODNI_BCH_BatchUnitPrice").val(addComma(data.JODNI_BCH_BatchUnitPrice, "c"));
            row.find(".JODNI_BCH_BatchValue").val(addComma(data.JODNI_BCH_BatchValue, "c"));

            row.find(".JODNI_Number")
                .val(data.JODNI_Number);

            row.find(".JODNH_Number")
                .val(data.JODNH_Number);
            row.find(".RefBatch_Number")
                .val(data.RefBatch_Number);

            $("#DeliveryNoteBatchTableBody").append(row);

        }

    });

    CalculateBatchFooter();
}

//#region FOOTER TOTAL
function CalculateBatchFooter() {

    let totalQty = 0;
    let totalValue = 0;
    let totalAvailableQty = 0;

    $("#DeliveryNoteBatchTableBody tr.DeliveryNoteBatchRow")
        .each(function () {

            totalQty += parseFloat(removeComma($(this).find(".JODNI_BCH_QtyInvoice").val())) || 0;
            totalAvailableQty += parseFloat(removeComma($(this).find(".JODNI_BCH_QtyAvailable").val())) || 0;
            totalValue += parseFloat(removeComma($(this).find(".JODNI_BCH_BatchValue").val())) || 0;
        });
    $("#TotalBatchQty").val(addComma(totalQty, "q"));
    $("#TotalBatchValue").val(addComma(totalValue, "c"));
    $("#TotalAvailableQty").val(addComma(totalAvailableQty, "q"));
}
//#endregion

function BindDeliveryNoteOtherBatchTable(response) {

    let tbody = $("#DeliveryNoteOtherBatchTableBody");

    // Clear all rows except template
    tbody.find(".DeliveryNoteOtherBatchRow").remove();

    $.each(response, function (index, data) {

        let row =
            $("#DeliveryNoteOtherBatchTemplateRow")
                .clone()
                .removeAttr("id")
                .removeAttr("style")
                .show()
                .addClass("DeliveryNoteOtherBatchRow");

        row.find(".JODNI_BCH_Number")
            .val(data.lineBatch_Number);

        row.find(".JODNI_BCH_WH_Number")
            .val(data.fromWarehouse);

        row.find(".JODNI_BCH_WH_Name")
            .val(data.wareHouseCode);

        row.find(".JODNI_BCH_BatchDate")
            .val(data.batchDate);

        row.find(".JODNI_BCH_BatchNo")
            .val(data.batchNo);

        row.find(".JODNI_BCH_AvailableQty")
            .val(data.availableQty);

        row.find(".JODNI_BCH_BatchUnitPrice")
            .val(data.batchUnitPrice);

        row.find(".JODNI_BCH_BatchValue")
            .val(data.batchValue);

        tbody.append(row);

    });

    // CalculateOtherBatchFooter();
}


function BindOtherBatch(fromWarehouse, lineItemNumber, ItemGridindex) {
    //#region AJAX

    $.ajax({

        url: "/joboutward/transactions/delivery-note/other-batch-details",

        type: "GET",

        data: {
            FromWarehouse: fromWarehouse,
            LineItem_Number: lineItemNumber,
            ItemGridIndex: ItemGridindex
        },

        success: function (response) {

            console.log(response);
            BindDeliveryNoteOtherBatchTable(response);

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


$(document).on('input', ".JODNI_BCH_QtyInvoice", function (event) {

    var row = $(this).closest("tr");

    var QtyAvailable =
        parseFloat(removeComma(row.find(".JODNI_BCH_QtyAvailable").val())) || 0;

    var QtyReserved =
        parseFloat(removeComma(row.find(".JODNI_BCH_QtyReserved").val())) || 0;

    var QtyInvoiceInput = row.find(".JODNI_BCH_QtyInvoice");

    var QtyInvoice =
        parseFloat(removeComma(QtyInvoiceInput.val())) || 0;

    var BalanceQty = QtyAvailable - QtyReserved;

    if (QtyInvoice > BalanceQty) {

        alert(
            "Invoice Qty (" + QtyInvoice +
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
    ".JODNI_BCH_QtyInvoice, .JODNI_BCH_BatchUnitPrice",
    function () {
        let row = $(this).closest("tr");
        let qty = parseFloat(removeComma(row.find(".JODNI_BCH_QtyInvoice").val())) || 0;
        let price = parseFloat(removeComma(row.find(".JODNI_BCH_BatchUnitPrice").val())) || 0;
        row.find(".JODNI_BCH_BatchValue").val(addComma(qty * price, "c"));
        CalculateBatchFooter();
    });
//#endregion

//#region VALIDATE EXISTING BATCH ROWS

function ValidateExistingBatchRows_Edit() {

    let isValid = true;

    $("#DeliveryNoteBatchTableBody tr.DeliveryNoteBatchRow")
        .each(function () {

            let row = $(this);

            row.removeClass("table-danger");

            let batchNo =
                row.find(".JODNI_BCH_BatchNo")
                    .val()
                    ?.trim();

            let qty =
                row.find(".JODNI_BCH_QtyInvoice")
                    .val()
                    ?.trim();

            let price =
                row.find(".JODNI_BCH_BatchUnitPrice")
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


//#region QTY INVOICE VALIDATION
function ValidateBatchQty_Edit() {

    let InvoiceQty =
        parseFloat(removeComma($("#BatchPopupQty").text())) || 0;

    let BatchQty = $("#DeliveryNoteBatchTableBody tr")
        .not("#DeliveryNoteBatchTemplateRow")
        .map(function () {

            return parseFloat(
                removeComma(
                    $(this).find(".JODNI_BCH_QtyInvoice").val()
                )
            ) || 0;

        }).get()
        .reduce((sum, qty) => sum + qty, 0);

    console.log("InvoiceQty :", InvoiceQty);
    console.log("BatchQty :", BatchQty);

    if (InvoiceQty !== BatchQty) {

        alert("Qty Mismatch !");

        CloseDeliveryNoteBatchModal_Edit();


        return false;
    }

    return true;
}
//#endregion

//#region closepop
function CloseDeliveryNoteBatchModal_Edit() {

    const modal = $("#DeliveryNoteBatchModal");

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
            .find(".JODNI_Qty");

    if (QtyInput.length > 0) {

        QtyInput.focus();
        QtyInput.select();

    }

}
//#endregion

//#region SAVE TEMP BATCH (BULK VERSION)
function SaveTempBatch_Edit() {

    let batchList = [];

    $("#DeliveryNoteBatchTableBody tr.DeliveryNoteBatchRow:visible").each(function () {

        let currentRow = $(this);

        if (currentRow.length == 0)
            return;
        let Qty = parseFloat(removeComma(currentRow.find(".JODNI_BCH_QtyInvoice").val())) || 0;


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
            DBCH_Number:
                parseInt(currentRow.find(".JODNI_BCH_Number").val()) || 0,

            DBCH_Index:
                parseInt(CurrentItemGridRowIndex) || 0,

            DBCH_DBCH_Number:
                parseInt(currentRow.find(".JODNI_BCH_Number").val()) || 0,

            DBCH_Item_Number:
                parseInt(currentRow.find(".JODNI_BCH_JODNI_Number").val()) || 0,

            DBCH_Warehouse_Number:
                parseInt(currentRow.find(".JODNI_BCH_WH_Number").val()) || 0,

            DBCH_Date:
                new Date(currentRow.find(".JODNI_BCH_BatchDate").val()).toISOString(),

            DBCH_No:
                currentRow.find(".JODNI_BCH_BatchNo").val(),

            DBCH_Qty: Qty,

            DBCH_UnitPrice: parseFloat(removeComma(currentRow.find(".JODNI_BCH_BatchUnitPrice").val())) || 0,
            DBCH_Value: parseFloat(removeComma(currentRow.find(".JODNI_BCH_BatchValue").val())) || 0,

            JODNI_NUMBER:
                parseInt(currentRow.find(".JODNI_Number").val()) || 0,

            JODNH_NUMBER:
                parseInt(currentRow.find(".JODNH_Number").val()) || 0,

            RefBatch_Number:
                parseInt(currentRow.find(".RefBatch_Number").val()) || 0,
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

        url: '/joboutward/transactions/delivery-note/save-temp-batch',

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


//#region SAVE TEMP DELIVERY BATCH

function SaveTempBatch_AddRow(ItemGridindex) {

    //#region VALIDATION

    let checkedCheckbox = $(".CheckItem:checked");

    if (checkedCheckbox.length <= 0) {

        alert("Select one row");
        return;
    }

    //#endregion

    //#region GET SELECTED ROW

    let selectedRow = checkedCheckbox.closest("tr");



    //#endregion

    //#region MODEL

    let model = {

        DBCH_Index:
            parseInt(ItemGridindex) || 0,

        DBCH_Item_Number:
            parseInt(selectedRow.find(".JODNI_Item_Number").val()) || 0,

        DBCH_Warehouse_Number:
            parseInt(selectedRow.find(".JODNI_WH_Number").val()) || 0,

        DBCH_DBCH_Number: 0
    };

    //#endregion

    console.log(model);

    //#region AJAX SAVE

    $.ajax({

        url: '/joboutward/transactions/delivery-note/save-temp-batch-add-row',

        type: 'POST',

        data: model,

        success: function (response) {

            console.log(response);


        },

        error: function (xhr) {

            console.log(xhr.responseText);
        }
    });

    //#endregion
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


        CloseDeliveryNoteBatchModal_Edit();

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

        $("#DeliveryNoteBatchTableBody tr.DeliveryNoteBatchRow")
            .each(function () {

                let row = $(this);

                let batchObj = {

                    RowID: rowID,

                    JODNI_BCH_WH_Number:
                        row.find(".JODNI_BCH_WH_Number").val(),
                    JODNI_BCH_JODNI_Number:
                        row.find(".JODNI_BCH_JODNI_Number").val(),
                    JODNI_BCH_WH_Name:
                        row.find(".JODNI_BCH_WH_Name").val(),

                    JODNI_BCH_BatchDate:
                        row.find(".JODNI_BCH_BatchDate").val(),

                    JODNI_BCH_Number:
                        row.find(".JODNI_BCH_Number").val(),

                    JODNI_BCH_BatchNo:
                        row.find(".JODNI_BCH_BatchNo").val(),

                    JODNI_BCH_QtyAvailable:
                        row.find(".JODNI_BCH_QtyAvailable").val(),

                    JODNI_BCH_QtyReserved:
                        row.find(".JODNI_BCH_QtyReserved").val(),

                    JODNI_BCH_QtyInvoice:
                        row.find(".JODNI_BCH_QtyInvoice").val(),

                    JODNI_BCH_BatchUnitPrice:
                        row.find(".JODNI_BCH_BatchUnitPrice").val(),

                    JODNI_BCH_BatchValue:
                        row.find(".JODNI_BCH_BatchValue").val(),
                    JODNI_NUMBER:
                        parseInt(row.find(".JODNI_Number").val()) || 0,

                    JODNH_NUMBER:
                        parseInt(row.find(".JODNH_Number").val()) || 0,

                    RefBatch_Number:
                        parseInt(row.find(".RefBatch_Number").val()) || 0

                };

                batchList.push(batchObj);
                //    SaveTempBatch(row);

            });

        // REMOVE OLD SAME ROW DATA
        DeliveryNoteItemBatchList_Edit =
            DeliveryNoteItemBatchList_Edit.filter(
                x => x.RowID != rowID
            );

        // SAVE NEW DATA
        DeliveryNoteItemBatchList_Edit.push({

            RowID: rowID,

            BatchList: batchList
        });

        //#region CONSOLE

        // console.clear();

        console.log("CURRENT ROW ID");
        console.log(rowID);
        let firstRecord = batchList[0];

        if (firstRecord.JODNI_NUMBER == "") {
            SaveTempBatch_Edit();
        } else if (parseInt(firstRecord.JODNI_NUMBER) > 0) {
            SaveTempBatch_Edit();
        }



        //#endregion

        $("#DeliveryNoteBatchModal")
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

    // 1. DN No
    if ($("#Header_JODNH_DN_No").val().trim() === "") {
        showAlert('Delivery Note No. is required', '#Header_JODNH_DN_No');

        return false;
    }

    // 2. DN Date
    if ($("#Header_JODNH_DN_Date").val().trim() === "") {
        showAlert('DN Date is required', '#Header_JODNH_DN_Date');

        return false;
    }

    // 3. Material Segregation
    if ($("#Header_JODNH_MS_Number").val() === "" || $("#Header_JODNH_MS_Number").val() === "0") {
        showAlert('Material Segregation is required', '#Header_JODNH_MS_Number');

        return false;
    }

    // 4. JW Vendor
    if ($("#Header_JODNH_JW_Vendor_Number").val().trim() === "" ||
        $("#Header_JODNH_JW_Vendor_Name").val().trim() === "") {

        showAlert('JW Vendor is required', '#Header_JODNH_JW_Vendor_Name');

        return false;
    }

    // 5. Currency
    if ($("#Header_JODNH_Currency_Number").val() === "" || $("#Header_JODNH_Currency_Number").val() === "0") {
        showAlert('Currency is required', '#Header_JODNH_Currency_Number');

        return false;
    }

    // 6. Warehouse
    if ($("#Header_JODNH_WH_Number").val() === "" || $("#Header_JODNH_WH_Number").val() === "0") {
        showAlert('Warehouse is required', '#Header_JODNH_WH_Number');

        return false;
    }




    // =========================
    // GRID VALIDATION CALL
    // =========================
    if (!validateItemGrid_Edit()) {
        return false;
    }
    //if (!validateAddressGrid_Edit()) {
    //    return false;
    //}
    //if (!validateDeliveryNoteBatchList_Edit()) {
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
//#region VALIDATE ITEM GRID,batchgrid,address
function validateAddressGrid_Edit() {

    let hasRow = false;
    let valid = true;

    $("#AddTableBody tr.AddNewRow").each(function () {

        let row = $(this);

        if (row.find(".JODNA_IsDeleted").val() === "1") return;

        let type = row.find(".JODNA_ADTP_Number").val();
        let addr = row.find(".JODNA_Address_ID").val();

        if (type && addr) {
            hasRow = true;
        }

        if (type && !addr) {
            showAlert('Address ID required');
            row.find(".JODNA_Address_ID").focus();
            valid = false;
            return false;
        }

        if (!type && addr) {
            showAlert('Address Type required');
            row.find(".JODNA_ADTP_Number").focus();
            valid = false;
            return false;
        }
    });

    if (!hasRow) {
        showAlert('Please add at least one address');
        return false;
    }

    return valid;
}



function validateItemGrid_Edit() {

    let hasValidRow = false;

    let isValid = true;

    $("#ItemTable tbody tr").each(function () {

        let row = $(this);

        // skip template row
        if (row.hasClass("TempRow")) return;

        // skip deleted row
        if (row.find(".JODNI_IsDeleted").val() === "1") return;

        let process = row.find(".JODNI_JPRS_Number").val();
        let itemCode = row.find(".JODNI_Item_Code").val();
        let qty = row.find(".JODNI_Qty").val();
        let unitPrice = row.find(".JODNI_UnitPrice").val();

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
                row.find(".JODNI_JPRS_Number")
            );
            isValid = false;
            return false; // break loop
        }

        // validate Item Code
        if (!itemCode || itemCode.trim() === "") {
            showAlert('Item Code is required', row.find(".JODNI_Item_Code"));

            isValid = false;
            return false;
        }

        // validate Qty
        if (!qty || qty.trim() === "" || (parseFloat(removeComma(qty)) || 0) <= 0) {
            showAlert('Qty is required', row.find(".JODNI_Qty"));

            isValid = false;
            return false;
        }

        // validate Unit Price
        if (!unitPrice || unitPrice.trim() === "" || (parseFloat(removeComma(unitPrice)) || 0) <= 0) {
            showAlert('Unit Price is required', row.find(".JODNI_UnitPrice"));

            isValid = false;
            return false;
        }

        // validate From WH / To WH when Freight Applicable is checked
        if (row.find(".JODNI_IsFreightApplicable").is(":checked")) {

            let fromWH = row.find(".JODNI_FromWH_Number").val();
            let toWH = row.find(".JODNI_ToWH_Number").val();

            if (!fromWH || fromWH === "0") {
                showAlert("From WH is required.", row.find(".JODNI_FromWH_Number"));
                isValid = false;
                return false;
            }

            if (!toWH || toWH === "0") {
                showAlert("To WH is required.", row.find(".JODNI_ToWH_Number"));
                isValid = false;
                return false;
            }
        }

    });

    // no valid row added
    if (!hasValidRow) {
        showAlert('Please add at least one item in grid', "#ItemTable tbody tr:first .JODNI_JPRS_Number");
        //row.find(".JODNI_JPRS_Number").focus();
        return false;
    }

    return isValid;
}


//#endregion VALIDATE ITEM GRID

//#region VALIDATE DELIVERY NOTE BATCH LIST

function validateDeliveryNoteBatchList_Edit() {

    let batchRows =
        $("#DeliveryNoteBatchList tbody tr")
            .not("#DeliveryNoteBatchTemplateRow");

    let hasValidQty = false;

    batchRows.each(function () {

        let row = $(this);

        let qty = removeComma(row.find(".JODNI_BCH_QtyInvoice").val());
        qty = parseFloat(qty) || 0;

        if (qty > 0) {

            hasValidQty = true;

            return false;
        }

    });

    if (!hasValidQty) {

        showAlert(
            "Please enter Delivered Qty in batch details",
            '#DeliveryNoteBatchList tbody tr:visible:first .JODNI_BCH_QtyInvoice'
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

        var model = CreateDeliveryNoteModel_Edit();
        DeleteRemovedRows(model);





    }

});
function DeleteRemovedRows(model) {

    $.ajax({

        url: '/joboutward/transactions/delivery-note/delete-removed-rows',

        type: 'POST',

        contentType: 'application/json',

        data: JSON.stringify(deletedRows),

        success: function () {

            UpdateDeliveryNote(model);
        },

        error: function (xhr) {

            console.log(xhr.responseText);
            showAlert('Update failed: ' + xhr.responseText);
            $("#btnUpdate").prop("disabled", false);

        }

    });
}

function UpdateDeliveryNote(model) {
    $.ajax({

        url: '/joboutward/transactions/delivery-note/update',

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

function CreateDeliveryNoteBatchModel_Edit() {

    let deliveryNoteBatches = [];

    $.each(DeliveryNoteItemBatchList_Edit, function () {

        let itemBatch = this;

        // Skip empty batch list
        if (!itemBatch.BatchList || itemBatch.BatchList.length <= 0) {
            return true;
        }

        $.each(itemBatch.BatchList, function () {

            let batch = this;

            // Skip empty qty
            if (
                !batch.JODNI_BCH_QtyInvoice ||
                parseFloat((batch.JODNI_BCH_QtyInvoice || "0").toString().replace(/,/g, "")) <= 0
            ) {
                return true;
            }

            //#region FORMAT DATE

            let formattedBatchDate = null;

            if (batch.JODNI_BCH_BatchDate) {

                let date = new Date(batch.JODNI_BCH_BatchDate);

                if (!isNaN(date.getTime())) {
                    formattedBatchDate = date.toISOString();
                }
            }

            //#endregion

            let deliveryNoteBatch = {

                JODNI_BCH_Number:
                    parseInt(batch.JODNI_BCH_Number) || 0,

                JODNI_BCH_JODNH_Number:
                    parseInt(batch.JODNI_BCH_JODNH_Number) || 0,

                JODNI_BCH_JODNI_Number:
                    parseInt(batch.JODNI_BCH_JODNI_Number) || 0,

                JODNI_BCH_WH_Number:
                    parseInt(batch.JODNI_BCH_WH_Number) || 0,

                // FIXED DATE FORMAT
                JODNI_BCH_BatchDate:
                    formattedBatchDate,

                JODNI_BCH_BatchNo:
                    batch.JODNI_BCH_BatchNo || "",

                JODNI_BCH_BatchQty:
                    parseFloat((batch.JODNI_BCH_QtyInvoice || "0").toString().replace(/,/g, "")) || 0,

                JODNI_BCH_BatchUnitPrice:
                    parseFloat((batch.JODNI_BCH_BatchUnitPrice || "0").toString().replace(/,/g, "")) || 0,

                JODNI_BCH_BatchValue:
                    parseFloat((batch.JODNI_BCH_BatchValue || "0").toString().replace(/,/g, "")) || 0,

                RefBatch_Number:
                    parseInt(batch.RefBatch_Number) || 0,

                JODNH_Number:
                    parseInt(batch.JODNH_Number) || 0,

                JODNI_Number:
                    parseInt(batch.JODNI_Number) || 0
            };

            deliveryNoteBatches.push(deliveryNoteBatch);

        });

    });

    return deliveryNoteBatches;
}

function CreateDeliveryNoteModel_Edit() {

    // =====================================
    // HEADER
    // =====================================
    var header = {

        JODNH_Number:
            parseInt($("#Header_JODNH_Number").val()) || 0,

        JODNH_DN_No:
            $("#Header_JODNH_DN_No").val(),

        JODNH_DN_Date:
            new Date($("#Header_JODNH_DN_Date").val())
                .toISOString(),

        JODNH_MS_Number:
            parseInt($("#Header_JODNH_MS_Number").val()) || 0,

        JODNH_JW_Vendor_Number:
            parseInt($("#Header_JODNH_JW_Vendor_Number").val()) || 0,

        JODNI_Item_Code:
            $("#Header_JODNI_Item_Code").val(),

        JODNH_JW_Vendor_Name:
            $("#Header_JODNH_JW_Vendor_Name").val(),

        JODNH_Currency_Number:
            parseInt($("#Header_JODNH_Currency_Number").val()) || 0,

        JODNH_WH_Number:
            parseInt($("#Header_JODNH_WH_Number").val()) || 0,

        JODNH_PaymentTerms:
            $("#Header_JODNH_PaymentTerms").val(),

        JODNH_DeliveryTerms:
            $("#Header_JODNH_DeliveryTerms").val(),

        JODNH_DeliveryMode:
            $("#Header_JODNH_DeliveryMode").val(),

        JODNH_DespatchDocumentNo:
            $("#Header_JODNH_DespatchDocumentNo").val(),

        JODNH_DespatchedThrough:
            $("#Header_JODNH_DespatchedThrough").val(),

        JODNH_Remarks:
            $("#Header_JODNH_Remarks").val(),

        JODNH_IsFreightApplicable:
            $("#Header_Freight_Applicable").is(":checked") ? "Yes" : "No",

        DN_Id:
            parseInt($("#Header_DN_Id").val()) || null,

        DN_JWV_Number:
            parseInt($("#Header_JODNH_JW_Vendor_Number").val()) || null,

        DN_ADD_ADTP_Number:
            parseInt($("#Header_DN_ADD_ADTP_Number").val()) || null
    };

    // =====================================
    // ITEMS
    // =====================================
    var items = [];

    $("#ItemTable tbody tr.NewRow").each(function () {

        let row = $(this);

        // Skip deleted rows
        if (row.find(".JODNI_IsDeleted").val() == "true") {
            return;
        }

        // Skip empty rows
        if (!row.find(".JODNI_Item_Number").val()) {
            return;
        }

        let item = {

            JODNI_JODNH_Number:
                parseInt(row.find(".JODNI_JODNH_Number").val()) || 0,

            JODNI_Number:
                parseInt(row.find(".JODNI_Number").val()) || 0,

            JODNI_JPRS_Number:
                parseInt(row.find(".JODNI_JPRS_Number").val()) || 0,

            JODNI_Item_Number:
                parseInt(row.find(".JODNI_Item_Number").val()) || 0,

            JODNI_WH_Number:
                parseInt(row.find(".JODNI_WH_Number").val()) || 0,

            JODNI_UoM_Number:
                parseInt(row.find(".JODNI_UoM_Number").val()) || 0,

            JODNI_Qty:
                parseFloat((row.find(".JODNI_Qty").val() || "0").replace(/,/g, "")) || 0,

            JODNI_Qty_Kgs:
                parseFloat((row.find(".JODNI_Qty_Kgs").val() || "0").replace(/,/g, "")) || 0,

            JODNI_UnitPrice:
                parseFloat((row.find(".JODNI_UnitPrice").val() || "0").replace(/,/g, "")) || 0,

            JODNI_Amount:
                parseFloat((row.find(".JODNI_Amount").val() || "0").replace(/,/g, "")) || 0,

            JODNI_IsFreightApplicable:
                row.find(".JODNI_IsFreightApplicable").is(":checked")
                    ? "Yes"
                    : "No",

            JODNI_JOFRT_SVOH_Number:
                parseInt(row.find(".JODNI_JOFRT_SVOH_Number").val()) || 0,

            JODNI_FromWH_Number:
                parseInt(row.find(".JODNI_FromWH_Number").val()) || null,

            JODNI_ToWH_Number:
                parseInt(row.find(".JODNI_ToWH_Number").val()) || null,

            // Freight SO Item ID - needed by the freight qty check
            JODNI_JOFRT_SVOI_Number:
                parseInt(row.find(".JODNI_JOFRT_SVOI_Number_Row").val()) || 0
        };

        items.push(item);

    });

    // =====================================
    // ADDRESS
    // =====================================
    var addresses = [];

    $("#AddTableBody tr.AddNewRow").each(function () {

        let row = $(this);

        // Skip deleted rows
        if (row.find(".JODNA_IsDeleted").val() == "1") {
            return;
        }

        // Skip empty rows
        if (!row.find(".JODNA_Address_ID").val()) {
            return;
        }

        let address = {

            JODNA_JODNH_Number:
                parseInt(row.find(".JODNA_JODNH_Number").val()) || 0,

            JODNA_Number:
                parseInt(row.find(".JODNA_Number").val()) || 0,

            JODNA_ADTP_Number:
                parseInt(row.find(".JODNA_ADTP_Number").val()) || 0,

            JODNA_Address_ID:
                row.find(".JODNA_Address_ID").val(),

            JODNA_Address:
                row.find(".JODNA_Address").text(),

            JODNA_City:
                row.find(".JODNA_City").val(),

            JODNA_State:
                row.find(".JODNA_State").val(),

            JODNA_Country:
                row.find(".JODNA_Country").val(),

            JODNA_PIN:
                row.find(".JODNA_PIN").val(),

            JODNA_GSTIN:
                row.find(".JODNA_GSTIN").val()
        };

        addresses.push(address);

    });


    // =====================================
    // FINAL MODEL
    // =====================================
    var deliveryNoteModel = {

        Header: header,
        Items: items,
        deliveryNoteBatches: CreateDeliveryNoteBatchModel_Edit(),
        Addresses: addresses

    };
    console.log(deliveryNoteModel)

    return deliveryNoteModel;

}

//#endregion Save Function

//#region CLICK ADDRESS BUTTON, ADD ADDRESS ROW, DELETE ADDRESS ROW
function ShowBuyerAddressPopup() {

    ResizeAddressColumns();

    $("#BuyerAddress")
        .off("shown.bs.modal.resize")
        .one("shown.bs.modal.resize", function () {
            ResizeAddressPopup();
        });

    $("#BuyerAddress").modal("show");
}
$("#AddressButton").on("click", function () {
    ShowBuyerAddressPopup();
});
let addressIndex = 0;

$("#AddressAddButton").on("click", function () {

    if (!validateTempRow_Edit()) return;

    addAddressRow_Edit();
});
$(document).on("click", ".AddRowRemove", function () {

    let row = $(this).closest("tr");

    row.find(".JODNA_IsDeleted").val("1");
    row.hide();
});
//#endregion CLICK ADDRESS BUTTON


//#region CHANGE ADDRESS TYPE
function isDuplicateAddress(type, currentRow) {
    var isDuplicate = false;

    $('tr.AddNewRow').not(currentRow).each(function () {

        var rowType = $(this).find('select.JODNA_ADTP_Number').val();
        var isDeleted = parseInt($(this).find("input.JODNA_IsDeleted").val());

        if (isDeleted !== 1) {
            if (rowType === type) {
                isDuplicate = true;
                return false; // break loop
            }
        }
    });

    return isDuplicate;
}
$(document).on('change', 'tr.AddNewRow select.JODNA_ADTP_Number', function () {

    var currentRow = $(this).closest('tr.AddNewRow');

    var ADTPNumber = currentRow.find('.JODNA_ADTP_Number').val();
    var Buyer = $('#Header_JODNH_JW_Vendor_Number').val();
    var ADDAddress_ID = currentRow.find('.JODNA_Address_ID');
    var ADDAddress = currentRow.find('.JODNA_Address');
    var ADDCity = currentRow.find('.JODNA_City');
    var ADDState = currentRow.find('.JODNA_State');
    var ADDCountry = currentRow.find('.JODNA_Country');
    var ADDPin = currentRow.find('.JODNA_PIN');
    var ADDGSTIN = currentRow.find('.JODNA_GSTIN');

    if (ADTPNumber && isDuplicateAddress(ADTPNumber, currentRow)) {
        alert('This Address Type already exists!');
        $(this).val('');
        $(this).focus();
        return;
    }

    $.ajax({
        type: "GET",
        url: "/joboutward/transactions/delivery-note/vendor-address",
        data: { Vendor: Buyer, ADTPNumber: ADTPNumber },
        dataType: "json",
        success: function (data) {

            var AddressID = data.addressIds || [];
            var AddressDefault = data.address;

            // set default + fill fields
            if (AddressDefault != null) {
                //  $AddressDropdown.val(AddressDefault.jwV_ADD_Address_ID);
                ADDAddress_ID.val(AddressDefault.jwV_ADD_Address_ID);
                ADDAddress.text(AddressDefault.jwV_ADD_Address);
                ADDCity.val(AddressDefault.jwV_ADD_City);
                ADDState.val(AddressDefault.jwV_ADD_State);
                ADDCountry.val(AddressDefault.jwV_ADD_Country);
                ADDPin.val(AddressDefault.jwV_ADD_Pin);
                ADDGSTIN.val(AddressDefault.jwV_ADD_GSTIN);
            }
        }
    });
});
//#endregion CHANGE ADDRESS TYPE



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
    $(".jwcustomer-search-results").hide().html("");

}
//#endregion

//#region datebind
function DateBind() {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var formattedDate = day + "-" + months[today.getMonth()] + "-" + today.getFullYear();

    var fp = document.getElementById("Header_JODNH_DN_Date")._flatpickr;
    if (fp) fp.setDate(formattedDate, true, "d-M-Y");
}
//#endregion

function addAddressRow_Edit() {

    let i = addressIndex;

    let $row = $("#AddTempRow").clone();

    $row.removeAttr("id");
    $row.addClass("AddNewRow");
    $row.show();

    // 1. Address Type
    $row.find(".JODNA_ADTP_Number")
        .val("")
        .attr("name", `Addresses[${i}].JODNA_ADTP_Number`);

    // 2. Address ID
    $row.find(".JODNA_Address_ID")
        .val("")
        .attr("name", `Addresses[${i}].JODNA_Address_ID`);

    // 3. Address
    $row.find(".JODNA_Address")
        .text("")
        .attr("name", `Addresses[${i}].JODNA_Address`);

    // 4. City
    $row.find(".JODNA_City")
        .val("")
        .attr("name", `Addresses[${i}].JODNA_City`);

    // 5. State
    $row.find(".JODNA_State")
        .val("")
        .attr("name", `Addresses[${i}].JODNA_State`);

    // 6. Country
    $row.find(".JODNA_Country")
        .val("")
        .attr("name", `Addresses[${i}].JODNA_Country`);

    // 7. PIN
    $row.find(".JODNA_PIN")
        .val("")
        .attr("name", `Addresses[${i}].JODNA_PIN`);

    // 8. GSTIN
    $row.find(".JODNA_GSTIN")
        .val("")
        .attr("name", `Addresses[${i}].JODNA_GSTIN`);

    // 9. Delete flag
    $row.find(".JODNA_IsDeleted")
        .val("0")
        .attr("name", `Addresses[${i}].JODNA_IsDeleted`);

    $("#AddTableBody").append($row);

    addressIndex++;
}


function validateTempRow_Edit() {

    let row = $("#AddTempRow");

    if (!row.find(".JODNA_ADTP_Number").val()) {
        showAlert('Address Type is required');
        return false;
    }

    if (!row.find(".JODNA_Address_ID").val()) {
        showAlert('Address ID is required');
        return false;
    }

    return true;
}

function validateBatchDetailsDB() {

    let isValid = true;
    let p_JODNH_Number =
        new URLSearchParams(window.location.search)
            .get("JODNH_Number");
    G_JINH_Number = p_JODNH_Number;

    $.ajax({

        url: "/joboutward/transactions/delivery-note/validate-batch-details",

        type: "GET",

        async: false,

        data: {
            JODNH_Number: G_JINH_Number
        },

        success: function (response) {

            if (!response.status) {

                showAlert(
                    response.message,
                    "#DeliveryNoteBatchList tbody tr:visible:first .JODNI_BCH_QtyInvoice"
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

    let p_JODNH_Number =
        new URLSearchParams(window.location.search)
            .get("JODNH_Number");

    G_JINH_Number = p_JODNH_Number;

    $.ajax({

        url: "/joboutward/transactions/delivery-note/validate-amended-batch-qty",
        type: "GET",
        async: false,
        data: {
            JODNH_Number: G_JINH_Number
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
                    removeComma(row.find(".JODNI_Qty").val())
                ) || 0;

                let dbchIndex = index + 1;

                let dbRow = dbData.find(x =>
                    x.dbcH_Index === dbchIndex
                );

                let dbQty = dbRow
                    ? parseFloat(dbRow.dbcH_Qty)
                    : 0;

                if (gridQty !== dbQty) {

                    isValid = false;

                    showAlert(
                        "Qty mismatch at Row " + dbchIndex +
                        " (DB: " + dbQty + ", Grid: " + gridQty + ")",
                        row.find(".JODNI_Qty")
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

$(document).on("change", ".JODNI_WH_Number, .JODNI_Item_Code", function () {

    let row = $(this).closest("tr");
    let DBCH_Index =
        row.index(
            "#ItemTable tbody tr.NewRow:visible"
        ) + 1;
    let itemNumber = row.find(".JODNI_Item_Number").val();
    let warehouseNumber = row.find(".JODNI_WH_Number").val();
    let JODNI_Number = row.find(".JODNI_Number").val();
    let JODNH_Number = new URLSearchParams(window.location.search).get("JODNH_Number");
    setTimeout(function () {
        SaveTempBatch_Edit();
        EditItemRowTempTable(itemNumber, warehouseNumber, JODNI_Number, JODNH_Number, DBCH_Index);
    }, 100);

});


//#region jwc address
$("#AddressButton").on("click", function () {

    // View page: just show whatever is in the grid
    if (isViewModePage()) {
        ShowBuyerAddressPopup();
        return;
    }

    if (!$("#Header_JODNH_JW_Vendor_Number").val()) {
        showAlert('JW Vendor is required', '#Header_JODNH_JW_Vendor_Name');
        return;
    }

    if ($("#AddTableBody tr.AddNewRow:visible").length === 0) {
        LoadVendorAddress_Edit();
    } else {
        ShowBuyerAddressPopup();
    }
});

// One row per Address Type; Address ID / details are filled by the
// Address Type change handler (vendor-address call)
function LoadVendorAddress_Edit() {

    $("#AddTempRow .JODNA_ADTP_Number option").each(function () {

        let typeValue = $(this).val();
        if (!typeValue) return;

        addAddressRow_Edit();
        $("#AddTableBody tr.AddNewRow:last")
            .find(".JODNA_ADTP_Number")
            .val(typeValue)
            .trigger("change");
    });

    setTimeout(function () {

        // drop rows for which the vendor has no address of that type
        $("#AddTableBody tr.AddNewRow").each(function () {
            if (!$(this).find(".JODNA_Address_ID").val()) {
                $(this).find(".JODNA_IsDeleted").val("1");
                $(this).hide();
            }
        });

        ShowBuyerAddressPopup();
    }, 700);
}

function ResizeAddressPopup(tableSelector = "#AddressTable", modalSelector = "#BuyerAddress") {

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

//#endregion


//#region comma format on focusout - Batch WH row fields (Edit)
$(document).on("focusout",
    ".JODNI_BCH_QtyAvailable, .JODNI_BCH_QtyReserved, .JODNI_BCH_QtyInvoice, .JODNI_BCH_BatchUnitPrice, .JODNI_BCH_BatchValue",
    function () {

        let isQty =
            $(this).hasClass("JODNI_BCH_QtyAvailable") ||
            $(this).hasClass("JODNI_BCH_QtyReserved") ||
            $(this).hasClass("JODNI_BCH_QtyInvoice");

        let type = isQty ? "q" : "c";

        $(this).val(addComma($(this).val(), type));
    });
//#endregion