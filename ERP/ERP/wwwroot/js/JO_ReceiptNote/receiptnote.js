// ---- right pane show/hide (Vendor / Item search)
function ShowVendorPane() {
    $("#RightPane").show().addClass("show");
    $("#RightPane .buyer-search-results").show();

    $("#RightPane_Item").hide().removeClass("show");
    $("#RightPane_Item .search-results").hide();
}

if (typeof ShowItemPane !== "function") {
    window.ShowItemPane = function () {
        $("#RightPane_Item").show().addClass("show");
        $("#RightPane_Item .search-results").show();

        $("#RightPane").hide().removeClass("show");
        $("#RightPane .buyer-search-results").hide();
    };
}

$(document).ready(function () {
    //#region JW_Vendor – Focus In
    // Handled via inline onfocus="ShowVendorPane();OnBuyerSelectCall(this)"
    // in the .cshtml — no delegated binding needed.
    //#endregion

    //#region JW_Vendor – Text change
    // Handled via inline oninput="OnBuyerInput(this)" in the .cshtml.
    //#endregion

    //#region JW_Vendor – Focus Out
    $(document).on("focusout", "#Header_JORNH_JW_Vendor_Name", function () {
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

    //#region JW_Vendor – Keydown
    $(document).on("keydown", "#Header_JORNH_JW_Vendor_Name", function (e) {

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
    $(document).on("keydown", ".JORNI_Item_Code", function (e) {

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
            "#Header_JORNH_MS_Number"
        );
    });

    // mousedown -> (re)open the item pane and load/refresh the search.
    $(document).on("mousedown", ".JORNI_Item_Code", function (e) {
        OpenItemCodeSearch(this);
    });

    // Item_Code Escape (unscoped — pre-existing, left as-is; not part
    // of this pass's scope since it's a logic concern, not a
    // relocation concern).
    $(document).on("keydown", function (e) {
        if (e.key === "Escape") {
            let input = $(".JORNI_Item_Code");
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
    $(document).on("focusout", ".JORNI_Item_Code", function () {

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

const FREIGHT_PRS_NUMBER = 40008;
const ItemTableFields = [
    { cls: ".JORNI_JPRS_Number", min: 10, max: 25, align: "left" },    // Process
    { cls: ".JORNI_Item_Code", min: 10, max: 15, align: "left" },    // Item Code
    { cls: ".JORNI_Item_Code", min: 10, max: 15, align: "left" },    // Item Code
    { cls: ".JORNI_Item_Description", min: 40, max: 40, align: "left" },    // Description
    { cls: ".JORNI_OuterDia", min: 8, max: 8, align: "center" },  // Outer Dia
    { cls: ".JORNI_Thickness", min: 8, max: 8, align: "center" },  // Thickness
    { cls: ".JORNI_Length", min: 8, max: 8, align: "center" },  // Length
    { cls: ".JORNI_MaterialGrade", min: 10, max: 25, align: "left" },    // Material Grade
    { cls: ".JORNI_ItemGroup", min: 10, max: 30, align: "left" },    // Item Group
    { cls: ".JORNI_WH_Number", min: 10, max: 25, align: "left" },    // Warehouse
    { cls: ".JORNI_UoM_Number", min: 10, max: 15, align: "center" },  // UoM
    { cls: ".JORNI_Qty", min: 10, max: 20, align: "center" },  // Qty
    { cls: ".JORNI_Qty_Kgs", min: 10, max: 20, align: "center" },  // Qty Kgs
    { cls: ".JORNI_UnitPrice", min: 10, max: 20, align: "right" },   // Unit Price
    { cls: ".JORNI_Amount", min: 13, max: 25, align: "right" },   // Amount

    // Not present in the specification, so left unchanged
    { cls: ".JORNI_JOJWI_SVOH_Number", min: 10, max: 25, align: "left" },
    { cls: ".JORNI_FromWH_Number", min: 10, max: 25, align: "left" },
    { cls: ".JORNI_ToWH_Number", min: 10, max: 25, align: "left" },
    { cls: ".JORNI_JOFRT_SVOH_Number", min: 10, max: 25, align: "left" }



];
let isMouseSelectingBuyer = false;

var addressIndex = 0;
//#region batch grid alignment
function GetTableWidth(container = "#ReceiptNoteBatchList") {

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


function ApplyOtherBatchFieldWidths(container = "#ReceiptNoteOtherBatchList") {

    const fields = [
        { cls: ".JORNI_BCH_WH_Name", min: 15, max: 30, align: "left" },
        { cls: ".JORNI_BCH_BatchDate", min: 12, max: 12, align: "center" },
        { cls: ".JORNI_BCH_BatchNo", min: 20, max: 35, align: "left" },
        { cls: ".JORNI_BCH_AvailableQty", min: 11, max: 20, align: "center" },
        { cls: ".JORNI_BCH_BatchUnitPrice", min: 11, max: 20, align: "right" },
        { cls: ".JORNI_BCH_BatchValue", min: 13, max: 25, align: "right" }
    ];

    const $container = $(container);

    fields.forEach(f => {

        const controls = $container.find(
            "#ReceiptNoteOtherBatchTableBody > #ReceiptNoteOtherBatchTemplateRow " + f.cls +
            ", #ReceiptNoteOtherBatchTableBody > tr.ReceiptNoteOtherBatchRow " + f.cls
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

    const tableWidth = GetTableWidth("#ReceiptNoteOtherBatchList");
    SetReceiptNoteOtherBatchModalWidth(tableWidth);
}
function SetReceiptNoteOtherBatchModalWidth(tableWidth) {

    const dialog = document.querySelector("#ReceiptNoteOtherBatchModal .modal-dialog");

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
        { cls: ".JORNI_JPRS_Number", align: "left" },
        { cls: ".JORNI_Item_Code", align: "left" },
        { cls: ".JORNI_Item_Description", align: "left" },

        { cls: ".JORNI_OuterDia", align: "center" },
        { cls: ".JORNI_Thickness", align: "center" },
        { cls: ".JORNI_Length", align: "center" },

        { cls: ".JORNI_MaterialGrade", align: "left" },
        { cls: ".JORNI_ItemGroup", align: "left" },
        { cls: ".JORNI_WH_Number", align: "left" },

        { cls: ".JORNI_UoM_Number", align: "center" },

        { cls: ".JORNI_Qty", align: "center" },
        { cls: ".JORNI_UnitPrice", align: "right" },
        { cls: ".JORNI_Amount", align: "right" },

        { cls: ".JORNI_JOJWI_SVOH_Number", align: "left" },
        { cls: ".JORNI_FromWH_Number", align: "left" },
        { cls: ".JORNI_ToWH_Number", align: "left" },

        { cls: ".JORNI_JOFRT_SVOH_Number", align: "left" }
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
    fitInputWidth("Header_JORNH_RN_No", 20, 25);
    fitInputWidth("Header_JORNH_MS_Number", 20, 30);
    fitInputWidth("Header_JORNH_JW_Vendor_Name", 40, 50);
    fitInputWidth("Header_JORNH_Currency_Number", 10, 10);
    fitInputWidth("Header_JORNH_WH_Number", 20, 25);
    fitInputWidth("Header_JORNH_VendorDC_No", 20, 25);
    fitInputWidth("Header_JORNH_Remarks", 40, 40);
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

function LoadDefaultFormSetting() {
    $.ajax({
        url: '/joboutward/transactions/receipt-note-dfs/get',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response && response.success && response.data) {
                var data = response.data;

                if (data.jorN_DFS_MS_Number) {
                    $('#Header_JORNH_MS_Number').val(data.jorN_DFS_MS_Number).trigger('change');
                }
                if (data.jorN_DFS_JW_Vendor_Number) {
                    var vendorNo = data.jorN_DFS_JW_Vendor_Number;
                    var $vName = $('#Header_JORNH_JW_Vendor_Name');

                    $('#Header_JORNH_JW_Vendor_Number').val(vendorNo);
                    $vName.val(data.jwV_JW_VendorName);

                    // load vendor list, then select the default vendor row
                    // (same logic as manual select: fills Currency + Warehouse)
                    SearchBuyer($vName[0]);

                    setTimeout(function () {
                        var $row = $("#RightPane .buyer-search-results tbody tr").filter(function () {
                            var v = $(this).data("vendor");
                            return v && VendorVal(v, VENDOR_KEYS.number) == vendorNo;
                        }).first();

                        if ($row.length) {
                            $row.trigger("mousedown");
                        }
                    }, 1000);
                }
                if (data.jorN_DFS_Remarks) {
                    $('#Header_JORNH_Remarks').val(data.jorN_DFS_Remarks);
                }
                if (data.jorN_DFS_IsFreightApplicable) {
                    $('#Header_Freight_Applicable')
                        .prop('checked', data.jorN_DFS_IsFreightApplicable === 'Yes')
                        .trigger('change');
                }
            }
        },
        error: function (xhr) {
            console.error('Failed to load default form setting', xhr);
        }
    });
}
function OpenItemCodeSearch(inputElement) {

    if ($.trim($("#Header_JORNH_MS_Number").val()) === "" || $("#Header_JORNH_MS_Number").val() === "0") {
        $("#Header_JORNH_MS_Number").prop("selectedIndex", 1);
    }

    $("#RightPane").hide();
    $("#RightPane").removeClass("show");
    $("#RightPane .buyer-search-results").hide();

    $("#RightPane_Item").show();
    $("#RightPane_Item").addClass("show");
    $("#RightPane_Item .search-results").show();

    searchItemJORNI(inputElement);
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

    $(document).on("change", "#Header_JORNH_JW_Vendor_Number", function () {

        $("#ItemTable tbody tr.NewRow").each(function () {

            let row = $(this);

            if (
                row.find(".JORNI_IsJW_InvoiceApplicable").is(":checked") ||
                row.find(".JORNI_IsFreightApplicable").is(":checked")
            ) {
                row.find(".JORNI_UoM_Number").trigger("change");
            }
        });
    });

    // NEW: Qty to Kg conversion (same pattern as Receipt Note)
    $(document).on("input", ".JORNI_Qty", function () {
        let row = $(this).closest("tr");
        CalculateQtyKgDN(row);
    });

    $(document).on("change", ".JORNI_UoM_Number", function () {
        let row = $(this).closest("tr");
        let itemNumber = row.find(".JORNI_Item_Number").val();
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

    LoadDefaultFormSetting();

    //#region Header_JORNH_JW_Vendor_Name
    // JW_Vendor – Focus Out: moved to <script> block
    // JW_Vendor – Keydown: moved to <script> block
    //#endregion
    //#region item code right pane search JORNI_Item_Code
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
    //#region batch grid alignment
    $(document).on("input change blur", "#ReceiptNoteBatchList input, #ReceiptNoteBatchList textarea, #ReceiptNoteBatchList select", function () {
        ApplyBatchFieldWidths("#ReceiptNoteBatchList");
    });

    $(window).on("load", function () {
        setTimeout(function () {

            ApplyBatchFieldWidths("#ReceiptNoteBatchList");


        }, 200);
    });


    $(document).on(
        "input change blur",
        "#ReceiptNoteOtherBatchList input, #ReceiptNoteOtherBatchList textarea, #ReceiptNoteOtherBatchList select",
        function () {
            ApplyOtherBatchFieldWidths("#ReceiptNoteOtherBatchList");
        }
    );

    ApplyOtherBatchFieldWidths("#ReceiptNoteOtherBatchList");

    // Other WH tab: measure widths when the tab is visible and the rows are filled
    $(document).on("shown.bs.tab", "#Other-tab", function () {
        ApplyOtherBatchFieldWidths("#ReceiptNoteOtherBatchList");
    });
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
        "#Header_JORNH_RN_No, #Header_JORNH_VendorDC_No, #Header_JORNH_MS_Number, #Header_JORNH_JW_Vendor_Name, #Header_JORNH_Currency_Number, #Header_JORNH_WH_Number, #Header_JORNH_Remarks",
        function () {

            const widths = {
                Header_JORNH_RN_No: [20, 25],
                Header_JORNH_VendorDC_No: [20, 25],
                Header_JORNH_MS_Number: [20, 30],
                Header_JORNH_JW_Vendor_Name: [40, 50],
                Header_JORNH_Currency_Number: [10, 10],
                Header_JORNH_WH_Number: [20, 25],
                Header_JORNH_Remarks: [40, 40]
            };

            const [min, max] = widths[this.id];
            fitInputWidth(this, min, max);
        });

    //#endregion

  

    //#region INPUT CLICK SELECT ALL
    $(document).on("click", "#ReceiptNoteBatchList input", function (e) {
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
    $(document).on("keyup change", ".JORNI_Qty, .JORNI_UnitPrice", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat((row.find(".JORNI_Qty").val() || "0").replace(/,/g, "")) || 0;
        let price = parseFloat((row.find(".JORNI_UnitPrice").val() || "0").replace(/,/g, "")) || 0;

        let amount = qty * price;

        // Only set row amount (read-only field)
        row.find(".JORNI_Amount").val(formatIndianCurrency(amount));

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

        let qty = parseFloat(removeComma(currentRow.find(".JORNI_Qty").val())) || 0;
        let price = parseFloat(removeComma(currentRow.find(".JORNI_UnitPrice").val())) || 0;

        let itemCode = currentRow.find(".JORNI_Item_Code").val();
        let prsNo = currentRow.find(".JORNI_JPRS_Number").val();

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
            if (el.hasClass("JORNI_IsDeleted")) return;

            if (el.hasClass("JORNI_Item_Code")) {
                if (!el.val()) {
                    isValid = false;
                    el.focus();
                    return false;
                }
            }

            if (el.hasClass("JORNI_Qty")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) {
                    isValid = false;
                    el.focus();
                    return false;
                }
            }

            if (el.hasClass("JORNI_UnitPrice")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) {
                    isValid = false;
                    el.focus();
                    return false;
                }
            }

            if (el.hasClass("JORNI_JPRS_Number")) {

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
            if (!el.hasClass("JORNI_IsDeleted")) {
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
        }
        else {

            var model = CreateReceiptNoteModel();

            $.ajax({

                url: '/joboutward/transactions/receipt-note/save',

                type: 'POST',

                contentType: 'application/json',

                data: JSON.stringify(model),

                success: function (response) {

                    if (response.success) {
                        $('#ModelAlert').one('hidden.bs.modal', function () {
                            location.reload();
                        });
                        showAlert('Record Inserted');
                    }
                    else {
                        showAlert(response.message || 'Save failed');
                    }
                },

                error: function (xhr) {
                    console.log(xhr.responseText);
                    showAlert('Save failed');
                }
            });
        }
    });
    function GetBatchMismatchRowIds() {
        return batchMismatchData
            .map(x => x.rowId)
            .join(",");
    }
    function CreateReceiptNoteBatchModel() {

        let receiptNoteBatches = [];

        $.each(ReceiptNoteItemBatchList, function () {

            let itemBatch = this;

            // Skip empty batch list
            if (!itemBatch.BatchList || itemBatch.BatchList.length <= 0) {
                return true;
            }

            $.each(itemBatch.BatchList, function () {

                let batch = this;

                let qty = parseFloat((batch.JORNI_BCH_QtyReceived || "0").toString().replace(/,/g, "")) || 0;

                // Skip empty qty
                if (qty <= 0) {
                    return true;
                }

                let formattedBatchDate = null;

                if (batch.JORNI_BCH_BatchDate) {
                    let date = new Date(batch.JORNI_BCH_BatchDate);
                    if (!isNaN(date.getTime())) {
                        formattedBatchDate = date.toISOString();
                    }
                }

                receiptNoteBatches.push({

                    // new receipt batch row (number is generated by the DB)
                    JORNI_BCH_Number: 0,
                    JORNI_BCH_JORNH_Number: 0,
                    JORNI_BCH_JORNI_Number: 0,

                    JORNI_BCH_WH_Number:
                        parseInt(batch.JORNI_BCH_WH_Number) || 0,

                    JORNI_BCH_BatchDate: formattedBatchDate,

                    JORNI_BCH_BatchNo: batch.JORNI_BCH_BatchNo || "",

                    JORNI_BCH_BatchQty: qty,

                    JORNI_BCH_BatchUnitPrice:
                        parseFloat((batch.JORNI_BCH_BatchUnitPrice || "0").toString().replace(/,/g, "")) || 0,

                    JORNI_BCH_BatchValue:
                        parseFloat((batch.JORNI_BCH_BatchValue || "0").toString().replace(/,/g, "")) || 0,

                    // stock batch picked in the popup (source of this receipt batch)
                    JORNI_BCH_Ref_Batch:
                        parseInt(batch.JORNI_BCH_Number) || 0
                });
            });
        });

        return receiptNoteBatches;
    }

    function CreateReceiptNoteModel() {

        // =====================================
        // HEADER
        // =====================================
        var header = {

            JORNH_Number:
                parseInt($("#Header_JORNH_Number").val()) || 0,

            JORNH_RN_No:
                $("#Header_JORNH_RN_No").val(),

            JORNH_RN_Date:
                new Date($("#Header_JORNH_RN_Date").val()).toISOString(),

            JORNH_VendorDC_No:
                $("#Header_JORNH_VendorDC_No").val(),

            JORNH_VendorDC_Date:
                new Date($("#Header_JORNH_VendorDC_Date").val()).toISOString(),

            JORNH_MS_Number:
                parseInt($("#Header_JORNH_MS_Number").val()) || 0,

            JORNH_JW_Vendor_Number:
                parseInt($("#Header_JORNH_JW_Vendor_Number").val()) || 0,

            JORNH_JW_Vendor_Name:
                $("#Header_JORNH_JW_Vendor_Name").val(),

            JORNH_Currency_Number:
                parseInt($("#Header_JORNH_Currency_Number").val()) || 0,

            JORNH_WH_Number:
                parseInt($("#Header_JORNH_WH_Number").val()) || 0,

            JORNH_Remarks:
                $("#Header_JORNH_Remarks").val(),

            JORNH_IsFreightApplicable:
                $("#Header_Freight_Applicable").is(":checked") ? "Yes" : "No"
        };

        // =====================================
        // ITEMS
        // =====================================
        var items = [];

        $("#ItemTable tbody tr.NewRow").each(function () {

            let row = $(this);

            // Skip deleted rows
            if (row.find(".JORNI_IsDeleted").val() == "true") {
                return;
            }

            // Skip empty rows
            if (!row.find(".JORNI_Item_Number").val()) {
                return;
            }

            let isFreight = row.find(".JORNI_IsFreightApplicable").is(":checked");
            let isJWI = row.find(".JORNI_IsJW_InvoiceApplicable").is(":checked");

            items.push({
                JORNI_JORNH_Number:
                    parseInt(row.find(".JORNI_JORNH_Number").val()) || 0,

                JORNI_Number:
                    parseInt(row.find(".JORNI_Number").val()) || 0,

                JORNI_JPRS_Number:
                    parseInt(row.find(".JORNI_JPRS_Number").val()) || 0,

                JORNI_Item_Number:
                    parseInt(row.find(".JORNI_Item_Number").val()) || 0,

                JORNI_WH_Number:
                    parseInt(row.find(".JORNI_WH_Number").val()) || 0,

                JORNI_UoM_Number:
                    parseInt(row.find(".JORNI_UoM_Number").val()) || 0,

                JORNI_Qty:
                    parseFloat((row.find(".JORNI_Qty").val() || "0").replace(/,/g, "")) || 0,

                JORNI_Qty_Kgs:
                    parseFloat((row.find(".JORNI_Qty_Kgs").val() || "0").replace(/,/g, "")) || 0,

                JORNI_UnitPrice:
                    parseFloat((row.find(".JORNI_UnitPrice").val() || "0").replace(/,/g, "")) || 0,

                JORNI_Amount:
                    parseFloat((row.find(".JORNI_Amount").val() || "0").replace(/,/g, "")) || 0,

                JORNI_IsJW_InvoiceApplicable: isJWI ? "Yes" : "No",

                JORNI_JOJWI_SVOH_Number:
                    parseInt(row.find(".JORNI_JOJWI_SVOH_Number").val()) || 0,

                JORNI_JOJWI_SVOI_Number:
                    parseInt(row.find(".JORNI_JOJWI_SVOI_Number_Row").val()) || 0,

                JORNI_IsFreightApplicable: isFreight ? "Yes" : "No",

                JORNI_FromWH_Number:
                    parseInt(row.find(".JORNI_FromWH_Number").val()) || null,

                JORNI_ToWH_Number:
                    parseInt(row.find(".JORNI_ToWH_Number").val()) || null,

                JORNI_JOFRT_SVOH_Number:
                    parseInt(row.find(".JORNI_JOFRT_SVOH_Number").val()) || 0,

                JORNI_JOFRT_SVOI_Number:
                    parseInt(row.find(".JORNI_JOFRT_SVOI_Number_Row").val()) || 0
            });
        });

        // =====================================
        // FINAL MODEL
        // =====================================
        return {
            Header: header,
            Items: items,
            receiptNoteBatches: CreateReceiptNoteBatchModel()
        };
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

                url: '/joboutward/transactions/receipt-note/delete-temp-batch-row',

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
        ".JORNI_IsJW_InvoiceApplicable, .JORNI_JPRS_Number, .JORNI_Item_Code, .JORNI_UoM_Number",
        function () {

            let row = $(this).closest("tr");

            if (row.find(".JORNI_IsJW_InvoiceApplicable").is(":checked")) {

                BindServiceOrderRow(row);

            } else {
                row.find(".JORNI_JOJWI_SVOH_Number").html('<option value="0"></option>').val("0");
                row.find(".JORNI_JOJWI_SVOI_Number_Row").val(0);
            }
        }
    );



    $(document).on(
        "change",
        ".JORNI_IsFreightApplicable, .JORNI_UoM_Number, .JORNI_FromWH_Number, .JORNI_ToWH_Number",
        function () {

            let row = $(this).closest("tr");
            if (row.find(".JORNI_IsFreightApplicable").is(":checked")) {

                BindFreightServiceOrderRow(row);

            } else {
                row.find(".JORNI_JOFRT_SVOH_Number").html('<option value="0"></option>').val("0");
                row.find(".JORNI_JOFRT_SVOI_Number_Row").val(0);
            }
        }
    );

});

//#region GetReceiptNoteNumber
$(document).on("change", "#Header_JORNH_RN_Date", function () {
    GetReceiptNoteNumber();
});

function GetReceiptNoteNumber() {

    let date = $("#Header_JORNH_RN_Date").val();

    if (!date)
        return;

    let d = new Date(date);

    let poDate =
        d.getFullYear().toString() +
        String(d.getMonth() + 1).padStart(2, '0') +
        String(d.getDate()).padStart(2, '0');

    $.ajax({
        url: "/joboutward/transactions/receipt-note/next-rn-number",
        type: "GET",
        data: { RNDate: date },
        success: function (response) {
            if (!response || response.trim() === "") {
                $("#Header_JORNH_RN_No").val("");
                alert("Please set numbering for this date range.");
            
              

                return;
            }

            $("#Header_JORNH_RN_No").val(response);

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

    var fp = document.getElementById("Header_JORNH_RN_Date")._flatpickr;
    if (fp) fp.setDate(formattedDate, true, "d-M-Y");
    GetReceiptNoteNumber();
}

//#region delete grid
function DeleteItemRowTempTable(inputElement) {
    let ItemGridindex =
        $(inputElement)
            .closest("tr")
            .index("#ItemTable tbody tr.NewRow:visible") + 1;
    $.ajax({

        url: '/joboutward/transactions/receipt-note/temp-batch-change-item',

        type: 'POST',

        data: { JORNI_Number: 0, JORNH_Number: 0, DBCH_Index: ItemGridindex },

        success: function (response) {

            calculateTotal();
        },

        error: function (xhr) {

            console.log(xhr.responseText);
        }
    });
}



//#endregion

//#region vendor Search Functions
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

// ---- vendor search result : column names (case-insensitive lookup) ----
const VENDOR_KEYS = {
    name: ["JWV_JW_VendorName", "JW_VendorName", "VendorName", "Name"],
    number: ["JWV_Number", "JW_Vendor_Number", "VendorNumber", "Number"],
    currency: ["JWV_Currency_Number", "Currency_Number"],
    warehouse: ["JWV_WH_Number", "WH_Number"]
};

function VendorVal(obj, keys) {
    if (!obj) return "";
    const lower = {};
    Object.keys(obj).forEach(function (k) { lower[k.toLowerCase()] = obj[k]; });
    for (let i = 0; i < keys.length; i++) {
        const v = lower[keys[i].toLowerCase()];
        if (v !== undefined && v !== null) return v;
    }
    return "";
}

let buyerSearchXHR = null;

function SearchBuyer(inputElement) {

    var JWVendor = inputElement.value;
    var SIHDate = $("#Header_JORNH_RN_Date").val();
    var resultsDiv = $("#RightPane").find(".buyer-search-results");

    if (buyerSearchXHR) {
        buyerSearchXHR.abort();
    }

    buyerSearchXHR = $.ajax({
        url: '/joboutward/transactions/receipt-note/vendor',
        type: 'GET',
        data: {
            Vendor: JWVendor,
            RNDate: SIHDate
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
                    row.data("vendor", cust);
                    row.append("<td>" + VendorVal(cust, VENDOR_KEYS.name) + "</td>");

                    table.find("tbody").append(row);
                });

                table.find("tbody").on("mousedown", "tr", function (e) {

                    e.preventDefault();

                    const clickedVendor = $(this).data("vendor");
                    isMouseSelectingBuyer = true;

                    $(inputElement).val(VendorVal(clickedVendor, VENDOR_KEYS.name));

                    $("#Header_JORNH_JW_Vendor_Number")
                        .val(VendorVal(clickedVendor, VENDOR_KEYS.number))
                        .trigger("change");

                    // auto-fill Currency and Warehouse from the vendor master
                    let cur = VendorVal(clickedVendor, VENDOR_KEYS.currency);
                    if (cur) $("#Header_JORNH_Currency_Number").val(cur).trigger("change");

                    let wh = VendorVal(clickedVendor, VENDOR_KEYS.warehouse);
                    if (wh) $("#Header_JORNH_WH_Number").val(wh).trigger("change");

                    $("#BuyerMessage").hide().text("");
                    $("#RightPane").removeClass("show");
                    $("#RightPane .buyer-search-results").hide();

                    // focus goes to Currency after vendor select
                    setTimeout(function () {
                        $("#Header_JORNH_Currency_Number").focus();
                        $(document).trigger("click");
                    }, 100);

                    // keep flag true until focus has moved, so focusout
                    // does not run HandleSearchSelection again
                    setTimeout(function () {
                        isMouseSelectingBuyer = false;
                    }, 300);
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

                let searchText = JWVendor.trim().toLowerCase();

                let firstMatch = -1;
                let lastMatch = -1;

                rows.each(function (i) {

                    let vendor = $(this).find("td:first").text().trim().toLowerCase();

                    if (searchText !== "" && vendor.startsWith(searchText)) {

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

//#endregion vendor Search Functions

// Hide search when clicking outside

//#endregion vendor Search Functions

// No's Service Order dropdown
$(document).on("change", ".JORNI_JOFRT_SVOH_Number", function () {

    let row = $(this).closest("tr");
    let freightSO = $(this).val();

    // NEW: capture SO item id for JORNI_JOFRT_SVOI_Number (needed for the
    // qty-exceeded calc, same as GetOtherRowsQtyForSO/DB linkage)
    let selectedJisvoi = $(this).find("option:selected").attr("data-jisvoi") || 0;
    row.find(".JORNI_JOFRT_SVOI_Number_Row").val(selectedJisvoi);

    if (!freightSO || freightSO === "0") return;

    let uomNumber = row.find(".JORNI_UoM_Number").val();
    let fromWHNumber = row.find(".JORNI_FromWH_Number").val();
    let toWHNumber = row.find(".JORNI_ToWH_Number").val();
    let originalQty = parseFloat(removeComma(row.find(".JORNI_Qty").val())) || 0;

    $.get("/joboutward/transactions/receipt-note/check-received-qty-exceeded-freight", {
        jisvohNumber: freightSO,
        uomNumber,
        fromWHNumber,
        toWHNumber
    }, function (res) {

        if (!res || res.length === 0) return;

        let receivedQty = parseFloat(res[0].receivedQty) || 0;
        let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;

        // FORMULA: RealReceivedQty = DB_ReceivedQty + OtherRowsQty(Freight SO)
        let otherRowsQty = GetOtherRowsQtyForSO(freightSO, row);
        let realReceivedQty = receivedQty + otherRowsQty;

        // FORMULA: IsExceeded  <=>  (RealReceivedQty + CurrentQty) > SVO_Qty
        if ((realReceivedQty + originalQty) > jisvoiQty) {

            // FORMULA: AllowedQty = SVO_Qty − RealReceivedQty
            alert("Freight Qty Allowed: " + (jisvoiQty - realReceivedQty));
            setTimeout(function () {
                row.find(".JORNI_Qty")
                    .focus()
                    .select();
                row.find(".JORNI_JOFRT_SVOH_Number").val("0");
                row.find(".JORNI_JOFRT_SVOI_Number_Row").val(0);
            }, 300);
        }
    });
});
//#region Received Qty Validation

// FORMULA: Messages = [JWI_Msg if exceeded] + [Freight_Msg if exceeded] -> one alert, clear both, one focus
$(document).on("focusout", ".JORNI_Qty", function () {

    let row = $(this).closest("tr");
    let originalQty = parseFloat(removeComma(row.find(".JORNI_Qty").val())) || 0;
    let jisvohNumber = row.find(".JORNI_JOJWI_SVOH_Number").val();
    let freightSO = row.find(".JORNI_JOFRT_SVOH_Number").val();

    let jwiDeferred = $.Deferred();
    let freightDeferred = $.Deferred();

    // JWI check
    if (!jisvohNumber || jisvohNumber === "0") {
        jwiDeferred.resolve(null);
    } else {
        let prsNumber = row.find(".JORNI_JPRS_Number").val();
        let itemNumber = row.find(".JORNI_Item_Number").val();
        let uomNumber = row.find(".JORNI_UoM_Number").val();

        $.get("/joboutward/transactions/receipt-note/check-received-qty-exceeded", {
            jisvohNumber,
            prsNumber,
            itemNumber,
            uomNumber
        }, function (res) {
            if (!res || res.length === 0) { jwiDeferred.resolve(null); return; }

            let receivedQty = parseFloat(res[0].receivedQty) || 0;
            let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;

            // FORMULA: RealReceivedQty = DB_ReceivedQty + OtherRowsQty(SO)
            let otherRowsQty = GetOtherRowsQtyForSO(jisvohNumber, row);
            let realReceivedQty = receivedQty + otherRowsQty;

            // FORMULA: IsExceeded <=> (RealReceivedQty + CurrentQty) > SVO_Qty
            if ((realReceivedQty + originalQty) > jisvoiQty) {
                jwiDeferred.resolve({
                    // FORMULA: AllowedQty = SVO_Qty − RealReceivedQty
                    message: "Qty Allowed: " + (jisvoiQty - realReceivedQty),
                    clear: function () { row.find(".JORNI_JOJWI_SVOH_Number").val("0"); row.find(".JORNI_JOJWI_SVOI_Number_Row").val(0); }
                });
            } else {
                jwiDeferred.resolve(null);
            }
        }).fail(function () { jwiDeferred.resolve(null); });
    }

    // Freight check
    if (!freightSO || freightSO === "0") {
        freightDeferred.resolve(null);
    } else {
        let uomNumber = row.find(".JORNI_UoM_Number").val();
        let fromWHNumber = row.find(".JORNI_FromWH_Number").val();
        let toWHNumber = row.find(".JORNI_ToWH_Number").val();

        $.get("/joboutward/transactions/receipt-note/check-received-qty-exceeded-freight", {
            jisvohNumber: freightSO,
            uomNumber,
            fromWHNumber,
            toWHNumber
        }, function (res) {
            if (!res || res.length === 0) { freightDeferred.resolve(null); return; }

            let receivedQty = parseFloat(res[0].receivedQty) || 0;
            let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;

            // FORMULA: RealReceivedQty = DB_ReceivedQty + OtherRowsQty(Freight SO)
            let otherRowsQty = GetOtherRowsQtyForSO(freightSO, row);
            let realReceivedQty = receivedQty + otherRowsQty;

            // FORMULA: IsExceeded <=> (RealReceivedQty + CurrentQty) > SVO_Qty
            if ((realReceivedQty + originalQty) > jisvoiQty) {
                freightDeferred.resolve({
                    // FORMULA: AllowedQty = SVO_Qty − RealReceivedQty
                    message: "Freight Qty Allowed: " + (jisvoiQty - realReceivedQty),
                    clear: function () { row.find(".JORNI_JOFRT_SVOH_Number").val("0"); row.find(".JORNI_JOFRT_SVOI_Number_Row").val(0); }
                });
            } else {
                freightDeferred.resolve(null);
            }
        }).fail(function () { freightDeferred.resolve(null); });
    }

    // Combine
    $.when(jwiDeferred, freightDeferred).done(function (jwiResult, freightResult) {
        let messages = [];

        if (jwiResult) { messages.push(jwiResult.message); jwiResult.clear(); }
        if (freightResult) { messages.push(freightResult.message); freightResult.clear(); }

        if (messages.length > 0) {
            alert(messages.join("\n"));
            setTimeout(function () {
                row.find(".JORNI_Qty")
                    .focus()
                    .select();
            }, 300);
        }
    });
});

$(document).on("change", ".JORNI_JOJWI_SVOH_Number", function () {

    let row = $(this).closest("tr");
    let jisvohNumber = $(this).val();
    row.find(".JORNI_JOJWI_SVOH_Number").val(jisvohNumber)

    let jisvoiNumber = $(this).find("option:selected").data("jisvoi") || 0;
    row.find(".JORNI_JOJWI_SVOI_Number_Row").val(jisvoiNumber);

    let prsNumber = row.find(".JORNI_JPRS_Number").val();
    let itemNumber = row.find(".JORNI_Item_Number").val();
    let uomNumber = row.find(".JORNI_UoM_Number").val();
    let originalQty = parseFloat(removeComma(row.find(".JORNI_Qty").val())) || 0;
    let rowIndex = row.index();

    $.get("/joboutward/transactions/receipt-note/check-received-qty-exceeded", {
        jisvohNumber,
        prsNumber,
        itemNumber,
        uomNumber
    }, function (res) {

        if (!res || res.length === 0) return;

        let receivedQty = parseFloat(res[0].receivedQty) || 0;
        let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;

        // FORMULA: RealReceivedQty = DB_ReceivedQty + OtherRowsQty(SO)
        let otherRowsQty = GetOtherRowsQtyForSO(jisvohNumber, row);
        let realReceivedQty = receivedQty + otherRowsQty;

        // FORMULA: IsExceeded  <=>  (RealReceivedQty + CurrentQty) > SVO_Qty
        if ((realReceivedQty + originalQty) > jisvoiQty) {


            // FORMULA: AllowedQty = SVO_Qty − RealReceivedQty
            alert("Qty Allowed: " + (jisvoiQty - realReceivedQty));
            setTimeout(function () {
                row.find(".JORNI_Qty")
                    .focus()
                    .select();
                row.find(".JORNI_JOJWI_SVOH_Number").val("0");
                row.find(".JORNI_JOJWI_SVOI_Number_Row").val(0);
            }, 300);


        } else if (jisvohNumber && jisvohNumber !== "0") {
            // NEW: valid selection, within limit — lock the dropdown
           // row.find(".JORNI_JOJWI_SVOH_Number").prop("disabled", true);
        }
    });
});

//#endregion
// FORMULA: OtherRowsQty(SO) = Σ JORNI_Qty  for all rows where RowSO = SO, RowSO ≠ CurrentRow
function GetOtherRowsQtyForSO(jisvohNumber, currentRow) {
    let total = 0;

    // current row's SO + SO item (JW and Freight kept separate)
    let curJwSO = currentRow.find(".JORNI_JOJWI_SVOH_Number").val() || "0";
    let curFrtSO = currentRow.find(".JORNI_JOFRT_SVOH_Number").val() || "0";
    let curJwSvoi = currentRow.find(".JORNI_JOJWI_SVOI_Number_Row").val() || "0";
    let curFrtSvoi = currentRow.find(".JORNI_JOFRT_SVOI_Number_Row").val() || "0";

    let isJW = (curJwSO == jisvohNumber);
    let isFrt = (curFrtSO == jisvohNumber);

    $("#ItemTable tbody tr.NewRow").each(function () {
        let row = $(this);

        if (row.is(currentRow)) return;
        if (row.find(".JORNI_IsDeleted").val() === "1" ||
            row.find(".JORNI_IsDeleted").val() === "true") return;

        let rowQty = parseFloat(removeComma(row.find(".JORNI_Qty").val())) || 0;

        let rowSO = row.find(".JORNI_JOJWI_SVOH_Number").val() || "0";
        let rowSvoi = row.find(".JORNI_JOJWI_SVOI_Number_Row").val() || "0";
        let rowFrtSO = row.find(".JORNI_JOFRT_SVOH_Number").val() || "0";
        let rowFrtSvoi = row.find(".JORNI_JOFRT_SVOI_Number_Row").val() || "0";

        // same SO AND same SO item only
        if (isJW && rowSO == jisvohNumber && rowSvoi == curJwSvoi) {
            total += rowQty;
        } else if (isFrt && rowFrtSO == jisvohNumber && rowFrtSvoi == curFrtSvoi) {
            total += rowQty;
        }
    });

    return total;
}

// JW SO – this row only; keeps already selected SO if still in the new list
function BindServiceOrderRow(row) {

    let $dd = row.find(".JORNI_JOJWI_SVOH_Number");
    let $svoi = row.find(".JORNI_JOJWI_SVOI_Number_Row");
    let oldVal = $dd.val() || "0";
    let vendorId = $("#Header_JORNH_JW_Vendor_Number").val();

    let reqId = (row.data("jwSvoReq") || 0) + 1;
    row.data("jwSvoReq", reqId);

    if (!vendorId) {
        $dd.html('<option value="0"></option>').val("0");
        $svoi.val(0);
        return;
    }

    $.get("/joboutward/transactions/receipt-note/get-service-order", {
        vendorId: vendorId,
        prsNumber: row.find(".JORNI_JPRS_Number").val(),
        itemNumber: row.find(".JORNI_Item_Number").val(),
        uomNumber: row.find(".JORNI_UoM_Number").val()
    }, function (data) {

        if (row.data("jwSvoReq") !== reqId) return;   // only latest response

        $dd.html('<option value="0"></option>');

        let added = {};
        $.each(data, function (_, item) {
            if (!item.value || item.value === "0" || added[item.value]) return;
            added[item.value] = true;
            $dd.append(`<option value="${item.value}" data-jisvoi="${item.jisvoiNumber || 0}">${item.text}</option>`);
        });

        let $old = $dd.find('option[value="' + oldVal + '"]');

        if (oldVal !== "0" && $old.length) {
            $dd.val(oldVal);
            $svoi.val($old.attr("data-jisvoi") || 0);
        } else {
            $dd.val("0");
            $svoi.val(0);
        }
    });
}

// Freight SO – this row only; keeps already selected SO if still in the new list
function BindFreightServiceOrderRow(row) {

    let $dd = row.find(".JORNI_JOFRT_SVOH_Number");
    let $svoi = row.find(".JORNI_JOFRT_SVOI_Number_Row");
    let oldVal = $dd.val() || "0";
    let vendorId = $("#Header_JORNH_JW_Vendor_Number").val();

    let reqId = (row.data("frtSvoReq") || 0) + 1;
    row.data("frtSvoReq", reqId);

    if (!vendorId) {
        $dd.html('<option value="0"></option>').val("0");
        $svoi.val(0);
        return;
    }

    $.get("/joboutward/transactions/receipt-note/get-freight-service-order", {
        vendorId: vendorId,
        uomNumber: row.find(".JORNI_UoM_Number").val(),
        fromWHNumber: row.find(".JORNI_FromWH_Number").val(),
        toWHNumber: row.find(".JORNI_ToWH_Number").val()
    }, function (data) {

        if (row.data("frtSvoReq") !== reqId) return;

        $dd.html('<option value="0"></option>');

        let added = {};
        $.each(data, function (_, item) {
            if (!item.value || item.value === "0" || added[item.value]) return;
            added[item.value] = true;
            $dd.append(`<option value="${item.value}" data-jisvoi="${item.jisvoiNumber || 0}">${item.text}</option>`);
        });

        let $old = $dd.find('option[value="' + oldVal + '"]');

        if (oldVal !== "0" && $old.length) {
            $dd.val(oldVal);
            $svoi.val($old.attr("data-jisvoi") || 0);
        } else {
            $dd.val("0");
            $svoi.val(0);
        }
    });
}

//#region Calculate Total
function CalculateQtyKgDN(row) {
    let qty = parseFloat((row.find(".JORNI_Qty").val() || "0").replace(/,/g, "")) || 0;
    let uomText = row.find(".JORNI_UoM_Number option:selected").text().trim().toUpperCase();

    let qtyKg;
    if (uomText === "KGS") {
        qtyKg = qty * 1;
    } else {
        let fromQty = parseFloat(row.find(".FromQty").val()) || 0;
        let toQty = parseFloat(row.find(".ToQty").val()) || 0;
        qtyKg = fromQty > 0 ? (qty * (toQty / fromQty)) : 0;
    }

    row.find(".JORNI_Qty_Kgs").val(qtyKg === 0 ? "" : addComma(qtyKg, "c"));
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
        if (row.find(".JORNI_IsDeleted").val() === "1" ||
            row.find(".JORNI_IsDeleted").val() === "true") {
            return;
        }

        // Get Qty
        let qty = parseFloat(removeComma(row.find(".JORNI_Qty").val())) || 0;

        // Get Unit Price
        let unitPrice = parseFloat(removeComma(row.find(".JORNI_UnitPrice").val())) || 0;

        // Row Amount = Qty × Unit Price
        let amount = qty * unitPrice;

        // Set row amount field
        row.find(".JORNI_Amount").val(addComma(amount, "c"));

        // Add to totals
        totalQty += qty;
        totalAmount += amount;
        totalQtyKgs += parseFloat(removeComma(row.find(".JORNI_Qty_Kgs").val())) || 0;
    });

    // Footer totals
    $("#TotalQty").val(addComma(totalQty, "q"));
    $("#TotalAmount").val(addComma(totalAmount, "c"));
    $("#TotalQtyKgs").val(addComma(totalQtyKgs, "c"));
}


//#endregion Calculate Total

//#region item grid fetch item details
function OnInputItem(inputElement) {
    searchItemJORNI(inputElement);
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
        $(inputElement).closest("tr").find(".JORNI_Item_Number").val());

    OpenItemCodeSearch(inputElement);
}

function searchItemJORNI(inputElement) {

    let itemCode = inputElement.value;
    let row = $(inputElement).closest("tr");
    let resultsDiv = $("#RightPane_Item").find(".search-results");


    let material = $("#Header_JORNH_MS_Number").val();


    if (!material) return;

    if (itemSearchXHR) {
        itemSearchXHR.abort();
    }

    itemSearchXHR = $.ajax({
        url: '/joboutward/transactions/receipt-note/item',
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
                        row.find(".JORNI_Item_Code").val(item.itemCode);

                        // ✔ Hidden fields
                        row.find(".JORNI_Item_Number").val(item.itemNumber);
                        row.find(".JORNI_Number").val(item.itemNumber);

                        // ✔ Fill details
                        row.find(".JORNI_Item_Description").val(item.itemDescription);
                        row.find(".JORNI_OuterDia").val(item.outerDia);
                        row.find(".JORNI_Thickness").val(item.thickness);
                        row.find(".JORNI_Length").val(item.length);
                        row.find(".JORNI_MaterialGrade").val(item.materialGrade);
                        row.find(".JORNI_ItemGroup").val(item.itemGroup);

                        // ✔ Dropdowns
                        row.find(".JORNI_UoM_Number").val(item.uoM);
                        row.find(".JORNI_WH_Number").val(item.saleWarehouse);
                        row.find(".JORNI_UoM_Number").trigger("change");
                        // ✔ Move to Qty
                        let qtyInput = row.find(".JORNI_Qty");
                        let qtyUnitprice = row.find(".JORNI_UnitPrice");
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
    if ($("#Header_JORNH_RN_No").val().trim() === "") {
        showAlert('Receipt Note No. is required', '#Header_JORNH_RN_No');

        return false;
    }

    // 2. RN Date
    if ($("#Header_JORNH_RN_Date").val().trim() === "") {
        showAlert('Receipt Note Date is required', '#Header_JORNH_RN_Date');

        return false;
    }

    // 2a. Vendor DC No / Date
    if ($("#Header_JORNH_VendorDC_No").val().trim() === "") {
        showAlert('Vendor DC No. is required', '#Header_JORNH_VendorDC_No');

        return false;
    }

    if ($("#Header_JORNH_VendorDC_Date").val().trim() === "") {
        showAlert('Vendor DC Date is required', '#Header_JORNH_VendorDC_Date');

        return false;
    }

    // 3. Material Segregation
    if ($("#Header_JORNH_MS_Number").val() === "" || $("#Header_JORNH_MS_Number").val() === "0") {
        showAlert('Material Segregation is required', '#Header_JORNH_MS_Number');

        return false;
    }

    // 4. JW Vendor
    if ($("#Header_JORNH_JW_Vendor_Number").val().trim() === "" ||
        $("#Header_JORNH_JW_Vendor_Name").val().trim() === "") {

        showAlert('JW Vendor is required', '#Header_JORNH_JW_Vendor_Name');

        return false;
    }

    // 5. Currency
    if ($("#Header_JORNH_Currency_Number").val() === "" || $("#Header_JORNH_Currency_Number").val() === "0") {
        showAlert('Currency is required', '#Header_JORNH_Currency_Number');

        return false;
    }

    // 6. Warehouse
    if ($("#Header_JORNH_WH_Number").val() === "" || $("#Header_JORNH_WH_Number").val() === "0") {
        showAlert('Warehouse is required', '#Header_JORNH_WH_Number');

        return false;
    }

    // =========================
    // GRID VALIDATION CALL
    // =========================
    if (!validateItemGrid()) {
        return false;
    }
    if (!validateReceiptNoteBatchList()) {
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
        if (row.find(".JORNI_IsDeleted").val() === "1") return;

        let process = row.find(".JORNI_JPRS_Number").val();
        let itemCode = row.find(".JORNI_Item_Code").val();
        let qty = row.find(".JORNI_Qty").val();
        let unitPrice = row.find(".JORNI_UnitPrice").val();

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
                row.find(".JORNI_JPRS_Number")
            );
            isValid = false;
            return false; // break loop
        }

        // validate Item Code
        if (!itemCode || itemCode.trim() === "") {
            showAlert('Item Code is required', row.find(".JORNI_Item_Code"));

            isValid = false;
            return false;
        }

        // validate Qty
        if (!qty || qty.trim() === "" || (parseFloat(removeComma(qty)) || 0) <= 0) {
            showAlert('Qty is required', row.find(".JORNI_Qty"));

            isValid = false;
            return false;
        }

        // validate Unit Price
        if (!unitPrice || unitPrice.trim() === "" || (parseFloat(removeComma(unitPrice)) || 0) <= 0) {
            showAlert('Unit Price is required', row.find(".JORNI_UnitPrice"));

            isValid = false;
            return false;
        }

        // NEW: validate From WH / To WH when Freight Applicable is checked
        if (row.find(".JORNI_IsFreightApplicable").is(":checked")) {

            hasFreightRow = true;
            let fromWH = row.find(".JORNI_FromWH_Number").val();
            let toWH = row.find(".JORNI_ToWH_Number").val();

            if (!fromWH || fromWH === "0") {
                showAlert("From WH is required.", row.find(".JORNI_FromWH_Number"));
                isValid = false;
                return false;
            }

            if (!toWH || toWH === "0") {
                showAlert("To WH is required.", row.find(".JORNI_ToWH_Number"));
                isValid = false;
                return false;
            }
        }

    });

    // no valid row added
    if (!hasValidRow) {
        showAlert('Please add at least one item in grid', "#ItemTable tbody tr:first .JORNI_JPRS_Number");
        //row.find(".JORNI_JPRS_Number").focus();
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
            "#ItemTable tbody tr.NewRow:first .JORNI_IsFreightApplicable"
        );
        return false;
    }

    return isValid;
}
//#endregion VALIDATE ITEM GRID

//#region VALIDATE DELIVERY NOTE BATCH LIST
function validateReceiptNoteBatchList() {

    let isValid = true;
    let itemRows = $("#ItemTable tbody tr.NewRow");

    itemRows.each(function (index) {

        let itemRow = $(this);

        // skip deleted rows
        if (itemRow.find(".JORNI_IsDeleted").val() === "1" ||
            itemRow.find(".JORNI_IsDeleted").val() === "true") {
            return;
        }

        // skip rows with no item selected (not a real data row)
        let itemNumber = itemRow.find(".JORNI_Item_Number").val();
        if (!itemNumber || itemNumber === "0") {
            return;
        }

        let rowID = itemRow.attr("data-rowid");

        let batchEntry =
            ReceiptNoteItemBatchList.find(x => x.RowID == rowID);

        let rowNumber = index + 1;

        // no batch saved at all for this item row
        if (!batchEntry || !batchEntry.BatchList || batchEntry.BatchList.length === 0) {
            $("#ModelAlert").off("hidden.bs.modal");
            showAlert(
                "Please enter Received Qty in batch details/Qty mismatch (Item Row " + rowNumber + ")"
            );

            isValid = false;
            return false; // break loop
        }

        // at least ONE batch line for this item must have qty > 0
        let hasAnyValidBatchQty = batchEntry.BatchList.some(function (b) {
            let qty = parseFloat(removeComma(b.JORNI_BCH_QtyReceived)) || 0;
            return qty > 0;
        });

        if (!hasAnyValidBatchQty) {
            $("#ModelAlert").off("hidden.bs.modal");
            showAlert(
                "Please enter Received Qty in batch details/Qty mismatch (Item Row " + rowNumber + ")"
            );

            isValid = false;
            return false; // break loop
        }

        // batch total must equal the item Qty
        let itemQty = parseFloat(removeComma(itemRow.find(".JORNI_Qty").val())) || 0;
        let batchTotal = batchEntry.BatchList.reduce(function (sum, b) {
            return sum + (parseFloat(removeComma(b.JORNI_BCH_QtyReceived)) || 0);
        }, 0);

        if (Math.abs(batchTotal - itemQty) > 0.0001) {
            $("#ModelAlert").off("hidden.bs.modal");
            showAlert(
                "Please enter Received Qty in batch details/Qty mismatch (Item Row " + rowNumber + ")"
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
function CreateTempReceiptBatchModel(row) {

    return {

        DBCH_Number:
            parseInt(row.find(".JORNI_BCH_Number").val()) || 0,

        DBCH_Index:
            parseInt(row.index()) || 0,

        DBCH_DBCH_Number:
            parseInt(row.find(".JORNI_BCH_Number").val()) || null,

        DBCH_Item_Number:
            parseInt($("#Header_JORNI_Item_Number").val()) || 0,

        DBCH_Warehouse_Number:
            parseInt(row.find(".JORNI_BCH_WH_Number").val()) || 0,

        DBCH_Date:
            row.find(".JORNI_BCH_BatchDate").val(),

        DBCH_No:
            row.find(".JORNI_BCH_BatchNo").val(),

        DBCH_Qty:
            parseFloat(
                row.find(".JORNI_BCH_QtyReceived").val()
            ) || 0,

        DBCH_UnitPrice:
            parseFloat(
                row.find(".JORNI_BCH_BatchUnitPrice").val()
            ) || 0,

        DBCH_Value:
            parseFloat(
                row.find(".JORNI_BCH_BatchValue").val()
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
    $(".jwvendor-search-results").hide().html("");

}
//#endregion



//#region itemgrid-qty
// Restrict Qty input to digits only
$(document).on("keypress", ".JORNI_Qty", function (e) {
    let charCode = e.which ? e.which : e.keyCode;
    let charStr = String.fromCharCode(charCode);

    if (!/[0-9]/.test(charStr)) {
        e.preventDefault();
    }
});

// Strip any non-numeric characters that slip in via paste
$(document).on("input", ".JORNI_Qty", function () {
    let cleaned = $(this).val().replace(/[^0-9]/g, "");

    if (cleaned !== $(this).val()) {
        $(this).val(cleaned);
    }
});
//#endregion

//#region itemgrid-unitprice Unit Price Format

//#region Unit Price - decimal only (digits + one dot, max 2 decimals)
const UNITPRICE_INPUT = "#ItemTable .JORNI_UnitPrice";
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
$(document).on("focusout", ".JORNI_Qty, .JORNI_UnitPrice, .JORNI_Amount", function () {

    let type = $(this).hasClass("JORNI_Qty") ? "q" : "c";

    $(this).val(addComma($(this).val(), type));
});
//#endregion

//#endregion

//#region batchgrid-qty
// Restrict Qty input to digits only
$(document).on("keypress", ".JORNI_BCH_QtyReceived", function (e) {
    let charCode = e.which ? e.which : e.keyCode;
    let charStr = String.fromCharCode(charCode);

    if (!/[0-9]/.test(charStr)) {
        e.preventDefault();
    }
});

// Strip any non-numeric characters that slip in via paste
$(document).on("input", ".JORNI_BCH_QtyReceived", function () {
    let cleaned = $(this).val().replace(/[^0-9]/g, "");

    if (cleaned !== $(this).val()) {
        $(this).val(cleaned);
    }
});
//#endregion
