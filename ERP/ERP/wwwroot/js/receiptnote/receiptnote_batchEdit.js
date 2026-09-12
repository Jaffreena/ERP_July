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
function CloseIBatchModal() {

    const modal = $("#IBatch");

    modal.one("hidden.bs.modal", function () {

        // Remove any remaining backdrops
        $(".modal-backdrop").remove();

        // Reset body
        $("body").removeClass("modal-open");
        $("body").css({
            "overflow": "",
            "padding-right": ""
        });

        // Ensure modal is hidden
        modal.removeClass("show")
            .css("display", "none")
            .attr("aria-hidden", "true");
    });

    modal.modal("hide");

    // Force cleanup if hidden event doesn't fire
    setTimeout(function () {

        $(".modal-backdrop").remove();

        $("body").removeClass("modal-open");
        $("body").css({
            "overflow": "",
            "padding-right": ""
        });

        modal.removeClass("show")
            .css("display", "none")
            .attr("aria-hidden", "true");

    }, 500);
}
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

    //console.log("InvoiceQty :", InvoiceQty);
    //console.log("BatchQty :", BatchQty);

    let rowId = GetCheckedRowId_RN_Edit();

    // console.log("Selected Item :", rowId);

    // Always store the current batch details
    StoreBatchMismatch_RN(rowId);

    if (InvoiceQty !== BatchQty) {

        alert("Qty Mismatch !");
        StoreWrongBatchMismatch_RN_Edit(rowId)
        CloseIBatchModal();
        CloseModal_RN();

        return false;
    } else {
        RemoveWrongBatchMismatch_RN(rowId);
    }

    return true;
}

function RemoveWrongBatchMismatch_RN(rowId) {

    batchWrongMismatchData_RN = batchWrongMismatchData_RN.filter(x => x.rowId != rowId);

    //  console.log(batchWrongMismatchData_RN);
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
        .find(".JIRNI_Item_Number")
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
                RNI_BCH_Date: $(this).find(".JIRNI_BCH_BatchDate").val(),

                RNI_BCH_No: $(this).find(".form-control.JIRNI_BCH_Number").val(),

                RNI_BCH_Number: $(this).find(".JIRNI_BCH_Number:not(.form-control)").val(),

                RNI_BCH_Item_Number: itemNumber,

                RNI_BCH_WH_Number: $(this).find(".RNI_BCH_WH_Number").val(),


                RNI_BCH_Qty: $(this).find(".JIRNI_BCH_BatchQty").val(),

                RNI_BCH_UsedQty: $(this).find(".RNI_BCH_UsedQty").val(),

                RNI_BCH_AmendQty: $(this).find(".RNI_BCH_AmendQty").val(),

                RNI_BCH_UnitPrice: $(this).find(".JIRNI_BCH_BatchUnitPrice").val(),

                RNI_BCH_Value: $(this).find(".JIRNI_BCH_BatchValue").val(),

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

    // console.log(batchWrongMismatchData_RN);
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
    let jirniNumber = $("#TableBody tr.NewRow")
        .eq(rowId - 1)
        .find(".JIRNI_Number")
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
            //console.log({
            //    Qty: $(this).find(".JIRNI_BCH_BatchQty").val(),
            //    AmendQty: $(this).find(".RNI_BCH_AmendQty").val(),
            //    UnitPrice: $(this).find(".JIRNI_BCH_BatchUnitPrice").val(),
            //    Value: $(this).find(".JIRNI_BCH_BatchValue").val()
            //});
            batchValues.push({
                JIRNI_Number: jirniNumber,

                RNI_BCH_Date: $(this).find(".JIRNI_BCH_BatchDate").val(),

                RNI_BCH_No: $(this).find(".form-control.JIRNI_BCH_Number").val(),

                RNI_BCH_Number: $(this).find(".JIRNI_BCH_Number:not(.form-control)").val(),

                RNI_BCH_Item_Number: itemNumber,

                RNI_BCH_WH_Number: whNumber,
                RNI_BCH_Qty: removeCommas($(this).find(".JIRNI_BCH_BatchQty").val()),
                RNI_BCH_OriginalQty: removeCommas($(this).find(".RNI_BCH_OriginalQty").val()),
                RNI_BCH_UsedQty: removeCommas($(this).find(".RNI_BCH_UsedQty").val()),
                RNI_BCH_AmendQty: removeCommas($(this).find(".RNI_BCH_AmendQty").val()),
                RNI_BCH_UnitPrice: removeCommas($(this).find(".JIRNI_BCH_BatchUnitPrice").val()),
                RNI_BCH_Value: removeCommas($(this).find(".JIRNI_BCH_BatchValue").val()),

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
    //console.log("Saving RowId :", rowId);
    //console.log("Saved Batch Data:", JSON.stringify(batchMismatchData_RN));
    //console.log("Saved Batch:", batchValues[batchValues.length - 1]);
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
        row.find(".JIRNI_BCH_BatchDate")
            .val(batch.RNI_BCH_Date);

        row.find(".form-control.JIRNI_BCH_Number")
            .val(batch.RNI_BCH_No);

        row.find(".JIRNI_BCH_BatchQty")
            .val(batch.RNI_BCH_Qty);

        row.find(".JIRNI_BCH_BatchUnitPrice")
            .val(batch.RNI_BCH_UnitPrice)
            .attr("data-value", batch.RNI_BCH_UnitPrice);
        row.find(".JIRNI_BCH_BatchValue")
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

        totalQty += parseFloat(($(this).find(".JIRNI_BCH_BatchQty").val() || "").replace(/,/g, "")) || 0;

        totalUsedQty += parseFloat(($(this).find(".RNI_BCH_UsedQty").val() || "").replace(/,/g, "")) || 0;

        totalAmendQty += parseFloat(($(this).find(".RNI_BCH_AmendQty").val() || "").replace(/,/g, "")) || 0;

        totalValue += parseFloat(($(this).find(".JIRNI_BCH_BatchValue").val() || "").replace(/,/g, "")) || 0;

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

    if ($.trim(row.find(".JIRNI_BCH_BatchDate").val()) === "")
        return false;

    if ($.trim(row.find(".form-control.JIRNI_BCH_Number").val()) === "")
        return false;

    if ($.trim(row.find(".RNI_BCH_AmendQty").val()) === "" ||
        parseFloat(row.find(".RNI_BCH_AmendQty").val()) <= 0)
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
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Date");

    row.find("input.RNI_BCH_No")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_No");

    row.find("input.RNI_BCH_Qty")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Qty");
    row.find("input.RNI_BCH_OriginalQty")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_OriginalQty");

    row.find("input.RNI_BCH_UsedQty")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_UsedQty");

    row.find("input.RNI_BCH_AmendQty")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_AmendQty");
    row.find("input.JIRNI_BCH_BatchUnitPrice")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_UnitPrice")
        .val(unitPrice)
        .attr("data-value", unitPrice)
        .prop("readonly", true);

    row.find("input.JIRNI_BCH_BatchValue")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Value");

    row.find("input.RNI_BCH_IsDeleted")
        .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_IsDeleted")
        .val("false");

    $("#IBatTableBody").append(row);

    row.data("isValid", false);

    // NEW: flatpickr never auto-attaches to cloned rows
    row.find(".JIRNI_BCH_BatchDate").flatpickr({
        dateFormat: "d-M-Y",
        altInput: true,
        altFormat: "d-M-Y",
        allowInput: true
    });

    row.find(".form-control.JIRNI_BCH_Number").focus();

    return row;
}


function SaveTempBatch() {

    if (!CurrentBatchItemRow)
        return;

    let rowIndex =
        CurrentBatchItemRow.index();
    let itemNumber =
        CurrentBatchItemRow.find(".JIRNI_Item_Number").val();
    /* console.log("SAVE rowIndex:", rowIndex);*/

    let batchList = [];

    $("#IBatTableBody tr.IBatNewRow").each(function () {

        let row =
            $(this);

        let batchDate =
            row.find(".JIRNI_BCH_BatchDate").val();

        let batchNo =
            row.find(".form-control.JIRNI_BCH_Number").val();

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

    //  console.log("batchList:", batchList);

    BatchMap[rowIndex] =
        batchList;

    //console.log("After Save:", BatchMap);
    //console.log("After SaveTempBatch:", batchMismatchData_RN);
    bootstrap.Modal
        .getInstance(document.getElementById("IBatch"))
        ?.hide();
}


function CalculateBatchRow(row) {

    let qty = parseFloat((row.find(".RNI_BCH_AmendQty").val() || "").replace(/,/g, "")) || 0;

    let unitPrice = parseFloat((row.find(".JIRNI_BCH_BatchUnitPrice").val() || "").replace(/,/g, "")) || 0;

    let amount = qty * unitPrice;

    row.find(".JIRNI_BCH_BatchValue")
        .val(amount === 0 ? "" : formatIndianCurrency(amount));

    CalculateBatchFooter_Edit();
}

// Load footer totals on page load
$(function () {
    CalculateBatchFooter_Edit();
});

$(document).ready(function () {
    $(document).on("keyup change", ".RNI_BCH_AmendQty", function () {

        CalculateBatchRow($(this).closest("tr"));

    });
    $(document).on("focusout", ".RNI_BCH_AmendQty", function () {

        let row = $(this).closest("tr");

        let originalQty = Math.abs(parseFloat((row.find(".JIRNI_BCH_BatchQty").val() || "0").replace(/,/g, "")) || 0);

        let usedQty = Math.abs(parseFloat((row.find(".RNI_BCH_UsedQty").val() || "0").replace(/,/g, "")) || 0);

        let amendQty = parseFloat(($(this).val() || "0").replace(/,/g, "")) || 0;

        if (amendQty < usedQty) {

            alert("Amend Qty cannot be less than " + formatIndianQty(usedQty));

            $(this).val(formatIndianQty(originalQty));

            CalculateBatchFooter_Edit();

            $(this).focus().select();

            return;
        }
        $(this).val(formatIndianQty(amendQty));
        CalculateBatchFooter_Edit();
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



            return false;
        }
        // console.log("Before SaveTempBatch:", batchMismatchData_RN);
        SaveTempBatch();
        CloseIBatchModal();
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
            selectedRow.find(".JIRNI_Item_Number").val();

        let unitPrice =
            selectedRow.find(".JIRNI_UnitPrice").val();
        let itemQty =
            selectedRow.find(".AmendQty").val();
        CurrentBatchItemRow =
            selectedRow;
        let WH_Number =
            selectedRow.find(".JIRNI_WH_Number").val();
        let rowIndex = selectedRow.index();
        let rowId = GetCheckedRowId_RN_Edit();

        //console.log("OPEN rowIndex :", rowIndex);
        //console.log("OPEN rowId    :", rowId);
        //console.log("BatchMap :", BatchMap);

        $("#IBatTableBody")
            .find("tr.IBatNewRow")
            .remove();

        $("#RNI_BATCHQty").text(itemQty);

        let batches = [];

        if (jirniNumber > 0) {

            let item = batchMismatchData_RN.find(function (x) {

                return x.batchValues.length > 0 &&
                    x.batchValues[0].JIRNI_Number == jirniNumber;

            });

            batches = item ? item.batchValues : [];
        }
        else {

            // Use rowId instead of rowIndex
            batches = GetBatchValues_RN(rowId);

        }


        //console.log("Fetched Batches :", batches);

        //console.log("Fetched:", batches);
        // console.log("Fetched Count:", batches.length);
        //  console.log("First Batch:", batches[0]);
        BindBatchPopup(
            batches,
            itemNumber,
            unitPrice,
            selectedRow
        );
        setTimeout(function () {
            BindOtherBatch(WH_Number, itemNumber, rowIndex);

        }, 100);

        return;


    });


    $(document).on("click", "#btnClearAll", function () {
        ClearAll();
    });

});
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
    $("#DeliveryNoteOtherBatchList").show();
    $("#Other-tab-pane").show();
    $(".tab-scroll").css({
        height: "300px",
        overflowY: "auto"
    });
    console.log($("#Other-tab-pane").css("display"));
    console.log($("#Other-tab-pane").height());
    console.log($("#Other-tab-pane").is(":visible"));

    console.log($(".tab-content").height());
    console.log($(".tab-body").height());

    console.log($("#DeliveryNoteOtherBatchList")[0].offsetHeight);
    console.log($("#DeliveryNoteOtherBatchTableBody")[0].offsetHeight);

    console.log($("#DeliveryNoteOtherBatchList").parent()[0].offsetHeight);
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

            // console.log(response);
            BindDeliveryNoteOtherBatchTable(response);





        },

        error: function (xhr, status, error) {

            //  console.log("Status:", status);
            //    console.log("Error:", error);
            //    console.log("Response Text:", xhr.responseText);

            alert("Error loading batch details");
        }

    });

    //#endregion
}
//#endregion
function BindBatchPopup(rowBatches, itemNumber, unitPrice, selectedRow) {

    if (rowBatches.length === 0) {

        IBatNewRow();

        $("#IBatTableBody tr.IBatNewRow:last")
            .find(".RNI_BCH_Item_Number")
            .val(itemNumber);

        $("#IBatTableBody tr.IBatNewRow:last")
            .find(".JIRNI_BCH_BatchUnitPrice")
            .val(unitPrice == 0 ? "" : formatIndianCurrency(unitPrice))
            .attr("data-value", unitPrice)
            .prop("readonly", true);
    }
    else {

        $.each(rowBatches, function (_, batch) {

            IBatNewRow();

            let newRow = $("#IBatTableBody tr.IBatNewRow:last");

            newRow.find(".RNI_BCH_Item_Number")
                .val(batch.RNI_BCH_Item_Number);

            newRow.find(".JIRNI_BCH_BatchDate")
                .val(FormatBatchDate(batch.RNI_BCH_Date));

            newRow.find(".form-control.JIRNI_BCH_Number")
                .val(batch.RNI_BCH_No);

            // Qty
            newRow.find(".JIRNI_BCH_BatchQty")
                .val(batch.RNI_BCH_Qty ? formatIndianQty(batch.RNI_BCH_Qty) : "0");

            // Unit Price
            newRow.find(".JIRNI_BCH_BatchUnitPrice")
                .val(batch.RNI_BCH_UnitPrice ? formatIndianCurrency(batch.RNI_BCH_UnitPrice) : "0.00")
                .attr("data-value", batch.RNI_BCH_UnitPrice)
                .prop("readonly", true);

            newRow.find(".JIRNI_BCH_BatchValue")
                .val(batch.RNI_BCH_Value ? formatIndianCurrency(batch.RNI_BCH_Value) : "0.00");

            // Warehouse
            newRow.find(".RNI_BCH_Item_WH")
                .val(batch.RNI_BCH_WH_Number);

            // Hidden Fields
            newRow.find(".JIRNI_BCH_Number:not(.form-control)")
                .val(batch.RNI_BCH_Number);

            newRow.find(".JIRNI_BCH_JIRNI_Number")
                .val(batch.JIRNI_Number);

            // Qty Details
            // NOTE: "Original Qty" column's actual field class is
            // .JIRNI_BCH_BatchQty (set above) — there is no separate
            // .RNI_BCH_OriginalQty field in the DOM, so batch.RNI_BCH_Qty
            // (which already reads .JIRNI_BCH_BatchQty) is the real
            // Original Qty value.
            newRow.find(".RNI_BCH_UsedQty")
                .val(batch.RNI_BCH_UsedQty ? formatIndianQty(batch.RNI_BCH_UsedQty) : "0");

            newRow.find(".RNI_BCH_AmendQty")
                .val(batch.RNI_BCH_Qty ? formatIndianQty(batch.RNI_BCH_Qty) : "0");


        });

        CalculateBatchFooter_Edit();
        SetModalWidth(GetTableWidth("#BatchTable"), "#IBatch");
        new bootstrap.Modal($("#IBatch")).show();

    }

    let qtyPopup = selectedRow.find(".AmendQty").val();


    $("#RNI_BATCHQty").text(qtyPopup);
    var currentItemGridSelectedRow = GetCheckedRowId_RN_Edit();

    //  ApplyBatchValues_RN_Edit(currentItemGridSelectedRow);

    setTimeout(function () {

        $("#IBatTableBody tr.IBatNewRow:last")
            .find(".form-control.JIRNI_BCH_Number")
            .focus();

    }, 200);
    //console.log("No:",
    //   $("#IBatTableBody tr.IBatNewRow:first .RNI_BCH_No").val());

    //console.log("AmendQty:",
    //  $("#IBatTableBody tr.IBatNewRow:first .RNI_BCH_AmendQty").val());

    new bootstrap.Modal($("#IBatch")).show();
    setTimeout(function () {

        // console.log("After Modal No:",
        //   $("#IBatTableBody tr.IBatNewRow:first .RNI_BCH_No").val());

        //  console.log("After Modal AmendQty:",
        //    $("#IBatTableBody tr.IBatNewRow:first .RNI_BCH_AmendQty").val());

    }, 100);
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