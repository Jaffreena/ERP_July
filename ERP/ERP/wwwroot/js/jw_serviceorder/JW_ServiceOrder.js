$(document).ready(function () {
    //#region JW_Customer – Focus In
    // Handled via inline onfocus in the .cshtml — no delegated
    // binding needed.
    //#endregion

    //#region JW_Customer – Text change
    // Handled via inline oninput in the .cshtml.
    //#endregion

    //#region JW_Customer – Focus Out
    $(document).on("focusout", "#Header_JISVOH_JW_Customer_Name", function () {
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
    // 1. Tab/Enter – auto-select or "Too many choices" (Tab via Focus Out)
    // 2. Arrow Up – highlight + move to top match
    // 3. Arrow Down – highlight + move to bottom match
    // 4. Enter/Escape, no record selected -> auto-select first record + close popup
    $(document).on("keydown", "#Header_JISVOH_JW_Customer_Name", function (e) {

        if (e.key !== "ArrowDown" && e.key !== "ArrowUp" &&
            e.key !== "Enter" && e.key !== "Escape") {
            return;
        }

        let input = $(this);
        let rows = $("#RightPane .buyer-search-results tbody tr");

        // Enter or Escape on an empty textbox (no record selected,
        // full unfiltered list) -> auto-select first record + close
        // popup, same behavior for both keys.
        if ((e.key === "Enter" || e.key === "Escape") &&
            $.trim(input.val()) === "" && rows.length > 0 &&
            !rows.filter(".current-row, .match-row").length) {

            e.preventDefault();

            isMouseSelectingBuyer = true;
            rows.first().trigger("mousedown");
            return;
        }

        if (e.key === "Escape") {
            HandleSearchSelection(
                input,
                rows,
                "#BuyerMessage",
                "#RightPane",
                "#RightPane .buyer-search-results"
            );
            return;
        }

        if (e.key === "Enter") {
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
    // Handled via inline onfocus (OnFocusItem or equivalent) in the
    // .cshtml — the re-trigger-loop guard lives inside that function.
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

            e.preventDefault();
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

        if ($.trim($("#Header_JISVOH_MS_Number").val()) === "") {
            $("#Header_JISVOH_MS_Number").prop("selectedIndex", 1);
            return;
        }

        SearchServiceOrderItem(this);

        $("#RightPane").removeClass("show");
        $("#RightPane .buyer-search-results").hide();

        $("#RightPane_Item").addClass("show");
        $("#RightPane_Item .search-results").show();
    });
    //#endregion

    //#region Item_Code – Focus Out
    $(document).on("focusout", ".JISVOI_Item_Code", function () {

        if (isSelectingItem)
            return;

        if ($.trim($("#Header_JISVOH_MS_Number").val()) === "") {
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

    { cls: ".JISVOI_WH_Number", min: 10, max: 25, align: "left" }, // Warehouse

    { cls: ".JISVOI_UoM_Number", min: 10, max: 15, align: "center" }, // UoM

    { cls: ".JISVOI_Qty", min: 10, max: 20, align: "center" }, // Qty
    { cls: ".JISVOI_UnitPrice", min: 10, max: 20, align: "right" },  // Unit Price
    { cls: ".JISVOI_Amount", min: 13, max: 25, align: "right" },  // Amount

    { cls: ".JISVOI_DeliveryDate", min: 10, max: 10, align: "center" },  // Delivery Date
    { cls: ".JISVOI_FromWH", min: 10, max: 25, align: "left" }, // From WH
    { cls: ".JISVOI_ToWH", min: 10, max: 25, align: "left" }  // To WH
];
let isMouseSelectingBuyer = false;
 
 
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
    fitInputWidth("Header_JISVOH_RegNo", 20, 25);
    fitInputWidth("Header_JISVOH_ServiceOrderNo", 20, 25);
    fitInputWidth("Header_JISVOH_MS_Number", 20, 30);
    fitInputWidth("Header_JISVOH_JW_Customer_Name", 40, 50);
    fitInputWidth("Header_JISVOH_Currency_Number", 10, 10);
    fitInputWidth("Header_JISVOH_Category", 20, 20);
    fitInputWidth("Header_JISVOH_PaymentTerms", 30, 40);
    fitInputWidth("Header_JISVOH_DeliveryTerms", 30, 40);
    fitInputWidth("Header_JISVOH_DeliveryMode", 30, 40);
    fitInputWidth("Header_JISVOH_Tax", 40, 40);
    fitInputWidth("Header_JISVOH_TDC", 40, 40);
    fitInputWidth("Header_JISVOH_Remarks", 40, 40);
}
function LoadDefaultFormSetting() {
    $.ajax({
        url: '/jobinward/transactions/service-order/get',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response && response.success && response.data) {
                var data = response.data;

                if (data.dfS_JISVOH_ServiceOrderNo) {
                    $('#Header_JISVOH_ServiceOrderNo').val(data.dfS_JISVOH_ServiceOrderNo);
                }
                if (data.dfS_JISVOH_JW_Customer_Number) {
                    $('#Header_JISVOH_JW_Customer_Number').val(data.dfS_JISVOH_JW_Customer_Number);
                    $('#Header_JISVOH_JW_Customer_Name').val(data.cuS_Name);
                }
                if (data.dfS_JISVOH_Currency_Number) {
                    $('#Header_JISVOH_Currency_Number').val(data.dfS_JISVOH_Currency_Number).trigger('change');
                }
                if (data.dfS_JISVOH_PaymentTerms) {
                    $('#Header_JISVOH_PaymentTerms').val(data.dfS_JISVOH_PaymentTerms);
                }
                if (data.dfS_JISVOH_DeliveryTerms) {
                    $('#Header_JISVOH_DeliveryTerms').val(data.dfS_JISVOH_DeliveryTerms);
                }
                if (data.dfS_JISVOH_DeliveryMode) {
                    $('#Header_JISVOH_DeliveryMode').val(data.dfS_JISVOH_DeliveryMode);
                }
                if (data.dfS_JISVOH_Tax) {
                    $('#Header_JISVOH_Tax').val(data.dfS_JISVOH_Tax);
                }
                if (data.dfS_JISVOH_TDC) {
                    $('#Header_JISVOH_TDC').val(data.dfS_JISVOH_TDC);
                }
                if (data.dfS_JISVOH_Remarks) {
                    $('#Header_JISVOH_Remarks').val(data.dfS_JISVOH_Remarks);
                }
                if (data.dfS_JISVOH_MS_Number) {
                    $('#Header_JISVOH_MS_Number').val(data.dfS_JISVOH_MS_Number).trigger('change');
                }
            }
        },
        error: function (xhr) {
            console.error('Failed to load default form setting', xhr);
        }
    });
}
$(document).on("change", "#Header_JISVOH_RegDate", function () {
    GetServiceOrderNumber();
});
function GetServiceOrderNumber() {
    let date = $("#Header_JISVOH_RegDate").val();
    if (!date)
        return;

    $.ajax({
        url: "/serviceorder/transactions/serviceorder/next-jso-number",
        type: "GET",
        data: { JSODate: date },
        success: function (response) {
            if (!response || response.trim() === "") {
                alert("Please set numbering for this date range.");
                $("#Header_JISVOH_RegNo").val("");
                DateBind();
                return;
            }
            $("#Header_JISVOH_RegNo").val(response);
        },
        error: function () {
        }
    });
}
$(document).ready(function () {
    LoadDefaultFormSetting();
    //#region GetDeliveryNoteNumber



   

    //#endregion
    $(document).on("mousedown", ".search-results tbody tr", function () {

        let rows = $(".search-results tbody tr");

        // Remove previous current row
        rows.removeClass("current-row");

        // Make clicked row the current row
        $(this).addClass("current-row");
    });
    //#region item code right pane search JISVOI_Item_Code
    // Item_Code – Keydown
    // 1. Tab/Enter – auto-select or "Too many choices"
    // 2. Arrow Up – highlight + move to top match
    // 3. Arrow Down – highlight + move to bottom match
    // 4. Enter/Escape, no record selected -> auto-select first record + close popup
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

    $(document).on("input change blur", "#ItemTable input, #ItemTable textarea, #ItemTable select", function () {
        ApplyFieldWidths({
            fields: ItemTableFields,
            container: "#ItemTable",
            tempRow: "#TempRow",
            tableBody: "#TableBody",
            searchTable: "#tblsearch"
        });
    });
    //#endregion

    //#endregion
  
    AutoFit();
    //#region Header AutoFit - KeyUp

    $(document).on("keyup change input",
        "#Header_JISVOH_RegNo, #Header_JISVOH_ServiceOrderNo, #Header_JISVOH_MS_Number, #Header_JISVOH_JW_Customer_Name, #Header_JISVOH_Currency_Number, #Header_JISVOH_PaymentTerms, #Header_JISVOH_DeliveryTerms, #Header_JISVOH_DeliveryMode, #Header_JISVOH_Tax, #Header_JISVOH_TDC, #Header_JISVOH_Remarks",
        function () {

            const widths = {
                Header_JISVOH_RegNo: [20, 25],
                Header_JISVOH_ServiceOrderNo: [20, 25],
                Header_JISVOH_MS_Number: [20, 30],
                Header_JISVOH_JW_Customer_Name: [40, 50],
                Header_JISVOH_Currency_Number: [10, 10],
                Header_JISVOH_PaymentTerms: [30, 40],
                Header_JISVOH_DeliveryTerms: [30, 40],
                Header_JISVOH_DeliveryMode: [30, 40],
                Header_JISVOH_Tax: [40, 40],
                Header_JISVOH_TDC: [40, 40],
                Header_JISVOH_Remarks: [40, 40]
            };

            const [min, max] = widths[this.id];
            fitInputWidth(this, min, max);
        });

    //#endregion

    // Removed: dead/legacy duplicate keydown handler. It targeted
   

 
    //#region Initialize Flatpickr
    InitializeGstFlatpickrs();

 
    DateBind();
    //#region onkeypress qty and unit
    $(document).on("keyup change", ".JISVOI_Qty, .JISVOI_UnitPrice", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat((row.find(".JISVOI_Qty").val() || "0").replace(/,/g, "")) || 0;
        let price = parseFloat((row.find(".JISVOI_UnitPrice").val() || "0").replace(/,/g, "")) || 0;

        let amount = qty * price;

        // Only set row amount (read-only field)
        row.find(".JISVOI_Amount").val(formatIndianCurrency(amount));

        // Update footer totals separately
        calculateTotal();

        // Auto add row
        autoAddRow(row);

    });
    //#region comma format on focusout
    $(document).on("focusout", ".JISVOI_Qty, .JISVOI_UnitPrice, .JISVOI_Amount", function () {

        let type = $(this).hasClass("JISVOI_Qty") ? "q" : "c";

        $(this).val(addComma($(this).val(), type));
    });
    //#endregion
    //#endregion
    //#region add row item grid
    let rowIndex = 1; // start from 1 because 0 already exists

    // NEW: Freight Service Order toggle
    function ToggleFreightColumns() {
        let isFreight = $("#Header_JISVOH_Freight_Applicable").is(":checked");

        if (isFreight) {
            $(".DeliveryDateHeader, .DeliveryDateCell").hide();
            $(".FromWHHeader, .FromWHCell, .ToWHHeader, .ToWHCell").show();
        } else {
            $(".DeliveryDateHeader, .DeliveryDateCell").show();
            $(".FromWHHeader, .FromWHCell, .ToWHHeader, .ToWHCell").hide();
        }
    }

    $(document).on("change", "#Header_JISVOH_Freight_Applicable", function () {
        ToggleFreightColumns();
    });

    ToggleFreightColumns();

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
        $newRow.find("td.DeliveryDateCell").html(`
    <input name="Items[${rowIndex}].JISVOI_DeliveryDate"
           type="text"
           class="form-control datepicker JISVOI_DeliveryDate" />
`);

        $newRow.find(".datepicker").flatpickr({
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "d-M-Y",
            allowInput: true,
            defaultDate: new Date()
        });
       // SetRowDate($newRow);
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
    $("#btnSave").on("click", function (e) {

        if (!validateHeaderById()) {
            e.preventDefault();
            return false;
        }
        let duplicateMessage = ValidateDuplicateItemCombination();

        if (duplicateMessage) {
            e.preventDefault();
            showAlert(duplicateMessage);
            return false;
        }
        let model = CreateServiceOrderModel();

        console.log(JSON.stringify(model));

        $.ajax({
            url: '/ServiceOrder/SaveServiceOrder',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(model),

            success: function (response) {

                if (response.success) {
                    $('#ModelAlert').one('hidden.bs.modal', function () {
                        location.reload();
                    });
                    showAlert('Record Inserted');
                }
            },

            error: function (xhr) {
                console.log(xhr.responseText);
            }
        });

    });
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
    let firstRow = $("#ItemTable tbody tr.NewRow:first");
    autoAddRow(firstRow);
});

//#region validation
function ValidateDuplicateItemCombination() {

    let combinationMap = {};
    let duplicateMessages = [];

    $("#ItemTable tbody tr.NewRow").each(function (index) {

        let row = $(this);

        if (row.find(".JISVOI_IsDeleted").val() == "1") return;
        if (!row.find(".JISVOI_Item_Number").val()) return;

        let prs = row.find(".JISVOI_PRS_Number").val() || 0;
        let item = row.find(".JISVOI_Item_Number").val() || 0;
        let uom = row.find(".JISVOI_UoM_Number").val() || 0;

        let key = prs + "_" + item + "_" + uom;
        let rowNo = index + 1;

        if (!combinationMap[key]) {
            combinationMap[key] = [];
        }

        combinationMap[key].push(rowNo);
    });

    $.each(combinationMap, function (key, rows) {
        if (rows.length > 1) {
            duplicateMessages.push(
                "Row # " + rows.join(", ") + " have the same combination of Process, Item and UoM"
            );
        }
    });

    if (duplicateMessages.length > 0) {
        return duplicateMessages.join("\n");
    }

    return "";
}
//#endregion
//#region auto add row function
function autoAddRow(currentRow) {

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
function InitializeGstFlatpickrs() {
    $(".datepicker").flatpickr({
        dateFormat: "d-M-Y",   // 30-Apr-2026
        altInput: true,        // shows formatted date
        altFormat: "d-M-Y",   // display format
        allowInput: true,     // user can type manually
        defaultDate: new Date() // optional: today default
    });
}
function SetRowDate($row) {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');

    var months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    var formattedDate =
        day + "-" + months[today.getMonth()] + "-" + today.getFullYear();

    var fp = $row.find(".datepicker")[0]?._flatpickr;

    if (fp) {
        fp.setDate(formattedDate, true, "d-M-Y");
    }
}
function DateBind() {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');

    var months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    var formattedDate =
        day + "-" + months[today.getMonth()] + "-" + today.getFullYear();

    var regDate = document.getElementById("Header_JISVOH_RegDate")?._flatpickr;
    if (regDate)
        regDate.setDate(formattedDate, true, "d-M-Y");

    var serviceOrderDate = document.getElementById("Header_JISVOH_ServiceOrderDate")?._flatpickr;
    if (serviceOrderDate)
        serviceOrderDate.setDate(formattedDate, true, "d-M-Y");
    console.log(formattedDate + '--formattedDate')
    GetServiceOrderNumber();

}

function CreateServiceOrderModel() {

    // =========================
    // HEADER
    // =========================
    let header = {

        JISVOH_Number:
            parseInt($("#Header_JISVOH_Number").val()) || 0,

        JISVOH_RegNo:
            $("#Header_JISVOH_RegNo").val(),

        JISVOH_RegDate:
            $("#Header_JISVOH_RegDate").val()
                ? new Date($("#Header_JISVOH_RegDate").val()).toISOString()
                : null,

        JISVOH_ServiceOrderNo:
            $("#Header_JISVOH_ServiceOrderNo").val(),

        JISVOH_ServiceOrderDate:
            $("#Header_JISVOH_ServiceOrderDate").val()
                ? new Date($("#Header_JISVOH_ServiceOrderDate").val()).toISOString()
                : null,

        JISVOH_JW_Customer_Number:
            parseInt($("#Header_JISVOH_JW_Customer_Number").val()) || 0,

        JISVOH_JW_Customer_Name:
            $("#Header_JISVOH_JW_Customer_Name").val(),

        JISVOH_Currency_Number:
            parseInt($("#Header_JISVOH_Currency_Number").val()) || 0,

        JISVOH_PaymentTerms:
            $("#Header_JISVOH_PaymentTerms").val(),

        JISVOH_DeliveryTerms:
            $("#Header_JISVOH_DeliveryTerms").val(),

        JISVOH_DeliveryMode:
            $("#Header_JISVOH_DeliveryMode").val(),

        JISVOH_Tax:
            $("#Header_JISVOH_Tax").val(),

        JISVOH_TDC:
            $("#Header_JISVOH_TDC").val(),

        JISVOH_Remarks:
            $("#Header_JISVOH_Remarks").val(),

        JISVOH_Category:
            $("#Header_JISVOH_Category").val() === "RN" ? "RECEIPT NOTE" : "DELIVERY NOTE",

        JISVOH_MS_Number:
            parseInt($("#Header_JISVOH_MS_Number").val()) || null,

        SVO_Id:
            parseInt($("#Header_SVO_Id").val()) || 0,

        JISVOI_Item_Code:
            $("#Header_JISVOI_Item_Code").val(),

        JISVOH_Freight_Applicable:
            $("#Header_JISVOH_Freight_Applicable").is(":checked") ? "Yes" : "No"
    };

    // =========================
    // ITEMS
    // =========================
    let items = [];

    $("#ItemTable tbody tr.NewRow").each(function () {

        let row = $(this);

        // deleted rows skip
        if (row.find(".JISVOI_IsDeleted").val() == "1") {
            return;
        }

        // empty rows skip
        if (!row.find(".JISVOI_Item_Number").val()) {
            return;
        }

        let item = {

            JISVOI_JISVOH_Number:
                parseInt(row.find(".JISVOI_JISVOH_Number").val()) || 0,

            JISVOI_Number:
                parseInt(row.find(".JISVOI_Number").val()) || 0,

            JISVOI_PRS_Number:
                parseInt(row.find(".JISVOI_PRS_Number").val()) || 0,

            JISVOI_Item_Number:
                parseInt(row.find(".JISVOI_Item_Number").val()) || 0,

            JISVOI_WH_Number:
                parseInt(row.find(".JISVOI_WH_Number").val()) || 0,

            JISVOI_UoM_Number:
                parseInt(row.find(".JISVOI_UoM_Number").val()) || 0,

            JISVOI_Qty:
                parseFloat(removeComma(row.find(".JISVOI_Qty").val())) || 0,

            JISVOI_UnitPrice:
                parseFloat(removeComma(row.find(".JISVOI_UnitPrice").val())) || 0,

            JISVOI_Amount:
                parseFloat(removeComma(row.find(".JISVOI_Amount").val())) || 0,

            JISVOI_DeliveryDate:
                row.find(".JISVOI_DeliveryDate").val()
                    ? new Date(
                        row.find(".JISVOI_DeliveryDate").val()
                    ).toISOString()
                    : null,

            JISVOI_Category:
                $("#Header_JISVOH_Category").val() === "RN" ? "RECEIPT NOTE" : "DELIVERY NOTE",

            JISVOI_FromWH:
                parseInt(row.find(".JISVOI_FromWH").val()) || null,

            JISVOI_ToWH:
                parseInt(row.find(".JISVOI_ToWH").val()) || null
        };

        items.push(item);
    });

    // =========================
    // FINAL MODEL
    // =========================
    let serviceOrderModel = {
        Header: header,
        Items: items
    };

    console.log(serviceOrderModel);

    return serviceOrderModel;
}

//#region SUBMIT VALIDATION
function validateHeaderById() {

    // 1. Register No
    if ($("#Header_JISVOH_RegNo").val().trim() === "") {
        showAlert('Register No. is required', '#Header_JISVOH_RegNo');
        return false;
    }

    // 2. Register Date
    if ($("#Header_JISVOH_RegDate").val().trim() === "") {
        showAlert('Register Date is required', '#Header_JISVOH_RegDate');
        return false;
    }

    // 3. Service Order No
    if ($("#Header_JISVOH_ServiceOrderNo").val().trim() === "") {
        showAlert('Service Order No. is required', '#Header_JISVOH_ServiceOrderNo');
        return false;
    }

    // 4. Service Order Date
    if ($("#Header_JISVOH_ServiceOrderDate").val().trim() === "") {
        showAlert('Service Order Date is required', '#Header_JISVOH_ServiceOrderDate');
        return false;
    }

    // 5. JW Customer
    if (
        $("#Header_JISVOH_JW_Customer_Number").val().trim() === "" ||
        $("#Header_JISVOH_JW_Customer_Name").val().trim() === ""
    ) {
        showAlert(
            'JW Customer is required',
            '#Header_JISVOH_JW_Customer_Name'
        );
        return false;
    }

    // 6. Currency
    if (
        $("#Header_JISVOH_Currency_Number").val() === "" ||
        $("#Header_JISVOH_Currency_Number").val() === "0"
    ) {
        showAlert(
            'Currency is required',
            '#Header_JISVOH_Currency_Number'
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

let buyerSearchXHR = null;

function SearchBuyer(inputElement) {

    var JWCustomer = inputElement.value;
    var RegDate = $("input[name='Header.JISVOH_RegDate']").val();
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

                    SelectBuyer(
                        clickedCust,
                        "#Header_JISVOH_JW_Customer_Name",
                        "#Header_JISVOH_JW_Customer_Number",
                        "#Header_JISVOH_Currency_Name",
                        "#Header_JISVOH_Currency_Number",
                        "#Header_JISVOH_WH_Number",
                        "#RightPane",
                        ".buyer-search-results"
                    );

                    $("#BuyerMessage").hide().text("");

                    $(inputElement).val(clickedCust.cuS_Name);

                    $("#Header_JISVOH_JW_Customer_Number")
                        .val(clickedCust.cuS_Number);

                    $("#Header_JISVOH_Currency_Number")
                        .val(clickedCust.cuS_CUR_Number)
                        .trigger("change");

                    $("#RightPane").removeClass("show");
                    $("#RightPane .buyer-search-results").hide();

                    setTimeout(function () {
                        $("#Header_JISVOH_Currency_Number").focus();
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


//#endregion customer Search Functions


//#endregion customer Search Functions

function OnInputItem(inputElement) {
    SearchServiceOrderItem(inputElement);
}

function OnFocusItem(inputElement) {

    if (isSelectingItem) {
        return;
    }

    let resultsDiv = $("#RightPane_Item").find(".search-results");
    let messageVisible = $("#ItemMessage").is(":visible") ||
        $("#ItemEmptyView").is(":visible");
    let alreadyOpen = $("#RightPane_Item").hasClass("show") &&
        (resultsDiv.find("tbody tr").length > 0 || messageVisible);

    if (alreadyOpen) {
        return;
    }

    SearchServiceOrderItem(inputElement);
}
function SearchServiceOrderItem(inputElement) {

    let itemCode = inputElement.value.trim();
    let row = $(inputElement).closest("tr");
    let resultsDiv = $("#RightPane_Item").find(".search-results");
    let material = $("#Header_JISVOH_MS_Number").val();

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

                    // Changed from "click" to "mousedown" so that the
                    // common HandleSearchSelection's rows.trigger("mousedown")
                    // (used for Tab/Enter auto-select and "Too many
                    // choices") actually fires row selection here.
                    tr.on("mousedown", function (e) {

                        e.preventDefault();

                        isSelectingItem = true;

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
                        row.find(".JISVOI_WH_Number").val(item.saleWarehouse);
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

                // IMPORTANT
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

                //==============================
                // Match Row Highlight
                //==============================

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
    $("#TotalQty").val(addComma(totalQty, "q"));
    $("#TotalAmount").val(addComma(totalAmount, "c"));
}
//#endregion Calculate Total

//#region VALIDATE ITEM GRID

function validateItemGrid() {

    let hasValidRow = false;
    let isValid = true;
    let rowNumber = 0;

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

        rowNumber++;
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
                'Row ' + rowNumber + ': Qty is required',
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
                'Row ' + rowNumber + ': Unit Price is required',
                row.find(".JISVOI_UnitPrice")
            );
            isValid = false;
            return false;
        }

        // NEW: Freight Service Order - From WH / To WH mandatory
        if ($("#Header_JISVOH_Freight_Applicable").is(":checked")) {

            let fromWH = row.find(".JISVOI_FromWH").val();
            let toWH = row.find(".JISVOI_ToWH").val();

            if (!fromWH || fromWH.trim() === "" || fromWH.trim() === "0") {
                showAlert(
                    'Row ' + rowNumber + ': From WH is required',
                    row.find(".JISVOI_FromWH")
                );
                isValid = false;
                return false;
            }

            if (!toWH || toWH.trim() === "" || toWH.trim() === "0") {
                showAlert(
                    'Row ' + rowNumber + ': To WH is required',
                    row.find(".JISVOI_ToWH")
                );
                isValid = false;
                return false;
            }
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
