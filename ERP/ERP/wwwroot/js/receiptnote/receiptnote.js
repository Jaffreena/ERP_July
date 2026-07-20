
//#region clear all


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
//#region Auto Add Row on Last Row


$(document).on("focusout", ".Qty, .UnitPrice", function () {

    let $row = $(this).closest("tr");

    if (!$row.is($("#ItemTable tbody tr.NewRow:last"))) {
        return;
    }

    let qty = parseFloat($row.find(".Qty").attr("data-value")) || 0;
    let price = parseFloat($row.find(".UnitPrice").attr("data-value")) || 0;

    if (qty > 0 || price > 0) {
        autoAddRow_F($row);
    }
});

//#endregion
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

function HighlightRow(rows, index) {

    rows.removeClass("current-row");

    if (index < 0 || index >= rows.length)
        return;

    $(rows[index]).addClass("current-row");

    rows[index].scrollIntoView({
        block: "nearest"
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


function ApplyHeaderAlignment(container = "#ItemTable") {
    const fields = [
        { cls: ".PRS_Number", min: 15, max: 50, align: "left" },
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

        { cls: ".Qty", min: 11, max: 20, align: "center" },
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
function ApplyFieldWidths(container = "#ItemTable") {

    const fields = [
        { cls: ".PRS_Number", min: 15, max: 50, align: "left" },
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

        { cls: ".Qty", min: 11, max: 20, align: "center" },
        { cls: ".UnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".Amount", min: 13, max: 25, align: "right" }
    ];

    const $container = $(container);

    // Checkbox column width
    const checkWidth = 40;

    // Header checkbox
    $container.find("thead th:first-child, tfoot td:first-child").each(function () {
        this.style.setProperty("width", checkWidth + "px", "important");
        this.style.setProperty("min-width", checkWidth + "px", "important");
        this.style.setProperty("max-width", checkWidth + "px", "important");
        this.style.setProperty("text-align", "center", "important");
    });

    // Body checkbox
    $container.find("tbody > tr > td:first-child").each(function () {
        this.style.setProperty("width", checkWidth + "px", "important");
        this.style.setProperty("min-width", checkWidth + "px", "important");
        this.style.setProperty("max-width", checkWidth + "px", "important");
        this.style.setProperty("text-align", "center", "important");
    });

    fields.forEach(f => {

        // Skip controls inside popup search table (#tblsearch)
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

        // Extra space so the last digit is not clipped
        if (f.cls === ".UnitPrice" || f.cls === ".Amount") {
            requiredWidth = Math.min(requiredWidth + 8, maxWidth);
        }

        controls.each(function () {

            // INPUT / SELECT / TEXTAREA
            this.style.removeProperty("padding");
            this.style.setProperty("width", requiredWidth + "px", "important");
            this.style.setProperty("min-width", minWidth + "px", "important");
            this.style.setProperty("max-width", maxWidth + "px", "important");
            this.style.setProperty("box-sizing", "border-box", "important");
            this.style.setProperty("text-align", f.align, "important");
            this.style.setProperty("padding", "2px", "important");

            if (f.cls === ".Description" && this.tagName === "TEXTAREA") {

                const charsPerLine = 20;
                const lines = Math.max(1, Math.ceil(this.value.length / charsPerLine));

                const lineHeight = parseFloat(window.getComputedStyle(this).lineHeight);
                const extraHeight = 12;

                this.style.setProperty(
                    "height",
                    (lines * lineHeight + extraHeight) + "px",
                    "important"
                );
                this.style.setProperty("resize", "none", "important");
                this.style.setProperty("overflow", "hidden", "important");
            }

            // Apply width only to main ItemTable cells
            const td = $(this).closest("td")[0];

            if ($(td).closest("#tblsearch").length === 0) {

                // TD
                td.style.setProperty("width", requiredWidth + "px", "important");
                td.style.setProperty("min-width", minWidth + "px", "important");
                td.style.setProperty("max-width", maxWidth + "px", "important");
                td.style.setProperty("text-align", f.align, "important");
                td.style.setProperty("padding", "2px", "important");

                // TH
                const th = $container.find("thead th").eq(td.cellIndex)[0];
                if (th) {
                    th.style.setProperty("width", requiredWidth + "px", "important");
                    th.style.setProperty("min-width", minWidth + "px", "important");
                    th.style.setProperty("max-width", maxWidth + "px", "important");
                    th.style.setProperty("text-align", f.align, "important");
                    th.style.setProperty("padding", "2px", "important");
                }
            }
        });
    });

    ApplyHeaderAlignment("#ItemTable");
}



function ApplyBatchFieldWidths(container = "#BatchTable") {

    const fields = [
        { cls: ".RNI_BCH_Date", min: 12, max: 12, align: "center" },
        { cls: ".RNI_BCH_No", min: 30, max: 50, align: "left" },
        { cls: ".RNI_BCH_Qty", min: 11, max: 20, align: "center" },
        { cls: ".RNI_BCH_UnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".RNI_BCH_Value", min: 13, max: 25, align: "right" }
    ];
    const $container = $(container);

   

    fields.forEach(f => {

        const controls = $container.find(
            "#IBatTableBody > #IBatTempRow " + f.cls +
            ", #IBatTableBody > tr.IBatNewRow " + f.cls
        );

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

        // Extra space so the last digit is not clipped
        if (f.cls === ".RNI_BCH_UnitPrice"  || f.cls === ".RNI_BCH_Value") {
            requiredWidth = Math.min(requiredWidth + 8, maxWidth);
        }

        controls.each(function () {

            // INPUT
            this.style.removeProperty("padding");
            this.style.setProperty("width", "100%", "important");
            this.style.setProperty("min-width", "100%", "important");
            this.style.setProperty("max-width", "100%", "important");
            this.style.setProperty("box-sizing", "border-box", "important");
            this.style.setProperty("text-align", f.align, "important");
            this.style.setProperty("padding", "2px", "important");

            // TD
            const td = $(this).closest("td")[0];
            td.style.setProperty("width", requiredWidth + "px", "important");
            td.style.setProperty("min-width", minWidth + "px", "important");
            td.style.setProperty("max-width", maxWidth + "px", "important");
            td.style.setProperty("text-align", f.align, "important");
            td.style.setProperty("padding", "2px", "important");

            // TH
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

$(document).ready(function () {
 
    
     
    console.log($("#RightPane .buyer-search-results").attr("style"));
    $(document).on("input change blur", "#ItemTable input, #ItemTable textarea, #ItemTable select", function () {
        ApplyFieldWidths("#ItemTable");
    });

    $(document).on("focusin", ".Amount", function () {
        ApplyFieldWidths("#ItemTable");
    });
    $(document).on("input change blur", "#BatchTable input, #BatchTable textarea, #BatchTable select", function () {
        ApplyBatchFieldWidths("#BatchTable");
    });
     ApplyBatchFieldWidths("#BatchTable");
    $(document).on("focus", ".PRS_Number", function () {
        this.click();
    });
    ApplyFieldWidths("#ItemTable");

    $(document).on("keydown", "#JWC_Name", function (e) {

        let input = $(this);
        $("#RightPane").addClass("show");
        $("#RightPane .buyer-search-results").show();
        let resultsDiv = $("#RightPane").find(".buyer-search-results");
    
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
                rows.removeClass("current-row");
                $(rows[selectedIndex]).addClass("current-row");
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
                rows.removeClass("current-row");
                $(rows[selectedIndex]).addClass("current-row");
                break;

            case "Enter":

                e.preventDefault();

                // 1. If a row is highlighted, select it
                let currentRow = rows.filter(".current-row");

                if (currentRow.length) {
                    currentRow.trigger("click");
                    return;
                }

                let matchedRows = $("#RightPane tbody tr.match-row");

                // 2. Only one match -> auto select
                if (matchedRows.length == 1) {
                    matchedRows.eq(0).trigger("click");
                    return;
                }

                // 3. More than one match -> keep popup open and show message
                if (matchedRows.length > 1) {

                    $("#BuyerMessage")
                        .text("Too many customers found. Please refine your search.")
                        .show();

                    $("#RightPane").addClass("show");
                    $("#RightPane .buyer-search-results").show();

                    return;
                }

                // 4. No matches
                $("#RightPane .buyer-search-results").hide();
                $("#RightPane").removeClass("show");
                return;

            case "Escape":

                e.preventDefault();
                $("#RightPane .buyer-search-results").hide();
                $("#RightPane").removeClass("show");
                resultsDiv.hide();

                input.removeData("selectedIndex");
             
                return;

            default:
                return;
        }

        HighlightRow(rows, selectedIndex);

        input.data("selectedIndex", selectedIndex);
    });

    $(document).on("keydown", ".Item_Code", function (e) {

        let input = $(this);
        let row = input.closest("tr");
        let resultsDiv = row.find(".search-results");
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
                        selectedIndex = lastMatch;      // If search text exists
                    else
                        selectedIndex = rows.length - 1; // No search -> last row
                }
                else {

                    if (selectedIndex < rows.length - 1)
                        selectedIndex++;
                }

                break;

            case "ArrowUp":

                e.preventDefault();

                if (selectedIndex == null) {

                    if (firstMatch >= 0)
                        selectedIndex = firstMatch;     // If search text exists
                    else
                        selectedIndex = 0;              // No search -> first row
                }
                else {

                    if (selectedIndex > 0)
                        selectedIndex--;
                }

                break;

            case "Enter":

                e.preventDefault();

                $(rows[selectedIndex]).trigger("click");

                return;

            case "Escape":

                e.preventDefault();

                input.val(input.data("oldItemCode"));
                row.find(".Item_Number").val(input.data("oldItemNumber"));

                resultsDiv.hide();

                input.removeData("selectedIndex");

                return;

            default:
                return;
        }

        HighlightRow(rows, selectedIndex);

        input.data("selectedIndex", selectedIndex);
    });

    $("#RemoveItemRowButton").on("click", function () {

        let checkedRows = $("#ItemTable tbody tr.NewRow:visible")
            .has(".CheckItem:checked");

        let totalVisibleRows = $("#ItemTable tbody tr.NewRow:visible").length;

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

    //#endregion
    //#region Hide Batch Popup - Click Outside / Escape Key

    // Hide batch popup when clicking outside of it


    $(document).on("focusout", ".UnitPrice", function () {

        let value = parseFloat(($(this).val() || "").replace(/,/g, "")) || 0;

        $(this)
            .attr("data-value", value)
            .val(value === 0 ? "" : formatIndianCurrency(value));
    });

    $(document).on("focusout", ".Qty", function () {

        let value = parseFloat(($(this).val() || "").replace(/,/g, "")) || 0;

        $(this)
            .attr("data-value", value)
            .val(value === 0 ? "" : formatIndianQty(value));
    });
  

   
    $("#AddRowButton").trigger("click");
    $(document).on("keyup", ".Qty, .UnitPrice", function () {

        let row = $(this).closest("tr");

        row.find(".Qty")
            .attr("data-value", removeCommas(row.find(".Qty").val()));

        row.find(".UnitPrice")
            .attr("data-value", removeCommas(row.find(".UnitPrice").val()));

        let qty = parseFloat(row.find(".Qty").attr("data-value")) || 0;
        let unitPrice = parseFloat(row.find(".UnitPrice").attr("data-value")) || 0;

        let amount = qty * unitPrice;

        row.find(".Amount")
            .val(amount === 0 ? "" : formatIndianCurrency(amount))
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

        var dto = GetReceiptNoteDTO();   // We'll create this function next
        console.log(dto);                     // Object
        console.log('123------------------'+JSON.stringify(dto));
    
        // JSON
        $.ajax({
            url: "/Receipt_Note/SaveReceiptNote",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(dto),
            success: function (res) {

               
                
                    showAlert('Record Inserted')
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

    console.log($(".table-body-f tbody tr:first").outerHeight());
    AutoFitHeader();
    //#region Header AutoFit - KeyUp

    $(document).on("keyup change input", "#RN_No, #JW_CustomerDC_No, #MS_Number, #JWC_Name, #Currency_Name, #WH_Number, #Remarks", function () {

        const widths = {
            RN_No: [20, 25],
            JW_CustomerDC_No: [20, 25],
            MS_Number: [20, 30],
            JWC_Name: [40, 75],
            Currency_Name: [8, 10],
            WH_Number: [15, 25],
            Remarks: [35, 45]
        };

        const [min, max] = widths[this.id];
        fitInputWidth(this, min, max);
    });

    //#endregion
    $(document).on("change", "#MS_Number, #WH_Number", function () {
        fitInputWidth(this, 20, 20);
    });
  
});
function AutoFitHeader() {
    fitInputWidth("RN_No", 20,25);
    fitInputWidth("JW_CustomerDC_No", 20, 25);
    fitInputWidth("MS_Number", 20, 30);  
    fitInputWidth("JWC_Name", 40, 75);  
    fitInputWidth("Currency_Name", 8,10);
    fitInputWidth("WH_Number", 15, 25);
    fitInputWidth("Remarks", 35, 45);
}
function ValidateItemBatchMapping() {

    let itemRows = $("#TableBody tr.NewRow");

    for (let i = 0; i < itemRows.length; i++) {

        let row = $(itemRows[i]);
        let rowId = i + 1;

        // Validate only if both Process and Item are selected
        let process = row.find(".PRS_Number").val();
        let itemNo = row.find(".Item_Number").val();

        if (!process || !itemNo)
            continue;

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

function GetReceiptNoteDTO() {

    var dto = {
        Mode: "Save",

        Header: GetHeader(),

        Items: GetItems(),

        ItemBatch: GetItemBatches()
    };

    return dto;
}
function GetHeader() {

    return {

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
function GetItemBatches() {

    let batches = [];

    batchMismatchData_RN.forEach(function (item) {

        item.batchValues.forEach(function (batch) {

            batches.push({

                RNI_BCH_Item_Index: item.rowId,

                RNI_BCH_Item_Number: batch.RNI_BCH_Item_Number,

                RNI_BCH_WH_Number: batch.RNI_BCH_WH_Number,

                RNI_BCH_Date: batch.RNI_BCH_Date,

                RNI_BCH_No: 0,

                RNI_BCH_Number: batch.RNI_BCH_No,

                RNI_BCH_Qty: batch.RNI_BCH_Qty || 0,

                RNI_BCH_UnitPrice: batch.RNI_BCH_UnitPrice || 0,

                RNI_BCH_Value: batch.RNI_BCH_Value || 0,

                RNI_BCH_IsDeleted: batch.RNI_BCH_IsDeleted || "false"
            });

        });

    });

    return batches;
}
function GetItems() {

    var items = [];

    $("#TableBody tr.NewRow:visible").each(function () {

        var row = $(this);

        if (row.find(".IsDeleted").val() === "1")
            return;

        let itemNumber = row.find(".Item_Number").val();

        if (itemNumber && itemNumber.trim() !== "") {
            items.push({
                Item_Number: itemNumber,
                PRS_Number: row.find(".PRS_Number").val(),
                WH_Number: row.find(".WH_Number").val(),
                UoM_Number: row.find(".UoM_Number").val(),
                Qty: String(row.find(".Qty").attr("data-value") || "0"),
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
   

    return true;
}
function validateItemGrid_RN() {

    let hasValidRow = false;
    let isValid = true;

    $("#TableBody tr").each(function () {

        let row = $(this);

        // Skip template row
        if (row.attr("id") === "TempRow")
            return;

        let prsNumber = row.find(".PRS_Number").val();
        let itemCode = row.find(".Item_Code").val();
        let warehouse = row.find(".WH_Number").val();
        let uom = row.find(".UoM_Number").val();
        let qty = row.find(".Qty").val();

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

            showAlert("Qty is required.", row.find(".Qty"));
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

        for (let j = item.batchValues.length - 1; j >= 0; j--) {

            let batch = item.batchValues[j];

            if (batch.RNI_BCH_IsDeleted === "true")
                continue;

            let qty = parseFloat(batch.RNI_BCH_Qty) || 0;
            let unitPrice = parseFloat(batch.RNI_BCH_UnitPrice) || 0;

            // Ignore completely empty row
            if (!batch.RNI_BCH_Date &&
                !batch.RNI_BCH_No &&
                qty === 0 &&
                unitPrice === 0) {

                item.batchValues.splice(j, 1);
                continue;
            }

            // Qty entered without Batch Number
            if (!batch.RNI_BCH_No && qty > 0) {

                showAlert("Please enter Batch Number.");
                return false;
            }

            // Remove row if Batch Number is empty
            if (!batch.RNI_BCH_No) {

                item.batchValues.splice(j, 1);
                continue;
            }

            if (!batch.RNI_BCH_Date) {

                showAlert("Please enter Batch Date.");
                return false;
            }

            if (qty <= 0) {

                showAlert("Batch Qty should be greater than zero.");
                return false;
            }

            if (unitPrice < 0) {

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

    let qty = parseFloat(currentRow.find(".Qty").val()) || 0;

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
    SetTableHeight();
   
});

//#endregion

//#region Calculate Total


function calculateTotal_rn() {

    let totalQty = 0;
    let totalAmount = 0;

    $("#ItemTable tbody tr.NewRow:visible").each(function () {

        let qty = parseFloat(($(this).find(".Qty").val() || "0").replace(/,/g, "")) || 0;
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

    $(inputElement).data("oldItemCode", $(inputElement).val());
    $(inputElement).data("oldItemNumber",
        $(inputElement).closest("tr").find(".Item_Number").val());

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

                let selectedIndex = -1;

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
                        <tr style="cursor:pointer;">
                            <td>${item.itemCode}</td>
                            <td>${item.itemDescription}</td>
                            <td style="text-align:center;">${item.itemGroup}</td>
                        </tr>
                    `);

                    tr.css("height", "24px");

                    tr.on("click", function () {

                        row.find(".Item_Code").val(item.itemCode);
                        row.find(".Item_Number").val(item.itemNumber);
                        //-----------------------------
                        $(inputElement).data("oldItemCode", item.itemCode);
                        $(inputElement).data("oldItemNumber", item.itemNumber);
                        //---------------------------

                        row.find(".Description").val(item.itemDescription);
                        row.find(".OuterDia").val(item.outerDia);
                        row.find(".Thickness").val(item.thickness);
                        row.find(".Length").val(item.length);
                        row.find(".Width").val(item.width);
                        row.find(".MaterialGrade").val(item.materialGrade);
                        row.find(".ItemGroup").val(item.itemGroup);

                        row.find(".UoM_Number").val(item.uoM);
                        row.find(".WH_Number").val(item.saleWarehouse);

                        let qtyInput = row.find(".Qty");
                        let qtyUnitprice = row.find(".UnitPrice");

                        qtyInput.focus();

                        setTimeout(function () {
                            qtyInput.select();
                        }, 100);

                        qtyInput.val(formatIndianQty(qtyInput.val()));
                        qtyUnitprice.val(formatIndianCurrency(qtyUnitprice.val()));
                    
                           
                   


                      
                        resultsDiv.hide();
                        $("#RightPane").removeClass("show");
                    });

                    table.find("tbody").append(tr);
                });

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
function OnBuyerBlur(inputElement) {

    setTimeout(function () {

        let matchedRows = $("#RightPane tbody tr.match-row");

        if (matchedRows.length == 1) {

            let cust = matchedRows.eq(0).data("customer");
            SelectBuyer(cust);
            return;
        }

        if (matchedRows.length > 1) {

            $("#RightPane").addClass("show");
            $("#RightPane .buyer-search-results").show();

            $("#BuyerMessage")
                .html("Too many Choices.<br/> Select any one.")
                .show();

            $(inputElement).focus();

            return;
        }

        $("#RightPane").removeClass("show");

    }, 150);
}
function OnBuyerSelect(inputElement) {
    $("#RightPane").removeClass("show");
    $("#RightPane").find(".buyer-search-results").hide();
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
function SelectBuyer(cust) {

    // Customer
    $("#JWC_Name").val(cust.cuS_Name);
    $("#JWC_Number").val(cust.cuS_Number);

    // Currency
    $("#Currency_Name").val(cust.cuS_CUR_Name);
    $("#Currency_Number").val(cust.cuS_CUR_Number);

    // Warehouse
    $("#WH_Number").val(cust.cuS_WH_Number);

    $("#RightPane").removeClass("show");
    $("#RightPane").find(".buyer-search-results").hide().empty();
}
function SearchBuyer(inputElement) {

    var buyer = inputElement.value;
    buyer = buyer.trim();
    var rnDate = $("#RN_Date").val();

    var resultsDiv = $("#RightPane").find(".buyer-search-results");

    $.ajax({
        url: '/jobinward/transactions/receipt-note/cutomer',
        type: 'GET',
        data: {
            Buyer: buyer,
            SIHDate: rnDate
        },
        success: function (data) {

            resultsDiv.empty();
            $("#BuyerMessage").hide().text("");
            if (data && data.length > 0) {

                $("#RightPane").addClass("show");   // <-- Add this line
                resultsDiv.show();
                let selectedIndex = -1;  
                var table = $(`
<div class="card-body modal-content batchPopup p-0"
     style="z-index:999; width:500px;">
                        <table class="table table-bordered table-hover table-fixed table-grid mb-0 w-100">
                            <thead>
                                <tr class="table-info">
                                    <th>JW Customer Name</th>
                                 
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                `);

                $.each(data, function (i, cust) {

                    var row = $("<tr></tr>").css("height", "24px");
                    row.data("customer", cust);
                    row.append("<td>" + cust.cuS_Name + "</td>");
                  

                    table.find("tbody").append(row);

                    row.on("click", function () {
                        $("#BuyerMessage").hide().text("");
                        SelectBuyer(cust);
                    });

                });

                //var closeButton = $(`
                //    <div class="card-header bg-primary py-1 px-1 d-flex justify-content-end">
                //        <button type="button"
                //                class="btn btn-sm btn-primary bg-opacity-10 p-0 d-flex align-items-center justify-content-center">
                //            ✖
                //        </button>
                //    </div>
                //`);

                //closeButton.on("click", function () {
                //    resultsDiv.hide();
                //});

                //resultsDiv.append(closeButton);


                resultsDiv.append(table);

                resultsDiv.append(`
<div id="BuyerMessage"
     class="text-danger fw-bold text-center py-2"
     style="display:none;">
</div>
`);

                // Keyboard Navigation
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
                $("#RightPane").removeClass("show");
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