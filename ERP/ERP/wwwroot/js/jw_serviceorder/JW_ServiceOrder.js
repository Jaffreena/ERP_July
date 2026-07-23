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

    { cls: ".JISVOI_UoM_Number", min: 10, max: 15, align: "center" }, // UoM

    { cls: ".JISVOI_Qty", min: 10, max: 20, align: "center" }, // Qty
    { cls: ".JISVOI_UnitPrice", min: 10, max: 20, align: "right" },  // Unit Price
    { cls: ".JISVOI_Amount", min: 13, max: 25, align: "right" },  // Amount

    { cls: ".JISVOI_DeliveryDate", min: 12, max: 12, align: "center" }  // Delivery Date
];

 
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
    fitInputWidth("Header_JISVOH_PaymentTerms", 30, 40);
    fitInputWidth("Header_JISVOH_DeliveryTerms", 30, 40);
    fitInputWidth("Header_JISVOH_DeliveryMode", 30, 40);
    fitInputWidth("Header_JISVOH_Tax", 40, 40);
    fitInputWidth("Header_JISVOH_TDC", 40, 40);
    fitInputWidth("Header_JISVOH_Remarks", 40, 40);
}
$(document).ready(function () {
    //#region item code right pane search JISVOI_Item_Code
    $(document).on("keydown", ".JISVOI_Item_Code", function (e) {

        HandleSearchKeyDown(
            e,
            this,
            "#RightPane_Item",
            ".search-results",
            "#ItemMessage"
        );

    });
    $(document).on("focusout", ".JISVOI_Item_Code", function () {

        let input = $(this);
        let rows = $("#RightPane_Item .search-results tbody tr");

        HandleSearchSelection(
            input,
            rows,
            "#ItemMessage",
            "#RightPane_Item",
            "#RightPane_Item .search-results"
        );
    });
    $(document).on("keydown", function (e) {
        if (e.key === "Escape") {
            let input = $(".JISVOI_Item_Code");
            let rows = $("#RightPane_Item .search-results tbody tr");

            HandleSearchSelection(
                input,
                rows,
                "#ItemMessage",
                "#RightPane_Item",
                "#RightPane_Item .search-results"
            );
        }
    });
    //#endregion
    $(document).on("focusout", "#Header_JISVOH_JW_Customer_Name", function () {

        let input = $(this);
        let rows = $("#RightPane .buyer-search-results tbody tr");

        HandleSearchSelection(
            input,
            rows,
            "#BuyerMessage",
            "#RightPane",
            "#RightPane .buyer-search-results"
        );
    });

    $(document).on("keydown", "#Header_JISVOH_JW_Customer_Name", function (e) {
        HandleSearchKeyDown(
            e,
            this,
            "#RightPane",
            ".buyer-search-results",
            "#BuyerMessage"
        );
    });
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

    $(document).on("keydown", "#Header_JISVOH_JW_Customer_Name", function (e) {

        let input = $(this);
        let resultsDiv = input.siblings(".jwcustomer-search-results");
        let rows = resultsDiv.find("tbody tr");

        if (!resultsDiv.is(":visible") || rows.length === 0)
            return;

        let selectedIndex = input.data("selectedIndex");

        let firstMatch = input.data("firstMatch");
        let lastMatch = input.data("lastMatch");

        switch (e.key) {

            case "ArrowDown":

                e.preventDefault();

                if (selectedIndex == null) {

                    if (lastMatch >= 0)
                        selectedIndex = lastMatch;
                    else
                        selectedIndex = rows.length - 1;
                }
                else if (selectedIndex < rows.length - 1) {

                    selectedIndex++;
                }

                break;

            case "ArrowUp":

                e.preventDefault();

                if (selectedIndex == null) {

                    if (firstMatch >= 0)
                        selectedIndex = firstMatch;
                    else
                        selectedIndex = 0;
                }
                else if (selectedIndex > 0) {

                    selectedIndex--;
                }

                break;

            case "Enter":

                e.preventDefault();

                if (selectedIndex != null)
                    $(rows[selectedIndex]).trigger("click");

                return;

            case "Escape":

                e.preventDefault();

                resultsDiv.hide();

                input.removeData("selectedIndex");

                return;

            default:
                return;
        }

        HighlightRow(rows, selectedIndex);

        input.data("selectedIndex", selectedIndex);
    });

 
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
                if (!el.val() || parseFloat(el.val()) <= 0) {
                    isValid = false;
                    el.focus();
                    return false;
                }
            }

            if (el.hasClass("JISVOI_UnitPrice")) {
                if (!el.val() || parseFloat(el.val()) <= 0) {
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
        $newRow.find("td:last").html(`
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
                    showAlert('Record Inserted');
                    ClearAll();
                    DateBind();
                    console.log(model);
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

    let qty = parseFloat(currentRow.find(".JISVOI_Qty").val()) || 0;
    let price = parseFloat(currentRow.find(".JISVOI_UnitPrice").val()) || 0;

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
    console.log(formattedDate +'--formattedDate')
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

        SVO_Id:
            parseInt($("#Header_SVO_Id").val()) || 0,

        JISVOI_Item_Code:
            $("#Header_JISVOI_Item_Code").val()
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

            JISVOI_UoM_Number:
                parseInt(row.find(".JISVOI_UoM_Number").val()) || 0,

            JISVOI_Qty:
                parseFloat(row.find(".JISVOI_Qty").val()) || 0,

            JISVOI_UnitPrice:
                parseFloat(row.find(".JISVOI_UnitPrice").val()) || 0,

            JISVOI_Amount:
                parseFloat(row.find(".JISVOI_Amount").val()) || 0,

            JISVOI_DeliveryDate:
                row.find(".JISVOI_DeliveryDate").val()
                    ? new Date(
                        row.find(".JISVOI_DeliveryDate").val()
                    ).toISOString()
                    : null
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

function SearchBuyer(inputElement) {

    var JWCustomer = inputElement.value;
    var RegDate = $("input[name='Header.JISVOH_RegDate']").val();
    var resultsDiv = $("#RightPane").find(".buyer-search-results");



    $.ajax({
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

                    row.on("click", function () {
                        $("#BuyerMessage").hide().text("");
                        SelectBuyer(
                            cust,
                            "Header_JISVOH_JW_Customer_Name",
                            "Header_JISVOH_JW_Customer_Number",
                            "Header_JISVOH_Currency_Name",
                            "Header_JISVOH_Currency_Number",
                            "Header_JISVOH_WH_Number",
                            "RightPane",
                            ".buyer-search-results"
                        );
                        // Display customer name
                        $(inputElement).val(cust.cuS_Name);

                        // Hidden JW Customer ID
                        $("#Header_JISVOH_JW_Customer_Number")
                            .val(cust.cuS_Number);
                        $("#Header_JISVOH_JW_Customer_Name")
                            .val(cust.cuS_Name);
                        // Currency dropdown
                        $("#Header_JISVOH_Currency_Number")
                            .val(cust.cuS_CUR_Number)
                            .trigger("change");
                        $("#RightPane").hide();

                        resultsDiv.hide();
                    });

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

                $("#BuyerMessage")
                    .html("No records found")
                    .show();

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
    var value = inputElement.value;

    if (!value) {
        SearchServiceOrderItem(inputElement);
    } else {
        $(inputElement).select();
    }
}

function SearchServiceOrderItem(inputElement) {

    let itemCode = inputElement.value;
    let row = $(inputElement).closest("tr");
    let resultsDiv = $("#RightPane_Item").find(".search-results");
    let material = $("#Header_JISVOH_MS_Number").val();

    if (!material) return;
    $.ajax({
        url: '/jobinward/transactions/service-order/item',
        type: 'GET',
        data: {
            ItemCode: itemCode, MS: material
        },
        success: function (data) {

            resultsDiv.empty();
            $("#ItemMessage").hide().text("");

            if (data && data.length > 0) {

                $("#RightPane_Item").addClass("show");
                resultsDiv.show();

          


                var table = $(
                    '<div class="card-body batchPopup modal-content p-0 table-responsive" style="z-index:999;">' +
                    '<table class="table table-bordered table-hover table-fixed mb-0 table-grid" id="tblsearch">' +
                    '<thead>' +
                    '<tr class="table-info">' +
                    '<th style="width:30%;">Item Code</th>' +
                    '<th style="width:70%;">Description</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody></tbody>' +
                    '</table>' +
                    '</div>'
                );

                data.forEach(function (item) {

                    let tr = $(`
                        <tr>
                            <td>${item.itemCode}</td>
                            <td>${item.itemDescription}</td>
                           
                        </tr>
                    `);
                    tr.css("height", "24px");
                    tr.on("click", function () {
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

                        resultsDiv.hide();
                        $("#RightPane_Item").removeClass("show");
                    });

                    table.find("tbody").append(tr);
                });

           
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
                resultsDiv.append(table);

            } else {
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

                $("#ItemMessage")
                    .html("No records found")
                    .show();

                $("#RightPane_Item").addClass("show");
                $("#RightPane_Item .search-results").show();
                //#endregion 
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
        let qty = parseFloat(row.find(".JISVOI_Qty").val()) || 0;

        // Get Unit Price
        let unitPrice = parseFloat(row.find(".JISVOI_UnitPrice").val()) || 0;

        // Row Amount = Qty × Unit Price
        let amount = qty * unitPrice;

        // Set row amount field
        row.find(".JISVOI_Amount").val(amount.toFixed(2));

        // Add to totals
        totalQty += qty;
        totalAmount += amount;
    });

    // Footer totals
    $("#TotalQty").val(totalQty);
    $("#TotalAmount").val(totalAmount.toFixed(2));
}
//#endregion Calculate Total

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
