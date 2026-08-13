var addressIndex = 0;
 
function AutoFit() {
    fitInputWidth("Header_JIDNH_DN_No", 20, 30);
    fitInputWidth("Header_JIDNH_MS_Number", 20, 30);
    fitInputWidth("Header_JIDNH_Shift_Number", 20, 30);
    fitInputWidth("Header_JIDNH_WC_Number", 25, 30);
    fitInputWidth("Header_JIDNH_PRS_Number", 25, 30);
    fitInputWidth("Header_JIDNH_Operator_Number", 25, 30);
}
//#region Conversion resize functions

function ResizeConsumptionColumns() {
    ApplyFieldWidths({
        fields: ConversionConsumptionFields,
        container: "#ItemTable",
        tempRow: "#TempRow",
        tableBody: "#TableBody_F",
        searchTable: "#tblsearch"
    });
}

function ResizeProductionColumns() {
    ApplyFieldWidths({
        fields: ConversionProductionFields,
        container: "#ItemTable_P",
        tempRow: "#TempRow_P",
        tableBody: "#TableBody_P",
        searchTable: "#tblsearch"
    });
}

function ResizeScrapColumns() {
    ApplyFieldWidths({
        fields: ConversionScrapFields,
        container: "#ItemTable_S",
        tempRow: "#TempRow_S",
        tableBody: "#TableBody_S",
        searchTable: "#tblsearch"
    });
}

//#endregion
$(window).on("load", function () {

    setTimeout(function () {
      
        ResizeConsumptionColumns();
        ResizeProductionColumns();
        ResizeScrapColumns();
    }, 200);

});
function LoadDefaultFormSetting() {
    $.ajax({
        url: '/jobinward/transactions/conversion/get',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response && response.success && response.data) {
                var data = response.data;

                if (data.dfS_JICNVH_SFT_Number) {
                    $('#Header_JIDNH_Shift_Number').val(data.dfS_JICNVH_SFT_Number).trigger('change');
                }
                if (data.dfS_JICNVH_WC_Number) {
                    $('#Header_JIDNH_WC_Number').val(data.dfS_JICNVH_WC_Number).trigger('change');
                }
                if (data.dfS_JICNVH_Operator) {
                    $('#Header_JIDNH_Operator_Number').val(data.dfS_JICNVH_Operator);
                }
                if (data.dfS_JICNVH_PRS_Number) {
                    $('#Header_JIDNH_PRS_Number').val(data.dfS_JICNVH_PRS_Number).trigger('change');
                }
                if (data.dfS_JICNVH_MS_Number) {
                    $('#Header_JIDNH_MS_Number').val(data.dfS_JICNVH_MS_Number).trigger('change');
                }
            }
        },
        error: function (xhr) {
            console.error('Failed to load default form setting', xhr);
        }
    });
}
$(document).ready(function () {
    LoadDefaultFormSetting();
 
 

    $(document).on("keyup", "#ItemTable input", function () {
        ResizeConsumptionColumns();
    });

    $(document).on("change", "#ItemTable select", function () {
        ResizeConsumptionColumns();
    });
    $(document).on("keyup", "#ItemTable_P input", function () {
        ResizeProductionColumns();
    });

    $(document).on("change", "#ItemTable_P select", function () {
        ResizeProductionColumns();
    });

    $(document).on("keyup", "#ItemTable_S input", function () {
        ResizeScrapColumns();
    });

    $(document).on("change", "#ItemTable_S select", function () {
        ResizeScrapColumns();
    });
    //#region autofitheader
    AutoFit();

    const headerFieldWidths = {
        Header_JIDNH_DN_No: [20, 30],
        Header_JIDNH_Operator_Number: [25, 30]
    };

    $(document).on("input keyup", "#Header_JIDNH_DN_No, #Header_JIDNH_Operator_Number", function () {
        const [min, max] = headerFieldWidths[this.id];
        fitInputWidth(this, min, max);
    });

    $(document).on("change", "#Header_JIDNH_MS_Number, #Header_JIDNH_Shift_Number, #Header_JIDNH_WC_Number, #Header_JIDNH_PRS_Number", function () {
        const selectWidths = {
            Header_JIDNH_MS_Number: [20, 30],
            Header_JIDNH_Shift_Number: [20, 30],
            Header_JIDNH_WC_Number: [25, 30],
            Header_JIDNH_PRS_Number: [25, 30]
        };
        const [min, max] = selectWidths[this.id];
        fitInputWidth(this, min, max);
    });
 //#region autofitheader
   
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
    $("#TableBody_F").on("keyup change", ".JIDNI_Qty", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat(row.find(".JIDNI_Qty").val()) || 0;
      

        
        // update footer totals separately
        calculateTotal_F();
        // auto add row
        autoAddRow_F(row);


    });
    //#endregion onkeypress qty and unit

    $(document).on("click", "#btnClearAll", function () {
        ClearAll();
    });

    //#region auto add row function
    function autoAddRow_F(currentRow) {

        let qty = parseFloat(currentRow.find(".JIDNI_Qty").val()) || 0;
  

        let itemCode = currentRow.find(".JIDNI_Item_Code").val();
       

        let isRowValid =
            itemCode &&
            qty > 0;

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

    //#region add row item grid
    let rowIndex = 1; // start from 1 because 0 already exists

    $("#AddRowButton").on("click", function () {

        // 1. Validate last row before adding new row
        let isValid = true;
     

        $("#ItemTable tbody tr.NewRow:last").find("input, select").each(function () {

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
        let $newRow = $("#TempRow").clone();

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
        $("#TableBody_F").append($newRow);

        rowIndex++;

        // 5. Recalculate totals (optional hook)
        calculateTotal_F();
        // 6. Resize columns for newly added row
        ResizeConsumptionColumns();
      
      
    });
    //#endregion add row item grid

    //#region jwc address










    //#region Save Function


     $("#btnSave").on("click", function (e) {

        if (!validateHeaderById_F()) {
            e.preventDefault();
            return false;
        }
        else if (batchMismatchData.length > 0) {
            var rowIds = GetBatchMismatchRowIds();
            alert("Batch Qty mismatch exists in rows: " + rowIds);
            e.preventDefault();
            return false;

           

            // continue save
        }

        else {

            var model = CreateDeliveryNoteModel();

            console.log(JSON.stringify(model));

            $.ajax({

                url: '/Conversion/SaveDeliveryNote',

                type: 'POST',

                contentType: 'application/json',

                data: JSON.stringify(model),

                success: function (response) {

                    if (response.success) {
                        ClearAll();
                        showAlert('Record Inserted')
                        DateBind();
                        window.location.reload();
                     //  window.location.href = response.redirectUrl;
                        console.log(JSON.stringify(model));
                    }

                },

                error: function (xhr) {

                    console.log(xhr.responseText);

                }

            });

        }

    }); 


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
    function CreateDeliveryNoteModel() {

        // =====================================
        // HEADER
        // =====================================
        var header = {

            JIDNH_Number:
                parseInt($("#Header_JIDNH_Number").val()) || 0,

            JIDNH_DN_No:
                $("#Header_JIDNH_DN_No").val(),

            JIDNH_DN_Date:
                new Date($("#Header_JIDNH_DN_Date").val())
                    .toISOString(),

            JIDNH_MS_Number:
                parseInt($("#Header_JIDNH_MS_Number").val()) || 0,

            JIDNH_Operator_Number:
              $("#Header_JIDNH_Operator_Number").val(),
                
            JIDNH_PRS_Number:
                parseInt($("#Header_JIDNH_PRS_Number").val()) || 0,
            JIDNH_Shift_Number:
                parseInt($("#Header_JIDNH_Shift_Number").val()) || 0,
            JIDNH_WC_Number:
                parseInt($("#Header_JIDNH_WC_Number").val()) || 0,
            
            JIDNI_Item_Code:
                $("#Header_JIDNI_Item_Code").val(),       

         
 
            DN_Id:
                parseInt($("#Header_DN_Id").val()) || null,

            DN_CUS_Number:
                parseInt($("#Header_DN_CUS_Number").val()) || null 
        };

        // =====================================
        // ITEMS
        // =====================================
        var items = [];

        $("#ItemTable tbody tr.NewRow").each(function () {

            let row = $(this);

            // Skip deleted rows
            if (row.find(".JIDNI_IsDeleted").val() == "true") {
                return;
            }

            // Skip empty rows
            if (!row.find(".JIDNI_Item_Number").val()) {
                return;
            }

            let item = {
              
                JIDNI_JIDNH_Number:
                    parseInt(row.find(".JIDNI_JIDNH_Number").val()) || 0,

                JIDNI_Number:
                    parseInt(row.find(".JIDNI_Number").val()) || 0,

                JIDNI_Item_Number:
                    parseInt(row.find(".JIDNI_Item_Number").val()) || 0,

                JIDNI_WH_Number:
                    parseInt(row.find(".JIDNI_WH_Number").val()) || 0,

                JIDNI_UoM_Number:
                    parseInt(row.find(".JIDNI_UoM_Number").val()) || 0,

                JIDNI_Qty:
                    parseFloat(row.find(".JIDNI_Qty").val()) || 0,

                JIDNI_UnitPrice:
                    parseFloat(row.find(".JIDNI_UnitPrice").val()) || 0,

                JIDNI_Amount:
                    parseFloat(row.find(".JIDNI_Amount").val()) || 0 
            };

            items.push(item);

        });

        
        // =====================================
        // FINAL MODEL
        // =====================================
        var deliveryNoteModel = {

            Header: header,
            Items: items,
            deliveryNoteBatches: CreateDeliveryNoteBatchModel(),
            Items_Production: CreateProductionItemModel(),

            ItemBatch_Production: CreateProductionBatchModel(),

            Items_Scrap: CreateScrapItemModel(),

            ItemBatch_Scrap: CreateScrapBatchModel()
          
          
        };
        console.log(deliveryNoteModel)

        return deliveryNoteModel;
       
    }


    function CreateProductionBatchModel() {

        let batches = [];

        $("#IBatTableBody_P tr.IBatNewRow").each(function () {

            let row = $(this);

            if (row.find(".RNI_BCH_IsDeleted").val() == "true")
                return;

            if (!row.find(".RNI_BCH_No").val())
                return;

            batches.push({

                RNI_BCH_No:
                    parseInt(row.find(".RNI_BCH_No").val()) || 0,

                RNI_BCH_Number:
                    row.find(".RNI_BCH_No").val(),

                RNI_BCH_Date:
                    row.find(".RNI_BCH_Date").val(),

                RNI_BCH_WH_Number:
                    row.find(".RNI_BCH_WH_Number").val(),

                RNI_BCH_Qty:
                    row.find(".RNI_BCH_Qty").val(),

                RNI_BCH_UnitPrice:
                    row.find(".RNI_BCH_UnitPrice").val(),

                RNI_BCH_Value:
                    row.find(".RNI_BCH_Value").val(),

                RNI_BCH_IsDeleted:
                    row.find(".RNI_BCH_IsDeleted").val(),

                RNI_BCH_Item_Number:
                    row.find(".RNI_BCH_Item_Number").val(),

                RNI_BCH_Item_Index:
                    parseInt(row.find(".RNI_BCH_Item_Index").val()) || 0
            });

        });

        return batches;
    }

    function CreateScrapBatchModel() {

        let batches = [];

        $("#IBatTableBody_S tr.IBatNewRow").each(function () {

            let row = $(this);

            if (row.find(".RNI_BCH_IsDeleted").val() == "true")
                return;

            if (!row.find(".RNI_BCH_No").val())
                return;

            batches.push({

                RNI_BCH_No:
                    parseInt(row.find(".RNI_BCH_No").val()) || 0,

                RNI_BCH_Number:
                    row.find(".RNI_BCH_No").val(),

                RNI_BCH_Date:
                    row.find(".RNI_BCH_Date").val(),

                RNI_BCH_WH_Number:
                    row.find(".RNI_BCH_WH_Number").val(),

                RNI_BCH_Qty:
                    row.find(".RNI_BCH_Qty").val(),

                RNI_BCH_UnitPrice:
                    row.find(".RNI_BCH_UnitPrice").val(),

                RNI_BCH_Value:
                    row.find(".RNI_BCH_Value").val(),

                RNI_BCH_IsDeleted:
                    row.find(".RNI_BCH_IsDeleted").val(),

                RNI_BCH_Item_Number:
                    row.find(".RNI_BCH_Item_Number").val(),

                RNI_BCH_Item_Index:
                    parseInt(row.find(".RNI_BCH_Item_Index").val()) || 0
            });

        });

        return batches;
    }
    function CreateProductionItemModel() {

        let items = [];

        $("#ItemTable_P tr.NewRow").each(function () {

            let row = $(this);

            if (row.find(".JIDNI_IsDeleted").val() == "true")
                return;

            if (!row.find(".JIDNI_Item_Number").val())
                return;

            items.push({

                JIRNI_Number:
                    parseInt(row.find(".JIDNI_Number").val()) || 0,

                JIRNI_JIRNH_Number:
                    parseInt(row.find(".JIDNI_JIDNH_Number").val()) || 0,

                PRS_Number:
                    row.find(".JIDNI_PRS_Number").val(),

                Item_Number:
                    row.find(".JIDNI_Item_Number").val(),

                WH_Number:
                    row.find(".JIDNI_WH_Number").val(),

                UoM_Number:
                    row.find(".JIDNI_UoM_Number").val(),

                Qty:
                    row.find(".JIDNI_Qty").val(),

                UnitPrice:
                    row.find(".JIDNI_UnitPrice").val(),

                Amount:
                    row.find(".JIDNI_Amount").val(),

                IsDeleted:
                    row.find(".JIDNI_IsDeleted").val()

            });

        });

        return items;
    }
    function CreateScrapItemModel() {

        let items = [];

        $("#ItemTable_S tr.NewRow").each(function () {

            let row = $(this);

            if (row.find(".JIDNI_IsDeleted").val() == "true")
                return;

            if (!row.find(".JIDNI_Item_Number").val())
                return;

            items.push({

                JIRNI_Number:
                    parseInt(row.find(".JIDNI_Number").val()) || 0,

                JIRNI_JIRNH_Number:
                    parseInt(row.find(".JIDNI_JIDNH_Number").val()) || 0,

                PRS_Number:
                    row.find(".JIDNI_PRS_Number").val(),

                Item_Number:
                    row.find(".JIDNI_Item_Number").val(),

                WH_Number:
                    row.find(".JIDNI_WH_Number").val(),

                UoM_Number:
                    row.find(".JIDNI_UoM_Number").val(),

                Qty:
                    row.find(".JIDNI_Qty").val(),

                UnitPrice:
                    row.find(".JIDNI_UnitPrice").val(),

                Amount:
                    row.find(".JIDNI_Amount").val(),

                IsDeleted:
                    row.find(".JIDNI_IsDeleted").val()

            });

        });

        return items;
    }

    //#endregion Save Function

    //#region remove checked rows
    $("#RemoveItemRowButton").on("click", function () {

        let checkedRows =
            $("#ItemTable tbody tr.NewRow:visible")
                .has(".CheckItem:checked");

        // minimum one row should exist
        let totalVisibleRows =
            $("#ItemTable tbody tr.NewRow:visible").length;

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
                    "#ItemTable tbody tr.NewRow:visible"
                )+1; 

            $.ajax({

                url: '/Conversion/DeleteTempDeliveryBatchRow',

                type: 'POST',

                data: { index: ItemGridindex },

                success: function (response) {
                    // remove selected row
                    currentRow.remove();
                    calculateTotal_F();
                },

                error: function (xhr) {

                    console.log(xhr.responseText);
                }
            });
       
        });
      
      

    });
    //#endregion remove checked rows

 

}); 
//#region GetConversionNumber
$(document).on("change", "#Header_JIDNH_DN_Date", function () {
    GetConversionNumber();
});

function GetConversionNumber() {

    let date = $("#Header_JIDNH_DN_Date").val();

    if (!date)
        return;

    $.ajax({
        url: "/conversion/transactions/conversion/next-cnv-number",
        type: "GET",
        data: { CNVDate: date },
        success: function (response) {
            if (!response || response.trim() === "") {
                alert("Please set numbering for this date range.");
                $("#Header_JIDNH_DN_No").val("");
                DateBind();

                return;
            }

            $("#Header_JIDNH_DN_No").val(response);

        },
        error: function () {
        }
    });
}
//#endregion

//#region ADD  ADDRESS ROW GRID ,VALIDATE ADDRESS GRID,VALIDATE TEMP ROW


function DateBind() {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var formattedDate = day + "-" + months[today.getMonth()] + "-" + today.getFullYear();

    var fp = document.getElementById("Header_JIDNH_DN_Date")._flatpickr;
    if (fp) fp.setDate(formattedDate, true, "d-M-Y");
    GetConversionNumber();
}

//#region delete grid
function DeleteItemRowTempTable(inputElement) {
    let ItemGridindex =
        $(inputElement)
            .closest("tr")
            .index("#ItemTable tbody tr.NewRow:visible") + 1;
    $.ajax({

        url: '/DeliveryNote/TempDeliveryBatchDeleteChangeItemDBRow',

        type: 'POST',

        data: { index: ItemGridindex },

        success: function (response) {
          
            calculateTotal_F();
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
function calculateTotal_F() {

    let totalQty = 0;
    let totalAmount = 0;

    // Loop through each row (only active rows)
    $("#ItemTable tbody tr.NewRow").each(function () {

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
    console.log('check first----:'+totalQty)
    // Footer totals
    $("#TotalQty_F").val(totalQty.toFixed(2));
 
}
//#endregion Calculate Total

//#region item grid fetch item details
  
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
function validateHeaderById_F() {

    // 1. DN No
    if ($("#Header_JIDNH_DN_No").val().trim() === "") {
        showAlert('Conversion Journal No. is required','#Header_JIDNH_DN_No');
        
        return false;
    }

    // 2. DN Date
    if ($("#Header_JIDNH_DN_Date").val().trim() === "") {
        showAlert('Date is required','#Header_JIDNH_DN_Date');
        
        return false;
    }

    // 3. Material Segregation
    if ($("#Header_JIDNH_MS_Number").val() === "" || $("#Header_JIDNH_MS_Number").val() === "0") {
        showAlert('Material Segregation is required','#Header_JIDNH_MS_Number');
        
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

   
 
    

    
    // =========================
    // GRID VALIDATION CALL
    // =========================
    if (!validateItemGrid_F()) {
        return false;
    }
    if (!validateDeliveryNoteBatchList_F()) {
        return false;
    }
    if (!validateProductionGrid()) {
        return false;
    }
    if (!validateProductionBatchList()) {
        return false;
    }
    if (!validateScrapGrid()) {
        return false;
    } 
 
    if (!validateScrapBatchList()) {
        return false;
    }


    return true;
}
//#endregion

//#region VALIDATE ITEM GRID,batchgrid
function validateItemGrid_F() {

    let hasValidRow = false;
    let isValid = true;

    $("#ItemTable tbody tr").each(function () {

        let row = $(this);

        // Skip template row
        if (row.hasClass("TempRow")) return;

        // Skip deleted row
        if (row.find(".JIDNI_IsDeleted").val() === "1") return;

        let itemCode = row.find(".JIDNI_Item_Code").val();
        let qty = row.find(".JIDNI_Qty").val();
        let unitPrice = row.find(".JIDNI_UnitPrice").val();

        // Check if row has any data
        let isRowStarted =
            (itemCode && itemCode.trim() !== "") ||
            (qty && qty.trim() !== "") ||
            (unitPrice && unitPrice.trim() !== "");

        // Empty row → skip
        if (!isRowStarted) return;

        hasValidRow = true;

        // Validate Item Code
        if (!itemCode || itemCode.trim() === "") {
            showAlert("Item Code is required", row.find(".JIDNI_Item_Code"));
            isValid = false;
            return false;
        }

        // Validate Qty
        if (!qty || qty.trim() === "" || qty.trim() === "0") {
            showAlert("Qty is required", row.find(".JIDNI_Qty"));
            isValid = false;
            return false;
        }

    });

    if (!hasValidRow) {
        showAlert("Please enter at least one consumption item.");
        isValid = false;
    }

    return isValid;
}
function validateProductionGrid() {

    let hasValidRow = false;
    let isValid = true;

    $("#TableBody_P tr").each(function () {

        let row = $(this);

        // Skip template row
        if (row.hasClass("TempRow_P"))
            return;

        let itemCode = row.find(".JIDNI_Item_Code").val();
        let warehouse = row.find(".JIDNI_WH_Number").val();
        let uom = row.find(".JIDNI_UoM_Number").val();
        let qty = row.find(".JIDNI_Qty").val();

        // Has user started entering this row?
        let isRowStarted =
            (itemCode && itemCode.trim() !== "") ||
            (warehouse && warehouse !== "0" && warehouse !== "") ||
            (uom && uom !== "0" && uom !== "") ||
            (qty && qty.trim() !== "" && qty.trim() !== "0");

        // Ignore completely empty rows
        if (!isRowStarted)
            return;

        hasValidRow = true;

        // Item Code
        if (!itemCode || itemCode.trim() === "") {
            showAlert("Item Code is required.", row.find(".JIDNI_Item_Code"));
            isValid = false;
            return false;
        }

        // Warehouse
        if (!warehouse || warehouse === "0") {
            showAlert("Warehouse is required.", row.find(".JIDNI_WH_Number"));
            isValid = false;
            return false;
        }

        // UOM
        if (!uom || uom === "0") {
            showAlert("UOM is required.", row.find(".JIDNI_UoM_Number"));
            isValid = false;
            return false;
        }

        // Production Qty
        if (!qty || qty.trim() === "" || parseFloat(qty) <= 0) {
            showAlert("Production Qty is required.", row.find(".JIDNI_Qty"));
            isValid = false;
            return false;
        }

    });

    if (!hasValidRow) {
        showAlert("Please enter at least one production item.");
        return false;
    }

    return isValid;
} 

function validateScrapGrid() {

    let hasValidRow = false;
    let isValid = true;

    $("#TableBody_S tr").each(function () {

        let row = $(this);

        // Skip template row
        if (row.hasClass("TempRow_S"))
            return;

        let itemCode = row.find(".JIDNI_Item_Code").val();
        let warehouse = row.find(".JIDNI_WH_Number").val();
        let uom = row.find(".JIDNI_UoM_Number").val();
        let qty = row.find(".JIDNI_Qty").val();

        // Has user started entering this row?
        let isRowStarted =
            (itemCode && itemCode.trim() !== "") ||
            (warehouse && warehouse !== "0" && warehouse !== "") ||
            (uom && uom !== "0" && uom !== "") ||
            (qty && qty.trim() !== "" && qty.trim() !== "0");

        // Ignore completely empty rows
        if (!isRowStarted)
            return;

        hasValidRow = true;

        // Item Code
        if (!itemCode || itemCode.trim() === "") {
            showAlert("Item Code is required.", row.find(".JIDNI_Item_Code"));
            isValid = false;
            return false;
        }

        // Warehouse
        if (!warehouse || warehouse === "0") {
            showAlert("Warehouse is required.", row.find(".JIDNI_WH_Number"));
            isValid = false;
            return false;
        }

        // UOM
        if (!uom || uom === "0") {
            showAlert("UOM is required.", row.find(".JIDNI_UoM_Number"));
            isValid = false;
            return false;
        }

        // Scrap Qty
        if (!qty || qty.trim() === "" || parseFloat(qty) <= 0) {
            showAlert("Scrap Qty is required.", row.find(".JIDNI_Qty"));
            isValid = false;
            return false;
        }

    });

    if (!hasValidRow) {
        showAlert("Please enter at least one scrap item.");
        return false;
    }

    return isValid;
}
//#endregion VALIDATE ITEM GRID



//#region VALIDATE DELIVERY NOTE BATCH LIST

function validateDeliveryNoteBatchList_F() {

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
            "Please enter Consumed Qty in batch details",
            '#DeliveryNoteBatchList tbody tr:visible:first .JIDNI_BCH_QtyInvoice'
        );

        return false;
    }

    return true;
}

function validateProductionBatchList() {

    let batchRows =
        $("#IBatTableBody_P tr")
            .not("#IBatTempRow");

    let hasValidQty = false;

    batchRows.each(function () {

        let row = $(this);

        // Skip deleted rows
        if (row.find(".RNI_BCH_IsDeleted").val() === "true")
            return;

        let qty = row.find(".RNI_BCH_Qty").val();

        qty = parseFloat(qty) || 0;

        if (qty > 0) {

            hasValidQty = true;

            return false;
        }

    });

    if (!hasValidQty) {

        showAlert(
            "Please enter Production Qty in batch details",
            "#IBatTableBody_P tr:visible:first .RNI_BCH_Qty"
        );

        return false;
    }

    return true;
}
function validateScrapBatchList() {

    let batchRows =
        $("#IBatTableBody_S tr")
            .not("#IBatTempRow");

    let hasValidQty = false;

    batchRows.each(function () {

        let row = $(this);

        // Skip deleted rows
        if (row.find(".RNI_BCH_IsDeleted").val() === "true")
            return;

        let qty = row.find(".RNI_BCH_Qty").val();

        qty = parseFloat(qty) || 0;

        if (qty > 0) {

            hasValidQty = true;

            return false;
        }

    });

    if (!hasValidQty) {

        showAlert(
            "Please enter Scrap Qty in batch details",
            "#IBatTableBody_S tr:visible:first .RNI_BCH_Qty"
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

//#region datebind
function DateBind() {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var formattedDate = day + "-" + months[today.getMonth()] + "-" + today.getFullYear();

    var fp = document.getElementById("Header_JIDNH_DN_Date")._flatpickr;
    if (fp) fp.setDate(formattedDate, true, "d-M-Y");
}
//#endregion

//#region ApplyIBatFieldWidths
function ApplyIBatFieldWidths(suffix) {
    const fields = [
        { cls: ".RNI_BCH_Date", min: 10, max: 10, align: "center" },
        { cls: ".RNI_BCH_No", min: 15, max: 30, align: "left" },
        { cls: ".RNI_BCH_Qty", min: 10, max: 20, align: "right" },
        { cls: ".RNI_BCH_UnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".RNI_BCH_Value", min: 13, max: 25, align: "right" }
    ];

    const tableBodyId = "IBatTableBody_" + suffix;
    const $table = $("#" + tableBodyId).closest("table");

    fields.forEach(f => {
        const controls = $table.find(
            "#" + tableBodyId + " > #IBatTempRow " + f.cls +
            ", #" + tableBodyId + " > tr.IBatNewRow " + f.cls
        );
        if (!controls.length) return;

        const sample = controls.first()[0];
        const minWidth = chToPx(f.min, sample);
        const maxWidth = f.max != null ? chToPx(f.max, sample) : Number.MAX_SAFE_INTEGER;
        let requiredWidth = minWidth;

        controls.each(function () {
            let text = (this.tagName === "SELECT")
                ? (this.options[this.selectedIndex]?.text || "")
                : (this.value || "");
            requiredWidth = Math.max(requiredWidth, getTextWidth(text.trim(), this));
        });

        requiredWidth = Math.min(requiredWidth, maxWidth);
        if (f.cls === ".RNI_BCH_UnitPrice" || f.cls === ".RNI_BCH_Value") {
            requiredWidth = Math.min(requiredWidth + 8, maxWidth);
        }

        controls.each(function () {
            this.style.setProperty("width", "100%", "important");
            this.style.setProperty("box-sizing", "border-box", "important");
            this.style.setProperty("text-align", f.align, "important");
            this.style.setProperty("padding", "2px", "important");

            const td = $(this).closest("td")[0];
            td.style.setProperty("width", requiredWidth + "px", "important");
            td.style.setProperty("min-width", minWidth + "px", "important");
            td.style.setProperty("max-width", maxWidth + "px", "important");

            const th = $table.find("thead th").eq(td.cellIndex)[0];
            if (th) {
                th.style.setProperty("width", requiredWidth + "px", "important");
                th.style.setProperty("min-width", minWidth + "px", "important");
                th.style.setProperty("max-width", maxWidth + "px", "important");
            }
        });
    });
}
//#endregion

