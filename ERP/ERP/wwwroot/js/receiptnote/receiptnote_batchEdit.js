function FormatBatchDate(date) {

    if (!date) return "";

    let d = new Date(date);

    let day = String(d.getDate()).padStart(2, "0");

    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let month = months[d.getMonth()];

    let year = d.getFullYear();

    return `${day}-${month}-${year}`;
}
$(document).on("keyup", ".RNI_BCH_AmendQty", function () {

    CalculateBatchFooter_Edit();

});
let BatchMap = {};
let CurrentBatchItemRow = null;
let batchMismatchData_RN = [];
let batchWrongMismatchData_RN = [];

$(document).on("click", ".IBatRowRemove", function () {

    $(this).closest("tr").remove();

    CalculateBatchFooter_Edit();
});
function ValidateBatchQty() {

    let InvoiceQty =
        parseFloat(removeCommas($("#RNI_BATCHQty").text())) || 0;

    let BatchQty = $("#IBatTableBody tr")
        .not("#IBatTempRow")
        .map(function () {

            return parseFloat(
                removeCommas(
                    $(this).find(".RNI_BCH_AmendQty").val()
                )
            ) || 0;

        }).get()
        .reduce((sum, qty) => sum + qty, 0);

    console.log("InvoiceQty :", InvoiceQty);
    console.log("BatchQty :", BatchQty);

    let rowId = GetCheckedRowId_RN_Edit();

    console.log("Selected Item :", rowId);

    // Always store the current batch details
    StoreBatchMismatch_RN(rowId);

    if (InvoiceQty !== BatchQty) {

        alert("Qty Mismatch !");
        StoreWrongBatchMismatch_RN_Edit(rowId)
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

            FocusItemGridQty_RN_Edit();

        }, 500);

    });

    modal.modal("hide");
}

//#region Focus Item Grid Qty

function FocusItemGridQty_RN_Edit() {

    let selectedRow =
        $("#TableBody .CheckItem:checked")
            .closest("tr.NewRow");

    if (selectedRow.length !== 1)
        return;

    let QtyInput =
        selectedRow.find(".AmendQty");

    if (QtyInput.length > 0) {

        QtyInput.focus();

        QtyInput.select();
    }
}

//#endregion


//#region Batch Mismatch

function StoreWrongBatchMismatch_RN_Edit(rowId) {

    let batchValues = [];

    let itemNumber = $("#TableBody tr.NewRow")
        .eq(rowId - 1)
        .find(".Item_Number")
        .val();
    let jirniNumber = $("#TableBody tr.NewRow")
        .eq(rowId - 1)
        .find(".JIRNI_Number")
        .val();
    $("#IBatTableBody tr")
        .not("#IBatTempRow")
        .each(function () {

            if ($(this).find(".RNI_BCH_IsDeleted").val() === "true")
                return;

     

            batchValues.push({

                JIRNI_Number: jirniNumber,
                RNI_BCH_Date: $(this).find(".RNI_BCH_Date").val(),

                RNI_BCH_No: $(this).find(".RNI_BCH_No").val(),

                RNI_BCH_Number: $(this).find(".RNI_BCH_Number").val(),

                RNI_BCH_Item_Number: itemNumber,

                RNI_BCH_WH_Number: $(this).find(".RNI_BCH_WH_Number").val(),


                RNI_BCH_Qty: $(this).find(".RNI_BCH_Qty").val(),

                RNI_BCH_UsedQty: $(this).find(".RNI_BCH_UsedQty").val(),

                RNI_BCH_AmendQty: $(this).find(".RNI_BCH_AmendQty").val(),

                RNI_BCH_UnitPrice: $(this).find(".RNI_BCH_UnitPrice").val(),

                RNI_BCH_Value: $(this).find(".RNI_BCH_Value").val(),

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
}
 

function GetBatchValues_RN(rowId) {

    let item = batchMismatchData_RN.find(x => x.rowId == rowId);

    return item ? item.batchValues : [];

}


function StoreBatchMismatch_RN(rowId) {

    let batchValues = [];

    let itemNumber = $("#TableBody tr.NewRow")
        .eq(rowId - 1)
        .find(".Item_Number")
        .val();
    let jirniNumber = $("#TableBody tr.NewRow")
        .eq(rowId - 1)
        .find(".JIRNI_Number")
        .val();
    let whNumber = $("#TableBody tr.NewRow")
        .eq(rowId - 1)
        .find(".WH_Number")
        .val();
    $("#IBatTableBody tr")
        .not("#IBatTempRow")
        .each(function () {

            if ($(this).find(".RNI_BCH_IsDeleted").val() === "true")
                return;

            batchValues.push({
                JIRNI_Number: jirniNumber,

                RNI_BCH_Date: $(this).find(".RNI_BCH_Date").val(),

                RNI_BCH_No: $(this).find(".RNI_BCH_No").val(),

                RNI_BCH_Number: $(this).find(".RNI_BCH_Number").val(),

                RNI_BCH_Item_Number: itemNumber,

                RNI_BCH_WH_Number: whNumber,

                RNI_BCH_Qty: $(this).find(".RNI_BCH_Qty").val(),

                RNI_BCH_UnitPrice: $(this).find(".RNI_BCH_UnitPrice").val(),

                RNI_BCH_Value: $(this).find(".RNI_BCH_Value").val(),

                RNI_BCH_OriginalQty: $(this).find(".RNI_BCH_OriginalQty").val(),

                RNI_BCH_UsedQty: $(this).find(".RNI_BCH_UsedQty").val(),

                RNI_BCH_AmendQty: $(this).find(".RNI_BCH_AmendQty").val(),

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

 
function GetCheckedRowId_RN_Edit() {

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

function ApplyBatchValues_RN_Edit(rowId) {

    let batchValues = GetBatchValues_RN(rowId);

    $("#IBatTableBody tr")
        .not("#IBatTempRow")
        .remove();

    if (!batchValues.length) {

        CalculateBatchFooter_Edit();
        return;
    }

    $.each(batchValues, function (i, batch) {

        IBatNewRow();      // Your existing function which creates one batch row

        let row = $("#IBatTableBody tr")
            .not("#IBatTempRow")
            .last();
        row.find(".RNI_BCH_Item_Number")
            .val(batch.RNI_BCH_Item_Number);
        row.find(".RNI_BCH_Date")
            .val(batch.RNI_BCH_Date);

        row.find(".RNI_BCH_No")
            .val(batch.RNI_BCH_No);

        row.find(".RNI_BCH_Qty")
            .val(batch.RNI_BCH_Qty);

        row.find(".RNI_BCH_UnitPrice")
            .val(batch.RNI_BCH_UnitPrice);

        row.find(".RNI_BCH_Value")
            .val(batch.RNI_BCH_Value);

        row.find(".RNI_BCH_Item_WH")
            .val(batch.RNI_BCH_Item_WH);

    });

    CalculateBatchFooter_Edit();
}

//#endregion
//#region FOOTER TOTAL

function CalculateBatchFooter_Edit() {

    let totalQty = 0;
    let totalUsedQty = 0;
    let totalAmendQty = 0;
    let totalValue = 0;

    $("#IBatTableBody tr.IBatNewRow").each(function () {

        totalQty += parseFloat(($(this).find(".RNI_BCH_Qty").val() || "").replace(/,/g, "")) || 0;

        totalUsedQty += parseFloat(($(this).find(".RNI_BCH_UsedQty").val() || "").replace(/,/g, "")) || 0;

        totalAmendQty += parseFloat(($(this).find(".RNI_BCH_AmendQty").val() || "").replace(/,/g, "")) || 0;

        totalValue += parseFloat(($(this).find(".RNI_BCH_Value").val() || "").replace(/,/g, "")) || 0;

    });

    $("#BatchTotalQty").val(totalQty === 0 ? "" : formatIndianQty(totalQty));

    $("#BatchUsedQty").val(totalUsedQty === 0 ? "" : formatIndianQty(totalUsedQty));

    $("#BatchQty").val(totalAmendQty === 0 ? "" : formatIndianQty(totalAmendQty));

    $("#BatchTotalValue").val(totalValue === 0 ? "" : formatIndianCurrency(totalValue));
}

//#endregion

//#endregion
function CheckAllValid(row) {

    if (row.length === 0)
        return true;

    if ($.trim(row.find(".RNI_BCH_Date").val()) === "")
        return false;

    if ($.trim(row.find(".RNI_BCH_No").val()) === "")
        return false;

    if ($.trim(row.find(".RNI_BCH_Qty").val()) === "" ||
        parseFloat(row.find(".RNI_BCH_Qty").val()) <= 0)
        return false;

    if ($.trim(row.find(".RNI_BCH_UnitPrice").val()) === "")
        return false;

    return true;
}


function IBatNewRow() {

    var browCount = $("#IBatTableBody tr.IBatNewRow").length;

    var previousRow = $("#IBatTableBody tr.IBatNewRow:last");

    var unitPrice = previousRow.length
        ? previousRow.find(".RNI_BCH_UnitPrice").val()
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

    row.find("input.RNI_BCH_Date")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Date");

    row.find("input.RNI_BCH_No")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_No");

    row.find("input.RNI_BCH_Qty")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Qty");

    row.find("input.RNI_BCH_UnitPrice")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_UnitPrice")
        .val(unitPrice)
        .prop("readonly", true);

    row.find("input.RNI_BCH_Value")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Value");

    row.find("input.RNI_BCH_IsDeleted")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_IsDeleted")
        .val("false");

    $("#IBatTableBody").append(row);

    row.data("isValid", false);

    row.find(".RNI_BCH_No").focus();

    return row;
}


function SaveTempBatch() {

    if (!CurrentBatchItemRow)
        return;

    let rowIndex =
        CurrentBatchItemRow.index();
    let itemNumber =
        CurrentBatchItemRow.find(".Item_Number").val();
    console.log("SAVE rowIndex:", rowIndex);

    let batchList = [];

    $("#IBatTableBody tr.IBatNewRow").each(function () {

        let row =
            $(this);

        let batchDate =
            row.find(".RNI_BCH_Date").val();

        let batchNo =
            row.find(".RNI_BCH_No").val();

        let qty =
            parseFloat(
                row.find(".RNI_BCH_Qty").val()
            ) || 0;

        let unitPrice =
            parseFloat(
                row.find(".RNI_BCH_UnitPrice").val()
            ) || 0;

        let amount =
            parseFloat(
                row.find(".RNI_BCH_Value").val()
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

    let qty = parseFloat((row.find(".RNI_BCH_Qty").val() || "").replace(/,/g, "")) || 0;
    let unitPrice = parseFloat((row.find(".RNI_BCH_UnitPrice").val() || "").replace(/,/g, "")) || 0;

    let amount = qty * unitPrice;

    row.find(".RNI_BCH_Value").val(amount === 0 ? "" : formatIndianCurrency(amount));

    CalculateBatchFooter_Edit();
}

// Load footer totals on page load
$(function () {
    CalculateBatchFooter_Edit();
});

$(document).ready(function () {
    $(document).on("focusout", ".RNI_BCH_AmendQty", function () {
        let value = $(this).val();
        $(this).val(formatIndianQty(value));
        CalculateBatchFooter_Edit();
    });
    $(document).on("input", ".RNI_BCH_Qty, .RNI_BCH_UnitPrice", function () {

        let row = $(this).closest("tr");

        CalculateBatchRow(row);
    });
   
    // ✅ Add Row Button
    $("#IBatNewRowButton").click(function () {

        var lastRow = $("#IBatTableBody tr.IBatNewRow").last();

        if (lastRow.length === 0 || CheckAllValid(lastRow)) {
            IBatNewRow();
        }
        else {
            alert("Please complete all fields!");
        }

        CalculateBatchFooter_Edit();
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

        let checkedRows =
            $("#TableBody .CheckItem:checked")
                .closest("tr.NewRow");

        if (checkedRows.length !== 1) {
            alert("Please select one item");
            return;
        }

        let selectedRow =
            checkedRows.first();

        let jirniNumber =
            parseInt(selectedRow.find(".JIRNI_Number").val() || 0);

        let itemNumber =
            selectedRow.find(".Item_Number").val();

        let unitPrice =
            selectedRow.find(".UnitPrice").val();
        let itemQty =
            selectedRow.find(".AmendQty").val();
        CurrentBatchItemRow =
            selectedRow;

        let rowIndex =
            selectedRow.index();

        console.log("OPEN rowIndex:", rowIndex);
        console.log("BatchMap:", BatchMap);

        $("#IBatTableBody")
            .find("tr.IBatNewRow")
            .remove();
        $("#RNI_BATCHQty").text(itemQty);
        //=========================================================
        // Load Batch Popup from batchMismatchData_RN
        //=========================================================

        let batches = [];

        if (jirniNumber > 0) {

            // Existing item - find by JIRNI_Number
            let item = batchMismatchData_RN.find(function (x) {

                return x.batchValues.length > 0 &&
                    x.batchValues[0].JIRNI_Number == jirniNumber;

            });

            batches = item ? item.batchValues : [];
        }
        else {

            // New item - find by rowId
            batches = GetBatchValues_RN(rowIndex);

        }

        console.log("Fetched:", batches);

        BindBatchPopup(
            batches,
            itemNumber,
            unitPrice,
            selectedRow
        );

        return;

       
    });
    $(document).on("click", "#btnClearAll", function () {
        ClearAll();
    });
});
function BindBatchPopup(rowBatches, itemNumber, unitPrice, selectedRow) {

    if (rowBatches.length === 0) {

        IBatNewRow();

        $("#IBatTableBody tr.IBatNewRow:last")
            .find(".RNI_BCH_Item_Number")
            .val(itemNumber);

        $("#IBatTableBody tr.IBatNewRow:last")
            .find(".RNI_BCH_UnitPrice")
            .val(unitPrice == 0 ? "" : formatIndianCurrency(unitPrice))
            .prop("readonly", true);
    }
    else {

        $.each(rowBatches, function (_, batch) {

            IBatNewRow();

            let newRow = $("#IBatTableBody tr.IBatNewRow:last");

            newRow.find(".RNI_BCH_Item_Number")
                .val(batch.RNI_BCH_Item_Number);

            newRow.find(".RNI_BCH_Date")
                .val(FormatBatchDate(batch.RNI_BCH_Date));

            newRow.find(".RNI_BCH_No")
                .val(batch.RNI_BCH_No);

            newRow.find(".RNI_BCH_Number")
                .val(batch.RNI_BCH_Number);

            newRow.find(".RNI_BCH_Qty")
                .val(batch.RNI_BCH_Qty == 0 ? "" : formatIndianQty(batch.RNI_BCH_Qty));

            newRow.find(".RNI_BCH_UnitPrice")
                .val(batch.RNI_BCH_UnitPrice == 0 ? "" : formatIndianCurrency(batch.RNI_BCH_UnitPrice))
                .prop("readonly", true);

            newRow.find(".RNI_BCH_Value")
                .val(batch.RNI_BCH_Value == 0 ? "" : formatIndianCurrency(batch.RNI_BCH_Value));

            newRow.find(".RNI_BCH_Item_WH")
                .val(batch.RNI_BCH_WH_Number);

            // Hidden fields
            newRow.find(".JIRNI_BCH_Number")
                .val(batch.RNI_BCH_Number);

            newRow.find(".JIRNI_BCH_JIRNI_Number")
                .val(batch.JIRNI_Number);

            newRow.find(".RNI_BCH_OriginalQty")
                .val(batch.RNI_BCH_OriginalQty == 0 ? "" : formatIndianQty(batch.RNI_BCH_OriginalQty));

            newRow.find(".RNI_BCH_UsedQty")
                .val(batch.RNI_BCH_UsedQty == 0 ? "" : formatIndianQty(batch.RNI_BCH_UsedQty));

            newRow.find(".RNI_BCH_AmendQty")
                .val(batch.RNI_BCH_OriginalQty == 0 ? "" : formatIndianQty(batch.RNI_BCH_OriginalQty));
        });

        CalculateBatchFooter_Edit();
    }

    let qtyPopup = selectedRow.find(".AmendQty").val();

    $("#RNI_BATCHQty").text(qtyPopup);

    var currentItemGridSelectedRow = GetCheckedRowId_RN_Edit();

    // ApplyBatchValues_RN(currentItemGridSelectedRow);

    setTimeout(function () {

        $("#IBatTableBody tr.IBatNewRow:last")
            .find(".RNI_BCH_No")
            .focus();

    }, 200);

    new bootstrap.Modal($("#IBatch")).show();
}

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


