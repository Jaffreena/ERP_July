//#region GLOBAL ARRAY


let ReceiptNoteBatchList = [];
let ReceiptNoteItemBatchList = [];
let CurrentBatchItemRow = null;

//#endregion

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


//#region ASSIGN UNIQUE ROW ID
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

//function AssignItemRowID() {

//    $("#TableBody tr.NewRow").each(function (index) {

//        let row = $(this);

//        if (row.attr("data-rowid"))
//            return;

//        row.attr(
//            "data-rowid",
//            "ROW_" + new Date().getTime() + "_" + index
//        );
//    });
//}

// INITIAL
AssignItemRowID();

//#endregion



//#region VALIDATE ITEM GRID CHECKBOX

function ValidateSelectedItemRow() {

    let checkedRows =
        $("#TableBody .ItemCheckbox:checked");

    // NO ROW SELECTED
    if (checkedRows.length == 0) {

        showAlert('Please check at least one item row')

       

        return false;
    }

    // MORE THAN ONE SELECTED
    if (checkedRows.length > 1) {
        showAlert('Please check only one item row')

         

        return false;
    }

    return true;
}

//#endregion



//#region SINGLE CHECKBOX ONLY

$(document).on(
    "change",
    ".ItemCheckbox",
    function () {

        $(".ItemCheckbox")
            .not(this)
            .prop("checked", false);

        let row =
            $(this).closest("tr");

        let rowID =
            row.attr("data-rowid");

        console.log("SELECTED ROW ID");
        console.log(rowID);

    });

//#endregion







//#region VALIDATE EXISTING BATCH ROWS

function ValidateExistingBatchRows() {

    let isValid = true;

    $("#ReceiptNoteBatchTableBody tr.ReceiptNoteBatchRow")
        .each(function () {

            let row = $(this);

            row.removeClass("table-danger");

            let batchNo =
                row.find(".JORNI_BCH_BatchNo")
                    .val()
                    ?.trim();

            let qty =
                row.find(".JORNI_BCH_QtyReceived")
                    .val()
                    ?.trim();

            let price =
                row.find(".JORNI_BCH_BatchUnitPrice")
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



//#region ADD BATCH ROW BUTTON

$(document).on(
    "click",
    "#AddBatchRow",
    function () {

        // VALIDATE EXISTING ROWS
        let valid =
            ValidateExistingBatchRows();

        if (!valid) {
            showAlert('Please fill all existing batch rows before adding new row')

          

            return;
        }

       // AddReceiptNoteBatchRow();

    });

//#endregion



//#region REMOVE BATCH ROW

$(document).on(
    "click",
    ".RemoveBatchRow",
    function () {

        $(this)
            .closest("tr")
            .remove();

        CalculateBatchFooter();

    });

//#endregion



//#region BATCH VALUE CALCULATION

$(document).on(
    "input",
    ".JORNI_BCH_QtyReceived, .JORNI_BCH_BatchUnitPrice",
    function () {

        let row = $(this).closest("tr");

        let qty = parseFloat(removeComma(row.find(".JORNI_BCH_QtyReceived").val())) || 0;
        let price = parseFloat(removeComma(row.find(".JORNI_BCH_BatchUnitPrice").val())) || 0;

        let value = qty * price;

        row.find(".JORNI_BCH_BatchValue").val(addComma(value, "c"));

        CalculateBatchFooter();
        ApplyBatchFieldWidths();
    });
//#endregion

//#region comma format on focusout - Batch WH
$(document).on("focusout",
    ".JORNI_BCH_QtyAvailable, .JORNI_BCH_QtyReserved, .JORNI_BCH_QtyReceived, .JORNI_BCH_BatchUnitPrice, .JORNI_BCH_BatchValue",
    function () {

        let isQty =
            $(this).hasClass("JORNI_BCH_QtyAvailable") ||
            $(this).hasClass("JORNI_BCH_QtyReserved") ||
            $(this).hasClass("JORNI_BCH_QtyReceived");

        let type = isQty ? "q" : "c";

        $(this).val(addComma($(this).val(), type));
    });
//#endregion

//#region FOOTER TOTAL
function CalculateBatchFooter() {

    let totalQty = 0;
    let totalReservedQty = 0;
    let totalValue = 0;
    let totalAvailableQty = 0;

    $("#ReceiptNoteBatchTableBody tr.ReceiptNoteBatchRow")
        .each(function () {

            totalQty += parseFloat(removeComma($(this).find(".JORNI_BCH_QtyReceived").val())) || 0;
            totalAvailableQty += parseFloat(removeComma($(this).find(".JORNI_BCH_QtyAvailable").val())) || 0;
            totalValue += parseFloat(removeComma($(this).find(".JORNI_BCH_BatchValue").val())) || 0;
            totalReservedQty += parseFloat(removeComma($(this).find(".JORNI_BCH_QtyReserved").val())) || 0;
        });

    $("#TotalBatchQty").val(addComma(totalQty, "q"));
    $("#TotalBatchValue").val(addComma(totalValue, "c"));
    $("#TotalAvailableQty").val(addComma(totalAvailableQty, "q"));
    $("#TotalReservedQty").val(addComma(totalReservedQty, "q"));
}
//#endregion



 


//#region SAVE BATCH

$(document).on(
    "click",
    "#SaveBatchButton",
    function (e) {

        if (CurrentBatchItemRow == null)
            return;

        // VALIDATE BATCH ROWS
        let valid =
            ValidateExistingBatchRows();
        if (!ValidateBatchDate()) {
            e.preventDefault();
            return false;
        }
        if (!ValidateBatchQty()) {
            e.preventDefault();
            return false;
        }

        CloseReceiptNoteBatchModal();

        //if (!valid) {
        //
        //    showAlert(
        //        "Please fill all batch rows before saving"
        //    );
        //
        //    return;
        //}

        let rowID =
            CurrentBatchItemRow
                .attr("data-rowid");

        let batchList = [];

        $("#ReceiptNoteBatchTableBody tr.ReceiptNoteBatchRow")
            .each(function () {

                let row = $(this);

                let batchObj = {

                    RowID: rowID,

                    JORNI_BCH_WH_Number:
                        row.find(".JORNI_BCH_WH_Number").val(),
                    JORNI_BCH_JORNI_Number:
                        row.find(".JORNI_BCH_JORNI_Number").val(),
                    JORNI_BCH_WH_Name:
                        row.find(".JORNI_BCH_WH_Name").val(),

                    JORNI_BCH_BatchDate:
                        row.find(".JORNI_BCH_BatchDate").val(),

                    JORNI_BCH_Number:
                        row.find(".JORNI_BCH_Number").val(),

                    JORNI_BCH_BatchNo:
                        row.find(".JORNI_BCH_BatchNo").val(),

                    JORNI_BCH_QtyAvailable:
                        row.find(".JORNI_BCH_QtyAvailable").val(),

                    JORNI_BCH_QtyReserved:
                        row.find(".JORNI_BCH_QtyReserved").val(),

                    JORNI_BCH_QtyReceived:
                        row.find(".JORNI_BCH_QtyReceived").val(),

                    JORNI_BCH_BatchUnitPrice:
                        row.find(".JORNI_BCH_BatchUnitPrice").val(),

                    JORNI_BCH_BatchValue:
                        row.find(".JORNI_BCH_BatchValue").val()
                };

                batchList.push(batchObj);
            //    SaveTempBatch(row);

            });

        // REMOVE OLD SAME ROW DATA
        ReceiptNoteItemBatchList =
            ReceiptNoteItemBatchList.filter(
                x => x.RowID != rowID
            );

        // SAVE NEW DATA
        ReceiptNoteItemBatchList.push({

            RowID: rowID,

            BatchList: batchList
        });

        //#region CONSOLE

       // console.clear();

        console.log("CURRENT ROW ID");
        console.log(rowID);

        SaveTempBatch(batchList);

        //#endregion

        $("#ReceiptNoteBatchModal")
            .modal("hide");

    });

//#endregion

//#region CLOSE POPUP

$(document).on(
    "click",
    "#ReceiptNoteBatchClose",
    function () {

        $("#ReceiptNoteBatchModal")
            .modal("hide");

    });

//#endregion

//#region SHOW BATCH

$('#ReceiptNoteBatchModal').one('shown.bs.modal', function () {

    setTimeout(function () {

        const backdrop = document.querySelector('.modal-backdrop');

        if (backdrop) {
            $(".modal-backdrop").click();
            backdrop.dispatchEvent(new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window
            }));

            backdrop.dispatchEvent(new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window
            }));

            backdrop.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            }));
        }

    }, 300);

});


$(document).on("click", ".OpenBatchPopup", function (e) {



    
        e.preventDefault();
        //console.log("ROW ID :", rowID);
        AssignItemRowID();

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

        CurrentBatchItemRow = selectedRow;

        let rowID = CurrentBatchItemRow.attr("data-rowid");

        let ItemGridindex =
            $("#TableBody tr[data-rowid='" + rowID + "']").index();

        //#region GET VALUES

    let fromWarehouse =
        selectedRow.find(".JORNI_WH_Number").val();

    let lineItemNumber =
        selectedRow.find(".JORNI_Item_Number").val();

    let invoiceQty =
        selectedRow.find(".JORNI_Qty").val();

    // NEW: guard against opening the batch popup for a row with
    // no item selected or zero Qty — this previously caused an
    // empty batch table, which collapses ApplyBatchFieldWidths'
    // computed widths to near-zero and squeezes the modal.
    if (!lineItemNumber || lineItemNumber === "0") {
        alert("Please select an Item Code for this row before opening Batch.");
        return false;
    }

    if (!invoiceQty || parseFloat(removeCommas(invoiceQty)) <= 0) {
        alert("Please enter Qty for this row before opening Batch.");
        return false;
    }

    $("#BatchPopupQty").text(invoiceQty);

    //#endregion


    // CLEAR TEMP ARRAY
    ReceiptNoteBatchList = [];

        // CLEAR OLD ROWS
        $("#ReceiptNoteBatchTableBody")
            .find(".ReceiptNoteBatchRow")
            .remove();

        //#region AJAX

        $.ajax({

            url: "/joboutward/transactions/receipt-note/get-batch-details",

            type: "GET",

            data: {
                FromWarehouse: fromWarehouse,
                LineItem_Number: lineItemNumber,
                ItemGridIndex: ItemGridindex
            },

            success: function (response) {

                console.log(response);

                ReceiptNoteBatchList = [];

                if (response && response.length > 0) {

                    $.each(response, function (i, batch) {

                        let qtyInvoice = batch.receivedQty || 0;
                        let unitPrice = batch.batchUnitPrice || 0;

                        ReceiptNoteBatchList.push({

                            JORNI_BCH_WH_Number: batch.fromWarehouse,
                            JORNI_BCH_JORNI_Number: lineItemNumber,
                            JORNI_BCH_WH_Name: batch.wareHouseCode,
                            JORNI_BCH_BatchDate: batch.batchDate,
                            JORNI_BCH_BatchNo: batch.batchNo,
                            JORNI_BCH_QtyAvailable: batch.availableQty,
                            JORNI_BCH_QtyReserved: batch.reservedQty,
                            JORNI_BCH_QtyReceived: qtyInvoice,
                            JORNI_BCH_BatchUnitPrice: unitPrice,
                            JORNI_BCH_BatchValue: (parseFloat(qtyInvoice) * parseFloat(unitPrice)) || 0,
                            JORNI_BCH_Number: batch.lineBatch_Number
                        });

                    });

                } else {

                    ReceiptNoteBatchList.push({});
                }

                BindReceiptNoteBatchTable();
                BindOtherBatch(fromWarehouse, lineItemNumber, ItemGridindex);

                //#region logic for mismatch qty
                var currentItemGridSelectedRow = GetCheckedRowId();
                ApplyBatchValues(currentItemGridSelectedRow);
                //#endregion
                console.log($(".ReceiptNoteBatchNewRow").length);
                console.log($(".ReceiptNoteBatchRow").length);
                console.log("offsetWidth:", $("#ReceiptNoteBatchList")[0].offsetWidth);
                console.log("scrollWidth:", $("#ReceiptNoteBatchList")[0].scrollWidth);
                console.log($("#ReceiptNoteBatchList").length);
                console.log($("#ReceiptNoteBatchList"));
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

$("#ReceiptNoteBatchModal").on("shown.bs.modal", function () {

    setTimeout(function () {

        let input = document.querySelector(
            '#ReceiptNoteBatchTableBody tr:not([style*="display:none"]) .JORNI_BCH_QtyReceived'
        );

        if (input) {
            input.focus();
            input.select();
        }

    }, 200);

});

//#endregion SHOW BATCH

//#region apply batch values
function ApplyBatchValues(rowId) {

    let batchValues = GetBatchValues(rowId);

    if (batchValues.length === 0)
        return;

    let rows = $("#ReceiptNoteBatchTableBody tr")
        .not("#ReceiptNoteBatchTemplateRow");

    if (rows.length !== batchValues.length)
        return;

    rows.each(function (index) {

        $(this)
            .find(".JORNI_BCH_QtyReceived")
            .val(addComma(batchValues[index], "q"));
    });
    CalculateBatchFooter();
}
//#endregion

//#region ADD DATA TO ARRAY

function AddReceiptNoteBatchRow(data = {}) {

    let batchObj = {
        JORNI_BCH_BatchDate: data?.JORNI_BCH_BatchDate || "",
        JORNI_BCH_WH_Number: data?.JORNI_BCH_WH_Number || 0,
        JORNI_BCH_JORNI_Number: data?.JORNI_BCH_JORNI_Number||0,
        JORNI_BCH_WH_Name: data?.JORNI_BCH_WH_Name || "",
        JORNI_BCH_BatchNo: data?.JORNI_BCH_BatchNo || "",
        JORNI_BCH_QtyAvailable: data?.JORNI_BCH_QtyAvailable || 0,
        JORNI_BCH_QtyReserved: data?.JORNI_BCH_QtyReserved || 0,
        JORNI_BCH_QtyReceived: data?.JORNI_BCH_QtyReceived || 0,
        JORNI_BCH_BatchUnitPrice: data?.JORNI_BCH_BatchUnitPrice || 0,
        JORNI_BCH_BatchValue: data?.JORNI_BCH_BatchValue || 0
    };

    ReceiptNoteBatchList.push(batchObj);

    BindReceiptNoteBatchTable();
}

//#endregion



//#region BIND TABLE
function BindReceiptNoteOtherBatchTable(response) {

    let tbody = $("#ReceiptNoteOtherBatchTableBody");

    // Clear all rows except template
    tbody.find(".ReceiptNoteOtherBatchRow").remove();

    $.each(response, function (index, data) {

        let row =
            $("#ReceiptNoteOtherBatchTemplateRow")
                .clone()
                .removeAttr("id")
                .removeAttr("style")
                .show()
                .addClass("ReceiptNoteOtherBatchRow");

        row.find(".JORNI_BCH_Number")
            .val(data.lineBatch_Number);

        row.find(".JORNI_BCH_WH_Number")
            .val(data.fromWarehouse);

        row.find(".JORNI_BCH_WH_Name")
            .val(data.wareHouseCode);

        row.find(".JORNI_BCH_BatchDate")
            .val(data.batchDate);

        row.find(".JORNI_BCH_BatchNo")
            .val(data.batchNo);

        row.find(".JORNI_BCH_AvailableQty").val(addComma(data.availableQty, "q"));
        row.find(".JORNI_BCH_BatchUnitPrice").val(addComma(data.batchUnitPrice, "c"));
        row.find(".JORNI_BCH_BatchValue").val(addComma(data.batchValue, "c"));

        tbody.append(row);

        row.find(".JORNI_BCH_BatchDate").flatpickr({
            dateFormat: "d-M-Y",
            altInput: true,
            altFormat: "d-M-Y",
            allowInput: true,
            defaultDate: data.batchDate || new Date()
        });

    });
    if (response.length === 0) {
        tbody.append(`
        <tr class="ReceiptNoteOtherBatchRow">
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

    $("#ReceiptNoteOtherBatchTableBody .ReceiptNoteOtherBatchRow").each(function () {

        totalQty += parseFloat(removeComma($(this).find(".JORNI_BCH_AvailableQty").val())) || 0;
        totalValue += parseFloat(removeComma($(this).find(".JORNI_BCH_BatchValue").val())) || 0;
    });

    $("#TotalBatchQtyOther").val(addComma(totalQty, "q"));
    $("#TotalBatchValueOther").val(addComma(totalValue, "c"));

    if ($("#ReceiptNoteOtherBatchTableBody .ReceiptNoteOtherBatchRow").length > 0)
        $("#ReceiptNoteOtherBatchList tfoot").show();
    else
        $("#ReceiptNoteOtherBatchList tfoot").hide();
}
function BindOtherBatch(fromWarehouse, lineItemNumber, ItemGridindex) {
    //#region AJAX

    $.ajax({

        url: "/joboutward/transactions/receipt-note/get-other-batch-details",

        type: "GET",

        data: {
            FromWarehouse: fromWarehouse,
            LineItem_Number: lineItemNumber,
            ItemGridIndex: ItemGridindex
        },

        success: function (response) {

            console.log(response);
            BindReceiptNoteOtherBatchTable(response);
          

       

        
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

function BindReceiptNoteBatchTable() {

    $("#ReceiptNoteBatchTableBody").find(".ReceiptNoteBatchRow").remove();
   

    $.each(ReceiptNoteBatchList, function (index, data) {

        // Check required values
        if (
            data.JORNI_BCH_WH_Number != undefined &&
            data.JORNI_BCH_JORNI_Number != undefined &&
            data.JORNI_BCH_WH_Name != undefined &&
            data.JORNI_BCH_BatchDate != undefined &&
            data.JORNI_BCH_BatchNo != undefined &&
            data.JORNI_BCH_QtyAvailable != undefined
        ) {

            let row =
                $("#ReceiptNoteBatchTemplateRow")
                    .clone()
                    .removeAttr("id")
                    .removeAttr("style")
                    .show()
                    .addClass("ReceiptNoteBatchRow");

            row.find(".JORNI_BCH_WH_Number")
                .val(data.JORNI_BCH_WH_Number);

            row.find(".JORNI_BCH_JORNI_Number")
                .val(data.JORNI_BCH_JORNI_Number);

            row.find(".JORNI_BCH_WH_Name")
                .val(data.JORNI_BCH_WH_Name);

            row.find(".JORNI_BCH_BatchDate")
                .val(data.JORNI_BCH_BatchDate);

            row.find(".JORNI_BCH_BatchNo")
                .val(data.JORNI_BCH_BatchNo);
            row.find(".JORNI_BCH_Number")
                .val(data.JORNI_BCH_Number);

            row.find(".JORNI_BCH_QtyAvailable").val(addComma(data.JORNI_BCH_QtyAvailable, "q"));
            row.find(".JORNI_BCH_QtyReserved").val(addComma(data.JORNI_BCH_QtyReserved, "q"));
            row.find(".JORNI_BCH_QtyReceived").val(addComma(data.JORNI_BCH_QtyReceived, "q"));
            row.find(".JORNI_BCH_BatchUnitPrice").val(addComma(data.JORNI_BCH_BatchUnitPrice, "c"));
            row.find(".JORNI_BCH_BatchValue").val(addComma(data.JORNI_BCH_BatchValue, "c"));

            $("#ReceiptNoteBatchTableBody").append(row);

            row.find(".JORNI_BCH_BatchDate").flatpickr({
                dateFormat: "d-M-Y",
                altInput: true,
                altFormat: "d-M-Y",
                allowInput: true,
                defaultDate: data.JORNI_BCH_BatchDate || new Date()
            });

        } else {

            $("#ReceiptNoteBatchTableBody").append(`
    <tr class="ReceiptNoteBatchRow">
        <td style="height:25px;"></td>
        <td style="height:25px;"></td>
        <td style="height:25px;"></td>
        <td style="height:25px;"></td>
        <td style="height:25px;"></td>
        <td style="height:25px;"></td>
        <td style="height:25px;"></td>
        <td style="height:25px;"></td>
    </tr>
`);
        }

    });

    CalculateBatchFooter();
   
    // always open on Batch WH tab (a hidden Batch table measures 0 width)
    $("#Batch-tab").addClass("active").attr("aria-selected", "true");
    $("#Other-tab").removeClass("active").attr("aria-selected", "false");
    $("#Batch-tab-pane").addClass("show active");
    $("#Other-tab-pane").removeClass("show active");

    const dialogEl = document.querySelector("#ReceiptNoteBatchModal .modal-dialog");
    if (dialogEl) {
        dialogEl.style.removeProperty("width");
        dialogEl.style.removeProperty("max-width");
    }

    $("#ReceiptNoteBatchModal")
        .one("shown.bs.modal", function () {

            ApplyBatchFieldWidths("#ReceiptNoteBatchList");

            $("#ReceiptNoteBatchList").css({
                width: "max-content",
                "max-width": "none",
                "min-width": $("#ReceiptNoteBatchTableBody tr.ReceiptNoteBatchRow .JORNI_BCH_QtyReceived").length ? "" : "900px"
            });

            ResizeBatchPopup("#ReceiptNoteBatchList", "#ReceiptNoteBatchModal");

        })
        .modal("show");
}
function DebugBatchTable() {

    const table = document.getElementById("ReceiptNoteBatchList");
    const dialog = document.querySelector("#ReceiptNoteBatchModal .modal-dialog");

    console.log("========== BATCH DEBUG ==========");
    console.log(getComputedStyle(document.getElementById("ReceiptNoteBatchList")).width);
    console.log(getComputedStyle(document.getElementById("ReceiptNoteBatchList")).tableLayout);

    console.log("Table :", table);
    console.log("Dialog :", dialog);

    console.log("Table offsetWidth :", table.offsetWidth);
    console.log("Table scrollWidth :", table.scrollWidth);
    console.log("Table clientWidth :", table.clientWidth);

    let total = 0;

    $("#ReceiptNoteBatchList thead th").each(function (i) {

        console.log(
            "TH", i,
            $(this).text().trim(),
            "offset =", this.offsetWidth,
            "style =", this.style.width
        );

        total += this.offsetWidth;
    });

    console.log("Sum of TH widths :", total);

    console.log("Dialog Width :", dialog.offsetWidth);
    console.log("Dialog Style Width :", dialog.style.width);

    console.log("===============================");
    console.log("Table Width =", table.offsetWidth);
    console.log("Parent Width =", table.parentElement.offsetWidth);
    console.log("Modal Body Width =", table.closest(".modal-body").offsetWidth);
    console.log("Dialog Width =", table.closest(".modal-dialog").offsetWidth);
    const parent = table.parentElement;

    console.log("Parent Class =", parent.className);
    console.log("Parent Style Width =", parent.style.width);
    console.log("Parent Computed Width =", getComputedStyle(parent).width);
    console.log("Parent OverflowX =", getComputedStyle(parent).overflowX);
    console.log("Parent MaxWidth =", getComputedStyle(parent).maxWidth);
    console.log("Table style.width =", table.style.width);
    console.log("Table computed.width =", getComputedStyle(table).width);
    console.log("Table computed.minWidth =ResizeBatchPopup", getComputedStyle(table).minWidth);
    console.log("Table computed.maxWidth =", getComputedStyle(table).maxWidth);
    console.log("Has Bootstrap table class:", table.className);
}
function ApplyBatchFieldWidths(container = "#ReceiptNoteBatchList") {

    const fields = [
        { cls: ".JORNI_BCH_WH_Name", min: 10, max: 25, align: "left" },
        { cls: ".JORNI_BCH_BatchDate", min: 10, max: 10, align: "center" },
        { cls: ".JORNI_BCH_BatchNo", min: 20, max: 50, align: "left" },
        { cls: ".JORNI_BCH_QtyAvailable", min: 10, max: 20, align: "center" },
        { cls: ".JORNI_BCH_QtyReserved", min: 10, max: 20, align: "center" },
        { cls: ".JORNI_BCH_QtyReceived", min: 10, max: 20, align: "center" },
        { cls: ".JORNI_BCH_BatchUnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".JORNI_BCH_BatchValue", min: 13, max: 25, align: "right" }
    ];


    const $container = $(container);

    fields.forEach(f => {

        const controls = $container.find(
            "#ReceiptNoteBatchTableBody > #ReceiptNoteBatchTemplateRow " + f.cls +
            ", #ReceiptNoteBatchTableBody > tr.ReceiptNoteBatchRow " + f.cls
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
            f.cls === ".JORNI_BCH_BatchUnitPrice" ||
            f.cls === ".JORNI_BCH_BatchValue"
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


  

}



//#endregion

//#region BATCH DATE VALIDATION
function ValidateBatchDate() {

    let isValid = true;

    $("#ReceiptNoteBatchTableBody tr.ReceiptNoteBatchRow").each(function () {

        let row = $(this);

        let qty = parseFloat(removeComma(row.find(".JORNI_BCH_QtyReceived").val())) || 0;

        if (qty <= 0)
            return;

        let date = (row.find(".JORNI_BCH_BatchDate").first().val() || "").trim();

        if (date === "") {
            alert("Batch Date is required");
            isValid = false;
            return false;
        }
    });

    return isValid;
}
//#endregion

//#region QTY INVOICE VALIDATION

function ValidateBatchQty() {

    let InvoiceQty =
        parseFloat(removeComma($("#BatchPopupQty").text())) || 0;

    let BatchQty = $("#ReceiptNoteBatchTableBody tr")
        .not("#ReceiptNoteBatchTemplateRow")
        .map(function () {

            return parseFloat(
                removeComma($(this).find(".JORNI_BCH_QtyReceived").val())
            ) || 0;

        }).get()
        .reduce((sum, qty) => sum + qty, 0);

    console.log("InvoiceQty :", InvoiceQty);
    console.log("BatchQty :", BatchQty);

    if (InvoiceQty !== BatchQty) {

        alert("Qty Mismatch !");
        var ItemGridRowSelected = GetCheckedRowId();
        console.log('----ItemGridRowSelected--------' + ItemGridRowSelected)
        StoreBatchMismatch(ItemGridRowSelected);
        CloseReceiptNoteBatchModal();

         
        return false;
    } else {

        let rowId = GetCheckedRowId();

        batchMismatchData =
            batchMismatchData.filter(x => x.rowId !== rowId);
    }

    return true;
}

let batchMismatchData = [];
//#endregion

//#region batch mismatch fill grid
function GetBatchValues(rowId) {

    let row = batchMismatchData.find(x => x.rowId === rowId);

    return row ? row.batchValues : [];
}
function StoreBatchMismatch(rowId) {

    let batchValues = $("#ReceiptNoteBatchTableBody tr")
        .not("#ReceiptNoteBatchTemplateRow")
        .map(function () {
            return parseFloat(
                removeComma($(this).find(".JORNI_BCH_QtyReceived").val())
            ) || 0;
        }).get();

    batchMismatchData =
        batchMismatchData.filter(x => x.rowId !== rowId);

    batchMismatchData.push({
        rowId: rowId,
        batchValues: batchValues
    });
    console.log('-------batchMismatchData--------' + JSON.stringify(batchMismatchData));
   
}
//#endregion
 
//#region  focus item grid on qty mismatch
function FocusItemGridQty() {

    if (!CurrentBatchItemRow)
        return;

    let rowID =
        CurrentBatchItemRow.attr("data-rowid");

    let QtyInput =
        $("#TableBody")
            .find(`tr[data-rowid='${rowID}']`)
            .find(".JORNI_Qty");

    if (QtyInput.length > 0) {

        QtyInput.focus();
        QtyInput.select();

    }

}
//#endregion

function CloseReceiptNoteBatchModal() {

    const modal = $("#ReceiptNoteBatchModal");

    modal.one("hidden.bs.modal", function () {

        setTimeout(function () {
            FocusItemGridQty();
        }, 500);

    });

    modal.modal("hide");
}

$(document).on('input', ".JORNI_BCH_QtyReceived", function (event) {

    var row = $(this).closest("tr");

    var QtyAvailable = parseFloat(removeComma(row.find(".JORNI_BCH_QtyAvailable").val())) || 0;
    var QtyReserved = parseFloat(removeComma(row.find(".JORNI_BCH_QtyReserved").val())) || 0;
    var QtyInvoiceInput = row.find(".JORNI_BCH_QtyReceived");
    var QtyInvoice = parseFloat(removeComma(QtyInvoiceInput.val())) || 0;

    var BalanceQty = QtyAvailable - QtyReserved;

    if (QtyInvoice > BalanceQty) {

        alert(
            "Received Qty (" + QtyInvoice +
            ") cannot be greater than Available Qty - Reserved Qty (" + BalanceQty + ").\n" +
            "It will be reset to maximum allowed: " + BalanceQty
        );

        QtyInvoiceInput.val(addComma(BalanceQty, "q"));
        QtyInvoice = BalanceQty;

        QtyInvoiceInput.focus().select();
    }

    CalculateBatchFooter();
});

//#endregion

//#region SAVE TEMP BATCH (BULK VERSION)
function SaveTempBatch() {

    let batchList = [];

    $("#ReceiptNoteBatchTableBody tr.ReceiptNoteBatchRow:visible").each(function () {

        let currentRow = $(this);

        if (currentRow.length == 0)
            return;

        let Qty = parseFloat(removeComma(currentRow.find(".JORNI_BCH_QtyReceived").val())) || 0;

        if (Qty <= 0)
            return;

        let rowID = CurrentBatchItemRow.attr("data-rowid");
        let ItemGridindex = $("#TableBody tr[data-rowid='" + rowID + "']").index();

        let model = {
            DBCH_RowGuid: rowID,
            DBCH_Number: parseInt(currentRow.find(".JORNI_BCH_Number").val()) || 0,
            DBCH_Index: parseInt(ItemGridindex) || 0,
            DBCH_DBCH_Number: parseInt(currentRow.find(".JORNI_BCH_Number").val()) || 0,
            DBCH_Item_Number: parseInt(currentRow.find(".JORNI_BCH_JORNI_Number").val()) || 0,
            DBCH_Warehouse_Number: parseInt(currentRow.find(".JORNI_BCH_WH_Number").val()) || 0,
            DBCH_Date: new Date(currentRow.find(".JORNI_BCH_BatchDate").val()).toISOString(),
            DBCH_No: currentRow.find(".JORNI_BCH_BatchNo").val(),
            DBCH_Qty: Qty,
            DBCH_UnitPrice: parseFloat(removeComma(currentRow.find(".JORNI_BCH_BatchUnitPrice").val())) || 0,
            DBCH_Value: parseFloat(removeComma(currentRow.find(".JORNI_BCH_BatchValue").val())) || 0,
            JORNI_NUMBER: parseInt(currentRow.find(".JORNI_Number").val()) || 0,
            JORNH_NUMBER: parseInt(currentRow.find(".JORNH_Number").val()) || 0,
            RefBatch_Number: parseInt(currentRow.find(".RefBatch_Number").val()) || 0,
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

    $.ajax({

        url: '/joboutward/transactions/receipt-note/save-temp-batch',

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

//#region get item checked row
function GetCheckedRowId() {

    let rowId = -1;

    $("#TableBody tr.NewRow:visible").each(function (index) {

        if ($(this).find(".CheckItem").prop("checked")) {
            rowId = index + 1;
            return false; // break
        }
    });

    return rowId;
}
//#endregion

function ResizeBatchPopup(tableSelector, modalSelector) {

    const table = document.querySelector(tableSelector);
    const dialog = document.querySelector(modalSelector + " .modal-dialog");

    if (!table || !dialog) return;

    // Full table width including overflow
    const tableWidth = table.scrollWidth;

    // table hidden (0 width) -> do not shrink the popup
    if (!tableWidth) return;

    // Extra space for modal padding/borders
    const popupWidth = tableWidth + 40;

    dialog.style.setProperty("width", popupWidth + "px", "important");
    dialog.style.setProperty("max-width", popupWidth + "px", "important");
}
