$(document).ready(function () {
    //#region JW_Customer – Focus In
    // Handled via inline onfocus="ShowCustomerPane();OnBuyerSelectCall(this)"
    // in the .cshtml — no delegated binding needed.
    //#endregion

    //#region JW_Customer – Text change
    // Handled via inline oninput="OnBuyerInput(this)" in the .cshtml.
    //#endregion

    //#region JW_Customer – Focus Out
    $(document).on("focusout", "#Header_JIDNH_JW_Customer_Name", function () {
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
    $(document).on("keydown", "#Header_JIDNH_JW_Customer_Name", function (e) {

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
    $(document).on("keydown", ".JIDNI_Item_Code", function (e) {

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
            "#Header_JIDNH_MS_Number"
        );
    });

    // mousedown -> (re)open the item pane and load/refresh the search.
    $(document).on("mousedown", ".JIDNI_Item_Code", function (e) {

        if ($.trim($("#Header_JIDNH_MS_Number").val()) === "") {
            $("#Header_JIDNH_MS_Number").prop("selectedIndex", 1);
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
    $(document).on("focusout", ".JIDNI_Item_Code", function () {

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
    { cls: ".JIDNA_ADTP_Number", min: 10, max: 25, align: "left", extraPadding: 20 },
    { cls: ".JIDNA_Address_ID", min: 10, max: 25, align: "left", extraPadding: 20 },
    { cls: ".JIDNA_Address", min: 40, max: 40, align: "left" },
    { cls: ".JIDNA_City", min: 10, max: 25, align: "left" },
    { cls: ".JIDNA_State", min: 10, max: 25, align: "left" },
    { cls: ".JIDNA_Country", min: 10, max: 25, align: "left" },
    { cls: ".JIDNA_PIN", min: 10, max: 10, align: "left" },
    { cls: ".JIDNA_GSTIN", min: 15, max: 15, align: "left" }
];
//#endregion
let isMouseSelectingBuyer = false;


let buyerSearchXHR = null;
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
    { cls: ".JIDNI_PRS_Number", min: 10, max: 25, align: "left" },
    { cls: ".JIDNI_Item_Code", min: 10, max: 15, align: "left" },
    { cls: ".JIDNI_Item_Description", min: 40, max: 40, align: "left" },

    { cls: ".JIDNI_OuterDia", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_Thickness", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_Length", min: 8, max: 8, align: "center" },
    { cls: ".JIDNI_Width", min: 8, max: 8, align: "center" },

    { cls: ".JIDNI_MaterialGrade", min: 10, max: 25, align: "left" },
    { cls: ".JIDNI_ItemGroup", min: 10, max: 30, align: "left" },
    { cls: ".JIDNI_WH_Number", min: 10, max: 25, align: "left" },

    { cls: ".JIDNI_UoM_Number", min: 10, max: 15, align: "center" },

    { cls: ".JIDNI_OriginalQty", min: 10, max: 20, align: "center" }, // Extra field
    { cls: ".JIDNI_InvoicedQty", min: 10, max: 20, align: "center" }, // Extra field
    { cls: ".JIDNI_Qty", min: 10, max: 20, align: "center" },

    { cls: ".JIDNI_UnitPrice", min: 10, max: 20, align: "right" },
    { cls: ".JIDNI_Amount", min: 13, max: 25, align: "right" },

     
    { cls: ".JISVOH_Number", min: 10, max: 25, align: "left" } ,// Extra field
    { cls: ".Freight_ServiceOrder_Number", min: 10, max: 25, align: "left" }
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
        { cls: ".JIDNI_BCH_WH_Name", min: 10, max: 25, align: "left" },
        { cls: ".JIDNI_BCH_BatchDate", min: 10, max: 10, align: "center" },
        { cls: ".JIDNI_BCH_BatchNo", min: 20, max: 50, align: "left" },
        { cls: ".JIDNI_BCH_QtyAvailable", min: 10, max: 20, align: "center" },
        { cls: ".JIDNI_BCH_QtyReserved", min: 10, max: 20, align: "center" },
        { cls: ".JIDNI_BCH_QtyInvoice", min: 10, max: 20, align: "center" },
        { cls: ".JIDNI_BCH_BatchUnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".JIDNI_BCH_BatchValue", min: 13, max: 25, align: "right" }
    ];


    const $container = $(container);

    fields.forEach(f => {

        const controls = $container.find(
            "#DeliveryNoteBatchTableBody > #DeliveryNoteBatchTemplateRow " + f.cls +
            ", #DeliveryNoteBatchTableBody > tr.DeliveryNoteBatchNewRow " + f.cls
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
            f.cls === ".JIDNI_BCH_BatchUnitPrice" ||
            f.cls === ".JIDNI_BCH_BatchValue"
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
        { cls: ".JIDNI_BCH_WH_Name", min: 15, max: 30, align: "left" },
        { cls: ".JIDNI_BCH_BatchDate", min: 12, max: 12, align: "center" },
        { cls: ".JIDNI_BCH_BatchNo", min: 20, max: 35, align: "left" },
        { cls: ".JIDNI_BCH_AvailableQty", min: 11, max: 20, align: "center" },
        { cls: ".JIDNI_BCH_BatchUnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".JIDNI_BCH_BatchValue", min: 13, max: 25, align: "right" }
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
            f.cls === ".JIDNI_BCH_BatchUnitPrice" ||
            f.cls === ".JIDNI_BCH_BatchValue"
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
    fitInputWidth("Header_JIDNH_DN_No", 20, 25);
    fitInputWidth("Header_JIDNH_MS_Number", 20, 30);
    fitInputWidth("Header_JIDNH_JW_Customer_Name", 40, 50);
    fitInputWidth("Header_JIDNH_Currency_Number", 10, 10);
    fitInputWidth("Header_JIDNH_WH_Number", 20, 25);
    fitInputWidth("Header_JIDNH_PaymentTerms", 30, 40);
    fitInputWidth("Header_JIDNH_DeliveryTerms", 30, 40);
    fitInputWidth("Header_JIDNH_DeliveryMode", 30, 40);
    fitInputWidth("Header_JIDNH_DespatchDocumentNo", 30, 40);
    fitInputWidth("Header_JIDNH_DespatchedThrough", 30, 40);
    fitInputWidth("Header_JIDNH_Remarks", 40, 40);
}
$(document).ready(function () {
    // NEW: page load ஆகும்போதே, ஏற்கனவே Freight_Applicable=checked rows-க்கு
    // dropdown options populate பண்ணு — "change" event காத்திருக்காம
    $("#ItemTable tbody tr.NewRow").each(function () {
        let row = $(this);
        if (row.find(".Freight_Applicable").is(":checked")) {
            BindFreightServiceOrder(
                row,
                $("#Header_JIDNH_JW_Customer_Number").val(),
                row.find(".JIDNI_Item_Number").val(),
                row.find(".JIDNI_UoM_Number").val()
            );
        }
    });
    //#region item code right pane search JIDNI_Item_Code
    // Item_Code – Keydown (incl. Escape): moved to <script> block
    // Item_Code – Mousedown: moved to <script> block
    // Item_Code – Focus Out: moved to <script> block
    //#endregion
    //#region Header_JIDNH_JW_Customer_Name
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
        "#BuyerAddress .JIDNA_Address, " +
        "#BuyerAddress .JIDNA_City, " +
        "#BuyerAddress .JIDNA_State, " +
        "#BuyerAddress .JIDNA_Country, " +
        "#BuyerAddress .JIDNA_PIN, " +
        "#BuyerAddress .JIDNA_GSTIN",
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
        "#Header_JIDNH_DN_No, #Header_JIDNH_MS_Number, #Header_JIDNH_JW_Customer_Name, #Header_JIDNH_Currency_Number, #Header_JIDNH_WH_Number, #Header_JIDNH_PaymentTerms, #Header_JIDNH_DeliveryTerms, #Header_JIDNH_DeliveryMode, #Header_JIDNH_DespatchDocumentNo, #Header_JIDNH_DespatchedThrough, #Header_JIDNH_Remarks",
        function () {

            const widths = {
                Header_JIDNH_DN_No: [20, 25],
                Header_JIDNH_MS_Number: [20, 30],
                Header_JIDNH_JW_Customer_Name: [40, 50],
                Header_JIDNH_Currency_Number: [10, 10],
                Header_JIDNH_WH_Number: [20, 25],
                Header_JIDNH_PaymentTerms: [30, 40],
                Header_JIDNH_DeliveryTerms: [30, 40],
                Header_JIDNH_DeliveryMode: [30, 40],
                Header_JIDNH_DespatchDocumentNo: [30, 40],
                Header_JIDNH_DespatchedThrough: [30, 40],
                Header_JIDNH_Remarks: [40, 40]
            };

            const [min, max] = widths[this.id];
            fitInputWidth(this, min, max);
        });

    //#endregion

   
    //#region JIDNI_JW_InvoiceTracking change

    $(document).on(
        "change",
        ".JIDNI_JW_InvoiceTracking, .JIDNI_PRS_Number, .JIDNI_Item_Code, .JIDNI_UoM_Number",
        function () {

            let row = $(this).closest("tr");

            if (row.find(".JIDNI_JW_InvoiceTracking").is(":checked")) {
                BindServiceOrder(
                    row,
                    $("#Header_JIDNH_JW_Customer_Number").val(),
                    row.find(".JIDNI_PRS_Number").val(),
                    row.find(".JIDNI_Item_Number").val(),
                    row.find(".JIDNI_UoM_Number").val()
                );
            } else {
                row.find(".JISVOH_Number").html('<option value="0"></option>');
            }
        }
    );

    // NEW: mirrors the JIDNI_JW_InvoiceTracking handler above, for Freight_Applicable


    $(document).on(
        "change",
        ".Freight_Applicable, .JIDNI_Item_Code, .JIDNI_UoM_Number",
        function () {

            let row = $(this).closest("tr");

            if (row.find(".Freight_Applicable").is(":checked")) {
                BindFreightServiceOrder(
                    row,
                    $("#Header_JIDNH_JW_Customer_Number").val(),
                    row.find(".JIDNI_Item_Number").val(),
                    row.find(".JIDNI_UoM_Number").val()
                );
            } else {
                row.find(".Freight_ServiceOrder_Number").html('<option value="0"></option>');
            }
        }
    );

    function BindFreightServiceOrder(row, customerId, itemNumber = null, uomNumber = null) {

        let dropdown = row.find(".Freight_ServiceOrder_Number");
        // CHANGED: read the saved value from the data attribute (set by
        // Razor at page render), not from the dropdown itself — the
        // dropdown is empty on first load, so .val() would return nothing
        let selectedValue = dropdown.attr("data-saved-value") || dropdown.val();

        dropdown.html('<option value="0"></option>');

        if (!customerId) return;

        $.get("/DeliveryNote/GetServiceOrder",
            { customerId, prsNumber: FREIGHT_PRS_NUMBER, itemNumber, uomNumber },
            function (data) {

                $.each(data, function (_, item) {
                    if (!item.value || item.value === "" || item.value === "0") return;

                    dropdown.append(
                        `<option value="${item.value}">${item.text}</option>`
                    );
                });

                dropdown.val(selectedValue);
            }
        );
    }

    function BindServiceOrder(row, customerId, prsNumber = null, itemNumber = null, uomNumber = null) {

        let dropdown = row.find(".JISVOH_Number");
        let selectedValue = dropdown.val(); // existing selected value

        dropdown.html('<option value="0"></option>');

        if (!customerId) return;

        $.get("/DeliveryNote/GetServiceOrder",
            { customerId, prsNumber, itemNumber, uomNumber },
            function (data) {

                $.each(data, function (_, item) {
                    // NEW: skip entries with no real value/text — server
                    // occasionally returns a blank item, duplicating the
                    // default blank option.
                    if (!item.value || item.value === "" || item.value === "0") return;

                    dropdown.append(
                        `<option value="${item.value}">${item.text}</option>`
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
            if (row.find(".JIDNI_IsDeleted").val() === "1" ||
                row.find(".JIDNI_IsDeleted").val() === "true") return;

            let rowSO = row.find(".JISVOH_Number").val() || 0;

            if (rowSO == jisvohNumber) {
                total += parseFloat(removeComma(row.find(".JIDNI_Qty").val())) || 0;
            }
        });

        return total;
    }

    $(document).on("change", ".JISVOH_Number", function () {

        let row = $(this).closest("tr");
        let jisvohNumber = $(this).val();
        row.find(".JISVOH_Number").val(jisvohNumber)
        let prsNumber = row.find(".JIDNI_PRS_Number").val();
        let itemNumber = row.find(".JIDNI_Item_Number").val();
        let uomNumber = row.find(".JIDNI_UoM_Number").val();
        let originalQty = parseFloat(removeComma(row.find(".JIDNI_Qty").val())) || 0;
        let rowIndex = row.index();

        // NEW: fetch and store the SO Item ID — needed by
        // USP_CheckDeliveredQtyExceeded_Freight's DN-side calculation
        $.get("/JobworkInvoice/GetServiceOrderItemInfo", {
            JISVOH_Number: jisvohNumber,
            PRS_Number: prsNumber,
            Item_Number: itemNumber,
            UoM_Number: uomNumber
        }, function (soRes) {
            row.find(".JISVOI_Number_Row").val(soRes && soRes.jisvoI_Number ? soRes.jisvoI_Number : 0);
        });

        $.get("/DeliveryNote/CheckDeliveredQtyExceeded", {
            jisvohNumber,
            prsNumber,
            itemNumber,
            uomNumber
        }, function (res) {

            if (!res || res.length === 0) return;
            let deliveredQty = parseFloat(res[0].deliveredQty) || 0;
            let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;

            // FORMULA: RealDeliveredQty = DB_DeliveredQty + OtherRowsQty(SO)
            let otherRowsQty = GetOtherRowsQtyForSO(jisvohNumber, row);
            let realDeliveredQty = deliveredQty + otherRowsQty;

            // FORMULA: IsExceeded  <=>  (RealDeliveredQty + CurrentQty) > SVO_Qty
            if ((realDeliveredQty + originalQty) > jisvoiQty) {
                // FORMULA: AllowedQty = SVO_Qty − RealDeliveredQty
                alert("Qty Allowed: " + (jisvoiQty - realDeliveredQty));
                setTimeout(function () {
                    row.find(".JIDNI_Qty")
                        .focus()
                        .select();
                    row.find(".JISVOH_Number").val("0");
                }, 300);


            }
        });
    });

    $(document).on("focusout", ".JIDNI_Qty", function () {

        let row = $(this).closest("tr");
        let jisvohNumber = row.find(".JISVOH_Number").val();
        if (!jisvohNumber) return;
        let prsNumber = row.find(".JIDNI_PRS_Number").val();
        let itemNumber = row.find(".JIDNI_Item_Number").val();
        let uomNumber = row.find(".JIDNI_UoM_Number").val();
        let originalQty = parseFloat(row.find(".JIDNI_Qty").val()) || 0;
        let rowIndex = row.index();
        $.get("/DeliveryNote/CheckDeliveredQtyExceeded", {
            jisvohNumber,
            prsNumber,
            itemNumber,
            uomNumber
        }, function (res) {
            if (!res || res.length === 0) return;
            let deliveredQty = parseFloat(res[0].deliveredQty) || 0;
            let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;

            // FORMULA: RealDeliveredQty = DB_DeliveredQty + OtherRowsQty(SO)
            let otherRowsQty = GetOtherRowsQtyForSO(jisvohNumber, row);
            let realDeliveredQty = deliveredQty + otherRowsQty;

            // FORMULA: IsExceeded  <=>  (RealDeliveredQty + CurrentQty) > SVO_Qty
            if ((realDeliveredQty + originalQty) > jisvoiQty) {

                // FORMULA: AllowedQty = SVO_Qty − RealDeliveredQty
                alert("Qty Allowed: " + (jisvoiQty - realDeliveredQty));
                setTimeout(function () {
                    row.find(".JIDNI_Qty")
                        .focus()
                        .select();
                    row.find(".JISVOH_Number").val("0");
                }, 300);
            }
        });
    });

    // NEW: mirrors the .JISVOH_Number change handler above, using the
    // dedicated Freight endpoint (CheckDeliveredQtyExceededFreight) and
    // the JISVOI_Number_FRT field per the confirmed SP logic
    $(document).on("change", ".Freight_ServiceOrder_Number", function () {

        let row = $(this).closest("tr");
        let freightSO = $(this).val();
        row.find(".Freight_ServiceOrder_Number").val(freightSO)
        let itemNumber = row.find(".JIDNI_Item_Number").val();
        let uomNumber = row.find(".JIDNI_UoM_Number").val();
        let originalQty = parseFloat(removeComma(row.find(".JIDNI_Qty").val())) || 0;

        if (!freightSO || freightSO === "0") return;

        // NEW: fetch and store the SO Item ID for Freight — feeds
        // JISVOI_Number_FRT, needed by the SP's DN-side calculation
        $.get("/FreightInvoice/GetServiceOrderItemInfo", {
            Freight_ServiceOrder_Number: freightSO,
            PRS_Number: FREIGHT_PRS_NUMBER,
            Item_Number: itemNumber,
            UoM_Number: uomNumber
        }, function (soRes) {
            row.find(".JISVOI_Number_FRT_Row").val(soRes && soRes.jisvoI_Number ? soRes.jisvoI_Number : 0);
        });

        $.get("/DeliveryNote/CheckDeliveredQtyExceededFreight", {
            jisvohNumber: freightSO,
            prsNumber: FREIGHT_PRS_NUMBER,
            itemNumber,
            uomNumber
        }, function (res) {

            if (!res || res.length === 0) return;
            let deliveredQty = parseFloat(res[0].deliveredQty) || 0;
            let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;

            let otherRowsQty = GetOtherRowsQtyForSO(freightSO, row);
            let realDeliveredQty = deliveredQty + otherRowsQty;

            if ((realDeliveredQty + originalQty) > jisvoiQty) {
                alert("Freight Qty Allowed: " + (jisvoiQty - realDeliveredQty));
                setTimeout(function () {
                    row.find(".JIDNI_Qty")
                        .focus()
                        .select();
                    row.find(".Freight_ServiceOrder_Number").val("0");
                }, 300);
            }
        });
    });

    $(document).on("focusout", ".JIDNI_Qty", function () {

        let row = $(this).closest("tr");
        let freightSO = row.find(".Freight_ServiceOrder_Number").val();
        if (!freightSO || freightSO === "0") return;
        let itemNumber = row.find(".JIDNI_Item_Number").val();
        let uomNumber = row.find(".JIDNI_UoM_Number").val();
        let originalQty = parseFloat(row.find(".JIDNI_Qty").val()) || 0;

        $.get("/DeliveryNote/CheckDeliveredQtyExceededFreight", {
            jisvohNumber: freightSO,
            prsNumber: FREIGHT_PRS_NUMBER,
            itemNumber,
            uomNumber
        }, function (res) {
            if (!res || res.length === 0) return;
            let deliveredQty = parseFloat(res[0].deliveredQty) || 0;
            let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;

            let otherRowsQty = GetOtherRowsQtyForSO(freightSO, row);
            let realDeliveredQty = deliveredQty + otherRowsQty;

            if ((realDeliveredQty + originalQty) > jisvoiQty) {
                alert("Freight Qty Allowed: " + (jisvoiQty - realDeliveredQty));
                setTimeout(function () {
                    row.find(".JIDNI_Qty")
                        .focus()
                        .select();
                    row.find(".Freight_ServiceOrder_Number").val("0");
                }, 300);
            }
        });
    });
    //#endregion

    //#region Unit Price Format

    //#region comma format on focusout
    $(document).on("focusout", ".JIDNI_Qty, .JIDNI_UnitPrice, .JIDNI_Amount", function () {

        let type = $(this).hasClass("JIDNI_Qty") ? "q" : "c";

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
    $(document).on("keyup change", ".JIDNI_Qty, .JIDNI_UnitPrice", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat((row.find(".JIDNI_Qty").val() || "0").replace(/,/g, "")) || 0;
        let price = parseFloat((row.find(".JIDNI_UnitPrice").val() || "0").replace(/,/g, "")) || 0;

        let amount = qty * price;

        // Only set row amount (read-only field)
        row.find(".JIDNI_Amount").val(formatIndianCurrency(amount));

        // Update footer totals separately
        calculateTotal();

        // Auto add row
        autoAddRow(row);
    });
    //#endregion onkeypress qty and unitS

    //#region validate amend qty against invoiced qty
    // FORMULA: if AmendQty < InvoicedQty -> alert + reset AmendQty = InvoicedQty
    $(document).on("change", ".JIDNI_Qty", function () {

        let row = $(this).closest("tr");

        let amendQty = parseFloat(removeComma($(this).val())) || 0;
        let invoicedQty = parseFloat(removeComma(row.find(".JIDNI_InvoicedQty").val())) || 0;

        if (amendQty < invoicedQty) {
            alert("Amend Qty cannot be less than Invoiced Qty (" + invoicedQty + ")");
            $(this).val(addComma(invoicedQty, "q"));
        }
    });
    //#endregion validate amend qty against invoiced qty

    //#region auto add row function
    function autoAddRow(currentRow) {

        let qty = parseFloat(removeComma(currentRow.find(".JIDNI_Qty").val())) || 0;
        let price = parseFloat(removeComma(currentRow.find(".JIDNI_UnitPrice").val())) || 0;

        let itemCode = currentRow.find(".JIDNI_Item_Code").val();
        let prsNo = currentRow.find(".JIDNI_PRS_Number").val();

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
                if (el.hasClass("JIDNI_IsDeleted"))
                    return;

                // ITEM CODE
                if (el.hasClass("JIDNI_Item_Code")) {

                    if (!el.val()) {

                        isValid = false;

                        el.focus();

                        return false;
                    }
                }

                // QTY
                if (el.hasClass("JIDNI_Qty")) {

                    if (!el.val() || parseFloat(removeComma(el.val())) <= 0) {

                        isValid = false;

                        el.focus();

                        return false;
                    }
                }

                // UNIT PRICE
                if (el.hasClass("JIDNI_UnitPrice")) {

                    if (!el.val() || parseFloat(removeComma(el.val())) <= 0) {

                        isValid = false;

                        el.focus();

                        return false;
                    }
                }

                // PROCESS
                if (el.hasClass("JIDNI_PRS_Number")) {

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
                el.hasClass("JIDNI_Number") ||
                el.hasClass("JIDNI_Item_Number")
            ) {

                el.val("");
            }

            // DELETE FLAG
            else if (el.hasClass("JIDNI_IsDeleted")) {

                el.val("false");
            }

            // INVOICED QTY - new row has nothing invoiced yet
            else if (el.hasClass("JIDNI_InvoicedQty")) {

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
            let JIDNI_Number = currentRow_temp.find(".JIDNI_Number").val();

            let JIDNH_Number =
                new URLSearchParams(window.location.search)
                    .get("JIDNH_Number");

            let DBCH_Item_Number =
                currentRow_temp.find(".JIDNI_Item_Number").val();

            let DBCH_DBCH_Number =
                currentRow_temp.find(".JIDNI_DBCH_Number").val();
         

            deletedRows.push({
                ItemGridindex: ItemGridindex,
                JIDNI_Number: JIDNI_Number,
                JIDNH_Number: JIDNH_Number,
                DBCH_Item_Number: DBCH_Item_Number,
                DBCH_DBCH_Number: DBCH_DBCH_Number
            });

            console.log(deletedRows);




            $.ajax({

                url: '/DeliveryNote/DeleteTempDeliveryBatchRow',

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

    //#region JIDNI_JW_InvoiceTracking
    $("#ItemTable .JIDNI_JW_InvoiceTracking").each(function () {
        $(this).trigger("change");
    });
    //#endregion JIDNI_JW_InvoiceTracking
});


let DeliveryNoteBatchList_Edit  = [];
let DeliveryNoteItemBatchList_Edit = [];
let CurrentBatchItemRow_Edit = null;
let CurrentItemGridRowIndex = 0;

//#region Calculate Total
function calculateTotal() {

    let totalQty = 0;
    let totalAmount = 0;

    // Loop through each row (only active rows)
    $("#ItemTable tbody tr.NewRow").each(function () {

        let row = $(this);

        // Skip deleted rows
        if (row.find(".JIDNI_IsDeleted").val() === "1" ||
            row.find(".JIDNI_IsDeleted").val() === "true") {
            return;
        }

        
        // Get Qty
        let qty = parseFloat(removeComma(row.find(".JIDNI_Qty").val())) || 0;

        // Get Unit Price
        let unitPrice = parseFloat(removeComma(row.find(".JIDNI_UnitPrice").val())) || 0;

        // Row Amount = Qty × Unit Price
        let amount = qty * unitPrice;

        // Set row amount field
        row.find(".JIDNI_Amount").val(addComma(amount, "c"));

        // Add to totals
        totalQty += qty;
        totalAmount += amount;
    });

    // Footer totals
    $("#TotalQty").val(addComma(totalQty, "q"));
    $("#TotalAmount").val(addComma(totalAmount, "c"));
}
//#endregion Calculate Total

//#region Edit Customer Search Functions
//#region customer Search Functions
//#region JW Customer Search Functions

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
    var SIHDate = $("input[name='Header.JIDNH_DN_Date']").val();
    var resultsDiv = $("#RightPane").find(".buyer-search-results");

    if (buyerSearchXHR) {
        buyerSearchXHR.abort();
    }

    buyerSearchXHR = $.ajax({
        url: '/jobinward/transactions/delivery-note/cutomer',
        type: 'GET',
        data: {
            Buyer: JWCustomer,
            SIHDate: SIHDate
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
                    '<th>JW Customer Name</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody></tbody>' +
                    '</table>' +
                    '</div>'
                );

                $.each(data, function (i, cust) {

                    var row = $("<tr></tr>").css("height", "24px");
                    row.data("customer", cust);
                    row.append("<td>" + cust.cuS_Name + "</td>");


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

                    SelectBuyer(
                        clickedCust,
                        "#Header_JIDNH_JW_Customer_Name",
                        "#Header_JIDNH_JW_Customer_Number",
                        "#Header_JIDNH_Currency_Name",
                        "#Header_JIDNH_Currency_Number",
                        "#Header_JIDNH_WH_Number",
                        "#RightPane",
                        ".buyer-search-results"
                    );

                    $("#BuyerMessage").hide().text("");

                    $(inputElement).val(clickedCust.cuS_Name);

                    $("#Header_JIDNH_JW_Customer_Number")
                        .val(clickedCust.cuS_Number);

                    $("#Currency_Name")
                        .val(clickedCust.cuS_CUR_Name);

                    $("#Currency_Number")
                        .val(clickedCust.cuS_CUR_Number);

                    $("#SIH_CUR_Number")
                        .val(clickedCust.cuS_CUR_Number);

                    $("#SIH_BUY_LOC_Number")
                        .val(clickedCust.cuS_LOC_Number);

                    $("#SIH_CUR_DecimalPlaces")
                        .val(clickedCust.cuS_CUR_DecimalPlaces);

                    $("#SIH_WHT_Number")
                        .val(clickedCust.cuS_WHT_Number);

                    $("#WH_Number")
                        .val(clickedCust.cuS_WH_Number);

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
    let JIDNI_Number = row.find(".JIDNI_Number").val();
    let JIDNH_Number = new URLSearchParams(window.location.search).get("JIDNH_Number");
    let DBCH_Item_Number = row.find(".JIDNI_Item_Number").val();
    let DBCH_DBCH_Number = row.find(".JIDNI_DBCH_Number").val();

    let resultsDiv = $("#RightPane_Item").find(".search-results");
    let ItemGridindex =
        $("#TableBody tr.NewRow:visible")
            .index(row) + 1;


    let material = $("#Header_JIDNH_MS_Number").val();


    if (!material) return;

    if (itemSearchXHR) {
        itemSearchXHR.abort();
    }

    itemSearchXHR = $.ajax({
        url: '/jobinward/transactions/delivery-note/item',
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
                        row.find(".JIDNI_Item_Code").val(item.itemCode);

                        // ✔ Hidden fields
                        row.find(".JIDNI_Item_Number").val(item.itemNumber);
                        //    row.find(".JIDNI_Number").val(item.itemNumber);

                        // ✔ Fill details
                        row.find(".JIDNI_Item_Description").val(item.itemDescription);
                        row.find(".JIDNI_OuterDia").val(item.outerDia);
                        row.find(".JIDNI_Thickness").val(item.thickness);
                        row.find(".JIDNI_Length").val(item.length);
                        row.find(".JIDNI_Width").val(item.width);
                        row.find(".JIDNI_MaterialGrade").val(item.materialGrade);
                        row.find(".JIDNI_ItemGroup").val(item.itemGroup);

                        // ✔ Dropdowns
                        row.find(".JIDNI_UoM_Number").val(item.uoM);
                        row.find(".JIDNI_WH_Number").val(item.saleWarehouse);

                        // ✔ Move to Qty
                        let qtyInput = row.find(".JIDNI_Qty");
                        let qtyUnitprice = row.find(".JIDNI_UnitPrice");
                        qtyInput.focus();

                        setTimeout(function () {
                            if (JIDNI_Number == "") {
                                SaveTempBatch_AddRow(ItemGridindex);
                            } else {
                                EditItemRowTempTable(item.itemNumber, item.saleWarehouse, JIDNI_Number, JIDNH_Number);
                            }

                        }, 100);



                        setTimeout(function () {
                            qtyInput.select();


                            ItemChanged = 1;
                            isSelectingItem = false;
                        }, 100);

                        // ✔ Decimal format (if needed)
                        let decimalPlaces = item.decimalPlaces || 2;

                        let qtyVal = qtyInput.val();
                        let qtyUnitpriceVal = qtyUnitprice.val();
                        qtyInput.val(QtyDecimalRupees(qtyVal, decimalPlaces));
                        qtyUnitprice.val(DecimalIndianRupees(qtyUnitpriceVal || 0, 2));
                        //#region item grid alignment
                        setTimeout(function () {

                            ApplyFieldWidths({
                                fields: ItemTableFields,
                                container: "#ItemTable",
                                tempRow: "#TempRow",
                                tableBody: "#TableBody",
                                searchTable: "#tblsearch"
                            });
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

        url: '/DeliveryNote/TempDeliveryBatchDeleteChangeItemDBRow',

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
function EditItemRowTempTable(DBCH_Item_Number, n_warehouse, JINDI_Number, JINDH_Number, DBCH_Index) {

 
 
    $.ajax({

        url: '/DeliveryNote/TempDeliveryBatchEditChangeItemDBRow',

        type: 'POST',

        data: { DBCH_Item_Number: DBCH_Item_Number, warehouse: n_warehouse, JINDI_Number: JINDI_Number, JINDH_Number: JINDH_Number, DBCH_Index: DBCH_Index },

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
        selectedRow.find(".JIDNI_WH_Number").val();

    let lineItemNumber =
        selectedRow.find(".JIDNI_Item_Number").val();
    let jIDNI_Number =
        selectedRow.find(".JIDNI_Number").val();
    G_JINI_Number = jIDNI_Number;
   

    let invoiceQty =
        selectedRow.find(".JIDNI_Qty").val();

    $("#BatchPopupQty").text(invoiceQty);
    let p_JIDNH_Number =
        new URLSearchParams(window.location.search)
            .get("JIDNH_Number");
    G_JINH_Number = p_JIDNH_Number;

    //#endregion


    // CLEAR TEMP ARRAY
    DeliveryNoteBatchList_Edit = [];

    // CLEAR OLD ROWS
    $("#DeliveryNoteBatchTableBody")
        .find(".DeliveryNoteBatchRow")
        .remove();

   

        //#region AJAX

        $.ajax({

            url: "/DeliveryNote/GetBatchDetailsEdit",

            type: "GET",

            data: {
                FromWarehouse: fromWarehouse,
                LineItem_Number: lineItemNumber,
                JIDNI_Number: jIDNI_Number,
                ItemGridIndex: ItemGridindex,               
                JIDNH_Number: G_JINH_Number
            },

            success: function (response) {

                console.log(response);

                DeliveryNoteBatchList_Edit = [];

                if (response && response.length > 0) {

                    $.each(response, function (i, batch) {

                        DeliveryNoteBatchList_Edit.push({

                            JIDNI_BCH_WH_Number: batch.fromWarehouse,
                            JIDNI_BCH_JIDNI_Number: lineItemNumber,
                            JIDNI_BCH_WH_Name: batch.wareHouseCode,
                            JIDNI_BCH_BatchDate: batch.batchDate,
                            JIDNI_BCH_BatchNo: batch.batchNo,
                            JIDNI_BCH_QtyAvailable: batch.availableQty,
                            JIDNI_BCH_QtyReserved: batch.reservedQty,
                            JIDNI_BCH_QtyInvoice: batch.deliveredQty,
                            JIDNI_BCH_BatchUnitPrice: batch.batchUnitPrice,
                            JIDNI_BCH_BatchValue: batch.batchValue,
                            JIDNI_BCH_Number: batch.lineBatch_Number,
                            JIDNI_Number: G_JINI_Number,
                            JIDNH_Number: G_JINH_Number,
                            RefBatch_Number: batch.refBatch_Number
                        });

                    });

                } else {

                    DeliveryNoteBatchList_Edit.push({});
                }

                BindDeliveryNoteBatchTable();
                BindOtherBatch(fromWarehouse, lineItemNumber, ItemGridindex);

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
            '#DeliveryNoteBatchTableBody tr:not([style*="display:none"]) .JIDNI_BCH_QtyInvoice'
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
            data.JIDNI_BCH_WH_Number != undefined &&
            data.JIDNI_BCH_JIDNI_Number != undefined &&
            data.JIDNI_BCH_WH_Name != undefined &&
            data.JIDNI_BCH_BatchDate != undefined &&
            data.JIDNI_BCH_BatchNo != undefined &&
            data.JIDNI_BCH_QtyAvailable != undefined
        ) {

            let row =
                $("#DeliveryNoteBatchTemplateRow")
                    .clone()
                    .removeAttr("id")
                    .removeAttr("style")
                    .show()
                    .addClass("DeliveryNoteBatchRow");

            row.find(".JIDNI_BCH_WH_Number")
                .val(data.JIDNI_BCH_WH_Number);

            row.find(".JIDNI_BCH_JIDNI_Number")
                .val(data.JIDNI_BCH_JIDNI_Number);

            row.find(".JIDNI_BCH_WH_Name")
                .val(data.JIDNI_BCH_WH_Name);

            row.find(".JIDNI_BCH_BatchDate")
                .val(data.JIDNI_BCH_BatchDate);

            row.find(".JIDNI_BCH_BatchNo")
                .val(data.JIDNI_BCH_BatchNo);
            row.find(".JIDNI_BCH_Number")
                .val(data.JIDNI_BCH_Number);

            row.find(".JIDNI_BCH_QtyAvailable").val(addComma(data.JIDNI_BCH_QtyAvailable, "q"));
            row.find(".JIDNI_BCH_QtyReserved").val(addComma(data.JIDNI_BCH_QtyReserved, "q"));
            row.find(".JIDNI_BCH_QtyInvoice").val(addComma(data.JIDNI_BCH_QtyInvoice, "q"));
            row.find(".JIDNI_BCH_BatchUnitPrice").val(addComma(data.JIDNI_BCH_BatchUnitPrice, "c"));
            row.find(".JIDNI_BCH_BatchValue").val(addComma(data.JIDNI_BCH_BatchValue, "c"));
                
            row.find(".JIDNI_Number")
                .val(data.JIDNI_Number);

            row.find(".JIDNH_Number")
                .val(data.JIDNH_Number);
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

            totalQty += parseFloat(removeComma($(this).find(".JIDNI_BCH_QtyInvoice").val())) || 0;
            totalAvailableQty += parseFloat(removeComma($(this).find(".JIDNI_BCH_QtyAvailable").val())) || 0;
            totalValue += parseFloat(removeComma($(this).find(".JIDNI_BCH_BatchValue").val())) || 0;
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

        row.find(".JIDNI_BCH_Number")
            .val(data.lineBatch_Number);

        row.find(".JIDNI_BCH_WH_Number")
            .val(data.fromWarehouse);

        row.find(".JIDNI_BCH_WH_Name")
            .val(data.wareHouseCode);

        row.find(".JIDNI_BCH_BatchDate")
            .val(data.batchDate);

        row.find(".JIDNI_BCH_BatchNo")
            .val(data.batchNo);

        row.find(".JIDNI_BCH_AvailableQty")
            .val(data.availableQty);

        row.find(".JIDNI_BCH_BatchUnitPrice")
            .val(data.batchUnitPrice);

        row.find(".JIDNI_BCH_BatchValue")
            .val(data.batchValue);

        tbody.append(row);

    });

    // CalculateOtherBatchFooter();
}


function BindOtherBatch(fromWarehouse, lineItemNumber, ItemGridindex) {
    //#region AJAX

    $.ajax({

        url: "/DeliveryNote/GetOtherBatchDetails",

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


$(document).on('input', ".JIDNI_BCH_QtyInvoice", function (event) {

    var row = $(this).closest("tr");

    var QtyAvailable =
        parseFloat(removeComma(row.find(".JIDNI_BCH_QtyAvailable").val())) || 0;

    var QtyReserved =
        parseFloat(removeComma(row.find(".JIDNI_BCH_QtyReserved").val())) || 0;

    var QtyInvoiceInput = row.find(".JIDNI_BCH_QtyInvoice");

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


//#region VALIDATE EXISTING BATCH ROWS

function ValidateExistingBatchRows_Edit() {

    let isValid = true;

    $("#DeliveryNoteBatchTableBody tr.DeliveryNoteBatchRow")
        .each(function () {

            let row = $(this);

            row.removeClass("table-danger");

            let batchNo =
                row.find(".JIDNI_BCH_BatchNo")
                    .val()
                    ?.trim();

            let qty =
                row.find(".JIDNI_BCH_QtyInvoice")
                    .val()
                    ?.trim();

            let price =
                row.find(".JIDNI_BCH_BatchUnitPrice")
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
                    $(this).find(".JIDNI_BCH_QtyInvoice").val()
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
            .find(".JIDNI_Qty");

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
        let Qty = parseFloat(removeComma(currentRow.find(".JIDNI_BCH_QtyInvoice").val())) || 0;


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
                parseInt(currentRow.find(".JIDNI_BCH_Number").val()) || 0,

            DBCH_Index:
                parseInt(CurrentItemGridRowIndex) || 0,

            DBCH_DBCH_Number:
                parseInt(currentRow.find(".JIDNI_BCH_Number").val()) || 0,

            DBCH_Item_Number:
                parseInt(currentRow.find(".JIDNI_BCH_JIDNI_Number").val()) || 0,

            DBCH_Warehouse_Number:
                parseInt(currentRow.find(".JIDNI_BCH_WH_Number").val()) || 0,

            DBCH_Date:
                new Date(currentRow.find(".JIDNI_BCH_BatchDate").val()).toISOString(),

            DBCH_No:
                currentRow.find(".JIDNI_BCH_BatchNo").val(),

            DBCH_Qty: Qty,

            DBCH_UnitPrice: parseFloat(removeComma(currentRow.find(".JIDNI_BCH_BatchUnitPrice").val())) || 0,
            DBCH_Value: parseFloat(removeComma(currentRow.find(".JIDNI_BCH_BatchValue").val())) || 0,

            JIDNI_NUMBER:
                parseInt(currentRow.find(".JIDNI_Number").val()) || 0,

            JIDNH_NUMBER:
                parseInt(currentRow.find(".JIDNH_Number").val()) || 0,

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

        url: '/DeliveryNote/SaveTempDeliveryBatch',

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
            parseInt(selectedRow.find(".JIDNI_Item_Number").val()) || 0,

        DBCH_Warehouse_Number:
            parseInt(selectedRow.find(".JIDNI_WH_Number").val()) || 0,

        DBCH_DBCH_Number: 0
    };

    //#endregion

    console.log(model);

    //#region AJAX SAVE

    $.ajax({

        url: '/DeliveryNote/SaveTempDeliveryBatchAddRow',

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

                    JIDNI_BCH_WH_Number:
                        row.find(".JIDNI_BCH_WH_Number").val(),
                    JIDNI_BCH_JIDNI_Number:
                        row.find(".JIDNI_BCH_JIDNI_Number").val(),
                    JIDNI_BCH_WH_Name:
                        row.find(".JIDNI_BCH_WH_Name").val(),

                    JIDNI_BCH_BatchDate:
                        row.find(".JIDNI_BCH_BatchDate").val(),

                    JIDNI_BCH_Number:
                        row.find(".JIDNI_BCH_Number").val(),

                    JIDNI_BCH_BatchNo:
                        row.find(".JIDNI_BCH_BatchNo").val(),

                    JIDNI_BCH_QtyAvailable:
                        row.find(".JIDNI_BCH_QtyAvailable").val(),

                    JIDNI_BCH_QtyReserved:
                        row.find(".JIDNI_BCH_QtyReserved").val(),

                    JIDNI_BCH_QtyInvoice:
                        row.find(".JIDNI_BCH_QtyInvoice").val(),

                    JIDNI_BCH_BatchUnitPrice:
                        row.find(".JIDNI_BCH_BatchUnitPrice").val(),

                    JIDNI_BCH_BatchValue:
                        row.find(".JIDNI_BCH_BatchValue").val(),
                    JIDNI_NUMBER:
                        parseInt(row.find(".JIDNI_Number").val()) || 0,

                    JIDNH_NUMBER:
                        parseInt(row.find(".JIDNH_Number").val()) || 0,

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

        if (firstRecord.JIDNI_NUMBER == "") {
            SaveTempBatch_Edit();
        } else if (parseInt(firstRecord.JIDNI_NUMBER) > 0)  {
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
    if ($("#Header_JIDNH_DN_No").val().trim() === "") {
        showAlert('Delivery Note No. is required', '#Header_JIDNH_DN_No');

        return false;
    }

    // 2. DN Date
    if ($("#Header_JIDNH_DN_Date").val().trim() === "") {
        showAlert('DN Date is required', '#Header_JIDNH_DN_Date');

        return false;
    }

    // 3. Material Segregation
    if ($("#Header_JIDNH_MS_Number").val() === "" || $("#Header_JIDNH_MS_Number").val() === "0") {
        showAlert('Material Segregation is required', '#Header_JIDNH_MS_Number');

        return false;
    }

    // 4. JW Customer
    if ($("#Header_JIDNH_JW_Customer_Number").val().trim() === "" ||
        $("#Header_JIDNH_JW_Customer_Name").val().trim() === "") {

        showAlert('JW Customer is required', '#Header_JIDNH_JW_Customer_Name');

        return false;
    }

    // 5. Currency
    if ($("#Header_JIDNH_Currency_Number").val() === "" || $("#Header_JIDNH_Currency_Number").val() === "0") {
        showAlert('Currency is required', '#Header_JIDNH_Currency_Number');

        return false;
    }

    // 6. Warehouse
    if ($("#Header_JIDNH_WH_Number").val() === "" || $("#Header_JIDNH_WH_Number").val() === "0") {
        showAlert('Warehouse is required', '#Header_JIDNH_WH_Number');

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

        if (row.find(".JIDNA_IsDeleted").val() === "1") return;

        let type = row.find(".JIDNA_ADTP_Number").val();
        let addr = row.find(".JIDNA_Address_ID").val();

        if (type && addr) {
            hasRow = true;
        }

        if (type && !addr) {
            showAlert('Address ID required');
            row.find(".JIDNA_Address_ID").focus();
            valid = false;
            return false;
        }

        if (!type && addr) {
            showAlert('Address Type required');
            row.find(".JIDNA_ADTP_Number").focus();
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
        if (row.find(".JIDNI_IsDeleted").val() === "1") return;

        let process = row.find(".JIDNI_PRS_Number").val();
        let itemCode = row.find(".JIDNI_Item_Code").val();
        let qty = row.find(".JIDNI_Qty").val();
        let unitPrice = row.find(".JIDNI_UnitPrice").val();

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
                row.find(".JIDNI_PRS_Number")
            );
            isValid = false;
            return false; // break loop
        }

        // validate Item Code
        if (!itemCode || itemCode.trim() === "") {
            showAlert('Item Code is required', row.find(".JIDNI_Item_Code"));

            isValid = false;
            return false;
        }

        // validate Qty
        if (!qty || qty.trim() === "" || qty.trim() === "0") {
            showAlert('Qty is required', row.find(".JIDNI_Qty"));

            isValid = false;
            return false;
        }

        // validate Unit Price
        if (!unitPrice || unitPrice.trim() === "" || unitPrice.trim() === "0") {
            showAlert('Unit Price is required', row.find(".JIDNI_UnitPrice"));

            isValid = false;
            return false;
        }

    });

    // no valid row added
    if (!hasValidRow) {
        showAlert('Please add at least one item in grid', "#ItemTable tbody tr:first .JIDNI_PRS_Number");
        //row.find(".JIDNI_PRS_Number").focus();
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

        let qty = removeComma(row.find(".JIDNI_BCH_QtyInvoice").val());
        qty = parseFloat(qty) || 0;

        if (qty > 0) {

            hasValidQty = true;

            return false;
        }

    });

    if (!hasValidQty) {

        showAlert(
            "Please enter Delivered Qty in batch details",
            '#DeliveryNoteBatchList tbody tr:visible:first .JIDNI_BCH_QtyInvoice'
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

        url: '/DeliveryNote/DeleteRemovedRows',

        type: 'POST',

        contentType: 'application/json',

        data: JSON.stringify(deletedRows),

        success: function () {

            UpdateDeliveryNote(model);
        },

        error: function (xhr) {

            console.log(xhr.responseText);

        }

    });
}

function UpdateDeliveryNote(model) {
    $.ajax({

        url: '/DeliveryNote/UpdateDeliveryNote',

        type: 'POST',

        contentType: 'application/json',

        data: JSON.stringify(model),

        success: function (response) {

            if (response.success) {
             
                showAlert('Record Updated')
                setTimeout(function () {
                    window.location.reload();
                }, 1000); // 1000 ms = 1 second
              
                //  window.location.href = response.redirectUrl;
                console.log(JSON.stringify(model));
            }


        },

        error: function (xhr) {

            console.log(xhr.responseText);

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
                !batch.JIDNI_BCH_QtyInvoice ||
                parseFloat((batch.JIDNI_BCH_QtyInvoice || "0").toString().replace(/,/g, "")) <= 0
            ) {
                return true;
            }

            //#region FORMAT DATE

            let formattedBatchDate = null;

            if (batch.JIDNI_BCH_BatchDate) {

                let date = new Date(batch.JIDNI_BCH_BatchDate);

                if (!isNaN(date.getTime())) {
                    formattedBatchDate = date.toISOString();
                }
            }

            //#endregion

            let deliveryNoteBatch = {

                JIDNI_BCH_Number:
                    parseInt(batch.JIDNI_BCH_Number) || 0,

                JIDNI_BCH_JIDNH_Number:
                    parseInt(batch.JIDNI_BCH_JIDNH_Number) || 0,

                JIDNI_BCH_JIDNI_Number:
                    parseInt(batch.JIDNI_BCH_JIDNI_Number) || 0,

                JIDNI_BCH_WH_Number:
                    parseInt(batch.JIDNI_BCH_WH_Number) || 0,

                // FIXED DATE FORMAT
                JIDNI_BCH_BatchDate:
                    formattedBatchDate,

                JIDNI_BCH_BatchNo:
                    batch.JIDNI_BCH_BatchNo || "",

                JIDNI_BCH_BatchQty:
                    parseFloat((batch.JIDNI_BCH_QtyInvoice || "0").toString().replace(/,/g, "")) || 0,

                JIDNI_BCH_BatchUnitPrice:
                    parseFloat((batch.JIDNI_BCH_BatchUnitPrice || "0").toString().replace(/,/g, "")) || 0,

                JIDNI_BCH_BatchValue:
                    parseFloat((batch.JIDNI_BCH_BatchValue || "0").toString().replace(/,/g, "")) || 0,

                RefBatch_Number:
                    parseInt(batch.RefBatch_Number) || 0,

                JIDNH_Number:
                    parseInt(batch.JIDNH_Number) || 0,

                JIDNI_Number:
                    parseInt(batch.JIDNI_Number) || 0
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

        JIDNH_Number:
            parseInt($("#Header_JIDNH_Number").val()) || 0,

        JIDNH_DN_No:
            $("#Header_JIDNH_DN_No").val(),

        JIDNH_DN_Date:
            new Date($("#Header_JIDNH_DN_Date").val())
                .toISOString(),

        JIDNH_MS_Number:
            parseInt($("#Header_JIDNH_MS_Number").val()) || 0,

        JIDNH_JW_Customer_Number:
            parseInt($("#Header_JIDNH_JW_Customer_Number").val()) || 0,

        JIDNI_Item_Code:
            $("#Header_JIDNI_Item_Code").val(),

        JIDNH_JW_Customer_Name:
            $("#Header_JIDNH_JW_Customer_Name").val(),

        JIDNH_Currency_Number:
            parseInt($("#Header_JIDNH_Currency_Number").val()) || 0,

        JIDNH_WH_Number:
            parseInt($("#Header_JIDNH_WH_Number").val()) || 0,

        JIDNH_PaymentTerms:
            $("#Header_JIDNH_PaymentTerms").val(),

        JIDNH_DeliveryTerms:
            $("#Header_JIDNH_DeliveryTerms").val(),

        JIDNH_DeliveryMode:
            $("#Header_JIDNH_DeliveryMode").val(),

        JIDNH_DespatchDocumentNo:
            $("#Header_JIDNH_DespatchDocumentNo").val(),

        JIDNH_DespatchedThrough:
            $("#Header_JIDNH_DespatchedThrough").val(),

        JIDNH_Remarks:
            $("#Header_JIDNH_Remarks").val(),

        DN_Id:
            parseInt($("#Header_DN_Id").val()) || null,

        DN_CUS_Number:
            parseInt($("#Header_DN_CUS_Number").val()) || null,

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
        if (row.find(".JIDNI_IsDeleted").val() == "true") {
            return;
        }

        // Skip empty rows
        if (!row.find(".JIDNI_Item_Number").val()) {
            return;
        }

        let item = {

            JIDNI_JIDNH_Number:
                parseInt(row.find(".JIDNI_JIDNH_Number").val()) || 0,

            JIDNI_Number:
                parseInt(row.find(".JIDNI_Number").val()) || 0,

            JIDNI_PRS_Number:
                parseInt(row.find(".JIDNI_PRS_Number").val()) || 0,

            JIDNI_Item_Number:
                parseInt(row.find(".JIDNI_Item_Number").val()) || 0,

            JIDNI_WH_Number:
                parseInt(row.find(".JIDNI_WH_Number").val()) || 0,

            JIDNI_UoM_Number:
                parseInt(row.find(".JIDNI_UoM_Number").val()) || 0,

            JIDNI_Qty:
                parseFloat((row.find(".JIDNI_Qty").val() || "0").replace(/,/g, "")) || 0,

            JIDNI_UnitPrice:
                parseFloat((row.find(".JIDNI_UnitPrice").val() || "0").replace(/,/g, "")) || 0,

            JIDNI_Amount:
                parseFloat((row.find(".JIDNI_Amount").val() || "0").replace(/,/g, "")) || 0,

            JIDNI_JW_InvoiceTracking:
                row.find(".JIDNI_JW_InvoiceTracking").is(":checked")
                    ? "Yes"
                    : "No",

            JISVOH_Number:
                parseInt(row.find(".JISVOH_Number").val()) || 0,
            Freight_Applicable:
                row.find(".Freight_Applicable").is(":checked")
                    ? "Yes"
                    : "No",

            Freight_ServiceOrder_Number:
                row.find(".Freight_ServiceOrder_Number").val() || "",

            // NEW: SO Item IDs — needed by USP_CheckDeliveredQtyExceeded_Freight's
            // DN-side calculation
            JISVOI_Number:
                parseInt(row.find(".JISVOI_Number_Row").val()) || 0,

            JISVOI_Number_FRT:
                parseInt(row.find(".JISVOI_Number_FRT_Row").val()) || 0
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
        if (row.find(".JIDNA_IsDeleted").val() == "1") {
            return;
        }

        // Skip empty rows
        if (!row.find(".JIDNA_Address_ID").val()) {
            return;
        }

        let address = {

            JIDNA_JIDNH_Number:
                parseInt(row.find(".JIDNA_JIDNH_Number").val()) || 0,

            JIDNA_Number:
                parseInt(row.find(".JIDNA_Number").val()) || 0,

            JIDNA_ADTP_Number:
                parseInt(row.find(".JIDNA_ADTP_Number").val()) || 0,

            JIDNA_Address_ID:
                row.find(".JIDNA_Address_ID").val(),

            JIDNA_Address:
                row.find(".JIDNA_Address").text(),

            JIDNA_City:
                row.find(".JIDNA_City").val(),

            JIDNA_State:
                row.find(".JIDNA_State").val(),

            JIDNA_Country:
                row.find(".JIDNA_Country").val(),

            JIDNA_PIN:
                row.find(".JIDNA_PIN").val(),

            JIDNA_GSTIN:
                row.find(".JIDNA_GSTIN").val()
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

    row.find(".JIDNA_IsDeleted").val("1");
    row.hide();
});
//#endregion CLICK ADDRESS BUTTON


//#region CHANGE ADDRESS TYPE
function isDuplicateAddress(type, currentRow) {
    var isDuplicate = false;

    $('tr.AddNewRow').not(currentRow).each(function () {

        var rowType = $(this).find('select.JIDNA_ADTP_Number').val();
        var isDeleted = parseInt($(this).find("input.JIDNA_IsDeleted").val());

        if (isDeleted !== 1) {
            if (rowType === type) {
                isDuplicate = true;
                return false; // break loop
            }
        }
    });

    return isDuplicate;
}
$(document).on('change', 'tr.AddNewRow select.JIDNA_ADTP_Number', function () {

    var currentRow = $(this).closest('tr.AddNewRow');

    var ADTPNumber = currentRow.find('.JIDNA_ADTP_Number').val();
    var Buyer = $('#Header_JIDNH_JW_Customer_Number').val(); // keep if same field exists
    var ADDAddress_ID = currentRow.find('.JIDNA_Address_ID');
    var ADDAddress = currentRow.find('.JIDNA_Address');
    var ADDCity = currentRow.find('.JIDNA_City');
    var ADDState = currentRow.find('.JIDNA_State');
    var ADDCountry = currentRow.find('.JIDNA_Country');
    var ADDPin = currentRow.find('.JIDNA_PIN');
    var ADDGSTIN = currentRow.find('.JIDNA_GSTIN');

    if (ADTPNumber && isDuplicateAddress(ADTPNumber, currentRow)) {
        alert('This Address Type already exists!');
        $(this).val('');
        $(this).focus();
        return;
    }

    $.ajax({
        type: "GET",
        url: "/jobinward/transactions/delivery-note/buyer/address",
        data: { Buyer: Buyer, ADTPNumber: ADTPNumber },
        dataType: "json",
        success: function (data) {

            var AddressID = data.buyerAddressId;
            var AddressDefault = data.buyerAddress;
 
            // set default + fill fields
            if (AddressDefault != null) {
              //  $AddressDropdown.val(AddressDefault.buY_ADD_AddressID);
                ADDAddress_ID.val(AddressDefault.buY_ADD_AddressID);
                ADDAddress.text(AddressDefault.buY_ADD_Address);
                ADDCity.val(AddressDefault.buY_ADD_City);
                ADDState.val(AddressDefault.buY_ADD_State);
                ADDCountry.val(AddressDefault.buY_ADD_Country);
                ADDPin.val(AddressDefault.buY_ADD_Pin);
                ADDGSTIN.val(AddressDefault.buY_ADD_GSTIN);
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

    var fp = document.getElementById("Header_JIDNH_DN_Date")._flatpickr;
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
    $row.find(".JIDNA_ADTP_Number")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_ADTP_Number`);

    // 2. Address ID
    $row.find(".JIDNA_Address_ID")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_Address_ID`);

    // 3. Address
    $row.find(".JIDNA_Address")
        .text("")
        .attr("name", `Addresses[${i}].JIDNA_Address`);

    // 4. City
    $row.find(".JIDNA_City")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_City`);

    // 5. State
    $row.find(".JIDNA_State")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_State`);

    // 6. Country
    $row.find(".JIDNA_Country")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_Country`);

    // 7. PIN
    $row.find(".JIDNA_PIN")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_PIN`);

    // 8. GSTIN
    $row.find(".JIDNA_GSTIN")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_GSTIN`);

    // 9. Delete flag
    $row.find(".JIDNA_IsDeleted")
        .val("0")
        .attr("name", `Addresses[${i}].JIDNA_IsDeleted`);

    $("#AddTableBody").append($row);

    addressIndex++;
}


function validateTempRow_Edit() {

    let row = $("#AddTempRow");

    if (!row.find(".JIDNA_ADTP_Number").val()) {
        showAlert('Address Type is required');
        return false;
    }

    if (!row.find(".JIDNA_Address_ID").val()) {
        showAlert('Address ID is required');
        return false;
    }

    return true;
}

function validateBatchDetailsDB() {

    let isValid = true;
    let p_JIDNH_Number =
        new URLSearchParams(window.location.search)
            .get("JIDNH_Number");
    G_JINH_Number = p_JIDNH_Number;

    $.ajax({

        url: "/DeliveryNote/ValidateBatchDetails",

        type: "GET",

        async: false,

        data: {
            JIDNH_Number: G_JINH_Number
        },

        success: function (response) {

            if (!response.status) {

                showAlert(
                    response.message,
                    "#DeliveryNoteBatchList tbody tr:visible:first .JIDNI_BCH_QtyInvoice"
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

    let p_JIDNH_Number =
        new URLSearchParams(window.location.search)
            .get("JIDNH_Number");

    G_JINH_Number = p_JIDNH_Number;

    $.ajax({

        url: "/DeliveryNote/Validate_Amended_BatchQty",
        type: "GET",
        async: false,
        data: {
            JIDNH_Number: G_JINH_Number
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
                    removeComma(row.find(".JIDNI_Qty").val())
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
                        row.find(".JIDNI_Qty")
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

$(document).on("change", ".JIDNI_WH_Number, .JIDNI_Item_Code", function () {

    let row = $(this).closest("tr");
    let DBCH_Index =
        row.index(
            "#ItemTable tbody tr.NewRow:visible"
        ) + 1;
    let itemNumber = row.find(".JIDNI_Item_Number").val();
    let warehouseNumber = row.find(".JIDNI_WH_Number").val();
    let JIDNI_Number = row.find(".JIDNI_Number").val();
    let JIDNH_Number = new URLSearchParams(window.location.search).get("JIDNH_Number");
    setTimeout(function () {
        SaveTempBatch_Edit();
        EditItemRowTempTable(itemNumber, warehouseNumber, JIDNI_Number, JIDNH_Number, DBCH_Index);
    }, 100);

});


//#region jwc address
$("#AddressButton").on("click", function () {
    LoadJWCAddress();

});
function LoadJWCAddress() {

    var jwcNumber = $("#Header_JIDNH_JW_Customer_Number").val();

    $.ajax({
        url: '/JobworkInvoice/GetJWCAddress',
        type: 'GET',
        data: {
            JWCNumber: jwcNumber
        },

        success: function (response) {

            if (response && response.length > 0) {

                //#region CLEAR OLD ROWS

                $("#AddTableBody tr.AddNewRow").not(":first").remove();

                var firstRow = $("#AddTableBody tr.AddNewRow:first");

                firstRow.find("input").val("");
                firstRow.find("select").val("");
                firstRow.find(".JIDNA_IsDeleted").val("0");

                addressIndex = 1;

                //#endregion

                response.forEach(function (addr, index) {
                    if (addr.jwC_ADD_Default == 1) {
                        var row;

                        //#region FIRST ROW / NEW ROW

                        if (index === 0) {
                            row = $("#AddTableBody tr.AddNewRow:first");
                        }
                        else {
                            addAddressRow_Edit();
                            row = $("#AddTableBody tr.AddNewRow:last");
                        }

                        //#endregion

                        //#region BIND VALUES
                        row.find(".JIDNA_ADTP_Number")
                            .val(addr.jwC_ADD_ADTP_Number)
                            .trigger("change");

                        row.find(".JIDNA_Address_ID")
                            .val(addr.jwC_ADD_Address_ID);
                          


                        row.find(".JIDNA_Address")
                            .text(addr.jwC_ADD_Address);

                        row.find(".JIDNA_City")
                            .val(addr.jwC_ADD_City);

                        row.find(".JIDNA_State")
                            .val(addr.jwC_ADD_State);

                        row.find(".JIDNA_PIN")
                            .val(addr.jwC_ADD_PIN);

                        row.find(".jwC_ADD_GSTIN")
                            .val(addr.jwcaD_GSTIN);

                        //#endregion
                    }
                });

                ShowBuyerAddressPopup();
            }
            else {
                // alert("No Address Found");
            }
        }
    });
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
    ".JIDNI_BCH_QtyAvailable, .JIDNI_BCH_QtyReserved, .JIDNI_BCH_QtyInvoice, .JIDNI_BCH_BatchUnitPrice, .JIDNI_BCH_BatchValue",
    function () {

        let isQty =
            $(this).hasClass("JIDNI_BCH_QtyAvailable") ||
            $(this).hasClass("JIDNI_BCH_QtyReserved") ||
            $(this).hasClass("JIDNI_BCH_QtyInvoice");

        let type = isQty ? "q" : "c";

        $(this).val(addComma($(this).val(), type));
    });
//#endregion

