$(document).ready(function () {
    //#region JW_Customer – Focus In
    // Handled via inline onfocus in the .cshtml — no delegated
    // binding needed.
    //#endregion

    //#region JW_Customer – Text change
    // Handled via inline oninput in the .cshtml.
    //#endregion

    //#region JW_Customer – Focus Out
    $(document).on("focusout", ".JW_Customer_Name", function () {
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
    $(document).on("keydown", ".JW_Customer_Name", function (e) {

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
    // Handled via inline onfocus in the .cshtml.
    //#endregion

    //#region Item_Code – Text change
    // Handled via inline oninput in the .cshtml.
    //#endregion

    //#region Item_Code – Keydown
    $(document).on("keydown", ".JISVOI_Item_Code", function (e) {

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
            "#Header_JISVOH_MS_Number"
        );
    });

    // mousedown -> (re)open the item pane and load/refresh the search.
    $(document).on("mousedown", ".JISVOI_Item_Code", function (e) {
        if ($.trim($("#Header_JIJWI_SVOH_MS_Number").val()) === "") {
            $("#Header_JIJWI_SVOH_MS_Number").prop("selectedIndex", 1);
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
    $(document).on("focusout", ".JISVOI_Item_Code", function () {

        if (isSelectingItem)
            return;

        if ($.trim($("#Header_JIJWI_SVOH_MS_Number").val()) === "") {
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
const ItemTableFields = [
    { cls: ".JISVOI_PRS_Number", min: 10, max: 25, align: "left" },   // Process
    { cls: ".JISVOI_Item_Code", min: 10, max: 15, align: "left" },   // Item Code
    { cls: ".Description", min: 40, max: 40, align: "left" },   // Description

    { cls: ".OuterDia", min: 8, max: 8, align: "center" }, // Outer Dia
    { cls: ".Thickness", min: 8, max: 8, align: "center" }, // Thickness
    { cls: ".Length", min: 8, max: 8, align: "center" }, // Length
    { cls: ".Width", min: 8, max: 8, align: "center" }, // Width

    { cls: ".MaterialGrade", min: 10, max: 25, align: "left" },   // Material Grade
    { cls: ".ItemGroup", min: 10, max: 30, align: "left" },   // Item Group

    { cls: ".JISVOI_WH_Number", min: 10, max: 15, align: "center" }, // Warehouse (NEW - Point 4)
    { cls: ".JISVOI_UoM_Number", min: 10, max: 15, align: "center" }, // UoM

    { cls: ".SVO_Qty", min: 10, max: 20, align: "center" }, // Qty
    { cls: ".InvoicedQty", min: 10, max: 20, align: "center" }, // Qty
    { cls: ".InvoiceToBeRaised", min: 10, max: 20, align: "center" }, // Qty
    { cls: ".JISVOI_Qty", min: 10, max: 20, align: "center" }, // Qty
    { cls: ".JISVOI_UnitPrice", min: 10, max: 20, align: "right", extraPadding: 28 },  // Unit Price
    { cls: ".JISVOI_Amount", min: 13, max: 25, align: "right", extraPadding: 28 },  // Amount

    { cls: ".JISVOI_DeliveryDate", min: 12, max: 12, align: "center" }  // Delivery Date
];

const FreightItemTableFields = [
    { cls: ".JIFRT_SVOI_PRS_Number", min: 10, max: 25, align: "left", extraPadding: 28 },
    { cls: ".JIFRT_SVOI_FromWH_Number", min: 10, max: 25, align: "left", extraPadding: 28 },
    { cls: ".JIFRT_SVOI_ToWH_Number", min: 10, max: 25, align: "left", extraPadding: 28 },
    { cls: ".JIFRT_SVOI_UoM_Number", min: 10, max: 15, align: "center", extraPadding: 28 },
    { cls: ".JIFRT_SVOI_Qty", min: 10, max: 20, align: "center" },
    { cls: ".JIFRT_SVOI_Rate", min: 10, max: 20, align: "right", extraPadding: 28 },
    { cls: ".JIFRT_SVOI_Amount", min: 13, max: 25, align: "right", extraPadding: 28 }
];

let isMouseSelectingBuyer = false;
let isBindingItems = false;
let freightRowIndex = 1;

let buyerSearchXHR = null;
//#region item grid alignment
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
//#endregion


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
    fitInputWidth("Header_JIJWI_SVOH_RegNo", 20, 25);
    fitInputWidth("Header_JIJWI_SVOH_ServiceOrderNo", 20, 25);
    fitInputWidth("Header_JIJWI_SVOH_MS_Number", 20, 30);
    fitInputWidth("Header_JIJWI_SVOH_JW_Customer_Name", 40, 50);
    fitInputWidth("Header_JIJWI_SVOH_Currency_Number", 10, 10);
    fitInputWidth("Header_JIJWI_SVOH_PaymentTerms", 30, 40);
    fitInputWidth("Header_JIJWI_SVOH_DeliveryTerms", 30, 40);
    fitInputWidth("Header_JIJWI_SVOH_DeliveryMode", 30, 40);
    fitInputWidth("Header_JIJWI_SVOH_Tax", 40, 40);
    fitInputWidth("Header_JIJWI_SVOH_TDC", 40, 40);
    fitInputWidth("Header_JIJWI_SVOH_Remarks", 40, 40);

    // Freight panel
    fitInputWidth("FreightHeader_JIFRT_SVOH_RegNo", 20, 25);
    fitInputWidth("FreightHeader_JIFRT_SVOH_ServiceOrderNo", 20, 25);
    fitInputWidth("FreightHeader_JIFRT_SVOH_Category", 20, 20);
    fitInputWidth("FreightHeader_JIFRT_SVOH_JW_Customer_Name", 40, 50);
    fitInputWidth("FreightHeader_JIFRT_SVOH_Currency_Number", 10, 10);
    fitInputWidth("FreightHeader_JIFRT_SVOH_PaymentTerms", 30, 40);
    fitInputWidth("FreightHeader_JIFRT_SVOH_DeliveryTerms", 30, 40);
    fitInputWidth("FreightHeader_JIFRT_SVOH_DeliveryMode", 30, 40);
    fitInputWidth("FreightHeader_JIFRT_SVOH_Tax", 40, 40);
    fitInputWidth("FreightHeader_JIFRT_SVOH_TDC", 40, 40);
    fitInputWidth("FreightHeader_JIFRT_SVOH_Remarks", 40, 40);
}
$(document).ready(function () {
   
    //#region item code right pane search JISVOI_Item_Code
    $(document).on("mousedown", ".search-results tbody tr", function () {

        let rows = $(".search-results tbody tr");

        // Remove previous current row
        rows.removeClass("current-row");

        // Make clicked row the current row
        $(this).addClass("current-row");
    });
    //#region Item_Code – Keydown/Mousedown/Focus Out: moved to <script> block
    //#endregion
    //#region Header_JISVOH_JW_Customer_Name
    // JW_Customer – Focus Out: moved to <script> block
    // JW_Customer – Keydown: moved to <script> block
    //#endregion
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
    //#region Header AutoFit - KeyUp

    $(document).on("keyup change input",
        "#Header_JIJWI_SVOH_RegNo, #Header_JIJWI_SVOH_ServiceOrderNo, #Header_JIJWI_SVOH_MS_Number, #Header_JIJWI_SVOH_JW_Customer_Name, #Header_JIJWI_SVOH_Currency_Number, #Header_JIJWI_SVOH_PaymentTerms, #Header_JIJWI_SVOH_DeliveryTerms, #Header_JIJWI_SVOH_DeliveryMode, #Header_JIJWI_SVOH_Tax, #Header_JIJWI_SVOH_TDC, #Header_JIJWI_SVOH_Remarks",
        function () {

            const widths = {
                Header_JIJWI_SVOH_RegNo: [20, 25],
                Header_JIJWI_SVOH_ServiceOrderNo: [20, 25],
                Header_JIJWI_SVOH_MS_Number: [20, 30],
                Header_JIJWI_SVOH_JW_Customer_Name: [40, 50],
                Header_JIJWI_SVOH_Currency_Number: [10, 10],
                Header_JIJWI_SVOH_PaymentTerms: [30, 40],
                Header_JIJWI_SVOH_DeliveryTerms: [30, 40],
                Header_JIJWI_SVOH_DeliveryMode: [30, 40],
                Header_JIJWI_SVOH_Tax: [40, 40],
                Header_JIJWI_SVOH_TDC: [40, 40],
                Header_JIJWI_SVOH_Remarks: [40, 40]
            };

            const [min, max] = widths[this.id];
            fitInputWidth(this, min, max);
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
    DateBind();
    //#region onkeypress qty and unit
    $(document).on("blur", ".JISVOI_Qty", function () {

        let $row = $(this).closest("tr");

        let invoicedQty = parseFloat(removeComma($row.find(".InvoicedQty").val())) || 0;
        let invoiceToBeRaised = parseFloat(removeComma($row.find(".InvoiceToBeRaised").val())) || 0;
        let amendQty = parseFloat(removeComma($(this).val())) || 0;

        let minQty = invoicedQty + invoiceToBeRaised;

        if (amendQty < minQty) {
            alert(`Amend Qty cannot be less than ${minQty}`);
            $(this).val(minQty);
            $(this).focus(); // optional: focus back
        }
    });

    //#region comma format on focusout
    $(document).on("focusout", ".JISVOI_Qty, .JISVOI_UnitPrice, .JISVOI_Amount", function () {
        let type = $(this).hasClass("JISVOI_Qty") ? "q" : "c";
        $(this).val(addComma($(this).val(), type));
    });
    //#endregion
    $(document).on("keyup change", ".JISVOI_Qty, .JISVOI_UnitPrice", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat(removeComma(row.find(".JISVOI_Qty").val())) || 0;
        let price = parseFloat(removeComma(row.find(".JISVOI_UnitPrice").val())) || 0;

        let amount = qty * price;

        // Only set row amount (read-only field)
        row.find(".JISVOI_Amount").val(formatIndianCurrency(amount));

        // Update footer totals separately
        calculateTotal();

        // Auto add row
        autoAddRow(row);

    });
    //#endregion
    //#region add row item grid
    let rowIndex = 1; // start from 1 because 0 already exists

    $("#AddRowButton").on("click", function () {

        let isValid = true;

        $("#ItemTable tbody tr.NewRow:last").find("input, select").each(function () {

            let el = $(this);

            // skip hidden delete flag
            if (el.hasClass("JISVOI_IsDeleted")) return;

            if (el.hasClass("JISVOI_Item_Code")) {
                if (!el.val()) {
                    isValid = false;
                    el.focus();
                    return false;
                }
            }

            if (el.hasClass("JISVOI_Qty")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) {
                    isValid = false;
                    el.focus();
                    return false;
                }
            }

            if (el.hasClass("JISVOI_UnitPrice")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) {
                    isValid = false;
                    el.focus();
                    return false;
                }
            }
            if (el.hasClass("JISVOI_PRS_Number")) {
                if (!el.val() || el.val() === "0") {
                    isValid = false;
                    el.focus();
                    return false;
                }
            }

        });

        if (!isValid) {
            alert("Please fill required fields before adding new row.");
            return;
        }

        let $newRow = $("#TempRow").clone();

        $newRow.removeAttr("id");
        $newRow.removeAttr("style");
        $newRow.addClass("NewRow");

        $newRow.find("input, select").each(function () {

            let el = $(this);

            if (el.attr("type") === "checkbox") {
                el.prop("checked", false);
            }

            if (!el.hasClass("JISVOI_IsDeleted")) {
                el.val("");
            }

            let name = el.attr("name");
            if (name) {
                let updatedName = name.replace(/\[\d+\]/, `[${rowIndex}]`);
                el.attr("name", updatedName);
            }
        });

        let rowID = new Date().getTime();

        $newRow.attr("data-rowid", rowID);

        $("#TableBody").append($newRow);

        $newRow.find(".datepicker").flatpickr({
            dateFormat: "d-M-Y",
            altInput: true,
            altFormat: "d-M-Y",
            allowInput: true
        });

        rowIndex++;

        calculateTotal();
        //#region item grid alignment
        ApplyFieldWidths({
            fields: ItemTableFields,
            container: "#ItemTable",
            tempRow: "#TempRow",
            tableBody: "#TableBody",
            searchTable: "#tblsearch"
        });
        //#endregion
    });
    //#endregion add row item grid

    $(document).on("click", ".RowRemove", function () {

        let row = $(this).closest("tr");

        row.find(".JISVOI_IsDeleted").val("1");
        row.hide();

        calculateTotal();
    });

    //#region Save Function
    //#region Update Function
    $("#btnUpdate, #btnUpdateFreight").on("click", function (e) {

        let serviceType = $('input[name="ServiceType"]:checked').val();

        if (serviceType === "FREIGHT") {
            if (!validateFreightHeaderById()) {
                e.preventDefault();
                return false;
            }
        } else {
            if (!validateHeaderById()) {
                e.preventDefault();
                return false;
            }
        }

        let model = CreateServiceOrderModel();

        console.log(JSON.stringify(model));

        $.ajax({
            url: '/ServiceOrder/UpdateServiceOrder',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(model),

            success: function (response) {

                if (response.success) {
                    showAlert('Record Updated');
                    console.log(model);
                }
            },

            error: function (xhr) {
                console.log(xhr.responseText);
            }
        });

    });
    //#endregion
    //#endregion

    //#region freight header validation (basic stub - mirrors validateHeaderById)
    function validateFreightHeaderById() {
        var isValid = true;

        $("#FreightHeaderPanel [required], #FreightHeaderPanel .Key").each(function () {
            if (!$(this).val()) {
                isValid = false;
                $(this).focus();
                return false;
            }
        });

        if (!isValid) {
            showAlert("Please fill required Freight header fields.");
        }

        return isValid;
    }
    //#endregion

    //#region remove checked rows
    $("#RemoveItemRowButton").on("click", function () {

        let checkedRows =
            $("#ItemTable tbody tr.NewRow:visible")
                .has(".CheckItem:checked");

        let totalVisibleRows =
            $("#ItemTable tbody tr.NewRow:visible").length;

        if (checkedRows.length === 0) {
            alert("Please select row.");
            return;
        }

        if ((totalVisibleRows - checkedRows.length) <= 0) {
            alert("At least one row required.");
            return;
        }

        if (checkedRows.length > 1) {
            alert("Please select only one row");
            return;
        }

        checkedRows.each(function () {

            let currentRow = $(this);

            let itemNumber =
                currentRow.find(".JISVOI_Number").val();

            // already saved row → soft delete
            if (itemNumber && itemNumber !== "0") {

                currentRow
                    .find(".JISVOI_IsDeleted")
                    .val("1");

                currentRow.hide();
            }
            else {
                // new unsaved row → hard delete
                currentRow.remove();
            }

        });

        calculateTotal();
    });
    //#endregion

    const params =
        new URLSearchParams(
            window.location.search);

    const siNo =
        params.get(
            "SI_No");

    const orderType =
        params.get(
            "OrderType") || "JWI";

    if (siNo) {

        if (orderType === "FREIGHT") {
            $("#ServiceType_Freight").prop("checked", true);
            $("#FreightHeader_JIFRT_SVOH_Number").val(siNo);
        } else {
            $("#ServiceType_JWI").prop("checked", true);
            $("#Header_JIJWI_SVOH_Number").val(siNo);
        }

        toggleServiceTypePanels();

        console.log(siNo, orderType);

        GetServiceOrder(siNo, orderType);
    }

    $('input[name="ServiceType"]').on('change', toggleServiceTypePanels);
});

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
//#region auto add row function
function autoAddRow(currentRow) {
    if (isBindingItems) return;
    let qty = parseFloat(removeComma(currentRow.find(".JISVOI_Qty").val())) || 0;
    let price = parseFloat(removeComma(currentRow.find(".JISVOI_UnitPrice").val())) || 0;

    let itemCode = currentRow.find(".JISVOI_Item_Code").val();
    let prsNo = currentRow.find(".JISVOI_PRS_Number").val();

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

            $("#AddRowButton").trigger("click");
        }
    }
}
//#endregion auto add row function

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
function DateBind() {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');

    var months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    var formattedDate =
        day + "-" + months[today.getMonth()] + "-" + today.getFullYear();

    var regDate = document.getElementById("Header_JIJWI_SVOH_RegDate")?._flatpickr;
    if (regDate)
        regDate.setDate(formattedDate, true, "d-M-Y");

    var serviceOrderDate = document.getElementById("Header_JIJWI_SVOH_ServiceOrderDate")?._flatpickr;
    if (serviceOrderDate)
        serviceOrderDate.setDate(formattedDate, true, "d-M-Y");
    console.log(formattedDate +'--formattedDate')
}

function CreateJWIHeaderModel() {
    return {
        JIJWI_SVOH_Number:
            parseInt($("#Header_JIJWI_SVOH_Number").val()) || 0,

        JIJWI_SVOH_RegNo:
            $("#Header_JIJWI_SVOH_RegNo").val(),

        JIJWI_SVOH_RegDate:
            $("#Header_JIJWI_SVOH_RegDate").val()
                ? new Date($("#Header_JIJWI_SVOH_RegDate").val()).toISOString()
                : null,

        JIJWI_SVOH_ServiceOrderNo:
            $("#Header_JIJWI_SVOH_ServiceOrderNo").val(),

        JIJWI_SVOH_ServiceOrderDate:
            $("#Header_JIJWI_SVOH_ServiceOrderDate").val()
                ? new Date($("#Header_JIJWI_SVOH_ServiceOrderDate").val()).toISOString()
                : null,

        JIJWI_SVOH_JW_Customer_Number:
            parseInt($("#Header_JIJWI_SVOH_JW_Customer_Number").val()) || 0,

        JW_Customer_Name:
            $("#Header_JIJWI_SVOH_JW_Customer_Name").val(),

        JIJWI_SVOH_Currency_Number:
            parseInt($("#Header_JIJWI_SVOH_Currency_Number").val()) || 0,

        JIJWI_SVOH_PaymentTerms:
            $("#Header_JIJWI_SVOH_PaymentTerms").val(),

        JIJWI_SVOH_DeliveryTerms:
            $("#Header_JIJWI_SVOH_DeliveryTerms").val(),

        JIJWI_SVOH_DeliveryMode:
            $("#Header_JIJWI_SVOH_DeliveryMode").val(),

        JIJWI_SVOH_Tax:
            $("#Header_JIJWI_SVOH_Tax").val(),

        JIJWI_SVOH_TDC:
            $("#Header_JIJWI_SVOH_TDC").val(),

        JIJWI_SVOH_Remarks:
            $("#Header_JIJWI_SVOH_Remarks").val(),

        JIJWI_SVOH_MS_Number:
            parseInt($("#Header_JIJWI_SVOH_MS_Number").val()) || null
    };
}

function CreateJWIItemsModel() {
    let items = [];

    $("#ItemTable tbody tr.NewRow").each(function () {

        let row = $(this);

        if (row.find(".JISVOI_IsDeleted").val() == "1") {
            return;
        }

        if (!row.find(".JISVOI_Item_Number").val()) {
            return;
        }

        items.push({
            JIJWI_SVOI_Number:
                parseInt(row.find(".JISVOI_Number").val()) || 0,

            JIJWI_SVOI_PRS_Number:
                parseInt(row.find(".JISVOI_PRS_Number").val()) || 0,

            JIJWI_SVOI_Item_Number:
                parseInt(row.find(".JISVOI_Item_Number").val()) || 0,

            JIJWI_SVOI_WH_Number:
                parseInt(row.find(".JISVOI_WH_Number").val()) || null,

            JIJWI_SVOI_UoM_Number:
                parseInt(row.find(".JISVOI_UoM_Number").val()) || 0,

            JIJWI_SVOI_Qty:
                parseFloat(removeComma(row.find(".JISVOI_Qty").val())) || 0,

            JIJWI_SVOI_UnitPrice:
                parseFloat(removeComma(row.find(".JISVOI_UnitPrice").val())) || 0,

            JIJWI_SVOI_Amount:
                parseFloat(removeComma(row.find(".JISVOI_Amount").val())) || 0,

            JIJWI_SVOI_DeliveryDate:
                row.find(".JISVOI_DeliveryDate").val()
                    ? new Date(row.find(".JISVOI_DeliveryDate").val()).toISOString()
                    : null,

            JIJWI_SVOI_IsDeleted:
                row.find(".JISVOI_IsDeleted").val() == "1"
        });
    });

    return items;
}

function CreateFreightHeaderModel() {
    return {
        JIFRT_SVOH_Number:
            parseInt($("#FreightHeader_JIFRT_SVOH_Number").val()) || 0,

        JIFRT_SVOH_RegNo:
            $("#FreightHeader_JIFRT_SVOH_RegNo").val(),

        JIFRT_SVOH_RegDate:
            $("#FreightHeader_JIFRT_SVOH_RegDate").val()
                ? new Date($("#FreightHeader_JIFRT_SVOH_RegDate").val()).toISOString()
                : null,

        JIFRT_SVOH_ServiceOrderNo:
            $("#FreightHeader_JIFRT_SVOH_ServiceOrderNo").val(),

        JIFRT_SVOH_ServiceOrderDate:
            $("#FreightHeader_JIFRT_SVOH_ServiceOrderDate").val()
                ? new Date($("#FreightHeader_JIFRT_SVOH_ServiceOrderDate").val()).toISOString()
                : null,

        JIFRT_SVOH_Category:
            $("#FreightHeader_JIFRT_SVOH_Category").val() === "RN" ? "RECEIPT NOTE" : "DELIVERY NOTE",

        JIFRT_SVOH_JW_Customer_Number:
            parseInt($("#FreightHeader_JIFRT_SVOH_JW_Customer_Number").val()) || 0,

        JW_Customer_Name:
            $("#FreightHeader_JIFRT_SVOH_JW_Customer_Name").val(),

        JIFRT_SVOH_Currency_Number:
            parseInt($("#FreightHeader_JIFRT_SVOH_Currency_Number").val()) || 0,

        JIFRT_SVOH_PaymentTerms:
            $("#FreightHeader_JIFRT_SVOH_PaymentTerms").val(),

        JIFRT_SVOH_DeliveryTerms:
            $("#FreightHeader_JIFRT_SVOH_DeliveryTerms").val(),

        JIFRT_SVOH_DeliveryMode:
            $("#FreightHeader_JIFRT_SVOH_DeliveryMode").val(),

        JIFRT_SVOH_Tax:
            $("#FreightHeader_JIFRT_SVOH_Tax").val(),

        JIFRT_SVOH_TDC:
            $("#FreightHeader_JIFRT_SVOH_TDC").val(),

        JIFRT_SVOH_Remarks:
            $("#FreightHeader_JIFRT_SVOH_Remarks").val()
    };
}

function CreateFreightItemsModel() {
    let items = [];

    $("#FreightItemTable tbody tr.FreightNewRow").each(function () {

        let row = $(this);

        if (row.find(".JIFRT_SVOI_IsDeleted").val() == "1") {
            return;
        }

        items.push({
            JIFRT_SVOI_Number:
                parseInt(row.find(".JIFRT_SVOI_Number").val()) || 0,

            JIFRT_SVOI_PRS_Number:
                parseInt(row.find(".JIFRT_SVOI_PRS_Number").val()) || 0,

            JIFRT_SVOI_FromWH_Number:
                parseInt(row.find(".JIFRT_SVOI_FromWH_Number").val()) || null,

            JIFRT_SVOI_ToWH_Number:
                parseInt(row.find(".JIFRT_SVOI_ToWH_Number").val()) || null,

            JIFRT_SVOI_UoM_Number:
                parseInt(row.find(".JIFRT_SVOI_UoM_Number").val()) || 0,

            JIFRT_SVOI_Qty:
                parseFloat(removeComma(row.find(".JIFRT_SVOI_Qty").val())) || 0,

            JIFRT_SVOI_Rate:
                parseFloat(removeComma(row.find(".JIFRT_SVOI_Rate").val())) || 0,

            JIFRT_SVOI_Amount:
                parseFloat(removeComma(row.find(".JIFRT_SVOI_Amount").val())) || 0,

            JIFRT_SVOI_IsDeleted:
                row.find(".JIFRT_SVOI_IsDeleted").val() == "1"
        });
    });

    return items;
}

function CreateServiceOrderModel() {

    let serviceType = $('input[name="ServiceType"]:checked').val();

    let serviceOrderModel;

    if (serviceType === "FREIGHT") {
        serviceOrderModel = {
            ServiceType: "FREIGHT",
            JWIHeader: null,
            JWIItems: [],
            FreightHeader: CreateFreightHeaderModel(),
            FreightItems: CreateFreightItemsModel()
        };
    } else {
        serviceOrderModel = {
            ServiceType: "JWI",
            JWIHeader: CreateJWIHeaderModel(),
            JWIItems: CreateJWIItemsModel(),
            FreightHeader: null,
            FreightItems: []
        };
    }

    console.log(serviceOrderModel);

    return serviceOrderModel;
}

//#region SUBMIT VALIDATION
function validateHeaderById() {

    // 1. Register No
    if ($("#Header_JIJWI_SVOH_RegNo").val().trim() === "") {
        showAlert('Register No. is required', '#Header_JIJWI_SVOH_RegNo');
        return false;
    }

    // 2. Register Date
    if ($("#Header_JIJWI_SVOH_RegDate").val().trim() === "") {
        showAlert('Register Date is required', '#Header_JIJWI_SVOH_RegDate');
        return false;
    }

    // 3. Service Order No
    if ($("#Header_JIJWI_SVOH_ServiceOrderNo").val().trim() === "") {
        showAlert('Service Order No. is required', '#Header_JIJWI_SVOH_ServiceOrderNo');
        return false;
    }

    // 4. Service Order Date
    if ($("#Header_JIJWI_SVOH_ServiceOrderDate").val().trim() === "") {
        showAlert('Service Order Date is required', '#Header_JIJWI_SVOH_ServiceOrderDate');
        return false;
    }

    // 5. JW Customer
    if (
        $("#Header_JIJWI_SVOH_JW_Customer_Number").val().trim() === "" ||
        $("#Header_JIJWI_SVOH_JW_Customer_Name").val().trim() === ""
    ) {
        showAlert(
            'JW Customer is required',
            '#Header_JIJWI_SVOH_JW_Customer_Name'
        );
        return false;
    }

    // 6. Currency
    if (
        $("#Header_JIJWI_SVOH_Currency_Number").val() === "" ||
        $("#Header_JIJWI_SVOH_Currency_Number").val() === "0"
    ) {
        showAlert(
            'Currency is required',
            '#Header_JIJWI_SVOH_Currency_Number'
        );
        return false;
    }

    //// 7. Payment Terms
    //if ($("#Header_JISVOH_PaymentTerms").val().trim() === "") {
    //    showAlert('Payment Terms is required', '#Header_JISVOH_PaymentTerms');
    //    return false;
    //}

    //// 8. Delivery Terms
    //if ($("#Header_JISVOH_DeliveryTerms").val().trim() === "") {
    //    showAlert('Delivery Terms is required', '#Header_JISVOH_DeliveryTerms');
    //    return false;
    //}

    //// 9. Delivery Mode
    //if ($("#Header_JISVOH_DeliveryMode").val().trim() === "") {
    //    showAlert('Delivery Mode is required', '#Header_JISVOH_DeliveryMode');
    //    return false;
    //}

    //// 10. Tax
    //if ($("#Header_JISVOH_Tax").val().trim() === "") {
    //    showAlert('Tax is required', '#Header_JISVOH_Tax');
    //    return false;
    //}

    //// 11. TDC
    //if ($("#Header_JISVOH_TDC").val().trim() === "") {
    //    showAlert('TDC is required', '#Header_JISVOH_TDC');
    //    return false;
    //}

    //// 12. Remarks
    //if ($("#Header_JISVOH_Remarks").val().trim() === "") {
    //    showAlert('Remarks is required', '#Header_JISVOH_Remarks');
    //    return false;
    //}

    // Grid Validation
    if (!validateItemGrid()) {
        return false;
    }

    return true;
}
//#endregion 

//#region customer Search Functions
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
    var $panel = $(inputElement).closest(".card");
    var RegDate = $panel.find(".RegDate").val();
    var resultsDiv = $("#RightPane").find(".buyer-search-results");

    if (buyerSearchXHR) {
        buyerSearchXHR.abort();
    }

    buyerSearchXHR = $.ajax({
        url: '/jobinward/transactions/delivery-note/cutomer',
        type: 'GET',
        data: {
            Buyer: JWCustomer,
            SIHDate: RegDate
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
                    // with the "mousedown" handler below; also used
                    // SelectBuyer id args without "#" prefixes, so
                    // SelectBuyer's own $(id) lookups silently
                    // matched nothing — its manual $(...).val() lines
                    // below were the only thing actually working).
                });

                table.find("tbody").on("mousedown", "tr", function (e) {

                    e.preventDefault();

                    const clickedCust = $(this).data("customer");
                    isMouseSelectingBuyer = true;

                    $("#BuyerMessage").hide().text("");

                    $(inputElement).val(clickedCust.cuS_Name);

                    $panel.find(".JW_Customer_Number")
                        .val(clickedCust.cuS_Number);

                    let $currency = $panel.find(".Currency_Number");
                    $currency
                        .val(clickedCust.cuS_CUR_Number)
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
        error: function () {
            resultsDiv.text("Error loading data.").show();
        }
    });
}


//#endregion customer Search Functions

function OnInputItem(inputElement) {
    SearchServiceOrderItem(inputElement);
}

function OnFocusItem(inputElement) {

    if (isSelectingItem) {
        return;
    }

    let resultsDiv0 = $("#RightPane_Item").find(".search-results");
    let messageVisible = $("#ItemMessage").is(":visible") ||
        $("#ItemEmptyView").is(":visible");
    let alreadyOpen = $("#RightPane_Item").hasClass("show") &&
        (resultsDiv0.find("tbody tr").length > 0 || messageVisible);

    if (alreadyOpen) {
        return;
    }

    SearchServiceOrderItem(inputElement);
}
function SearchServiceOrderItem(inputElement) {

    let itemCode = inputElement.value;
    let row = $(inputElement).closest("tr");
    let resultsDiv = $("#RightPane_Item").find(".search-results");
    let material = $("#Header_JIJWI_SVOH_MS_Number").val();

    if (!material) return;

    if (itemSearchXHR) {
        itemSearchXHR.abort();
    }

    itemSearchXHR = $.ajax({
        url: '/jobinward/transactions/service-order/item',
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

                    tr.on("mousedown", function (e) {

                        e.preventDefault();

                        isSelectingItem = true;

                        $("#ItemMessage").hide().text("");

                        row.find(".JISVOI_Item_Code").val(item.itemCode);
                        row.find(".JISVOI_Item_Number").val(item.itemNumber);
                        row.find(".JISVOI_Number").val(item.itemNumber);

                        row.find(".Description").val(item.itemDescription);
                        row.find(".OuterDia").val(item.outerDia);
                        row.find(".Thickness").val(item.thickness);
                        row.find(".Length").val(item.length);
                        row.find(".Width").val(item.width);
                        row.find(".MaterialGrade").val(item.materialGrade);
                        row.find(".ItemGroup").val(item.itemGroup);

                        row.find(".JISVOI_UoM_Number").val(item.uoM);

                        row.find(".JISVOI_Qty").focus();

                        setTimeout(function () {
                            isSelectingItem = false;
                        }, 100);

                        resultsDiv.hide();
                        $("#RightPane_Item").removeClass("show");
                    });

                    table.find("tbody").append(tr);
                });

                // Message Div
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

                // ************ IMPORTANT CHANGE ************
                // Append table BEFORE applying highlight
                resultsDiv.append(table);

                // Keyboard Navigation Highlight
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

            }
            else {

                resultsDiv.append(GetItemEmptyView());

                $("#RightPane_Item").addClass("show");
                $("#RightPane_Item .search-results").show();
            }
        },
        error: function () {

            resultsDiv.text("Error loading data.");
            resultsDiv.show();
        }
    });
}
//#region Calculate Total
function calculateTotal() {

    let totalQty = 0;
    let totalAmount = 0;

    // Loop through each row (only active rows)
    $("#ItemTable tbody tr.NewRow").each(function () {

        let row = $(this);

        // Skip deleted rows
        if (row.find(".JISVOI_IsDeleted").val() === "1" ||
            row.find(".JISVOI_IsDeleted").val() === "true") {
            return;
        }

        // Get Qty
        let qty = parseFloat(removeComma(row.find(".JISVOI_Qty").val())) || 0;

        // Get Unit Price
        let unitPrice = parseFloat(removeComma(row.find(".JISVOI_UnitPrice").val())) || 0;

        // Row Amount = Qty × Unit Price
        let amount = qty * unitPrice;

        // Set row amount field
        row.find(".JISVOI_Amount").val(addComma(amount, "c"));

        // Add to totals
        totalQty += qty;
        totalAmount += amount;
    });

    // Footer totals
    // Footer totals
    $("#TotalQty").val(addComma(totalQty, "q"));
    $("#TotalAmount").val(addComma(totalAmount, "c"));
}
//#endregion Calculate Total

//#region FREIGHT ITEM GRID
function FreightCalculateTotal() {

    let totalQty = 0;
    let totalAmount = 0;

    $("#FreightItemTable tbody tr.FreightNewRow").each(function () {

        let row = $(this);

        if (row.find(".JIFRT_SVOI_IsDeleted").val() === "1" ||
            row.find(".JIFRT_SVOI_IsDeleted").val() === "true") {
            return;
        }

        let qty = parseFloat(removeComma(row.find(".JIFRT_SVOI_Qty").val())) || 0;
        let rate = parseFloat(removeComma(row.find(".JIFRT_SVOI_Rate").val())) || 0;
        let amount = qty * rate;

        row.find(".JIFRT_SVOI_Amount").val(addComma(amount, "c"));

        totalQty += qty;
        totalAmount += amount;
    });

    $("#FreightTotalQty").val(addComma(totalQty, "q"));
    $("#FreightTotalAmount").val(addComma(totalAmount, "c"));
}

$(document).on("input change blur", "#FreightItemTable input, #FreightItemTable select", function () {
    FreightCalculateTotal();
});

$("#AddRowButtonFreight").on("click", function () {

    let isValid = true;

    $("#FreightItemTable tbody tr.FreightNewRow:last").find("input, select").each(function () {

        let el = $(this);

        if (el.hasClass("JIFRT_SVOI_IsDeleted")) return;

        if (el.hasClass("JIFRT_SVOI_FromWH_Number")) {
            if (!el.val() || el.val() === "0") { isValid = false; el.focus(); return false; }
        }
        if (el.hasClass("JIFRT_SVOI_ToWH_Number")) {
            if (!el.val() || el.val() === "0") { isValid = false; el.focus(); return false; }
        }
        if (el.hasClass("JIFRT_SVOI_Qty")) {
            if (!el.val() || parseFloat(removeComma(el.val())) <= 0) { isValid = false; el.focus(); return false; }
        }
        if (el.hasClass("JIFRT_SVOI_Rate")) {
            if (!el.val() || parseFloat(removeComma(el.val())) <= 0) { isValid = false; el.focus(); return false; }
        }
        if (el.hasClass("JIFRT_SVOI_PRS_Number")) {
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

        if (!el.hasClass("JIFRT_SVOI_IsDeleted")) el.val("");

        let name = el.attr("name");
        if (name) {
            el.attr("name", name.replace(/\[\d+\]/, `[${freightRowIndex}]`));
        }
    });

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

$("#RemoveItemRowButtonFreight").on("click", function () {

    let checkedRows =
        $("#FreightItemTable tbody tr.FreightNewRow:visible")
            .has(".CheckItem:checked");

    let totalVisibleRows =
        $("#FreightItemTable tbody tr.FreightNewRow:visible").length;

    if (checkedRows.length === 0) {
        alert("Please select row.");
        return;
    }

    if ((totalVisibleRows - checkedRows.length) <= 0) {
        alert("At least one row required.");
        return;
    }

    if (checkedRows.length > 1) {
        alert("Please select only one row");
        return;
    }

    checkedRows.each(function () {

        let currentRow = $(this);

        let itemNumber =
            currentRow.find(".JIFRT_SVOI_Number").val();

        if (itemNumber && itemNumber !== "0") {

            currentRow
                .find(".JIFRT_SVOI_IsDeleted")
                .val("1");

            currentRow.hide();
        }
        else {
            currentRow.remove();
        }

    });

    FreightCalculateTotal();
});
//#endregion FREIGHT ITEM GRID

//#region VALIDATE ITEM GRID

function validateItemGrid() {

    let hasValidRow = false;
    let isValid = true;

    $("#ItemTable tbody tr").each(function () {

        let row = $(this);

        // skip template row
        if (row.hasClass("TempRow")) return;

        // skip deleted row
        if (row.find(".JISVOI_IsDeleted").val() === "1") return;

        let process = row.find(".JISVOI_PRS_Number").val();
        let itemCode = row.find(".JISVOI_Item_Code").val();
        let qty = row.find(".JISVOI_Qty").val();
        let unitPrice = row.find(".JISVOI_UnitPrice").val();

        // check if row has any data
        let isRowStarted =
            (process && process.trim() !== "") ||
            (itemCode && itemCode.trim() !== "") ||
            (qty && qty.trim() !== "") ||
            (unitPrice && unitPrice.trim() !== "");

        // empty row → skip
        if (!isRowStarted) return;

        hasValidRow = true;

        // Process
        if (!process || process.trim() === "" || process === "0") {
            showAlert(
                'Process is required',
                row.find(".JISVOI_PRS_Number")
            );
            isValid = false;
            return false;
        }

        // Item Code
        if (!itemCode || itemCode.trim() === "") {
            showAlert(
                'Item Code is required',
                row.find(".JISVOI_Item_Code")
            );
            isValid = false;
            return false;
        }

        // Qty
        if (!qty || qty.trim() === "" || qty.trim() === "0") {
            showAlert(
                'Qty is required',
                row.find(".JISVOI_Qty")
            );
            isValid = false;
            return false;
        }

        // Unit Price
        if (
            !unitPrice ||
            unitPrice.trim() === "" ||
            unitPrice.trim() === "0"
        ) {
            showAlert(
                'Unit Price is required',
                row.find(".JISVOI_UnitPrice")
            );
            isValid = false;
            return false;
        }

    });

    // no rows
    if (!hasValidRow) {
        showAlert(
            'Please add at least one item in grid',
            "#ItemTable tbody tr:first .JISVOI_PRS_Number"
        );
        return false;
    }

    return isValid;
}

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

//#region GET SERVICE ORDER

function GetServiceOrder(serviceOrderNumber, orderType) {

    $.ajax({
        url: '/ServiceOrder/GetServiceOrder',
        type: 'GET',
        data: { Number: serviceOrderNumber, OrderType: orderType },

        success: function (data) {
            console.log(data)

            if (orderType === "FREIGHT") {
                BindFreightHeader(data.Header[0]);
                BindFreightItems(data.Items);
            } else {
                BindHeader(data.Header[0]);
                BindItems(data.Items);
            }
        },

        error: function (xhr) {
            console.log("Error:", xhr);
        }
    });
}

//#endregion

//#region BIND HEADER EDIT

function BindHeader(header) {

    if (!header) return;

    $("#Header_JIJWI_SVOH_Number")
        .val(header.jijwi_SVOH_Number ?? header.JIJWI_SVOH_Number);

    $("#Header_JIJWI_SVOH_RegNo")
        .val(header.jijwi_SVOH_RegNo ?? header.JIJWI_SVOH_RegNo);

    $("#Header_JIJWI_SVOH_RegDate")
        .val(header.jijwi_SVOH_RegDate ?? header.JIJWI_SVOH_RegDate);

    $("#Header_JIJWI_SVOH_ServiceOrderNo")
        .val(header.jijwi_SVOH_ServiceOrderNo ?? header.JIJWI_SVOH_ServiceOrderNo);

    $("#Header_JIJWI_SVOH_ServiceOrderDate")
        .val(header.jijwi_SVOH_ServiceOrderDate ?? header.JIJWI_SVOH_ServiceOrderDate);

    $("#Header_JIJWI_SVOH_JW_Customer_Number")
        .val(header.jijwi_SVOH_JW_Customer_Number ?? header.JIJWI_SVOH_JW_Customer_Number).trigger("change");
    $("#Header_JIJWI_SVOH_JW_Customer_Name")
        .val(header.JW_Customer_Name);

    $("#Header_JIJWI_SVOH_Currency_Number")
        .val(header.jijwi_SVOH_Currency_Number ?? header.JIJWI_SVOH_Currency_Number);

    $("#Header_JIJWI_SVOH_MS_Number")
        .val(header.jijwi_SVOH_MS_Number ?? header.JIJWI_SVOH_MS_Number).trigger("change");

    $("#Header_JIJWI_SVOH_PaymentTerms")
        .val(header.jijwi_SVOH_PaymentTerms ?? header.JIJWI_SVOH_PaymentTerms);

    $("#Header_JIJWI_SVOH_DeliveryTerms")
        .val(header.jijwi_SVOH_DeliveryTerms ?? header.JIJWI_SVOH_DeliveryTerms);

    $("#Header_JIJWI_SVOH_DeliveryMode")
        .val(header.jijwi_SVOH_DeliveryMode ?? header.JIJWI_SVOH_DeliveryMode);

    $("#Header_JIJWI_SVOH_Tax")
        .val(header.jijwi_SVOH_Tax ?? header.JIJWI_SVOH_Tax);

    $("#Header_JIJWI_SVOH_TDC")
        .val(header.jijwi_SVOH_TDC ?? header.JIJWI_SVOH_TDC);

    $("#Header_JIJWI_SVOH_Remarks")
        .val(header.jijwi_SVOH_Remarks ?? header.JIJWI_SVOH_Remarks);
}

function BindFreightHeader(header) {

    if (!header) return;

    $("#FreightHeader_JIFRT_SVOH_Number")
        .val(header.jifrt_SVOH_Number ?? header.JIFRT_SVOH_Number);

    $("#FreightHeader_JIFRT_SVOH_RegNo")
        .val(header.jifrt_SVOH_RegNo ?? header.JIFRT_SVOH_RegNo);

    $("#FreightHeader_JIFRT_SVOH_RegDate")
        .val(header.jifrt_SVOH_RegDate ?? header.JIFRT_SVOH_RegDate);

    $("#FreightHeader_JIFRT_SVOH_ServiceOrderNo")
        .val(header.jifrt_SVOH_ServiceOrderNo ?? header.JIFRT_SVOH_ServiceOrderNo);

    $("#FreightHeader_JIFRT_SVOH_ServiceOrderDate")
        .val(header.jifrt_SVOH_ServiceOrderDate ?? header.JIFRT_SVOH_ServiceOrderDate);

    var loadedCategory = header.jifrt_SVOH_Category ?? header.JIFRT_SVOH_Category ?? "DELIVERY NOTE";
    $("#FreightHeader_JIFRT_SVOH_Category")
        .val(loadedCategory === "RECEIPT NOTE" ? "RN" : "DN");

    $("#FreightHeader_JIFRT_SVOH_JW_Customer_Number")
        .val(header.jifrt_SVOH_JW_Customer_Number ?? header.JIFRT_SVOH_JW_Customer_Number).trigger("change");
    $("#FreightHeader_JIFRT_SVOH_JW_Customer_Name")
        .val(header.JW_Customer_Name);

    $("#FreightHeader_JIFRT_SVOH_Currency_Number")
        .val(header.jifrt_SVOH_Currency_Number ?? header.JIFRT_SVOH_Currency_Number);

    $("#FreightHeader_JIFRT_SVOH_PaymentTerms")
        .val(header.jifrt_SVOH_PaymentTerms ?? header.JIFRT_SVOH_PaymentTerms);

    $("#FreightHeader_JIFRT_SVOH_DeliveryTerms")
        .val(header.jifrt_SVOH_DeliveryTerms ?? header.JIFRT_SVOH_DeliveryTerms);

    $("#FreightHeader_JIFRT_SVOH_DeliveryMode")
        .val(header.jifrt_SVOH_DeliveryMode ?? header.JIFRT_SVOH_DeliveryMode);

    $("#FreightHeader_JIFRT_SVOH_Tax")
        .val(header.jifrt_SVOH_Tax ?? header.JIFRT_SVOH_Tax);

    $("#FreightHeader_JIFRT_SVOH_TDC")
        .val(header.jifrt_SVOH_TDC ?? header.JIFRT_SVOH_TDC);

    $("#FreightHeader_JIFRT_SVOH_Remarks")
        .val(header.jifrt_SVOH_Remarks ?? header.JIFRT_SVOH_Remarks);
}
function BindItems(items) {

    console.log('------------------------binditems-------------------');
    console.log(JSON.stringify(items));

    $("#TableBody tr.NewRow").remove();

    if (!items || items.length === 0)
        return;
    isBindingItems = true;
    $.each(items, function (index, item) {

        var row = `
<tr class="NewRow" data-rowid="${index + 1}">

    <td class="p-2 del">
        <input type="checkbox" class="CheckItem form-check-input">
    </td>

    <td>
        <select name="Items[${index}].JIJWI_SVOI_PRS_Number"
                class="form-select JISVOI_PRS_Number">
            ${$("#TempRow .JISVOI_PRS_Number").html()}
        </select>
    </td>

    <td>
        <input name="Items[${index}].JIJWI_SVOI_Number"
               value="${item.JIJWI_SVOI_Number ?? 0}"
               type="hidden"
               class="JISVOI_Number" />

        <input name="Items[${index}].JIJWI_SVOI_IsDeleted"
               value="false"
               type="hidden"
               class="JISVOI_IsDeleted" />

        <input name="Items[${index}].JIJWI_SVOI_Item_Number"
               value="${item.JIJWI_SVOI_Item_Number ?? 0}"
               type="hidden"
               class="JISVOI_Item_Number" />

        <input name="Items[${index}].JIJWI_SVOI_Item_Code"
               value="${item.JIJWI_SVOI_Item_Code ?? ''}"
               autocomplete="off"
               class="form-control JISVOI_Item_Code"
               oninput="OnInputItem(this)"
               onfocus="OnFocusItem(this)" />

        <div class="search-results card" style="display:none; min-height:100px; max-height:600px; overflow-y:auto;"></div>
    </td>

    <td>
        <input name="Items[${index}].Description"
               value="${item.Description ?? ''}"
               class="form-control Description"
               readonly />
    </td>

    <td>
        <input name="Items[${index}].OuterDia"
               value="${item.OuterDia ?? ''}"
               class="form-control OuterDia text-center"
               readonly />
    </td>

    <td>
        <input name="Items[${index}].Thickness"
               value="${item.Thickness ?? ''}"
               class="form-control Thickness text-center"
               readonly />
    </td>

    <td>
        <input name="Items[${index}].Length"
               value="${item.Length ?? ''}"
               class="form-control Length text-center"
               readonly />
    </td>

    <td>
        <input name="Items[${index}].Width"
               value="${item.Width ?? ''}"
               class="form-control Width text-center"
               readonly />
    </td>

    <td>
        <input name="Items[${index}].MaterialGrade"
               value="${item.MaterialGrade ?? ''}"
               class="form-control MaterialGrade"
               readonly />
    </td>

    <td>
        <input name="Items[${index}].ItemGroup"
               value="${item.ItemGroup ?? ''}"
               class="form-control ItemGroup"
               readonly />
    </td>

    <td>
        <select name="Items[${index}].JIJWI_SVOI_WH_Number"
                class="form-select JISVOI_WH_Number text-center">
            ${$("#TempRow .JISVOI_WH_Number").html()}
        </select>
    </td>

    <td>
        <select name="Items[${index}].JIJWI_SVOI_UoM_Number"
                class="form-select JISVOI_UoM_Number text-center">
            ${$("#TempRow .JISVOI_UoM_Number").html()}
        </select>
    </td>

    <td>
        <input name="Items[${index}].SVO_Qty"
               value="${item.JIJWI_SVOI_Qty ?? 0}"
               class="form-control SVO_Qty text-center"
               readonly />
    </td>

    <td>
        <input name="Items[${index}].InvoicedQty"
               value="${item.InvoicedQty ?? 0}"
               class="form-control InvoicedQty text-center"
               readonly />
    </td>
    <td>
    <input name="Items[${index}].InvoiceToBeRaised"
           value="${item.InvoiceToBeRaised ?? 0}"
           class="form-control InvoiceToBeRaised text-center"
           readonly />
</td>

   <td>
        <input name="Items[${index}].JIJWI_SVOI_Qty"
             value="${addComma(item.JIJWI_SVOI_Qty ?? 0, 'q')}"
               class="form-control JISVOI_Qty text-center" />
    </td>

    <td>
        <input name="Items[${index}].JIJWI_SVOI_UnitPrice"
              value="${addComma(item.JIJWI_SVOI_UnitPrice ?? 0, 'c')}"
               class="form-control JISVOI_UnitPrice text-end" />
    </td>

    <td>
        <input name="Items[${index}].JIJWI_SVOI_Amount"
              value="${addComma(item.JIJWI_SVOI_Amount ?? 0, 'c')}"
               class="form-control JISVOI_Amount text-end"
               readonly />
    </td>

    <td>
        <input name="Items[${index}].JIJWI_SVOI_DeliveryDate"
               value="${item.JIJWI_SVOI_DeliveryDate?.split('T')[0] || ''}"
               type="text"
               class="form-control datepicker JISVOI_DeliveryDate text-center" />
    </td>

</tr>`;

        $("#TableBody").append(row);

        let $row = $("#TableBody tr.NewRow:last");

        $row.find(".JISVOI_PRS_Number")
            .val(item.JIJWI_SVOI_PRS_Number).trigger("change");

        $row.find(".JISVOI_WH_Number")
            .val(item.JIJWI_SVOI_WH_Number).trigger("change");

        $row.find(".JISVOI_UoM_Number")
            .val(item.JIJWI_SVOI_UoM_Number);

        $row.find(".JISVOI_UnitPrice").trigger("change");

        let fp = $row.find(".datepicker").flatpickr({
            dateFormat: "d-M-Y",
            altInput: true,
            altFormat: "d-M-Y",
            allowInput: true
        });

        if (item.JIJWI_SVOI_DeliveryDate) {
            fp.setDate(new Date(item.JIJWI_SVOI_DeliveryDate), true, "d-M-Y");
        }

        DateBind();
    });
    isBindingItems = false;
    calculateTotal();

    ApplyFieldWidths({
        fields: ItemTableFields,
        container: "#ItemTable",
        tempRow: "#TempRow",
        tableBody: "#TableBody",
        searchTable: "#tblsearch"
    });
}

function BindFreightItems(items) {

    $("#FreightTableBody tr.FreightNewRow").remove();

    if (!items || items.length === 0)
        return;

    isBindingItems = true;
    $.each(items, function (index, item) {

        var row = `
<tr class="FreightNewRow NewRow" data-rowid="${index + 1}">

    <td class="p-2 del">
        <input type="checkbox" class="CheckItem form-check-input">
    </td>

    <td>
        <select name="FreightItems[${index}].JIFRT_SVOI_PRS_Number"
                class="form-select JIFRT_SVOI_PRS_Number">
            ${$("#FreightTempRow .JIFRT_SVOI_PRS_Number").html()}
        </select>
    </td>

    <td>
        <input name="FreightItems[${index}].JIFRT_SVOI_Number"
               value="${item.JIFRT_SVOI_Number ?? 0}"
               type="hidden"
               class="JIFRT_SVOI_Number" />

        <input name="FreightItems[${index}].JIFRT_SVOI_IsDeleted"
               value="false"
               type="hidden"
               class="JIFRT_SVOI_IsDeleted" />

        <select name="FreightItems[${index}].JIFRT_SVOI_FromWH_Number"
                class="form-select JIFRT_SVOI_FromWH_Number">
            ${$("#FreightTempRow .JIFRT_SVOI_FromWH_Number").html()}
        </select>
    </td>

    <td>
        <select name="FreightItems[${index}].JIFRT_SVOI_ToWH_Number"
                class="form-select JIFRT_SVOI_ToWH_Number">
            ${$("#FreightTempRow .JIFRT_SVOI_ToWH_Number").html()}
        </select>
    </td>

    <td>
        <select name="FreightItems[${index}].JIFRT_SVOI_UoM_Number"
                class="form-select JIFRT_SVOI_UoM_Number text-center">
            ${$("#FreightTempRow .JIFRT_SVOI_UoM_Number").html()}
        </select>
    </td>

    <td><input name="FreightItems[${index}].JIFRT_SVOI_Qty" value="${addComma(item.JIFRT_SVOI_Qty ?? 0, 'q')}" class="form-control JIFRT_SVOI_Qty text-center" /></td>
    <td><input name="FreightItems[${index}].JIFRT_SVOI_Rate" value="${addComma(item.JIFRT_SVOI_Rate ?? 0, 'c')}" class="form-control JIFRT_SVOI_Rate text-end" /></td>
    <td><input name="FreightItems[${index}].JIFRT_SVOI_Amount" value="${addComma(item.JIFRT_SVOI_Amount ?? 0, 'c')}" class="form-control JIFRT_SVOI_Amount text-end" readonly /></td>

</tr>`;

        $("#FreightTableBody").append(row);

        let $row = $("#FreightTableBody tr.FreightNewRow:last");

        $row.find(".JIFRT_SVOI_PRS_Number").val(item.JIFRT_SVOI_PRS_Number).trigger("change");
        $row.find(".JIFRT_SVOI_FromWH_Number").val(item.JIFRT_SVOI_FromWH_Number).trigger("change");
        $row.find(".JIFRT_SVOI_ToWH_Number").val(item.JIFRT_SVOI_ToWH_Number).trigger("change");
        $row.find(".JIFRT_SVOI_UoM_Number").val(item.JIFRT_SVOI_UoM_Number);
    });
    isBindingItems = false;
    FreightCalculateTotal();

    ApplyFieldWidths({
        fields: FreightItemTableFields,
        container: "#FreightItemTable",
        tempRow: "#FreightTempRow",
        tableBody: "#FreightTableBody",
        searchTable: "#tblsearch"
    });
}

//#endregion
