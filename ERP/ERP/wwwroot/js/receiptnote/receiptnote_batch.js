//#region COMMON FUNCTIONS
function removeCommas(value) {
    return (value || '').toString().replace(/,/g, '');
}

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


let BatchMap = {};
let CurrentBatchItemRow = null;
let batchMismatchData_RN = [];
let batchWrongMismatchData_RN = [];
$(document).on("click", ".IBatRowRemove", function () {

    $(this).closest("tr").remove();

    CalculateBatchFooter();
});
$(document).on("keyup", ".JIRNI_BCH_BatchQty, .JIRNI_BCH_BatchUnitPrice", function () {

    let row = $(this).closest("tr");

    let qty = parseFloat((row.find(".JIRNI_BCH_BatchQty").val() || "").replace(/,/g, "")) || 0;
    let unitPrice = parseFloat((row.find(".JIRNI_BCH_BatchUnitPrice").val() || "").replace(/,/g, "")) || 0;

    row.find(".JIRNI_BCH_BatchQty").attr("data-value", qty);
    row.find(".JIRNI_BCH_BatchUnitPrice").attr("data-value", unitPrice);

    let amount = qty * unitPrice;

    row.find(".JIRNI_BCH_BatchValue")
        .val(amount === 0 ? "" : formatIndianCurrency(amount))
        .attr("data-value", amount);

    if (row.is("#IBatTableBody tr:visible:last")) {
        IBatNewRow();
    }

    CalculateBatchFooter();
});
$(document).on("focusout", ".JIRNI_BCH_BatchQty", function () {

    let value = parseFloat(($(this).val() || "").replace(/,/g, "")) || 0;

    $(this)
        .attr("data-value", value)
        .val(value === 0 ? "" : formatIndianQty(value));
});

function ValidateBatchQty() {

    let InvoiceQty =
        parseFloat(removeCommas($("#RNI_BATCHQty").text())) || 0;

    let BatchQty = $("#IBatTableBody tr")
        .not("#IBatTempRow")
        .map(function () {

            return parseFloat(
                removeCommas(
                    $(this).find(".JIRNI_BCH_BatchQty").val()
                )
            ) || 0;

        }).get()
        .reduce((sum, qty) => sum + qty, 0);

    console.log("InvoiceQty :", InvoiceQty);
    console.log("BatchQty :", BatchQty);

    let rowId = GetCheckedRowId_RN();

    console.log("Selected Item :", rowId);

    // Always store the current batch details
    StoreBatchMismatch_RN(rowId);

    if (InvoiceQty !== BatchQty) {

        alert("Qty Mismatch !");
        StoreWrongBatchMismatch_RN(rowId)
        CloseModal_RN();

        return false;
    } else {
        RemoveWrongBatchMismatch_RN(rowId);
    }

    return true;
}

function RemoveWrongBatchMismatch_RN(rowId) {

    batchWrongMismatchData_RN = batchWrongMismatchData_RN.filter(x => x.rowId != rowId);

    console.log(batchWrongMismatchData_RN);
}
function CloseModal_RN() {

    const modal = $("#IBatch");

    modal.one("hidden.bs.modal", function () {

        setTimeout(function () {

            FocusItemGridQty_RN();

        }, 500);

    });

    modal.modal("hide");
}

//#region Focus Item Grid Qty

function FocusItemGridQty_RN() {

    if (!CurrentBatchItemRow)
        return;

    let rowID =
        CurrentBatchItemRow.attr("data-rowid");

    let QtyInput =
        $("#TableBody")
            .find(`tr[data-rowid='${rowID}']`)
            .find(".JIRNI_Qty");

    if (QtyInput.length > 0) {

        QtyInput.focus();

        QtyInput.select();
    }
}

//#endregion


//#region Batch Mismatch

function StoreWrongBatchMismatch_RN(rowId) {

    let batchValues = [];

    let itemNumber = $("#TableBody tr.NewRow")
        .eq(rowId - 1)
        .find(".JIRNI_Item_Number")
        .val();

    let whNumber = $("#TableBody tr.NewRow")
        .eq(rowId - 1)
        .find(".JIRNI_WH_Number")
        .val();
    $("#IBatTableBody tr")
        .not("#IBatTempRow")
        .each(function () {

            if ($(this).find(".RNI_BCH_IsDeleted").val() === "true")
                return;


            batchValues.push({
                RNI_BCH_Item_Index: rowId,

                JIRNI_BCH_BatchDate: $(this).find(".JIRNI_BCH_BatchDate").val(),

                JIRNI_BCH_Number: $(this).find(".JIRNI_BCH_Number").val(),

                JIRNI_BCH_BatchNo: $(this).find(".JIRNI_BCH_BatchNo").val(),

                RNI_BCH_Item_Number: itemNumber,

                JIRNI_BCH_WH_Number: whNumber,

                JIRNI_BCH_BatchQty: parseFloat(removeCommas($(this).find(".JIRNI_BCH_BatchQty").attr("data-value"))) || 0,

                JIRNI_BCH_BatchUnitPrice: parseFloat(removeCommas($(this).find(".JIRNI_BCH_BatchUnitPrice").attr("data-value"))) || 0,

                JIRNI_BCH_BatchValue: parseFloat(removeCommas($(this).find(".JIRNI_BCH_BatchValue").attr("data-value"))) || 0,

                RNI_BCH_IsDeleted: $(this).find(".RNI_BCH_IsDeleted").val()
            });

        });

    let index = batchWrongMismatchData_RN.findIndex(x => x.rowId == rowId);

    if (index >= 0)
        batchWrongMismatchData_RN[index].batchValues = batchValues;
    else
        batchWrongMismatchData_RN.push({
            rowId: rowId,
            batchValues: batchValues
        });

    console.log(batchWrongMismatchData_RN);
    CloseModal_RN();
}


function GetBatchValues_RN(rowId) {

    let item = batchMismatchData_RN.find(x => x.rowId == rowId);

    return item ? item.batchValues : [];

}
function StoreBatchMismatch_RN(rowId) {

    let batchValues = [];

    let itemNumber = $("#TableBody tr.NewRow")
        .eq(rowId - 1)
        .find(".JIRNI_Item_Number")
        .val();

    let whNumber = $("#TableBody tr.NewRow")
        .eq(rowId - 1)
        .find(".JIRNI_WH_Number")
        .val();

    $("#IBatTableBody tr")
        .not("#IBatTempRow")
        .each(function () {

            if ($(this).find(".RNI_BCH_IsDeleted").val() === "true")
                return;

            batchValues.push({

                RNI_BCH_Item_Index: rowId,

                JIRNI_BCH_BatchDate: $(this).find(".JIRNI_BCH_BatchDate").val(),

                JIRNI_BCH_Number: $(this).find(".JIRNI_BCH_Number").val(),

                JIRNI_BCH_BatchNo: $(this).find(".JIRNI_BCH_BatchNo").val(),

                RNI_BCH_Item_Number: itemNumber,

                JIRNI_BCH_WH_Number: whNumber,
                JIRNI_BCH_BatchQty: parseFloat($(this).find(".JIRNI_BCH_BatchQty").attr("data-value")) || 0,

                JIRNI_BCH_BatchUnitPrice: parseFloat($(this).find(".JIRNI_BCH_BatchUnitPrice").attr("data-value")) || 0,

                JIRNI_BCH_BatchValue: parseFloat($(this).find(".JIRNI_BCH_BatchValue").attr("data-value")) || 0,

                RNI_BCH_IsDeleted: $(this).find(".RNI_BCH_IsDeleted").val()

            });

        });

    let index = batchMismatchData_RN.findIndex(x => x.rowId == rowId);

    if (index >= 0)
        batchMismatchData_RN[index].batchValues = batchValues;
    else
        batchMismatchData_RN.push({
            rowId: rowId,
            batchValues: batchValues
        });

    console.log(batchMismatchData_RN);
}


function GetCheckedRowId_RN() {

    let rowId = -1;

    $("#TableBody tr.NewRow:visible").each(function (index) {

        if ($(this).find(".CheckItem").is(":checked")) {

            rowId = index + 1;
            return false;
        }

    });

    return rowId;

}

//#region apply batch values

function ApplyBatchValues_RN(rowId) {

    let batchValues = GetBatchValues_RN(rowId);
    let row = $("#TableBody tr.NewRow").eq(rowId - 1);

    let unitPrice = parseFloat(
        (row.find(".JIRNI_UnitPrice").val() || "0").replace(/,/g, "")
    ) || 0;
    $("#IBatTableBody tr")
        .not("#IBatTempRow")
        .remove();

    if (!batchValues.length) {

        CalculateBatchFooter();
        return;
    }

    $.each(batchValues, function (i, batch) {

        IBatNewRow();      // Your existing function which creates one batch row

        let row = $("#IBatTableBody tr")
            .not("#IBatTempRow")
            .last();
        row.find(".RNI_BCH_Item_Number")
            .val(batch.RNI_BCH_Item_Number);
        row.find(".JIRNI_BCH_BatchDate")
            .val(batch.JIRNI_BCH_BatchDate);

        row.find(".JIRNI_BCH_Number")
            .val(batch.JIRNI_BCH_Number);

        row.find(".JIRNI_BCH_BatchQty")
            .val(batch.JIRNI_BCH_BatchQty)
            .attr("data-value", batch.JIRNI_BCH_BatchQty);

        row.find(".JIRNI_BCH_BatchUnitPrice")
            .val(batch.JIRNI_BCH_BatchUnitPrice)
            .attr("data-value", batch.JIRNI_BCH_BatchUnitPrice);

        row.find(".JIRNI_BCH_BatchValue")
            .val(batch.JIRNI_BCH_BatchValue)
            .attr("data-value", batch.JIRNI_BCH_BatchValue);

        row.find(".RNI_BCH_Item_WH")
            .val(batch.RNI_BCH_Item_WH);

    });

    CalculateBatchFooter();
}

//#endregion
//#region FOOTER TOTAL

function CalculateBatchFooter() {

    let totalQty = 0;
    let totalValue = 0;

    $("#IBatTableBody tr.IBatNewRow").each(function () {


        totalQty += parseFloat((
            removeCommas($(this).find(".JIRNI_BCH_BatchQty").val()) || "0"
        ).replace(/,/g, "")) || 0;

        totalValue += parseFloat((
            removeCommas($(this).find(".JIRNI_BCH_BatchValue").val()) || "0"
        ).replace(/,/g, "")) || 0;

    });

    $("#BatchTotalQty")
        .val(totalQty === 0 ? "" : formatIndianQty(totalQty));

    $("#BatchTotalValue")
        .val(totalValue === 0 ? "" : formatIndianCurrency(totalValue));

}

//#endregion

//#endregion
function CheckAllValid(row) {

    if (row.length === 0)
        return true;

    if ($.trim(row.find(".JIRNI_BCH_BatchDate").val()) === "")
        return false;

    if ($.trim(row.find(".JIRNI_BCH_Number").val()) === "")
        return false;

    if ($.trim(row.find(".JIRNI_BCH_BatchQty").val()) === "" ||
        parseFloat(row.find(".JIRNI_BCH_BatchQty").val()) <= 0)
        return false;

    if ($.trim(row.find(".JIRNI_BCH_BatchUnitPrice").val()) === "")
        return false;

    return true;
}


function IBatNewRow() {

    var browCount = $("#IBatTableBody tr.IBatNewRow").length;

    var previousRow = $("#IBatTableBody tr.IBatNewRow:last");

    var unitPrice = previousRow.length
        ? previousRow.find(".JIRNI_BCH_BatchUnitPrice").val()
        : "";

    var itemNumber = previousRow.length
        ? previousRow.find(".RNI_BCH_Item_Number").val()
        : "";

    var warehouse = previousRow.length
        ? previousRow.find(".RNI_BCH_Item_WH").val()
        : "";

    var row = $("#IBatTableBody #IBatTempRow").clone()
        .removeAttr("style")
        .removeAttr("id")
        .addClass("IBatNewRow");

    row.find("input.RNI_BCH_Item_Number")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Item_Number")
        .val(itemNumber);

    row.find("input.RNI_BCH_Item_Index")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Item_Index");

    row.find("input.RNI_BCH_Item_WH")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Item_WH")
        .val(warehouse);

    row.find("input.JIRNI_BCH_BatchDate")
        .attr("name", "ItemBatch[" + browCount + "].JIRNI_BCH_BatchDate");

    row.find("input.JIRNI_BCH_Number")
        .attr("name", "ItemBatch[" + browCount + "].JIRNI_BCH_Number");

    row.find("input.JIRNI_BCH_BatchQty")
        .attr("name", "ItemBatch[" + browCount + "].JIRNI_BCH_BatchQty");

    row.find("input.JIRNI_BCH_BatchUnitPrice")
        .attr("name", "ItemBatch[" + browCount + "].JIRNI_BCH_BatchUnitPrice")
        .attr("data-value", unitPrice)
        .val(unitPrice)
        .prop("readonly", true);

    row.find("input.JIRNI_BCH_BatchValue")
        .attr("name", "ItemBatch[" + browCount + "].JIRNI_BCH_BatchValue");

    row.find("input.RNI_BCH_IsDeleted")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_IsDeleted")
        .val("false");

    $("#IBatTableBody").append(row);

    row.find(".JIRNI_BCH_BatchDate").flatpickr({
        dateFormat: "d-M-Y",
        altInput: true,
        altFormat: "d-M-Y",
        allowInput: true,
        defaultDate: new Date()
    });

    row.data("isValid", false);

    // row.find(".JIRNI_BCH_Number").focus();
    CalculateBatchFooter();

    return row;
}


function SaveTempBatch() {

    if (!CurrentBatchItemRow)
        return;

    let rowIndex =
        CurrentBatchItemRow.index();
    let itemNumber =
        CurrentBatchItemRow.find(".JIRNI_Item_Number").val();
    console.log("SAVE rowIndex:", rowIndex);

    let batchList = [];

    $("#IBatTableBody tr.IBatNewRow").each(function () {

        let row =
            $(this);

        let batchDate =
            row.find(".JIRNI_BCH_BatchDate").val();

        let batchNo =
            row.find(".JIRNI_BCH_Number").val();

        let qty =
            parseFloat(
                row.find(".JIRNI_BCH_BatchQty").val()
            ) || 0;

        let unitPrice =
            parseFloat(
                row.find(".JIRNI_BCH_BatchUnitPrice").val()
            ) || 0;

        let amount =
            parseFloat(
                row.find(".JIRNI_BCH_BatchValue").val()
            ) || 0;

        let wh =
            row.find(".RNI_BCH_Item_WH").val();

        if (batchNo) {

            batchList.push({
                RNI_BCH_Item_Number: itemNumber,

                Date: batchDate,

                BatchNo: batchNo,

                Qty: qty,

                UnitPrice: unitPrice,

                Amount: amount,

                Warehouse: wh

            });

        }
    });

    console.log("batchList:", batchList);

    BatchMap[rowIndex] =
        batchList;

    console.log("After Save:", BatchMap);

    bootstrap.Modal
        .getInstance(document.getElementById("IBatch"))
        ?.hide();
}




function CalculateBatchRow(row) {

    let qty = parseFloat((row.find(".JIRNI_BCH_BatchQty").val() || "0").replace(/,/g, "")) || 0;
    let unitPrice = parseFloat((row.find(".JIRNI_BCH_BatchUnitPrice").val() || "0").replace(/,/g, "")) || 0;

    let amount = qty * unitPrice;

    row.find(".JIRNI_BCH_BatchValue")
        .val(amount === 0 ? "" : formatIndianCurrency(amount))
        .attr("data-value", amount);

    CalculateBatchFooter();
}

// Load footer totals on page load
$(function () {
    CalculateBatchFooter();
});

$(document).ready(function () {
    //$(document).on("input", ".JIRNI_BCH_BatchQty, .JIRNI_BCH_BatchUnitPrice", function () {

    //    let value = parseFloat(($(this).val() || "").replace(/,/g, "")) || 0;

    //    $(this).attr("data-value", value);

    //    let row = $(this).closest("tr");

    //    CalculateBatchRow(row);
    //});

    // ✅ Add Row Button
    $("#IBatNewRowButton").click(function () {

        var lastRow = $("#IBatTableBody tr.IBatNewRow").last();

        if (lastRow.length === 0 || CheckAllValid(lastRow)) {
            IBatNewRow();
        }


        CalculateBatchFooter();
    });
    $("#IBatCloseButton").click(function () {

        if (!ValidateBatchQty()) {

            bootstrap.Modal
                .getInstance(document.getElementById("IBatch"))
                ?.hide();

            return false;
        }

        SaveTempBatch();
    });
    $(document).on("click", ".ItemBatch", function () {
        //  e.preventDefault();
        //console.log("ROW ID :", rowID);
        //  AssignItemRowID();

        let checkedRows =
            $("#TableBody .CheckItem:checked")
                .closest("tr.NewRow");

        if (checkedRows.length !== 1) {
            alert("Please select one item");
            return;
        }

        let selectedRow =
            checkedRows.first();
        let itemNumber =
            selectedRow.find(".JIRNI_Item_Number").val();
        let WH_Number =
            selectedRow.find(".JIRNI_WH_Number").val();

        let unitPrice =
            selectedRow.find(".JIRNI_UnitPrice").val();
        CurrentBatchItemRow =
            selectedRow;

        let rowIndex =
            selectedRow.index();

        console.log("OPEN rowIndex:", rowIndex);
        console.log("BatchMap:", BatchMap);

        $("#IBatTableBody")
            .find("tr.IBatNewRow")
            .remove();

        let rowBatches =
            BatchMap[rowIndex] || [];

        console.log("Fetched:", rowBatches);
        //#region bind other batch
        BindOtherBatch(WH_Number, itemNumber, rowIndex);
        //#endregion
        if (rowBatches.length === 0) {

            IBatNewRow();

            $("#IBatTableBody tr.IBatNewRow:last")
                .find(".RNI_BCH_Item_Number")
                .val(itemNumber);
            $("#IBatTableBody tr.IBatNewRow:last")
                .find(".JIRNI_BCH_BatchUnitPrice")
                .attr("data-value", unitPrice)
                .val(unitPrice)
                .prop("readonly", true);
        }
        else {

            $.each(rowBatches, function (_, batch) {

                IBatNewRow();

                let newRow =
                    $("#IBatTableBody tr.IBatNewRow:last");

                newRow.find(".RNI_BCH_Item_Number")
                    .val(itemNumber);

                newRow.find(".JIRNI_BCH_BatchDate")
                    .val(batch.Date);

                newRow.find(".JIRNI_BCH_Number")
                    .val(batch.BatchNo);

                newRow.find(".JIRNI_BCH_BatchQty")
                    .val(batch.JIRNI_Qty);

                newRow.find(".JIRNI_BCH_BatchUnitPrice")
                    .val(unitPrice)
                    .attr("data-value", unitPrice)
                    .prop("readonly", true);

                newRow.find(".JIRNI_BCH_BatchValue")
                    .val(batch.JIRNI_Amount);

                newRow.find(".RNI_BCH_Item_WH")
                    .val(batch.Warehouse);
            });

            // Add one empty row after existing batches
            IBatNewRow();

            $("#IBatTableBody tr.IBatNewRow:last")
                .find(".RNI_BCH_Item_Number")
                .val(itemNumber);
            $("#IBatTableBody tr.IBatNewRow:last")
                .find(".JIRNI_BCH_BatchUnitPrice")
                .val(unitPrice)
                .attr("data-value", unitPrice)
                .prop("readonly", true);
        }

        let qtyPopup =
            $("#TableBody .CheckItem:checked")
                .closest("tr.NewRow")
                .find(".JIRNI_Qty")
                .val();

        $("#RNI_BATCHQty").text(qtyPopup);



        //#region logic for mismatch qty

        var currentItemGridSelectedRow =
            GetCheckedRowId_RN();

        ApplyBatchValues_RN(currentItemGridSelectedRow);

        //#endregion
        setTimeout(function () {

            $("#IBatTableBody tr.IBatNewRow:last")
                .find(".JIRNI_BCH_Number")
                .focus();

        }, 200);
        $("#IBatNewRowButton").trigger("click");
        let lastRow = $("#IBatTableBody tr.IBatNewRow:last");

        lastRow.find(".RNI_BCH_Item_Number").val(itemNumber);
        lastRow.find(".JIRNI_BCH_BatchUnitPrice").val(unitPrice).attr("data-value", unitPrice).prop("readonly", true);
        CalculateBatchFooter();

        SetModalWidth(GetTableWidth("#BatchTable"), "#IBatch");
        new bootstrap.Modal($("#IBatch")).show();


    });

    $(document).on("click", "#btnClearAll", function () {
        ClearAll();
    });
});



//#region otherbatch bind
function AssignItemRowID() {

    $("#ItemTable tbody tr.NewRow").each(function () {

        let rowID =
            $(this).attr("data-rowid");

        // ADD ONLY IF NOT EXISTS
        if (!rowID || rowID === '1') {

            rowID =
                new Date().getTime() +
                Math.floor(Math.random() * 1000);

            $(this).attr(
                "data-rowid",
                rowID
            );
        }

    });

}
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
    if (response.length === 0) {
        tbody.append(`
        <tr class="DeliveryNoteOtherBatchRow">
            <td style="height:25px;"></td>
            <td></td>
            <td></td>
            <td>0</td>
            <td>0</td>
            <td>0</td>
        </tr>
    `);
        return;
    }

    CalculateOtherBatchFooter();
}
function CalculateOtherBatchFooter() {

    let totalQty = 0;
    let totalValue = 0;

    $("#DeliveryNoteOtherBatchTableBody .DeliveryNoteOtherBatchRow").each(function () {

        totalQty += parseFloat($(this)
            .find(".JIDNI_BCH_AvailableQty").val()) || 0;

        totalValue += parseFloat($(this)
            .find(".JIDNI_BCH_BatchValue").val()) || 0;
    });

    $("#TotalBatchQtyOther").val(totalQty.toFixed(2));
    $("#TotalBatchValueOther").val(totalValue.toFixed(2));

    if ($("#DeliveryNoteOtherBatchTableBody .DeliveryNoteOtherBatchRow").length > 0)
        $("#DeliveryNoteOtherBatchList tfoot").show();
    else
        $("#DeliveryNoteOtherBatchList tfoot").hide();
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
//#endregion

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