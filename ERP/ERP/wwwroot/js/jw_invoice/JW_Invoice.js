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
    $(document).on("focusout", "#Header_JIJWIH_JW_Customer_Name", function () {
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
    $(document).on("keydown", "#Header_JIJWIH_JW_Customer_Name", function (e) {

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
    { cls: ".JIJWII_JISVOH_Number", min: 20, max: 25, align: "left" },    // Service Order Number
    { cls: ".JIJWII_DN_No", min: 20, max: 25, align: "left" },    // Delivery Note Number
    { cls: ".JIJWII_Process", min: 10, max: 25, align: "left" },    // Process
    { cls: ".JIJWII_ItemCode", min: 10, max: 15, align: "left" },    // Item Code
    { cls: ".JIJWII_ItemDescription", min: 40, max: 40, align: "left" },    // Description

    { cls: ".JIJWII_OuterDia", min: 8, max: 8, align: "center" },  // Outer Dia
    { cls: ".JIJWII_Thickness", min: 8, max: 8, align: "center" },  // Thickness
    { cls: ".JIJWII_Length", min: 8, max: 8, align: "center" },  // Length
    { cls: ".JIJWII_Width", min: 8, max: 8, align: "center" },  // Width

    { cls: ".JIJWII_MaterialGrade", min: 10, max: 25, align: "left" },    // Material Grade
    { cls: ".JIJWII_ItemGroup", min: 10, max: 30, align: "left" },    // Item Group
    { cls: ".JIJWII_UoM", min: 10, max: 15, align: "center" },  // UoM

    { cls: ".JIJWII_DeliveredQty", min: 10, max: 20, align: "center" },  // Delivery Note Qty
    { cls: ".JIJWII_PrevInvoiceQty", min: 10, max: 20, align: "center" },  // Already Invoiced Qty
    { cls: ".JIJWII_Qty", min: 10, max: 20, align: "center" },  // Invoice Qty

    { cls: ".JIJWII_UnitPrice", min: 10, max: 20, align: "right" },   // Unit Price
    { cls: ".JIJWII_UnitPriceLabel", min: 10, max: 20, align: "right" },
    { cls: ".JIJWII_Amount", min: 13, max: 25, align: "right" },   // Amount

    { cls: ".JIJWII_SAC_Number", min: 8, max: 8, align: "left" },    // SAC
    { cls: ".JIJWII_GST_Amount", min: 13, max: 25, align: "right" }    // GST Amount
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
let ItemGSTMap = {};
let CurrentGSTRow = null;

function AutoFit() {
    fitInputWidth("Header_JIJWIH_InvoiceNo", 20, 25);
    fitInputWidth("Header_JIJWIH_MS_Number", 20, 30);
    fitInputWidth("Header_JIJWIH_JW_Customer_Name", 40, 50);
    fitInputWidth("Header_JIJWIH_Currency_Number", 10, 10);
    fitInputWidth("Header_JIJWIH_TCT_Number", 20, 25);
    fitInputWidth("Header_JIJWIH_PaymentTerms", 30, 40);
    fitInputWidth("Header_JIJWIH_PaymentMethod", 30, 40);
    fitInputWidth("Header_JIJWIH_Remarks", 40, 40);
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

                if (data.jijwI_DFS_JW_Customer_Number) {
                    $('#Header_JIJWIH_JW_Customer_Number').val(data.jijwI_DFS_JW_Customer_Number);
                    $('#Header_JIJWIH_JW_Customer_Name').val(data.cuS_Name);
                }
                if (data.jijwI_DFS_Currency_Number) {
                    $('#Header_JIJWIH_Currency_Number').val(data.jijwI_DFS_Currency_Number).trigger('change');
                }
                if (data.jijwI_DFS_TCT_Number) {
                    $('#Header_JIJWIH_TCT_Number').val(data.jijwI_DFS_TCT_Number).trigger('change');
                }
                if (data.jijwI_DFS_PaymentTerms) {
                    $('#Header_JIJWIH_PaymentTerms').val(data.jijwI_DFS_PaymentTerms);
                }
                if (data.jijwI_DFS_PaymentMethod) {
                    $('#Header_JIJWIH_PaymentMethod').val(data.jijwI_DFS_PaymentMethod);
                }
                if (data.jijwI_DFS_Remarks) {
                    $('#Header_JIJWIH_Remarks').val(data.jijwI_DFS_Remarks);
                }
                if (data.jijwI_DFS_MS_Number) {
                    $('#Header_JIJWIH_MS_Number').val(data.jijwI_DFS_MS_Number).trigger('change');
                }
            }
        },
        error: function (xhr) {
            console.error('Failed to load default form setting', xhr);
        }
    });
}
$(document).ready(function () {
    // 1) Clean up as user types / pastes — strips letters, symbols, decimal point, minus
    $(document).on("input", "#TableBody .JIJWII_Qty", function () {
        SanitizeNumericInput(this);
    });

    // 2) Final check on blur — reject 0 / blank / invalid, silently
    $(document).on("blur", "#TableBody .JIJWII_Qty", function () {
        var $this = $(this);
        var num = parseInt($this.val(), 10);

        if (isNaN(num) || num <= 0) {
            $this.val("");
        } else {
            $this.val(num);
        }
    });
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
        ".JIJWII_DeliveredQty, .JIJWII_PrevInvoiceQty, .JIJWII_Qty, .JIJWII_UnitPrice, .JIJWII_Amount, .JIJWII_GST_Amount",
        function () {
            let isQty = $(this).is(".JIJWII_DeliveredQty, .JIJWII_PrevInvoiceQty, .JIJWII_Qty");
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
        "#Header_JIJWIH_InvoiceNo, #Header_JIJWIH_MS_Number, #Header_JIJWIH_JW_Customer_Name, #Header_JIJWIH_Currency_Number, #Header_JIJWIH_TCT_Number, #Header_JIJWIH_PaymentTerms, #Header_JIJWIH_PaymentMethod, #Header_JIJWIH_Remarks",
        function () {

            const widths = {
                Header_JIJWIH_InvoiceNo: [20, 25],
                Header_JIJWIH_MS_Number: [20, 30],
                Header_JIJWIH_JW_Customer_Name: [40, 50],
                Header_JIJWIH_Currency_Number: [10, 10],
                Header_JIJWIH_TCT_Number: [20, 25],
                Header_JIJWIH_PaymentTerms: [30, 40],
                Header_JIJWIH_PaymentMethod: [30, 40],
                Header_JIJWIH_Remarks: [40, 40]
            };

            const [min, max] = widths[this.id];
            fitInputWidth(this, min, max);
        });
    //#endregion

    //#region Header_JIJWIH_JW_Customer_Name
    // JW_Customer – Focus Out: moved to <script> block
    // JW_Customer – Keydown: moved to <script> block
    //#endregion

    //#region call service order onclick
    $(document).on("focus", ".JIJWII_JISVOH_Number", function () {
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


    $("#Header_JIJWIH_InvoiceDate").on("change", function () {
       // console.log("Date changed:", $(this).val());

        loadTaxCluster(); // your function
      
    });
    $("#Header_JIJWIH_JW_Customer_Number").change(function () {
        LoadServiceOrders();
    });

    //#region gst popup

    $(document).on('click', '.GSTView', function () {
        let CheckedCheckbox = document.querySelector('.CheckItem:checked');
        if (CheckedCheckbox) {
            var currentRow = $(CheckedCheckbox).closest('tr.NewRow');
            CurrentGSTRow = currentRow.index();
            var ItemNumber = currentRow.find('input.JIJWII_Item_Number').val();
            //var Index = currentRow.find('input.SII_Index').val();
            var SACNumber = currentRow.find('input.SAC_Number').val();
           

            var Cluster = $("#Header_JIJWIH_TCT_Number").val();
            var SIHDate = $("#Header_JIJWIH_InvoiceDate").val();

            var qty = parseFloat(removeCommas(currentRow.find("input.JIJWII_Qty").val())) || 0;
            var unitPrice = parseFloat(removeCommas(currentRow.find("input.JIJWII_UnitPrice").val())) || 0;
            var Amount = parseFloat(removeCommas(currentRow.find("input.JIJWII_Amount").val())) || 0;

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

    $(document).on("keyup change", ".JIJWII_Qty, .JIJWII_UnitPrice", function () {

        var row = $(this).closest("tr");

        var qty = parseFloat(removeCommas(row.find(".JIJWII_Qty").val())) || 0;
        var unitPrice = parseFloat(removeCommas(row.find(".JIJWII_UnitPrice").val())) || 0;

        var amount = qty * unitPrice;

        row.find(".JIJWII_Amount").val(addComma(amount, "c"));

        CalculateTotals();
    });

    $(document).on("keyup change", ".JIJWII_Qty", function () {

        var row = $(this).closest("tr");

        var deliveredQty = parseFloat(removeCommas(row.find(".JIJWII_DeliveredQty").val())) || 0;
        var prevInvoiceQty = parseFloat(removeCommas(row.find(".JIJWII_PrevInvoiceQty").val())) || 0;
        var currentQty = parseFloat(removeCommas(row.find(".JIJWII_Qty").val())) || 0;

        var balanceQty = deliveredQty - prevInvoiceQty;

        // Validation
        if (currentQty > balanceQty) {

            alert("Current Invoice Qty cannot exceed Balance Qty (" + balanceQty + ")");

            row.find(".JIJWII_Qty").val(addComma(balanceQty, "q"));

            currentQty = balanceQty;

        } else {

            let jisvohNumber = row.find(".JIJWII_ServiceOrderHidden").val() || 0;
            console.log('---if value is there in so:' + jisvohNumber)
            if (jisvohNumber > 0) {
                GetAllowedQty(
                    jisvohNumber,
                    row.find(".JIJWII_PRS_Number").val() || 0,
                    row.find(".JIJWII_Item_Number").val() || 0,
                    row.find(".JIJWII_UoM_Number").val() || 0,
                    function (allowedQty) {

                        // CHANGED: subtract qty already used by OTHER
                        // rows in this form for the same SO, so the
                        // limit is respected across the whole grid,
                        // not just per DB call.
                        let otherRowsQty = GetOtherRowsQtyForSO(jisvohNumber, row);
                        let realAllowedQty = allowedQty - otherRowsQty;

                        console.log("Allowed Qty:", realAllowedQty);

                        if (currentQty > realAllowedQty) {
                            // CHANGED: field now shows the allowed qty,
                            // not the exceeded value the user typed
                            row.find(".JIJWII_Qty").val(addComma(realAllowedQty, "q"));
                            alert("Qty Allowed: " + realAllowedQty);
                        }
                    }
                );
            }
        }

        // Prevent negative values
        if (currentQty < 0) {

            row.find(".JIJWII_Qty").val(addComma(0, "q"));

            currentQty = 0;

        }

        var unitPrice = parseFloat(removeCommas(row.find(".JIJWII_UnitPrice").val())) || 0;

        var amount = currentQty * unitPrice;

        row.find(".JIJWII_Amount").val(addComma(amount, "c"));

        CalculateTotals();

    });

    $(document).on("input change", ".JIJWII_Qty, .JIJWII_UnitPrice", async function () {

        const $row = $(this).closest("tr");

        const qty = parseFloat(removeCommas($row.find(".JIJWII_Qty").val())) || 0;

        const unitPrice = parseFloat(removeCommas($row.find(".JIJWII_UnitPrice").val())) || 0;

        const baseAmount = qty * unitPrice;

        const cluster = $("#Header_JIJWIH_TCT_Number").val();

        const invoiceDate = $("#Header_JIJWIH_InvoiceDate").val();

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

        $row.find(".JIJWII_GST_Amount").val(gstAmount);

    });

    DateBind();
});

function GetAllowedQty(jisvohNumber, prsNumber, itemNumber, uomNumber, callback) {
    $.get("/DeliveryNote/CheckDeliveredQtyExceeded", {
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

    var fp = document.getElementById("Header_JIJWIH_InvoiceDate")._flatpickr;
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

        totalDeliveredQty += parseFloat(removeCommas($(this).find(".JIJWII_DeliveredQty").val())) || 0;
        totalPrevInvoiceQty += parseFloat(removeCommas($(this).find(".JIJWII_PrevInvoiceQty").val())) || 0;
        totalQty += parseFloat(removeCommas($(this).find(".JIJWII_Qty").val())) || 0;
        totalAmount += parseFloat(removeCommas($(this).find(".JIJWII_Amount").val())) || 0;
        totalGSTAmount += parseFloat(removeCommas($(this).find(".JIJWII_GST_Amount").val())) || 0;
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

    var customerNumber = $("#Header_JIJWIH_JW_Customer_Number").val();
    var invoiceDate = $("#Header_JIJWIH_InvoiceDate").val();

    if (customerNumber === "" || invoiceDate === "") {
        return;
    }

    $.ajax({
        url: '/JobWorkInvoice/Get_JW_Invoice_Taxcluster',
        type: 'GET',
        data: {
            JWC_Number: customerNumber,
            CheckDate: invoiceDate
        },

        success: function (data) {

            var ddl = $("#Header_JIJWIH_TCT_Number");

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
$(document).on("change", "#Header_JIJWIH_InvoiceDate", function () {
    GetJWInvoiceNumber();
});  //#region GetJWInvoiceNumber

function GetJWInvoiceNumber() {

    let date = $("#Header_JIJWIH_InvoiceDate").val();

    if (!date)
        return;

    $.ajax({
        url: "/jobworkinvoice/transactions/jobworkinvoice/next-jwi-number",
        type: "GET",
        data: { JWIDate: date },
        success: function (response) {
            if (!response || response.trim() === "") {
               // alert("Please set numbering for this date range.");
                $("#Header_JIJWIH_InvoiceNo").val("");
                DateBind();

                return;
            }

            $("#Header_JIJWIH_InvoiceNo").val(response);

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
    var SIHDate = $("input[name='Header.JIJWIH_InvoiceDate']").val();
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
                        "#Header_JIJWIH_JW_Customer_Name",
                        "#Header_JIJWIH_JW_Customer_Number",
                        "#Header_JIJWIH_Currency_Name",
                        "#Header_JIJWIH_Currency_Number",
                        "#Header_JIJWIH_WH_Number",
                        "#RightPane",
                        ".buyer-search-results"
                    );

                    $("#BuyerMessage").hide().text("");

                    $("#Header_JIJWIH_JW_Customer_Number").val(clickedCust.cuS_Number);
                    $("#Header_JIJWIH_Currency_Number").val(clickedCust.cuS_CUR_Number);
                    $("#Header_JIJWIH_JW_Customer_Name").val(clickedCust.cuS_Name);
                    $("#Header_JIJWIH_Currency_Name").val(clickedCust.cuS_CUR_Number);

                    $("#RightPane").removeClass("show");
                    $("#RightPane .buyer-search-results").hide();

                    setTimeout(function () {
                        $("#Header_JIJWIH_Currency_Number").focus();
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
            removeCommas(row.find(".JIJWII_UnitPrice").val())
        ) || 0;

        var amount = parseFloat(
            removeCommas(row.find(".JIJWII_Amount").val())
        ) || 0;

        row.removeClass("error-row");

        if (unitPrice <= 0) {

            row.addClass("error-row");

            message =
                "Row " + (index + 1) +
                " : Unit Price cannot be 0";

            row.find(".JIJWII_UnitPrice").focus();

            isValid = false;
            return false;
        }

        if (amount <= 0) {

            row.addClass("error-row");

            message =
                "Row " + (index + 1) +
                " : Amount cannot be 0";

            row.find(".JIJWII_Amount").focus();

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
    if ($("#Header_JIJWIH_InvoiceNo").val().trim() === "") {

        showAlert(
            'Invoice No is required',
            '#Header_JIJWIH_InvoiceNo'
        );

        return false;
    }

    // 2. Invoice Date
    if ($("#Header_JIJWIH_InvoiceDate").val().trim() === "") {

        showAlert(
            'Invoice Date is required',
            '#Header_JIJWIH_InvoiceDate'
        );

        return false;
    }

    // 3. JW Customer
    if (
        $("#Header_JIJWIH_JW_Customer_Number").val().trim() === "" ||
        $("#Header_JIJWIH_JW_Customer_Number").val() === "0" ||
        $("#Header_JIJWIH_JW_Customer_Name").val().trim() === ""
    ) {

        showAlert(
            'JW Customer is required',
            '#Header_JIJWIH_JW_Customer_Name'
        );

        return false;
    }

    // 4. Currency
    if (
        $("#Header_JIJWIH_Currency_Number").val() === "" ||
        $("#Header_JIJWIH_Currency_Number").val() === "0"
    ) {

        showAlert(
            'Currency is required',
            '#Header_JIJWIH_Currency_Number'
        );

        return false;
    }

    // 5. Terms & Conditions
    if (
        $("#Header_JIJWIH_TCT_Number").val() === "" ||
        $("#Header_JIJWIH_TCT_Number").val() === "0"
    ) {

        showAlert(
            'Terms & Conditions is required',
            '#Header_JIJWIH_TCT_Number'
        );

        return false;
    }
    // 5. Message / MS
    if (
        $("#Header_JIJWIH_MS_Number").val() === "" ||
        $("#Header_JIJWIH_MS_Number").val() === "0"
    ) {

        showAlert(
            'Material Seggregation is required',
            '#Header_JIJWIH_MS_Number'
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

        var model = CreateJobWorkInvoiceModel();

        console.log(JSON.stringify(model));

        $.ajax({

            url: '/JobWorkInvoice/SaveJobWorkInvoice',

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

function CreateJobWorkInvoiceItemModel() {

    var items = [];

    $("#ItemTable tbody tr.NewRow").each(function () {

        let row = $(this);

        if (row.attr("data-deleted") == "1") {
            return;
        }
        console.log('service order dropdown value---'+row.find(".JIJWII_ServiceOrderHidden").val());
        let item = {

            JIJWII_Number:
                parseInt(row.find(".JIJWII_Number").val()) || 0,

            JISVOI_Number:                                    // added
                parseInt(row.find(".JISVOI_Number").val()) || 0,

            JIJWII_JISVOH_Number:
                parseInt(row.find(".JIJWII_ServiceOrderHidden").val()) || 0,

            JIJWII_SVO_Assign:                                 // NEW
                row.find(".JIJWII_SVO_AssignFlag").val() || "INVOICE",

            JIJWII_Item_Number:
                parseInt(row.find(".JIJWII_Item_Number").val()) || 0,

            JIJWII_DN_No:
                row.find(".JIJWII_DN_No").val(),

            JIJWII_Process:
                row.find(".PRS_ProcessName").val(),

            JIJWII_ItemCode:
                row.find(".JIJWII_ItemCode").val(),

            JIJWII_ItemDescription:
                row.find(".JIJWII_ItemDescription").val(),

            JIJWII_OuterDia:
                parseFloat(row.find(".JIJWII_OuterDia").val()) || 0,

            JIJWII_Thickness:
                parseFloat(row.find(".JIJWII_Thickness").val()) || 0,

            JIJWII_Length:
                parseFloat(row.find(".JIJWII_Length").val()) || 0,

            JIJWII_Width:
                parseFloat(row.find(".JIJWII_Width").val()) || 0,

            JIJWII_MaterialGrade:
                row.find(".JIJWII_MaterialGrade").val(),

            JIJWII_ItemGroup:
                row.find(".JIJWII_ItemGroup").val(),

            JIJWII_UoM_Number:
                parseInt(row.find(".JIJWII_UoM_Number").val()) || 0,

            JIJWII_Qty:
                parseFloat(removeCommas(row.find(".JIJWII_Qty").val())) || 0,

            JIJWII_UnitPrice:
                parseFloat(removeCommas(row.find(".JIJWII_UnitPrice").val())) || 0,

            JIJWII_Amount:
                parseFloat(removeCommas(row.find(".JIJWII_Amount").val())) || 0,

            JIJWII_SAC_Number:
                parseInt(row.find(".SAC_Number").val()) || 0,
            JIJWII_GST_Amount:
                parseFloat(removeCommas(row.find(".JIJWII_GST_Amount").val())) || 0,

            JIJWII_PRS_Number:
                parseInt(row.find(".JIJWII_PRS_Number").val()) || 0,

            JIJWII_JIDNH_Number:
                parseInt(row.find(".JIJWII_JIDNH_Number").val()) || 0,

            JIDNI_Number:
                parseInt(row.find(".JIDNI_Number").val()) || 0
        };

        items.push(item);
    });

    return items;
}


function CreateJobWorkInvoiceModel() {

    //=====================================
    // HEADER
    //=====================================

    var header = {

        JIJWIH_Number:
            parseInt($("#Header_JIJWIH_Number").val()) || 0,

        JIJWIH_InvoiceNo:
            $("#Header_JIJWIH_InvoiceNo").val(),

        JIJWIH_InvoiceDate:
            new Date($("#Header_JIJWIH_InvoiceDate").val())
                .toISOString(),
        JIJWIH_MS_Number:
            parseInt($("#Header_JIJWIH_MS_Number").val()) || 0,
        JIJWIH_JW_Customer_Number:
            parseInt($("#Header_JIJWIH_JW_Customer_Number").val()) || 0,

        JIJWIH_Currency_Number:
            parseInt($("#Header_JIJWIH_Currency_Number").val()) || 0,

        JIJWIH_TCT_Number:
            parseInt($("#Header_JIJWIH_TCT_Number").val()) || 0,

        JIJWIH_PaymentTerms:
            $("#Header_JIJWIH_PaymentTerms").val(),

        JIJWIH_PaymentMethod:
            $("#Header_JIJWIH_PaymentMethod").val(),

        JIJWIH_Remarks:
            $("#Header_JIJWIH_Remarks").val()
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
            JIJWIA_JIJWIH_Number:
                parseInt(row.find(".JIDNA_JIDNH_Number").val()) || 0,

            JIJWIA_Number:
                parseInt(row.find(".JIDNA_Number").val()) || 0,

            JIJWIA_ADTP_Number:
                parseInt(row.find(".JIDNA_ADTP_Number").val()) || 0,

            JIJWIA_Address_ID:
                row.find(".JIDNA_Address_ID").val() || "",

            JIJWIA_Address:
                row.find(".JIDNA_Address").text() || "",

            JIJWIA_City:
                row.find(".JIDNA_City").val() || "",

            JIJWIA_State:
                row.find(".JIDNA_State").val() || "",

            JIJWIA_Country:
                row.find(".JIDNA_Country").val() || "",

            JIJWIA_PIN:
                row.find(".JIDNA_PIN").val() || "",

            JIJWIA_GSTIN:
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
        Items: CreateJobWorkInvoiceItemModel(),
        Addresses: addresses

    };

    console.log(jobworkInvoiceModel);

    return jobworkInvoiceModel;
}

//#endregion
function GetDistinctDeliveryNoteHeaders() {

    var headerIds = [];

    $("#TableBody tr.NewRow").each(function () {

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
    var Buyer = $('#Header_JIJWIH_JW_Customer_Number').val(); // keep if same field exists

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
    var jwcNumber = $("#Header_JIJWIH_JW_Customer_Number").val();

    $.ajax({
        url: '/JobWorkInvoice/GetJWCAddress',
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

    let customerId = $("#Header_JIJWIH_JW_Customer_Number").val();
    let prsNumber = row.find(".JIJWII_PRS_Number").val();
    let itemNumber = row.find(".JIJWII_Item_Number").val();
    let uomNumber = row.find(".JIJWII_UoM_Number").val();
    console.log(row.find(".JIJWII_PRS_Number").length);
    console.log(row.find(".JIJWII_Item_Number").length);
    console.log(row.find(".JIJWII_UoM_Number").length);
    $.ajax({
        url: "/JobWorkInvoice/GetJobWorkInvoiceServiceOrder",
        type: "GET",
        data: {
            customerId: customerId,
            prsNumber: prsNumber,
            itemNumber: itemNumber,
            uomNumber: uomNumber
        },
        success: function (response) {
            console.log('--what is response---' + JSON.stringify(response));

            let options = '<option value="0"></option>';

            $.each(response, function (_, item) {
                // NEW: skip entries with no real value/text — server
                // occasionally returns a blank item, which was
                // duplicating the default blank option in the dropdown.
                if (!item.value || item.value === "" || item.value === "0") return;

                options += `<option value="${item.value}">
                            ${item.text}
                        </option>`;
            });

            // NEW: preserve the row's currently-selected SO across the
            // rebuild, using the hidden field (not the dropdown's own
            // .val(), since .html() below wipes it to blank already)
            let previousValue = row.find(".JIJWII_ServiceOrderHidden").val() || "0";

            $(dropdown).html(options);
            $(dropdown).val(previousValue);

            // CHANGED: .html()/.val() never fire "change" — if the
            // dropdown ends up blank (no matching option, or was already
            // blank), clear Unit Price/Amount directly here instead of
            // waiting for an event that will never come.
            if (!$(dropdown).val() || $(dropdown).val() === "0") {
                row.find(".JISVOI_Number").val(0);
                row.find(".JIJWII_UnitPrice").val(0).prop("readonly", false);
                row.find(".JIJWII_Amount").val(0).prop("readonly", false);
            }
        }, error: function (xhr, status, error) {

            console.log("AJAX Error");
            console.log("Status:", status);
            console.log("Error:", error);
            console.log("Response:", xhr.responseText);

            // alert("Failed to load Service Orders.");
        }
    });
}
//#endregion

//#region LOAD DELIVERY NOTE ITEMS
$("#LoadDeliveryNote").click(function () {

   


    // 4. Material Segregation
    if (
        $("#Header_JIJWIH_MS_Number").val() === "" ||
        $("#Header_JIJWIH_MS_Number").val() === "0"
    ) {
        showAlert(
            'Material Seggregation is required',
            '#Header_JIJWIH_MS_Number'
        );
        return false;
    }
    // 3. JW Customer
    if (
        $("#Header_JIJWIH_JW_Customer_Number").val().trim() === "" ||
        $("#Header_JIJWIH_JW_Customer_Number").val() === "0" ||
        $("#Header_JIJWIH_JW_Customer_Name").val().trim() === ""
    ) {

        showAlert(
            'JW Customer is required',
            '#Header_JIJWIH_JW_Customer_Name'
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

    var customerNumber = $("#Header_JIJWIH_JW_Customer_Number").val();
    var msNumber = $("#Header_JIJWIH_MS_Number").val();
    var resultsDiv = $("#DeliveryNoteTableView");
    var headers = GetDistinctDeliveryNoteHeaders();


    $.ajax({

        url: '/JobWorkInvoice/GetDeliveryNote_GroupItem',

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
        $("#Header_JIJWIH_JW_Customer_Number").val();

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
    row.find(".JIJWII_ServiceOrderHidden").val($(ele).val());
    row.find(".JIJWII_SVO_AssignFlag").val("INVOICE"); // NEW
    var serviceOrderNo = $(ele).val();
    var prsNumber = row.find(".JIJWII_PRS_Number").val();
    var itemNumber = row.find(".JIJWII_Item_Number").val();
    var uomNumber = row.find(".JIJWII_UoM_Number").val();

    // CHANGED: stop here for empty/blank selection — no AJAX call at all,
    // so no stale/delayed response can ever arrive later and overwrite
    // the cleared Unit Price (this was the actual race-condition cause).
    if (!serviceOrderNo || serviceOrderNo === "0") {
        row.find(".JISVOI_Number").val(0);
        row.find(".JIJWII_UnitPrice").val(0).prop("readonly", false);
        row.find(".JIJWII_Amount").val(0).prop("readonly", false);
        return;
    }

    $.ajax({
        url: '/JobWorkInvoice/GetServiceOrderItemInfo',
        type: 'GET',
        data: {
            JISVOH_Number: serviceOrderNo,
            PRS_Number: prsNumber,
            Item_Number: itemNumber,
            UoM_Number: uomNumber
        },
        success: function (response) {
            console.log(response);
            console.log(JSON.stringify(response));

            var unitPriceBox = row.find(".JIJWII_UnitPrice");
            var amountBox = row.find(".JIJWII_Amount");
            var serviceOrderItemBox = row.find(".JISVOI_Number");

            if (!response) {

                serviceOrderItemBox.val(0);   // added

                unitPriceBox.val("")
                    .prop("readonly", false);

                amountBox.val("")
                    .prop("readonly", false);

                return;
            }

            // Set JISVOI_Number
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
              //  row.find(".JIJWII_JISVOH_Number").prop("disabled", true);
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
            console.log(err);
            console.log(JSON.stringify(err));
        }
    });
}

function InsertDeliveryNoteItems(selectedDNString, selectedRecoveredItems, selectedDN) {

    var customerNumber = $("#Header_JIJWIH_JW_Customer_Number").val();

    $.ajax({

        url: '/JobWorkInvoice/GetDeliveryNote_ForInvoice',

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


                // IF EXISTS
                if (existingRow.length > 0) {

                    // recover deleted row
                    if (isRecovered &&
                        existingRow.attr("data-deleted") == "1") {

                        existingRow
                            .show()
                            .attr("data-deleted", "0");

                    }

                    return;
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
                        ? `<label class="form-control JIJWII_ServiceOrderLabel">
               ${item.serviceOrderNo ?? ''}
           </label>`
                        : `<select name="Items[${rowCount}].JIJWII_JISVOH_Number"
                  onchange="OnServiceOrderChange(this)"
                  class="form-select JIJWII_JISVOH_Number">
           </select>`)
                    +
                    `<input name="Items[${rowCount}].JIJWII_JISVOH_Number"
            type="hidden"
            value="${item.serviceOrderId ?? item.jisvoH_Number ?? 0}"
            class="JIJWII_ServiceOrderHidden" />`
                    +
                    `<input name="Items[${rowCount}].JIJWII_SVO_Assign"
            type="hidden"
            value="${item.hasServiceOrder == 1 ? 'DELIVERY NOTE' : 'INVOICE'}"
            class="JIJWII_SVO_AssignFlag" />`;

                let unitPriceDisplay = addComma(item.jisvoI_UnitPrice ?? 0, "c");

                let unitPriceCell = item.hasServiceOrder == 1
                    ? `<label class="form-control JIJWII_UnitPriceLabel">${unitPriceDisplay} </label>
       <input name="Items[${rowCount}].ServiceOrderId" type="hidden" value="${item.serviceOrderId ?? 0}" class="ServiceOrderId" />
       <input name="Items[${rowCount}].JIJWII_UnitPrice" type="hidden" value="${item.jisvoI_UnitPrice ?? 0}" class="JIJWII_UnitPrice" />`
                    : `<input name="Items[${rowCount}].JIJWII_UnitPrice" value="${unitPriceDisplay}" class="form-control JIJWII_UnitPrice" />`;
                //#endregion


                var row = `

<tr class="NewRow"
    data-rowid="${rowCount + 1}"
    data-dn="${item.jidnI_JIDNH_Number}"
    data-item="${item.jidnI_Number}"
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

        <input name="Items[${rowCount}].JIJWII_DN_No"
               value="${item.jidnH_DN_No ?? ''}"
               class="form-control JIJWII_DN_No"
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
               class="JIJWII_JIDNH_Number" />
         
        <!-- ITEM NUMBER -->
        <input name="Items[${rowCount}].JIJWII_Number"
               type="hidden"
               value="${item.jidnI_Number}"
               class="JIJWII_Number" />
               
               <input name="Items[${rowCount}].JISVOI_Number"
       type="hidden"
       value="0"
       class="JISVOI_Number" />

               <input name="Items[${rowCount}].JIDNI_Number"
               type="hidden"
               value="${item.jidnI_Number}"
               class="JIDNI_Number" />

        <!-- ITEM -->
        <input name="Items[${rowCount}].JIJWII_Item_Number"
               type="hidden"
               value="${item.jidnI_Item_Number}"
               class="JIJWII_Item_Number" />

                    <input name="Items[${rowCount}].JIJWII_PRS_Number"
               type="hidden"
               value="${item.jidnI_PRS_Number}"
               class="JIJWII_PRS_Number" />

                    <input name="Items[${rowCount}].JIJWII_UoM_Number"
               type="hidden"
               value="${item.jidnI_UoM_Number}"
               class="JIJWII_UoM_Number" />
               

        <input name="Items[${rowCount}].JIJWII_ItemCode"
               value="${item.itemCode ?? ''}"
               class="form-control JIJWII_ItemCode"
               readonly />

    </td>

    <!-- DESCRIPTION -->
    <td>

        <input name="Items[${rowCount}].JIJWII_ItemDescription"
               value="${item.itemDescription ?? ''}"
               class="form-control JIJWII_ItemDescription"
               readonly />

    </td>

    <!-- OUTER DIA -->
    <td>

        <input name="Items[${rowCount}].JIJWII_OuterDia"
               value="${item.outerDia ?? ''}"
               class="form-control JIJWII_OuterDia"
               readonly />

    </td>

    <!-- THICKNESS -->
    <td>

        <input name="Items[${rowCount}].JIJWII_Thickness"
               value="${item.thickness ?? ''}"
               class="form-control JIJWII_Thickness"
               readonly />

    </td>

    <!-- LENGTH -->
    <td>

        <input name="Items[${rowCount}].JIJWII_Length"
               value="${item.length ?? ''}"
               class="form-control JIJWII_Length"
               readonly />

    </td>

    <!-- WIDTH -->
    <td>

        <input name="Items[${rowCount}].JIJWII_Width"
               value="${item.itm_Width ?? ''}"
               class="form-control JIJWII_Width"
               readonly />

    </td>

    <!-- MATERIAL GRADE -->
    <td>

        <input name="Items[${rowCount}].JIJWII_MaterialGrade"
               value="${item.materialGrade ?? ''}"
               class="form-control JIJWII_MaterialGrade"
               readonly />

    </td>

    <!-- ITEM GROUP -->
    <td>

        <input name="Items[${rowCount}].JIJWII_ItemGroup"
               value="${item.itemGroup ?? ''}"
               class="form-control JIJWII_ItemGroup"
               readonly />

    </td>

    <!-- UOM -->
    <td>

        <input name="Items[${rowCount}].JIJWII_UoM"
               value="${item.uom ?? ''}"
               class="form-control JIJWII_UoM text-center"
               readonly />

    </td>

    <!-- QTY 1 -->
    <td style="text-align:center !important;">

        <input name="Items[${rowCount}].JIJWII_Qty"
               type="hidden"
               value="${item.jidnI_Qty ?? 0}" />

       
                        <input
               value="${deliveredQtyDisplay}"
               class="form-control JIJWII_DeliveredQty"
               readonly />

    </td>

    <!-- QTY 2 -->
    <td style="text-align:center !important;">

        <input name="Items[${rowCount}].JIJWII_Qty"
               type="hidden"
               value="${item.invoicedQty}" />

      
               <input
               value="${prevInvoiceQtyDisplay}"
               class="form-control JIJWII_PrevInvoiceQty"
               readonly />


    </td>

    <!-- EDITABLE QTY -->
    <td>

        <input name="Items[${rowCount}].JIJWII_Qty"
               value="${currentInvoiceQtyDisplay}"
               class="form-control JIJWII_Qty" />

    </td>

    <!-- UNIT PRICE -->
   <td>
    ${unitPriceCell}
</td>

    <!-- AMOUNT -->
    <td>

        <input name="Items[${rowCount}].JIJWII_Amount"
              value="${addComma(0, "c")}"
               class="form-control JIJWII_Amount"
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

        <input name="Items[${rowCount}].JIJWII_GST_Amount"
             value="${addComma(0, "c")}"
               class="form-control JIJWII_GST_Amount"
               readonly />

    </td>

</tr>`;

                $("#TableBody").append(row);
               

            });
            $("#TableBody .JIJWII_Qty").trigger("change");
            $("#TableBody .JIJWII_UnitPrice").trigger("change");
            CalculateTotals();
           
        }

    });

}


//#endregion


//#region JIJWII_JISVOH_Number empty check
$(document).on("input change", ".JIJWII_JISVOH_Number", function () {

    let val = $(this).val();

    if (!val || val === "0") {
        let row = $(this).closest("tr");
        row.find(".JISVOI_Number").val(0);
        row.find(".JIJWII_UnitPrice").val(0).prop("readonly", false);
        row.find(".JIJWII_Amount").val(0).prop("readonly", false);
    }
});
//#endregion

//#region JIJWII_JISVOH_Number change
$(document).on("change", ".JIJWII_JISVOH_Number", function () {

    let row = $(this).closest("tr");
    let jisvohNumber = $(this).val();

    row.find(".JISVOH_Number").val(jisvohNumber);

    $.get("/DeliveryNote/CheckDeliveredQtyExceeded", {
        jisvohNumber,
        prsNumber: row.find(".JIJWII_PRS_Number").val(),
        itemNumber: row.find(".JIJWII_Item_Number").val(),
        uomNumber: row.find(".JIJWII_UoM_Number").val()
    }, function (res) {

        if (!res || res.length === 0) return;

        let deliveredQty = parseFloat(res[0].deliveredQty) || 0;
        let jisvoiQty = parseFloat(res[0].jisvoiQty) || 0;
        let originalQty = parseFloat(row.find(".JIJWII_Qty").val()) || 0;

        // CHANGED: add qty already used by OTHER rows in this form for
        // the same SO, so combined qty across the whole grid is checked.
        let otherRowsQty = GetOtherRowsQtyForSO(jisvohNumber, row);
        let realDeliveredQty = deliveredQty + otherRowsQty;

        if ((realDeliveredQty + originalQty) > jisvoiQty) {
            let allowedQty = jisvoiQty - realDeliveredQty;
            // CHANGED: field now shows the allowed qty, not the stale/default value
            row.find(".JIJWII_Qty").val(addComma(allowedQty, "q"));
            alert("Qty Allowed: " + allowedQty);
            row.find(".JIJWII_Qty").focus().select();
        }
    });
});

function CheckDeliveredQtyExceeded(jisvohNumber, prsNumber, itemNumber, uomNumber, originalQty, rowIndex) {
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

            //setTimeout(function () {
            //    $("#ItemTable tbody tr.NewRow")
            //        .eq(rowIndex)
            //        .find(".JIJWII_Qty")
            //        .focus()
            //        .select();
            //}, 100);
        }
    });
}

function BindServiceOrder(customerId, prsNumber = null, itemNumber = null, uomNumber = null) {

    $(".JIJWII_JISVOH_Number").html('<option value="0"></option>');
    if (!customerId) return;

    $.get("/DeliveryNote/GetServiceOrder",
        { customerId, prsNumber, itemNumber, uomNumber },
        data => $.each(data, (_, item) =>
            $(".JIJWII_JISVOH_Number").append(
                `<option value="${item.value}">${item.text}</option>`
            )
        )
    );
}
//#endregion


//#endregion


// NEW: sums Qty already entered in OTHER rows for the same Service Order
// (in-form, not-yet-saved) — needed because CheckDeliveredQtyExceeded
// only knows DB-committed qty, not what's currently on screen.
function GetOtherRowsQtyForSO(jisvohNumber, currentRow) {
    let total = 0;

    $("#TableBody tr.NewRow").each(function () {
        let row = $(this);

        if (row.is(currentRow)) return;
        if (row.attr("data-deleted") === "1") return;

        let rowSO = row.find(".JIJWII_ServiceOrderHidden").val() || 0;

        if (rowSO == jisvohNumber) {
            total += parseFloat(removeCommas(row.find(".JIJWII_Qty").val())) || 0;
        }
    });

    return total;
}




