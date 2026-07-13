var TempBatch = {};

let BatchMap_P = {};
let CurrentBatchItemRow_P = null; 
let batchMismatchData_P = [];


function ValidateBatchQty_P() {

    let InvoiceQty =
        parseFloat(removeCommas($("#RNI_BATCHQty_P").text())) || 0;

    let BatchQty = $("#IBatTableBody_P tr")
        .not("#IBatTempRow")
        .map(function () {

            return parseFloat(
                removeCommas(
                    $(this).find(".RNI_BCH_Qty").val()
                )
            ) || 0;

        }).get()
        .reduce((sum, qty) => sum + qty, 0);

    console.log("InvoiceQty :", InvoiceQty);
    console.log("BatchQty :", BatchQty);

    if (InvoiceQty !== BatchQty) {

        alert("Qty Mismatch !");
        var ItemGridRowSelected = GetCheckedRowId_P();
        console.log('----ItemGridRowSelected--------' + ItemGridRowSelected)
        StoreBatchMismatch_P(ItemGridRowSelected);
        CloseModal();


        return false;
    } else {

        let rowId = GetCheckedRowId_P();

        batchMismatchData_P =
            batchMismatchData_P.filter(x => x.rowId !== rowId);
    }

    return true;
}
function CloseModal() {

    const modal = $("#IBatch");

    modal.one("hidden.bs.modal", function () {

        setTimeout(function () {
            FocusItemGridQty_P();
        }, 500);

    });

    modal.modal("hide");
}
//#region  focus item grid on qty mismatch
function FocusItemGridQty_P() {

    if (!CurrentBatchItemRow_P)
        return;

    let rowID =
        CurrentBatchItemRow_P.attr("data-rowid");

    let QtyInput =
        $("#TableBody_P")
            .find(`tr[data-rowid='${rowID}']`)
            .find(".JIDNI_Qty");

    if (QtyInput.length > 0) {

        QtyInput.focus();
        QtyInput.select();

    }

}
//#endregion
//#region get item checked row
function GetBatchValues_P(rowId) {

    let row = batchMismatchData_P.find(x => x.rowId === rowId);

    return row ? row.batchValues : [];
}
function StoreBatchMismatch_P(rowId) {

    let batchValues = $("#IBatTableBody_P tr")
        .not("#IBatTempRow")
        .map(function () {

            return {
                RNI_BCH_No: $(this).find(".RNI_BCH_No").val(),
                RNI_BCH_Qty: parseFloat(removeCommas($(this).find(".RNI_BCH_Qty").val())) || 0,
                RNI_BCH_UnitPrice: parseFloat(removeCommas($(this).find(".RNI_BCH_UnitPrice").val())) || 0,
                RNI_BCH_Value: parseFloat(removeCommas($(this).find(".RNI_BCH_Value").val())) || 0
            };

        }).get();

    batchMismatchData_P =
        batchMismatchData_P.filter(x => x.rowId !== rowId);

    batchMismatchData_P.push({
        rowId: rowId,
        batchValues: batchValues
    });

    console.log('-------batchMismatchData_P--------');
    console.log(batchMismatchData_P);
}
function GetCheckedRowId_P() {

    let rowId = -1;

    $("#TableBody_P tr.NewRow:visible").each(function (index) {

        if ($(this).find(".CheckItem").prop("checked")) {
            rowId = index + 1;
            return false; // break
        }
    });

    return rowId;
}
//#endregion


function SaveTempBatch_P() {

    if (!CurrentBatchItemRow_P)
        return;

    let rowIndex =
        CurrentBatchItemRow_P.index();

    console.log("SAVE rowIndex:", rowIndex);

    let batchList = [];

    $("#IBatTableBody_P tr.IBatNewRow").each(function () {

        let row =
            $(this);

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
            row.find(".RNI_BCH_WH_Number").val();

        if (batchNo) {

            batchList.push({

                BatchNo: batchNo,

                Qty: qty,

                UnitPrice: unitPrice,

                Amount: amount,

                Warehouse: wh

            });

        }
    });

    console.log("batchList:", batchList);

    BatchMap_P[rowIndex] =
        batchList;

    console.log("After Save:", BatchMap_P);

    bootstrap.Modal
        .getInstance(document.getElementById("IBatch"))
        ?.hide();
}


$(document).ready(function () {
    $(document).on("click", "#IBatTableBody_P input", function (e) {
        e.stopPropagation();

        let input = this;
        input.focus();

        setTimeout(function () {
            input.select();
        }, 10);
    });

    var browCount = productionBatchRowCount;
    var isbAddingRow = false;

    function IBatNewRow() {

        var row = $("#IBatTableBody_P #IBatTempRow").clone()
            .removeAttr("style")
            .removeAttr("id")
            .addClass("IBatNewRow");

        row.find("input.RNI_BCH_Item_Number")
            .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Item_Number");

        row.find("input.RNI_BCH_Item_Index")
            .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Item_Index");

        row.find("input.RNI_BCH_Date")
            .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Date");

        row.find("input.RNI_BCH_No")
            .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Number");

        row.find("input.RNI_BCH_Qty")
            .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Qty");

        row.find("input.RNI_BCH_UnitPrice")
            .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_UnitPrice");

        row.find("input.RNI_BCH_Value")
            .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Value");

        row.find("input.RNI_BCH_IsDeleted")
            .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_IsDeleted")
            .val("false");

        $("#IBatTableBody_P").append(row);

        browCount++;
        row.data("isValid", false);
        isbAddingRow = false;
    }

    $(document).on("click", ".ItemBatch_P", function () {

        let checkedRows =
            $("#TableBody_P .CheckItem:checked")
                .closest("tr.NewRow");

        if (checkedRows.length !== 1) {
            alert("Please select one item");
            return;
        }

        let selectedRow =
            checkedRows.first();

        CurrentBatchItemRow_P =
            selectedRow;

        let rowIndex =
            selectedRow.index();

        console.log("OPEN rowIndex:", rowIndex);
        console.log("BatchMap:", BatchMap_P);

        $("#IBatTableBody_P")
            .find("tr.IBatNewRow")
            .remove();

        let rowBatches =
            BatchMap_P[rowIndex] || [];

        console.log("Fetched:", rowBatches);

        if (rowBatches.length === 0) {

            IBatNewRow();
        }
        else {

            $.each(rowBatches, function (_, batch) {

                IBatNewRow();

                let newRow = $("#IBatTableBody_P tr.IBatNewRow:last");

                newRow.find(".RNI_BCH_No")
                    .val(batch.BatchNo);

                newRow.find(".RNI_BCH_Qty")
                    .val(batch.Qty);

                newRow.find(".RNI_BCH_UnitPrice")
                    .val(batch.UnitPrice);

                newRow.find(".RNI_BCH_Value")
                    .val(batch.Amount);

                newRow.find(".RNI_BCH_WH_Number")
                    .val(batch.Warehouse);
            });
        }
        let qty_Popup = $("#TableBody_P .CheckItem:checked")
            .closest("tr.NewRow")
            .find(".JIDNI_Qty")
            .val();

        $("#RNI_BATCHQty_P").text(qty_Popup);
  
     
       

        setTimeout(() => {
            let newRow = $("#IBatTableBody_P tr.IBatNewRow:last");

            newRow.find(".RNI_BCH_No").focus();
        }, 200);
        //#region logic for mismatch qty
        var currentItemGridSelectedRow = GetCheckedRowId_P();
        ApplyBatchValues_P(currentItemGridSelectedRow);
        //#endregion
        new bootstrap.Modal($("#IBatch")).show();
    
    });

    $(document).on('click', '.IBatRowRemove', function () {
        $(this).closest('tr')
            .find("input.RNI_BCH_IsDeleted")
            .val("true");

        $(this).closest('tr').hide();

        BatchCalculateFooter_P();
    });

    // ✅ Qty → Value calculation
    $(document).on('input', "#IBatTableBody_P tr.IBatNewRow input.RNI_BCH_Qty,#IBatTableBody_P tr.IBatNewRow input.RNI_BCH_UnitPrice", function () {

        var row = $(this).closest("tr");

        var qty = parseFloat(removeCommas(row.find(".RNI_BCH_Qty").val())) || 0;
        var price = parseFloat(removeCommas(row.find(".RNI_BCH_UnitPrice").val())) || 0;

        var value = qty * price;

        row.find(".RNI_BCH_Value").val(DecimalIndianRupees(value));

        BatchCalculateFooter_P();
        var lastRow = $("#IBatTableBody_P tr.IBatNewRow").last();
        if (CheckAllValid(lastRow)) {
            IBatNewRow();
        }
    });

    // ✅ Add Row Button
    $("#IBatNewRowButton").click(function () {

        var lastRow = $("#IBatTableBody_P tr.IBatNewRow").last();

        if (CheckAllValid(lastRow)) {
            IBatNewRow();
        } else {
            alert("Please complete all fields !");
        }

        BatchCalculateFooter_P();
    });
    //#region apply batch values
    function ApplyBatchValues_P(rowId) {

        let batchValues = GetBatchValues_P(rowId);

        if (!batchValues || batchValues.length === 0)
            return;

        let rows = $("#IBatTableBody_P tr")
            .not("#IBatTempRow");

        rows.each(function (index) {

            let batch = batchValues[index];
            if (!batch) return;

            $(this).find(".RNI_BCH_No").val(batch.RNI_BCH_No);
            $(this).find(".RNI_BCH_Qty").val(batch.RNI_BCH_Qty);
            $(this).find(".RNI_BCH_UnitPrice").val(batch.RNI_BCH_UnitPrice);
            $(this).find(".RNI_BCH_Value").val(batch.RNI_BCH_Value);
        });

        CalculateBatchFooter_P();
    }
    //#endregion

    //#region FOOTER TOTAL

    function CalculateBatchFooter_P() {

        let totalQty = 0;
        let totalReservedQty = 0;
        let totalValue = 0;
        let totalAvailableQty = 0;

        $("#IBatTableBody_P tr.IBatNewRow")
            .each(function () {

                totalQty +=
                    parseFloat(
                        $(this)
                            .find(".RNI_BCH_Qty")
                            .val()
                    ) || 0;
             
                totalValue +=
                    parseFloat(
                        $(this)
                            .find(".RNI_BCH_UnitPrice")
                            .val()
                    ) || 0;
            

            });

        $("#BatchTotalQty_P")
            .val(totalQty.toFixed(2));

        $("#BatchTotalValue_P")
            .val(totalValue.toFixed(2));
    
    }

    //#endregion

    function IBatValidateField(currentInput) {
        var valid = 1;
        var inputValue = currentInput.val();
        if (inputValue === "") {
            valid = 0;
        }
        if (currentInput.hasClass(".RNI_BCH_Qty")) {
            valid = ExValidateAmount(currentInput);
        }
        if (valid == 0) {
            return false;
        }
        else {
            return true;
        }
    }

    function ExValidateAmount(currentInput) {
        var valid = 1;

        var currentRow = currentInput.closest("#IBatTableBody_P tr.IBatNewRow");
        var PercentInput = currentRow.find("input.RNI_BCH_Qty");
        var Percent = removeCommas(PercentInput.val());
        if (Percent > 0) {
        }
        else {
            valid = 0;
        }
        return valid;
    }


    function IBatCheckAllFieldsValid(currentRow) {

        var prefix = "RNI";

        var allFieldsValid = true;

        $("#IBatTableBody_P tr.IBatNewRow:visible").each(function () {

            var row = $(this);

            row.find(
                "select, " +
                "input." + prefix + "_BCH_Qty, " +
                "input." + prefix + "_BCH_No, " +
                "input." + prefix + "_BCH_Date"
            ).each(function () {

                if (!IBatValidateField($(this))) {
                    allFieldsValid = false;
                    return false; // break inner loop
                }
            });

            if (!allFieldsValid) return false; // break outer loop
        });

        return allFieldsValid;
    }

    $("#IBatCloseButton").click(function () {
        if (!ValidateBatchQty_P()) {
            bootstrap.Modal
                .getInstance(document.getElementById("IBatch"))
                ?.hide();
            return false;
        
        }
        SaveTempBatch_P();
    });

    // ✅ Validation
    function CheckAllValid(row) {

        var valid = true;

        row.find("input.RNI_BCH_Qty, input.RNI_BCH_No").each(function () {
            if ($(this).val() === "") {
                valid = false;
                return false;
            }
        });

        return valid;
    }

});

function BatchCalculateFooter_P() {

    var totalQty = 0;
    var totalValue = 0;

    $("#IBatTableBody_P tr.IBatNewRow:visible").each(function () {

        var row = $(this);

        var deleted = row.find(".RNI_BCH_IsDeleted").val() === "true";

        if (!deleted) {

            var qty = parseFloat(removeCommas(row.find(".RNI_BCH_Qty").val())) || 0;
            var value = parseFloat(removeCommas(row.find(".RNI_BCH_Value").val())) || 0;

            totalQty += qty;
            totalValue += value;
        }
    });

    $("#BatchTotalQty_P").val(DecimalIndianRupees(totalQty));
    $("#BatchTotalValue_P").val(DecimalIndianRupees(totalValue));

}

window.onload = BatchCalculateFooter_P;
 
