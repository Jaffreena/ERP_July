var TempBatch = {};

let BatchMap_S = {};
let CurrentBatchItemRow_S = null;
let batchMismatchData_S = [];
function ValidateBatchQty_S() {

    let InvoiceQty =
        parseFloat(removeCommas($("#RNI_BATCHQty_S").text())) || 0;
    let BatchQty = $("#IBatTableBody_S tr")
        .not("#IBatTempRow")
        .filter(function () {
            return $(this).find(".RNI_BCH_IsDeleted").val() !== "true";
        })
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

    if (InvoiceQty !== BatchQty) {

        alert("Qty Mismatch !");
        var ItemGridRowSelected = GetCheckedRowId_S();
        console.log('----ItemGridRowSelected--------' + ItemGridRowSelected)
        StoreBatchMismatch_S(ItemGridRowSelected);
        CloseModal_S();


        return false;
    } else {

        let rowId = GetCheckedRowId_S();

        batchMismatchData_S =
            batchMismatchData_S.filter(x => x.rowId !== rowId);
    }

    return true;
}
function CloseModal_S() {

    const modal = $("#IBatch_S");

    modal.one("hidden.bs.modal", function () {

        setTimeout(function () {
            FocusItemGridQty_S();
        }, 500);

    });

    modal.modal("hide");
}
//#region  focus item grid on qty mismatch
function FocusItemGridQty_S() {

    if (!CurrentBatchItemRow_S)
        return;

    let rowID =
        CurrentBatchItemRow_S.attr("data-rowid");
    let QtyInput =
        $("#TableBody_S")
            .find(`tr[data-rowid='${rowID}']`)
            .find(".JIDNI_Qty");

    if (QtyInput.length > 0) {

        QtyInput.focus();
        QtyInput.select();

    }

}
//#endregion
//#region get item checked row
function GetBatchValues_S(rowId) {

    let row = batchMismatchData_S.find(x => x.rowId === rowId);

    return row ? row.batchValues : [];
}
function StoreBatchMismatch_S(rowId) {

    let batchValues = $("#IBatTableBody_S tr")
        .not("#IBatTempRow")
        .map(function () {

            return {
                JIRNI_BCH_Number: $(this).find(".JIRNI_BCH_Number").val(),
                JIRNI_BCH_BatchQty: parseFloat(removeCommas($(this).find(".JIRNI_BCH_BatchQty").val())) || 0,
                JIRNI_BCH_BatchUnitPrice: parseFloat(removeCommas($(this).find(".JIRNI_BCH_BatchUnitPrice").val())) || 0,
                JIRNI_BCH_BatchValue: parseFloat(removeCommas($(this).find(".JIRNI_BCH_BatchValue").val())) || 0
            };

        }).get();

    batchMismatchData_S =
        batchMismatchData_S.filter(x => x.rowId !== rowId);

    batchMismatchData_S.push({
        rowId: rowId,
        batchValues: batchValues
    });

    console.log('-------batchMismatchData_S--------');
    console.log(batchMismatchData_S);
}
function GetCheckedRowId_S() {

    let rowId = -1;

    $("#TableBody_S tr.NewRow:visible").each(function (index) {
        if ($(this).find(".CheckItem").prop("checked")) {
            rowId = index + 1;
            return false; // break
        }
    });

    return rowId;
}
//#endregion
function SaveTempBatch_S() {

    if (!CurrentBatchItemRow_S)
        return;

    let rowIndex =
        CurrentBatchItemRow_S.index();

    console.log("SAVE rowIndex:", rowIndex);

    let batchList = [];

    $("#IBatTableBody_S tr.IBatNewRow").each(function () {

        let row =
            $(this);

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

    BatchMap_S[rowIndex] =
        batchList;

    console.log("After Save:", BatchMap_S);

    bootstrap.Modal
        .getInstance(document.getElementById("IBatch_S"))
        ?.hide();
}

$(document).ready(function () {
    $(document).on("click", "#IBatTableBody_S input", function (e) {
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

        var row = $("#IBatTableBody_S #IBatTempRow").clone()
            .removeAttr("style")
            .removeAttr("id")
            .addClass("IBatNewRow");

        row.find("input.RNI_BCH_Item_Number")
            .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Item_Number");

        row.find("input.RNI_BCH_Item_Index")
            .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_Item_Index");

        row.find("input.JIRNI_BCH_WH_Number")
            .attr("name", "ItemBatch[" + browCount + "].JIRNI_BCH_WH_Number");

        row.find("input.JIRNI_BCH_BatchDate")
            .attr("name", "ItemBatch[" + browCount + "].JIRNI_BCH_BatchDate");

        row.find("input.JIRNI_BCH_BatchQty")
            .attr("name", "ItemBatch[" + browCount + "].JIRNI_BCH_BatchQty");

        row.find("input.JIRNI_BCH_BatchUnitPrice")
            .attr("name", "ItemBatch[" + browCount + "].JIRNI_BCH_BatchUnitPrice");

        row.find("input.JIRNI_BCH_BatchValue")
            .attr("name", "ItemBatch[" + browCount + "].JIRNI_BCH_BatchValue");

        row.find("input.RNI_BCH_IsDeleted")
            .attr("name", "ItemBatch[" + browCount + "].RNI_BCH_IsDeleted")
            .val("false");

        $("#IBatTableBody_S").append(row);

        row.find(".datepicker").flatpickr({
            dateFormat: "d-M-Y",
            altInput: true,
            altFormat: "d-M-Y",
            allowInput: true,
            defaultDate: new Date()
        });

        let whValue_S =
            CurrentBatchItemRow_S
                ? CurrentBatchItemRow_S.find(".JIDNI_WH_Number").val()
                : "";

        row.find(".JIRNI_BCH_WH_Number").val(whValue_S);

        browCount++;
        row.data("isValid", false);
        isbAddingRow = false;
        ApplyIBatFieldWidths("S");
    }

    $(document).on("click", ".ItemBatch_S", function () {

        let checkedRows =
            $("#TableBody_S .CheckItem:checked")
                .closest("tr.NewRow");

        if (checkedRows.length !== 1) {
            alert("Please select one item");
            return;
        }

        let selectedRow =
            checkedRows.first();

        CurrentBatchItemRow_S =
            selectedRow;

        let rowIndex =
            selectedRow.index();

        console.log("OPEN rowIndex:", rowIndex);
        console.log("BatchMap:", BatchMap_S);

        $("#IBatTableBody_S")
            .find("tr.IBatNewRow")
            .remove();

        let rowBatches =
            BatchMap_S[rowIndex] || [];

        console.log("Fetched:", rowBatches);

        if (rowBatches.length === 0) {

            IBatNewRow();
        }
        else {

            $.each(rowBatches, function (_, batch) {

                IBatNewRow();

                let newRow =
                    $("#IBatTableBody_S tr.IBatNewRow:last");

                newRow.find(".JIRNI_BCH_Number")
                    .val(batch.BatchNo);

                newRow.find(".JIRNI_BCH_BatchQty")
                    .val(batch.Qty);
                newRow.find(".JIRNI_BCH_BatchUnitPrice")
                    .val(batch.UnitPrice);
                newRow.find(".JIRNI_BCH_BatchValue")
                    .val(batch.Amount);

                newRow.find(".RNI_BCH_WH_Number")
                    .val(batch.Warehouse);
            });
        }
        let qty_Popup = $("#TableBody_S .CheckItem:checked")
            .closest("tr.NewRow")
            .find(".JIDNI_Qty")
            .val();

        $("#RNI_BATCHQty_S").text(qty_Popup);
        //#region logic for mismatch qty
        var currentItemGridSelectedRow = GetCheckedRowId_S();
        ApplyBatchValues_S(currentItemGridSelectedRow);
        //#endregion
        new bootstrap.Modal($("#IBatch_S")).show();
        ApplyIBatFieldWidths("S");
    });

    $(document).on('click', '.IBatRowRemove', function () {
        $(this).closest('tr')
            .find("input.RNI_BCH_IsDeleted")
            .val("true");

        $(this).closest('tr').hide();

        BatchCalculateFooter_S();
        ApplyIBatFieldWidths("S");
    });
    // ✅ Batch No width recalculation
    $(document).on('input', "#IBatTableBody_S tr.IBatNewRow input.JIRNI_BCH_Number", function () {
        ApplyIBatFieldWidths("S");
    });

    // ✅ Qty → Value calculation
    $(document).on('input', "#IBatTableBody_S tr.IBatNewRow input.JIRNI_BCH_BatchQty, #IBatTableBody_S tr.IBatNewRow input.JIRNI_BCH_BatchUnitPrice", function () {

        var row = $(this).closest("tr");

        var qty = parseFloat(removeCommas(row.find(".JIRNI_BCH_BatchQty").val())) || 0;
        var price = parseFloat(removeCommas(row.find(".JIRNI_BCH_BatchUnitPrice").val())) || 0;

        var value = qty * price;

        row.find(".JIRNI_BCH_BatchValue").val(DecimalIndianRupees(value));

        BatchCalculateFooter_S();
        ApplyIBatFieldWidths("S");
        var lastRow = $("#IBatTableBody_S tr.IBatNewRow").last();
        if (CheckAllValid(lastRow)) {
            IBatNewRow();
        }
    });

    // ✅ Add Row Button
    $("#IBatNewRowButton_S").click(function () {

        var lastRow = $("tr.IBatNewRow").last();

        if (CheckAllValid(lastRow)) {
            IBatNewRow();
        } else {
            alert("Please complete all fields !");
        }

        BatchCalculateFooter_S();
        ApplyIBatFieldWidths("S");
    });
    //#region apply batch values
    function ApplyBatchValues_S(rowId) {

        let batchValues = GetBatchValues_S(rowId);

        if (!batchValues || batchValues.length === 0)
            return;

        let rows = $("#IBatTableBody_S tr")
            .not("#IBatTempRow");

        rows.each(function (index) {

            let batch = batchValues[index];
            if (!batch) return;

            $(this).find(".JIRNI_BCH_Number").val(batch.JIRNI_BCH_Number);
            $(this).find(".JIRNI_BCH_BatchQty").val(batch.JIRNI_BCH_BatchQty);
            $(this).find(".JIRNI_BCH_BatchUnitPrice").val(batch.JIRNI_BCH_BatchUnitPrice);
            $(this).find(".JIRNI_BCH_BatchValue").val(batch.JIRNI_BCH_BatchValue);
        });

        BatchCalculateFooter_S();
        ApplyIBatFieldWidths("S");
    }
    //#endregion
    function IBatValidateField(currentInput) {
        var valid = 1;
        var inputValue = currentInput.val();
        if (inputValue === "") {
            valid = 0;
        }
        if (currentInput.hasClass(".JIRNI_BCH_BatchQty")) {
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

        var currentRow = currentInput.closest("tr.IBatNewRow");
        var PercentInput = currentRow.find("input.JIRNI_BCH_BatchQty");
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

        $("tr.IBatNewRow:visible").each(function () {

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

    $("#IBatCloseButton_S").click(function () {
        if (!ValidateBatchQty_S()) {
            bootstrap.Modal
                .getInstance(document.getElementById("IBatch_S"))
                ?.hide();
            return false;

        }
        SaveTempBatch_S();
    });

    // ✅ Validation
    function CheckAllValid(row) {

        var valid = true;

        row.find("input.JIRNI_BCH_BatchQty, input.JIRNI_BCH_Number").each(function () {
            if ($(this).val() === "") {
                valid = false;
                return false;
            }
        });

        return valid;
    }

});

function BatchCalculateFooter_S() {

    var totalQty = 0;
    var totalValue = 0;

    $("#IBatTableBody_S tr.IBatNewRow:visible").each(function () {

        var row = $(this);

        var deleted = row.find(".RNI_BCH_IsDeleted").val() === "true";

        if (!deleted) {

            var qty = parseFloat(removeCommas(row.find(".JIRNI_BCH_BatchQty").val())) || 0;
            var value = parseFloat(removeCommas(row.find(".JIRNI_BCH_BatchValue").val())) || 0;

            totalQty += qty;
            totalValue += value;
        }
    });

    $("#BatchTotalQty_S").val(totalQty === 0 ? "" : DecimalIndianRupees(totalQty));
    $("#BatchTotalValue_S").val(totalValue === 0 ? "" : DecimalIndianRupees(totalValue));

}


window.onload = function () {
    BatchCalculateFooter_S();
    ApplyIBatFieldWidths("S");
};

