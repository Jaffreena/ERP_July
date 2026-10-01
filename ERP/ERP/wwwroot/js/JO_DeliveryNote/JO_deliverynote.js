$(document).ready(function () {
    //#region JW_Customer – Focus In
    // Handled via inline onfocus="ShowCustomerPane();OnBuyerSelectCall(this)"
    // in the .cshtml — no delegated binding needed.
    //#endregion

    //#region JW_Customer – Text change
    // Handled via inline oninput="OnBuyerInput(this)" in the .cshtml.
    //#endregion

    //#region JW_Customer – Focus Out
    $(document).on("focusout", "#Header_JODNH_JW_Vendor_Name", function () {
        if (isMouseSelectingBuyer)
            return;
        let input = $(this);
        let rows = $("#RightPane .buyer-search-results tbody tr");

        if ($.trim(input.val()) === "" && rows.length > 0 &&
            !rows.filter(".current-row, .match-row").length) {

            rows.first().trigger("mousedown");
            return;
        }

        HandleSearchSelection(
            input,
            rows,
            "#BuyerMessage",
            "#RightPane",
            "#RightPane .buyer-search-results"
        );
    });
    //#endregion

    //#region JW_Customer – Keydown
    $(document).on("keydown", "#Header_JODNH_JW_Vendor_Name", function (e) {

        if (e.key !== "ArrowDown" && e.key !== "ArrowUp" &&
            e.key !== "Enter" && e.key !== "Escape") {
            return;
        }

        let input = $(this);
        let rows = $("#RightPane .buyer-search-results tbody tr");

        // Enter or Escape on an empty textbox (no record selected,
        // full unfiltered list) -> auto-select first record + close
        // popup, same behavior for both keys.
        if ((e.key === "Enter" || e.key === "Escape") &&
            $.trim(input.val()) === "" && rows.length > 0 &&
            !rows.filter(".current-row, .match-row").length) {

            e.preventDefault();

            rows.first().trigger("mousedown");
            return;
        }

        if (e.key === "Escape") {
            HandleSearchSelection(
                input,
                rows,
                "#BuyerMessage",
                "#RightPane",
                "#RightPane .buyer-search-results"
            );
            return;
        }

        if (e.key === "Enter") {
            HandleSearchSelection(
                input,
                rows,
                "#BuyerMessage",
                "#RightPane",
                "#RightPane .buyer-search-results"
            );
            return;
        }

        HandleSearchKeyDown(
            e,
            this,
            "#RightPane",
            ".buyer-search-results",
            "#BuyerMessage"
        );
    });
    //#endregion

    //#region Item_Code – Focus In
    // Handled via inline onfocus="ShowItemPane();OnFocusItem(this)"
    // in the .cshtml — the re-trigger-loop guard lives inside
    // OnFocusItem itself.
    //#endregion

    //#region Item_Code – Text change
    // Handled via inline oninput="OnInputItem(this)" in the .cshtml.
    //#endregion

    //#region Item_Code – Keydown
    $(document).on("keydown", ".JODNI_Item_Code", function (e) {

        if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Enter") {
            return;
        }

        let rows = $("#RightPane_Item .search-results tbody tr");

        if (e.key === "Enter" &&
            $.trim($(this).val()) === "" && rows.length > 0 &&
            !rows.filter(".current-row, .match-row").length) {

            e.preventDefault();

            isSelectingItem = true;
            rows.first().trigger("mousedown");
            isSelectingItem = false;

            $("#RightPane_Item").removeClass("show");
            $("#RightPane_Item .search-results").hide();
            return;
        }

        HandleSearchKeyDown(
            e,
            this,
            "#RightPane_Item",
            ".search-results",
            "#ItemMessage",
            "#Header_JODNH_MS_Number"
        );
    });

    // mousedown -> (re)open the item pane and load/refresh the search.
    $(document).on("mousedown", ".JODNI_Item_Code", function (e) {
        OpenItemCodeSearch(this);
    });

    // Item_Code Escape (unscoped — pre-existing, left as-is; not part
    // of this pass's scope since it's a logic concern, not a
    // relocation concern).
    $(document).on("keydown", function (e) {
        if (e.key === "Escape") {
            let input = $(".JODNI_Item_Code");
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

    //#region Item_Code – Focus Out
    $(document).on("focusout", ".JODNI_Item_Code", function () {

        if (isSelectingItem)
            return;

        let input = $(this);
        let rows = $("#RightPane_Item .search-results tbody tr");

        if ($.trim(input.val()) === "" && rows.length > 0 &&
            !rows.filter(".current-row, .match-row").length) {

            isSelectingItem = true;
            rows.first().trigger("mousedown");
            isSelectingItem = false;

            $("#RightPane_Item").removeClass("show");
            $("#RightPane_Item .search-results").hide();
            return;
        }

        HandleSearchSelection(
            input,
            rows,
            "#ItemMessage",
            "#RightPane_Item",
            "#RightPane_Item .search-results"
        );
    });
    //#endregion

});

//#region address width
const DeliveryNoteAddressFields = [
    { cls: ".JODNA_ADTP_Number", min: 10, max: 25, align: "left", extraPadding: 20 },
    { cls: ".JODNA_Address_ID", min: 10, max: 25, align: "left", extraPadding: 20 },
    { cls: ".JODNA_Address", min: 40, max: 40, align: "left" },
    { cls: ".JODNA_City", min: 10, max: 25, align: "left" },
    { cls: ".JODNA_State", min: 10, max: 25, align: "left" },
    { cls: ".JODNA_Country", min: 10, max: 25, align: "left" },
    { cls: ".JODNA_PIN", min: 10, max: 10, align: "left" },
    { cls: ".JODNA_GSTIN", min: 15, max: 15, align: "left" }
];
//#endregion
const FREIGHT_PRS_NUMBER = 40008;
const ItemTableFields = [
    { cls: ".JODNI_JPRS_Number", min: 10, max: 25, align: "left" },    // Process
    { cls: ".JODNI_Item_Code", min: 10, max: 15, align: "left" },    // Item Code
    { cls: ".JODNI_Item_Code", min: 10, max: 15, align: "left" },    // Item Code
    { cls: ".JODNI_Item_Description", min: 40, max: 40, align: "left" },    // Description
    { cls: ".JODNI_OuterDia", min: 8, max: 8, align: "center" },  // Outer Dia
    { cls: ".JODNI_Thickness", min: 8, max: 8, align: "center" },  // Thickness
    { cls: ".JODNI_Length", min: 8, max: 8, align: "center" },  // Length
    { cls: ".JODNI_Width", min: 8, max: 8, align: "center" },  // Width
    { cls: ".JODNI_MaterialGrade", min: 10, max: 25, align: "left" },    // Material Grade
    { cls: ".JODNI_ItemGroup", min: 10, max: 30, align: "left" },    // Item Group
    { cls: ".JODNI_WH_Number", min: 10, max: 25, align: "left" },    // Warehouse
    { cls: ".JODNI_UoM_Number", min: 10, max: 15, align: "center" },  // UoM
    { cls: ".JODNI_Qty", min: 10, max: 20, align: "center" },  // Qty
    { cls: ".JODNI_UnitPrice", min: 10, max: 20, align: "right" },   // Unit Price
    { cls: ".JODNI_Amount", min: 13, max: 25, align: "right" },   // Amount

    // Freight columns
    { cls: ".JODNI_FromWH_Number", min: 10, max: 25, align: "left" },
    { cls: ".JODNI_ToWH_Number", min: 10, max: 25, align: "left" },
    { cls: ".JODNI_JOFRT_SVOH_Number", min: 10, max: 25, align: "left" }



];
let isMouseSelectingBuyer = false;

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
        totalWidth += maxWidth + 23;
    });

    return totalWidth;
}


function ApplyOtherBatchFieldWidths(container = "#DeliveryNoteOtherBatchList") {

    const fields = [
        { cls: ".JODNI_BCH_WH_Name", min: 15, max: 30, align: "left" },
        { cls: ".JODNI_BCH_BatchDate", min: 12, max: 12, align: "center" },
        { cls: ".JODNI_BCH_BatchNo", min: 20, max: 35, align: "left" },
        { cls: ".JODNI_BCH_AvailableQty", min: 11, max: 20, align: "center" },
        { cls: ".JODNI_BCH_BatchUnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".JODNI_BCH_BatchValue", min: 13, max: 25, align: "right" }
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
            f.cls === ".JODNI_BCH_BatchUnitPrice" ||
            f.cls === ".JODNI_BCH_BatchValue"
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
        { cls: ".JODNI_JPRS_Number", align: "left" },
        { cls: ".JODNI_Item_Code", align: "left" },
        { cls: ".JODNI_Item_Description", align: "left" },

        { cls: ".JODNI_OuterDia", align: "center" },
        { cls: ".JODNI_Thickness", align: "center" },
        { cls: ".JODNI_Length", align: "center" },
        { cls: ".JODNI_Width", align: "center" },

        { cls: ".JODNI_MaterialGrade", align: "left" },
        { cls: ".JODNI_ItemGroup", align: "left" },
        { cls: ".JODNI_WH_Number", align: "left" },

        { cls: ".JODNI_UoM_Number", align: "center" },

        { cls: ".JODNI_Qty", align: "center" },
        { cls: ".JODNI_UnitPrice", align: "right" },
        { cls: ".JODNI_Amount", align: "right" },

        { cls: ".JODNI_FromWH_Number", align: "left" },
        { cls: ".JODNI_ToWH_Number", align: "left" },

        { cls: ".JODNI_JOFRT_SVOH_Number", align: "left" }
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
    fitInputWidth("Header_JODNH_DN_No", 20, 25);
    fitInputWidth("Header_JODNH_MS_Number", 20, 30);
    fitInputWidth("Header_JODNH_JW_Vendor_Name", 40, 50);
    fitInputWidth("Header_JODNH_Currency_Number", 10, 10);
    fitInputWidth("Header_JODNH_WH_Number", 20, 25);
    fitInputWidth("Header_JODNH_PaymentTerms", 30, 40);
    fitInputWidth("Header_JODNH_DeliveryTerms", 30, 40);
    fitInputWidth("Header_JODNH_DeliveryMode", 30, 40);
    fitInputWidth("Header_JODNH_DespatchDocumentNo", 30, 40);
    fitInputWidth("Header_JODNH_DespatchedThrough", 30, 40);
    fitInputWidth("Header_JODNH_Remarks", 40, 40);
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

function ResizeAddressColumns() {
    ApplyFieldWidths({
        fields: DeliveryNoteAddressFields,
        container: "#AddressTable",
        tempRow: "#AddTempRow",
        tableBody: "#AddTableBody"
    });
}
function OpenItemCodeSearch(inputElement) {

    if ($.trim($("#Header_JODNH_MS_Number").val()) === "" || $("#Header_JODNH_MS_Number").val() === "0") {
        $("#Header_JODNH_MS_Number").prop("selectedIndex", 1);
    }

    $("#RightPane").hide();
    $("#RightPane").removeClass("show");
    $("#RightPane .buyer-search-results").hide();

    $("#RightPane_Item").show();
    $("#RightPane_Item").addClass("show");
    $("#RightPane_Item .search-results").show();

    searchItemJIDNI(inputElement);
}
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

    $(document).on("change", "#Header_JODNH_JW_Vendor_Number", function () {

        $("#ItemTable tbody tr.NewRow").each(function () {

            let row = $(this);

            if (row.find(".JODNI_IsFreightApplicable").is(":checked")) {
                row.find(".JODNI_UoM_Number").trigger("change");
            }
        });
    });

    // NEW: Qty to Kg conversion (same pattern as Receipt Note)
    $(document).on("input", ".JODNI_Qty", function () {
        let row = $(this).closest("tr");
        CalculateQtyKgDN(row);
    });

    $(document).on("change", ".JODNI_UoM_Number", function () {
        let row = $(this).closest("tr");
        let itemNumber = row.find(".JODNI_Item_Number").val();
        let fromUnit = $(this).val();

        if (!itemNumber || !fromUnit) return;

        $.ajax({
            url: '/receiptnote/transactions/receiptnote/get-item-unit-conversion',
            type: 'GET',
            data: { itemNumber: itemNumber, fromUnit: fromUnit },
            success: function (res) {
                row.find(".FromQty").val(res.fromQty);
                row.find(".ToQty").val(res.toQty);
                CalculateQtyKgDN(row);
            }
        });
    });

    // NEW: Header Freight Applicable toggle (show/hide item-grid freight columns)
    function ToggleFreightColumns_DN() {
        let isFreight = $("#Header_Freight_Applicable").is(":checked");

        let freightCols = ".FreightApplicableHeader, .FreightApplicableCell, .FreightApplicableFooterCell, " +
            ".FromWHHeader, .FromWHCell, .FromWHFooterCell, " +
            ".ToWHHeader, .ToWHCell, .ToWHFooterCell, " +
            ".FreightSOHeader, .FreightSOCell, .FreightSOFooterCell";

        if (isFreight) {
            $(freightCols).show();
        } else {
            $(freightCols).hide();
        }
    }

    $(document).on("change", "#Header_Freight_Applicable", function () {
        ToggleFreightColumns_DN();
    });

    ToggleFreightColumns_DN();

    //#region Header_JODNH_JW_Vendor_Name
    // JW_Customer – Focus Out: moved to <script> block
    // JW_Customer – Keydown: moved to <script> block
    //#endregion
    //#region item code right pane search JODNI_Item_Code
    // Item_Code – Keydown (incl. Escape): moved to <script> block
    // Item_Code – Mousedown: moved to <script> block
    // Item_Code – Focus Out: moved to <script> block
    //#endregion
    //#endregion
    $(document).on("mousedown", ".search-results tbody tr", function () {

        let rows = $(".search-results tbody tr");

        // Remove previous current row
        rows.removeClass("current-row");

        // Make clicked row the current row
        $(this).addClass("current-row");
    });
    //#region address width
    // Textboxes
    $(document).on("input", "#AddressTable input", function () {
        ResizeAddressColumns();
    });

    // Dropdowns
    $(document).on("change", "#AddressTable select", function () {
        ResizeAddressColumns();
    });

    // Optional: when a readonly field gets focus after being populated
    $(document).on("focusin",
        "#BuyerAddress .JODNA_Address, " +
        "#BuyerAddress .JODNA_City, " +
        "#BuyerAddress .JODNA_State, " +
        "#BuyerAddress .JODNA_Country, " +
        "#BuyerAddress .JODNA_PIN, " +
        "#BuyerAddress .JODNA_GSTIN",
        function () {
            ResizeAddressColumns();
        });
    //#endregion
    //#region batch grid alignment
    $(document).on("input change blur", "#DeliveryNoteBatchList input, #DeliveryNoteBatchList textarea, #DeliveryNoteBatchList select", function () {
        ApplyBatchFieldWidths("#DeliveryNoteBatchList");
    });

    $(window).on("load", function () {
        setTimeout(function () {

            ApplyBatchFieldWidths("#DeliveryNoteBatchList");


        }, 200);
    });


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
        "#Header_JODNH_DN_No, #Header_JODNH_MS_Number, #Header_JODNH_JW_Vendor_Name, #Header_JODNH_Currency_Number, #Header_JODNH_WH_Number, #Header_JODNH_PaymentTerms, #Header_JODNH_DeliveryTerms, #Header_JODNH_DeliveryMode, #Header_JODNH_DespatchDocumentNo, #Header_JODNH_DespatchedThrough, #Header_JODNH_Remarks",
        function () {

            const widths = {
                Header_JODNH_DN_No: [20, 25],
                Header_JODNH_MS_Number: [20, 30],
                Header_JODNH_JW_Vendor_Name: [40, 50],
                Header_JODNH_Currency_Number: [10, 10],
                Header_JODNH_WH_Number: [20, 25],
                Header_JODNH_PaymentTerms: [30, 40],
                Header_JODNH_DeliveryTerms: [30, 40],
                Header_JODNH_DeliveryMode: [30, 40],
                Header_JODNH_DespatchDocumentNo: [30, 40],
                Header_JODNH_DespatchedThrough: [30, 40],
                Header_JODNH_Remarks: [40, 40]
            };

            const [min, max] = widths[this.id];
            fitInputWidth(this, min, max);
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
        $(".datepicker").not("#IBatTempRow .datepicker").flatpickr({
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
    $(document).on("keyup change", ".JODNI_Qty, .JODNI_UnitPrice", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat((row.find(".JODNI_Qty").val() || "0").replace(/,/g, "")) || 0;
        let price = parseFloat((row.find(".JODNI_UnitPrice").val() || "0").replace(/,/g, "")) || 0;

        let amount = qty * price;

        // Only set row amount (read-only field)
        row.find(".JODNI_Amount").val(formatIndianCurrency(amount));

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

        let qty = parseFloat(removeComma(currentRow.find(".JODNI_Qty").val())) || 0;
        let price = parseFloat(removeComma(currentRow.find(".JODNI_UnitPrice").val())) || 0;

        let itemCode = currentRow.find(".JODNI_Item_Code").val();
        let prsNo = currentRow.find(".JODNI_JPRS_Number").val();

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
            if (el.hasClass("JODNI_IsDeleted")) return;

            if (el.hasClass("JODNI_Item_Code")) {
                if (!el.val()) {
                    isValid = false;
                    el.focus();
                    return false;
                }
            }

            if (el.hasClass("JODNI_Qty")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) {
                    isValid = false;
                    el.focus();
                    return false;
                }
            }

            if (el.hasClass("JODNI_UnitPrice")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) {
                    isValid = false;
                    el.focus();
                    return false;
                }
            }

            if (el.hasClass("JODNI_JPRS_Number")) {

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
            if (!el.hasClass("JODNI_IsDeleted")) {
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

        return $("#AddTableBody tr.NewRow").filter(function () {
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

        row.find(".JODNA_IsDeleted").val("1");
        row.hide();
    });
    //#endregion CLICK ADDRESS BUTTON



    //#region CHANGE ADDRESS TYPE
    function isDuplicateAddress(type, currentRow) {
        var isDuplicate = false;
        $('tr.NewRow').not(currentRow).each(function () {
            var rowType = $(this).find('select.JODNA_ADTP_Number').val();
            var isDeleted = parseInt($(this).find("input.JODNA_IsDeleted").val());
            if (isDeleted !== 1) {
                if (rowType === type) {
                    isDuplicate = true;
                    return false; // break loop
                }
            }
        });
        return isDuplicate;
    }

    $(document).on('change', 'tr.NewRow select.JODNA_ADTP_Number', function () {

        var currentRow = $(this).closest('tr.NewRow');

        var ADTPNumber = currentRow.find('.JODNA_ADTP_Number').val();
        var Buyer = $('#Header_JODNH_JW_Vendor_Number').val();

        var ADDAddress = currentRow.find('.JODNA_Address');
        var ADDCity = currentRow.find('.JODNA_City');
        var ADDState = currentRow.find('.JODNA_State');
        var ADDCountry = currentRow.find('.JODNA_Country');
        var ADDPin = currentRow.find('.JODNA_PIN');
        var ADDGSTIN = currentRow.find('.JODNA_GSTIN');
        var ADDAddress_ID = currentRow.find('.JODNA_Address_ID');
        if (ADTPNumber && isDuplicateAddress(ADTPNumber, currentRow)) {
            alert('This Address Type already exists!');
            $(this).val('');
            $(this).focus();
            return;
        }

        $.ajax({
            type: "GET",
            url: "/joboutward/transactions/delivery-note/vendor-address",
            data: { Vendor: Buyer, ADTPNumber: ADTPNumber },
            error: function () {
                alert("Unable to load Address IDs. Please try again.");
            },
            dataType: "json",
            success: function (data) {
                var AddressID = data.addressIds || [];

                var AddressDefault = data.address;

                var $AddressDropdown = currentRow.find('.JODNA_Address_ID');

                $AddressDropdown.empty();

                $AddressDropdown.append($('<option>', {
                    value: '',
                    text: ''
                }));

                AddressID.forEach(function (item) {
                    if (!item.jwV_ADD_Address_ID) return;  
                    $AddressDropdown.append($('<option>', {
                        value: item.jwV_ADD_Address_ID,
                        text: item.jwV_ADD_Address_ID
                    }));
                });


                // set default + fill fields
                if (AddressDefault != null) {
                    $AddressDropdown.val(AddressDefault.jwV_ADD_AddressID);
                    // ADDAddress_ID.val(AddressDefault.jwV_ADD_AddressID);

                    ADDAddress.text(AddressDefault.jwV_ADD_Address);
                    ADDCity.val(AddressDefault.jwV_ADD_City);
                    ADDState.val(AddressDefault.jwV_ADD_State);
                    ADDCountry.val(AddressDefault.jwV_ADD_Country);
                    ADDPin.val(AddressDefault.jwV_ADD_Pin);
                    ADDGSTIN.val(AddressDefault.jwV_ADD_GSTIN);
                }
            }
        });
    });


    $(document).on('change', 'tr.NewRow select.JODNA_Address_ID', function () {
        var currentRow = $(this).closest('tr.NewRow');
        var ADTPNumber = currentRow.find('select.JODNA_ADTP_Number').val();
        var AddressID = currentRow.find('select.JODNA_Address_ID').val();
        var Buyer = $('#Header_JODNH_JW_Vendor_Number').val();

        var ADDAddress = currentRow.find('.JODNA_Address');
        var ADDCity = currentRow.find('.JODNA_City');
        var ADDState = currentRow.find('.JODNA_State');
        var ADDCountry = currentRow.find('.JODNA_Country');
        var ADDPin = currentRow.find('.JODNA_PIN');
        var ADDGSTIN = currentRow.find('.JODNA_GSTIN');

        $.ajax({
            type: "get",
            url: "/joboutward/transactions/delivery-note/vendor-address-id",
            data: { Vendor: Buyer, ADTPNumber: ADTPNumber, AddressID: AddressID },
            error: function () {
                alert("Unable to load Address details. Please try again.");
            },
            datatype: "json",
            traditional: true,
            success: function (data) {
                var addr = data && data.address;
                if (!addr) {
                    ADDAddress.text("");
                    ADDCity.val("");
                    ADDState.val("");
                    ADDCountry.val("");
                    ADDPin.val("");
                    ADDGSTIN.val("");
                    return;
                }
                ADDAddress.text(addr.jwV_ADD_Address || "");
                ADDCity.val(data.address.jwV_ADD_City);
                ADDState.val(data.address.jwV_ADD_State);
                ADDCountry.val(data.address.jwV_ADD_Country);
                ADDPin.val(data.address.jwV_ADD_Pin);
                ADDGSTIN.val(data.address.jwV_ADD_GSTIN);
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

                url: '/joboutward/transactions/delivery-note/save',

                type: 'POST',

                contentType: 'application/json',

                data: JSON.stringify(model),

                success: function (response) {

                    if (response.success) {
                        $('#ModelAlert').one('hidden.bs.modal', function () {
                            location.reload();
                        });
                        showAlert('Record Inserted');
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
                    !batch.JODNI_BCH_QtyInvoice ||
                    parseFloat((batch.JODNI_BCH_QtyInvoice || "0").toString().replace(/,/g, "")) <= 0
                ) {
                    return true;
                }

                //#region FORMAT DATE

                let formattedBatchDate = null;

                if (batch.JODNI_BCH_BatchDate) {

                    let date = new Date(batch.JODNI_BCH_BatchDate);

                    if (!isNaN(date.getTime())) {
                        formattedBatchDate = date.toISOString();
                    }
                }

                //#endregion

                let deliveryNoteBatch = {

                    JODNI_BCH_Number:
                        parseInt(batch.JODNI_BCH_Number) || 0,

                    JODNI_BCH_JODNH_Number:
                        parseInt(batch.JODNI_BCH_JODNH_Number) || 0,

                    JODNI_BCH_JODNI_Number:
                        parseInt(batch.JODNI_BCH_JODNI_Number) || 0,

                    JODNI_BCH_WH_Number:
                        parseInt(batch.JODNI_BCH_WH_Number) || 0,

                    JODNI_BCH_BatchDate:
                        formattedBatchDate,

                    JODNI_BCH_BatchNo:
                        batch.JODNI_BCH_BatchNo || "",

                    JODNI_BCH_BatchQty:
                        parseFloat((batch.JODNI_BCH_QtyInvoice || "0").toString().replace(/,/g, "")) || 0,

                    JODNI_BCH_BatchUnitPrice:
                        parseFloat((batch.JODNI_BCH_BatchUnitPrice || "0").toString().replace(/,/g, "")) || 0,

                    JODNI_BCH_BatchValue:
                        parseFloat((batch.JODNI_BCH_BatchValue || "0").toString().replace(/,/g, "")) || 0
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

            JODNH_Number:
                parseInt($("#Header_JODNH_Number").val()) || 0,

            JODNH_DN_No:
                $("#Header_JODNH_DN_No").val(),

            JODNH_DN_Date:
                new Date($("#Header_JODNH_DN_Date").val())
                    .toISOString(),

            JODNH_MS_Number:
                parseInt($("#Header_JODNH_MS_Number").val()) || 0,

            JODNH_JW_Vendor_Number:
                parseInt($("#Header_JODNH_JW_Vendor_Number").val()) || 0,

            JODNI_Item_Code:
                $("#Header_JODNI_Item_Code").val(),

            JODNH_JW_Vendor_Name:
                $("#Header_JODNH_JW_Vendor_Name").val(),

            JODNH_Currency_Number:
                parseInt($("#Header_JODNH_Currency_Number").val()) || 0,

            JODNH_WH_Number:
                parseInt($("#Header_JODNH_WH_Number").val()) || 0,

            JODNH_PaymentTerms:
                $("#Header_JODNH_PaymentTerms").val(),

            JODNH_DeliveryTerms:
                $("#Header_JODNH_DeliveryTerms").val(),

            JODNH_DeliveryMode:
                $("#Header_JODNH_DeliveryMode").val(),

            JODNH_DespatchDocumentNo:
                $("#Header_JODNH_DespatchDocumentNo").val(),

            JODNH_DespatchedThrough:
                $("#Header_JODNH_DespatchedThrough").val(),

            JODNH_Remarks:
                $("#Header_JODNH_Remarks").val(),

            JODNH_IsFreightApplicable:
                $("#Header_Freight_Applicable").is(":checked") ? "Yes" : "No",

            DN_Id:
                parseInt($("#Header_DN_Id").val()) || null,

            DN_JWV_Number:
                parseInt($("#Header_JODNH_JW_Vendor_Number").val()) || null,

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
            if (row.find(".JODNI_IsDeleted").val() == "true") {
                return;
            }

            // Skip empty rows
            if (!row.find(".JODNI_Item_Number").val()) {
                return;
            }

            let item = {
                JODNI_JODNH_Number:
                    parseInt(row.find(".JODNI_JODNH_Number").val()) || 0,

                JODNI_Number:
                    parseInt(row.find(".JODNI_Number").val()) || 0,

                JODNI_JPRS_Number:
                    parseInt(row.find(".JODNI_JPRS_Number").val()) || 0,

                JODNI_Item_Number:
                    parseInt(row.find(".JODNI_Item_Number").val()) || 0,

                JODNI_WH_Number:
                    parseInt(row.find(".JODNI_WH_Number").val()) || 0,

                JODNI_UoM_Number:
                    parseInt(row.find(".JODNI_UoM_Number").val()) || 0,

                JODNI_Qty:
                    parseFloat((row.find(".JODNI_Qty").val() || "0").replace(/,/g, "")) || 0,

                JODNI_Qty_Kgs:
                    parseFloat((row.find(".JODNI_Qty_Kgs").val() || "0").replace(/,/g, "")) || 0,

                JODNI_UnitPrice:
                    parseFloat((row.find(".JODNI_UnitPrice").val() || "0").replace(/,/g, "")) || 0,

                JODNI_Amount:
                    parseFloat((row.find(".JODNI_Amount").val() || "0").replace(/,/g, "")) || 0,

                JODNI_IsFreightApplicable:
                    row.find(".JODNI_IsFreightApplicable").is(":checked")
                        ? "Yes"
                        : "No",

                JODNI_JOFRT_SVOH_Number:
                    parseInt(row.find(".JODNI_JOFRT_SVOH_Number").val()) || 0,

                JODNI_FromWH_Number:
                    parseInt(row.find(".JODNI_FromWH_Number").val()) || null,

                JODNI_ToWH_Number:
                    parseInt(row.find(".JODNI_ToWH_Number").val()) || null,

                // Freight SO Item ID - needed by the freight qty check
                JODNI_JOFRT_SVOI_Number:
                    parseInt(row.find(".JODNI_JOFRT_SVOI_Number_Row").val()) || 0
            };
            items.push(item);

        });

        // =====================================
        // ADDRESS
        // =====================================
        var addresses = [];

        $("#AddTableBody tr.NewRow").each(function () {

            let row = $(this);

            // Skip deleted rows
            if (row.find(".JODNA_IsDeleted").val() == "1") {
                return;
            }

            // Skip empty rows
            if (!row.find(".JODNA_Address_ID").val()) {
                return;
            }

            let address = {

                JODNA_JODNH_Number:
                    parseInt(row.find(".JODNA_JODNH_Number").val()) || 0,

                JODNA_Number:
                    parseInt(row.find(".JODNA_Number").val()) || 0,

                JODNA_ADTP_Number:
                    parseInt(row.find(".JODNA_ADTP_Number").val()) || 0,

                JODNA_Address_ID:
                    row.find(".JODNA_Address_ID").val(),

                JODNA_Address:
                    row.find(".JODNA_Address").text(),

                JODNA_City:
                    row.find(".JODNA_City").val(),

                JODNA_State:
                    row.find(".JODNA_State").val(),

                JODNA_Country:
                    row.find(".JODNA_Country").val(),

                JODNA_PIN:
                    row.find(".JODNA_PIN").val(),

                JODNA_GSTIN:
                    row.find(".JODNA_GSTIN").val()
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
                ) + 1;





            $.ajax({

                url: '/joboutward/transactions/delivery-note/delete-temp-batch-row',

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
        ".JODNI_IsFreightApplicable, .JODNI_UoM_Number, .JODNI_FromWH_Number, .JODNI_ToWH_Number",
        function () {

            let row = $(this).closest("tr");

            if (row.find(".JODNI_IsFreightApplicable").is(":checked")) {

                BindFreightServiceOrder(
                    $("#Header_JODNH_JW_Vendor_Number").val(),
                    row.find(".JODNI_UoM_Number").val(),
                    row.find(".JODNI_FromWH_Number").val(),
                    row.find(".JODNI_ToWH_Number").val()
                );

            } else {
                row.find(".JODNI_JOFRT_SVOH_Number").html('<option value="0"></option>');
            }
        }
    );

});

//#region GetDeliveryNoteNumber
$(document).on("change", "#Header_JODNH_DN_Date", function () {
    GetDeliveryNoteNumber();
});

function GetDeliveryNoteNumber() {

    let date = $("#Header_JODNH_DN_Date").val();

    if (!date)
        return;

    let d = new Date(date);

    let poDate =
        d.getFullYear().toString() +
        String(d.getMonth() + 1).padStart(2, '0') +
        String(d.getDate()).padStart(2, '0');

    $.ajax({
        url: "/joboutward/transactions/delivery-note/next-dn-number",
        type: "GET",
        data: { DNDate: date },
        success: function (response) {
            if (!response || response.trim() === "") {
                $("#Header_JODNH_DN_No").val("");
                alert("Please set numbering for this date range.");
            
              

                return;
            }

            $("#Header_JODNH_DN_No").val(response);

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

    var fp = document.getElementById("Header_JODNH_DN_Date")._flatpickr;
    if (fp) fp.setDate(formattedDate, true, "d-M-Y");
    GetDeliveryNoteNumber();
}

//#region delete grid
function DeleteItemRowTempTable(inputElement) {
    let ItemGridindex =
        $(inputElement)
            .closest("tr")
            .index("#ItemTable tbody tr.NewRow:visible") + 1;
    $.ajax({

        url: '/joboutward/transactions/delivery-note/temp-batch-delete-change-item',

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
    $row.addClass("NewRow");
    $row.show();

    // 1. Address Type
    $row.find(".JODNA_ADTP_Number")
        .val("")
        .attr("name", `Addresses[${i}].JODNA_ADTP_Number`);

    // 2. Address ID
    $row.find(".JODNA_Address_ID")
        .val("")
        .attr("name", `Addresses[${i}].JODNA_Address_ID`);

    // 3. Address
    $row.find(".JODNA_Address")
        .text("")
        .attr("name", `Addresses[${i}].JODNA_Address`);

    // 4. City
    $row.find(".JODNA_City")
        .val("")
        .attr("name", `Addresses[${i}].JODNA_City`);

    // 5. State
    $row.find(".JODNA_State")
        .val("")
        .attr("name", `Addresses[${i}].JODNA_State`);

    // 6. Country
    $row.find(".JODNA_Country")
        .val("")
        .attr("name", `Addresses[${i}].JODNA_Country`);

    // 7. PIN
    $row.find(".JODNA_PIN")
        .val("")
        .attr("name", `Addresses[${i}].JODNA_PIN`);

    // 8. GSTIN
    $row.find(".JODNA_GSTIN")
        .val("")
        .attr("name", `Addresses[${i}].JODNA_GSTIN`);

    // 9. Delete flag
    $row.find(".JODNA_IsDeleted")
        .val("0")
        .attr("name", `Addresses[${i}].JODNA_IsDeleted`);

    $("#AddTableBody").append($row);

    addressIndex++;
}

function validateAddressGrid() {

    let hasRow = false;
    let valid = true;

    $("#AddTableBody tr.NewRow").each(function () {

        let row = $(this);

        if (row.find(".JODNA_IsDeleted").val() === "1") return;

        let type = row.find(".JODNA_ADTP_Number").val();
        let addr = row.find(".JODNA_Address_ID").val();

        if (type && addr) {
            hasRow = true;
        }

        if (type && !addr) {
            showAlert('Address ID required');
            row.find(".JODNA_Address_ID").focus();
            valid = false;
            return false;
        }

        if (!type && addr) {
            showAlert('Address Type required');
            row.find(".JODNA_ADTP_Number").focus();
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

    $("#AddTableBody tr.NewRow:visible").each(function () {

        let row = $(this);
        console.log('JODNA_ADTP_Number:' + row.find(".JODNA_ADTP_Number").val())
        if (!row.find(".JODNA_ADTP_Number").val()) {
            showAlert('Address Type is required');
            isValid = false;
            return false; // break each
        }

        if (!row.find(".JODNA_Address_ID").val()) {
            showAlert('Address ID is required');
            isValid = false;
            return false;
        }
    });

    return isValid;
}


//#endregion


//#region customer Search Functions
//#region JW Vendor Search Functions

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

let buyerSearchXHR = null;

function SearchBuyer(inputElement) {

    var JWCustomer = inputElement.value;
    var SIHDate = $("input[name='Header.JODNH_DN_Date']").val();
    var resultsDiv = $("#RightPane").find(".buyer-search-results");

    if (buyerSearchXHR) {
        buyerSearchXHR.abort();
    }

    buyerSearchXHR = $.ajax({
        url: '/joboutward/transactions/delivery-note/vendor',
        type: 'GET',
        data: {
            Vendor: JWCustomer,
            DNDate: SIHDate
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
                    '<th>JW Vendor Name</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody></tbody>' +
                    '</table>' +
                    '</div>'
                );

                $.each(data, function (i, cust) {

                    var row = $("<tr></tr>").css("height", "24px");
                    row.data("customer", cust);
                    row.append("<td>" + cust.jwV_JW_VendorName + "</td>");


                    table.find("tbody").append(row);

                    // Removed: duplicate row "click" handler (raced with
                    // the "mousedown" handler below; extra field
                    // population merged into it).
                });

                table.find("tbody").on("mousedown", "tr", function (e) {

                    e.preventDefault();

                    const clickedCust = $(this).data("customer");
                    isMouseSelectingBuyer = true;

                    $(inputElement).val(clickedCust.jwV_JW_VendorName);

                    $("#Header_JODNH_JW_Vendor_Number")
                        .val(clickedCust.jwV_Number)
                        .trigger("change");

                    $("#Header_JODNH_Currency_Number")
                        .val(clickedCust.jwV_Currency_Number)
                        .trigger("change");

                    $("#Header_JODNH_WH_Number")
                        .val(clickedCust.jwV_WH_Number)
                        .trigger("change");

                    // vendor changed -> old address rows no longer valid
                    $("#AddTableBody tr.NewRow").find(".JODNA_IsDeleted").val("1");
                    $("#AddTableBody tr.NewRow").hide();

                    $("#RightPane").removeClass("show");
                    $("#RightPane .buyer-search-results").hide();

                    setTimeout(function () {
                        isMouseSelectingBuyer = false;
                    }, 100);
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
                resultsDiv.append(GetBuyerEmptyView());
                $("#RightPane").addClass("show");
                $("#RightPane .buyer-search-results").show();

            }
        },
        error: function (xhr, status) {

            if (status === "abort") {
                return;
            }
            resultsDiv.text("Error loading data.").show();
        }
    });
}

// Hide search when clicking outside

//#endregion customer Search Functions

// Hide search when clicking outside

//#endregion customer Search Functions

// No's Service Order dropdown
$(document).on("change", ".JODNI_JOFRT_SVOH_Number", function () {

    let row = $(this).closest("tr");
    let freightSO = $(this).val();

    // NEW: capture SO item id for JODNI_JOFRT_SVOI_Number (needed for the
    // qty-exceeded calc, same as GetOtherRowsQtyForSO/DB linkage)
    let selectedSvoi = $(this).find("option:selected").attr("data-svoi") || 0;
    row.find(".JODNI_JOFRT_SVOI_Number_Row").val(selectedSvoi);

    if (!freightSO || freightSO === "0") return;

    let uomNumber = row.find(".JODNI_UoM_Number").val();
    let fromWHNumber = row.find(".JODNI_FromWH_Number").val();
    let toWHNumber = row.find(".JODNI_ToWH_Number").val();
    let originalQty = parseFloat(removeComma(row.find(".JODNI_Qty").val())) || 0;

    $.get("/joboutward/transactions/delivery-note/check-delivered-qty-exceeded-freight", {
        svohNumber: freightSO,
        uomNumber,
        fromWHNumber,
        toWHNumber
    }, function (res) {

        if (!res || res.length === 0) return;

        let deliveredQty = parseFloat(res[0].deliveredQty) || 0;
        let svoiQty = parseFloat(res[0].svoiQty) || 0;

        // FORMULA: RealDeliveredQty = DB_DeliveredQty + OtherRowsQty(Freight SO)
        let otherRowsQty = GetOtherRowsQtyForSO(freightSO, row);
        let realDeliveredQty = deliveredQty + otherRowsQty;

        // FORMULA: IsExceeded  <=>  (RealDeliveredQty + CurrentQty) > SVO_Qty
        if ((realDeliveredQty + originalQty) > svoiQty) {

            // FORMULA: AllowedQty = SVO_Qty − RealDeliveredQty
            alert("Freight Qty Allowed: " + (svoiQty - realDeliveredQty));
            setTimeout(function () {
                row.find(".JODNI_Qty")
                    .focus()
                    .select();
                row.find(".JODNI_JOFRT_SVOH_Number").val("0");
            }, 300);
        }
    });
});
//#region Delivered Qty Validation

// FORMULA: Freight check on Qty focusout -> alert + clear freight SO + focus Qty
$(document).on("focusout", ".JODNI_Qty", function () {

    let row = $(this).closest("tr");
    let originalQty = parseFloat(removeComma(row.find(".JODNI_Qty").val())) || 0;
    let freightSO = row.find(".JODNI_JOFRT_SVOH_Number").val();

    if (!freightSO || freightSO === "0") return;

    let uomNumber = row.find(".JODNI_UoM_Number").val();
    let fromWHNumber = row.find(".JODNI_FromWH_Number").val();
    let toWHNumber = row.find(".JODNI_ToWH_Number").val();

    $.get("/joboutward/transactions/delivery-note/check-delivered-qty-exceeded-freight", {
        svohNumber: freightSO,
        uomNumber,
        fromWHNumber,
        toWHNumber
    }, function (res) {
        if (!res || res.length === 0) return;

        let deliveredQty = parseFloat(res[0].deliveredQty) || 0;
        let svoiQty = parseFloat(res[0].svoiQty) || 0;

        // FORMULA: RealDeliveredQty = DB_DeliveredQty + OtherRowsQty(Freight SO)
        let otherRowsQty = GetOtherRowsQtyForSO(freightSO, row);
        let realDeliveredQty = deliveredQty + otherRowsQty;

        // FORMULA: IsExceeded <=> (RealDeliveredQty + CurrentQty) > SVO_Qty
        if ((realDeliveredQty + originalQty) > svoiQty) {
            row.find(".JODNI_JOFRT_SVOH_Number").val("0");
            // FORMULA: AllowedQty = SVO_Qty - RealDeliveredQty
            alert("Freight Qty Allowed: " + (svoiQty - realDeliveredQty));
            setTimeout(function () {
                row.find(".JODNI_Qty").focus().select();
            }, 300);
        }
    });
});

//#endregion
// FORMULA: OtherRowsQty(SO) = Σ JODNI_Qty  for all rows where RowSO = SO, RowSO ≠ CurrentRow
function GetOtherRowsQtyForSO(svohNumber, currentRow) {
    let total = 0;

    $("#ItemTable tbody tr.NewRow").each(function () {
        let row = $(this);

        if (row.is(currentRow)) return;
        if (row.find(".JODNI_IsDeleted").val() === "1" ||
            row.find(".JODNI_IsDeleted").val() === "true") return;

        // CHANGED: also check the Freight SO field — a row's qty could
        // be booked against a Service Order via either dropdown.
        let rowFreightSO = row.find(".JODNI_JOFRT_SVOH_Number").val() || 0;

        if (rowFreightSO == svohNumber) {
            total += parseFloat(removeComma(row.find(".JODNI_Qty").val())) || 0;
        }
    });

    return total;
}
function BindFreightServiceOrder(customerId, uomNumber = null, fromWHNumber = null, toWHNumber = null) {
    $(".JODNI_JOFRT_SVOH_Number").html('<option value="0"></option>');
    if (!customerId) return;

    $.get("/joboutward/transactions/delivery-note/get-freight-service-order",
        { vendorId: customerId, uomNumber, fromWHNumber, toWHNumber },
        data => $.each(data, (_, item) => {
            // NEW: skip entries with no real value/text — server

            if (!item.value || item.value === "" || item.value === "0") return;

            $(".JODNI_JOFRT_SVOH_Number").append(
                `<option value="${item.value}" data-svoi="${item.svoiNumber || 0}">${item.text}</option>`
            )
        })
    );
}

//#region Calculate Total
function CalculateQtyKgDN(row) {
    let qty = parseFloat((row.find(".JODNI_Qty").val() || "0").replace(/,/g, "")) || 0;
    let uomText = row.find(".JODNI_UoM_Number option:selected").text().trim().toUpperCase();

    let qtyKg;
    if (uomText === "KGS") {
        qtyKg = qty * 1;
    } else {
        let fromQty = parseFloat(row.find(".FromQty").val()) || 0;
        let toQty = parseFloat(row.find(".ToQty").val()) || 0;
        qtyKg = fromQty > 0 ? (qty * (toQty / fromQty)) : 0;
    }

    row.find(".JODNI_Qty_Kgs").val(qtyKg === 0 ? "" : addComma(qtyKg, "c"));
    calculateTotal();
}

function calculateTotal() {

    let totalQty = 0;
    let totalAmount = 0;
    let totalQtyKgs = 0;

    // Loop through each row (only active rows)
    $("#ItemTable tbody tr.NewRow").each(function () {

        let row = $(this);

        // Skip deleted rows
        if (row.find(".JODNI_IsDeleted").val() === "1" ||
            row.find(".JODNI_IsDeleted").val() === "true") {
            return;
        }

        // Get Qty
        let qty = parseFloat(removeComma(row.find(".JODNI_Qty").val())) || 0;

        // Get Unit Price
        let unitPrice = parseFloat(removeComma(row.find(".JODNI_UnitPrice").val())) || 0;

        // Row Amount = Qty × Unit Price
        let amount = qty * unitPrice;

        // Set row amount field
        row.find(".JODNI_Amount").val(addComma(amount, "c"));

        // Add to totals
        totalQty += qty;
        totalAmount += amount;
        totalQtyKgs += parseFloat(removeComma(row.find(".JODNI_Qty_Kgs").val())) || 0;
    });

    // Footer totals
    $("#TotalQty").val(addComma(totalQty, "q"));
    $("#TotalAmount").val(addComma(totalAmount, "c"));
    $("#TotalQtyKgs").val(addComma(totalQtyKgs, "c"));
}


//#endregion Calculate Total

//#region item grid fetch item details
function OnInputItem(inputElement) {
    searchItemJIDNI(inputElement);
}

function OnFocusItem(inputElement) {

    let resultsDiv = $("#RightPane_Item").find(".search-results");
    let messageVisible = $("#ItemMessage").is(":visible") ||
        $("#ItemEmptyView").is(":visible");
    let alreadyOpen = $("#RightPane_Item").hasClass("show") &&
        (resultsDiv.find("tbody tr").length > 0 || messageVisible);

    if (alreadyOpen) {
        return;
    }

    $(inputElement).data("oldItemCode", $(inputElement).val());
    $(inputElement).data("oldItemNumber",
        $(inputElement).closest("tr").find(".JODNI_Item_Number").val());

    OpenItemCodeSearch(inputElement);
}

function searchItemJIDNI(inputElement) {

    let itemCode = inputElement.value;
    let row = $(inputElement).closest("tr");
    let resultsDiv = $("#RightPane_Item").find(".search-results");


    let material = $("#Header_JODNH_MS_Number").val();


    if (!material) return;

    if (itemSearchXHR) {
        itemSearchXHR.abort();
    }

    itemSearchXHR = $.ajax({
        url: '/joboutward/transactions/delivery-note/item',
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
                    // Changed from "click" to "mousedown" so that the
                    // common HandleSearchSelection's rows.trigger("mousedown")
                    // (used for Tab/Enter auto-select and "Too many
                    // choices") actually fires row selection here.
                    tr.on("mousedown", function (e) {

                        e.preventDefault();

                        isSelectingItem = true;

                        $("#ItemMessage").hide().text("");
                        // ✔ Visible field
                        row.find(".JODNI_Item_Code").val(item.itemCode);

                        // ✔ Hidden fields
                        row.find(".JODNI_Item_Number").val(item.itemNumber);
                        row.find(".JODNI_Number").val(item.itemNumber);

                        // ✔ Fill details
                        row.find(".JODNI_Item_Description").val(item.itemDescription);
                        row.find(".JODNI_OuterDia").val(item.outerDia);
                        row.find(".JODNI_Thickness").val(item.thickness);
                        row.find(".JODNI_Length").val(item.length);
                        row.find(".JODNI_Width").val(item.width);
                        row.find(".JODNI_MaterialGrade").val(item.materialGrade);
                        row.find(".JODNI_ItemGroup").val(item.itemGroup);

                        // ✔ Dropdowns
                        row.find(".JODNI_UoM_Number").val(item.uoM);
                        row.find(".JODNI_WH_Number").val(item.saleWarehouse);
                        row.find(".JODNI_UoM_Number").trigger("change");
                        // ✔ Move to Qty
                        let qtyInput = row.find(".JODNI_Qty");
                        let qtyUnitprice = row.find(".JODNI_UnitPrice");
                        qtyInput.focus();

                        setTimeout(function () {
                            qtyInput.select();
                            DeleteItemRowTempTable(inputElement);
                            isSelectingItem = false;
                        }, 100);

                        // ✔ Decimal format (if needed)
                        let decimalPlaces = item.decimalPlaces || 2;

                        qtyInput.val(formatIndianQty(removeComma(qtyInput.val())));
                        qtyUnitprice.val(formatIndianCurrency(removeComma(qtyUnitprice.val())));

                         
                        // on screen when tabbing/entering into the next line.
                        resultsDiv.empty();
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
                resultsDiv.append(GetItemEmptyView());

                $("#RightPane_Item").addClass("show");
                $("#RightPane_Item .search-results").show();
            }
        },
        error: function (xhr, status) {

            if (status === "abort") {
                return;
            }
            resultsDiv.text("Error loading data.");
            resultsDiv.show();
        }
    });
}

//#endregion item grid fetch item details

//#endregion item grid fetch item details



//#region COMMON FUNCTIONS

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
    if ($("#Header_JODNH_DN_No").val().trim() === "") {
        showAlert('Delivery Note No. is required', '#Header_JODNH_DN_No');

        return false;
    }

    // 2. DN Date
    if ($("#Header_JODNH_DN_Date").val().trim() === "") {
        showAlert('DN Date is required', '#Header_JODNH_DN_Date');

        return false;
    }

    // 3. Material Segregation
    if ($("#Header_JODNH_MS_Number").val() === "" || $("#Header_JODNH_MS_Number").val() === "0") {
        showAlert('Material Segregation is required', '#Header_JODNH_MS_Number');

        return false;
    }

    // 4. JW Vendor
    if ($("#Header_JODNH_JW_Vendor_Number").val().trim() === "" ||
        $("#Header_JODNH_JW_Vendor_Name").val().trim() === "") {

        showAlert('JW Vendor is required', '#Header_JODNH_JW_Vendor_Name');

        return false;
    }

    // 5. Currency
    if ($("#Header_JODNH_Currency_Number").val() === "" || $("#Header_JODNH_Currency_Number").val() === "0") {
        showAlert('Currency is required', '#Header_JODNH_Currency_Number');

        return false;
    }

    // 6. Warehouse
    if ($("#Header_JODNH_WH_Number").val() === "" || $("#Header_JODNH_WH_Number").val() === "0") {
        showAlert('Warehouse is required', '#Header_JODNH_WH_Number');

        return false;
    }

    //// 7. Payment Terms
    //if ($("#Header_JODNH_PaymentTerms").val().trim() === "") {
    //    showAlert('Payment Terms is required','#Header_JODNH_PaymentTerms');

    //    return false;
    //}

    //// 8. Delivery Terms
    //if ($("#Header_JODNH_DeliveryTerms").val().trim() === "") {
    //    showAlert('Delivery Terms is required','#Header_JODNH_DeliveryTerms');

    //    return false;
    //}

    //// 9. Delivery Mode
    //if ($("#Header_JODNH_DeliveryMode").val().trim() === "") {
    //    showAlert('Delivery Mode is required','#Header_JODNH_DeliveryMode');

    //    return false;
    //}

    //// 10. Despatch Document No
    //if ($("#Header_JODNH_DespatchDocumentNo").val().trim() === "") {
    //    showAlert('Despatch Document No is required','#Header_JODNH_DespatchDocumentNo');

    //    return false;
    //}

    //// 11. Despatched Through
    //if ($("#Header_JODNH_DespatchedThrough").val().trim() === "") {
    //    showAlert('Despatched Through is required','#Header_JODNH_DespatchedThrough');

    //    return false;
    //}

    //// 12. Remarks
    //if ($("#Header_JODNH_Remarks").val().trim() === "") {
    //    showAlert('Remarks is required','#Header_JODNH_Remarks');

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

    let hasFreightRow = false;

    let hasValidRow = false;

    let isValid = true;

    $("#ItemTable tbody tr").each(function () {

        let row = $(this);

        // skip template row
        if (row.hasClass("TempRow")) return;

        // skip deleted row
        if (row.find(".JODNI_IsDeleted").val() === "1") return;

        let process = row.find(".JODNI_JPRS_Number").val();
        let itemCode = row.find(".JODNI_Item_Code").val();
        let qty = row.find(".JODNI_Qty").val();
        let unitPrice = row.find(".JODNI_UnitPrice").val();

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
                row.find(".JODNI_JPRS_Number")
            );
            isValid = false;
            return false; // break loop
        }

        // validate Item Code
        if (!itemCode || itemCode.trim() === "") {
            showAlert('Item Code is required', row.find(".JODNI_Item_Code"));

            isValid = false;
            return false;
        }

        // validate Qty
        if (!qty || qty.trim() === "" || (parseFloat(removeComma(qty)) || 0) <= 0) {
            showAlert('Qty is required', row.find(".JODNI_Qty"));

            isValid = false;
            return false;
        }

        // validate Unit Price
        if (!unitPrice || unitPrice.trim() === "" || (parseFloat(removeComma(unitPrice)) || 0) <= 0) {
            showAlert('Unit Price is required', row.find(".JODNI_UnitPrice"));

            isValid = false;
            return false;
        }

        // NEW: validate From WH / To WH when Freight Applicable is checked
        if (row.find(".JODNI_IsFreightApplicable").is(":checked")) {

            hasFreightRow = true;
            let fromWH = row.find(".JODNI_FromWH_Number").val();
            let toWH = row.find(".JODNI_ToWH_Number").val();

            if (!fromWH || fromWH === "0") {
                showAlert("From WH is required.", row.find(".JODNI_FromWH_Number"));
                isValid = false;
                return false;
            }

            if (!toWH || toWH === "0") {
                showAlert("To WH is required.", row.find(".JODNI_ToWH_Number"));
                isValid = false;
                return false;
            }
        }

    });

    // no valid row added
    if (!hasValidRow) {
        showAlert('Please add at least one item in grid', "#ItemTable tbody tr:first .JODNI_JPRS_Number");
        //row.find(".JODNI_JPRS_Number").focus();
        return false;
    }

    // a row already failed and showed its alert - do not show a second one
    if (!isValid) {
        return false;
    }

    // Header Freight Applicable ticked -> at least one row must be freight applicable
    if ($("#Header_Freight_Applicable").is(":checked") && !hasFreightRow) {
        showAlert(
            "Freight is marked applicable — at least one item row must have Freight Applicable checked.",
            "#ItemTable tbody tr.NewRow:first .JODNI_IsFreightApplicable"
        );
        return false;
    }

    return isValid;
}
//#endregion VALIDATE ITEM GRID

//#region VALIDATE DELIVERY NOTE BATCH LIST
function validateDeliveryNoteBatchList() {

    let isValid = true;
    let itemRows = $("#ItemTable tbody tr.NewRow");

    itemRows.each(function (index) {

        let itemRow = $(this);

        // skip deleted rows
        if (itemRow.find(".JODNI_IsDeleted").val() === "1" ||
            itemRow.find(".JODNI_IsDeleted").val() === "true") {
            return;
        }

        // skip rows with no item selected (not a real data row)
        let itemNumber = itemRow.find(".JODNI_Item_Number").val();
        if (!itemNumber || itemNumber === "0") {
            return;
        }

        let rowID = itemRow.attr("data-rowid");

        let batchEntry =
            DeliveryNoteItemBatchList.find(x => x.RowID == rowID);

        let rowNumber = index + 1;

        // no batch saved at all for this item row
        if (!batchEntry || !batchEntry.BatchList || batchEntry.BatchList.length === 0) {
            $("#ModelAlert").off("hidden.bs.modal");
            showAlert(
                "Please enter Delivered Qty in batch details/Qty mismatch (Item Row " + rowNumber + ")"
            );

            isValid = false;
            return false; // break loop
        }

        // at least ONE batch line for this item must have qty > 0
        let hasAnyValidBatchQty = batchEntry.BatchList.some(function (b) {
            let qty = parseFloat(removeComma(b.JODNI_BCH_QtyInvoice)) || 0;
            return qty > 0;
        });

        if (!hasAnyValidBatchQty) {
            $("#ModelAlert").off("hidden.bs.modal");
            showAlert(
                "Please enter Delivered Qty in batch details/Qty mismatch (Item Row " + rowNumber + ")"
            );

            isValid = false;
            return false; // break loop
        }

        // batch total must equal the item Qty
        let itemQty = parseFloat(removeComma(itemRow.find(".JODNI_Qty").val())) || 0;
        let batchTotal = batchEntry.BatchList.reduce(function (sum, b) {
            return sum + (parseFloat(removeComma(b.JODNI_BCH_QtyInvoice)) || 0);
        }, 0);

        if (Math.abs(batchTotal - itemQty) > 0.0001) {
            $("#ModelAlert").off("hidden.bs.modal");
            showAlert(
                "Please enter Delivered Qty in batch details/Qty mismatch (Item Row " + rowNumber + ")"
                //"Qty mismatch: batch total (" + addComma(batchTotal, "q") +
                //") does not match item Qty (" + addComma(itemQty, "q") +
                //") (Item Row " + rowNumber + ")"
            );

            isValid = false;
            return false; // break loop
        }
    });

    return isValid;
}

//#endregion

//#region TEMP DELIVERY BATCH MODEL
function CreateTempDeliveryBatchModel(row) {

    return {

        DBCH_Number:
            parseInt(row.find(".JODNI_BCH_Number").val()) || 0,

        DBCH_Index:
            parseInt(row.index()) || 0,

        DBCH_DBCH_Number:
            parseInt(row.find(".JODNI_BCH_Number").val()) || null,

        DBCH_Item_Number:
            parseInt($("#Header_JODNI_Item_Number").val()) || 0,

        DBCH_Warehouse_Number:
            parseInt(row.find(".JODNI_BCH_WH_Number").val()) || 0,

        DBCH_Date:
            row.find(".JODNI_BCH_BatchDate").val(),

        DBCH_No:
            row.find(".JODNI_BCH_BatchNo").val(),

        DBCH_Qty:
            parseFloat(
                row.find(".JODNI_BCH_QtyInvoice").val()
            ) || 0,

        DBCH_UnitPrice:
            parseFloat(
                row.find(".JODNI_BCH_BatchUnitPrice").val()
            ) || 0,

        DBCH_Value:
            parseFloat(
                row.find(".JODNI_BCH_BatchValue").val()
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



function ResizeAddressPopup(tableSelector = "#AddressTable", modalSelector = "#BuyerAddress") {

    const table = document.querySelector(tableSelector);
    const dialog = document.querySelector(modalSelector + " .modal-dialog");

    if (!table || !dialog) return;

    // Actual table width
    const tableWidth = table.offsetWidth;

    // Extra space for modal padding/borders
    const popupWidth = tableWidth + 40;

    dialog.style.setProperty("width", popupWidth + "px", "important");
    dialog.style.setProperty("max-width", popupWidth + "px", "important");
}

function LoadJWCAddress() {

    if (!$("#Header_JODNH_JW_Vendor_Number").val()) {
        showAlert('JW Vendor is required', '#Header_JODNH_JW_Vendor_Name');
        return;
    }

    // one row per Address Type; Address ID / details are filled by
    // the Address Type change handler (vendor-address call)
    $("#AddTempRow .JODNA_ADTP_Number option").each(function () {

        let typeValue = $(this).val();
        if (!typeValue) return;

        addAddressRow();
        $("#AddTableBody tr.NewRow:last")
            .find(".JODNA_ADTP_Number")
            .val(typeValue)
            .trigger("change");
    });

    setTimeout(function () {

        // drop rows for which the vendor has no address of that type
        $("#AddTableBody tr.NewRow").each(function () {
            if (!$(this).find(".JODNA_Address_ID").val()) {
                $(this).find(".JODNA_IsDeleted").val("1");
                $(this).hide();
            }
        });

        ResizeAddressColumns();

        $("#BuyerAddress").one("shown.bs.modal", function () {
            ResizeAddressPopup();
        });

        $("#BuyerAddress").modal("show");
    }, 700);
}
 
//#region itemgrid-qty
// Restrict Qty input to digits only
$(document).on("keypress", ".JODNI_Qty", function (e) {
    let charCode = e.which ? e.which : e.keyCode;
    let charStr = String.fromCharCode(charCode);

    if (!/[0-9]/.test(charStr)) {
        e.preventDefault();
    }
});

// Strip any non-numeric characters that slip in via paste
$(document).on("input", ".JODNI_Qty", function () {
    let cleaned = $(this).val().replace(/[^0-9]/g, "");

    if (cleaned !== $(this).val()) {
        $(this).val(cleaned);
    }
});
//#endregion

//#region itemgrid-unitprice Unit Price Format

//#region Unit Price - decimal only (digits + one dot, max 2 decimals)
const UNITPRICE_INPUT = "#ItemTable .JODNI_UnitPrice";
const UNITPRICE_PATTERN = /^\d*\.?\d{0,2}$/;

// remove commas while editing (focusout adds them back)
$(document).on("focusin", UNITPRICE_INPUT, function () {
    $(this).val(($(this).val() || "").replace(/,/g, ""));
});

// block a keystroke if the resulting value breaks the pattern
$(document).on("keypress", UNITPRICE_INPUT, function (e) {
    if (e.ctrlKey || e.metaKey) return;   // Ctrl+V / Ctrl+A / Ctrl+C
    if (e.which < 32) return;             // Enter, Backspace etc.

    let el = this;
    let newVal = el.value.slice(0, el.selectionStart)
        + String.fromCharCode(e.which)
        + el.value.slice(el.selectionEnd);

    if (!UNITPRICE_PATTERN.test(newVal)) {
        e.preventDefault();
    }
});

// clean paste / drag-drop / autofill
$(document).on("input", UNITPRICE_INPUT, function () {
    let v = $(this).val();

    if (!UNITPRICE_PATTERN.test(v)) {
        v = v.replace(/[^0-9.]/g, "");
        let parts = v.split(".");
        v = parts.length > 1
            ? parts[0] + "." + parts.slice(1).join("").slice(0, 2)
            : parts[0];
        $(this).val(v);
    }
});

// a lone "." is not a number
$(document).on("focusout", UNITPRICE_INPUT, function () {
    if ($(this).val() === ".") $(this).val("");
});
//#endregion

//#region comma format on focusout
$(document).on("focusout", ".JODNI_Qty, .JODNI_UnitPrice, .JODNI_Amount", function () {

    let type = $(this).hasClass("JODNI_Qty") ? "q" : "c";

    $(this).val(addComma($(this).val(), type));
});
//#endregion

//#endregion

//#region batchgrid-qty
// Restrict Qty input to digits only
$(document).on("keypress", ".JODNI_BCH_QtyInvoice", function (e) {
    let charCode = e.which ? e.which : e.keyCode;
    let charStr = String.fromCharCode(charCode);

    if (!/[0-9]/.test(charStr)) {
        e.preventDefault();
    }
});

// Strip any non-numeric characters that slip in via paste
$(document).on("input", ".JODNI_BCH_QtyInvoice", function () {
    let cleaned = $(this).val().replace(/[^0-9]/g, "");

    if (cleaned !== $(this).val()) {
        $(this).val(cleaned);
    }
});
//#endregion