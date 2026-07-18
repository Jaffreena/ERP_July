//#region item grid alignment

function ApplyHeaderAlignment(container = "#ItemTable") {

    const fields = [
        { cls: ".PRS_Number", min: 15, max: 30, align: "left" },
        { cls: ".Item_Code", min: 18, max: 18, align: "left" },
        { cls: ".Description", min: 30, max: 45, align: "left" },

        { cls: ".OuterDia", min: 10, max: 10, align: "center" },
        { cls: ".Thickness", min: 10, max: 10, align: "center" },
        { cls: ".Length", min: 10, max: 10, align: "center" },
        { cls: ".Width", min: 10, max: 10, align: "center" },

        { cls: ".MaterialGrade", min: 15, max: 25, align: "left" },
        { cls: ".ItemGroup", min: 15, max: 30, align: "left" },
        { cls: ".WH_Number", min: 15, max: 25, align: "left" },

        { cls: ".UoM_Number", min: 10, max: 15, align: "center" },

       
        { cls: ".OriginalQty", min: 11, max: 20, align: "center" },
        { cls: ".UsedQty", min: 11, max: 20, align: "center" },
        { cls: ".AmendQty", min: 11, max: 20, align: "center" },

        { cls: ".UnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".Amount", min: 13, max: 25, align: "right" }
    ];

    fields.forEach(f => {

        const header = $(container)
            .find("thead th")
            .filter(function () {
                return $(this).hasClass(f.cls.replace(".", ""));
            });

        header.css("text-align", f.align);

    });
}

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
function ApplyFieldWidths(container = "#ItemTable") {

    const fields = [
        { cls: ".PRS_Number", min: 15, max: 30, align: "left" },
        { cls: ".Item_Code", min: 18, max: 18, align: "left" },
        { cls: ".Description", min: 30, max: 45, align: "left" },

        { cls: ".OuterDia", min: 10, max: 10, align: "center" },
        { cls: ".Thickness", min: 10, max: 10, align: "center" },
        { cls: ".Length", min: 10, max: 10, align: "center" },
        { cls: ".Width", min: 10, max: 10, align: "center" },

        { cls: ".MaterialGrade", min: 15, max: 25, align: "left" },
        { cls: ".ItemGroup", min: 15, max: 30, align: "left" },
        { cls: ".WH_Number", min: 15, max: 25, align: "left" },

        { cls: ".UoM_Number", min: 10, max: 15, align: "center" },

      
        { cls: ".OriginalQty", min: 11, max: 20, align: "center" },
        { cls: ".UsedQty", min: 11, max: 20, align: "center" },
        { cls: ".AmendQty", min: 11, max: 20, align: "center" },

        { cls: ".UnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".Amount", min: 13, max: 25, align: "right" }
    ];

    const $container = $(container);

    // Checkbox column width
    const checkWidth = 40;

    $container.find("thead th:first-child, tfoot td:first-child").css({
        width: checkWidth + "px",
        minWidth: checkWidth + "px",
        maxWidth: checkWidth + "px",
        textAlign: "center"
    });

    $container.find("tbody > tr > td:first-child").css({
        width: checkWidth + "px",
        minWidth: checkWidth + "px",
        maxWidth: checkWidth + "px",
        textAlign: "center"
    });

    fields.forEach(f => {

        const controls = $container.find(
            "#TempRow " + f.cls +
            ", #TableBody > tr.NewRow " + f.cls
        ).filter(function () {
            return $(this).closest("#tblsearch").length === 0;
        });

        if (!controls.length)
            return;

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
            }
            else if (this.tagName === "INPUT" || this.tagName === "TEXTAREA") {
                text = this.value || "";
            }
            else {
                text = this.textContent || "";
            }

            text = text.trim();

            requiredWidth = Math.max(
                requiredWidth,
                getTextWidth(text, this)
            );
        });

        requiredWidth = Math.min(requiredWidth, maxWidth);

        // Extra space for numeric fields
        if (
            f.cls === ".UnitPrice" ||
            f.cls === ".Amount" ||
            f.cls === ".Qty" ||
            f.cls === ".OriginalQty" ||
            f.cls === ".UsedQty" ||
            f.cls === ".AmendQty"
        ) {
            requiredWidth = Math.min(requiredWidth + 8, maxWidth);
        }

        controls.each(function () {

            $(this).css({
                width: requiredWidth + "px",
                minWidth: minWidth + "px",
                maxWidth: maxWidth + "px",
                textAlign: f.align,
                padding: "4px"
            });

            // Auto height for Description textarea
            if (f.cls === ".Description" && this.tagName === "TEXTAREA") {

                const charsPerLine = 20;
                const lines = Math.max(
                    1,
                    Math.ceil(this.value.length / charsPerLine)
                );

                const lineHeight = parseFloat(
                    window.getComputedStyle(this).lineHeight
                );

                const extraHeight = 12;

                this.style.height =
                    (lines * lineHeight + extraHeight) + "px";

                this.style.setProperty(
                    "resize",
                    "none",
                    "important"
                );

                this.style.setProperty(
                    "overflow",
                    "hidden",
                    "important"
                );
            }

            // Apply width to table cell only
            const td = $(this).closest("td");

            if (td.closest("#tblsearch").length === 0) {

                td.css({
                    width: requiredWidth + "px",
                    minWidth: minWidth + "px",
                    maxWidth: maxWidth + "px",
                    padding: "4px"
                });
            }
        });
    });

    ApplyHeaderAlignment("#ItemTable");
}


//#endregion
function BindHeader(h) {

    $("#RN_No").val(h.JIRNH_RN_No);
    $("#RN_Date").val(h.JIRNH_RN_Date);

    $("#JW_CustomerDC_No").val(h.JIRNH_JW_CustomerDC_No);
    $("#JW_CustomerDC_Date").val(h.JIRNH_JW_CustomerDC_Date);

    $("#MS_Number").val(h.JIRNH_MS_Number).trigger("change");

    $("#JWC_Number").val(h.JIRNH_JWC_Number);
    $("#JWC_Name").val(h.CUS_Name);

    $("#Currency_Number").val(h.JIRNH_Currency_Number);
    $("#Currency_Name").val(h.CurrencyCode);

    $("#WH_Number").val(h.JIRNH_WH_Number).trigger("change");

    $("#Remarks").val(h.JIRNH_Remarks || "");
    fitInputWidth("RN_No",20);
    fitInputWidth("JW_CustomerDC_No", 20);
    fitInputWidth("Remarks", 40, 80);
   
    fitInputWidth("MS_Number", 20);
    fitInputWidth("Currency_Name", 10);
    fitInputWidth("WH_Number", 20);
    
}

function BindItems_Edit(items) {
    console.log(items);

    $("#TableBody tr.NewRow").remove();

    $.each(items, function (i, item) {

        let row = $("#TempRow").clone();

        row.removeAttr("id");
        row.addClass("NewRow");
        row.show();

        row.find(".PRS_Number").val(item.JIRNI_PRS_Number);
        row.find(".JIRNI_Number").val(item.JIRNI_Number);
        row.find(".Item_Number").val(item.JIRNI_Item_Number);
        row.find(".Item_Code").val(item.JIRNI_Item_Code);
        row.find(".Description").val(item.JIRNI_Description);

        row.find(".OuterDia").val(item.JIRNI_OuterDia);
        row.find(".Thickness").val(item.JIRNI_Thickness);
        row.find(".Length").val(item.JIRNI_Length);
        row.find(".Width").val(item.JIRNI_Width);
        row.find(".MaterialGrade").val(item.JIRNI_MaterialGrade);
        row.find(".ItemGroup").val(item.JIRNI_ItemGroup);
        row.find(".WH_Number").val(item.JIRNI_WH_Number);
        row.find(".UoM_Number").val(item.JIRNI_UoM_Number);

        row.find(".OriginalQty").val(formatIndianQty(item.JIRNI_Qty));
        row.find(".UsedQty").val(formatIndianQty(item.UsedQty));

        let amendQty = (parseFloat(item.JIRNI_Qty) || 0) - (parseFloat(item.UsedQty) || 0);

        row.find(".AmendQty").val(formatIndianQty(item.JIRNI_Qty)); // or formatIndianQty(amendQty) if that's intended

        row.find(".UnitPrice").val(formatIndianCurrency(item.JIRNI_UnitPrice));

        row.find(".Amount").val(formatIndianCurrency(item.JIRNI_Amount));

        $("#TableBody").append(row);

    });

    calculateTotal_rn();
}
function LoadReceiptNote(receiptNo) {

    $.ajax({
        url: "/jobinward/transactions/receipt-note/get",
        type: "GET",
        dataType: "json",
        data: {
            JIRNH_Number: receiptNo
        },
        success: function (response) {

            console.log("Receipt Note Response:", response);

            // Server returned failure
            if (response.success === false) {
                alert(response.message);
                return;
            }

            // Check response
            if (!response ||
                !response.header ||
                response.header.length === 0) {

                alert("No data found.");
                return;
            }

            //==========================
            // Bind Header
            //==========================
            BindHeader(response.header[0]);

            //==========================
            // Bind Items
            //==========================
            if (response.items && response.items.length > 0) {

                BindItems_Edit(response.items);
                // Bind Batch Array
                if (response.itemBatch && response.itemBatch.length > 0) {

                    BindItemBatches_RN(response.itemBatch);

                }

            } else {

                BindItems_Edit([]);
            }
           

        },
        error: function (xhr, status, error) {

            console.log("Status :", status);
            console.log("Error  :", error);
            console.log("Response :", xhr.responseText);

            alert("Failed to load Receipt Note.");
        }
    });

}
function BindItemBatches_RN(itemBatches) {

    batchMismatchData_RN = [];

    $("#TableBody tr.NewRow").each(function (index) {

        let row = $(this);

        let rowId = index + 1;

        let jirniNumber = parseInt(row.find(".JIRNI_Number").val()) || 0;
        let itemNumber = parseInt(row.find(".Item_Number").val()) || 0;
        let whNumber = parseInt(row.find(".WH_Number").val()) || 0;

        console.log("Row JIRNI :", jirniNumber);

        let batches = itemBatches
            .filter(batch => (parseInt(batch.JIRNI_BCH_JIRNI_Number) || 0) === jirniNumber)
            .map(batch => ({
                JIRNI_Number: parseInt(batch.JIRNI_BCH_JIRNI_Number) || 0,

                RNI_BCH_Date: batch.JIRNI_BCH_BatchDate,
                RNI_BCH_No: batch.JIRNI_BCH_BatchNo,
                RNI_BCH_Number: parseInt(batch.JIRNI_BCH_Number) || 0,
                RNI_BCH_Item_Number: itemNumber,
                RNI_BCH_WH_Number: whNumber,

                RNI_BCH_Qty: parseFloat(batch.JIRNI_BCH_BatchQty) || 0,
                RNI_BCH_UnitPrice: parseFloat(batch.JIRNI_BCH_BatchUnitPrice) || 0,
                RNI_BCH_Value: parseFloat(batch.JIRNI_BCH_BatchValue) || 0,

                RNI_BCH_UsedQty: parseFloat(batch.UsedQty) || 0,
                RNI_BCH_AmendQty:
                    (parseFloat(batch.JIRNI_BCH_BatchQty) || 0) -
                    (parseFloat(batch.UsedQty) || 0)
            }));

        batchMismatchData_RN.push({
            rowId: rowId,
            batchValues: batches
        });

    });

    console.log(batchMismatchData_RN);
}

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

 
//#region remove checked rows
$("#RemoveItemRowButton").on("click", function () {

    let checkedRows =
        $("#ItemTable tbody tr.NewRow:visible")
            .has(".CheckItem:checked");

    let totalVisibleRows =
        $("#ItemTable tbody tr.NewRow:visible").length;

    if (checkedRows.length === 0) {
        alert("Please select at least one row.");
        return;
    }

    // Keep at least one row
    if ((totalVisibleRows - checkedRows.length) < 1) {
        alert("At least one row is required.");
        return;
    }

    // Confirmation
    if (!confirm("Are you sure you want to delete the selected row(s)?")) {
        return;
    }

    checkedRows.remove();

    calculateTotal_rn();

});
//#endregion remove checked rows

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
    fitInputWidth("RN_No", 20, 30);
    fitInputWidth("JW_CustomerDC_No", 20, 30);
    fitInputWidth("Remarks", 40, 80);

    fitInputWidth("RN_Date", 15, 15);
    fitInputWidth("MS_Number", 20, 20);
    fitInputWidth("Currency_Name", 10, 15);
    fitInputWidth("WH_Number", 20, 20);
}
$(document).ready(function () {
    //#region item grid alignment
    ApplyFieldWidths("#ItemTable");

    $(document).on("input change blur", "#ItemTable input, #ItemTable textarea, #ItemTable select", function () {
        ApplyFieldWidths("#ItemTable");
    });
    $(document).on("focusin", ".Amount", function () {
        ApplyFieldWidths("#ItemTable");
    });
    //#endregion
    AutoFit();
    $(document).on("input keyup", "#RN_No, #JW_CustomerDC_No", function () {
        fitInputWidth(this, 20, 30);
    });
    $(document).on("change", "#MS_Number, #WH_Number", function () {
        fitInputWidth(this, 20, 20);
    });
 
    //#region  search logic highlight

    $(document).on("keydown", "#JWC_Name", function (e) {

        let input = $(this);
        let resultsDiv = input.siblings(".buyer-search-results");
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

    //#endregion
    $(document).on("focusout", ".UnitPrice", function () {
        let value = removeCommas($(this).val());

        $(this)
            .attr("data-value", value)
            .val(formatIndianCurrency(value));
    });

    $(document).on("focusout", ".AmendQty", function () {
        let value = removeCommas($(this).val());

        $(this)
            .attr("data-value", value)
            .val(formatIndianQty(value));
    });
 
    $(document).on("focusout", ".AmendQty", function () {

        let row = $(this).closest("tr");

        let originalQty = parseFloat((row.find(".OriginalQty").val() || "0").replace(/,/g, "")) || 0;

        let usedQty = parseFloat((row.find(".UsedQty").val() || "0").replace(/,/g, "")) || 0;

        let amendQty = parseFloat(($(this).val() || "0").replace(/,/g, "")) || 0;

        let minimumQty = originalQty - usedQty;

        if (amendQty < minimumQty) {

            alert("Amend Qty cannot be less than " + formatIndianQty(minimumQty));

            $(this).val(formatIndianQty(minimumQty));

            return;
        }
        $(this).val(formatIndianQty(amendQty));
        let value = removeCommas($(this).val());

        $(this)
            .attr("data-value", value)
            .val(formatIndianQty(value));

       
    });
    $("#AddRowButton").trigger("click");
    $(document).on("keyup change", ".AmendQty, .UnitPrice", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat(row.find(".AmendQty").attr("data-value")) || 0;
        let unitPrice = parseFloat(row.find(".UnitPrice").attr("data-value")) || 0;

        let amount = qty * unitPrice;

        row.find(".Amount")
            .val(formatIndianCurrency(amount))
            .attr("data-value", amount);

        calculateTotal_rn();
    });
    $("#btnSave").on("click", function (e) {

        e.preventDefault();

        if (!validateHeaderById_RN()) {
            return false;
        } else if (batchWrongMismatchData_RN.length > 0) {

            var rowIds = batchWrongMismatchData_RN
                .map(x => x.rowId)
                .join(", ");

            alert("Batch Qty mismatch exists in rows: " + rowIds);

            e.preventDefault();

            return false;
        }

        var dto = GetReceiptNoteDTO_Edit();   // We'll create this function next
        console.log(dto);                     // Object
        console.log('111111111111----'+JSON.stringify(dto));
        console.log(GetHeader_Edit())
        // JSON
        $.ajax({
            url: "/Receipt_Note/UpdateReceiptNote",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(dto),
            success: function (res) {

               
                    ClearAll();
                    showAlert('Record Updated')
                DateBind();
                $("#AddRowButton").trigger("click");
                  //  window.location.href = res.redirectUrl;
              
            },
            error: function (xhr) {
                alert(xhr.responseText);
            }
        });

    });


   
    $(document).on("click focusin", "#IBatTableBody input", function (e) {
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

    const params = new URLSearchParams(window.location.search);
    const receiptNo = params.get("SI_No");

    if (receiptNo) {
        LoadReceiptNote(receiptNo);
        JIRNH_Number_Global = receiptNo;
    }


    $(document).on("input", "#RN_No, #JW_CustomerDC_No", function () {
        fitInputWidth(this,20);
    });

});
var JIRNH_Number_Global;
function GetReceiptNoteDTO_Edit() {

    var dto = {
        Mode: "Save",

        Header: GetHeader_Edit(),

        Items: GetItems_Edit(),

        ItemBatch: GetItemBatches_Edit()
    };

    return dto;
}
function GetHeader_Edit() {

    return {
        JIRNH_Number: JIRNH_Number_Global,
        RN_No: $("#RN_No").val(),
        RN_Date: $("#RN_Date").val(),

        JWC_Number: $("#JWC_Number").val(),

        Currency_Number: $("#Currency_Number").val(),

        JW_CustomerDC_No: $("#JW_CustomerDC_No").val(),
        JW_CustomerDC_Date: $("#JW_CustomerDC_Date").val(),

        MS_Number: $("#MS_Number").val(),

        Remarks: $("#Remarks").val(),

        WH_Number: $("#WH_Number").val()

    };

}

function GetItemBatches_Edit() {

    let batches = [];

    batchMismatchData_RN.forEach(function (item) {

        item.batchValues.forEach(function (batch) {

            batches.push({
                JIRNI_Number: batch.JIRNI_Number == null || batch.JIRNI_Number === ""
                    ? 0
                    : parseInt(batch.JIRNI_Number),

                RNI_BCH_Item_Index: item.rowId,

                RNI_BCH_Item_Number: batch.RNI_BCH_Item_Number,

                RNI_BCH_WH_Number: batch.RNI_BCH_WH_Number,

                RNI_BCH_Date: batch.RNI_BCH_Date,

                RNI_BCH_No: batch.RNI_BCH_Number,

                RNI_BCH_Number: batch.RNI_BCH_No,

                RNI_BCH_OriginalQty: (batch.RNI_BCH_Qty || "").toString().replace(/,/g, ""),

                RNI_BCH_UsedQty: (batch.RNI_BCH_UsedQty || "").toString().replace(/,/g, ""),

                RNI_BCH_Qty: (batch.RNI_BCH_AmendQty || "").toString().replace(/,/g, ""),

                RNI_BCH_UnitPrice: (batch.RNI_BCH_UnitPrice || "").toString().replace(/,/g, ""),

                RNI_BCH_Value: (batch.RNI_BCH_Value || "").toString().replace(/,/g, ""),

                RNI_BCH_IsDeleted: batch.RNI_BCH_IsDeleted || "false"
            });

        });

    });

    return batches;
}
function GetItems_Edit() {

    var items = [];
    var itemIndex = 1;

    $("#TableBody tr.NewRow:visible").each(function () {

        var row = $(this);

        if (row.find(".IsDeleted").val() === "1")
            return;

        let itemNumber = row.find(".Item_Number").val();

        if (itemNumber && itemNumber.trim() !== "") {
            items.push({
                Item_Index: itemIndex++,

                JIRNI_Number: row.find(".JIRNI_Number").val() || 0,
                Item_Number: itemNumber,
                PRS_Number: row.find(".PRS_Number").val(),
                WH_Number: row.find(".WH_Number").val(),
                UoM_Number: row.find(".UoM_Number").val(),

                Qty: String(row.find(".AmendQty").attr("data-value") || "0"),
                UnitPrice: String(row.find(".UnitPrice").attr("data-value") || "0"),
                Amount: String(row.find(".Amount").attr("data-value") || "0"),

                IsDeleted: "0"
            });
        }
    });

    return items;
}

function DateBind() {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var formattedDate = day + "-" + months[today.getMonth()] + "-" + today.getFullYear();

    var fp = document.getElementById("RN_Date")._flatpickr;
    if (fp) fp.setDate(formattedDate, true, "d-M-Y");
}
//#region SUBMIT VALIDATION
function validateHeaderById_RN() {

    // 1. Receipt Note No
    if ($("#RN_No").val().trim() === "") {
        showAlert('Receipt Note No. is required', '#RN_No');
        return false;
    }

    // 2. Receipt Note Date
    if ($("#RN_Date").val().trim() === "") {
        showAlert('Receipt Note Date is required', '#RN_Date');
        return false;
    }

    // 3. Customer DC No
    if ($("#JW_CustomerDC_No").val().trim() === "") {
        showAlert('Customer DC No. is required', '#JW_CustomerDC_No');
        return false;
    }

    // 4. Customer DC Date
    if ($("#JW_CustomerDC_Date").val().trim() === "") {
        showAlert('Customer DC Date is required', '#JW_CustomerDC_Date');
        return false;
    }

    // 5. Material Segregation
    if ($("#MS_Number").val() === "" || $("#MS_Number").val() === "0") {
        showAlert('Material Segregation is required', '#MS_Number');
        return false;
    }

    // 6. Job Work Customer
    if ($("#JWC_Number").val() === "" || $("#JWC_Number").val() === "0") {
        showAlert('Job Work Customer is required', '#JWC_Name');
        return false;
    }

    // 7. Warehouse
    if ($("#WH_Number").val() === "" || $("#WH_Number").val() === "0") {
        showAlert('Warehouse is required', '#WH_Number');
        return false;
    }
     

   
    if (!validateItemGrid_RN()) {
        return false;
    }
    if (!ValidateItemBatchMapping()) {
        return false;
    }

    if (!ValidateItemBatches_RN()) {
        return false;
    }
    if (!ValidateAmendQtyGrid()) {
        return false;
    }

    return true;
}
function ValidateAmendQtyGrid() {

    let isValid = true;

    $("#TableBody tr.NewRow").each(function () {

        let originalQty =
            parseFloat($(this).find(".OriginalQty").val()) || 0;

        let usedQty =
            parseFloat($(this).find(".UsedQty").val()) || 0;

        let amendQty =
            parseFloat($(this).find(".AmendQty").val()) || 0;

        if (amendQty < usedQty) {

            alert("Amend Qty cannot be less than " + usedQty);

            $(this).find(".AmendQty")
                .val(originalQty.toFixed(3))
                .focus();

            isValid = false;

            return false; // break loop
        }

    });

    return isValid;
}
function ValidateItemBatchMapping() {

    let itemRows = $("#TableBody tr.NewRow");

    for (let i = 0; i < itemRows.length; i++) {

        let rowId = i + 1;

        let item = batchMismatchData_RN.find(x => x.rowId == rowId);

        if (!item || !item.batchValues || item.batchValues.length === 0) {

            showAlert("Please enter at least one batch for Item " + rowId + ".");
            return false;
        }

        let hasValidBatch = item.batchValues.some(function (batch) {

            if (batch.RNI_BCH_IsDeleted === "true")
                return false;

            return (
                batch.RNI_BCH_Date &&
                batch.RNI_BCH_No &&
                (parseFloat(batch.RNI_BCH_Qty) || 0) > 0
            );

        });

        if (!hasValidBatch) {

            showAlert("Please enter at least one valid batch for Item " + rowId + ".");
            return false;
        }
    }

    return true;
}

function validateItemGrid_RN() {

    let hasValidRow = false;
    let isValid = true;

    $("#TableBody tr").each(function () {

        let row = $(this);

        // Skip template row
        if (row.attr("id") === "TempRow") {
            return;
        }
        

        let prsNumber = row.find(".PRS_Number").val();
        let itemCode = row.find(".Item_Code").val();
        let warehouse = row.find(".WH_Number").val();
        let uom = row.find(".UoM_Number").val();
        let qty = row.find(".AmendQty").val();

        // Has user started entering this row?
        let isRowStarted =
            (prsNumber && prsNumber.trim() !== "") ||
            (itemCode && itemCode.trim() !== "") ||
            (warehouse && warehouse !== "0" && warehouse !== "") ||
            (uom && uom !== "0" && uom !== "") ||
            (qty && qty.trim() !== "" && qty.trim() !== "0");

        // Ignore completely empty rows
        if (!isRowStarted)
            return;

        hasValidRow = true;

        // Process
        if (!prsNumber || prsNumber.trim() === "") {

            showAlert("Process is required.", row.find(".PRS_Number"));
            isValid = false;
            return false;
        }

        // Item Code
        if (!itemCode || itemCode.trim() === "") {

            showAlert("Item Code is required.", row.find(".Item_Code"));
            isValid = false;
            return false;
        }

        // Warehouse
        if (!warehouse || warehouse === "0") {

            showAlert("Warehouse is required.", row.find(".WH_Number"));
            isValid = false;
            return false;
        }

        // UOM
        if (!uom || uom === "0") {

            showAlert("UOM is required.", row.find(".UoM_Number"));
            isValid = false;
            return false;
        }

        // Qty
        if (!qty || qty.trim() === "" || parseFloat(qty) <= 0) {

            showAlert("Qty is required.", row.find(".AmendQty"));
            isValid = false;
            return false;
        }

    });

    if (!hasValidRow) {

        showAlert("Please enter at least one item.");
        return false;
    }

    return isValid;
}

function ValidateItemBatches_RN() {

    if (batchMismatchData_RN.length === 0) {

        showAlert("Please enter batch details.");
        return false;
    }

    for (let i = 0; i < batchMismatchData_RN.length; i++) {

        let item = batchMismatchData_RN[i];

        if (!item.batchValues || item.batchValues.length === 0) {

            showAlert("Batch details are missing.");
            return false;
        }

        for (let j = 0; j < item.batchValues.length; j++) {

            let batch = item.batchValues[j];

            if (batch.RNI_BCH_IsDeleted === "true")
                continue;

            // Skip empty batch row
            if (!batch.RNI_BCH_Date &&
                !batch.RNI_BCH_No &&
                !batch.RNI_BCH_Qty &&
                !batch.RNI_BCH_UnitPrice)
                continue;


            if (!batch.RNI_BCH_Date) {

                showAlert("Please enter Batch Date.");
                return false;
            }

            if (!batch.RNI_BCH_No) {

                showAlert("Please enter Batch Number.");
                return false;
            }

            if ((parseFloat(batch.RNI_BCH_Qty) || 0) <= 0) {

                showAlert("Batch Qty should be greater than zero.");
                return false;
            }

            if ((parseFloat(batch.RNI_BCH_UnitPrice) || 0) < 0) {

                showAlert("Invalid Unit Price.");
                return false;
            }
        }
    }

    return true;
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

//#region Auto Add Row

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

function autoAddRow_F(currentRow) {

    let qty = parseFloat(currentRow.find(".AmendQty").val()) || 0;

    let itemCode = currentRow.find(".Item_Code").val();

    let isRowValid =
        itemCode &&
        qty > 0;

    // Allow only if current row is the last row
    let isLastRow = currentRow.is("#ItemTable tbody tr.NewRow:last");

    if (isRowValid && isLastRow) {

        // Prevent multiple empty rows
        let nextRow = currentRow.next("tr");

        if (nextRow.length === 0) {
            $("#AddRowButton").trigger("click");
        }
    }
}
//#endregion

$(document).on("focusout", "#IBatTableBody .RNI_BCH_Qty", function () {

    let currentRow = $(this).closest("tr");

    let qty = parseFloat($(this).val()) || 0;

    if (qty <= 0)
        return;

    let lastRow = $("#IBatTableBody tr.IBatNewRow:visible").last();

    // If current row is the last row, add new batch row
    if (currentRow.is(lastRow)) {

      //  IBatNewRow();
    }

});

//#region Add Row Item Grid

let rowIndex = $("#TableBody tr.NewRow").length;

$("#AddRowButton").on("click", function () {

    // Validate last row
    let isValid = true;

    $("#ItemTable tbody tr.NewRow:last").find("input, select").each(function () {

        let el = $(this);

        // Skip delete flag
        if (el.hasClass("IsDeleted"))
            return;

        // Item Code
        if (el.hasClass("Item_Code")) {
            if ($.trim(el.val()) === "") {
                isValid = false;
                el.focus();
                return false;
            }
        }

        // Qty
        if (el.hasClass("Qty")) {
            if ($.trim(el.val()) === "" || parseFloat(el.val()) <= 0) {
                isValid = false;
                el.focus();
                return false;
            }
        }

        // Unit Price
        if (el.hasClass("UnitPrice")) {
            if ($.trim(el.val()) === "" || parseFloat(el.val()) <= 0) {
                isValid = false;
                el.focus();
                return false;
            }
        }

    });

   

    // Clone template row
    let $newRow = $("#TempRow").clone();

    $newRow.removeAttr("id style");
    $newRow.addClass("NewRow");

    // Clear values & update names
    $newRow.find("input, select").each(function () {

        let el = $(this);

        // Checkbox
        if (el.attr("type") === "checkbox") {
            el.prop("checked", false);
            return;
        }

        // Clear values
        if (el.is("input")) {

            if (
                el.hasClass("Description") ||
                el.hasClass("OuterDia") ||
                el.hasClass("Thickness") ||
                el.hasClass("Length") ||
                el.hasClass("Width") ||
                el.hasClass("MaterialGrade") ||
                el.hasClass("ItemGroup") ||
                el.hasClass("Amount")
            ) {
                el.val("");
            }
            else if (el.hasClass("IsDeleted")) {
                el.val("0");
            }
            else {
                el.val("");
            }
        }

        if (el.is("select")) {
            el.prop("selectedIndex", 0);
        }

        // Update name
        let name = el.attr("name");
        if (name) {
            el.attr("name", name.replace(/\[\d+\]/, "[" + rowIndex + "]"));
        }
    });

    // Assign unique row id
    $newRow.attr("data-rowid", new Date().getTime());

    // Append row
    $("#TableBody").append($newRow);

    rowIndex++;

    // Recalculate footer
    calculateTotal_rn();
   // ApplyFieldWidths("#ItemTable");
});

//#endregion

//#region Calculate Total


function calculateTotal_rn() {

    let totalQty = 0;
    let totalAmount = 0;

    $("#ItemTable tbody tr.NewRow:visible").each(function () {

        let qty = parseFloat(($(this).find(".AmendQty").val() || "0").replace(/,/g, "")) || 0;
        let amount = parseFloat(($(this).find(".Amount").val() || "0").replace(/,/g, "")) || 0;

        totalQty += qty;
        totalAmount += amount;
    });

    $("#TotalQty").val(totalQty === 0 ? "" : formatIndianQty(totalQty));
    $("#TotalAmount").val(totalAmount === 0 ? "" : formatIndianCurrency(totalAmount));
}

//#endregion Calculate Total

//#region item grid fetch item details
function OnInput(inputElement) {
    searchItemJIDNI(inputElement);
}

function OnFocus(inputElement) {

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

    let material = $("#MS_Number").val();

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
                    <div class="card-body batchPopup modal-content p-0 table-responsive" style="max-height:500px;">
                        <table class="table table-bordered table-hover table-fixed mb-0 table-grid" id="tblsearch">
                            <thead>
                                <tr class="table-info" style="height:32px;">
                                    <th>Item Code</th>
                                    <th>Description</th>
                                   <th style="text-align:center;">Item Group</th>
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
                        row.find(".Item_Code").val(item.itemCode);

                        // ✔ Hidden field
                        row.find(".Item_Number").val(item.itemNumber);

                        // ✔ Fill details
                        row.find(".Description").val(item.itemDescription);
                        row.find(".OuterDia").val(item.outerDia);
                        row.find(".Thickness").val(item.thickness);
                        row.find(".Length").val(item.length);
                        row.find(".Width").val(item.width);
                        row.find(".MaterialGrade").val(item.materialGrade);
                        row.find(".ItemGroup").val(item.itemGroup);

                        // ✔ Dropdowns
                        row.find(".UoM_Number").val(item.uoM);
                        row.find(".WH_Number").val(item.saleWarehouse);

                        // ✔ Move to Qty
                        let qtyInput = row.find(".AmendQty");
                        let qtyUnitprice = row.find(".UnitPrice");

                        qtyInput.focus();
                        setTimeout(function () {
                            qtyInput.select();
                            
                        }, 100);
                        // ✔ Decimal format (if needed)
                        let decimalPlaces = item.decimalPlaces || 2;

                        let qtyVal = qtyInput.val();
                        let qtyUnitpriceVal = qtyUnitprice.val();

                        qtyInput.val(formatIndianQty(qtyVal));
                        qtyUnitprice.val(formatIndianCurrency(qtyUnitpriceVal));
                       
                            ApplyFieldWidths("#ItemTable");
                        
                        resultsDiv.hide();
                    });

                    table.find("tbody").append(tr);
                });

                // CLOSE BUTTON
              
                resultsDiv.append(table);
                //#region search logic highlight

                // Store all rows
                let rows = resultsDiv.find("tbody tr");

                // Clear previous styles
                rows.removeClass("match-row current-row");

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

                        lastMatch = i;   // <-- IMPORTANT
                    }
                });

                if (firstMatch >= 0) {

                    // Don't select any row initially.
                    rows.removeClass("current-row");

                    $(inputElement).data("firstMatch", firstMatch);
                    $(inputElement).data("lastMatch", lastMatch);

                    $(inputElement).removeData("selectedIndex");
                }
                else {

                    $(inputElement).removeData("firstMatch");
                    $(inputElement).removeData("lastMatch");
                    $(inputElement).removeData("selectedIndex");
                }
                //#endregion search logic highlight
              

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


//#region JW Customer Search Functions

function OnBuyerInput(inputElement) {
    SearchBuyer(inputElement);
}

function OnBuyerFocus(inputElement) {
    var value = inputElement.value;

    if (!value) {
        SearchBuyer(inputElement);
    } else {
        $(inputElement).select();
    }
}

function SearchBuyer(inputElement) {

    var buyer = inputElement.value;
    var rnDate = $("#RN_Date").val();

    var resultsDiv = $(inputElement).siblings(".buyer-search-results");

    $.ajax({
        url: '/jobinward/transactions/receipt-note/cutomer',
        type: 'GET',
        data: {
            Buyer: buyer,
            SIHDate: rnDate
        },
        success: function (data) {

            resultsDiv.empty();

            if (data && data.length > 0) {

                resultsDiv.show();

                var table = $(`
              <div class="card-body batchPopup modal-content p-0 w-100 position-relative start-0 top-100" style="z-index:999;">
                        <table class="table table-bordered table-hover table-fixed table-grid mb-0 w-100">
                            <thead>
                                <tr class="table-info">
                                    <th>JW Customer Name</th>
                                    <th class="text-center">Currency</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                `);

                $.each(data, function (i, cust) {

                    var row = $("<tr></tr>").css("height", "24px");

                    row.append("<td>" + cust.cuS_Name + "</td>");
                    row.append("<td class='text-center'>" + cust.cuS_CUR_Name + "</td>");

                    table.find("tbody").append(row);

                    row.on("click", function () {

                        // Customer
                        $("#JWC_Name").val(cust.cuS_Name);
                        $("#JWC_Number").val(cust.cuS_Number);

                        // Currency
                        $("#Currency_Name").val(cust.cuS_CUR_Name);
                        $("#Currency_Number").val(cust.cuS_CUR_Number);

                        // Warehouse
                        $("#WH_Number").val(cust.cuS_WH_Number);

                        resultsDiv.hide();
                       
                    });

                });

                
                resultsDiv.append(table);
                //#region search logic highlight
                // Store all rows
                let rows = resultsDiv.find("tbody tr");

                // Clear previous styles
                rows.removeClass("match-row current-row");

                $(inputElement).removeData("selectedIndex");

                let searchText = buyer.trim().toLowerCase();

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

                    rows.removeClass("current-row");

                    $(inputElement).data("firstMatch", firstMatch);
                    $(inputElement).data("lastMatch", lastMatch);

                    $(inputElement).removeData("selectedIndex");
                }
                else {

                    $(inputElement).removeData("firstMatch");
                    $(inputElement).removeData("lastMatch");
                    $(inputElement).removeData("selectedIndex");
                }

                //#endregion

            } else {
                resultsDiv.hide().empty();
            }
        },
        error: function () {
            resultsDiv.text("Error loading data.").show();
        }
    });
}

// Hide search when clicking outside
$(document).on("click", function (e) {
    if (!$(e.target).closest(".buyer-search-results,#JWC_Name").length) {
        $(".buyer-search-results").hide();
    }
});

//#endregion