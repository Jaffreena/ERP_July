var addressIndex = 0;

$(document).ready(function () {

    console.log("ItemProduction ready");

    //#region Unit Price Format

    $(document).on("focusout", ".JIDNI_UnitPrice", function () {

        // Get current input value
        var value = $(this).val().trim();

        // If empty or invalid, set default value
        if (value === "" || isNaN(value)) {
            $(this).val("0.00");
            return;
        }

        // Convert to 2 decimal format
        $(this).val(parseFloat(value).toFixed(2));
    });

    //#endregion

    //#region INPUT CLICK SELECT ALL
    $(document).on("click", "#DeliveryNoteBatchList input", function (e) {
        e.stopPropagation();

        let input = this;
        input.focus();

        setTimeout(function () {
            input.select();
        }, 10);
    });
    $(document).on("click", "#ItemTable_S input", function (e) {
        e.stopPropagation();

        let input = this;
        input.focus();

        setTimeout(function () {
            input.select();
        }, 10);
    });
    //#endregion

    //#region Row Click - Single Selection
    $("#ItemTable_S").on("click", "tbody tr.NewRow", function (e) {

        // Ignore direct checkbox click
        if ($(e.target).closest(".CheckItem").length) {
            return;
        }

        // Uncheck all row checkboxes
        $("#ItemTable_S .CheckItem").prop("checked", false);

        // Check only current row
        $(this).find(".CheckItem").prop("checked", true);
    });
    //#endregion


    //#region Checkbox Click - Multiple Selection
    $("#ItemTable_S").on("click", ".CheckItem", function (e) {

        // Prevent row click event
        e.stopPropagation();
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
    //#endregion Initialize Flatpickr

    //#region onkeypress qty and unit
    $(document).on("keyup change", ".JIDNI_Qty", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat(row.find(".JIDNI_Qty").val()) || 0;



        // update footer totals separately
        calculateTotal_S();
        // auto add row
        autoAddRow_S(row);


    });
    //#endregion onkeypress qty and unit

    $(document).on("click", "#btnClearAll", function () {
        ClearAll();
    });

    //#region auto add row function
    function autoAddRow_S(currentRow) {

        let qty = parseFloat(currentRow.find(".JIDNI_Qty").val()) || 0;

        let itemCode = currentRow.find(".JIDNI_Item_Code").val();


        let isRowValid =
            itemCode &&
            qty > 0;

        // allow only last row
        let isLastRow =
            currentRow.is("#ItemTable_S tbody tr.NewRow:last");

        if (isRowValid && isLastRow) {

            // prevent multiple empty rows
            let nextRow = currentRow.next("tr");

            if (nextRow.length === 0) {

                $("#AddRowButton_S").trigger("click");
            }
        }
    }
    //#endregion auto add row function

    //#region add row item grid
    let rowIndex = 1; // start from 1 because 0 already exists

    $("#AddRowButton_S").on("click", function () {

        // 1. Validate last row before adding new row
        let isValid = true;


        $("#ItemTable_S tbody tr.NewRow:last").find("input, select").each(function () {

            let el = $(this);

            // skip hidden delete flag
            if (el.hasClass("JIDNI_IsDeleted")) return;

            if (el.hasClass("JIDNI_Item_Code")) {
                if (!el.val()) {
                    isValid = false;
                    el.focus();
                    return false;
                }
            }

            if (el.hasClass("JIDNI_Qty")) {
                if (!el.val() || parseFloat(el.val()) <= 0) {
                    isValid = false;
                    el.focus();
                    return false;
                }
            }

            if (el.hasClass("JIDNI_UnitPrice")) {
                if (!el.val() || parseFloat(el.val()) <= 0) {
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

        // 2. Clone template row
        let $newRow = $("#TempRow_S").clone();

        $newRow.removeAttr("id");
        $newRow.removeAttr("style");
        $newRow.addClass("NewRow");

        // 3. Clear values + update indexes
        $newRow.find("input, select").each(function () {

            let el = $(this);

            // reset checkbox
            if (el.attr("type") === "checkbox") {
                el.prop("checked", false);
            }

            // reset value except hidden template fields
            if (!el.hasClass("JIDNI_IsDeleted")) {
                el.val("");
            }

            // update name index Items[0] -> Items[1]
            let name = el.attr("name");
            if (name) {
                let updatedName = name.replace(/\[\d+\]/, `[${rowIndex}]`);
                el.attr("name", updatedName);
            }
        });
        let rowID =
            new Date().getTime();

        $newRow.attr(
            "data-rowid",
            rowID
        );
        // 4. Append row
        $("#TableBody_S").append($newRow);

        rowIndex++;

        // 5. Recalculate totals (optional hook)
        calculateTotal_S();
        //region item grid row focus out event
        //$("#ItemTable_S").on(
        //    "focusout",
        //    "tr.NewRow",
        //    function (e) {

        //        let row = $(this);

        //        setTimeout(() => {

        //            // check next focused element
        //            if (!row.find(document.activeElement).length) {

        //                // document.getElementById('SaveBatchButton').click();

        //            }

        //        }, 0);

        //    }
        //);

        //#endregion


    });
    //#endregion add row item grid

    //#region jwc address










    //#region Save Function

    function GetBatchMismatchRowIds() {
        return batchMismatchData
            .map(x => x.rowId)
            .join(",");
    }
    function CreateDeliveryNoteBatchModel() {

        let deliveryNoteBatches = [];

        $.each(DeliveryNoteItemBatchList, function () {

            let itemBatch = this;

            // Skip empty batch list
            if (
                !itemBatch.BatchList ||
                itemBatch.BatchList.length <= 0
            ) {
                return true;
            }

            $.each(itemBatch.BatchList, function () {

                let batch = this;

                // Skip empty qty
                if (
                    !batch.JIDNI_BCH_QtyInvoice ||
                    parseFloat(batch.JIDNI_BCH_QtyInvoice) <= 0
                ) {
                    return true;
                }

                //#region FORMAT DATE

                let formattedBatchDate = null;

                if (batch.JIDNI_BCH_BatchDate) {

                    let date =
                        new Date(batch.JIDNI_BCH_BatchDate);

                    if (!isNaN(date.getTime())) {

                        formattedBatchDate =
                            date.toISOString();
                    }
                }

                //#endregion

                let deliveryNoteBatch = {

                    JIDNI_BCH_Number:
                        parseInt(batch.JIDNI_BCH_Number) || 0,

                    JIDNI_BCH_JIDNH_Number:
                        parseInt(batch.JIDNI_BCH_JIDNH_Number) || 0,

                    JIDNI_BCH_JIDNI_Number:
                        parseInt(batch.JIDNI_BCH_JIDNI_Number) || 0,

                    JIDNI_BCH_WH_Number:
                        parseInt(batch.JIDNI_BCH_WH_Number) || 0,

                    // FIXED DATE FORMAT
                    JIDNI_BCH_BatchDate:
                        formattedBatchDate,

                    JIDNI_BCH_BatchNo:
                        batch.JIDNI_BCH_BatchNo || "",

                    JIDNI_BCH_BatchQty:
                        parseFloat(batch.JIDNI_BCH_QtyInvoice) || 0,

                    JIDNI_BCH_BatchUnitPrice:
                        parseFloat(batch.JIDNI_BCH_BatchUnitPrice) || 0,

                    JIDNI_BCH_BatchValue:
                        parseFloat(batch.JIDNI_BCH_BatchValue) || 0
                };

                deliveryNoteBatches.push(
                    deliveryNoteBatch
                );

            });

        });

        return deliveryNoteBatches;
    }

    //#endregion Save Function

    //#region remove checked rows
    $("#RemoveItemRowButton_S").on("click", function () {

        let checkedRows =
            $("#ItemTable_S tbody tr.NewRow:visible")
                .has(".CheckItem:checked");

        // minimum one row should exist
        let totalVisibleRows =
            $("#ItemTable_S tbody tr.NewRow:visible").length;

        if (checkedRows.length === 0) {

            alert("Please select row.");
            return;
        }

        if ((totalVisibleRows - checkedRows.length) < 0) {

            alert("At least one row required.");
            return;
        }
        if (checkedRows.length > 1) {
            alert("Please select only one row");
            return false;
        }
        checkedRows.each(function () {

            let currentRow = $(this);

            // visible row index
            let ItemGridindex =
                currentRow.index(
                    "#ItemTable_S tbody tr.NewRow:visible"
                ) + 1;





            $.ajax({

                url: '/DeliveryNote/DeleteTempDeliveryBatchRow',

                type: 'POST',

                data: { index: ItemGridindex },

                success: function (response) {
                    // remove selected row
                    currentRow.remove();
                    calculateTotal_S();
                },

                error: function (xhr) {

                    console.log(xhr.responseText);
                }
            });

        });



    });
    //#endregion remove checked rows



});



//#region ADD  ADDRESS ROW GRID ,VALIDATE ADDRESS GRID,VALIDATE TEMP ROW


function DateBind() {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var formattedDate = day + "-" + months[today.getMonth()] + "-" + today.getFullYear();

    var fp = document.getElementById("Header_JIDNH_DN_Date")._flatpickr;
    if (fp) fp.setDate(formattedDate, true, "d-M-Y");
}

//#region delete grid
function DeleteItemRowTempTable(inputElement) {
    let ItemGridindex =
        $(inputElement)
            .closest("tr")
            .index("#ItemTable_S tbody tr.NewRow:visible") + 1;
    $.ajax({

        url: '/DeliveryNote/TempDeliveryBatchDeleteChangeItemDBRow',

        type: 'POST',

        data: { index: ItemGridindex },

        success: function (response) {

            calculateTotal_S();
        },

        error: function (xhr) {

            console.log(xhr.responseText);
        }
    });
}



//#endregion


//#endregion





//#region Delivered Qty Validation



//#endregion


//#region Calculate Total
function calculateTotal_S() {

    let totalQty = 0;
    let totalAmount = 0;

    // Loop through each row (only active rows)
    $("#ItemTable_S tbody tr.NewRow").each(function () {

        let row = $(this);

        // Skip deleted rows
        if (row.find(".JIDNI_IsDeleted").val() === "1" ||
            row.find(".JIDNI_IsDeleted").val() === "true") {
            return;
        }

        // Get Qty
        let qty = parseFloat(row.find(".JIDNI_Qty").val()) || 0;



        // Add to totals
        totalQty += qty;

    });

    // Footer totals
    $("#TotalQty_S").val(totalQty.toFixed(2));

}
//#endregion Calculate Total

//#region item grid fetch item details
function OnInputItem(inputElement) {
    searchItemJIDNI(inputElement);
}

function OnFocusItem(inputElement) {

    var value = inputElement.value;

    if (!value) {
        searchItemJIDNI(inputElement);
    } else {
        $(inputElement).select();
    }
}

function searchItemJIDNI(inputElement) {

    let itemCode = inputElement.value;
    let row = $(inputElement).closest("tr");
    let resultsDiv = row.find(".search-results");

    let material = $("#Header_JIDNH_MS_Number").val();


    if (!material) return;

    $.ajax({
        url: '/jobinward/transactions/conversion/item',
        type: 'GET',
        data: {
            ItemCode: itemCode,
            MS: material
        },
        success: function (data) {

            resultsDiv.empty();

            if (data && data.length > 0) {

                resultsDiv.show();

                let table = $(`
                    <div class="card-body modal-content p-0 table-responsive">
                        <table class="table table-bordered table-hover table-fixed mb-0 table-grid">
                            <thead>
                                <tr class="table-info">
                                    <th>Item Code</th>
                                    <th>Description</th>
                                    <th>Item Group</th>
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
                            <td>${item.itemGroup}</td>
                        </tr>
                    `);
                    tr.css("height", "24px");
                    // CLICK SELECT
                    tr.on("click", function () {

                        // ✔ Visible field
                        row.find(".JIDNI_Item_Code").val(item.itemCode);

                        // ✔ Hidden fields
                        row.find(".JIDNI_Item_Number").val(item.itemNumber);
                        row.find(".JIDNI_Number").val(item.itemNumber);

                        // ✔ Fill details
                        row.find(".JIDNI_Item_Description").val(item.itemDescription);
                        row.find(".JIDNI_OuterDia").val(item.outerDia);
                        row.find(".JIDNI_Thickness").val(item.thickness);
                        row.find(".JIDNI_Length").val(item.length);
                        row.find(".JIDNI_Width").val(item.width);
                        row.find(".JIDNI_MaterialGrade").val(item.materialGrade);
                        row.find(".JIDNI_ItemGroup").val(item.itemGroup);

                        // ✔ Dropdowns
                        row.find(".JIDNI_UoM_Number").val(item.uoM);
                        row.find(".JIDNI_WH_Number").val(item.saleWarehouse);

                        // ✔ Move to Qty
                        let qtyInput = row.find(".JIDNI_Qty");
                        let qtyUnitprice = row.find(".JIDNI_UnitPrice");
                        qtyInput.focus();

                        setTimeout(function () {
                            qtyInput.select();
                            DeleteItemRowTempTable(inputElement);
                        }, 100);

                        // ✔ Decimal format (if needed)
                        let decimalPlaces = item.decimalPlaces || 2;

                        let qtyVal = qtyInput.val();
                        let qtyUnitpriceVal = qtyUnitprice.val();
                        qtyInput.val(QtyDecimalRupees(qtyVal, decimalPlaces));
                        qtyUnitprice.val(QtyDecimalRupees(qtyUnitpriceVal, decimalPlaces));

                        resultsDiv.hide();
                    });

                    table.find("tbody").append(tr);
                });

                //// CLOSE BUTTON
                //let closeButton = $(`
                //    <div class="card-header bg-primary py-1 px-1">
                //        <button type="button" class="p-0 float-end btn btn-sm btn-primary bg-opacity-10">
                //            ✖
                //        </button>
                //    </div>
                //`);

                //closeButton.on("click", function () {
                //    resultsDiv.hide();
                //});

                //resultsDiv.append(closeButton);
                resultsDiv.append(table);

            } else {
                resultsDiv.hide();
                resultsDiv.html('<p class="p-2">No results found</p>');
            }
        },
        error: function () {
            resultsDiv.text("Error loading data.");
            resultsDiv.show();
        }
    });
}

//#endregion item grid fetch item details



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

//#region SUBMIT VALIDATION
function validateHeaderById() {

    // 1. DN No
    if ($("#Header_JIDNH_DN_No").val().trim() === "") {
        showAlert('Conversion Journal No. is required', '#Header_JIDNH_DN_No');

        return false;
    }

    // 2. DN Date
    if ($("#Header_JIDNH_DN_Date").val().trim() === "") {
        showAlert('Date is required', '#Header_JIDNH_DN_Date');

        return false;
    }

    // 3. Material Segregation
    if ($("#Header_JIDNH_MS_Number").val() === "" || $("#Header_JIDNH_MS_Number").val() === "0") {
        showAlert('Material Segregation is required', '#Header_JIDNH_MS_Number');

        return false;
    }

    // 4. Shift
    if ($("#Header_JIDNH_Shift_Number").val() === "" || $("#Header_JIDNH_Shift_Number").val() === "0") {
        showAlert('Shift is required', '#Header_JIDNH_Shift_Number');

        return false;
    }


    // 5. WorkCentre
    if ($("#Header_JIDNH_WC_Number").val() === "" || $("#Header_JIDNH_WC_Number").val() === "0") {
        showAlert('WorkCentre is required', '#Header_JIDNH_WC_Number');

        return false;
    }

    // 6. Process
    if ($("#Header_JIDNH_PRS_Number").val() === "" || $("#Header_JIDNH_PRS_Number").val() === "0") {
        showAlert('Process is required', '#Header_JIDNH_PRS_Number');

        return false;
    }



    // 7. Operator
    if ($("#Header_JIDNH_Operator_Number").val() === "" || $("#Header_JIDNH_Operator_Number").val() === "0") {
        showAlert('Operator is required', '#Header_JIDNH_Operator_Number');

        return false;
    }




    // =========================
    // GRID VALIDATION CALL
    // =========================
    if (!validateItemGrid()) {
        return false;
    }

    if (!validateDeliveryNoteBatchList()) {
        return false;
    }

    return true;
}
//#endregion

//#region VALIDATE ITEM GRID,batchgrid

function validateItemGrid() {

    let hasValidRow = false;

    let isValid = true;

    $("#ItemTable_S tbody tr").each(function () {

        let row = $(this);

        // skip template row
        if (row.hasClass("TempRow_S")) return;

        // skip deleted row
        if (row.find(".JIDNI_IsDeleted").val() === "1") return;


        let itemCode = row.find(".JIDNI_Item_Code").val();
        let qty = row.find(".JIDNI_Qty").val();
        let unitPrice = row.find(".JIDNI_UnitPrice").val();

        // check if row has ANY data
        let isRowStarted =
            (itemCode && itemCode.trim() !== "") ||
            (qty && qty.trim() !== "") ||
            (unitPrice && unitPrice.trim() !== "");

        // if row is empty → skip
        if (!isRowStarted) return;

        // row is considered active
        hasValidRow = true;



        // validate Item Code
        if (!itemCode || itemCode.trim() === "") {
            showAlert('Item Code is required', row.find(".JIDNI_Item_Code"));

            isValid = false;
            return false;
        }

        // validate Qty
        if (!qty || qty.trim() === "" || qty.trim() === "0") {
            showAlert('Qty is required', row.find(".JIDNI_Qty"));

            isValid = false;
            return false;
        }


    });



    return isValid;
}


//#endregion VALIDATE ITEM GRID

//#region VALIDATE DELIVERY NOTE BATCH LIST

function validateDeliveryNoteBatchList() {

    let batchRows =
        $("#DeliveryNoteBatchList tbody tr")
            .not("#DeliveryNoteBatchTemplateRow");

    let hasValidQty = false;

    batchRows.each(function () {

        let row = $(this);

        let qty =
            row.find(".JIDNI_BCH_QtyInvoice").val();

        qty = parseFloat(qty) || 0;

        if (qty > 0) {

            hasValidQty = true;

            return false;
        }

    });

    if (!hasValidQty) {

        showAlert(
            "Please enter Delivered Qty in batch details",
            '#DeliveryNoteBatchList tbody tr:visible:first .JIDNI_BCH_QtyInvoice'
        );

        return false;
    }

    return true;
}
//#endregion

//#region TEMP DELIVERY BATCH MODEL
function CreateTempDeliveryBatchModel(row) {

    return {

        DBCH_Number:
            parseInt(row.find(".JIDNI_BCH_Number").val()) || 0,

        DBCH_Index:
            parseInt(row.index()) || 0,

        DBCH_DBCH_Number:
            parseInt(row.find(".JIDNI_BCH_Number").val()) || null,

        DBCH_Item_Number:
            parseInt($("#Header_JIDNI_Item_Number").val()) || 0,

        DBCH_Warehouse_Number:
            parseInt(row.find(".JIDNI_BCH_WH_Number").val()) || 0,

        DBCH_Date:
            row.find(".JIDNI_BCH_BatchDate").val(),

        DBCH_No:
            row.find(".JIDNI_BCH_BatchNo").val(),

        DBCH_Qty:
            parseFloat(
                row.find(".JIDNI_BCH_QtyInvoice").val()
            ) || 0,

        DBCH_UnitPrice:
            parseFloat(
                row.find(".JIDNI_BCH_BatchUnitPrice").val()
            ) || 0,

        DBCH_Value:
            parseFloat(
                row.find(".JIDNI_BCH_BatchValue").val()
            ) || 0,

        Mode: 1,

        CreatorCode: 1,

        CreatorDate:
            new Date().toISOString()
    };
}

//#endregion TEMP DELIVERY BATCH MODEL





