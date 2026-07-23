
const ItemTableFields = [
    { cls: ".JIDNI_PRS_Number", min: 10, max: 25, align: "left" },    // Process
    { cls: ".JIDNI_Item_Code", min: 10, max: 15, align: "left" },    // Item Code
    { cls: ".JIDNI_Item_Description", min: 40, max: 40, align: "left" },    // Description

    { cls: ".JIDNI_OuterDia", min: 8, max: 8, align: "center" },  // Outer Dia
    { cls: ".JIDNI_Thickness", min: 8, max: 8, align: "center" },  // Thickness
    { cls: ".JIDNI_Length", min: 8, max: 8, align: "center" },  // Length
    { cls: ".JIDNI_Width", min: 8, max: 8, align: "center" },  // Width

    { cls: ".JIDNI_MaterialGrade", min: 10, max: 25, align: "left" },    // Material Grade
    { cls: ".JIDNI_ItemGroup", min: 10, max: 30, align: "left" },    // Item Group
    { cls: ".JIDNI_WH_Number", min: 10, max: 25, align: "left" },    // Warehouse

    { cls: ".JIDNI_UoM_Number", min: 10, max: 15, align: "center" },  // UoM

    { cls: ".JIDNI_Qty", min: 10, max: 20, align: "center" },  // Qty

    { cls: ".JIDNI_UnitPrice", min: 10, max: 20, align: "right" },   // Unit Price
    { cls: ".JIDNI_Amount", min: 13, max: 25, align: "right" },   // Amount

    { cls: ".JIDNI_JW_InvoiceTracking", min: 8, max: 8, align: "center" },  // JW Invoice Applicable

    // Not present in the specification, so left unchanged
    { cls: ".JISVOH_Number", min: 10, max: 25, align: "left" }
];

var addressIndex = 0;
//#region batch grid alignment
function GetTableWidth(container = "#DeliveryNoteBatchList") {

    const $table = $(container);
    let totalWidth = 0;

    $table.find("thead th").each(function (index) {

        let maxWidth = getTextWidth($(this).text().trim(), this);

        $table.find("tbody tr:visible").each(function () {

            const cell = this.cells[index];
            if (!cell) return;

            const control = $(cell).find("input, select, textarea")[0];

            let text = "";

            if (control) {
                if (control.tagName === "SELECT")
                    text = control.options[control.selectedIndex]?.text || "";
                else
                    text = control.value || "";

                maxWidth = Math.max(maxWidth, getTextWidth(text, control));
            } else {
                text = cell.textContent || "";
                maxWidth = Math.max(maxWidth, getTextWidth(text, cell));
            }
        });

        // Add some padding for the cell
        totalWidth += maxWidth+23 ;
    });

    return totalWidth;
}


function ApplyBatchFieldWidths(container = "#DeliveryNoteBatchList") {

    const fields = [
        { cls: ".JIDNI_BCH_WH_Name", min: 15, max: 30, align: "left" },
        { cls: ".JIDNI_BCH_BatchDate", min: 12, max: 12, align: "center" },
        { cls: ".JIDNI_BCH_BatchNo", min: 20, max: 35, align: "left" },
        { cls: ".JIDNI_BCH_QtyAvailable", min: 11, max: 20, align: "center" },
        { cls: ".JIDNI_BCH_QtyReserved", min: 11, max: 20, align: "center" },
        { cls: ".JIDNI_BCH_QtyInvoice", min: 11, max: 20, align: "center" },
        { cls: ".JIDNI_BCH_BatchUnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".JIDNI_BCH_BatchValue", min: 13, max: 25, align: "right" }
    ];

    const $container = $(container);
   
    fields.forEach(f => {

        const controls = $container.find(
            "#DeliveryNoteBatchTableBody > #DeliveryNoteBatchTemplateRow " + f.cls +
            ", #DeliveryNoteBatchTableBody > tr.DeliveryNoteBatchNewRow " + f.cls
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
            f.cls === ".JIDNI_BCH_BatchUnitPrice" ||
            f.cls === ".JIDNI_BCH_BatchValue"
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
    
    const tableWidth = GetTableWidth("#DeliveryNoteBatchList");
    SetDeliveryNoteBatchModalWidth(tableWidth);
}

function SetDeliveryNoteBatchModalWidth(tableWidth) {

    const dialog = document.querySelector("#DeliveryNoteBatchModal .modal-dialog");

    if (!dialog) return;

    // Add space for modal padding and borders
    const width = (tableWidth + 40) + "px";

    dialog.style.setProperty("width", width, "important");
    dialog.style.setProperty("max-width", width, "important");
    dialog.style.setProperty("height", "528px", "important");
    dialog.style.setProperty("max-height", "528px", "important");
}

function ApplyOtherBatchFieldWidths(container = "#DeliveryNoteOtherBatchList") {

    const fields = [
        { cls: ".JIDNI_BCH_WH_Name", min: 15, max: 30, align: "left" },
        { cls: ".JIDNI_BCH_BatchDate", min: 12, max: 12, align: "center" },
        { cls: ".JIDNI_BCH_BatchNo", min: 20, max: 35, align: "left" },
        { cls: ".JIDNI_BCH_AvailableQty", min: 11, max: 20, align: "center" },
        { cls: ".JIDNI_BCH_BatchUnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".JIDNI_BCH_BatchValue", min: 13, max: 25, align: "right" }
    ];

    const $container = $(container);

    fields.forEach(f => {

        const controls = $container.find(
            "#DeliveryNoteOtherBatchTableBody > #DeliveryNoteOtherBatchTemplateRow " + f.cls +
            ", #DeliveryNoteOtherBatchTableBody > tr.DeliveryNoteOtherBatchNewRow " + f.cls
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
            }
            else if (this.tagName === "INPUT" || this.tagName === "TEXTAREA") {
                text = this.value || "";
            }
            else {
                text = this.textContent || "";
            }

            text = text.trim();

            requiredWidth = Math.max(requiredWidth, getTextWidth(text, this));
        });

        requiredWidth = Math.min(requiredWidth, maxWidth);

        if (
            f.cls === ".JIDNI_BCH_BatchUnitPrice" ||
            f.cls === ".JIDNI_BCH_BatchValue"
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

    const tableWidth = GetTableWidth("#DeliveryNoteOtherBatchList");
    SetDeliveryNoteOtherBatchModalWidth(tableWidth);
}
function SetDeliveryNoteOtherBatchModalWidth(tableWidth) {

    const dialog = document.querySelector("#DeliveryNoteOtherBatchModal .modal-dialog");

    if (!dialog) return;

    // Add space for modal padding and borders
    const width = (tableWidth + 40) + "px";

    dialog.style.setProperty("width", width, "important");
    dialog.style.setProperty("max-width", width, "important");
    dialog.style.setProperty("height", "528px", "important");
    dialog.style.setProperty("max-height", "528px", "important");
}

//#endregion 
//#region item code right pane search JIDNI_Item_Code
$(document).on("keydown", ".JIDNI_Item_Code", function (e) {

    HandleSearchKeyDown(
        e,
        this,
        "#RightPane_Item",
        ".search-results",
        "#ItemMessage"
    );
    ShowItemPane();
});
$(document).on("focusout", ".JIDNI_Item_Code", function () {

    let input = $(this);
    let rows = $("#RightPane_Item .search-results tbody tr");

    HandleSearchSelection(
        input,
        rows,
        "#ItemMessage",
        "#RightPane_Item",
        "#RightPane_Item .search-results"
    );
});
$(document).on("keydown", function (e) {
    if (e.key === "Escape") {
        let input = $(".JIDNI_Item_Code");
        let rows = $("#RightPane_Item .search-results tbody tr");

        HandleSearchSelection(
            input,
            rows,
            "#ItemMessage",
            "#RightPane_Item",
            "#RightPane_Item .search-results"
        );
    }
});
//#endregion

//#region item grid alignment
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
function getTextWidth(text, element) {

    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");

    const style = window.getComputedStyle(element);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    return Math.ceil(ctx.measureText(text).width);
} 
function ApplyHeaderAlignment(container = "#ItemTable") {

    const fields = [
        { cls: ".JIDNI_PRS_Number", align: "left" },
        { cls: ".JIDNI_Item_Code", align: "left" },
        { cls: ".JIDNI_Item_Description", align: "left" },

        { cls: ".JIDNI_OuterDia", align: "center" },
        { cls: ".JIDNI_Thickness", align: "center" },
        { cls: ".JIDNI_Length", align: "center" },
        { cls: ".JIDNI_Width", align: "center" },

        { cls: ".JIDNI_MaterialGrade", align: "left" },
        { cls: ".JIDNI_ItemGroup", align: "left" },
        { cls: ".JIDNI_WH_Number", align: "left" },

        { cls: ".JIDNI_UoM_Number", align: "center" },

        { cls: ".JIDNI_Qty", align: "center" },
        { cls: ".JIDNI_UnitPrice", align: "right" },
        { cls: ".JIDNI_Amount", align: "right" },

        { cls: ".JIDNI_JW_InvoiceTracking", align: "center" },
        { cls: ".JISVOH_Number", align: "left" }
    ];

    fields.forEach(f => {

        $(container)
            .find("thead th." + f.cls.substring(1))
            .css("text-align", f.align);

    });
}
//#endregion

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
    fitInputWidth("Header_JIDNH_DN_No", 20, 25);
    fitInputWidth("Header_JIDNH_MS_Number", 20, 30);
    fitInputWidth("Header_JIDNH_JW_Customer_Name", 40, 50);
    fitInputWidth("Header_JIDNH_Currency_Number", 10, 10);
    fitInputWidth("Header_JIDNH_WH_Number", 20, 25);
    fitInputWidth("Header_JIDNH_PaymentTerms", 30, 40);
    fitInputWidth("Header_JIDNH_DeliveryTerms", 30, 40);
    fitInputWidth("Header_JIDNH_DeliveryMode", 30, 40);
    fitInputWidth("Header_JIDNH_DespatchDocumentNo", 30, 40);
    fitInputWidth("Header_JIDNH_DespatchedThrough", 30, 40);
    fitInputWidth("Header_JIDNH_Remarks", 40, 40);
}
$(window).on("load", function () {
    setTimeout(function () {

        ApplyFieldWidths({
            fields: ItemTableFields,
            container: "#ItemTable",
            tempRow: "#TempRow",
            tableBody: "#TableBody",
            searchTable: "#tblsearch"
        });

    }, 200);
});
function ResizeColumn(control) {

    const field = ItemTableFields.find(f => $(control).is(f.cls));

    if (!field)
        return;

    ApplyFieldWidths({
        fields: [field],          // Only this column
        container: "#ItemTable",
        tempRow: "#TempRow",
        tableBody: "#TableBody",
        searchTable: "#tblsearch"
    });
}
$(document).ready(function () {
    //#region batch grid alignment
    $(document).on("input change blur", "#DeliveryNoteBatchList input, #DeliveryNoteBatchList textarea, #DeliveryNoteBatchList select", function () {
        ApplyBatchFieldWidths("#DeliveryNoteBatchList");
    });
    ApplyBatchFieldWidths("#DeliveryNoteBatchList");
    $(document).on(
        "input change blur",
        "#DeliveryNoteOtherBatchList input, #DeliveryNoteOtherBatchList textarea, #DeliveryNoteOtherBatchList select",
        function () {
            ApplyOtherBatchFieldWidths("#DeliveryNoteOtherBatchList");
        }
    );

    ApplyOtherBatchFieldWidths("#DeliveryNoteOtherBatchList");
    //#endregion
    //#region item grid alignment
    $(document).on("input", "#ItemTable input", function () {
        ResizeColumn(this);
    });

    $(document).on("change", "#ItemTable select", function () {
        ResizeColumn(this);
    });
    //#endregion

    AutoFit();
    //#region Header AutoFit - KeyUp

    $(document).on("keyup change input",
        "#Header_JIDNH_DN_No, #Header_JIDNH_MS_Number, #Header_JIDNH_JW_Customer_Name, #Header_JIDNH_Currency_Number, #Header_JIDNH_WH_Number, #Header_JIDNH_PaymentTerms, #Header_JIDNH_DeliveryTerms, #Header_JIDNH_DeliveryMode, #Header_JIDNH_DespatchDocumentNo, #Header_JIDNH_DespatchedThrough, #Header_JIDNH_Remarks",
        function () {

            const widths = {
                Header_JIDNH_DN_No: [20, 25],
                Header_JIDNH_MS_Number: [20, 30],
                Header_JIDNH_JW_Customer_Name: [40, 50],
                Header_JIDNH_Currency_Number: [10, 10],
                Header_JIDNH_WH_Number: [20, 25],
                Header_JIDNH_PaymentTerms: [30, 40],
                Header_JIDNH_DeliveryTerms: [30, 40],
                Header_JIDNH_DeliveryMode: [30, 40],
                Header_JIDNH_DespatchDocumentNo: [30, 40],
                Header_JIDNH_DespatchedThrough: [30, 40],
                Header_JIDNH_Remarks: [40, 40]
            };

            const [min, max] = widths[this.id];
            fitInputWidth(this, min, max);
        });

    //#endregion

    $(document).on("focusout", "#Header_JIDNH_JW_Customer_Name", function () {

        let input = $(this);
        let rows = $("#RightPane .buyer-search-results tbody tr");

        HandleSearchSelection(
            input,
            rows,
            "#BuyerMessage",
            "#RightPane",
            "#RightPane .buyer-search-results"
        );
    });

    $(document).on("keydown", "#Header_JIDNH_JW_Customer_Name", function (e) {
        HandleSearchKeyDown(
            e,
            this,
            "#RightPane",
            ".buyer-search-results",
            "#BuyerMessage"
        );
    }); 
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
    $(document).on("keyup change", ".JIDNI_Qty, .JIDNI_UnitPrice", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat((row.find(".JIDNI_Qty").val() || "0").replace(/,/g, "")) || 0;
        let price = parseFloat((row.find(".JIDNI_UnitPrice").val() || "0").replace(/,/g, "")) || 0;

        let amount = qty * price;

        // Only set row amount (read-only field)
        row.find(".JIDNI_Amount").val(formatIndianCurrency(amount));

        // update footer totals separately
        calculateTotal();

        // auto add row
        autoAddRow(row);
    });
    //#endregion onkeypress qty and unit

    $(document).on("click", "#btnClearAll", function () {
        ClearAll();
    });

    //#region auto add row function
    function autoAddRow(currentRow) {

        let qty = parseFloat(currentRow.find(".JIDNI_Qty").val()) || 0;
        let price = parseFloat(currentRow.find(".JIDNI_UnitPrice").val()) || 0;

        let itemCode = currentRow.find(".JIDNI_Item_Code").val();
        let prsNo = currentRow.find(".JIDNI_PRS_Number").val();

        // validate current row
        let isRowValid =
            itemCode &&
            qty > 0 &&
            price > 0 &&
            prsNo &&
            prsNo !== "0";

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

            if (el.hasClass("JIDNI_PRS_Number")) {

                if (!el.val() || el.val() === "0") {
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
        $("#TableBody").append($newRow);

        rowIndex++;

        // 5. Recalculate totals (optional hook)
        calculateTotal();
        //region item grid row focus out event
        //$("#ItemTable").on(
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
        ApplyFieldWidths({
            fields: ItemTableFields,
            container: "#ItemTable",
            tempRow: "#TempRow",
            tableBody: "#TableBody",
            searchTable: "#tblsearch"
        });
      
    });
    //#endregion add row item grid

    //#region jwc address
  

    $("#AddressButton").click(function () {

        var count = GetVisibleAddressRowCount();
        console.log('--visibleRowCount--' + count);
        if (count === 0) {
            LoadJWCAddress();
        } else {
            $("#BuyerAddress").modal("show");
        }

    });
    function GetVisibleAddressRowCount() {

        return $("#AddTableBody tr.AddNewRow").filter(function () {
            var style = ($(this).attr("style") || "")
                .replace(/\s/g, "")
                .toLowerCase();

            return !style.includes("display:none");
        }).length;
    }

    //#region CLICK ADDRESS BUTTON, ADD ADDRESS ROW, DELETE ADDRESS ROW


    $("#AddressAddButton").on("click", function () {

        if (!validateTempRow()) return;

        addAddressRow();
    });
    $(document).on("click", ".AddRowRemove", function () {

        let row = $(this).closest("tr");

        row.find(".JIDNA_IsDeleted").val("1");
        row.hide();
    });
    //#endregion CLICK ADDRESS BUTTON



    //#region CHANGE ADDRESS TYPE
    function isDuplicateAddress(type, currentRow) {
        var isDuplicate = false;

        $('tr.AddNewRow').not(currentRow).each(function () {

            var rowType = $(this).find('select.JIDNA_ADTP_Number').val();
            var isDeleted = parseInt($(this).find("input.JIDNA_IsDeleted").val());

            if (isDeleted !== 1) {
                if (rowType === type) {
                    isDuplicate = true;
                    return false; // break loop
                }
            }
        });

        return isDuplicate;
    }
    $(document).on('change', 'tr.AddNewRow select.JIDNA_ADTP_Number', function () {

        var currentRow = $(this).closest('tr.AddNewRow');

        var ADTPNumber = currentRow.find('.JIDNA_ADTP_Number').val();
        var Buyer = $('#Header_JIDNH_JW_Customer_Number').val(); // keep if same field exists

        var ADDAddress = currentRow.find('.JIDNA_Address');
        var ADDCity = currentRow.find('.JIDNA_City');
        var ADDState = currentRow.find('.JIDNA_State');
        var ADDCountry = currentRow.find('.JIDNA_Country');
        var ADDPin = currentRow.find('.JIDNA_PIN');
        var ADDGSTIN = currentRow.find('.JIDNA_GSTIN');
        var ADDAddress_ID = currentRow.find('.JIDNA_Address_ID');
        if (ADTPNumber && isDuplicateAddress(ADTPNumber, currentRow)) {
            alert('This Address Type already exists!');
            $(this).val('');
            $(this).focus();
            return;
        }

        $.ajax({
            type: "GET",
            url: "/jobinward/transactions/delivery-note/buyer/address",
            data: { Buyer: Buyer, ADTPNumber: ADTPNumber },
            dataType: "json",
            success: function (data) {

             
                var AddressDefault = data.buyerAddress;

              

                // set default + fill fields
                if (AddressDefault != null) {
                    ADDAddress_ID.val(AddressDefault.buY_ADD_AddressID);

                    ADDAddress.val(AddressDefault.buY_ADD_Address);
                    ADDCity.val(AddressDefault.buY_ADD_City);
                    ADDState.val(AddressDefault.buY_ADD_State);
                    ADDCountry.val(AddressDefault.buY_ADD_Country);
                    ADDPin.val(AddressDefault.buY_ADD_Pin);
                    ADDGSTIN.val(AddressDefault.buY_ADD_GSTIN);
                }
            }
        });
    });
    //#endregion CHANGE ADDRESS TYPE

  

    //#region Save Function
    $("#btnSave").on("click", function (e) {

        if (!validateHeaderById()) {
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

                url: '/DeliveryNote/SaveDeliveryNote',

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
            if (!itemBatch.BatchList || itemBatch.BatchList.length <= 0) {
                return true;
            }

            $.each(itemBatch.BatchList, function () {

                let batch = this;

                // Skip empty qty
                if (
                    !batch.JIDNI_BCH_QtyInvoice ||
                    parseFloat((batch.JIDNI_BCH_QtyInvoice || "0").toString().replace(/,/g, "")) <= 0
                ) {
                    return true;
                }

                //#region FORMAT DATE

                let formattedBatchDate = null;

                if (batch.JIDNI_BCH_BatchDate) {

                    let date = new Date(batch.JIDNI_BCH_BatchDate);

                    if (!isNaN(date.getTime())) {
                        formattedBatchDate = date.toISOString();
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

                    JIDNI_BCH_BatchDate:
                        formattedBatchDate,

                    JIDNI_BCH_BatchNo:
                        batch.JIDNI_BCH_BatchNo || "",

                    JIDNI_BCH_BatchQty:
                        parseFloat((batch.JIDNI_BCH_QtyInvoice || "0").toString().replace(/,/g, "")) || 0,

                    JIDNI_BCH_BatchUnitPrice:
                        parseFloat((batch.JIDNI_BCH_BatchUnitPrice || "0").toString().replace(/,/g, "")) || 0,

                    JIDNI_BCH_BatchValue:
                        parseFloat((batch.JIDNI_BCH_BatchValue || "0").toString().replace(/,/g, "")) || 0
                };

                deliveryNoteBatches.push(deliveryNoteBatch);

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

            JIDNH_JW_Customer_Number:
                parseInt($("#Header_JIDNH_JW_Customer_Number").val()) || 0,

            JIDNI_Item_Code:
                $("#Header_JIDNI_Item_Code").val(),

            JIDNH_JW_Customer_Name:
                $("#Header_JIDNH_JW_Customer_Name").val(),

            JIDNH_Currency_Number:
                parseInt($("#Header_JIDNH_Currency_Number").val()) || 0,

            JIDNH_WH_Number:
                parseInt($("#Header_JIDNH_WH_Number").val()) || 0,

            JIDNH_PaymentTerms:
                $("#Header_JIDNH_PaymentTerms").val(),

            JIDNH_DeliveryTerms:
                $("#Header_JIDNH_DeliveryTerms").val(),

            JIDNH_DeliveryMode:
                $("#Header_JIDNH_DeliveryMode").val(),

            JIDNH_DespatchDocumentNo:
                $("#Header_JIDNH_DespatchDocumentNo").val(),

            JIDNH_DespatchedThrough:
                $("#Header_JIDNH_DespatchedThrough").val(),

            JIDNH_Remarks:
                $("#Header_JIDNH_Remarks").val(),

            DN_Id:
                parseInt($("#Header_DN_Id").val()) || null,

            DN_CUS_Number:
                parseInt($("#Header_DN_CUS_Number").val()) || null,

            DN_ADD_ADTP_Number:
                parseInt($("#Header_DN_ADD_ADTP_Number").val()) || null
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
                JISVOH_Number:
                    parseInt(row.find(".JISVOH_Number").val()) || 0,

                JIDNI_JIDNH_Number:
                    parseInt(row.find(".JIDNI_JIDNH_Number").val()) || 0,

                JIDNI_Number:
                    parseInt(row.find(".JIDNI_Number").val()) || 0,

                JIDNI_PRS_Number:
                    parseInt(row.find(".JIDNI_PRS_Number").val()) || 0,

                JIDNI_Item_Number:
                    parseInt(row.find(".JIDNI_Item_Number").val()) || 0,

                JIDNI_WH_Number:
                    parseInt(row.find(".JIDNI_WH_Number").val()) || 0,

                JIDNI_UoM_Number:
                    parseInt(row.find(".JIDNI_UoM_Number").val()) || 0,

                JIDNI_Qty:
                    parseFloat((row.find(".JIDNI_Qty").val() || "0").replace(/,/g, "")) || 0,

                JIDNI_UnitPrice:
                    parseFloat((row.find(".JIDNI_UnitPrice").val() || "0").replace(/,/g, "")) || 0,

                JIDNI_Amount:
                    parseFloat((row.find(".JIDNI_Amount").val() || "0").replace(/,/g, "")) || 0,

                JIDNI_JW_InvoiceTracking:
                    row.find(".JIDNI_JW_InvoiceTracking").is(":checked")
                        ? "Yes"
                        : "No"
            };

            items.push(item);

        });

        // =====================================
        // ADDRESS
        // =====================================
        var addresses = [];

        $("#AddTableBody tr.AddNewRow").each(function () {

            let row = $(this);

            // Skip deleted rows
            if (row.find(".JIDNA_IsDeleted").val() == "1") {
                return;
            }

            // Skip empty rows
            if (!row.find(".JIDNA_Address_ID").val()) {
                return;
            }

            let address = {

                JIDNA_JIDNH_Number:
                    parseInt(row.find(".JIDNA_JIDNH_Number").val()) || 0,

                JIDNA_Number:
                    parseInt(row.find(".JIDNA_Number").val()) || 0,

                JIDNA_ADTP_Number:
                    parseInt(row.find(".JIDNA_ADTP_Number").val()) || 0,

                JIDNA_Address_ID:
                    row.find(".JIDNA_Address_ID").val(),

                JIDNA_Address:
                    row.find(".JIDNA_Address").val(),

                JIDNA_City:
                    row.find(".JIDNA_City").val(),

                JIDNA_State:
                    row.find(".JIDNA_State").val(),

                JIDNA_Country:
                    row.find(".JIDNA_Country").val(),

                JIDNA_PIN:
                    row.find(".JIDNA_PIN").val(),

                JIDNA_GSTIN:
                    row.find(".JIDNA_GSTIN").val()
            };

            addresses.push(address);

        });


        // =====================================
        // FINAL MODEL
        // =====================================
        var deliveryNoteModel = {

            Header: header,
            Items: items,
            deliveryNoteBatches: CreateDeliveryNoteBatchModel(),
            Addresses: addresses
          
        };
        console.log(deliveryNoteModel)

        return deliveryNoteModel;
       
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

                url: '/DeliveryNote/DeleteTempDeliveryBatchRow',

                type: 'POST',

                data: { index: ItemGridindex },

                success: function (response) {
                    // remove selected row
                    currentRow.remove();
                    calculateTotal();
                },

                error: function (xhr) {

                    console.log(xhr.responseText);
                }
            });
       
        });
      
      

    });
    //#endregion remove checked rows


    $(document).on(
        "change",
        ".JIDNI_JW_InvoiceTracking, .JIDNI_PRS_Number, .JIDNI_Item_Code, .JIDNI_UoM_Number",
        function () {

            let row = $(this).closest("tr");

            if (row.find(".JIDNI_JW_InvoiceTracking").is(":checked")) {

                BindServiceOrder(
                    $("#Header_JIDNH_JW_Customer_Number").val(),
                    row.find(".JIDNI_PRS_Number").val(),
                    row.find(".JIDNI_Item_Number").val(),
                    row.find(".JIDNI_UoM_Number").val()
                );

            } else {
                row.find(".JISVOH_Number").html('<option value="0"></option>');
            }
        }
    );

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
            .index("#ItemTable tbody tr.NewRow:visible") + 1;
    $.ajax({

        url: '/DeliveryNote/TempDeliveryBatchDeleteChangeItemDBRow',

        type: 'POST',

        data: { index: ItemGridindex },

        success: function (response) {
          
            calculateTotal();
        },

        error: function (xhr) {

            console.log(xhr.responseText);
        }
    });
}



//#endregion
 
function addAddressRow() {

    let i = addressIndex;

    let $row = $("#AddTempRow").clone();

    $row.removeAttr("id");
    $row.addClass("AddNewRow");
    $row.show();

    // 1. Address Type
    $row.find(".JIDNA_ADTP_Number")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_ADTP_Number`);

    // 2. Address ID
    $row.find(".JIDNA_Address_ID")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_Address_ID`);

    // 3. Address
    $row.find(".JIDNA_Address")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_Address`);

    // 4. City
    $row.find(".JIDNA_City")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_City`);

    // 5. State
    $row.find(".JIDNA_State")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_State`);

    // 6. Country
    $row.find(".JIDNA_Country")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_Country`);

    // 7. PIN
    $row.find(".JIDNA_PIN")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_PIN`);

    // 8. GSTIN
    $row.find(".JIDNA_GSTIN")
        .val("")
        .attr("name", `Addresses[${i}].JIDNA_GSTIN`);

    // 9. Delete flag
    $row.find(".JIDNA_IsDeleted")
        .val("0")
        .attr("name", `Addresses[${i}].JIDNA_IsDeleted`);

    $("#AddTableBody").append($row);

    addressIndex++;
}

function validateAddressGrid() {

    let hasRow = false;
    let valid = true;

    $("#AddTableBody tr.AddNewRow").each(function () {

        let row = $(this);

        if (row.find(".JIDNA_IsDeleted").val() === "1") return;

        let type = row.find(".JIDNA_ADTP_Number").val();
        let addr = row.find(".JIDNA_Address_ID").val();

        if (type && addr) {
            hasRow = true;
        }

        if (type && !addr) {
            showAlert('Address ID required');
            row.find(".JIDNA_Address_ID").focus();
            valid = false;
            return false;
        }

        if (!type && addr) {
            showAlert('Address Type required');
            row.find(".JIDNA_ADTP_Number").focus();
            valid = false;
            return false;
        }
    });

    if (!hasRow) {
        showAlert('Please add at least one address');
        return false;
    }

    return valid;
}


function validateTempRow() {

    let isValid = true;

    $("#AddTableBody tr.AddNewRow:visible").each(function () {

        let row = $(this);
        console.log('JIDNA_ADTP_Number:' + row.find(".JIDNA_ADTP_Number").val())
        if (!row.find(".JIDNA_ADTP_Number").val()) {
            showAlert('Address Type is required');
            isValid = false;
            return false; // break each
        }

        if (!row.find(".JIDNA_Address_ID").val()) {
            showAlert('Address ID is required');
            isValid = false;
            return false;
        }
    });

    return isValid;
}


//#endregion


//#region customer Search Functions
//#region JW Customer Search Functions

function OnBuyerSelectCall(inputElement) {

    OnBuyerSelect(inputElement, "#RightPane", ".buyer-search-results");
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

function SearchBuyer(inputElement) {

    var JWCustomer = inputElement.value;
    var SIHDate = $("input[name='Header.JIDNH_DN_Date']").val();
    var resultsDiv = $("#RightPane").find(".buyer-search-results");



    $.ajax({
        url: '/jobinward/transactions/delivery-note/cutomer',
        type: 'GET',
        data: {
            Buyer: JWCustomer,
            SIHDate: SIHDate
        },
        success: function (data) {

            resultsDiv.empty();
            $("#BuyerMessage").hide().text("");
            if (data && data.length > 0) {

                $("#RightPane").addClass("show");   // <-- Add this line
                resultsDiv.show();
                let selectedIndex = -1;
                var table = $(
                    '<div class="card-body modal-content batchPopup p-0" style="z-index:999;">' +
                    '<table class="table table-bordered table-hover table-fixed table-grid mb-0 w-100">' +
                    '<thead>' +
                    '<tr class="table-info">' +
                    '<th>JW Customer Name</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody></tbody>' +
                    '</table>' +
                    '</div>'
                );

                $.each(data, function (i, cust) {

                    var row = $("<tr></tr>").css("height", "24px");
                    row.data("customer", cust);
                    row.append("<td>" + cust.cuS_Name + "</td>");


                    table.find("tbody").append(row);

                    row.on("click", function () {
                        $("#BuyerMessage").hide().text("");
                        SelectBuyer(
                            cust,
                            "#Header_JIDNH_JW_Customer_Name",
                            "#Header_JIDNH_JW_Customer_Number",
                            "#Header_JIDNH_Currency_Name",
                            "#Header_JIDNH_Currency_Number",
                            "#Header_JIDNH_WH_Number",
                            "#RightPane",
                            ".buyer-search-results"
                        );
                        //-------------------------------
                        // DISPLAY VALUE
                        $(inputElement).val(cust.cuS_Name);

                        // HIDDEN VALUE
                        $("#Header_JIDNH_JW_Customer_Number")
                            .val(cust.cuS_Number);

                        // OTHER VALUES
                        $("#Currency_Name")
                            .val(cust.cuS_CUR_Name);

                        $("#Currency_Number")
                            .val(cust.cuS_CUR_Number);

                        $("#SIH_CUR_Number")
                            .val(cust.cuS_CUR_Number);

                        $("#SIH_BUY_LOC_Number")
                            .val(cust.cuS_LOC_Number);

                        $("#SIH_CUR_DecimalPlaces")
                            .val(cust.cuS_CUR_DecimalPlaces);

                        $("#SIH_WHT_Number")
                            .val(cust.cuS_WHT_Number);

                        $("#WH_Number")
                            .val(cust.cuS_WH_Number);
                        //--------------------------------
                    });

                });



                resultsDiv.append(table);

                resultsDiv.append(`
<div id="BuyerMessage"
     style="
        display:none;
        background:#bdbdbd;
        border-top:1px solid #ced4da;
        color:#dc3545;
        font-weight:bold;
        text-align:center;
        padding:4px 52px;
        font-size:18px;
        position:absolute;
        bottom:0;
        left:-2px;
        right:0;
        z-index:10;
        box-sizing:border-box;">
</div>
`);
                // Keyboard Navigation
                //#region search logic highlight

                // Store all rows
                let rows = resultsDiv.find("tbody tr");

                // Clear previous styles
                rows.removeClass("match-row current-row");

                // No row selected initially
                $(inputElement).removeData("selectedIndex");

                let searchText = JWCustomer.trim().toLowerCase();

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

                    $(inputElement).data("firstMatch", firstMatch);
                    $(inputElement).data("lastMatch", lastMatch);
                }
                else {

                    $(inputElement).removeData("firstMatch");
                    $(inputElement).removeData("lastMatch");
                }

                //#endregion

            } else {
                resultsDiv.append(`
<div id="BuyerMessage"
     style="
        display:none;
        background:#bdbdbd;
        border-top:1px solid #ced4da;
        color:#dc3545;
        font-weight:bold;
        text-align:center;
        padding:4px 52px;
        font-size:18px;
        position:absolute;
        bottom:0;
        left:-2px;
        right:0;
        z-index:10;
        box-sizing:border-box;">
</div>
`);

                $("#BuyerMessage")
                    .html("No records found")
                    .show();

                $("#RightPane").addClass("show");
                $("#RightPane .buyer-search-results").show();

            }
        },
        error: function () {
            resultsDiv.text("Error loading data.").show();
        }
    });
}

// Hide search when clicking outside

 //#endregion customer Search Functions


//#region Delivered Qty Validation

$(document).on("focusout", ".JIDNI_Qty", function () {

    let row = $(this).closest("tr");
    let jisvohNumber = row.find(".JISVOH_Number").val();  
    if (!jisvohNumber) return;
    let prsNumber = row.find(".JIDNI_PRS_Number").val();
    let itemNumber = row.find(".JIDNI_Item_Number").val();
    let uomNumber = row.find(".JIDNI_UoM_Number").val();
    let originalQty = parseFloat(row.find(".JIDNI_Qty").val()) || 0;
    let rowIndex = row.index();
    $.get("/DeliveryNote/CheckDeliveredQtyExceeded", {
        jisvohNumber,
        prsNumber,
        itemNumber,
        uomNumber
    }, function (res) {
        if (!res || res.length === 0) return;
        let deliveredQty = parseFloat(res[0].deliveredQty) || 0;
        let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;
        if ((deliveredQty + originalQty) > jisvoiQty) {         

            alert("Qty Allowed: " + (jisvoiQty - deliveredQty));
            setTimeout(function () {
                row.find(".JIDNI_Qty")
                    .focus()
                    .select();
                row.find(".JISVOH_Number").val("0");
            }, 300);            
        }
    });
});

$(document).on("change", ".JISVOH_Number", function () {

    let row = $(this).closest("tr");
    let jisvohNumber = $(this).val();
    row.find(".JISVOH_Number").val(jisvohNumber)  

    let prsNumber = row.find(".JIDNI_PRS_Number").val();
    let itemNumber = row.find(".JIDNI_Item_Number").val();
    let uomNumber = row.find(".JIDNI_UoM_Number").val();
    let originalQty = parseFloat(row.find(".JIDNI_Qty").val()) || 0;
    let rowIndex = row.index();

    $.get("/DeliveryNote/CheckDeliveredQtyExceeded", {
        jisvohNumber,
        prsNumber,
        itemNumber,
        uomNumber
    }, function (res) {

        if (!res || res.length === 0) return;

        let deliveredQty = parseFloat(res[0].deliveredQty) || 0;
        let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;

        if ((deliveredQty + originalQty) > jisvoiQty) {
          

            alert("Qty Allowed: " + (jisvoiQty - deliveredQty));
            setTimeout(function () {
                row.find(".JIDNI_Qty")
                    .focus()
                    .select();
                row.find(".JISVOH_Number").val("0");
            }, 300);
        
          
        }
    });
});

//#endregion
function BindServiceOrder(customerId, prsNumber = null, itemNumber = null, uomNumber = null) {
    $(".JISVOH_Number").html('<option value="0"></option>');
    if (!customerId) return;

    $.get("/DeliveryNote/GetServiceOrder",
        { customerId, prsNumber, itemNumber, uomNumber },
        data => $.each(data, (_, item) =>
            $(".JISVOH_Number").append(`<option value="${item.value}">${item.text}</option>`)
        )
    );
}


//#region Calculate Total
function calculateTotal() {

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

        // Get Unit Price
        let unitPrice = parseFloat(row.find(".JIDNI_UnitPrice").val()) || 0;

        // Row Amount = Qty × Unit Price
        let amount = qty * unitPrice;

        // Set row amount field
        row.find(".JIDNI_Amount").val(amount.toFixed(2));

        // Add to totals
        totalQty += qty;
        totalAmount += amount;
    });

    // Footer totals
    $("#TotalQty").val(totalQty);
    $("#TotalAmount").val(totalAmount.toFixed(2));
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
    let resultsDiv = $("#RightPane_Item").find(".search-results");


    let material = $("#Header_JIDNH_MS_Number").val();


    if (!material) return;

    $.ajax({
        url: '/jobinward/transactions/delivery-note/item',
        type: 'GET',
        data: {
            ItemCode: itemCode,
            MS: material
        },
        success: function (data) {

            resultsDiv.empty();
            $("#ItemMessage").hide().text("");
            if (data && data.length > 0) {
                $("#RightPane_Item").addClass("show");
                resultsDiv.show();

                let table = $(`
                    <div class="card-body batchPopup modal-content p-0 table-responsive">
                        <table class="table table-bordered table-hover table-fixed mb-0 table-grid" id="tblsearch">
                            <thead>
                                <tr class="table-info">
                                    <th>Item Code</th>
                                    <th>Description</th>
                                  
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
                         
                        </tr>
                    `);
                    tr.css("height", "24px");
                    // CLICK SELECT
                    tr.on("click", function () {
                        $("#ItemMessage").hide().text("");
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
                        qtyInput.val(formatIndianQty(qtyVal));
                        qtyUnitprice.val(formatIndianCurrency(qtyUnitpriceVal));
                    
                         
                       
                        resultsDiv.hide();
                        $("#RightPane_Item").removeClass("show");
                    });

                    table.find("tbody").append(tr);
                });

                resultsDiv.append(table);

                resultsDiv.append(`
<div id="ItemMessage"
     style="
        display:none;
        background:#bdbdbd;
        border-top:1px solid #ced4da;
        color:#dc3545;
        font-weight:bold;
        text-align:center;
        padding:4px 52px;
        font-size:18px;
        position:absolute;
        bottom:0;
        left:-2px;
        right:0;
        z-index:10;
        box-sizing:border-box;">
</div>
`);
                // Keyboard Navigation
                //#region search logic highlight

                // Store all rows
                let rows = resultsDiv.find("tbody tr");

                // Clear previous styles
                rows.removeClass("match-row current-row");

                // No row selected initially
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

                        lastMatch = i;
                    }
                });

                if (firstMatch >= 0) {

                    $(inputElement).data("firstMatch", firstMatch);
                    $(inputElement).data("lastMatch", lastMatch);
                }
                else {

                    $(inputElement).removeData("firstMatch");
                    $(inputElement).removeData("lastMatch");
                }

                //#endregion
                //resultsDiv.append(closeButton);
                resultsDiv.append(table);

            } else {
                resultsDiv.append(`
<div id="ItemMessage"
     style="
        display:none;
        background:#bdbdbd;
        border-top:1px solid #ced4da;
        color:#dc3545;
        font-weight:bold;
        text-align:center;
        padding:4px 52px;
        font-size:18px;
        position:absolute;
        bottom:0;
        left:-2px;
        right:0;
        z-index:10;
        box-sizing:border-box;">
</div>
`);

                $("#ItemMessage")
                    .html("No records found")
                    .show();

                $("#RightPane_Item").addClass("show");
                $("#RightPane_Item .search-results").show();
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
        showAlert('Delivery Note No. is required','#Header_JIDNH_DN_No');
        
        return false;
    }

    // 2. DN Date
    if ($("#Header_JIDNH_DN_Date").val().trim() === "") {
        showAlert('DN Date is required','#Header_JIDNH_DN_Date');
        
        return false;
    }

    // 3. Material Segregation
    if ($("#Header_JIDNH_MS_Number").val() === "" || $("#Header_JIDNH_MS_Number").val() === "0") {
        showAlert('Material Segregation is required','#Header_JIDNH_MS_Number');
        
        return false;
    }

    // 4. JW Customer
    if ($("#Header_JIDNH_JW_Customer_Number").val().trim() === "" ||
        $("#Header_JIDNH_JW_Customer_Name").val().trim() === "") {

        showAlert('JW Customer is required','#Header_JIDNH_JW_Customer_Name');
       
        return false;
    }

    // 5. Currency
    if ($("#Header_JIDNH_Currency_Number").val() === "" || $("#Header_JIDNH_Currency_Number").val() === "0") {
        showAlert('Currency is required','#Header_JIDNH_Currency_Number');
       
        return false;
    }

    // 6. Warehouse
    if ($("#Header_JIDNH_WH_Number").val() === "" || $("#Header_JIDNH_WH_Number").val() === "0") {
        showAlert('Warehouse is required','#Header_JIDNH_WH_Number');
     
        return false;
    }

    //// 7. Payment Terms
    //if ($("#Header_JIDNH_PaymentTerms").val().trim() === "") {
    //    showAlert('Payment Terms is required','#Header_JIDNH_PaymentTerms');
        
    //    return false;
    //}

    //// 8. Delivery Terms
    //if ($("#Header_JIDNH_DeliveryTerms").val().trim() === "") {
    //    showAlert('Delivery Terms is required','#Header_JIDNH_DeliveryTerms');
      
    //    return false;
    //}

    //// 9. Delivery Mode
    //if ($("#Header_JIDNH_DeliveryMode").val().trim() === "") {
    //    showAlert('Delivery Mode is required','#Header_JIDNH_DeliveryMode');
        
    //    return false;
    //}

    //// 10. Despatch Document No
    //if ($("#Header_JIDNH_DespatchDocumentNo").val().trim() === "") {
    //    showAlert('Despatch Document No is required','#Header_JIDNH_DespatchDocumentNo');
       
    //    return false;
    //}

    //// 11. Despatched Through
    //if ($("#Header_JIDNH_DespatchedThrough").val().trim() === "") {
    //    showAlert('Despatched Through is required','#Header_JIDNH_DespatchedThrough');
      
    //    return false;
    //}

    //// 12. Remarks
    //if ($("#Header_JIDNH_Remarks").val().trim() === "") {
    //    showAlert('Remarks is required','#Header_JIDNH_Remarks');
     
    //    return false;
    //}
    // =========================
    // GRID VALIDATION CALL
    // =========================
    if (!validateItemGrid()) {
        return false;
    }
    //if (!validateAddressGrid()) {
    //    return false;
    //}
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

    $("#ItemTable tbody tr").each(function () {

        let row = $(this);

        // skip template row
        if (row.hasClass("TempRow")) return;

        // skip deleted row
        if (row.find(".JIDNI_IsDeleted").val() === "1") return;

        let process = row.find(".JIDNI_PRS_Number").val();
        let itemCode = row.find(".JIDNI_Item_Code").val();
        let qty = row.find(".JIDNI_Qty").val();
        let unitPrice = row.find(".JIDNI_UnitPrice").val();

        // check if row has ANY data
        let isRowStarted =
            (process && process.trim() !== "") ||
            (itemCode && itemCode.trim() !== "") ||
            (qty && qty.trim() !== "") ||
            (unitPrice && unitPrice.trim() !== "");

        // if row is empty → skip
        if (!isRowStarted) return;

        // row is considered active
        hasValidRow = true;

        // validate Process
        if (!process || process.trim() === "" || process === "0") {
            showAlert(
                'Process is required',
                row.find(".JIDNI_PRS_Number")
            );
            isValid = false;
            return false; // break loop
        }

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

        // validate Unit Price
        if (!unitPrice || unitPrice.trim() === "" || unitPrice.trim() === "0") {
            showAlert('Unit Price is required', row.find(".JIDNI_UnitPrice"));
          
            isValid = false;
            return false;
        }

    });

    // no valid row added
    if (!hasValidRow) {
        showAlert('Please add at least one item in grid', "#ItemTable tbody tr:first .JIDNI_PRS_Number");
        //row.find(".JIDNI_PRS_Number").focus();
        return false;
    }

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

function LoadJWCAddress() {
    var jwcNumber = $("#Header_JIDNH_JW_Customer_Number").val();

    $.ajax({
        url: '/JobworkInvoice/GetJWCAddress',
        type: 'GET',
        data: { JWCNumber: jwcNumber },
        success: function (response) {
            console.log(JSON.stringify(response));
            if (!response || !response.length) return;

            var rowCount = 0;

            response.forEach(function (addr) {
                if (addr.jwC_ADD_Default != 1) return;

                addAddressRow(); // always create new row
                var row = $("#AddTableBody tr.AddNewRow:last");

                row.find(".JIDNA_ADTP_Number").val(addr.jwC_ADD_ADTP_Number).trigger("change");
                row.find(".JIDNA_Address_ID").val(addr.jwC_ADD_Address_ID);
                row.find(".JIDNA_Address").val(addr.jwC_ADD_Address);
                row.find(".JIDNA_City").val(addr.jwC_ADD_City);
                row.find(".JIDNA_State").val(addr.jwC_ADD_State);
                row.find(".JIDNA_Country").val(addr.jwC_ADD_Country);
                row.find(".JIDNA_PIN").val(addr.jwC_ADD_PIN);
                row.find(".JIDNA_GSTIN").val(addr.jwC_ADD_GSTIN);

                row.show();
            });

            $("#BuyerAddress").modal("show");
        }
    });
}
