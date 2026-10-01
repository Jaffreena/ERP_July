$(document).ready(function () {

    //#region JW_Vendor – Focus Out
    $(document).on("focusout", ".JW_Vendor_Name", function () {
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
    $(document).on("keydown", ".JW_Vendor_Name", function (e) {

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

    //#region Item_Code – Keydown
    $(document).on("keydown", ".JOJWI_SVOI_Item_Code", function (e) {

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
            "#Header_JOJWI_SVOH_MS_Number"
        );
    });

    // mousedown -> (re)open the item pane and load/refresh the search.
    $(document).on("mousedown", ".JOJWI_SVOI_Item_Code", function (e) {
        if ($.trim($("#Header_JOJWI_SVOH_MS_Number").val()) === "") {
            $("#Header_JOJWI_SVOH_MS_Number").prop("selectedIndex", 1);
            return;
        }

        $("#RightPane").removeClass("show");
        $("#RightPane .buyer-search-results").hide();

        SearchServiceOrderItem(this);

        $("#RightPane_Item").addClass("show");
        $("#RightPane_Item .search-results").show();
    });
    //#endregion

    //#region Item_Code – Focus Out
    $(document).on("focusout", ".JOJWI_SVOI_Item_Code", function () {

        if (isSelectingItem)
            return;

        if ($.trim($("#Header_JOJWI_SVOH_MS_Number").val()) === "") {
            return;
        }

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

//#region item grid field widths
const ItemTableFields = [
    { cls: ".JOJWI_SVOI_JPRS_Number", min: 10, max: 25, align: "left" },   // Process
    { cls: ".JOJWI_SVOI_Item_Code", min: 10, max: 15, align: "left" },   // Item Code
    { cls: ".Description", min: 40, max: 40, align: "left" },   // Description
    { cls: ".OuterDia", min: 8, max: 8, align: "center" },   // Outer Dia
    { cls: ".Thickness", min: 8, max: 8, align: "center" },   // Thickness
    { cls: ".Length", min: 8, max: 8, align: "center" },   // Length
    { cls: ".Width", min: 8, max: 8, align: "center" },   // Width
    { cls: ".MaterialGrade", min: 10, max: 25, align: "left" },   // Material Grade
    { cls: ".ItemGroup", min: 10, max: 30, align: "left" },   // Item Group
    { cls: ".JOJWI_SVOI_WH_Number", min: 10, max: 15, align: "center" },   // Warehouse
    { cls: ".JOJWI_SVOI_UoM_Number", min: 10, max: 15, align: "center" },   // UoM
    { cls: ".SVO_Qty", min: 10, max: 20, align: "center" },   // SVO Qty (original)
    { cls: ".InvoicedQty", min: 10, max: 20, align: "center" },   // Invoiced Qty
    { cls: ".InvoiceToBeRaised", min: 10, max: 20, align: "center" },   // Invoice To Be Raised
    { cls: ".JOJWI_SVOI_Qty", min: 10, max: 20, align: "center" },   // Amend Qty
    { cls: ".JOJWI_SVOI_UnitPrice", min: 10, max: 20, align: "right", extraPadding: 28 },   // Unit Price
    { cls: ".JOJWI_SVOI_Amount", min: 13, max: 25, align: "right", extraPadding: 28 },   // Amount
    { cls: ".JOJWI_SVOI_DeliveryDate", min: 12, max: 12, align: "center" }    // Delivery Date
];

const FreightItemTableFields = [
    { cls: ".JOFRT_SVOI_JPRS_Number", min: 10, max: 25, align: "left", extraPadding: 28 },   // Process
    { cls: ".JOFRT_SVOI_FromWH_Number", min: 10, max: 25, align: "left", extraPadding: 28 },   // From WH
    { cls: ".JOFRT_SVOI_ToWH_Number", min: 10, max: 25, align: "left", extraPadding: 28 },   // To WH
    { cls: ".JOFRT_SVOI_UoM_Number", min: 10, max: 15, align: "center", extraPadding: 28 },   // UoM
    { cls: ".SVO_Qty", min: 10, max: 20, align: "center" },   // SVO Qty (original)
    { cls: ".InvoicedQty", min: 10, max: 20, align: "center" },   // Invoiced Qty
    { cls: ".InvoiceToBeRaised", min: 10, max: 20, align: "center" },   // Invoice To Be Raised
    { cls: ".JOFRT_SVOI_Qty", min: 10, max: 20, align: "center" },   // Amend Qty
    { cls: ".JOFRT_SVOI_Rate", min: 10, max: 20, align: "right", extraPadding: 28 },   // Rate
    { cls: ".JOFRT_SVOI_Amount", min: 13, max: 25, align: "right", extraPadding: 28 }    // Amount
];

let isMouseSelectingBuyer = false;
let isBindingItems = false;
let rowIndex = 1;
let freightRowIndex = 1;

let buyerSearchXHR = null;
//#endregion

//#region helpers
function getTextWidth(text, element) {

    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");

    const style = window.getComputedStyle(element);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    return Math.ceil(ctx.measureText(text).width);
}

// Converts characters (ch) to pixels (1ch = width of "0" in the current font)
function chToPx(ch, element) {

    const canvas = chToPx.canvas || (chToPx.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");

    const style = window.getComputedStyle(element);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    const oneCh = ctx.measureText("0").width;

    return Math.ceil(ch * oneCh);
}

function HighlightRow(rows, index) {

    rows.removeClass("current-row");

    if (index < 0 || index >= rows.length)
        return;

    $(rows[index]).addClass("current-row");

    rows[index].scrollIntoView({
        block: "nearest"
    });
}

function AutoFit() {
    // JWI panel
    fitInputWidth("Header_JOJWI_SVOH_ServiceOrderNo", 20, 25);
    fitInputWidth("Header_JOJWI_SVOH_MS_Number", 20, 30);
    fitInputWidth("Header_JOJWI_SVOH_JW_Vendor_Name", 40, 50);
    fitInputWidth("Header_JOJWI_SVOH_Currency_Number", 10, 10);
    fitInputWidth("Header_JOJWI_SVOH_PaymentTerms", 30, 40);
    fitInputWidth("Header_JOJWI_SVOH_DeliveryTerms", 30, 40);
    fitInputWidth("Header_JOJWI_SVOH_DeliveryMode", 30, 40);
    fitInputWidth("Header_JOJWI_SVOH_Tax", 40, 40);
    fitInputWidth("Header_JOJWI_SVOH_TDC", 40, 40);
    fitInputWidth("Header_JOJWI_SVOH_Remarks", 40, 40);

    // Freight panel
    fitInputWidth("FreightHeader_JOFRT_SVOH_ServiceOrderNo", 20, 25);
    fitInputWidth("FreightHeader_JOFRT_SVOH_Category", 20, 20);
    fitInputWidth("FreightHeader_JOFRT_SVOH_JW_Vendor_Name", 40, 50);
    fitInputWidth("FreightHeader_JOFRT_SVOH_Currency_Number", 10, 10);
    fitInputWidth("FreightHeader_JOFRT_SVOH_PaymentTerms", 30, 40);
    fitInputWidth("FreightHeader_JOFRT_SVOH_DeliveryTerms", 30, 40);
    fitInputWidth("FreightHeader_JOFRT_SVOH_DeliveryMode", 30, 40);
    fitInputWidth("FreightHeader_JOFRT_SVOH_Tax", 40, 40);
    fitInputWidth("FreightHeader_JOFRT_SVOH_TDC", 40, 40);
    fitInputWidth("FreightHeader_JOFRT_SVOH_Remarks", 40, 40);
}
//#endregion
$(document).ready(function () {

    // search-results row click -> current row
    $(document).on("mousedown", ".search-results tbody tr", function () {

        let rows = $(".search-results tbody tr");
        rows.removeClass("current-row");
        $(this).addClass("current-row");
    });

    //#region item grid alignment
    ApplyFieldWidths({
        fields: ItemTableFields,
        container: "#ItemTable",
        tempRow: "#TempRow",
        tableBody: "#TableBody",
        searchTable: "#tblsearch"
    });

    ApplyFieldWidths({
        fields: FreightItemTableFields,
        container: "#FreightItemTable",
        tempRow: "#FreightTempRow",
        tableBody: "#FreightTableBody",
        searchTable: "#tblsearch"
    });

    $(document).on("input change blur", "#ItemTable input, #ItemTable textarea, #ItemTable select", function () {
        ApplyFieldWidths({
            fields: ItemTableFields,
            container: "#ItemTable",
            tempRow: "#TempRow",
            tableBody: "#TableBody",
            searchTable: "#tblsearch"
        });
    });

    $(document).on("input change blur", "#FreightItemTable input, #FreightItemTable textarea, #FreightItemTable select", function () {
        ApplyFieldWidths({
            fields: FreightItemTableFields,
            container: "#FreightItemTable",
            tempRow: "#FreightTempRow",
            tableBody: "#FreightTableBody",
            searchTable: "#tblsearch"
        });
    });
    //#endregion

    AutoFit();

    //#region Header AutoFit - KeyUp (JWI + Freight)
    const headerWidths = {
        Header_JOJWI_SVOH_ServiceOrderNo: [20, 25],
        Header_JOJWI_SVOH_MS_Number: [20, 30],
        Header_JOJWI_SVOH_JW_Vendor_Name: [40, 50],
        Header_JOJWI_SVOH_Currency_Number: [10, 10],
        Header_JOJWI_SVOH_PaymentTerms: [30, 40],
        Header_JOJWI_SVOH_DeliveryTerms: [30, 40],
        Header_JOJWI_SVOH_DeliveryMode: [30, 40],
        Header_JOJWI_SVOH_Tax: [40, 40],
        Header_JOJWI_SVOH_TDC: [40, 40],
        Header_JOJWI_SVOH_Remarks: [40, 40],

        FreightHeader_JOFRT_SVOH_ServiceOrderNo: [20, 25],
        FreightHeader_JOFRT_SVOH_Category: [20, 20],
        FreightHeader_JOFRT_SVOH_JW_Vendor_Name: [40, 50],
        FreightHeader_JOFRT_SVOH_Currency_Number: [10, 10],
        FreightHeader_JOFRT_SVOH_PaymentTerms: [30, 40],
        FreightHeader_JOFRT_SVOH_DeliveryTerms: [30, 40],
        FreightHeader_JOFRT_SVOH_DeliveryMode: [30, 40],
        FreightHeader_JOFRT_SVOH_Tax: [40, 40],
        FreightHeader_JOFRT_SVOH_TDC: [40, 40],
        FreightHeader_JOFRT_SVOH_Remarks: [40, 40]
    };

    $(document).on("keyup change input",
        Object.keys(headerWidths).map(id => "#" + id).join(", "),
        function () {
            const [min, max] = headerWidths[this.id];
            fitInputWidth(this, min, max);
        });
    //#endregion

    //#region Initialize Flatpickr
    $(".datepicker").flatpickr({
        dateFormat: "d-M-Y",   // 30-Apr-2026
        altInput: true,        // shows formatted date
        altFormat: "d-M-Y",    // display format
        allowInput: true       // user can type manually
    });
    //#endregion

    //#region item grid - select full content on click/focus
    $(document).on("click focusin", "#ItemTable input, #FreightItemTable input", function (e) {
        e.stopPropagation();

        let input = this;
        input.focus();

        setTimeout(function () {
            input.select();
        }, 10);
    });
    //#endregion

    //#region restrict Qty to whole numbers only (no decimal point)
    $(document).on("keydown", ".JOJWI_SVOI_Qty, .JOFRT_SVOI_Qty", function (e) {

        if ($.inArray(e.key, ["Backspace", "Delete", "Tab", "Escape", "Enter",
            "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]) !== -1) {
            return;
        }

        if ((e.ctrlKey || e.metaKey) &&
            ["a", "c", "v", "x"].indexOf(e.key.toLowerCase()) !== -1) {
            return;
        }

        if (e.key >= "0" && e.key <= "9") {
            return;
        }

        e.preventDefault();
    });

    $(document).on("input", ".JOJWI_SVOI_Qty, .JOFRT_SVOI_Qty", function () {

        let cleaned = $(this).val().replace(/[^0-9]/g, "");

        if (cleaned !== $(this).val()) {
            $(this).val(cleaned);
        }
    });
    //#endregion

    //#region restrict UnitPrice/Rate to numbers + single decimal point
    $(document).on("keydown", ".JOJWI_SVOI_UnitPrice, .JOFRT_SVOI_Rate", function (e) {

        if ($.inArray(e.key, ["Backspace", "Delete", "Tab", "Escape", "Enter",
            "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]) !== -1) {
            return;
        }

        if ((e.ctrlKey || e.metaKey) &&
            ["a", "c", "v", "x"].indexOf(e.key.toLowerCase()) !== -1) {
            return;
        }

        if (e.key >= "0" && e.key <= "9") {
            return;
        }

        if (e.key === "." && this.value.indexOf(".") === -1) {
            return;
        }

        e.preventDefault();
    });

    $(document).on("input", ".JOJWI_SVOI_UnitPrice, .JOFRT_SVOI_Rate", function () {

        let cleaned = $(this).val().replace(/[^0-9.]/g, "");

        let firstDot = cleaned.indexOf(".");
        if (firstDot !== -1) {
            cleaned = cleaned.substring(0, firstDot + 1) +
                cleaned.substring(firstDot + 1).replace(/\./g, "");
        }

        if (cleaned !== $(this).val()) {
            $(this).val(cleaned);
        }
    });
    //#endregion

    //#region Amend Qty check (JWI + Freight): Qty cannot go below Invoiced + Invoice To Be Raised
    $(document).on("blur", ".JOJWI_SVOI_Qty, .JOFRT_SVOI_Qty", function () {

        let $row = $(this).closest("tr");

        let invoicedQty = parseFloat(removeComma($row.find(".InvoicedQty").val())) || 0;
        let invoiceToBeRaised = parseFloat(removeComma($row.find(".InvoiceToBeRaised").val())) || 0;
        let amendQty = parseFloat(removeComma($(this).val())) || 0;

        let minQty = invoicedQty + invoiceToBeRaised;

        if (amendQty < minQty) {
            alert(`Amend Qty cannot be less than ${minQty}`);
            $(this).val(minQty);
            $(this).focus();
        }
    });
    //#endregion

    //#region comma format on focusout
    $(document).on("focusout", ".JOJWI_SVOI_Qty, .JOJWI_SVOI_UnitPrice, .JOJWI_SVOI_Amount", function () {
        let type = $(this).hasClass("JOJWI_SVOI_Qty") ? "q" : "c";
        $(this).val(addComma($(this).val(), type));
    });

    $(document).on("focusout", ".JOFRT_SVOI_Qty, .JOFRT_SVOI_Rate, .JOFRT_SVOI_Amount", function () {
        let type = $(this).hasClass("JOFRT_SVOI_Qty") ? "q" : "c";
        $(this).val(addComma($(this).val(), type));
    });
    //#endregion

    //#region Amount = Qty x UnitPrice / Rate
    $(document).on("keyup change", ".JOJWI_SVOI_Qty, .JOJWI_SVOI_UnitPrice", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat(removeComma(row.find(".JOJWI_SVOI_Qty").val())) || 0;
        let price = parseFloat(removeComma(row.find(".JOJWI_SVOI_UnitPrice").val())) || 0;

        // Only set row amount (read-only field)
        row.find(".JOJWI_SVOI_Amount").val(formatIndianCurrency(qty * price));

        // Update footer totals separately
        JWICalculateTotal();

        // Auto add row
        JWIAutoAddRow(row);
    });

    $(document).on("keyup change", ".JOFRT_SVOI_Qty, .JOFRT_SVOI_Rate", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat(removeComma(row.find(".JOFRT_SVOI_Qty").val())) || 0;
        let rate = parseFloat(removeComma(row.find(".JOFRT_SVOI_Rate").val())) || 0;

        row.find(".JOFRT_SVOI_Amount").val(formatIndianCurrency(qty * rate));

        FreightCalculateTotal();

        FreightAutoAddRow(row);
    });
    //#endregion

});
$(document).ready(function () {

    //#region add row item grid
    // rowIndex is a global now (see Part 1)

    $("#AddRowButton").on("click", function () {

        let isValid = true;

        $("#ItemTable tbody tr.NewRow:last").find("input, select").each(function () {

            let el = $(this);

            // skip hidden delete flag
            if (el.hasClass("JOJWI_SVOI_IsDeleted")) return;

            if (el.hasClass("JOJWI_SVOI_Item_Code")) {
                if (!el.val()) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOJWI_SVOI_Qty")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOJWI_SVOI_UnitPrice")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOJWI_SVOI_JPRS_Number")) {
                if (!el.val() || el.val() === "0") { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOJWI_SVOI_WH_Number")) {
                if (!el.val() || el.val() === "0") { isValid = false; el.focus(); return false; }
            }
        });

        if (!isValid) {
            alert("Please fill required fields before adding new row.");
            return;
        }

        let $newRow = $("#TempRow").clone();

        // Clean up any flatpickr-generated elements from the template before reusing
        $newRow.find(".flatpickr-input").remove();
        $newRow.find("input.datepicker").removeClass("flatpickr-input").show();

        $newRow.removeAttr("id");
        $newRow.removeAttr("style");
        $newRow.addClass("NewRow");

        $newRow.find("input, select").each(function () {

            let el = $(this);

            if (el.attr("type") === "checkbox") el.prop("checked", false);

            if (!el.hasClass("JOJWI_SVOI_IsDeleted")) el.val("");

            let name = el.attr("name");
            if (name) {
                el.attr("name", name.replace(/\[\d+\]/, `[${rowIndex}]`));
            }
        });

        // new row: no saved qty to compare with
        $newRow.find(".SVO_Qty, .InvoicedQty, .InvoiceToBeRaised").val("0");

        $newRow.attr("data-rowid", new Date().getTime());

        $("#TableBody").append($newRow);

        $newRow.find(".datepicker").flatpickr({
            dateFormat: "d-M-Y",
            altInput: true,
            altFormat: "d-M-Y",
            allowInput: true
        });

        rowIndex++;

        JWICalculateTotal();

        ApplyFieldWidths({
            fields: ItemTableFields,
            container: "#ItemTable",
            tempRow: "#TempRow",
            tableBody: "#TableBody",
            searchTable: "#tblsearch"
        });
    });

    $("#AddRowButtonFreight").on("click", function () {

        let isValid = true;

        $("#FreightItemTable tbody tr.FreightNewRow:last").find("input, select").each(function () {

            let el = $(this);

            if (el.hasClass("JOFRT_SVOI_IsDeleted")) return;

            if (el.hasClass("JOFRT_SVOI_FromWH_Number")) {
                if (!el.val() || el.val() === "0") { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOFRT_SVOI_ToWH_Number")) {
                if (!el.val() || el.val() === "0") { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOFRT_SVOI_Qty")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOFRT_SVOI_Rate")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOFRT_SVOI_JPRS_Number")) {
                if (!el.val() || el.val() === "0") { isValid = false; el.focus(); return false; }
            }
        });

        if (!isValid) {
            alert("Please fill required fields before adding new row.");
            return;
        }

        let $newRow = $("#FreightTempRow").clone();

        $newRow.removeAttr("id");
        $newRow.removeAttr("style");
        $newRow.addClass("FreightNewRow").addClass("NewRow");

        $newRow.find("input, select").each(function () {

            let el = $(this);

            if (el.attr("type") === "checkbox") el.prop("checked", false);

            if (!el.hasClass("JOFRT_SVOI_IsDeleted")) el.val("");

            let name = el.attr("name");
            if (name) {
                el.attr("name", name.replace(/\[\d+\]/, `[${freightRowIndex}]`));
            }
        });

        // new row: no saved qty to compare with
        $newRow.find(".SVO_Qty, .InvoicedQty, .InvoiceToBeRaised").val("0");

        $newRow.attr("data-rowid", new Date().getTime());

        $("#FreightTableBody").append($newRow);

        freightRowIndex++;

        FreightCalculateTotal();

        ApplyFieldWidths({
            fields: FreightItemTableFields,
            container: "#FreightItemTable",
            tempRow: "#FreightTempRow",
            tableBody: "#FreightTableBody",
            searchTable: "#tblsearch"
        });
    });
    //#endregion add row item grid

    //#region row remove (single row button)
    $(document).on("click", ".RowRemove", function () {

        let row = $(this).closest("tr");

        if (row.closest("table").attr("id") === "ItemTable") {
            row.find(".JOJWI_SVOI_IsDeleted").val("1");
            row.hide();
            JWICalculateTotal();
        } else {
            row.find(".JOFRT_SVOI_IsDeleted").val("1");
            row.hide();
            FreightCalculateTotal();
        }
    });
    //#endregion

    //#region Update Function
    let isUpdating = false;

    $("#btnUpdate, #btnUpdateFreight").on("click", function (e) {

        if (isUpdating || window.IsViewMode) return false;

        let serviceType = $('input[name="ServiceType"]:checked').val();

        if (serviceType === "FREIGHT") {

            if (!FreightValidateHeaderById()) { e.preventDefault(); return false; }

            let duplicateMessage = FreightValidateDuplicateItemCombination();
            if (duplicateMessage) { e.preventDefault(); showAlert(duplicateMessage); return false; }

        } else {

            if (!JWIValidateHeaderById()) { e.preventDefault(); return false; }

            let duplicateMessage = JWIValidateDuplicateItemCombination();
            if (duplicateMessage) { e.preventDefault(); showAlert(duplicateMessage); return false; }
        }

        let model = CreateServiceOrderModel();

        $.ajax({
            beforeSend: function () { isUpdating = true; },
            complete: function () { isUpdating = false; },
            url: '/joboutward/transactions/jo-service-order/update',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(model),

            success: function (response) {

                if (response.success) {
                    $('#ModelAlert').one('hidden.bs.modal', function () {
                        location.reload();
                    });
                    showAlert('Record Updated');
                }
                else {
                    showAlert(response.message || 'Update failed');
                }
            },

            error: function (xhr) {
                console.log(xhr.responseText);
                showAlert('Update failed. Please try again.');
            }
        });

    });
    //#endregion

    //#region remove checked rows (saved row with invoiced / pending qty cannot be deleted)
    $("#RemoveItemRowButton").on("click", function () {

        let checkedRows = $("#ItemTable tbody tr.NewRow:visible").has(".CheckItem:checked");
        let totalVisibleRows = $("#ItemTable tbody tr.NewRow:visible").length;

        if (checkedRows.length === 0) { alert("Please select row."); return; }
        if ((totalVisibleRows - checkedRows.length) <= 0) { alert("At least one row required."); return; }
        if (checkedRows.length > 1) { alert("Please select only one row"); return; }

        checkedRows.each(function () {

            let currentRow = $(this);
            let itemNumber = currentRow.find(".JOJWI_SVOI_Number").val();

            let usedQty =
                (parseFloat(removeComma(currentRow.find(".InvoicedQty").val())) || 0) +
                (parseFloat(removeComma(currentRow.find(".InvoiceToBeRaised").val())) || 0);

            if (itemNumber && itemNumber !== "0" && usedQty > 0) {
                alert("This item already has invoiced / pending invoice qty and cannot be deleted.");
                return false;
            }

            if (itemNumber && itemNumber !== "0") {
                // already saved row -> soft delete
                currentRow.find(".JOJWI_SVOI_IsDeleted").val("1");
                currentRow.hide();
            }
            else {
                // new unsaved row -> hard delete
                currentRow.remove();
            }
        });

        JWICalculateTotal();
    });

    $("#RemoveItemRowButtonFreight").on("click", function () {

        let checkedRows = $("#FreightItemTable tbody tr.FreightNewRow:visible").has(".CheckItem:checked");
        let totalVisibleRows = $("#FreightItemTable tbody tr.FreightNewRow:visible").length;

        if (checkedRows.length === 0) { alert("Please select row."); return; }
        if ((totalVisibleRows - checkedRows.length) <= 0) { alert("At least one row required."); return; }
        if (checkedRows.length > 1) { alert("Please select only one row"); return; }

        checkedRows.each(function () {

            let currentRow = $(this);
            let itemNumber = currentRow.find(".JOFRT_SVOI_Number").val();

            let usedQty =
                (parseFloat(removeComma(currentRow.find(".InvoicedQty").val())) || 0) +
                (parseFloat(removeComma(currentRow.find(".InvoiceToBeRaised").val())) || 0);

            if (itemNumber && itemNumber !== "0" && usedQty > 0) {
                alert("This item already has invoiced / pending invoice qty and cannot be deleted.");
                return false;
            }

            if (itemNumber && itemNumber !== "0") {
                currentRow.find(".JOFRT_SVOI_IsDeleted").val("1");
                currentRow.hide();
            }
            else {
                currentRow.remove();
            }
        });

        FreightCalculateTotal();
    });
    //#endregion

    //#region load the saved order (SI_No / OrderType from the URL)
    const params = new URLSearchParams(window.location.search);

    const siNo = params.get("SI_No");
    const orderType = params.get("OrderType") || "JWI";

    if (siNo) {

        if (orderType === "FREIGHT") {
            $("#ServiceType_Freight").prop("checked", true);
            $("#FreightHeader_JOFRT_SVOH_Number").val(siNo);
            $("#ServiceType_JWI").closest(".form-check").hide();
        } else {
            $("#ServiceType_JWI").prop("checked", true);
            $("#Header_JOJWI_SVOH_Number").val(siNo);
            $("#ServiceType_Freight").closest(".form-check").hide();
        }

        toggleServiceTypePanels();

        GetServiceOrder(siNo, orderType);
    }

    $('input[name="ServiceType"]').on('change', toggleServiceTypePanels);
    //#endregion

    //#region view mode: lock what is on the page now, and lock again once the loaded rows have been built
    if (window.IsViewMode) {
        ApplyViewMode();

        $(document).ajaxComplete(function (event, xhr, settings) {
            if (settings.url && settings.url.indexOf("/joboutward/transactions/jo-service-order/get") === 0) {
                ApplyViewMode();
            }
        });
    }
    //#endregion
});

//#region VIEW MODE (read-only view of a saved order - same page, same load as Edit)
function ApplyViewMode() {

    // every field off: nothing on the page can be changed, and no search panel can open
    $("#ServiceOrderForm input:not([type=hidden]), #ServiceOrderForm select, #ServiceOrderForm textarea")
        .prop("disabled", true);

    // date pickers: show the date, never open the calendar
    $(".datepicker").each(function () {
        if (this._flatpickr) {
            this._flatpickr.set("clickOpens", false);
            if (this._flatpickr.altInput) this._flatpickr.altInput.disabled = true;
        }
    });

    // edit actions: Update / Clear All (right menus) and Add Row / Delete Row
    $("#JWIHeaderPanel .right-menu, #FreightHeaderPanel .right-menu").hide();
    $("#AddRowButton, #RemoveItemRowButton, #AddRowButtonFreight, #RemoveItemRowButtonFreight").hide();

    // badge
    if ($(".view-only-badge").length === 0) {
        $(".panel-header .h6 a.float-end")
            .before('<span class="badge bg-warning text-dark ms-2 view-only-badge">VIEW ONLY</span>');
    }
}
//#endregion

function toggleServiceTypePanels() {
    var type = $('input[name="ServiceType"]:checked').val();
    if (type === 'FREIGHT') {
        $('#JWIHeaderPanel').hide();
        $('#JWIItemTableWrap').hide();
        $('#FreightHeaderPanel').show();
        $('#FreightItemTableWrap').show();

        ApplyFieldWidths({
            fields: FreightItemTableFields,
            container: "#FreightItemTable",
            tempRow: "#FreightTempRow",
            tableBody: "#FreightTableBody",
            searchTable: "#tblsearch"
        });
    } else {
        $('#FreightHeaderPanel').hide();
        $('#FreightItemTableWrap').hide();
        $('#JWIHeaderPanel').show();
        $('#JWIItemTableWrap').show();

        ApplyFieldWidths({
            fields: ItemTableFields,
            container: "#ItemTable",
            tempRow: "#TempRow",
            tableBody: "#TableBody",
            searchTable: "#tblsearch"
        });
    }
}
//#region duplicate combination (Edit)
function JWIValidateDuplicateItemCombination() {

    let combinationMap = {};
    let duplicateMessages = [];

    $("#ItemTable tbody tr.NewRow").each(function (index) {

        let row = $(this);

        if (row.find(".JOJWI_SVOI_IsDeleted").val() == "1") return;
        if (!row.find(".JOJWI_SVOI_Item_Number").val()) return;

        let jprs = row.find(".JOJWI_SVOI_JPRS_Number").val() || 0;
        let item = row.find(".JOJWI_SVOI_Item_Number").val() || 0;
        let uom = row.find(".JOJWI_SVOI_UoM_Number").val() || 0;

        let key = jprs + "_" + item + "_" + uom;

        if (!combinationMap[key]) combinationMap[key] = [];
        combinationMap[key].push(index + 1);
    });

    $.each(combinationMap, function (key, rows) {
        if (rows.length > 1) {
            duplicateMessages.push(
                "Row # " + rows.join(", ") + " have the same combination of Process, Item and UoM"
            );
        }
    });

    return duplicateMessages.join("\n");
}

function FreightValidateDuplicateItemCombination() {

    let combinationMap = {};
    let duplicateMessages = [];

    $("#FreightItemTable tbody tr.FreightNewRow").each(function (index) {

        let row = $(this);

        if (row.find(".JOFRT_SVOI_IsDeleted").val() == "1") return;

        let jprs = row.find(".JOFRT_SVOI_JPRS_Number").val() || 0;
        let fromWH = row.find(".JOFRT_SVOI_FromWH_Number").val() || 0;
        let toWH = row.find(".JOFRT_SVOI_ToWH_Number").val() || 0;

        if (fromWH == 0 && toWH == 0) return;

        let key = jprs + "_" + fromWH + "_" + toWH;

        if (!combinationMap[key]) combinationMap[key] = [];
        combinationMap[key].push(index + 1);
    });

    $.each(combinationMap, function (key, rows) {
        if (rows.length > 1) {
            duplicateMessages.push(
                "Row # " + rows.join(", ") + " have the same combination of Process, From WH and To WH"
            );
        }
    });

    return duplicateMessages.join("\n");
}
//#endregion

//#region auto add row (Edit)
function JWIAutoAddRow(currentRow) {

    // page bind நடக்கும்போது auto-add வேண்டாம்
    if (isBindingItems) return;

    let qty = parseFloat(removeComma(currentRow.find(".JOJWI_SVOI_Qty").val())) || 0;
    let price = parseFloat(removeComma(currentRow.find(".JOJWI_SVOI_UnitPrice").val())) || 0;

    let itemCode = currentRow.find(".JOJWI_SVOI_Item_Code").val();
    let jprsNo = currentRow.find(".JOJWI_SVOI_JPRS_Number").val();
    let whNo = currentRow.find(".JOJWI_SVOI_WH_Number").val();

    let isRowValid =
        itemCode &&
        qty > 0 &&
        price > 0 &&
        jprsNo && jprsNo !== "0" &&
        whNo && whNo !== "0";

    let isLastRow = currentRow.is("#ItemTable tbody tr.NewRow:last");

    if (isRowValid && isLastRow && currentRow.next("tr").length === 0) {
        $("#AddRowButton").trigger("click");
    }
}

function FreightAutoAddRow(currentRow) {

    if (isBindingItems) return;

    let qty = parseFloat(removeComma(currentRow.find(".JOFRT_SVOI_Qty").val())) || 0;
    let rate = parseFloat(removeComma(currentRow.find(".JOFRT_SVOI_Rate").val())) || 0;

    let fromWH = currentRow.find(".JOFRT_SVOI_FromWH_Number").val();
    let jprsNo = currentRow.find(".JOFRT_SVOI_JPRS_Number").val();

    let isRowValid =
        fromWH && fromWH !== "0" &&
        qty > 0 &&
        rate > 0 &&
        jprsNo && jprsNo !== "0";

    let isLastRow = currentRow.is("#FreightItemTable tbody tr.FreightNewRow:last");

    if (isRowValid && isLastRow && currentRow.next("tr").length === 0) {
        $("#AddRowButtonFreight").trigger("click");
    }
}
//#endregion

//#region model builders (Edit)
function CreateJWIHeaderModel() {

    return {
        JOJWI_SVOH_Number:
            parseInt($("#Header_JOJWI_SVOH_Number").val()) || 0,

        JOJWI_SVOH_ServiceOrderNo:
            $("#Header_JOJWI_SVOH_ServiceOrderNo").val(),

        JOJWI_SVOH_ServiceOrderDate:
            $("#Header_JOJWI_SVOH_ServiceOrderDate").val()
                ? new Date($("#Header_JOJWI_SVOH_ServiceOrderDate").val()).toISOString()
                : null,

        JOJWI_SVOH_MS_Number:
            parseInt($("#Header_JOJWI_SVOH_MS_Number").val()) || 0,

        JOJWI_SVOH_JW_Vendor_Number:
            parseInt($("#JWIHeaderPanel .JW_Vendor_Number").val()) || 0,

        JOJWI_SVOH_Currency_Number:
            parseInt($("#Header_JOJWI_SVOH_Currency_Number").val()) || 0,

        JOJWI_SVOH_PaymentTerms: $("#Header_JOJWI_SVOH_PaymentTerms").val(),
        JOJWI_SVOH_DeliveryTerms: $("#Header_JOJWI_SVOH_DeliveryTerms").val(),
        JOJWI_SVOH_DeliveryMode: $("#Header_JOJWI_SVOH_DeliveryMode").val(),
        JOJWI_SVOH_Tax: $("#Header_JOJWI_SVOH_Tax").val(),
        JOJWI_SVOH_TDC: $("#Header_JOJWI_SVOH_TDC").val(),
        JOJWI_SVOH_Remarks: $("#Header_JOJWI_SVOH_Remarks").val()
    };
}

function CreateJWIItemsModel() {

    let items = [];

    $("#ItemTable tbody tr.NewRow").each(function () {

        let row = $(this);

        let number = parseInt(row.find(".JOJWI_SVOI_Number").val()) || 0;
        let isDeleted = row.find(".JOJWI_SVOI_IsDeleted").val() == "1";

        // புது row-ம் delete-ம் ஆனா அனுப்ப வேண்டாம்
        if (isDeleted && number === 0) return;

        // item இல்லாத empty row skip
        if (!isDeleted && !row.find(".JOJWI_SVOI_Item_Number").val()) return;

        items.push({
            JOJWI_SVOI_Number: number,

            JOJWI_SVOI_IsDeleted: isDeleted,

            JOJWI_SVOI_JPRS_Number:
                parseInt(row.find(".JOJWI_SVOI_JPRS_Number").val()) || 0,

            JOJWI_SVOI_Item_Number:
                parseInt(row.find(".JOJWI_SVOI_Item_Number").val()) || 0,

            JOJWI_SVOI_WH_Number:
                parseInt(row.find(".JOJWI_SVOI_WH_Number").val()) || null,

            JOJWI_SVOI_UoM_Number:
                parseInt(row.find(".JOJWI_SVOI_UoM_Number").val()) || 0,

            JOJWI_SVOI_Qty:
                parseFloat(removeComma(row.find(".JOJWI_SVOI_Qty").val())) || 0,

            JOJWI_SVOI_UnitPrice:
                parseFloat(removeComma(row.find(".JOJWI_SVOI_UnitPrice").val())) || 0,

            JOJWI_SVOI_Amount:
                parseFloat(removeComma(row.find(".JOJWI_SVOI_Amount").val())) || 0,

            JOJWI_SVOI_DeliveryDate:
                row.find(".JOJWI_SVOI_DeliveryDate").val()
                    ? new Date(row.find(".JOJWI_SVOI_DeliveryDate").val()).toISOString()
                    : null
        });
    });

    return items;
}

function CreateFreightHeaderModel() {

    return {
        JOFRT_SVOH_Number:
            parseInt($("#FreightHeader_JOFRT_SVOH_Number").val()) || 0,

        JOFRT_SVOH_ServiceOrderNo:
            $("#FreightHeader_JOFRT_SVOH_ServiceOrderNo").val(),

        JOFRT_SVOH_ServiceOrderDate:
            $("#FreightHeader_JOFRT_SVOH_ServiceOrderDate").val()
                ? new Date($("#FreightHeader_JOFRT_SVOH_ServiceOrderDate").val()).toISOString()
                : null,

        JOFRT_SVOH_Category:
            $("#FreightHeader_JOFRT_SVOH_Category").val() === "RN" ? "RECEIPT NOTE" : "DELIVERY NOTE",

        JOFRT_SVOH_JW_Vendor_Number:
            parseInt($("#FreightHeaderPanel .JW_Vendor_Number").val()) || 0,

        JOFRT_SVOH_Currency_Number:
            parseInt($("#FreightHeader_JOFRT_SVOH_Currency_Number").val()) || 0,

        JOFRT_SVOH_PaymentTerms: $("#FreightHeader_JOFRT_SVOH_PaymentTerms").val(),
        JOFRT_SVOH_DeliveryTerms: $("#FreightHeader_JOFRT_SVOH_DeliveryTerms").val(),
        JOFRT_SVOH_DeliveryMode: $("#FreightHeader_JOFRT_SVOH_DeliveryMode").val(),
        JOFRT_SVOH_Tax: $("#FreightHeader_JOFRT_SVOH_Tax").val(),
        JOFRT_SVOH_TDC: $("#FreightHeader_JOFRT_SVOH_TDC").val(),
        JOFRT_SVOH_Remarks: $("#FreightHeader_JOFRT_SVOH_Remarks").val()
    };
}

function CreateFreightItemsModel() {

    let items = [];

    $("#FreightItemTable tbody tr.FreightNewRow").each(function () {

        let row = $(this);

        let number = parseInt(row.find(".JOFRT_SVOI_Number").val()) || 0;
        let isDeleted = row.find(".JOFRT_SVOI_IsDeleted").val() == "1";

        if (isDeleted && number === 0) return;

        let jprs = row.find(".JOFRT_SVOI_JPRS_Number").val();
        let fromWH = row.find(".JOFRT_SVOI_FromWH_Number").val();

        // empty row skip (பழைய Freight Edit-ல இந்த check இல்ல)
        if (!isDeleted &&
            (!jprs || jprs === "0") && (!fromWH || fromWH === "0")) return;

        items.push({
            JOFRT_SVOI_Number: number,

            JOFRT_SVOI_IsDeleted: isDeleted,

            JOFRT_SVOI_JPRS_Number:
                parseInt(jprs) || 0,

            JOFRT_SVOI_FromWH_Number:
                parseInt(fromWH) || null,

            JOFRT_SVOI_ToWH_Number:
                parseInt(row.find(".JOFRT_SVOI_ToWH_Number").val()) || null,

            JOFRT_SVOI_UoM_Number:
                parseInt(row.find(".JOFRT_SVOI_UoM_Number").val()) || 0,

            JOFRT_SVOI_Qty:
                parseFloat(removeComma(row.find(".JOFRT_SVOI_Qty").val())) || 0,

            JOFRT_SVOI_Rate:
                parseFloat(removeComma(row.find(".JOFRT_SVOI_Rate").val())) || 0,

            JOFRT_SVOI_Amount:
                parseFloat(removeComma(row.find(".JOFRT_SVOI_Amount").val())) || 0
        });
    });

    return items;
}

function CreateServiceOrderModel() {

    let serviceType = $('input[name="ServiceType"]:checked').val();

    if (serviceType === "FREIGHT") {
        return {
            ServiceType: "FREIGHT",
            FreightHeader: CreateFreightHeaderModel(),
            FreightItems: CreateFreightItemsModel()
        };
    }

    return {
        ServiceType: "JWI",
        JWIHeader: CreateJWIHeaderModel(),
        JWIItems: CreateJWIItemsModel()
    };
}
//#endregion

//#region header + grid validation (Edit)
function JWIValidateHeaderById() {

    if (($("#Header_JOJWI_SVOH_ServiceOrderNo").val() || "").trim() === "") {
        showAlert("Service Order No. is required", "#Header_JOJWI_SVOH_ServiceOrderNo");
        return false;
    }

    if (($("#Header_JOJWI_SVOH_MS_Number").val() || "").trim() === "") {
        showAlert("Material Segregation is required", "#Header_JOJWI_SVOH_MS_Number");
        return false;
    }

    if (($("#Header_JOJWI_SVOH_ServiceOrderDate").val() || "").trim() === "") {
        showAlert("Service Order Date is required", "#Header_JOJWI_SVOH_ServiceOrderDate");
        return false;
    }

    if (($("#JWIHeaderPanel .JW_Vendor_Number").val() || "").trim() === "" ||
        ($("#Header_JOJWI_SVOH_JW_Vendor_Name").val() || "").trim() === "") {
        showAlert("JW Vendor is required", "#Header_JOJWI_SVOH_JW_Vendor_Name");
        return false;
    }

    let cur = $("#Header_JOJWI_SVOH_Currency_Number").val();
    if (!cur || cur === "0") {
        showAlert("Currency is required", "#Header_JOJWI_SVOH_Currency_Number");
        return false;
    }

    // grid
    return JWIValidateItemGrid();
}

function FreightValidateHeaderById() {

    if (($("#FreightHeader_JOFRT_SVOH_ServiceOrderNo").val() || "").trim() === "") {
        showAlert("Service Order No. is required", "#FreightHeader_JOFRT_SVOH_ServiceOrderNo");
        return false;
    }

    if (($("#FreightHeader_JOFRT_SVOH_ServiceOrderDate").val() || "").trim() === "") {
        showAlert("Service Order Date is required", "#FreightHeader_JOFRT_SVOH_ServiceOrderDate");
        return false;
    }

    if (($("#FreightHeaderPanel .JW_Vendor_Number").val() || "").trim() === "" ||
        ($("#FreightHeader_JOFRT_SVOH_JW_Vendor_Name").val() || "").trim() === "") {
        showAlert("JW Vendor is required", "#FreightHeader_JOFRT_SVOH_JW_Vendor_Name");
        return false;
    }

    let cur = $("#FreightHeader_JOFRT_SVOH_Currency_Number").val();
    if (!cur || cur === "0") {
        showAlert("Currency is required", "#FreightHeader_JOFRT_SVOH_Currency_Number");
        return false;
    }

    // grid
    return FreightValidateItemGrid();
}
//#endregion
//#region Calculate Total (Edit)
function JWICalculateTotal() {

    let totalQty = 0;
    let totalAmount = 0;

    $("#ItemTable tbody tr.NewRow").each(function () {

        let row = $(this);

        let del = row.find(".JOJWI_SVOI_IsDeleted").val();
        if (del === "1" || del === "true") return;

        let qty = parseFloat(removeComma(row.find(".JOJWI_SVOI_Qty").val())) || 0;
        let unitPrice = parseFloat(removeComma(row.find(".JOJWI_SVOI_UnitPrice").val())) || 0;
        let amount = qty * unitPrice;

        row.find(".JOJWI_SVOI_Amount").val(addComma(amount, "c"));

        totalQty += qty;
        totalAmount += amount;
    });

    $("#JWITotalQty").val(addComma(totalQty, "q"));
    $("#JWITotalAmount").val(addComma(totalAmount, "c"));
}

function FreightCalculateTotal() {

    let totalQty = 0;
    let totalAmount = 0;

    $("#FreightItemTable tbody tr.FreightNewRow").each(function () {

        let row = $(this);

        let del = row.find(".JOFRT_SVOI_IsDeleted").val();
        if (del === "1" || del === "true") return;

        let qty = parseFloat(removeComma(row.find(".JOFRT_SVOI_Qty").val())) || 0;
        let rate = parseFloat(removeComma(row.find(".JOFRT_SVOI_Rate").val())) || 0;
        let amount = qty * rate;

        row.find(".JOFRT_SVOI_Amount").val(addComma(amount, "c"));

        totalQty += qty;
        totalAmount += amount;
    });

    $("#FreightTotalQty").val(addComma(totalQty, "q"));
    $("#FreightTotalAmount").val(addComma(totalAmount, "c"));
}
//#endregion Calculate Total

//#region VALIDATE ITEM GRID (Edit)
function JWIValidateItemGrid() {

    let hasValidRow = false;
    let isValid = true;
    let rowNumber = 0;

    $("#ItemTable tbody tr.NewRow").each(function () {

        let row = $(this);

        if (row.attr("id") === "TempRow") return;

        let del = row.find(".JOJWI_SVOI_IsDeleted").val();
        if (del === "1" || del === "true") return;

        let process = row.find(".JOJWI_SVOI_JPRS_Number").val();
        let itemCode = row.find(".JOJWI_SVOI_Item_Code").val();
        let warehouse = row.find(".JOJWI_SVOI_WH_Number").val();
        let uom = row.find(".JOJWI_SVOI_UoM_Number").val();
        let qty = row.find(".JOJWI_SVOI_Qty").val();
        let unitPrice = row.find(".JOJWI_SVOI_UnitPrice").val();

        let isRowStarted =
            (process && process.trim() !== "") ||
            (itemCode && itemCode.trim() !== "") ||
            (warehouse && warehouse.trim() !== "") ||
            (uom && uom.trim() !== "") ||
            (qty && qty.trim() !== "") ||
            (unitPrice && unitPrice.trim() !== "");

        if (!isRowStarted) return;

        rowNumber++;
        hasValidRow = true;

        if (!process || process.trim() === "" || process === "0") {
            showAlert('Row ' + rowNumber + ': Process is required', row.find(".JOJWI_SVOI_JPRS_Number"));
            isValid = false;
            return false;
        }

        if (!itemCode || itemCode.trim() === "") {
            showAlert('Row ' + rowNumber + ': Item Code is required', row.find(".JOJWI_SVOI_Item_Code"));
            isValid = false;
            return false;
        }

        if (!warehouse || warehouse.trim() === "" || warehouse.trim() === "0") {
            showAlert('Row ' + rowNumber + ': Warehouse is required', row.find(".JOJWI_SVOI_WH_Number"));
            isValid = false;
            return false;
        }

        if (!uom || uom.trim() === "" || uom.trim() === "0") {
            showAlert('Row ' + rowNumber + ': UOM is required', row.find(".JOJWI_SVOI_UoM_Number"));
            isValid = false;
            return false;
        }

        if (!qty || qty.trim() === "" || qty.trim() === "0") {
            showAlert('Row ' + rowNumber + ': Qty is required', row.find(".JOJWI_SVOI_Qty"));
            isValid = false;
            return false;
        }

        if (!unitPrice || unitPrice.trim() === "" || unitPrice.trim() === "0") {
            showAlert('Row ' + rowNumber + ': Unit Price is required', row.find(".JOJWI_SVOI_UnitPrice"));
            isValid = false;
            return false;
        }

        // Amend Qty check
        let invoicedQty = parseFloat(removeComma(row.find(".InvoicedQty").val())) || 0;
        let toBeRaised = parseFloat(removeComma(row.find(".InvoiceToBeRaised").val())) || 0;
        let minQty = invoicedQty + toBeRaised;

        if ((parseFloat(removeComma(qty)) || 0) < minQty) {
            showAlert('Row ' + rowNumber + ': Amend Qty cannot be less than ' + minQty, row.find(".JOJWI_SVOI_Qty"));
            isValid = false;
            return false;
        }
    });

    if (isValid && !hasValidRow) {
        showAlert('Please add at least one item in grid');
        return false;
    }

    return isValid;
}

function FreightValidateItemGrid() {

    let hasValidRow = false;
    let isValid = true;
    let rowNumber = 0;

    $("#FreightItemTable tbody tr.FreightNewRow").each(function () {

        let row = $(this);

        if (row.attr("id") === "FreightTempRow") return;

        let del = row.find(".JOFRT_SVOI_IsDeleted").val();
        if (del === "1" || del === "true") return;

        let process = row.find(".JOFRT_SVOI_JPRS_Number").val();
        let fromWH = row.find(".JOFRT_SVOI_FromWH_Number").val();
        let toWH = row.find(".JOFRT_SVOI_ToWH_Number").val();
        let uom = row.find(".JOFRT_SVOI_UoM_Number").val();
        let qty = row.find(".JOFRT_SVOI_Qty").val();
        let rate = row.find(".JOFRT_SVOI_Rate").val();

        let isRowStarted =
            (process && process.trim() !== "" && process !== "0") ||
            (fromWH && fromWH.trim() !== "" && fromWH !== "0") ||
            (toWH && toWH.trim() !== "" && toWH !== "0") ||
            (qty && qty.trim() !== "") ||
            (rate && rate.trim() !== "");

        if (!isRowStarted) return;

        rowNumber++;
        hasValidRow = true;

        if (!process || process.trim() === "" || process === "0") {
            showAlert('Row ' + rowNumber + ': Process is required', row.find(".JOFRT_SVOI_JPRS_Number"));
            isValid = false;
            return false;
        }

        if (!fromWH || fromWH.trim() === "" || fromWH.trim() === "0") {
            showAlert('Row ' + rowNumber + ': From WH is required', row.find(".JOFRT_SVOI_FromWH_Number"));
            isValid = false;
            return false;
        }

        if (!toWH || toWH.trim() === "" || toWH.trim() === "0") {
            showAlert('Row ' + rowNumber + ': To WH is required', row.find(".JOFRT_SVOI_ToWH_Number"));
            isValid = false;
            return false;
        }

        if (!uom || uom.trim() === "" || uom.trim() === "0") {
            showAlert('Row ' + rowNumber + ': UOM is required', row.find(".JOFRT_SVOI_UoM_Number"));
            isValid = false;
            return false;
        }

        if (!qty || qty.trim() === "" || qty.trim() === "0") {
            showAlert('Row ' + rowNumber + ': Qty is required', row.find(".JOFRT_SVOI_Qty"));
            isValid = false;
            return false;
        }

        if (!rate || rate.trim() === "" || rate.trim() === "0") {
            showAlert('Row ' + rowNumber + ': Rate is required', row.find(".JOFRT_SVOI_Rate"));
            isValid = false;
            return false;
        }

        // Amend Qty check
        let invoicedQty = parseFloat(removeComma(row.find(".InvoicedQty").val())) || 0;
        let toBeRaised = parseFloat(removeComma(row.find(".InvoiceToBeRaised").val())) || 0;
        let minQty = invoicedQty + toBeRaised;

        if ((parseFloat(removeComma(qty)) || 0) < minQty) {
            showAlert('Row ' + rowNumber + ': Amend Qty cannot be less than ' + minQty, row.find(".JOFRT_SVOI_Qty"));
            isValid = false;
            return false;
        }
    });

    if (isValid && !hasValidRow) {
        showAlert('Please add at least one item in grid');
        return false;
    }

    return isValid;
}
//#endregion VALIDATE ITEM GRID

//#region ALERT MESSAGE
function showAlert(message, focusSelector = null) {

    $('#AlertMessage').html(String(message).replace(/\n/g, "<br/>"));

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
//#region SetPickerDate (value -> flatpickr, timezone shift இல்லாம)
function SetPickerDate(selector, value) {

    let $el = (typeof selector === "string") ? $(selector) : $(selector);
    if ($el.length === 0) return;

    let el = $el[0];

    if (!value) {
        if (el._flatpickr) el._flatpickr.clear(); else $el.val("");
        return;
    }

    // "2026-09-20T00:00:00" -> date part only, local date
    let parts = String(value).substring(0, 10).split("-");
    let d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));

    if (el._flatpickr) {
        el._flatpickr.setDate(d, true);
    } else {
        $el.val(value);
    }
}
//#endregion

//#region GET service order
function GetServiceOrder(siNo, orderType) {

    $.ajax({
        url: "/joboutward/transactions/jo-service-order/get",
        type: "GET",
        data: { Number: siNo, OrderType: orderType },
        dataType: "json",

        success: function (data) {

            if (!data || !data.Header) {
                showAlert("Service Order not found");
                return;
            }

            if (orderType === "FREIGHT") {
                BindFreightHeader(data.Header);
                BindFreightItems(data.Items || []);
            } else {
                BindHeader(data.Header);
                BindItems(data.Items || []);
            }
        },

        error: function (xhr) {
            console.log(xhr.responseText);
            showAlert("Unable to load Service Order");
        }
    });
}
//#endregion

//#region BIND header
function BindHeader(h) {

    $("#Header_JOJWI_SVOH_Number").val(h.JOJWI_SVOH_Number);
    $("#Header_JOJWI_SVOH_ServiceOrderNo").val(h.JOJWI_SVOH_ServiceOrderNo);
    SetPickerDate("#Header_JOJWI_SVOH_ServiceOrderDate", h.JOJWI_SVOH_ServiceOrderDate);

    $("#Header_JOJWI_SVOH_MS_Number").val(h.JOJWI_SVOH_MS_Number);

    $("#JWIHeaderPanel .JW_Vendor_Number").val(h.JOJWI_SVOH_JW_Vendor_Number);
    $("#Header_JOJWI_SVOH_JW_Vendor_Name").val(h.JOJWI_SVOH_JW_Vendor_Name);

    $("#Header_JOJWI_SVOH_Currency_Number").val(h.JOJWI_SVOH_Currency_Number);

    $("#Header_JOJWI_SVOH_PaymentTerms").val(h.JOJWI_SVOH_PaymentTerms);
    $("#Header_JOJWI_SVOH_DeliveryTerms").val(h.JOJWI_SVOH_DeliveryTerms);
    $("#Header_JOJWI_SVOH_DeliveryMode").val(h.JOJWI_SVOH_DeliveryMode);
    $("#Header_JOJWI_SVOH_Tax").val(h.JOJWI_SVOH_Tax);
    $("#Header_JOJWI_SVOH_TDC").val(h.JOJWI_SVOH_TDC);
    $("#Header_JOJWI_SVOH_Remarks").val(h.JOJWI_SVOH_Remarks);

    // header AutoFit
    $("#JWIHeaderPanel input[type=text], #JWIHeaderPanel select").trigger("input");
}

function BindFreightHeader(h) {

    $("#FreightHeader_JOFRT_SVOH_Number").val(h.JOFRT_SVOH_Number);
    $("#FreightHeader_JOFRT_SVOH_ServiceOrderNo").val(h.JOFRT_SVOH_ServiceOrderNo);
    SetPickerDate("#FreightHeader_JOFRT_SVOH_ServiceOrderDate", h.JOFRT_SVOH_ServiceOrderDate);

    $("#FreightHeader_JOFRT_SVOH_Category")
        .val(h.JOFRT_SVOH_Category === "RECEIPT NOTE" ? "RN" : "DN");

    $("#FreightHeaderPanel .JW_Vendor_Number").val(h.JOFRT_SVOH_JW_Vendor_Number);
    $("#FreightHeader_JOFRT_SVOH_JW_Vendor_Name").val(h.JOFRT_SVOH_JW_Vendor_Name);

    $("#FreightHeader_JOFRT_SVOH_Currency_Number").val(h.JOFRT_SVOH_Currency_Number);

    $("#FreightHeader_JOFRT_SVOH_PaymentTerms").val(h.JOFRT_SVOH_PaymentTerms);
    $("#FreightHeader_JOFRT_SVOH_DeliveryTerms").val(h.JOFRT_SVOH_DeliveryTerms);
    $("#FreightHeader_JOFRT_SVOH_DeliveryMode").val(h.JOFRT_SVOH_DeliveryMode);
    $("#FreightHeader_JOFRT_SVOH_Tax").val(h.JOFRT_SVOH_Tax);
    $("#FreightHeader_JOFRT_SVOH_TDC").val(h.JOFRT_SVOH_TDC);
    $("#FreightHeader_JOFRT_SVOH_Remarks").val(h.JOFRT_SVOH_Remarks);

    // header AutoFit
    $("#FreightHeaderPanel input[type=text], #FreightHeaderPanel select").trigger("input");
}
//#endregion

//#region BIND items
function BindItems(items) {

    isBindingItems = true;

    $("#TableBody tr.NewRow").remove();

    let idx = 0;

    items.forEach(function (it) {

        let $row = $("#TempRow").clone();

        $row.find(".flatpickr-input").remove();
        $row.find("input.datepicker").removeClass("flatpickr-input").show();

        $row.removeAttr("id");
        $row.removeAttr("style");
        $row.addClass("NewRow");

        // name index
        $row.find("input, select").each(function () {
            let name = $(this).attr("name");
            if (name) $(this).attr("name", name.replace(/\[\d+\]/, "[" + idx + "]"));
        });

        let qty = it.JOJWI_SVOI_Qty || 0;

        $row.find(".JOJWI_SVOI_Number").val(it.JOJWI_SVOI_Number);
        $row.find(".JOJWI_SVOI_IsDeleted").val("0");
        $row.find(".JOJWI_SVOI_JPRS_Number").val(it.JOJWI_SVOI_JPRS_Number);
        $row.find(".JOJWI_SVOI_Item_Number").val(it.JOJWI_SVOI_Item_Number);
        $row.find(".JOJWI_SVOI_Item_Code").val(it.JOJWI_SVOI_Item_Code);
        $row.find(".Description").val(it.Description);
        $row.find(".OuterDia").val(it.OuterDia);
        $row.find(".Thickness").val(it.Thickness);
        $row.find(".Length").val(it.Length);
        $row.find(".Width").val(it.Width);
        $row.find(".MaterialGrade").val(it.MaterialGrade);
        $row.find(".ItemGroup").val(it.ItemGroup);
        $row.find(".JOJWI_SVOI_WH_Number").val(it.JOJWI_SVOI_WH_Number);
        $row.find(".JOJWI_SVOI_UoM_Number").val(it.JOJWI_SVOI_UoM_Number);

        // Amend pattern: SVO Qty = saved qty (readonly), Qty = Amend Qty (editable)
        $row.find(".SVO_Qty").val(addComma(qty, "q"));
        $row.find(".InvoicedQty").val(addComma(it.InvoicedQty || 0, "q"));
        $row.find(".InvoiceToBeRaised").val(addComma(it.InvoiceToBeRaised || 0, "q"));
        $row.find(".JOJWI_SVOI_Qty").val(addComma(qty, "q"));

        $row.find(".JOJWI_SVOI_UnitPrice").val(addComma(it.JOJWI_SVOI_UnitPrice || 0, "c"));
        $row.find(".JOJWI_SVOI_Amount").val(addComma(it.JOJWI_SVOI_Amount || 0, "c"));

        $row.attr("data-rowid", new Date().getTime() + idx);

        $("#TableBody").append($row);

        $row.find(".datepicker").flatpickr({
            dateFormat: "d-M-Y",
            altInput: true,
            altFormat: "d-M-Y",
            allowInput: true
        });
        SetPickerDate($row.find(".JOJWI_SVOI_DeliveryDate"), it.JOJWI_SVOI_DeliveryDate);

        idx++;
    });

    // Add Row button-க்கு அடுத்த index
    rowIndex = idx;

    isBindingItems = false;

    JWICalculateTotal();

    // கடைசியில ஒரு empty row
    $("#AddRowButton").trigger("click");

    ApplyFieldWidths({
        fields: ItemTableFields,
        container: "#ItemTable",
        tempRow: "#TempRow",
        tableBody: "#TableBody",
        searchTable: "#tblsearch"
    });
}

function BindFreightItems(items) {

    isBindingItems = true;

    $("#FreightTableBody tr.FreightNewRow").remove();

    let idx = 0;

    items.forEach(function (it) {

        let $row = $("#FreightTempRow").clone();

        $row.removeAttr("id");
        $row.removeAttr("style");
        $row.addClass("FreightNewRow").addClass("NewRow");

        $row.find("input, select").each(function () {
            let name = $(this).attr("name");
            if (name) $(this).attr("name", name.replace(/\[\d+\]/, "[" + idx + "]"));
        });

        let qty = it.JOFRT_SVOI_Qty || 0;

        $row.find(".JOFRT_SVOI_Number").val(it.JOFRT_SVOI_Number);
        $row.find(".JOFRT_SVOI_IsDeleted").val("0");
        $row.find(".JOFRT_SVOI_JPRS_Number").val(it.JOFRT_SVOI_JPRS_Number);
        $row.find(".JOFRT_SVOI_FromWH_Number").val(it.JOFRT_SVOI_FromWH_Number);
        $row.find(".JOFRT_SVOI_ToWH_Number").val(it.JOFRT_SVOI_ToWH_Number);
        $row.find(".JOFRT_SVOI_UoM_Number").val(it.JOFRT_SVOI_UoM_Number);

        // Amend pattern (JWI மாதிரியே)
        $row.find(".SVO_Qty").val(addComma(qty, "q"));
        $row.find(".InvoicedQty").val(addComma(it.InvoicedQty || 0, "q"));
        $row.find(".InvoiceToBeRaised").val(addComma(it.InvoiceToBeRaised || 0, "q"));
        $row.find(".JOFRT_SVOI_Qty").val(addComma(qty, "q"));

        $row.find(".JOFRT_SVOI_Rate").val(addComma(it.JOFRT_SVOI_Rate || 0, "c"));
        $row.find(".JOFRT_SVOI_Amount").val(addComma(it.JOFRT_SVOI_Amount || 0, "c"));

        $row.attr("data-rowid", new Date().getTime() + idx);

        $("#FreightTableBody").append($row);

        idx++;
    });

    freightRowIndex = idx;

    isBindingItems = false;

    FreightCalculateTotal();

    $("#AddRowButtonFreight").trigger("click");

    ApplyFieldWidths({
        fields: FreightItemTableFields,
        container: "#FreightItemTable",
        tempRow: "#FreightTempRow",
        tableBody: "#FreightTableBody",
        searchTable: "#tblsearch"
    });
}
//#endregion

//#region JW Vendor search functions (Edit)
function OnBuyerSelectCall(inputElement) {
    OnBuyerSelect(inputElement, "#RightPane", ".buyer-search-results");
}

function OnBuyerInput(inputElement) {

    // User is only selecting text
    if (inputElement.selectionStart !== inputElement.selectionEnd) {
        return;
    }

    SearchBuyer(inputElement);
}

function SearchBuyer(inputElement) {

    var JW_Vendor = inputElement.value;
    var $panel = $(inputElement).closest(".card");
    var resultsDiv = $("#RightPane").find(".buyer-search-results");

    if (buyerSearchXHR) {
        buyerSearchXHR.abort();
    }

    buyerSearchXHR = $.ajax({
        url: '/joboutward/transactions/jo-service-order/vendor',
        type: 'GET',
        data: { JW_Vendor: JW_Vendor },
        success: function (data) {

            resultsDiv.empty();
            $("#BuyerMessage").hide().text("");

            if (data && data.length > 0) {

                $("#RightPane").addClass("show");
                resultsDiv.show();

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

                $.each(data, function (i, vendor) {
                    var row = $("<tr></tr>").css("height", "24px");
                    row.data("vendor", vendor);
                    row.append("<td>" + vendor.jwV_JW_VendorName + "</td>");
                    table.find("tbody").append(row);
                });

                table.find("tbody").on("mousedown", "tr", function (e) {

                    e.preventDefault();

                    const clickedVendor = $(this).data("vendor");
                    isMouseSelectingBuyer = true;

                    $("#BuyerMessage").hide().text("");

                    $(inputElement).val(clickedVendor.jwV_JW_VendorName);

                    $panel.find(".JW_Vendor_Number")
                        .val(clickedVendor.jwV_Number);

                    let $currency = $panel.find(".Currency_Number");
                    $currency
                        .val(clickedVendor.jwV_Currency_Number)
                        .trigger("change");

                    $("#RightPane").removeClass("show");
                    $("#RightPane .buyer-search-results").hide();

                    setTimeout(function () {
                        $currency.focus();
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

                //#region search logic highlight
                let rows = resultsDiv.find("tbody tr");
                rows.removeClass("match-row current-row");
                $(inputElement).removeData("selectedIndex");

                let searchText = JW_Vendor.trim().toLowerCase();
                let firstMatch = -1;
                let lastMatch = -1;

                rows.each(function (i) {
                    let name = $(this).find("td:first").text().trim().toLowerCase();

                    if (searchText !== "" && name.startsWith(searchText)) {
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
//#endregion JW Vendor search functions

//#region Item search functions (Edit)
function OnInputItem(inputElement) {
    SearchServiceOrderItem(inputElement);
}

function OnFocusItem(inputElement) {

    if (isSelectingItem) {
        return;
    }

    let material = $("#Header_JOJWI_SVOH_MS_Number").val();

    if (!material) {
        $("#RightPane_Item").removeClass("show");
        $("#RightPane_Item .search-results").hide();

        showAlert('Please select Material Segregation before searching for an item.', '#Header_JOJWI_SVOH_MS_Number');
        return;
    }

    SearchServiceOrderItem(inputElement);
}

function SearchServiceOrderItem(inputElement) {

    let itemCode = inputElement.value.trim();
    let row = $(inputElement).closest("tr");
    let resultsDiv = $("#RightPane_Item").find(".search-results");
    let material = $("#Header_JOJWI_SVOH_MS_Number").val();

    if (!material) {
        showAlert('Please select Material Segregation before searching for an item.', '#Header_JOJWI_SVOH_MS_Number');
        return;
    }

    if (itemSearchXHR) {
        itemSearchXHR.abort();
    }

    itemSearchXHR = $.ajax({
        url: '/joboutward/transactions/jo-service-order/item',
        type: 'GET',
        data: {
            ItemCode: itemCode,
            MS: material
        },
        success: function (data) {

            resultsDiv.empty();

            if (data && data.length > 0) {

                $("#RightPane_Item").addClass("show");
                resultsDiv.show();

                let table = $(`
<div class="card-body batchPopup modal-content p-0 table-responsive" style="z-index:999;">
    <table class="table table-bordered table-hover table-fixed table-grid mb-0" id="tblsearch">
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

                    let tr = $(`
<tr style="height:24px;cursor:pointer;">
    <td style="width:30%;">${item.itemCode}</td>
    <td style="width:70%;">${item.itemDescription}</td>
</tr>
`);

                    tr.on("mousedown", function (e) {

                        e.preventDefault();

                        isSelectingItem = true;

                        row.find(".JOJWI_SVOI_Item_Code").val(item.itemCode);
                        row.find(".JOJWI_SVOI_Item_Number").val(item.itemNumber);

                        row.find(".Description").val(item.itemDescription);
                        row.find(".OuterDia").val(item.outerDia);
                        row.find(".Thickness").val(item.thickness);
                        row.find(".Length").val(item.length);
                        row.find(".Width").val(item.width);
                        row.find(".MaterialGrade").val(item.materialGrade);
                        row.find(".ItemGroup").val(item.itemGroup);
                        row.find(".JOJWI_SVOI_WH_Number").val(item.saleWarehouse);
                        row.find(".JOJWI_SVOI_UoM_Number").val(item.uoM);

                        row.find(".JOJWI_SVOI_Qty").focus();

                        setTimeout(function () {
                            isSelectingItem = false;
                        }, 100);

                        resultsDiv.hide();
                        $("#RightPane_Item").removeClass("show");
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

                //#region match row highlight
                let rows = resultsDiv.find("tbody tr");
                rows.removeClass("match-row current-row");
                $(inputElement).removeData("selectedIndex");

                let searchText = itemCode.toLowerCase();
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
                } else {
                    $(inputElement).removeData("firstMatch");
                    $(inputElement).removeData("lastMatch");
                }
                //#endregion
            }
            else {
                resultsDiv.append(GetItemEmptyView());
                $("#RightPane_Item").addClass("show");
                resultsDiv.show();
            }
        },
        error: function (xhr, status) {
            if (status === "abort") {
                return;
            }
            resultsDiv.html("Error loading data.");
            resultsDiv.show();
        }
    });
}
//#endregion Item search functions