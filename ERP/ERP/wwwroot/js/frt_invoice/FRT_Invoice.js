// FORMULA: OtherRowsQty(SO) = Σ FRTII_Qty  for all rows where RowSO = SO, RowSO ≠ CurrentRow
function GetOtherRowsQtyForSO(jisvohNumber, currentRow) {
    let total = 0;

    $("#TableBody tr.NewRow").each(function () {
        let row = $(this);

        if (row.is(currentRow)) return;
        if (row.attr("data-deleted") === "1") return;

        // CHANGED: .FRTII_ServiceOrder_Number only exists on dropdown/INVOICE
        // rows — DELIVERY NOTE (label) rows have no such element, so .val()
        // returned undefined and their qty was never counted. .FRTII_ServiceOrderHidden
        // exists on every row regardless of label/dropdown.
        let rowSO = row.find(".FRTII_ServiceOrderHidden").val() || 0;

        if (rowSO == jisvohNumber) {
            total += parseFloat(removeCommas(row.find(".FRTII_Qty").val())) || 0;
        }
    });

    return total;
}

$(document).ready(function () {
    //#region JW_Customer – Focus In
    // Handled via inline onfocus (ShowCustomerPane/OnBuyerSelectCall
    // or equivalent) in the .cshtml — no delegated binding needed.
    //#endregion

    //#region JW_Customer – Text change
    // Handled via inline oninput (OnBuyerInput or equivalent) in the
    // .cshtml.
    //#endregion

    //#region JW_Customer – Focus Out
    $(document).on("focusout", "#Header_FRTIH_JW_Customer_Name", function () {
        if (isMouseSelectingBuyer)
            return;
        let input = $(this);
        let rows = $("#RightPane .buyer-search-results tbody tr");

        if ($.trim(input.val()) === "" && rows.length > 0 &&
            !rows.filter(".current-row, .match-row").length) {

            isMouseSelectingBuyer = true;
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
    // 1. Tab/Enter – auto-select or "Too many choices" (Tab via Focus Out)
    // 2. Arrow Up – highlight + move to top match
    // 3. Arrow Down – highlight + move to bottom match
    // 4. Enter/Escape, no record selected -> auto-select first record + close popup
    $(document).on("keydown", "#Header_FRTIH_JW_Customer_Name", function (e) {

        if (e.key !== "ArrowDown" && e.key !== "ArrowUp" &&
            e.key !== "Enter" && e.key !== "Escape") {
            return;
        }

        let input = $(this);
        let rows = $("#RightPane .buyer-search-results tbody tr");

        if ((e.key === "Enter" || e.key === "Escape") &&
            $.trim(input.val()) === "" && rows.length > 0 &&
            !rows.filter(".current-row, .match-row").length) {

            e.preventDefault();

            isMouseSelectingBuyer = true;
            rows.first().trigger("mousedown");
            return;
        }

        if (e.key === "Escape" || e.key === "Enter") {
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

});
//#region address width
const DeliveryNoteAddressFields = [
    { cls: ".JIDNA_ADTP_Number", min: 10, max: 25, align: "left", extraPadding: 20 },
    { cls: ".JIDNA_Address_ID", min: 10, max: 25, align: "left", extraPadding: 20 },
    { cls: ".JIDNA_Address", min: 40, max: 40, align: "left" },
    { cls: ".JIDNA_City", min: 10, max: 25, align: "left" },
    { cls: ".JIDNA_State", min: 10, max: 25, align: "left" },
    { cls: ".JIDNA_Country", min: 10, max: 25, align: "left" },
    { cls: ".JIDNA_PIN", min: 10, max: 10, align: "left" },
    { cls: ".JIDNA_GSTIN", min: 15, max: 15, align: "left" }
];
//#endregion
const ItemTableFields = [
    { cls: ".FRTII_ServiceOrder_Number", min: 20, max: 25, align: "left" },    // Service Order Number
    { cls: ".FRTII_DN_No", min: 20, max: 25, align: "left" },    // Delivery Note Number
    { cls: ".FRTII_Process", min: 10, max: 25, align: "left" },    // Process
    { cls: ".FRTII_ItemCode", min: 10, max: 15, align: "left" },    // Item Code
    { cls: ".FRTII_ItemDescription", min: 40, max: 40, align: "left" },    // Description

    { cls: ".FRTII_OuterDia", min: 8, max: 8, align: "center" },  // Outer Dia
    { cls: ".FRTII_Thickness", min: 8, max: 8, align: "center" },  // Thickness
    { cls: ".FRTII_Length", min: 8, max: 8, align: "center" },  // Length
    { cls: ".FRTII_Width", min: 8, max: 8, align: "center" },  // Width

    { cls: ".FRTII_MaterialGrade", min: 10, max: 25, align: "left" },    // Material Grade
    { cls: ".FRTII_ItemGroup", min: 10, max: 30, align: "left" },    // Item Group
    { cls: ".FRTII_UoM", min: 10, max: 15, align: "center" },  // UoM

    { cls: ".FRTII_DeliveredQty", min: 10, max: 20, align: "center" },  // Delivery Note Qty
    { cls: ".FRTII_PrevInvoiceQty", min: 10, max: 20, align: "center" },  // Already Invoiced Qty
    { cls: ".FRTII_Qty", min: 10, max: 20, align: "center" },  // Invoice Qty

    { cls: ".FRTII_UnitPrice", min: 10, max: 20, align: "right" },   // Unit Price
    { cls: ".FRTII_UnitPriceLabel", min: 10, max: 20, align: "right" },
    { cls: ".FRTII_Amount", min: 13, max: 25, align: "right" },   // Amount

    { cls: ".FRTII_SAC_Number", min: 8, max: 8, align: "left" },    // SAC
    { cls: ".FRTII_GST_Amount", min: 13, max: 25, align: "right" }    // GST Amount
];
$(window).on("load", function () {
    setTimeout(function () {

        ApplyFieldWidths({
            fields: ItemTableFields,          // Only this column
            container: "#ItemTable",
            tableBody: "#TableBody"
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
function ResizeColumns() {
    ApplyFieldWidths({
        fields: ItemTableFields,
        container: "#ItemTable",      
        tableBody: "#TableBody" 
    });
}
 

//#region item grid alignment
// Converts characters (ch) to pixels
// 1ch = width of the "0" character in the current font
let isMouseSelectingBuyer = false;
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
function HighlightRow(rows, index) {

    rows.removeClass("current-row");

    if (index < 0 || index >= rows.length)
        return;

    $(rows[index]).addClass("current-row");

    rows[index].scrollIntoView({
        block: "nearest"
    });
}
var DeliveryNoteMap = {};
var ReceiptNoteMap = {};   // NEW: mirrors DeliveryNoteMap for RN-sourced rows
let ItemGSTMap = {};
let CurrentGSTRow = null;

function AutoFit() {
    fitInputWidth("Header_FRTIH_InvoiceNo", 20, 25);
    fitInputWidth("Header_FRTIH_MS_Number", 20, 30);
    fitInputWidth("Header_SourceCategory", 20, 30);
    fitInputWidth("Header_FRTIH_JW_Customer_Name", 40, 50);
    fitInputWidth("Header_FRTIH_Currency_Number", 10, 10);
    fitInputWidth("Header_FRTIH_TCT_Number", 20, 25);
    fitInputWidth("Header_FRTIH_PaymentTerms", 30, 40);
    fitInputWidth("Header_FRTIH_PaymentMethod", 30, 40);
    fitInputWidth("Header_FRTIH_Remarks", 40, 40);
}

function ResizeColumn(control) {

    const field = ItemTableFields.find(f => $(control).is(f.cls));

    if (!field)
        return;

    ApplyFieldWidths({
        fields: [field],          // Only this column
        container: "#ItemTable",
        tempRow: "#TempRow",
        tableBody: "#TableBody" 
    });
}
function LoadDefaultFormSetting() {
    $.ajax({
        url: '/jobinward/transactions/jobwork-invoice/get',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response && response.success && response.data) {
                var data = response.data;

                if (data.dfS_FRTIH_JW_Customer_Number) {
                    $('#Header_FRTIH_JW_Customer_Number').val(data.dfS_FRTIH_JW_Customer_Number);
                    $('#Header_FRTIH_JW_Customer_Name').val(data.cuS_Name);
                }
                if (data.dfS_FRTIH_Currency_Number) {
                    $('#Header_FRTIH_Currency_Number').val(data.dfS_FRTIH_Currency_Number).trigger('change');
                }
                if (data.dfS_FRTIH_TCT_Number) {
                    $('#Header_FRTIH_TCT_Number').val(data.dfS_FRTIH_TCT_Number).trigger('change');
                }
                if (data.dfS_FRTIH_PaymentTerms) {
                    $('#Header_FRTIH_PaymentTerms').val(data.dfS_FRTIH_PaymentTerms);
                }
                if (data.dfS_FRTIH_PaymentMethod) {
                    $('#Header_FRTIH_PaymentMethod').val(data.dfS_FRTIH_PaymentMethod);
                }
                if (data.dfS_FRTIH_Remarks) {
                    $('#Header_FRTIH_Remarks').val(data.dfS_FRTIH_Remarks);
                }
                if (data.dfS_FRTIH_MS_Number) {
                    $('#Header_FRTIH_MS_Number').val(data.dfS_FRTIH_MS_Number).trigger('change');
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
    //#region item grid alignment
    $(document).on("input", "#ItemTable input", function () {
        ResizeColumn(this);
    });

    $(document).on("change", "#ItemTable select", function () {
        ResizeColumn(this);
    });
    //#endregion
    //#region comma format on focusout
    $(document).on("focusout",
        ".FRTII_DeliveredQty, .FRTII_PrevInvoiceQty, .FRTII_Qty, .FRTII_UnitPrice, .FRTII_Amount, .FRTII_GST_Amount",
        function () {
            let isQty = $(this).is(".FRTII_DeliveredQty, .FRTII_PrevInvoiceQty, .FRTII_Qty");
            let type = isQty ? "q" : "c";
            $(this).val(addComma($(this).val(), type));
        });
    //#endregion
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
        "#BuyerAddress .JIDNA_Address, " +
        "#BuyerAddress .JIDNA_City, " +
        "#BuyerAddress .JIDNA_State, " +
        "#BuyerAddress .JIDNA_Country, " +
        "#BuyerAddress .JIDNA_PIN, " +
        "#BuyerAddress .JIDNA_GSTIN",
        function () {
            ResizeAddressColumns();
        });
    //#endregion
    $(document).on("input", "#ItemTable input", function () {
        ResizeColumns();
    });

    $(document).on("change", "#ItemTable select", function () {
        ResizeColumns();
    });
 
    //#region item grid alignment

    //#endregion

    AutoFit();

    //#region Header AutoFit - KeyUp
    $(document).on("keyup change input",
        "#Header_FRTIH_InvoiceNo, #Header_FRTIH_MS_Number, #Header_SourceCategory, #Header_FRTIH_JW_Customer_Name, #Header_FRTIH_Currency_Number, #Header_FRTIH_TCT_Number, #Header_FRTIH_PaymentTerms, #Header_FRTIH_PaymentMethod, #Header_FRTIH_Remarks",
        function () {

            const widths = {
                Header_FRTIH_InvoiceNo: [20, 25],
                Header_FRTIH_MS_Number: [20, 30],
                Header_SourceCategory: [20, 30],
                Header_FRTIH_JW_Customer_Name: [40, 50],
                Header_FRTIH_Currency_Number: [10, 10],
                Header_FRTIH_TCT_Number: [20, 25],
                Header_FRTIH_PaymentTerms: [30, 40],
                Header_FRTIH_PaymentMethod: [30, 40],
                Header_FRTIH_Remarks: [40, 40]
            };

            const [min, max] = widths[this.id];
            fitInputWidth(this, min, max);
        });
    //#endregion

    //#region Header_FRTIH_JW_Customer_Name
    // JW_Customer – Focus Out: moved to <script> block
    // JW_Customer – Keydown: moved to <script> block
    //#endregion

    //#region call service order onclick
    $(document).on("focus", ".FRTII_ServiceOrder_Number", function () {
        console.log("dropdown focused");

        let dropdown = $(this);
        LoadServiceOrderDropdown(dropdown);
    });
    //#endregion




   


    

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
    $(document).on("click", "#btnClearAll", function () {
        ClearAll();
    });
    
 
   // LoadJWCAddress();
  //  LoadServiceOrders();
    //#region CLICK ADDRESS BUTTON, ADD ADDRESS ROW, DELETE ADDRESS ROW
    $("#AddressButton").click(function () {

        var count = GetVisibleAddressRowCount();
        console.log('--visibleRowCount--' + count);
        if (count === 0) {
            LoadJWCAddress();
        } else {
            ShowBuyerAddressPopup();
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

    //#endregion CLICK ADDRESS BUTTON, ADD ADDRESS ROW, DELETE ADDRESS ROW
    $(document).on('click', '#RemoveItemRowButton', function () {

        //#region REMOVE CHECKED ROWS

        $("#TableBody tr.NewRow").each(function () {

            var isChecked = $(this)
                .find(".CheckItem")
                .is(":checked");

            if (isChecked) {

                $(this).hide();
                $(this).attr("data-deleted", "1");
                CheckAndRemoveEmptyHeaders();
            }

        });

        //#endregion

    });


    $("#Header_FRTIH_InvoiceDate").on("change", function () {
       // console.log("Date changed:", $(this).val());

        loadTaxCluster(); // your function
      
    });
    $("#Header_FRTIH_JW_Customer_Number").change(function () {
        LoadServiceOrders();
    });

    //#region gst popup

    $(document).on('click', '.GSTView', function () {
        let CheckedCheckbox = document.querySelector('.CheckItem:checked');
        if (CheckedCheckbox) {
            var currentRow = $(CheckedCheckbox).closest('tr.NewRow');
            CurrentGSTRow = currentRow.index();
            var ItemNumber = currentRow.find('input.FRTII_Item_Number').val();
            //var Index = currentRow.find('input.SII_Index').val();
            var SACNumber = currentRow.find('input.SAC_Number').val();
           

            var Cluster = $("#Header_FRTIH_TCT_Number").val();
            var SIHDate = $("#Header_FRTIH_InvoiceDate").val();

            var qty = parseFloat(removeCommas(currentRow.find("input.FRTII_Qty").val())) || 0;
            var unitPrice = parseFloat(removeCommas(currentRow.find("input.FRTII_UnitPrice").val())) || 0;
            var Amount = parseFloat(removeCommas(currentRow.find("input.FRTII_Amount").val())) || 0;

            var BaseAmount = parseFloat(removeCommas(Amount)) ;

            if (ItemNumber && SACNumber) {
                $.ajax({
                    type: "get",
                    url: "/gst/view",
                    data: { Cluster: Cluster, SIHDate: SIHDate, SAC: SACNumber, BaseAmount: BaseAmount },
                  
                   
                    success: function (data) {
                        const Table = document.getElementById('GSTTableView');
                        Table.innerHTML = "";

                        if (Table) {
                            const TaxView = ClusterTaxView(data);
                            Table.appendChild(TaxView);
                        }

                        new bootstrap.Modal($("#GSTView")).show();
                        $('#GSTView').on('shown.bs.modal', function () {
                            $(this).find('[autofocus]').focus();
                        });
                    }
                });
            }
        }
    });

    //#endregion

    $(document).on("keyup change", ".FRTII_Qty, .FRTII_UnitPrice", function () {

        var row = $(this).closest("tr");

        var qty = parseFloat(removeCommas(row.find(".FRTII_Qty").val())) || 0;
        var unitPrice = parseFloat(removeCommas(row.find(".FRTII_UnitPrice").val())) || 0;

        var amount = qty * unitPrice;

        row.find(".FRTII_Amount").val(addComma(amount, "c"));

        CalculateTotals();
    });

    $(document).on("keyup change", ".FRTII_Qty", function () {

        var row = $(this).closest("tr");

        var deliveredQty = parseFloat(removeCommas(row.find(".FRTII_DeliveredQty").val())) || 0;
        var prevInvoiceQty = parseFloat(removeCommas(row.find(".FRTII_PrevInvoiceQty").val())) || 0;
        var currentQty = parseFloat(removeCommas(row.find(".FRTII_Qty").val())) || 0;

        var balanceQty = deliveredQty - prevInvoiceQty;

        // Validation
        if (currentQty > balanceQty) {

            alert("Current Invoice Qty cannot exceed Balance Qty (" + balanceQty + ")");

            row.find(".FRTII_Qty").val(addComma(balanceQty, "q"));

            currentQty = balanceQty;

        } else {


            let jisvohNumber = row.find(".FRTII_ServiceOrderHidden").val() || 0;
            console.log('---if value is there in so:' + jisvohNumber)
            if (jisvohNumber > 0) {
                GetAllowedQty(
                    jisvohNumber,
                   40008,
                    row.find(".FRTII_Item_Number").val() || 0,
                    row.find(".FRTII_UoM_Number").val() || 0,
                    function (allowedQty) {

                        // CHANGED: subtract qty already used by OTHER rows
                        // in this form for the same SO
                        let otherRowsQty = GetOtherRowsQtyForSO(jisvohNumber, row);
                        let realAllowedQty = allowedQty - otherRowsQty;

                        console.log("Allowed Qty:", realAllowedQty);

                        if (currentQty > realAllowedQty) {
                            // CHANGED: field now shows the allowed qty
                            row.find(".FRTII_Qty").val(addComma(realAllowedQty, "q"));
                            alert("Qty Allowed: " + realAllowedQty);
                        }
                    }
                );
            }
        }

        // Prevent negative values
        if (currentQty < 0) {

            row.find(".FRTII_Qty").val(addComma(0, "q"));

            currentQty = 0;

        }

        var unitPrice = parseFloat(removeCommas(row.find(".FRTII_UnitPrice").val())) || 0;

        var amount = currentQty * unitPrice;

        row.find(".FRTII_Amount").val(addComma(amount, "c"));

        CalculateTotals();

    });

    $(document).on("input change", ".FRTII_Qty, .FRTII_UnitPrice", async function () {

        const $row = $(this).closest("tr");

        const qty = parseFloat(removeCommas($row.find(".FRTII_Qty").val())) || 0;

        const unitPrice = parseFloat(removeCommas($row.find(".FRTII_UnitPrice").val())) || 0;

        const baseAmount = qty * unitPrice;

        const cluster = $("#Header_FRTIH_TCT_Number").val();

        const invoiceDate = $("#Header_FRTIH_InvoiceDate").val();

        const sacNumber = $row.find("input.SAC_Number").val();

        let gstAmount = 0;

        if (cluster && sacNumber) {

            gstAmount = await GetGSTAmount(
                cluster,
                invoiceDate,
                sacNumber,
                baseAmount
            );
        }

        gstAmount = addComma(parseFloat(gstAmount || 0), "c");

        $row.find(".FRTII_GST_Amount").val(gstAmount);

    });

    DateBind();
});

function GetAllowedQty(jisvohNumber, prsNumber, itemNumber, uomNumber, callback) {
    $.get("/DeliveryNote/CheckDeliveredQtyExceededFreight", {
        jisvohNumber: jisvohNumber,
        prsNumber: prsNumber,
        itemNumber: itemNumber,
        uomNumber: uomNumber
    }, function (res) {

        if (!res || res.length === 0) {
            callback(0);
            return;
        }

        let deliveredQty = parseFloat(res[0].deliveredQty) || 0;
        let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;

        let allowedQty = jisvoiQty - deliveredQty;

        callback(allowedQty);
    });
}

function DateBind() {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var formattedDate = day + "-" + months[today.getMonth()] + "-" + today.getFullYear();

    var fp = document.getElementById("Header_FRTIH_InvoiceDate")._flatpickr;
    if (fp) fp.setDate(formattedDate, true, "d-M-Y");
    GetJWInvoiceNumber();
}
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
 
async function GetGSTAmount(cluster, invoiceDate, sacNumber, baseAmount) {

    const response = await $.ajax({

        url: '/income/gst',

        type: 'GET',

        data: {
            Cluster: cluster,
            SIHDate: invoiceDate,
            SAC: sacNumber,
            BaseAmount: baseAmount
        }

    });

    return response;
}
function CalculateTotals() {

    var totalDeliveredQty = 0;
    var totalPrevInvoiceQty = 0;
    var totalQty = 0;
    var totalAmount = 0;
    var totalGSTAmount = 0;

    $("#TableBody tr.NewRow:visible").each(function () {

        totalDeliveredQty += parseFloat(removeCommas($(this).find(".FRTII_DeliveredQty").val())) || 0;
        totalPrevInvoiceQty += parseFloat(removeCommas($(this).find(".FRTII_PrevInvoiceQty").val())) || 0;
        totalQty += parseFloat(removeCommas($(this).find(".FRTII_Qty").val())) || 0;
        totalAmount += parseFloat(removeCommas($(this).find(".FRTII_Amount").val())) || 0;
        totalGSTAmount += parseFloat(removeCommas($(this).find(".FRTII_GST_Amount").val())) || 0;
    });
    setTimeout(function () {

        ApplyFieldWidths({
            fields: ItemTableFields,          // Only this column
            container: "#ItemTable",
            tableBody: "#TableBody"
        });

    }, 200);
    $("#TotalDeliveredQty").val(addComma(totalDeliveredQty, "q"));
    $("#TotalPrevInvoiceQty").val(addComma(totalPrevInvoiceQty, "q"));
    $("#TotalQty").val(addComma(totalQty, "q"));
    $("#TotalAmount").val(addComma(totalAmount, "c"));
    $("#TotalGSTAmount").val(addComma(totalGSTAmount, "c"));

}

function ClusterTaxView(data) {
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered', 'table-hover', 'align-middle', 'w-100', 'mb-0');

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    const headers = ["Tax Category", "Tax Type", "Tax Index", "Tax Element", "Assessable Value", "Tax Rate", "Tax Amount", "Load on Inventory", "Load on Inventory %",];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.classList.add('table-info');

        if (headerText.includes('Assessable Value') || headerText.includes('Tax Rate') || headerText.includes('Tax Amount') || headerText.includes('Load on Inventory %')) {
            th.classList.add('text-end', 'table-width-xl');
        } else if (headerText.includes('Tax Index') || headerText.includes('Load on Inventory')) {
            th.classList.add('text-center', 'table-width-md');
        }

        headerRow.appendChild(th);
    });

    const tbody = table.createTBody();
    let totalAssessable = 0;
    let totalTaxAmount = 0;


    data.forEach(tax => {
        const row = tbody.insertRow();
        // ADD HERE
        row.dataset.gstc = tax.gstcNumber;
        row.dataset.gstt = tax.gsttNumber;
        row.dataset.gste = tax.gsteNumber;
        row.dataset.taxindex = tax.taxIndex;
        const CategoryCell = row.insertCell();
        const TypeCell = row.insertCell();
        const TaxIndexCell = row.insertCell();
        const TaxElementCell = row.insertCell();
        const AssessableCell = row.insertCell();
        const PercentageCell = row.insertCell();
        const AmountCell = row.insertCell();
        const LoadonCell = row.insertCell();
        const LoadonPerCell = row.insertCell();

        CategoryCell.textContent = tax.taxCategory;
        TypeCell.textContent = tax.taxType;

        TaxIndexCell.textContent = tax.taxIndex;
        TaxIndexCell.classList.add("text-center", "table-width-md");

        TaxElementCell.textContent = tax.taxElement;

        AssessableCell.textContent = tax.assessableValue.toFixed(2);
        AssessableCell.classList.add("text-end", "table-width-xl");

        PercentageCell.textContent = tax.percentage.toFixed(2);
        PercentageCell.classList.add("text-end", "table-width-xl");

        AmountCell.textContent = tax.amount.toFixed(2);
        AmountCell.classList.add("text-end", "table-width-xl");

        LoadonCell.textContent = tax.loadonInventory;
        LoadonCell.classList.add("text-center", "table-width-md");

        LoadonPerCell.textContent = tax.loadonInventoryPercent;
        LoadonPerCell.classList.add("text-end", "table-width-xl");

        totalAssessable += tax.assessableValue;
        totalTaxAmount += tax.amount;
    });

    const tfoot = table.createTFoot();
    const footerRow = tfoot.insertRow();

    const footerCells = headers.map(() => footerRow.insertCell());
    footerCells.forEach(cell => {
        cell.classList.add('table-info');
    });

    footerCells[footerCells.length - 4].textContent = `Total`;
    footerCells[footerCells.length - 4].style.textAlign = 'right';
    footerCells[footerCells.length - 3].textContent = totalTaxAmount.toFixed(2);
    footerCells[footerCells.length - 3].style.textAlign = 'right';

    return table;
}

function loadTaxCluster() {

    var customerNumber = $("#Header_FRTIH_JW_Customer_Number").val();
    var invoiceDate = $("#Header_FRTIH_InvoiceDate").val();

    if (customerNumber === "" || invoiceDate === "") {
        return;
    }

    $.ajax({
        url: '/FreightInvoice/Get_Freight_Invoice_Taxcluster',
        type: 'GET',
        data: {
            JWC_Number: customerNumber,
            CheckDate: invoiceDate
        },

        success: function (data) {

            var ddl = $("#Header_FRTIH_TCT_Number");

            ddl.empty();
      

            $.each(data, function (i, item) {

                ddl.append(
                    $('<option>', {
                        value: item.jwC_GST_TCT_Number,
                        text: item.cuS_GST_TCT_Name
                    })
                );
            });
        }
    });
}
$(document).on("change", "#Header_FRTIH_InvoiceDate", function () {
    GetJWInvoiceNumber();
});  //#region GetJWInvoiceNumber

function GetJWInvoiceNumber() {

    let date = $("#Header_FRTIH_InvoiceDate").val();

    if (!date)
        return;

    $.ajax({
        url: "/freightinvoice/transactions/freightinvoice/next-frti-number",
        type: "GET",
        data: { FRTIDate: date },
        success: function (response) {
            if (!response || response.trim() === "") {
               alert("Please set numbering for this date range.");
                $("#Header_FRTIH_InvoiceNo").val("");
                DateBind();

                return;
            }

            $("#Header_FRTIH_InvoiceNo").val(response);

        },
        error: function () {
        }
    });
}
//#endregion
//#region customer Search Functions
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
    var SIHDate = $("input[name='Header.FRTIH_InvoiceDate']").val();
    var resultsDiv = $("#RightPane").find(".buyer-search-results");

    if (buyerSearchXHR) {
        buyerSearchXHR.abort();
    }

    buyerSearchXHR = $.ajax({
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

                    // Removed: duplicate row "click" handler (raced
                    // with the "mousedown" handler below; also used
                    // SelectBuyer id args without "#" prefixes, so
                    // SelectBuyer's own $(id) lookups silently
                    // matched nothing).
                });

                table.find("tbody").on("mousedown", "tr", function (e) {

                    e.preventDefault();

                    const clickedCust = $(this).data("customer");
                    isMouseSelectingBuyer = true;

                    SelectBuyer(
                        clickedCust,
                        "#Header_FRTIH_JW_Customer_Name",
                        "#Header_FRTIH_JW_Customer_Number",
                        "#Header_FRTIH_Currency_Name",
                        "#Header_FRTIH_Currency_Number",
                        "#Header_FRTIH_WH_Number",
                        "#RightPane",
                        ".buyer-search-results"
                    );

                    $("#BuyerMessage").hide().text("");

                    $("#Header_FRTIH_JW_Customer_Number").val(clickedCust.cuS_Number);
                    $("#Header_FRTIH_Currency_Number").val(clickedCust.cuS_CUR_Number);
                    $("#Header_FRTIH_JW_Customer_Name").val(clickedCust.cuS_Name);
                    $("#Header_FRTIH_Currency_Name").val(clickedCust.cuS_CUR_Number);

                    $("#RightPane").removeClass("show");
                    $("#RightPane .buyer-search-results").hide();

                    setTimeout(function () {
                        $("#Header_FRTIH_Currency_Number").focus();
                        isMouseSelectingBuyer = false;
                        loadTaxCluster();
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


//#endregion customer Search Functions

 
//#endregion customer Search Functions



//#region validate unit price
function ValidateUnitPriceAndAmount() {

    var isValid = true;
    var message = "";

    $("#TableBody tr.NewRow").each(function (index) {

        var row = $(this);

        if (row.attr("data-deleted") === "1")
            return true;

        var unitPrice = parseFloat(
            removeCommas(row.find(".FRTII_UnitPrice").val())
        ) || 0;

        var amount = parseFloat(
            removeCommas(row.find(".FRTII_Amount").val())
        ) || 0;

        row.removeClass("error-row");

        if (unitPrice <= 0) {

            row.addClass("error-row");

            message =
                "Row " + (index + 1) +
                " : Unit Price cannot be 0";

            row.find(".FRTII_UnitPrice").focus();

            isValid = false;
            return false;
        }

        if (amount <= 0) {

            row.addClass("error-row");

            message =
                "Row " + (index + 1) +
                " : Amount cannot be 0";

            row.find(".FRTII_Amount").focus();

            isValid = false;
            return false;
        }
    });

    if (!isValid) {
     
        showAlert(message);
        return false;
    }

    return true;
}
//#endregion
//#region Save Function
function ValidateItemTable() {
    let hasRow = false;

    $("#ItemTable tbody tr.NewRow").each(function () {
        let row = $(this);

        if (row.attr("data-deleted") != "1") {
            hasRow = true;
            return false;
        }
    });

    if (!hasRow) {
        return "At least one item row is required";
    }

    return "";
}
function validateHeaderById() {

    // 1. Invoice No
    if ($("#Header_FRTIH_InvoiceNo").val().trim() === "") {

        showAlert(
            'Invoice No is required',
            '#Header_FRTIH_InvoiceNo'
        );

        return false;
    }

    // 2. Invoice Date
    if ($("#Header_FRTIH_InvoiceDate").val().trim() === "") {

        showAlert(
            'Invoice Date is required',
            '#Header_FRTIH_InvoiceDate'
        );

        return false;
    }

    // 3. JW Customer
    if (
        $("#Header_FRTIH_JW_Customer_Number").val().trim() === "" ||
        $("#Header_FRTIH_JW_Customer_Number").val() === "0" ||
        $("#Header_FRTIH_JW_Customer_Name").val().trim() === ""
    ) {

        showAlert(
            'JW Customer is required',
            '#Header_FRTIH_JW_Customer_Name'
        );

        return false;
    }

    // 4. Currency
    if (
        $("#Header_FRTIH_Currency_Number").val() === "" ||
        $("#Header_FRTIH_Currency_Number").val() === "0"
    ) {

        showAlert(
            'Currency is required',
            '#Header_FRTIH_Currency_Number'
        );

        return false;
    }

    // 5. Terms & Conditions
    if (
        $("#Header_FRTIH_TCT_Number").val() === "" ||
        $("#Header_FRTIH_TCT_Number").val() === "0"
    ) {

        showAlert(
            'Terms & Conditions is required',
            '#Header_FRTIH_TCT_Number'
        );

        return false;
    }
    // 5. Message / MS
    if (
        $("#Header_FRTIH_MS_Number").val() === "" ||
        $("#Header_FRTIH_MS_Number").val() === "0"
    ) {

        showAlert(
            'Material Seggregation is required',
            '#Header_FRTIH_MS_Number'
        );

        return false;
    }


    return true;
}

$("#btnSave").on("click", function (e) {

    if (!validateHeaderById()) {

        e.preventDefault();
        return false;
    } if (!ValidateUnitPriceAndAmount()) {
        e.preventDefault();
        return false;
    }
    let itemValidation = ValidateItemTable();
    if (itemValidation) {
        e.preventDefault();
        showAlert(itemValidation);
        return false;
    }
    else {

        var model = CreateFreightInvoiceModel();

        console.log(JSON.stringify(model));

        $.ajax({

            url: '/FreightInvoice/SaveFreightInvoice',

            type: 'POST',

            contentType: 'application/json',

            data: JSON.stringify(model),

            success: function (response) {

                if (response.success) {
                    $('#ModelAlert').one('hidden.bs.modal', function () {
                        location.reload();
                    });
                    showAlert('Record Inserted');
                    //window.location.href = response.redirectUrl;

                //    console.log(JSON.stringify(model));
                }
            },

            error: function (xhr) {

                console.log(xhr.responseText);

            }

        });

    }

});

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

//#region CREATE MODEL

function CreateFreightInvoiceItemModel() {

    var items = [];

    $("#ItemTable tbody tr.NewRow").each(function () {

        let row = $(this);

        if (row.attr("data-deleted") == "1") {
            return;
        }
        console.log('service order dropdown value---'+row.find(".FRTII_ServiceOrderHidden").val());
        let item = {

            FRTII_Number:
                parseInt(row.find(".FRTII_Number").val()) || 0, 
            FRTII_ServiceOrder_Number:
                row.find(".FRTII_ServiceOrderHidden").val() || "",

            FRTII_Item_Number:
                parseInt(row.find(".FRTII_Item_Number").val()) || 0,

            FRTII_DN_No:
                row.find(".FRTII_DN_No").val(),

            FRTII_Process:
                row.find(".PRS_ProcessName").val(),

            FRTII_ItemCode:
                row.find(".FRTII_ItemCode").val(),

            FRTII_ItemDescription:
                row.find(".FRTII_ItemDescription").val(),

            FRTII_OuterDia:
                parseFloat(row.find(".FRTII_OuterDia").val()) || 0,

            FRTII_Thickness:
                parseFloat(row.find(".FRTII_Thickness").val()) || 0,

            FRTII_Length:
                parseFloat(row.find(".FRTII_Length").val()) || 0,

            FRTII_Width:
                parseFloat(row.find(".FRTII_Width").val()) || 0,

            FRTII_MaterialGrade:
                row.find(".FRTII_MaterialGrade").val(),

            FRTII_ItemGroup:
                row.find(".FRTII_ItemGroup").val(),

            FRTII_UoM_Number:
                parseInt(row.find(".FRTII_UoM_Number").val()) || 0,

            FRTII_Qty:
                parseFloat(removeCommas(row.find(".FRTII_Qty").val())) || 0,

            FRTII_UnitPrice:
                parseFloat(removeCommas(row.find(".FRTII_UnitPrice").val())) || 0,

            FRTII_Amount:
                parseFloat(removeCommas(row.find(".FRTII_Amount").val())) || 0,

            FRTII_SAC_Number:
                parseInt(row.find(".SAC_Number").val()) || 0,
            FRTII_GST_Amount:
                parseFloat(removeCommas(row.find(".FRTII_GST_Amount").val())) || 0,

            FRTII_PRS_Number:
               40008,

            FRTII_JIDNH_Number:
                parseInt(row.find(".FRTII_JIDNH_Number").val()) || 0,

            JIDNI_Number:
                parseInt(row.find(".JIDNI_Number").val()) || 0,
            FRTII_SO_Assign:
                row.find(".FRTII_SO_AssignFlag").val() || "INVOICE",
            JISVOI_Number:
                parseInt(row.find(".Freight_ServiceOrder_Number").val()) || 0,
            FRTII_SourceCategory:
                row.attr("data-source") === "RN" ? "RECEIPT NOTE" : "DELIVERY NOTE",
        };

        items.push(item);
    });

    return items;
}


function CreateFreightInvoiceModel() {

    //=====================================
    // HEADER
    //=====================================

    var header = {

        FRTIH_Number:
            parseInt($("#Header_FRTIH_Number").val()) || 0,

        FRTIH_InvoiceNo:
            $("#Header_FRTIH_InvoiceNo").val(),

        FRTIH_InvoiceDate:
            new Date($("#Header_FRTIH_InvoiceDate").val())
                .toISOString(),
        FRTIH_MS_Number:
            parseInt($("#Header_FRTIH_MS_Number").val()) || 0,
        FRTIH_JW_Customer_Number:
            parseInt($("#Header_FRTIH_JW_Customer_Number").val()) || 0,

        FRTIH_Currency_Number:
            parseInt($("#Header_FRTIH_Currency_Number").val()) || 0,

        FRTIH_TCT_Number:
            parseInt($("#Header_FRTIH_TCT_Number").val()) || 0,

        FRTIH_PaymentTerms:
            $("#Header_FRTIH_PaymentTerms").val(),

        FRTIH_PaymentMethod:
            $("#Header_FRTIH_PaymentMethod").val(),

        FRTIH_Remarks:
            $("#Header_FRTIH_Remarks").val(),

        FRTIH_SourceCategory:
            $("#Header_SourceCategory").val() === "RN" ? "RECEIPT NOTE" : "DELIVERY NOTE"
    };


    // =====================================
    // ADDRESS
    // =====================================
    var addresses = [];

    $("#AddTableBody tr.AddNewRow").each(function () {

        let row = $(this);

        console.log("Rows found:", $("#AddTableBody tr.AddNewRow:visible").length);
        console.log("Address ID =", row.find(".JIDNA_Address_ID").val());
        console.log("Address =", row.find(".JIDNA_Address").text());
        console.log("City =", row.find(".JIDNA_City").val());
        console.log("State =", row.find(".JIDNA_State").val());

        // Skip deleted rows
        if (row.find(".JIDNA_IsDeleted").val() == "1") {
            return true; // continue next row
        }

        // Skip empty rows
        if (!row.find(".JIDNA_Address_ID").val()) {
            return true;
        } let address = {
            FRTIA_FRTIH_Number:
                parseInt(row.find(".JIDNA_JIDNH_Number").val()) || 0,

            FRTIA_Number:
                parseInt(row.find(".JIDNA_Number").val()) || 0,

            FRTIA_ADTP_Number:
                parseInt(row.find(".JIDNA_ADTP_Number").val()) || 0,

            FRTIA_Address_ID:
                row.find(".JIDNA_Address_ID").val() || "",

            FRTIA_Address:
                row.find(".JIDNA_Address").text() || "",

            FRTIA_City:
                row.find(".JIDNA_City").val() || "",

            FRTIA_State:
                row.find(".JIDNA_State").val() || "",

            FRTIA_Country:
                row.find(".JIDNA_Country").val() || "",

            FRTIA_PIN:
                row.find(".JIDNA_PIN").val() || "",

            FRTIA_GSTIN:
                row.find(".JIDNA_GSTIN").val() || ""
        };
        addresses.push(address);
    });

    console.log(addresses);

    //=====================================
    // FINAL MODEL
    //=====================================

    var jobworkInvoiceModel = {

        Header: header,
        Items: CreateFreightInvoiceItemModel(),
        Addresses: addresses

    };

    console.log(jobworkInvoiceModel);

    return jobworkInvoiceModel;
}

//#endregion
function GetDistinctDeliveryNoteHeaders() {

    var headerIds = [];

    $("#TableBody tr.NewRow[data-source='DN']").each(function () {

        var headerId = $(this).attr("data-dn");

        var isDeleted = $(this).attr("data-deleted");

        // ONLY ACTIVE ROWS
        if (isDeleted != "1") {

            if ($.inArray(headerId, headerIds) === -1) {

                headerIds.push(headerId);

            }

        }

    });

    return headerIds;

}

// NEW: mirrors GetDistinctDeliveryNoteHeaders() for RN-sourced rows
function GetDistinctReceiptNoteHeaders() {

    var headerIds = [];

    $("#TableBody tr.NewRow[data-source='RN']").each(function () {

        var headerId = $(this).attr("data-dn");

        var isDeleted = $(this).attr("data-deleted");

        if (isDeleted != "1") {

            if ($.inArray(headerId, headerIds) === -1) {

                headerIds.push(headerId);

            }

        }

    });

    return headerIds;

}
function CheckAndRemoveEmptyHeaders() {

    $.each(DeliveryNoteMap, function (headerId, itemIds) {

        var activeCount = 0;

        itemIds.forEach(function (itemId) {

            var row = $("#TableBody tr.NewRow[data-item='" + itemId + "']");

            if (row.length > 0 &&
                row.attr("data-deleted") != "1") {

                activeCount++;

            }

        });

        // ALL ITEMS DELETED
        if (activeCount == 0) {

            // REMOVE ROWS
            $("#TableBody tr.NewRow[data-dn='" + headerId + "']")
                .remove();

            // UNCHECK DELIVERY NOTE
            $(".deliverynote-checkbox[value='" + headerId + "']")
                .prop("checked", false);

            // UNCHECK RECOVER
            $(".item-delete-checkbox[value='" + headerId + "']")
                .prop("checked", false);

            // REMOVE MAP
            delete DeliveryNoteMap[headerId];

        }

    });

    // NEW: mirrors the DeliveryNoteMap cleanup above, for RN-sourced rows
    $.each(ReceiptNoteMap, function (headerId, itemIds) {

        var activeCount = 0;

        itemIds.forEach(function (itemId) {

            var row = $("#TableBody tr.NewRow[data-item='" + itemId + "']");

            if (row.length > 0 &&
                row.attr("data-deleted") != "1") {

                activeCount++;

            }

        });

        if (activeCount == 0) {

            $("#TableBody tr.NewRow[data-dn='" + headerId + "'][data-source='RN']")
                .remove();

            $(".receiptnote-checkbox[value='" + headerId + "']")
                .prop("checked", false);

            $(".rn-item-delete-checkbox[value='" + headerId + "']")
                .prop("checked", false);

            delete ReceiptNoteMap[headerId];

        }

    });

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
    var Buyer = $('#Header_FRTIH_JW_Customer_Number').val(); // keep if same field exists

    var ADDAddress = currentRow.find('.JIDNA_Address');
    var ADDCity = currentRow.find('.JIDNA_City');
    var ADDState = currentRow.find('.JIDNA_State');
    var ADDCountry = currentRow.find('.JIDNA_Country');
    var ADDPin = currentRow.find('.JIDNA_PIN');
    var ADDGSTIN = currentRow.find('.JIDNA_GSTIN');

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

            var AddressID = data.buyerAddressId;
            var AddressDefault = data.buyerAddress;

            var $AddressDropdown = currentRow.find('.JIDNA_Address_ID');

            // reset dropdown
            $AddressDropdown.empty();
            $AddressDropdown.append($('<option>', {
                value: '',
                text: ''
            }));

            // fill address list
            AddressID.forEach(function (item) {
                $AddressDropdown.append($('<option>', {
                    value: item.buY_ADD_AddressID,
                    text: item.buY_ADD_AddressID
                }));
            });

            // set default + fill fields
            if (AddressDefault != null) {
                $AddressDropdown.val(AddressDefault.buY_ADD_AddressID);

                ADDAddress.text(AddressDefault.buY_ADD_Address);
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

let addressIndex = 0;

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
        .text("")
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

//#region jwc address
function LoadJWCAddress() {
    var jwcNumber = $("#Header_FRTIH_JW_Customer_Number").val();

    $.ajax({
        url: '/FreightInvoice/GetJWCAddress',
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
                row.find(".JIDNA_Address").text(addr.jwC_ADD_Address);
                row.find(".JIDNA_City").val(addr.jwC_ADD_City);
                row.find(".JIDNA_State").val(addr.jwC_ADD_State);
                row.find(".JIDNA_Country").val(addr.jwC_ADD_Country);
                row.find(".JIDNA_PIN").val(addr.jwC_ADD_PIN);
                row.find(".JIDNA_GSTIN").val(addr.jwC_ADD_GSTIN);

                row.show();
            });

            ShowBuyerAddressPopup();
        }
    });
}

function ShowBuyerAddressPopup() {

    ResizeAddressColumns();

    $("#BuyerAddress")
        .off("shown.bs.modal.resize")
        .one("shown.bs.modal.resize", function () {
            ResizeAddressPopup();
        });

    $("#BuyerAddress").modal("show");
}

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

//#endregion


//#region items
//#region callsp service orderdropdown filter
function LoadServiceOrderDropdown(dropdown) {

    let row = $(dropdown).closest("tr");

    let customerId = $("#Header_FRTIH_JW_Customer_Number").val();
    let prsNumber = 40008;
    let itemNumber = row.find(".FRTII_Item_Number").val();
    let uomNumber = row.find(".FRTII_UoM_Number").val();

    // NEW: pass the row's own source category (falls back to the
    // row's data-source attribute; the Category dropdown alone isn't
    // reliable here since a row keeps its original source even if the
    // header dropdown is later switched)
    let category = row.attr("data-source") === "RN" ? "RECEIPT NOTE" : "DELIVERY NOTE";

    console.log(row.find(".FRTII_PRS_Number").length);
    console.log(row.find(".FRTII_Item_Number").length);
    console.log(row.find(".FRTII_UoM_Number").length);
    $.ajax({
        url: "/DeliveryNote/GetServiceOrder",
        type: "GET",
        data: {
            customerId: customerId,
            prsNumber: prsNumber,
            itemNumber: itemNumber,
            uomNumber: uomNumber,
            category: category
        },
        success: function (response) {
            console.log('--what is response---' + JSON.stringify(response));

            let options = '<option value="0"></option>';

            $.each(response, function (_, item) {
               
                if (!item.value || item.value === "" || item.value === "0") return;

                options += `<option value="${item.value}">
                            ${item.text}
                        </option>`;
            });

            
            let previousValue = row.find(".FRTII_ServiceOrderHidden").val() || "0";

            $(dropdown).html(options);
            $(dropdown).val(previousValue);
 
            if (!$(dropdown).val() || $(dropdown).val() === "0") {
                row.find(".FRTII_ServiceOrderItem_Number").val(0);
                row.find(".FRTII_UnitPrice").val(0).prop("readonly", false);
                row.find(".FRTII_Amount").val(0).prop("readonly", false);
            }
        }, error: function (xhr, status, error) {

            if (status === "abort") return;   // NEW: ignore aborted calls

            console.log("AJAX Error");
            console.log("Status:", status);
            console.log("Error:", error);
            console.log("Response:", xhr.responseText);

            // alert("Failed to load Service Orders.");
        }
    });
}
//#endregion

//#region SOURCE CATEGORY TOGGLE
$("#Header_SourceCategory").change(function () {
    var category = $(this).val();

    if (category === "RN") {
        $("#LoadDeliveryNote").hide();
        $("#LoadReceiptNote").show();
    } else {
        $("#LoadReceiptNote").hide();
        $("#LoadDeliveryNote").show();
    }
});
//#endregion

//#region LOAD DELIVERY NOTE ITEMS
$("#LoadDeliveryNote").click(function () {

   


    // 4. Material Segregation
    if (
        $("#Header_FRTIH_MS_Number").val() === "" ||
        $("#Header_FRTIH_MS_Number").val() === "0"
    ) {
        showAlert(
            'Material Seggregation is required',
            '#Header_FRTIH_MS_Number'
        );
        return false;
    }
    // 3. JW Customer
    if (
        $("#Header_FRTIH_JW_Customer_Number").val().trim() === "" ||
        $("#Header_FRTIH_JW_Customer_Number").val() === "0" ||
        $("#Header_FRTIH_JW_Customer_Name").val().trim() === ""
    ) {

        showAlert(
            'JW Customer is required',
            '#Header_FRTIH_JW_Customer_Name'
        );

        return false;
    }
    LoadDeliveryNoteItems();
});
function ResizeDeliveryNotePopup() {

    const table = document.querySelector("#DeliveryNoteTableView table");
    const dialog = document.querySelector("#DNView .modal-dialog");

    if (!table || !dialog) return;

    // Actual table width
    let tableWidth = table.offsetWidth;

    // Add padding for modal body
    tableWidth += 60;

    // Minimum and maximum width
    tableWidth = Math.max(500, tableWidth);
    tableWidth = Math.min(window.innerWidth - 40, tableWidth);

    dialog.style.maxWidth = tableWidth + "px";
    dialog.style.width = tableWidth + "px";
}
// Load delivery note items from SP and fill table
function LoadDeliveryNoteItems() {

    var customerNumber = $("#Header_FRTIH_JW_Customer_Number").val();
    var msNumber = $("#Header_FRTIH_MS_Number").val();
    var resultsDiv = $("#DeliveryNoteTableView");
    var headers = GetDistinctDeliveryNoteHeaders();


    $.ajax({

        url: '/FreightInvoice/GetDeliveryNote_GroupItemFreight',

        type: 'GET',

        data: {
            CustomerNumber: customerNumber,
            MSNumber: msNumber
        },

        success: function (response) {

            if (response && response.length > 0) {

                resultsDiv.empty();

                //#region TABLE

                var tableHTML = `
    <table class="table table-bordered mb-0 table-hover table-grid">

        <thead>

            <tr class="table-info">

                <th class="px-2 del"></th>

                <th>Delivery Note No</th>

                <th>Delivery Note Date</th>

              

                <th class="text-end">Qty</th>

                <th class="text-center">
                    Recover Deleted Item
                </th>

            </tr>

        </thead>

        <tbody></tbody>

    </table>`;

                var table = $(tableHTML);

                //#endregion

                //#region ROW BINDING

                response.forEach(function (DN) {

                    //#region MAIN CHECKBOX

                    var checkboxCell = $('<td class="px-2 del text-center"></td>');

                    var checkbox = $('<input type="checkbox" class="form-check-input deliverynote-checkbox">');

                    checkbox.val(DN.jidnH_Number);

                    //#region AUTO CHECK IF EXISTS IN GRID

                    if ($.inArray(DN.jidnH_Number.toString(), headers) !== -1) {

                        checkbox.prop('checked', true);

                    }

                    //#endregion

                    checkboxCell.append(checkbox);

                    //#endregion

                    //#region ITEM CHECKBOX

                    var itemCheckboxCell = $('<td class="px-2 del text-center"></td>');

                    var itemCheckbox = $('<input type="checkbox" class="form-check-input item-delete-checkbox">');

                    itemCheckbox.val(DN.jidnH_Number);


                    itemCheckboxCell.append(itemCheckbox);

                    //#endregion

                    //#region ROW

                    var row = $('<tr class="DNCheck"></tr>');

                    row.append(checkboxCell);

                    row.append('<td>' + DN.jidnH_DN_No + '</td>');

                    row.append('<td>' + DN.jidnH_DN_Date + '</td>');

                    row.append('<td class="text-center">' + parseFloat(DN.totalQty) + '</td>');

                    row.append(itemCheckboxCell);

                    table.find('tbody').append(row);

                    //#endregion

                });

                //#endregion

                var getButton = $(`
                    <div class="w-100 p-2 text-center">

                        <button type="button"
                                class="btn btn-primary"
                                id="GetDeliveryNote">
                            Get
                        </button>

                    </div>`);

                resultsDiv.append(table);

                resultsDiv.append(getButton);

                resultsDiv.find('#GetDeliveryNote').on('click', function () {

                    var selectedDN = $.map(
                        table.find('.deliverynote-checkbox:checked'),
                        function (c) {
                            return c.value;
                        }
                    );
                    // REMOVE UNCHECKED DELIVERY NOTE ROWS

                    $("#TableBody tr.NewRow").each(function () {

                        var dn = $(this).attr("data-dn");

                        if ($.inArray(dn, selectedDN) === -1) {

                            var dn = $(this).attr("data-dn");

                            $(this).remove();

                            delete DeliveryNoteMap[dn];

                        }

                    });
                    // RECOVER HIDDEN ROWS


                    // ✅ Selected recovered/active item checkboxes
                    var selectedRecoveredItems = $.map(
                        table.find('.item-delete-checkbox:checked'),
                        function (c) {
                            return c.value;
                        }
                    );
                    selectedRecoveredItems.forEach(function (dnNo) {

                        $("#TableBody tr.NewRow")
                            .filter("[data-dn='" + dnNo + "'][data-deleted='1']")
                            .show()
                            .attr("data-deleted", "0");

                    });
                    console.log(selectedDN);

                    var selectedDNString = selectedDN.join(',');
                    var recoveredString = selectedRecoveredItems.join(',');

                    InsertDeliveryNoteItems(selectedDNString, selectedRecoveredItems, selectedDN);

                    $("#DNView").modal('hide');

                });
                // Resize popup based on table width
                ResizeDeliveryNotePopup();
                $("#DNView").modal('show');
            }
            else {

                resultsDiv.html(`
                    <div class="text-center p-3">

                        No Delivery Note Found

                    </div>`);

            }

        }

    });

}
//#endregion

//#region LOAD RECEIPT NOTE ITEMS (NEW: mirrors LOAD DELIVERY NOTE ITEMS above)
$("#LoadReceiptNote").click(function () {

    // Material Segregation
    if (
        $("#Header_FRTIH_MS_Number").val() === "" ||
        $("#Header_FRTIH_MS_Number").val() === "0"
    ) {
        showAlert(
            'Material Seggregation is required',
            '#Header_FRTIH_MS_Number'
        );
        return false;
    }
    // JW Customer
    if (
        $("#Header_FRTIH_JW_Customer_Number").val().trim() === "" ||
        $("#Header_FRTIH_JW_Customer_Number").val() === "0" ||
        $("#Header_FRTIH_JW_Customer_Name").val().trim() === ""
    ) {

        showAlert(
            'JW Customer is required',
            '#Header_FRTIH_JW_Customer_Name'
        );

        return false;
    }
    LoadReceiptNoteItems();
});
function ResizeReceiptNotePopup() {

    const table = document.querySelector("#ReceiptNoteTableView table");
    const dialog = document.querySelector("#RNView .modal-dialog");

    if (!table || !dialog) return;

    let tableWidth = table.offsetWidth;

    tableWidth += 60;

    tableWidth = Math.max(500, tableWidth);
    tableWidth = Math.min(window.innerWidth - 40, tableWidth);

    dialog.style.maxWidth = tableWidth + "px";
    dialog.style.width = tableWidth + "px";
}
// Load receipt note items from SP and fill table
function LoadReceiptNoteItems() {

    var customerNumber = $("#Header_FRTIH_JW_Customer_Number").val();
    var msNumber = $("#Header_FRTIH_MS_Number").val();
    var resultsDiv = $("#ReceiptNoteTableView");
    var headers = GetDistinctReceiptNoteHeaders();


    $.ajax({

        url: '/FreightInvoice/GetReceiptNote_GroupItemFreight',

        type: 'GET',

        data: {
            CustomerNumber: customerNumber,
            MSNumber: msNumber
        },

        success: function (response) {

            if (response && response.length > 0) {

                resultsDiv.empty();

                var tableHTML = `
    <table class="table table-bordered mb-0 table-hover table-grid">

        <thead>

            <tr class="table-info">

                <th class="px-2 del"></th>

                <th>Receipt Note No</th>

                <th>Receipt Note Date</th>

                <th class="text-end">Qty</th>

                <th class="text-center">
                    Recover Deleted Item
                </th>

            </tr>

        </thead>

        <tbody></tbody>

    </table>`;

                var table = $(tableHTML);

                response.forEach(function (RN) {

                    var checkboxCell = $('<td class="px-2 del text-center"></td>');

                    var checkbox = $('<input type="checkbox" class="form-check-input receiptnote-checkbox">');

                    checkbox.val(RN.jirnH_Number);

                    if ($.inArray(RN.jirnH_Number.toString(), headers) !== -1) {

                        checkbox.prop('checked', true);

                    }

                    checkboxCell.append(checkbox);

                    var itemCheckboxCell = $('<td class="px-2 del text-center"></td>');

                    var itemCheckbox = $('<input type="checkbox" class="form-check-input rn-item-delete-checkbox">');

                    itemCheckbox.val(RN.jirnH_Number);

                    itemCheckboxCell.append(itemCheckbox);

                    var row = $('<tr class="RNCheck"></tr>');

                    row.append(checkboxCell);

                    row.append('<td>' + RN.jirnH_RN_No + '</td>');

                    row.append('<td>' + RN.jirnH_RN_Date + '</td>');

                    row.append('<td class="text-center">' + parseFloat(RN.totalQty) + '</td>');

                    row.append(itemCheckboxCell);

                    table.find('tbody').append(row);

                });

                var getButton = $(`
                    <div class="w-100 p-2 text-center">

                        <button type="button"
                                class="btn btn-primary"
                                id="GetReceiptNote">
                            Get
                        </button>

                    </div>`);

                resultsDiv.append(table);

                resultsDiv.append(getButton);

                resultsDiv.find('#GetReceiptNote').on('click', function () {

                    var selectedRN = $.map(
                        table.find('.receiptnote-checkbox:checked'),
                        function (c) {
                            return c.value;
                        }
                    );

                    $("#TableBody tr.NewRow[data-source='RN']").each(function () {

                        var rn = $(this).attr("data-dn");

                        if ($.inArray(rn, selectedRN) === -1) {

                            $(this).remove();

                            delete ReceiptNoteMap[rn];

                        }

                    });

                    var selectedRecoveredItems = $.map(
                        table.find('.rn-item-delete-checkbox:checked'),
                        function (c) {
                            return c.value;
                        }
                    );
                    selectedRecoveredItems.forEach(function (rnNo) {

                        $("#TableBody tr.NewRow[data-source='RN']")
                            .filter("[data-dn='" + rnNo + "'][data-deleted='1']")
                            .show()
                            .attr("data-deleted", "0");

                    });

                    var selectedRNString = selectedRN.join(',');

                    InsertReceiptNoteItems(selectedRNString, selectedRecoveredItems, selectedRN);

                    $("#RNView").modal('hide');

                });

                ResizeReceiptNotePopup();
                $("#RNView").modal('show');
            }
            else {

                resultsDiv.html(`
                    <div class="text-center p-3">

                        No Receipt Note Found

                    </div>`);

            }

        }

    });

}
//#endregion

function GetSONOptions() {
    let options = '';
    let isFirst = true;

    sonList.forEach(function (item) {
        if (item.Value !== '') {
            options += `<option value="${item.Value}" ${isFirst ? 'selected' : ''}>
                            ${item.Text}
                        </option>`;
            isFirst = false;
        }
    });

    return options;
}
function LoadServiceOrders() {

    var customerNumber =
        $("#Header_FRTIH_JW_Customer_Number").val();

    $.ajax({
        url: '/ServiceOrder/GetServiceOrderHead',
        type: 'GET',
        data: {
            customerNumber: customerNumber
        },
        success: function (response) {
            sonList = response;
            console.log(sonList);
        }
    });
}


function OnServiceOrderChange(ele) {

    var row = $(ele).closest("tr");
    row.find(".FRTII_ServiceOrderHidden").val($(ele).val());
    row.find(".FRTII_SO_AssignFlag").val("INVOICE"); // NEW: manual pick = direct SO invoice
    var serviceOrderNo = $(ele).val();
    var prsNumber = 40008;
    var itemNumber = row.find(".FRTII_Item_Number").val();
    var uomNumber = row.find(".FRTII_UoM_Number").val();

    $.ajax({
        url: '/FreightInvoice/GetServiceOrderItemInfo',
        type: 'GET',
        data: {
            Freight_ServiceOrder_Number: serviceOrderNo,
            PRS_Number: prsNumber,
            Item_Number: itemNumber,
            UoM_Number: uomNumber
        },
        success: function (response) {
            console.log(response);
            console.log(JSON.stringify(response));

            var unitPriceBox = row.find(".FRTII_UnitPrice");
            var amountBox = row.find(".FRTII_Amount");
            var serviceOrderItemBox = row.find(".Freight_ServiceOrder_Number");

            if (!response) {

                serviceOrderItemBox.val(0);   // added

                unitPriceBox.val("")
                    .prop("readonly", false);

                amountBox.val("")
                    .prop("readonly", false);

                return;
            }

            // Set Freight_ServiceOrder_Number
            serviceOrderItemBox.val(response.jisvoI_Number || 0);

            // Unit Price
            if (response.unitPrice == null || response.unitPrice === "") {
                unitPriceBox.val("")
                    .prop("readonly", false);
            }
            else {
                unitPriceBox.val(response.unitPrice);
                unitPriceBox.trigger("input");
                unitPriceBox.trigger("change");
                unitPriceBox.prop("readonly", true);
              //  row.find(".FRTII_ServiceOrder_Number").prop("disabled", true);
                unitPriceBox.off("keydown keypress paste")
                    .on("keydown keypress paste", function (e) {
                        e.preventDefault();
                    });
              
            }

            // Amount
            //if (response.amount == null || response.amount === "") {
            //    amountBox.val("")
            //        .prop("readonly", false);
            //}
            //else {
            //    amountBox.val(response.amount);
            //    amountBox.trigger("input");
            //    amountBox.trigger("change");
            //    amountBox.prop("readonly", true);
            //    amountBox.off("keydown keypress paste")
            //        .on("keydown keypress paste", function (e) {
            //            e.preventDefault();
            //        });
            //}
        },
        error: function (err) {
            alert(JSON.stringify(err))
            console.log(err);
            console.log(JSON.stringify(err));
        }
    });
}
function InsertDeliveryNoteItems(selectedDNString, selectedRecoveredItems, selectedDN) {

    var customerNumber = $("#Header_FRTIH_JW_Customer_Number").val();

    $.ajax({

        url: '/FreightInvoice/GetDeliveryNote_ForFreightInvoice',

        type: 'GET',

        data: {
            CustomerNumber: customerNumber,
            DNNumbers: selectedDNString
        },

        success: function (response) {

            console.log(response);

            $.each(response, function (index, item) {
                console.log('---first select---' + item)
                console.log(JSON.stringify(item));
                var headerId = item.jidnI_JIDNH_Number.toString();

                var itemId = item.jidnI_Number.toString();

                if (!DeliveryNoteMap[headerId]) {

                    DeliveryNoteMap[headerId] = [];

                }

                if ($.inArray(itemId, DeliveryNoteMap[headerId]) === -1) {

                    DeliveryNoteMap[headerId].push(itemId);

                }

                //#region DUPLICATE CHECK (VISIBLE + HIDDEN BOTH)

                let existingRow = $("#TableBody tr.NewRow").filter(function () {

                    var DNItemNumber = $(this)
                        .find(".JIDNI_Number")
                        .val();

                    return DNItemNumber == item.jidnI_Number;

                }).first();


                // ✅ check recovered list
                let isRecovered = selectedRecoveredItems &&
                    selectedRecoveredItems.includes(item.jidnI_JIDNH_Number.toString());


                if (existingRow.length > 0) {
                    // recover deleted row
                    if (isRecovered &&
                        existingRow.attr("data-deleted") == "1") {
                        existingRow
                            .show()
                            .attr("data-deleted", "0");
                    }
                    return; // skip re-adding a row that's already in the table
                }

                //#endregion



                //#region ROW COUNT ONLY VISIBLE

                var rowCount = $("#TableBody tr.NewRow").length;

                //#endregion
                var deliveredQty = parseFloat(item.jidnI_Qty) || 0;

                var prevInvoiceQty = parseFloat(item.invoicedQty) || 0;

                var currentInvoiceQty = Math.max(
                    0,
                    deliveredQty - prevInvoiceQty
                );

                var deliveredQtyDisplay = addComma(deliveredQty, "q");
                var prevInvoiceQtyDisplay = addComma(prevInvoiceQty, "q");
                var currentInvoiceQtyDisplay = addComma(currentInvoiceQty, "q");
                //#region condition
                let serviceOrderCell =
                    (item.hasServiceOrder == 1
                        ? `<label class="form-control FRTII_ServiceOrderLabel">
               ${item.serviceOrderNo ?? ''}
           </label>`
                        : `<select name="Items[${rowCount}].FRTII_ServiceOrder_Number"
                  onchange="OnServiceOrderChange(this)"
                  class="form-select FRTII_ServiceOrder_Number">
           </select>`)
                    +
                    `<input name="Items[${rowCount}].FRTII_ServiceOrder_Number"
            type="hidden"
            value="${item.serviceOrderId ?? item.jisvoH_Number ?? 0}"
            class="FRTII_ServiceOrderHidden" />`
                    +
                    // NEW: mirrors Jobwork's JISVII_SO_Assign — needed by
                    // the qty double-count-prevention formula
                    `<input name="Items[${rowCount}].FRTII_SO_Assign"
            type="hidden"
            value="${item.hasServiceOrder == 1 ? 'DELIVERY NOTE' : 'INVOICE'}"
            class="FRTII_SO_AssignFlag" />`;


                let unitPriceDisplay = addComma(item.jisvoI_UnitPrice ?? 0, "c");

                let unitPriceCell = item.hasServiceOrder == 1
                    ? `<label class="form-control FRTII_UnitPriceLabel">${unitPriceDisplay} </label>
       <input name="Items[${rowCount}].ServiceOrderId" type="hidden" value="${item.serviceOrderId ?? 0}" class="ServiceOrderId" />
       <input name="Items[${rowCount}].FRTII_UnitPrice" type="hidden" value="${item.jisvoI_UnitPrice ?? 0}" class="FRTII_UnitPrice" />`
                    : `<input name="Items[${rowCount}].FRTII_UnitPrice" value="${unitPriceDisplay}" class="form-control FRTII_UnitPrice" />`;
                //#endregion


                var row = `

<tr class="NewRow"
    data-rowid="${rowCount + 1}"
    data-dn="${item.jidnI_JIDNH_Number}"
    data-item="${item.jidnI_Number}"
    data-source="DN"
    data-deleted="0">

    <td class="p-2 del">

        <input type="checkbox"
               class="CheckItem form-check-input">

    </td>

    

    <!-- SERVICE ORDER -->
   <td>
    ${serviceOrderCell}
</td>

    <!-- DELIVERY NOTE -->
    <td>

        <input name="Items[${rowCount}].FRTII_DN_No"
               value="${item.jidnH_DN_No ?? ''}"
               class="form-control FRTII_DN_No"
               readonly />

    </td>

    <!-- PROCESS -->
    <td>

        <input name="Items[${rowCount}].PRS_ProcessName"
               value="${item.prS_ProcessName ?? ''}"
               class="form-control PRS_ProcessName"
               readonly />

    </td>

    <!-- ITEM CODE -->
    <td>

        <!-- DELIVERY NOTE HEADER -->
        <input type="hidden"
               value="${item.jidnI_JIDNH_Number}"
               class="FRTII_JIDNH_Number" />
         
        <!-- ITEM NUMBER -->
        <input name="Items[${rowCount}].FRTII_Number"
               type="hidden"
               value="${item.jidnI_Number}"
               class="FRTII_Number" />
               
        <input name="Items[${rowCount}].Freight_ServiceOrder_Number"
       type="hidden"
       value="${item.jisvoI_Number ?? 0}"
       class="Freight_ServiceOrder_Number" />

               <input name="Items[${rowCount}].JIDNI_Number"
               type="hidden"
               value="${item.jidnI_Number}"
               class="JIDNI_Number" />

        <!-- ITEM -->
        <input name="Items[${rowCount}].FRTII_Item_Number"
               type="hidden"
               value="${item.jidnI_Item_Number}"
               class="FRTII_Item_Number" />

                    <input name="Items[${rowCount}].FRTII_PRS_Number"
               type="hidden"
               value="${item.jidnI_PRS_Number}"
               class="FRTII_PRS_Number" />

                    <input name="Items[${rowCount}].FRTII_UoM_Number"
               type="hidden"
               value="${item.jidnI_UoM_Number}"
               class="FRTII_UoM_Number" />
               

        <input name="Items[${rowCount}].FRTII_ItemCode"
               value="${item.itemCode ?? ''}"
               class="form-control FRTII_ItemCode"
               readonly />

    </td>

    <!-- DESCRIPTION -->
    <td>

        <input name="Items[${rowCount}].FRTII_ItemDescription"
               value="${item.itemDescription ?? ''}"
               class="form-control FRTII_ItemDescription"
               readonly />

    </td>

    <!-- OUTER DIA -->
    <td>

        <input name="Items[${rowCount}].FRTII_OuterDia"
               value="${item.outerDia ?? ''}"
               class="form-control FRTII_OuterDia"
               readonly />

    </td>

    <!-- THICKNESS -->
    <td>

        <input name="Items[${rowCount}].FRTII_Thickness"
               value="${item.thickness ?? ''}"
               class="form-control FRTII_Thickness"
               readonly />

    </td>

    <!-- LENGTH -->
    <td>

        <input name="Items[${rowCount}].FRTII_Length"
               value="${item.length ?? ''}"
               class="form-control FRTII_Length"
               readonly />

    </td>

    <!-- WIDTH -->
    <td>

        <input name="Items[${rowCount}].FRTII_Width"
               value="${item.itm_Width ?? ''}"
               class="form-control FRTII_Width"
               readonly />

    </td>

    <!-- MATERIAL GRADE -->
    <td>

        <input name="Items[${rowCount}].FRTII_MaterialGrade"
               value="${item.materialGrade ?? ''}"
               class="form-control FRTII_MaterialGrade"
               readonly />

    </td>

    <!-- ITEM GROUP -->
    <td>

        <input name="Items[${rowCount}].FRTII_ItemGroup"
               value="${item.itemGroup ?? ''}"
               class="form-control FRTII_ItemGroup"
               readonly />

    </td>

    <!-- UOM -->
    <td>

        <input name="Items[${rowCount}].FRTII_UoM"
               value="${item.uom ?? ''}"
               class="form-control FRTII_UoM text-center"
               readonly />

    </td>

    <!-- QTY 1 -->
    <td style="text-align:center !important;">

        <input name="Items[${rowCount}].FRTII_Qty"
               type="hidden"
               value="${item.jidnI_Qty ?? 0}" />

       
             <input
               value="${deliveredQtyDisplay}"
               class="form-control FRTII_DeliveredQty" />

    </td>

    <!-- QTY 2 -->
    <td style="text-align:center !important;">

        <input name="Items[${rowCount}].FRTII_Qty"
               type="hidden"
               value="${item.invoicedQty}" />

      
           <input  
               value="${prevInvoiceQtyDisplay}"
               class="form-control FRTII_PrevInvoiceQty" />


    </td>

    <!-- EDITABLE QTY -->
    <td>

        <input name="Items[${rowCount}].FRTII_Qty"
               value="${currentInvoiceQtyDisplay}"
               class="form-control FRTII_Qty" />

    </td>

    <!-- UNIT PRICE -->
   <td>
    ${unitPriceCell}
</td>

    <!-- AMOUNT -->
    <td>

        <input name="Items[${rowCount}].FRTII_Amount"
              value="${addComma(0, "c")}"
               class="form-control FRTII_Amount"
               readonly />

    </td>

    <!-- SAC -->
    <td>
     <input name="Items[${rowCount}].SAC_Number"
               value="${item.saC_Number ?? 0}"   type="hidden"
               class="form-control SAC_Number" />

    
           <input
               value="${item.sac ?? 0}"
               class="form-control SAC" />

    </td>

    <!-- GST -->
    <td>

        <input name="Items[${rowCount}].FRTII_GST_Amount"
             value="${addComma(0, "c")}"
               class="form-control FRTII_GST_Amount"
               readonly />

    </td>

</tr>`;

                $("#TableBody").append(row);
               

            });
            $("#TableBody .FRTII_Qty").trigger("change");
            $("#TableBody .FRTII_UnitPrice").trigger("change");
            CalculateTotals();

        }

    });

}


//#endregion

//#region LOAD RECEIPT NOTE ITEMS (NEW: mirrors INSERT DELIVERY NOTE ITEMS above)
function InsertReceiptNoteItems(selectedRNString, selectedRecoveredItems, selectedRN) {

    var customerNumber = $("#Header_FRTIH_JW_Customer_Number").val();

    $.ajax({

        url: '/FreightInvoice/GetReceiptNote_ForFreightInvoice',

        type: 'GET',

        data: {
            CustomerNumber: customerNumber,
            RNNumbers: selectedRNString
        },

        success: function (response) {

            $.each(response, function (index, item) {

                var headerId = item.jirnI_JIRNH_Number.toString();

                var itemId = item.jirnI_Number.toString();

                if (!ReceiptNoteMap[headerId]) {

                    ReceiptNoteMap[headerId] = [];

                }

                if ($.inArray(itemId, ReceiptNoteMap[headerId]) === -1) {

                    ReceiptNoteMap[headerId].push(itemId);

                }

                //#region DUPLICATE CHECK (VISIBLE + HIDDEN BOTH)

                let existingRow = $("#TableBody tr.NewRow[data-source='RN']").filter(function () {

                    var RNItemNumber = $(this)
                        .find(".JIDNI_Number")
                        .val();

                    return RNItemNumber == item.jirnI_Number;

                }).first();

                let isRecovered = selectedRecoveredItems &&
                    selectedRecoveredItems.includes(item.jirnI_JIRNH_Number.toString());

                if (existingRow.length > 0) {
                    if (isRecovered &&
                        existingRow.attr("data-deleted") == "1") {
                        existingRow
                            .show()
                            .attr("data-deleted", "0");
                    }
                    return;
                }

                //#endregion

                var rowCount = $("#TableBody tr.NewRow").length;

                var receivedQty = parseFloat(item.jirnI_Qty) || 0;

                var prevInvoiceQty = parseFloat(item.invoicedQty) || 0;

                var currentInvoiceQty = Math.max(
                    0,
                    receivedQty - prevInvoiceQty
                );

                var receivedQtyDisplay = addComma(receivedQty, "q");
                var prevInvoiceQtyDisplay = addComma(prevInvoiceQty, "q");
                var currentInvoiceQtyDisplay = addComma(currentInvoiceQty, "q");

                let serviceOrderCell =
                    (item.hasServiceOrder == 1
                        ? `<label class="form-control FRTII_ServiceOrderLabel">
               ${item.serviceOrderNo ?? ''}
           </label>`
                        : `<select name="Items[${rowCount}].FRTII_ServiceOrder_Number"
                  onchange="OnServiceOrderChange(this)"
                  class="form-select FRTII_ServiceOrder_Number">
           </select>`)
                    +
                    `<input name="Items[${rowCount}].FRTII_ServiceOrder_Number"
            type="hidden"
            value="${item.serviceOrderId ?? item.jisvoH_Number ?? 0}"
            class="FRTII_ServiceOrderHidden" />`
                    +
                    `<input name="Items[${rowCount}].FRTII_SO_Assign"
            type="hidden"
            value="${item.hasServiceOrder == 1 ? 'RECEIPT NOTE' : 'INVOICE'}"
            class="FRTII_SO_AssignFlag" />`
                    +
                    `<input name="Items[${rowCount}].FRTII_SourceCategory"
            type="hidden"
            value="RECEIPT NOTE"
            class="FRTII_SourceCategoryFlag" />`;

                let unitPriceDisplay = addComma(item.jisvoI_UnitPrice ?? 0, "c");

                let unitPriceCell = item.hasServiceOrder == 1
                    ? `<label class="form-control FRTII_UnitPriceLabel">${unitPriceDisplay} </label>
       <input name="Items[${rowCount}].ServiceOrderId" type="hidden" value="${item.serviceOrderId ?? 0}" class="ServiceOrderId" />
       <input name="Items[${rowCount}].FRTII_UnitPrice" type="hidden" value="${item.jisvoI_UnitPrice ?? 0}" class="FRTII_UnitPrice" />`
                    : `<input name="Items[${rowCount}].FRTII_UnitPrice" value="${unitPriceDisplay}" class="form-control FRTII_UnitPrice" />`;

                var row = `

<tr class="NewRow"
    data-rowid="${rowCount + 1}"
    data-dn="${item.jirnI_JIRNH_Number}"
    data-item="${item.jirnI_Number}"
    data-source="RN"
    data-deleted="0">

    <td class="p-2 del">

        <input type="checkbox"
               class="CheckItem form-check-input">

    </td>

    <!-- SERVICE ORDER -->
   <td>
    ${serviceOrderCell}
</td>

    <!-- RECEIPT NOTE (reuses the same FRTII_DN_No display field) -->
    <td>

        <input name="Items[${rowCount}].FRTII_DN_No"
               value="${item.jirnH_RN_No ?? ''}"
               class="form-control FRTII_DN_No"
               readonly />

    </td>

    <!-- PROCESS -->
    <td>

        <input name="Items[${rowCount}].PRS_ProcessName"
               value="${item.prS_ProcessName ?? ''}"
               class="form-control PRS_ProcessName"
               readonly />

    </td>

    <!-- ITEM CODE -->
    <td>

        <!-- RECEIPT NOTE HEADER (reuses FRTII_JIDNH_Number column) -->
        <input type="hidden"
               value="${item.jirnI_JIRNH_Number}"
               class="FRTII_JIDNH_Number" />

        <!-- ITEM NUMBER -->
        <input name="Items[${rowCount}].FRTII_Number"
               type="hidden"
               value="${item.jirnI_Number}"
               class="FRTII_Number" />

        <input name="Items[${rowCount}].Freight_ServiceOrder_Number"
       type="hidden"
       value="${item.jisvoI_Number ?? 0}"
       class="Freight_ServiceOrder_Number" />

               <input name="Items[${rowCount}].JIDNI_Number"
               type="hidden"
               value="${item.jirnI_Number}"
               class="JIDNI_Number" />

        <!-- ITEM -->
        <input name="Items[${rowCount}].FRTII_Item_Number"
               type="hidden"
               value="${item.jirnI_Item_Number}"
               class="FRTII_Item_Number" />

                    <input name="Items[${rowCount}].FRTII_PRS_Number"
               type="hidden"
               value="${item.jirnI_PRS_Number}"
               class="FRTII_PRS_Number" />

                    <input name="Items[${rowCount}].FRTII_UoM_Number"
               type="hidden"
               value="${item.jirnI_UoM_Number}"
               class="FRTII_UoM_Number" />


        <input name="Items[${rowCount}].FRTII_ItemCode"
               value="${item.itemCode ?? ''}"
               class="form-control FRTII_ItemCode"
               readonly />

    </td>

    <!-- DESCRIPTION -->
    <td>

        <input name="Items[${rowCount}].FRTII_ItemDescription"
               value="${item.itemDescription ?? ''}"
               class="form-control FRTII_ItemDescription"
               readonly />

    </td>

    <!-- OUTER DIA -->
    <td>

        <input name="Items[${rowCount}].FRTII_OuterDia"
               value="${item.outerDia ?? ''}"
               class="form-control FRTII_OuterDia"
               readonly />

    </td>

    <!-- THICKNESS -->
    <td>

        <input name="Items[${rowCount}].FRTII_Thickness"
               value="${item.thickness ?? ''}"
               class="form-control FRTII_Thickness"
               readonly />

    </td>

    <!-- LENGTH -->
    <td>

        <input name="Items[${rowCount}].FRTII_Length"
               value="${item.length ?? ''}"
               class="form-control FRTII_Length"
               readonly />

    </td>

    <!-- WIDTH -->
    <td>

        <input name="Items[${rowCount}].FRTII_Width"
               value="${item.itm_Width ?? ''}"
               class="form-control FRTII_Width"
               readonly />

    </td>

    <!-- MATERIAL GRADE -->
    <td>

        <input name="Items[${rowCount}].FRTII_MaterialGrade"
               value="${item.materialGrade ?? ''}"
               class="form-control FRTII_MaterialGrade"
               readonly />

    </td>

    <!-- ITEM GROUP -->
    <td>

        <input name="Items[${rowCount}].FRTII_ItemGroup"
               value="${item.itemGroup ?? ''}"
               class="form-control FRTII_ItemGroup"
               readonly />

    </td>

    <!-- UOM -->
    <td>

        <input name="Items[${rowCount}].FRTII_UoM"
               value="${item.uom ?? ''}"
               class="form-control FRTII_UoM text-center"
               readonly />

    </td>

    <!-- QTY 1 -->
    <td style="text-align:center !important;">

        <input name="Items[${rowCount}].FRTII_Qty"
               type="hidden"
               value="${item.jirnI_Qty ?? 0}" />


             <input
               value="${receivedQtyDisplay}"
               class="form-control FRTII_DeliveredQty" />

    </td>

    <!-- QTY 2 -->
    <td style="text-align:center !important;">

        <input name="Items[${rowCount}].FRTII_Qty"
               type="hidden"
               value="${item.invoicedQty}" />


           <input  
               value="${prevInvoiceQtyDisplay}"
               class="form-control FRTII_PrevInvoiceQty" />


    </td>

    <!-- EDITABLE QTY -->
    <td>

        <input name="Items[${rowCount}].FRTII_Qty"
               value="${currentInvoiceQtyDisplay}"
               class="form-control FRTII_Qty" />

    </td>

    <!-- UNIT PRICE -->
   <td>
    ${unitPriceCell}
</td>

    <!-- AMOUNT -->
    <td>

        <input name="Items[${rowCount}].FRTII_Amount"
              value="${addComma(0, "c")}"
               class="form-control FRTII_Amount"
               readonly />

    </td>

    <!-- SAC -->
    <td>
     <input name="Items[${rowCount}].SAC_Number"
               value="${item.saC_Number ?? 0}"   type="hidden"
               class="form-control SAC_Number" />


           <input
               value="${item.sac ?? 0}"
               class="form-control SAC" />

    </td>

    <!-- GST -->
    <td>

        <input name="Items[${rowCount}].FRTII_GST_Amount"
             value="${addComma(0, "c")}"
               class="form-control FRTII_GST_Amount"
               readonly />

    </td>

</tr>`;

                $("#TableBody").append(row);

            });
            $("#TableBody .FRTII_Qty").trigger("change");
            $("#TableBody .FRTII_UnitPrice").trigger("change");
            CalculateTotals();

        }

    });

}
//#endregion


//#region FRTII_ServiceOrder_Number change
$(document).on("change", ".FRTII_ServiceOrder_Number", function () {

    let row = $(this).closest("tr");
    let jisvohNumber = $(this).val();

    row.find(".Freight_ServiceOrder_Number").val(jisvohNumber);

    $.get("/DeliveryNote/CheckDeliveredQtyExceededFreight", {
        jisvohNumber,
        prsNumber: 40008,
        itemNumber: row.find(".FRTII_Item_Number").val(),
        uomNumber: row.find(".FRTII_UoM_Number").val()
    }, function (res) {

        if (!res || res.length === 0) return;

        let deliveredQty = parseFloat(res[0].deliveredQty) || 0;
        let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;
        let originalQty = parseFloat(row.find(".FRTII_Qty").val()) || 0;

        // CHANGED: add qty already used by OTHER rows in this form for
        // the same SO, so combined qty across the whole grid is checked.
        let otherRowsQty = GetOtherRowsQtyForSO(jisvohNumber, row);
        let realDeliveredQty = deliveredQty + otherRowsQty;

        if ((realDeliveredQty + originalQty) > jisvoiQty) {
            let allowedQty = jisvoiQty - realDeliveredQty;
            // CHANGED: field now shows the allowed qty, not the stale/default value
            row.find(".FRTII_Qty").val(addComma(allowedQty, "q"));
            alert("Qty Allowed: " + allowedQty);
            row.find(".FRTII_Qty").focus().select();
        }
    });
});

function CheckDeliveredQtyExceeded(jisvohNumber, prsNumber, itemNumber, uomNumber, originalQty, rowIndex) {
    $.get("/DeliveryNote/CheckDeliveredQtyExceededFreight", {
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

            //setTimeout(function () {
            //    $("#ItemTable tbody tr.NewRow")
            //        .eq(rowIndex)
            //        .find(".FRTII_Qty")
            //        .focus()
            //        .select();
            //}, 100);
        }
    });
}

function BindServiceOrder(customerId, prsNumber = null, itemNumber = null, uomNumber = null) {

    $(".FRTII_ServiceOrder_Number").html('<option value="0"></option>');
    if (!customerId) return;

    var category = $("#Header_SourceCategory").val() === "RN" ? "RECEIPT NOTE" : "DELIVERY NOTE";

    $.get("/DeliveryNote/GetServiceOrder",
        { customerId, prsNumber, itemNumber, uomNumber, category },
        data => $.each(data, (_, item) =>
            $(".FRTII_ServiceOrder_Number").append(
                `<option value="${item.value}">${item.text}</option>`
            )
        )
    );
}
//#endregion


//#endregion




