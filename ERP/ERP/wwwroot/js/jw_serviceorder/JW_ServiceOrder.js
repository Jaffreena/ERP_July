$(document).ready(function () {
    //#region JW_Customer – Focus In
    // Handled via inline onfocus in the .cshtml — no delegated
    // binding needed.
    //#endregion

    //#region JW_Customer – Text change
    // Handled via inline oninput in the .cshtml.
    //#endregion

    //#region JW_Customer – Focus Out
    $(document).on("focusout", ".JW_Customer_Name", function () {
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
    $(document).on("keydown", ".JW_Customer_Name", function (e) {

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

            isMouseSelectingBuyer = true;
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
    // Handled via inline onfocus (OnFocusItem or equivalent) in the
    // .cshtml — the re-trigger-loop guard lives inside that function.
    //#endregion

    //#region Item_Code – Text change
    // Handled via inline oninput in the .cshtml.
    //#endregion

    //#region Item_Code – Keydown
    $(document).on("keydown", ".JIJWI_SVOI_Item_Code", function (e) {

        if (e.key !== "ArrowDown" && e.key !== "ArrowUp" &&
            e.key !== "Enter" && e.key !== "Escape") {
            return;
        }

        let rows = $("#RightPane_Item .search-results tbody tr");

        if ((e.key === "Enter" || e.key === "Escape") &&
            $.trim($(this).val()) === "" && rows.length > 0 &&
            !rows.filter(".current-row, .match-row").length) {

            e.preventDefault();

            isSelectingItem = true;
            rows.first().trigger("mousedown");
            return;
        }

        if (e.key === "Escape") {

            let input = $(this);

            HandleSearchSelection(
                input,
                rows,
                "#ItemMessage",
                "#RightPane_Item",
                "#RightPane_Item .search-results"
            );

            e.preventDefault();
            return;
        }

        HandleSearchKeyDown(
            e,
            this,
            "#RightPane_Item",
            ".search-results",
            "#ItemMessage",
            '[name="JWIHeader.JIJWI_SVOH_MS_Number"]'
        );
    });

    // mousedown -> (re)open the item pane and load/refresh the search.
    $(document).on("mousedown", ".JIJWI_SVOI_Item_Code", function (e) {

        let $msField = $(this).closest(".card").find('[name="JWIHeader.JIJWI_SVOH_MS_Number"]');

        if ($.trim($msField.val()) === "") {
            $msField.prop("selectedIndex", 1);
            return;
        }

        SearchServiceOrderItem(this);

        $("#RightPane").removeClass("show");
        $("#RightPane .buyer-search-results").hide();

        $("#RightPane_Item").addClass("show");
        $("#RightPane_Item .search-results").show();
    });
    //#endregion
    //#region Item_Code – Focus Out
    $(document).on("focusout", ".JIJWI_SVOI_Item_Code", function () {

        if (isSelectingItem)
            return;

        let $msField = $(this).closest(".card").find('[name="JWIHeader.JIJWI_SVOH_MS_Number"]');

        if ($.trim($msField.val()) === "") {
            return;
        }

        let input = $(this);
        let rows = $("#RightPane_Item .search-results tbody tr");

        if ($.trim(input.val()) === "" && rows.length > 0 &&
            !rows.filter(".current-row, .match-row").length) {

            isSelectingItem = true;
            rows.first().trigger("mousedown");
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
const JWIItemTableFields = [
    { cls: ".JIJWI_SVOI_PRS_Number", min: 10, max: 25, align: "left" },   // Process
    { cls: ".JIJWI_SVOI_Item_Code", min: 10, max: 15, align: "left" },   // Item Code
    { cls: ".Description", min: 40, max: 40, align: "left" },   // Description

    { cls: ".OuterDia", min: 8, max: 8, align: "center" }, // Outer Dia
    { cls: ".Thickness", min: 8, max: 8, align: "center" }, // Thickness
    { cls: ".Length", min: 8, max: 8, align: "center" }, // Length
    { cls: ".Width", min: 8, max: 8, align: "center" }, // Width

    { cls: ".MaterialGrade", min: 10, max: 25, align: "left" },   // Material Grade
    { cls: ".ItemGroup", min: 10, max: 30, align: "left" },   // Item Group

    { cls: ".JIJWI_SVOI_WH_Number", min: 10, max: 25, align: "left" }, // Warehouse

    { cls: ".JIJWI_SVOI_UoM_Number", min: 10, max: 15, align: "center" }, // UoM

    { cls: ".JIJWI_SVOI_Qty", min: 10, max: 20, align: "center" }, // Qty
    { cls: ".JIJWI_SVOI_UnitPrice", min: 10, max: 20, align: "right" },  // Unit Price
    { cls: ".JIJWI_SVOI_Amount", min: 13, max: 25, align: "right" },  // Amount

    { cls: ".JIJWI_SVOI_DeliveryDate", min: 10, max: 10, align: "center" }  // Delivery Date
];

const FreightItemTableFields = [
    { cls: ".JIFRT_SVOI_PRS_Number", min: 10, max: 25, align: "left", extraPadding: 28 },   // Process
    { cls: ".JIFRT_SVOI_FromWH_Number", min: 10, max: 25, align: "left", extraPadding: 28 }, // From WH
    { cls: ".JIFRT_SVOI_ToWH_Number", min: 10, max: 25, align: "left", extraPadding: 28 },   // To WH
    { cls: ".JIFRT_SVOI_UoM_Number", min: 10, max: 15, align: "center", extraPadding: 28 }, // UoM
    { cls: ".JIFRT_SVOI_Qty", min: 10, max: 20, align: "center" }, // Qty
    { cls: ".JIFRT_SVOI_Rate", min: 10, max: 20, align: "right", extraPadding: 28 },  // Rate
    { cls: ".JIFRT_SVOI_Amount", min: 13, max: 25, align: "right", extraPadding: 28 }  // Amount
];
let isMouseSelectingBuyer = false;
 
 
//#region item grid alignment 
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
    // JWI panel
    fitInputWidth($('[name="JWIHeader.JIJWI_SVOH_RegNo"]')[0], 20, 25);
    fitInputWidth($('[name="JWIHeader.JIJWI_SVOH_ServiceOrderNo"]')[0], 20, 25);
    fitInputWidth($('[name="JWIHeader.JIJWI_SVOH_MS_Number"]')[0], 20, 30);
    fitInputWidth($('[name="JWIHeader.JW_Customer_Name"]')[0], 40, 50);
    fitInputWidth($('#JWIHeaderPanel .Currency_Number')[0], 10, 10);
    fitInputWidth($('[name="JWIHeader.JIJWI_SVOH_PaymentTerms"]')[0], 30, 40);
    fitInputWidth($('[name="JWIHeader.JIJWI_SVOH_DeliveryTerms"]')[0], 30, 40);
    fitInputWidth($('[name="JWIHeader.JIJWI_SVOH_DeliveryMode"]')[0], 30, 40);
    fitInputWidth($('[name="JWIHeader.JIJWI_SVOH_Tax"]')[0], 40, 40);
    fitInputWidth($('[name="JWIHeader.JIJWI_SVOH_TDC"]')[0], 40, 40);
    fitInputWidth($('[name="JWIHeader.JIJWI_SVOH_Remarks"]')[0], 40, 40);

    // Freight panel
    fitInputWidth($('[name="FreightHeader.JIFRT_SVOH_RegNo"]')[0], 20, 25);
    fitInputWidth($('[name="FreightHeader.JIFRT_SVOH_ServiceOrderNo"]')[0], 20, 25);
    fitInputWidth($('[name="FreightHeader.JIFRT_SVOH_Category"]')[0], 20, 20);
    fitInputWidth($('[name="FreightHeader.JW_Customer_Name"]')[0], 40, 50);
    fitInputWidth($('#FreightHeaderPanel .Currency_Number')[0], 10, 10);
    fitInputWidth($('[name="FreightHeader.JIFRT_SVOH_PaymentTerms"]')[0], 30, 40);
    fitInputWidth($('[name="FreightHeader.JIFRT_SVOH_DeliveryTerms"]')[0], 30, 40);
    fitInputWidth($('[name="FreightHeader.JIFRT_SVOH_DeliveryMode"]')[0], 30, 40);
    fitInputWidth($('[name="FreightHeader.JIFRT_SVOH_Tax"]')[0], 40, 40);
    fitInputWidth($('[name="FreightHeader.JIFRT_SVOH_TDC"]')[0], 40, 40);
    fitInputWidth($('[name="FreightHeader.JIFRT_SVOH_Remarks"]')[0], 40, 40);
}
function LoadDefaultFormSetting() {
    $.ajax({
        url: '/jobinward/transactions/service-order/get',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response && response.success && response.data) {
                var data = response.data;

                // JWI panel defaults
                if (data.dfS_JISVOH_ServiceOrderNo) {
                    $('[name="JWIHeader.JIJWI_SVOH_ServiceOrderNo"]').val(data.dfS_JISVOH_ServiceOrderNo);
                }
                if (data.dfS_JISVOH_JW_Customer_Number) {
                    $('#JWIHeaderPanel .JW_Customer_Number').val(data.dfS_JISVOH_JW_Customer_Number);
                    $('[name="JWIHeader.JW_Customer_Name"]').val(data.cuS_Name);
                }
                if (data.dfS_JISVOH_Currency_Number) {
                    $('#JWIHeaderPanel .Currency_Number').val(data.dfS_JISVOH_Currency_Number).trigger('change');
                }
                if (data.dfS_JISVOH_PaymentTerms) {
                    $('[name="JWIHeader.JIJWI_SVOH_PaymentTerms"]').val(data.dfS_JISVOH_PaymentTerms);
                }
                if (data.dfS_JISVOH_DeliveryTerms) {
                    $('[name="JWIHeader.JIJWI_SVOH_DeliveryTerms"]').val(data.dfS_JISVOH_DeliveryTerms);
                }
                if (data.dfS_JISVOH_DeliveryMode) {
                    $('[name="JWIHeader.JIJWI_SVOH_DeliveryMode"]').val(data.dfS_JISVOH_DeliveryMode);
                }
                if (data.dfS_JISVOH_Tax) {
                    $('[name="JWIHeader.JIJWI_SVOH_Tax"]').val(data.dfS_JISVOH_Tax);
                }
                if (data.dfS_JISVOH_TDC) {
                    $('[name="JWIHeader.JIJWI_SVOH_TDC"]').val(data.dfS_JISVOH_TDC);
                }
                if (data.dfS_JISVOH_Remarks) {
                    $('[name="JWIHeader.JIJWI_SVOH_Remarks"]').val(data.dfS_JISVOH_Remarks);
                }
                if (data.dfS_JISVOH_MS_Number) {
                    $('[name="JWIHeader.JIJWI_SVOH_MS_Number"]').val(data.dfS_JISVOH_MS_Number).trigger('change');
                }
            }
        },
        error: function (xhr) {
            console.error('Failed to load default form setting', xhr);
        }
    });
}
$(document).on("change", ".RegDate", function () {
    GetServiceOrderNumber($(this));
});

function GetServiceOrderNumber($dateInput) {
    let date = $dateInput.val();
    if (!date)
        return;

    let $panel = $dateInput.closest(".card");
    let $regNo = $panel.find('input[name$=".JIJWI_SVOH_RegNo"], input[name$=".JIFRT_SVOH_RegNo"]');
    let orderType = $panel.attr("id") === "FreightHeaderPanel" ? "FREIGHT" : "JWI";

    $.ajax({
        url: "/serviceorder/transactions/serviceorder/next-jso-number",
        type: "GET",
        data: { JSODate: date, OrderType: orderType },
        success: function (response) {
            if (!response || response.trim() === "") {
                $regNo.val("");
                return;
            }
            $regNo.val(response);
        },
        error: function () {
        }
    });
}

$(document).ready(function () {
    LoadDefaultFormSetting();
    //#region GetDeliveryNoteNumber



   

    //#endregion
    $(document).on("mousedown", ".search-results tbody tr", function () {

        let rows = $(".search-results tbody tr");

        // Remove previous current row
        rows.removeClass("current-row");

        // Make clicked row the current row
        $(this).addClass("current-row");
    });
    //#region item code right pane search JISVOI_Item_Code
    // Item_Code – Keydown
    // 1. Tab/Enter – auto-select or "Too many choices"
    // 2. Arrow Up – highlight + move to top match
    // 3. Arrow Down – highlight + move to bottom match
    // 4. Enter/Escape, no record selected -> auto-select first record + close popup
    //#region Item_Code – Keydown/Mousedown/Focus Out: moved to <script> block
    //#endregion
    //#region Header_JISVOH_JW_Customer_Name
    // JW_Customer – Focus Out: moved to <script> block
    // JW_Customer – Keydown: moved to <script> block
    //#endregion

    //#region item grid alignment
    ApplyFieldWidths({
        fields: JWIItemTableFields,
        container: "#JWIItemTable",
        tempRow: "#JWITempRow",
        tableBody: "#JWITableBody",
        searchTable: "#tblsearch"
    });
    ApplyFieldWidths({
        fields: FreightItemTableFields,
        container: "#FreightItemTable",
        tempRow: "#FreightTempRow",
        tableBody: "#FreightTableBody",
        searchTable: "#tblsearch"
    });

    $(document).on("input change blur", "#JWIItemTable input, #JWIItemTable textarea, #JWIItemTable select", function () {
        ApplyFieldWidths({
            fields: JWIItemTableFields,
            container: "#JWIItemTable",
            tempRow: "#JWITempRow",
            tableBody: "#JWITableBody",
            searchTable: "#tblsearch"
        });
    });

    $(document).on("input change blur", "#FreightItemTable input, #FreightItemTable textarea, #FreightItemTable select", function () {
        ApplyFieldWidths({
            fields: FreightItemTableFields,
            container: "#FreightItemTable",
            tempRow: "#FreightTempRow",
            tableBody: "#FreightTableBody",
            searchTable: "#tblsearch"
        });
    });
    //#endregion

    //#endregion
  
    AutoFit();
    //#region Header AutoFit - KeyUp

    const jwiFieldWidths = {
        "JWIHeader.JIJWI_SVOH_RegNo": [20, 25],
        "JWIHeader.JIJWI_SVOH_ServiceOrderNo": [20, 25],
        "JWIHeader.JIJWI_SVOH_MS_Number": [20, 30],
        "JWIHeader.JW_Customer_Name": [40, 50],
        "JWIHeader.JIJWI_SVOH_PaymentTerms": [30, 40],
        "JWIHeader.JIJWI_SVOH_DeliveryTerms": [30, 40],
        "JWIHeader.JIJWI_SVOH_DeliveryMode": [30, 40],
        "JWIHeader.JIJWI_SVOH_Tax": [40, 40],
        "JWIHeader.JIJWI_SVOH_TDC": [40, 40],
        "JWIHeader.JIJWI_SVOH_Remarks": [40, 40]
    };

    const freightFieldWidths = {
        "FreightHeader.JIFRT_SVOH_RegNo": [20, 25],
        "FreightHeader.JIFRT_SVOH_ServiceOrderNo": [20, 25],
        "FreightHeader.JIFRT_SVOH_Category": [20, 20],
        "FreightHeader.JW_Customer_Name": [40, 50],
        "FreightHeader.JIFRT_SVOH_PaymentTerms": [30, 40],
        "FreightHeader.JIFRT_SVOH_DeliveryTerms": [30, 40],
        "FreightHeader.JIFRT_SVOH_DeliveryMode": [30, 40],
        "FreightHeader.JIFRT_SVOH_Tax": [40, 40],
        "FreightHeader.JIFRT_SVOH_TDC": [40, 40],
        "FreightHeader.JIFRT_SVOH_Remarks": [40, 40]
    };

    $(document).on("keyup change input",
        Object.keys(jwiFieldWidths).map(n => `[name="${n}"]`).join(", "),
        function () {
            const [min, max] = jwiFieldWidths[this.name];
            fitInputWidth(this, min, max);
        });

    $(document).on("keyup change input",
        Object.keys(freightFieldWidths).map(n => `[name="${n}"]`).join(", "),
        function () {
            const [min, max] = freightFieldWidths[this.name];
            fitInputWidth(this, min, max);
        });

    // Currency dropdown width - class based (shared by both panels)
    $(document).on("keyup change input", ".Currency_Number", function () {
        fitInputWidth(this, 10, 10);
    });

    //#endregion

    // Removed: dead/legacy duplicate keydown handler. It targeted
   

 
    //#region Initialize Flatpickr
    InitializeGstFlatpickrs();

 
    DateBind();
    //#region onkeypress qty and unit
    $(document).on("keyup change", ".JIJWI_SVOI_Qty, .JIJWI_SVOI_UnitPrice", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat((row.find(".JIJWI_SVOI_Qty").val() || "0").replace(/,/g, "")) || 0;
        let price = parseFloat((row.find(".JIJWI_SVOI_UnitPrice").val() || "0").replace(/,/g, "")) || 0;

        let amount = qty * price;

        row.find(".JIJWI_SVOI_Amount").val(formatIndianCurrency(amount));

        JWICalculateTotal();

        JWIAutoAddRow(row);
    });

    $(document).on("keyup change", ".JIFRT_SVOI_Qty, .JIFRT_SVOI_Rate", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat((row.find(".JIFRT_SVOI_Qty").val() || "0").replace(/,/g, "")) || 0;
        let rate = parseFloat((row.find(".JIFRT_SVOI_Rate").val() || "0").replace(/,/g, "")) || 0;

        let amount = qty * rate;

        row.find(".JIFRT_SVOI_Amount").val(formatIndianCurrency(amount));

        FreightCalculateTotal();

        FreightAutoAddRow(row);
    });

    //#region comma format on focusout
    $(document).on("focusout", ".JIJWI_SVOI_Qty, .JIJWI_SVOI_UnitPrice, .JIJWI_SVOI_Amount", function () {

        let type = $(this).hasClass("JIJWI_SVOI_Qty") ? "q" : "c";

        $(this).val(addComma($(this).val(), type));
    });

    $(document).on("focusout", ".JIFRT_SVOI_Qty, .JIFRT_SVOI_Rate, .JIFRT_SVOI_Amount", function () {

        let type = $(this).hasClass("JIFRT_SVOI_Qty") ? "q" : "c";

        $(this).val(addComma($(this).val(), type));
    });
    //#endregion
    //#endregion
    //#region add row item grid
    let jwiRowIndex = 1;
    let freightRowIndex = 1;

    $("#AddRowButton").on("click", function () {

        let isValid = true;

        $("#JWIItemTable tbody tr.JWINewRow:last").find("input, select").each(function () {

            let el = $(this);

            if (el.hasClass("JIJWI_SVOI_IsDeleted")) return;

            if (el.hasClass("JIJWI_SVOI_Item_Code")) {
                if (!el.val()) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JIJWI_SVOI_Qty")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JIJWI_SVOI_UnitPrice")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JIJWI_SVOI_PRS_Number")) {
                if (!el.val() || el.val() === "0") { isValid = false; el.focus(); return false; }
            }
        });

        if (!isValid) {
            alert("Please fill required fields before adding new row.");
            return;
        }

        let $newRow = $("#JWITempRow").clone();

        // Clean up any flatpickr-generated elements from the template before reusing
        $newRow.find(".flatpickr-input").remove();
        $newRow.find("input.datepicker").removeClass("flatpickr-input").show();

        $newRow.removeAttr("id");
        $newRow.removeAttr("style");
        $newRow.addClass("JWINewRow").addClass("NewRow");

        $newRow.find("input, select").each(function () {

            let el = $(this);

            if (el.attr("type") === "checkbox") el.prop("checked", false);

            if (!el.hasClass("JIJWI_SVOI_IsDeleted")) el.val("");

            let name = el.attr("name");
            if (name) {
                el.attr("name", name.replace(/\[\d+\]/, `[${jwiRowIndex}]`));
            }
        });

        $newRow.attr("data-rowid", new Date().getTime());

        $("#JWITableBody").append($newRow);

        $newRow.find(".datepicker").flatpickr({
            dateFormat: "d-M-Y",
            altInput: true,
            altFormat: "d-M-Y",
            allowInput: true,
            defaultDate: new Date()
        });

        jwiRowIndex++;

        JWICalculateTotal();

        ApplyFieldWidths({
            fields: JWIItemTableFields,
            container: "#JWIItemTable",
            tempRow: "#JWITempRow",
            tableBody: "#JWITableBody",
            searchTable: "#tblsearch"
        });
    });

    $("#AddRowButtonFreight").on("click", function () {

        let isValid = true;

        $("#FreightItemTable tbody tr.FreightNewRow:last").find("input, select").each(function () {

            let el = $(this);

            if (el.hasClass("JIFRT_SVOI_IsDeleted")) return;

            if (el.hasClass("JIFRT_SVOI_FromWH_Number")) {
                if (!el.val() || el.val() === "0") { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JIFRT_SVOI_ToWH_Number")) {
                if (!el.val() || el.val() === "0") { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JIFRT_SVOI_Qty")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JIFRT_SVOI_Rate")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JIFRT_SVOI_PRS_Number")) {
                if (!el.val() || el.val() === "0") { isValid = false; el.focus(); return false; }
            }
        });

        if (!isValid) {
            alert("Please fill required fields before adding new row.");
            return;
        }

        let $newRow = $("#FreightTempRow").clone();

        $newRow.removeAttr("id");
        $newRow.removeAttr("style");
        $newRow.addClass("FreightNewRow").addClass("NewRow");

        $newRow.find("input, select").each(function () {

            let el = $(this);

            if (el.attr("type") === "checkbox") el.prop("checked", false);

            if (!el.hasClass("JIFRT_SVOI_IsDeleted")) el.val("");

            let name = el.attr("name");
            if (name) {
                el.attr("name", name.replace(/\[\d+\]/, `[${freightRowIndex}]`));
            }
        });

        $newRow.attr("data-rowid", new Date().getTime());

        $("#FreightTableBody").append($newRow);

        freightRowIndex++;

        FreightCalculateTotal();

        ApplyFieldWidths({
            fields: FreightItemTableFields,
            container: "#FreightItemTable",
            tempRow: "#FreightTempRow",
            tableBody: "#FreightTableBody",
            searchTable: "#tblsearch"
        });
    });
    //#endregion add row item grid

    $(document).on("click", ".RowRemove", function () {

        let row = $(this).closest("tr");

        if (row.closest("table").attr("id") === "JWIItemTable") {
            row.find(".JIJWI_SVOI_IsDeleted").val("1");
            row.hide();
            JWICalculateTotal();
        } else {
            row.find(".JIFRT_SVOI_IsDeleted").val("1");
            row.hide();
            FreightCalculateTotal();
        }
    });

    //#region Save Function
    $("#btnSave, #btnSaveFreight").on("click", function (e) {

        let serviceType = $('input[name="ServiceType"]:checked').val();

        let isHeaderValid, duplicateMessage, isGridValid, model;

        if (serviceType === "FREIGHT") {

            isHeaderValid = ValidateFreightHeader();
            if (!isHeaderValid) { e.preventDefault(); return false; }

            isGridValid = FreightValidateItemGrid();
            if (!isGridValid) { e.preventDefault(); return false; }

            duplicateMessage = FreightValidateDuplicateItemCombination();
            if (duplicateMessage) { e.preventDefault(); showAlert(duplicateMessage); return false; }

            model = {
                ServiceType: "FREIGHT",
                JWIHeader: null,
                JWIItems: [],
                FreightHeader: CreateFreightHeaderModel(),
                FreightItems: CreateFreightItemsModel()
            };

        } else {

            isHeaderValid = ValidateJWIHeader();
            if (!isHeaderValid) { e.preventDefault(); return false; }

            isGridValid = JWIValidateItemGrid();
            if (!isGridValid) { e.preventDefault(); return false; }

            duplicateMessage = JWIValidateDuplicateItemCombination();
            if (duplicateMessage) { e.preventDefault(); showAlert(duplicateMessage); return false; }

            model = {
                ServiceType: "JWI",
                JWIHeader: CreateJWIHeaderModel(),
                JWIItems: CreateJWIItemsModel(),
                FreightHeader: null,
                FreightItems: []
            };
        }

        console.log(JSON.stringify(model));

        $.ajax({
            url: '/ServiceOrder/SaveServiceOrder',
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
            },

            error: function (xhr) {
                console.log(xhr.responseText);
            }
        });

    });
    //#endregion

    //#region remove checked rows
    $("#RemoveItemRowButton").on("click", function () {

        let checkedRows = $("#JWIItemTable tbody tr.JWINewRow:visible").has(".CheckItem:checked");
        let totalVisibleRows = $("#JWIItemTable tbody tr.JWINewRow:visible").length;

        if (checkedRows.length === 0) { alert("Please select row."); return; }
        if ((totalVisibleRows - checkedRows.length) <= 0) { alert("At least one row required."); return; }
        if (checkedRows.length > 1) { alert("Please select only one row"); return; }

        checkedRows.each(function () {

            let currentRow = $(this);
            let itemNumber = currentRow.find(".JIJWI_SVOI_Number").val();

            if (itemNumber && itemNumber !== "0") {
                currentRow.find(".JIJWI_SVOI_IsDeleted").val("1");
                currentRow.hide();
            } else {
                currentRow.remove();
            }
        });

        JWICalculateTotal();
    });

    $("#RemoveItemRowButtonFreight").on("click", function () {

        let checkedRows = $("#FreightItemTable tbody tr.FreightNewRow:visible").has(".CheckItem:checked");
        let totalVisibleRows = $("#FreightItemTable tbody tr.FreightNewRow:visible").length;

        if (checkedRows.length === 0) { alert("Please select row."); return; }
        if ((totalVisibleRows - checkedRows.length) <= 0) { alert("At least one row required."); return; }
        if (checkedRows.length > 1) { alert("Please select only one row"); return; }

        checkedRows.each(function () {

            let currentRow = $(this);
            let itemNumber = currentRow.find(".JIFRT_SVOI_Number").val();

            if (itemNumber && itemNumber !== "0") {
                currentRow.find(".JIFRT_SVOI_IsDeleted").val("1");
                currentRow.hide();
            } else {
                currentRow.remove();
            }
        });

        FreightCalculateTotal();
    });
    //#endregion
    let jwiFirstRow = $("#JWIItemTable tbody tr.JWINewRow:first");
    JWIAutoAddRow(jwiFirstRow);

    let freightFirstRow = $("#FreightItemTable tbody tr.FreightNewRow:first");
    FreightAutoAddRow(freightFirstRow);
});

//#region validation
//#region validation
function JWIValidateDuplicateItemCombination() {

    let combinationMap = {};
    let duplicateMessages = [];

    $("#JWIItemTable tbody tr.JWINewRow").each(function (index) {

        let row = $(this);

        if (row.find(".JIJWI_SVOI_IsDeleted").val() == "1") return;
        if (!row.find(".JIJWI_SVOI_Item_Number").val()) return;

        let prs = row.find(".JIJWI_SVOI_PRS_Number").val() || 0;
        let item = row.find(".JIJWI_SVOI_Item_Number").val() || 0;
        let uom = row.find(".JIJWI_SVOI_UoM_Number").val() || 0;

        let key = prs + "_" + item + "_" + uom;
        let rowNo = index + 1;

        if (!combinationMap[key]) {
            combinationMap[key] = [];
        }

        combinationMap[key].push(rowNo);
    });

    $.each(combinationMap, function (key, rows) {
        if (rows.length > 1) {
            duplicateMessages.push(
                "Row # " + rows.join(", ") + " have the same combination of Process, Item and UoM"
            );
        }
    });

    if (duplicateMessages.length > 0) {
        return duplicateMessages.join("\n");
    }

    return "";
}

function FreightValidateDuplicateItemCombination() {

    let combinationMap = {};
    let duplicateMessages = [];

    $("#FreightItemTable tbody tr.FreightNewRow").each(function (index) {

        let row = $(this);

        if (row.find(".JIFRT_SVOI_IsDeleted").val() == "1") return;

        let prs = row.find(".JIFRT_SVOI_PRS_Number").val() || 0;
        let fromWH = row.find(".JIFRT_SVOI_FromWH_Number").val() || 0;
        let toWH = row.find(".JIFRT_SVOI_ToWH_Number").val() || 0;

        if (fromWH === 0 && toWH === 0) return;

        let key = prs + "_" + fromWH + "_" + toWH;
        let rowNo = index + 1;

        if (!combinationMap[key]) {
            combinationMap[key] = [];
        }

        combinationMap[key].push(rowNo);
    });

    $.each(combinationMap, function (key, rows) {
        if (rows.length > 1) {
            duplicateMessages.push(
                "Row # " + rows.join(", ") + " have the same combination of Process, From WH and To WH"
            );
        }
    });

    if (duplicateMessages.length > 0) {
        return duplicateMessages.join("\n");
    }

    return "";
}
//#endregion
//#endregion
//#region auto add row function
function JWIAutoAddRow(currentRow) {

    let qty = parseFloat(removeComma(currentRow.find(".JIJWI_SVOI_Qty").val())) || 0;
    let price = parseFloat(removeComma(currentRow.find(".JIJWI_SVOI_UnitPrice").val())) || 0;

    let itemCode = currentRow.find(".JIJWI_SVOI_Item_Code").val();
    let prsNo = currentRow.find(".JIJWI_SVOI_PRS_Number").val();

    let isRowValid =
        itemCode &&
        qty > 0 &&
        price > 0 &&
        prsNo &&
        prsNo !== "0";

    let isLastRow =
        currentRow.is("#JWIItemTable tbody tr.JWINewRow:last");

    if (isRowValid && isLastRow) {

        let nextRow = currentRow.next("tr");

        if (nextRow.length === 0) {
            $("#AddRowButton").trigger("click");
        }
    }
}

function FreightAutoAddRow(currentRow) {

    let qty = parseFloat(removeComma(currentRow.find(".JIFRT_SVOI_Qty").val())) || 0;
    let rate = parseFloat(removeComma(currentRow.find(".JIFRT_SVOI_Rate").val())) || 0;

    let fromWH = currentRow.find(".JIFRT_SVOI_FromWH_Number").val();
    let prsNo = currentRow.find(".JIFRT_SVOI_PRS_Number").val();

    let isRowValid =
        fromWH && fromWH !== "0" &&
        qty > 0 &&
        rate > 0 &&
        prsNo &&
        prsNo !== "0";

    let isLastRow =
        currentRow.is("#FreightItemTable tbody tr.FreightNewRow:last");

    if (isRowValid && isLastRow) {

        let nextRow = currentRow.next("tr");

        if (nextRow.length === 0) {
            $("#AddRowButtonFreight").trigger("click");
        }
    }
}
//#endregion auto add row function

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
    $("#JWIItemTable tbody").empty();
    $("#FreightItemTable tbody").empty();
    $(".jwcustomer-search-results").hide().html("");

}
//#endregion
function InitializeGstFlatpickrs() {
    $(".datepicker").flatpickr({
        dateFormat: "d-M-Y",   // 30-Apr-2026
        altInput: true,        // shows formatted date
        altFormat: "d-M-Y",   // display format
        allowInput: true,     // user can type manually
        defaultDate: new Date() // today by default
    });
}
function SetRowDate($row) {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');

    var months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    var formattedDate =
        day + "-" + months[today.getMonth()] + "-" + today.getFullYear();

    var fp = $row.find(".datepicker")[0]?._flatpickr;

    if (fp) {
        fp.setDate(formattedDate, true, "d-M-Y");
    }
}
function DateBind() {
    var today = new Date();

    var day = String(today.getDate()).padStart(2, '0');

    var months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    var formattedDate =
        day + "-" + months[today.getMonth()] + "-" + today.getFullYear();

    // JWI panel
    var jwiRegDateInput = $('[name="JWIHeader.JIJWI_SVOH_RegDate"]')[0];
    var jwiRegDate = jwiRegDateInput?._flatpickr;
    if (jwiRegDate) jwiRegDate.setDate(formattedDate, true, "d-M-Y");

    var jwiSODateInput = $('[name="JWIHeader.JIJWI_SVOH_ServiceOrderDate"]')[0];
    var jwiSODate = jwiSODateInput?._flatpickr;
    if (jwiSODate) jwiSODate.setDate(formattedDate, true, "d-M-Y");

    // Freight panel
    var frtRegDateInput = $('[name="FreightHeader.JIFRT_SVOH_RegDate"]')[0];
    var frtRegDate = frtRegDateInput?._flatpickr;
    if (frtRegDate) frtRegDate.setDate(formattedDate, true, "d-M-Y");

    var frtSODateInput = $('[name="FreightHeader.JIFRT_SVOH_ServiceOrderDate"]')[0];
    var frtSODate = frtSODateInput?._flatpickr;
    if (frtSODate) frtSODate.setDate(formattedDate, true, "d-M-Y");

    if (jwiRegDateInput) GetServiceOrderNumber($(jwiRegDateInput));
    if (frtRegDateInput) GetServiceOrderNumber($(frtRegDateInput));
}
function CreateJWIHeaderModel() {

    return {
        JIJWI_SVOH_Number: 0,

        JIJWI_SVOH_RegNo:
            $('[name="JWIHeader.JIJWI_SVOH_RegNo"]').val(),

        JIJWI_SVOH_RegDate:
            $('[name="JWIHeader.JIJWI_SVOH_RegDate"]').val()
                ? new Date($('[name="JWIHeader.JIJWI_SVOH_RegDate"]').val()).toISOString()
                : null,

        JIJWI_SVOH_ServiceOrderNo:
            $('[name="JWIHeader.JIJWI_SVOH_ServiceOrderNo"]').val(),

        JIJWI_SVOH_ServiceOrderDate:
            $('[name="JWIHeader.JIJWI_SVOH_ServiceOrderDate"]').val()
                ? new Date($('[name="JWIHeader.JIJWI_SVOH_ServiceOrderDate"]').val()).toISOString()
                : null,

        JIJWI_SVOH_MS_Number:
            parseInt($('[name="JWIHeader.JIJWI_SVOH_MS_Number"]').val()) || null,

        JIJWI_SVOH_JW_Customer_Number:
            parseInt($('#JWIHeaderPanel .JW_Customer_Number').val()) || 0,

        JIJWI_SVOH_Currency_Number:
            parseInt($('#JWIHeaderPanel .Currency_Number').val()) || 0,

        JIJWI_SVOH_PaymentTerms:
            $('[name="JWIHeader.JIJWI_SVOH_PaymentTerms"]').val(),

        JIJWI_SVOH_DeliveryTerms:
            $('[name="JWIHeader.JIJWI_SVOH_DeliveryTerms"]').val(),

        JIJWI_SVOH_DeliveryMode:
            $('[name="JWIHeader.JIJWI_SVOH_DeliveryMode"]').val(),

        JIJWI_SVOH_Tax:
            $('[name="JWIHeader.JIJWI_SVOH_Tax"]').val(),

        JIJWI_SVOH_TDC:
            $('[name="JWIHeader.JIJWI_SVOH_TDC"]').val(),

        JIJWI_SVOH_Remarks:
            $('[name="JWIHeader.JIJWI_SVOH_Remarks"]').val()
    };
}

function CreateJWIItemsModel() {

    let items = [];

    $("#JWIItemTable tbody tr.JWINewRow").each(function () {

        let row = $(this);

        if (row.find(".JIJWI_SVOI_IsDeleted").val() == "1") return;
        if (!row.find(".JIJWI_SVOI_Item_Number").val()) return;

        items.push({
            JIJWI_SVOI_Number:
                parseInt(row.find(".JIJWI_SVOI_Number").val()) || 0,

            JIJWI_SVOI_IsDeleted: false,

            JIJWI_SVOI_PRS_Number:
                parseInt(row.find(".JIJWI_SVOI_PRS_Number").val()) || 0,

            JIJWI_SVOI_Item_Number:
                parseInt(row.find(".JIJWI_SVOI_Item_Number").val()) || 0,

            JIJWI_SVOI_WH_Number:
                parseInt(row.find(".JIJWI_SVOI_WH_Number").val()) || null,

            JIJWI_SVOI_UoM_Number:
                parseInt(row.find(".JIJWI_SVOI_UoM_Number").val()) || 0,

            JIJWI_SVOI_Qty:
                parseFloat(removeComma(row.find(".JIJWI_SVOI_Qty").val())) || 0,

            JIJWI_SVOI_UnitPrice:
                parseFloat(removeComma(row.find(".JIJWI_SVOI_UnitPrice").val())) || 0,

            JIJWI_SVOI_Amount:
                parseFloat(removeComma(row.find(".JIJWI_SVOI_Amount").val())) || 0,

            JIJWI_SVOI_DeliveryDate:
                row.find(".JIJWI_SVOI_DeliveryDate").val()
                    ? new Date(row.find(".JIJWI_SVOI_DeliveryDate").val()).toISOString()
                    : null,

            JIJWI_SVOI_Category: null
        });
    });

    return items;
}

function CreateFreightHeaderModel() {

    return {
        JIFRT_SVOH_Number: 0,

        JIFRT_SVOH_RegNo:
            $('[name="FreightHeader.JIFRT_SVOH_RegNo"]').val(),

        JIFRT_SVOH_RegDate:
            $('[name="FreightHeader.JIFRT_SVOH_RegDate"]').val()
                ? new Date($('[name="FreightHeader.JIFRT_SVOH_RegDate"]').val()).toISOString()
                : null,

        JIFRT_SVOH_ServiceOrderNo:
            $('[name="FreightHeader.JIFRT_SVOH_ServiceOrderNo"]').val(),

        JIFRT_SVOH_ServiceOrderDate:
            $('[name="FreightHeader.JIFRT_SVOH_ServiceOrderDate"]').val()
                ? new Date($('[name="FreightHeader.JIFRT_SVOH_ServiceOrderDate"]').val()).toISOString()
                : null,

        JIFRT_SVOH_Category:
            $('[name="FreightHeader.JIFRT_SVOH_Category"]').val() === "RN" ? "RECEIPT NOTE" : "DELIVERY NOTE",

        JIFRT_SVOH_JW_Customer_Number:
            parseInt($('#FreightHeaderPanel .JW_Customer_Number').val()) || 0,

        JIFRT_SVOH_Currency_Number:
            parseInt($('#FreightHeaderPanel .Currency_Number').val()) || 0,

        JIFRT_SVOH_PaymentTerms:
            $('[name="FreightHeader.JIFRT_SVOH_PaymentTerms"]').val(),

        JIFRT_SVOH_DeliveryTerms:
            $('[name="FreightHeader.JIFRT_SVOH_DeliveryTerms"]').val(),

        JIFRT_SVOH_DeliveryMode:
            $('[name="FreightHeader.JIFRT_SVOH_DeliveryMode"]').val(),

        JIFRT_SVOH_Tax:
            $('[name="FreightHeader.JIFRT_SVOH_Tax"]').val(),

        JIFRT_SVOH_TDC:
            $('[name="FreightHeader.JIFRT_SVOH_TDC"]').val(),

        JIFRT_SVOH_Remarks:
            $('[name="FreightHeader.JIFRT_SVOH_Remarks"]').val()
    };
}

function CreateFreightItemsModel() {

    let selectedCategory =
        $('select[name="FreightHeader.JIFRT_SVOH_Category"]').val() === "RN" ? "RECEIPT NOTE" : "DELIVERY NOTE";
    let items = [];
    $("#FreightItemTable tbody tr.FreightNewRow").each(function () {

        let row = $(this);

        if (row.find(".JIFRT_SVOI_IsDeleted").val() == "1") return;

        let prs = row.find(".JIFRT_SVOI_PRS_Number").val();
        let fromWH = row.find(".JIFRT_SVOI_FromWH_Number").val();

        // empty row skip
        if ((!prs || prs === "0") && (!fromWH || fromWH === "0")) return;

        items.push({
            JIFRT_SVOI_Number:
                parseInt(row.find(".JIFRT_SVOI_Number").val()) || 0,
            JIFRT_SVOI_IsDeleted: false,

            JIFRT_SVOI_Category: selectedCategory,

            JIFRT_SVOI_PRS_Number:
                parseInt(prs) || 0,

            JIFRT_SVOI_FromWH_Number:
                parseInt(fromWH) || null,

            JIFRT_SVOI_ToWH_Number:
                parseInt(row.find(".JIFRT_SVOI_ToWH_Number").val()) || null,

            JIFRT_SVOI_UoM_Number:
                parseInt(row.find(".JIFRT_SVOI_UoM_Number").val()) || 0,

            JIFRT_SVOI_Qty:
                parseFloat(removeComma(row.find(".JIFRT_SVOI_Qty").val())) || 0,

            JIFRT_SVOI_Rate:
                parseFloat(removeComma(row.find(".JIFRT_SVOI_Rate").val())) || 0,

            JIFRT_SVOI_Amount:
                parseFloat(removeComma(row.find(".JIFRT_SVOI_Amount").val())) || 0
        });
    });

    return items;
}

//#region SUBMIT VALIDATION
function ValidateJWIHeader() {

    if ($('[name="JWIHeader.JIJWI_SVOH_RegNo"]').val().trim() === "") {
        showAlert('Register No. is required', '[name="JWIHeader.JIJWI_SVOH_RegNo"]');
        return false;
    }

    if ($('[name="JWIHeader.JIJWI_SVOH_RegDate"]').val().trim() === "") {
        showAlert('Register Date is required', '[name="JWIHeader.JIJWI_SVOH_RegDate"]');
        return false;
    }

    if ($('[name="JWIHeader.JIJWI_SVOH_ServiceOrderNo"]').val().trim() === "") {
        showAlert('Service Order No. is required', '[name="JWIHeader.JIJWI_SVOH_ServiceOrderNo"]');
        return false;
    }

    if ($('[name="JWIHeader.JIJWI_SVOH_ServiceOrderDate"]').val().trim() === "") {
        showAlert('Service Order Date is required', '[name="JWIHeader.JIJWI_SVOH_ServiceOrderDate"]');
        return false;
    }

    if (
        $('#JWIHeaderPanel .JW_Customer_Number').val().trim() === "" ||
        $('[name="JWIHeader.JW_Customer_Name"]').val().trim() === ""
    ) {
        showAlert('JW Customer is required', '[name="JWIHeader.JW_Customer_Name"]');
        return false;
    }

    if (
        $('#JWIHeaderPanel .Currency_Number').val() === "" ||
        $('#JWIHeaderPanel .Currency_Number').val() === "0"
    ) {
        showAlert('Currency is required', '#JWIHeaderPanel .Currency_Number');
        return false;
    }

    return true;
}

function ValidateFreightHeader() {

    if ($('[name="FreightHeader.JIFRT_SVOH_RegNo"]').val().trim() === "") {
        showAlert('Register No. is required', '[name="FreightHeader.JIFRT_SVOH_RegNo"]');
        return false;
    }

    if ($('[name="FreightHeader.JIFRT_SVOH_RegDate"]').val().trim() === "") {
        showAlert('Register Date is required', '[name="FreightHeader.JIFRT_SVOH_RegDate"]');
        return false;
    }

    if ($('[name="FreightHeader.JIFRT_SVOH_ServiceOrderNo"]').val().trim() === "") {
        showAlert('Service Order No. is required', '[name="FreightHeader.JIFRT_SVOH_ServiceOrderNo"]');
        return false;
    }

    if ($('[name="FreightHeader.JIFRT_SVOH_ServiceOrderDate"]').val().trim() === "") {
        showAlert('Service Order Date is required', '[name="FreightHeader.JIFRT_SVOH_ServiceOrderDate"]');
        return false;
    }

    if (
        $('#FreightHeaderPanel .JW_Customer_Number').val().trim() === "" ||
        $('[name="FreightHeader.JW_Customer_Name"]').val().trim() === ""
    ) {
        showAlert('JW Customer is required', '[name="FreightHeader.JW_Customer_Name"]');
        return false;
    }

    if (
        $('#FreightHeaderPanel .Currency_Number').val() === "" ||
        $('#FreightHeaderPanel .Currency_Number').val() === "0"
    ) {
        showAlert('Currency is required', '#FreightHeaderPanel .Currency_Number');
        return false;
    }

    return true;
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
    var $panel = $(inputElement).closest(".card");
    var RegDate = $panel.find(".RegDate").val();
    var resultsDiv = $("#RightPane").find(".buyer-search-results");

    if (buyerSearchXHR) {
        buyerSearchXHR.abort();
    }

    buyerSearchXHR = $.ajax({
        url: '/jobinward/transactions/delivery-note/cutomer',
        type: 'GET',
        data: {
            Buyer: JWCustomer,
            SIHDate: RegDate
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
                  // matched nothing — its manual $(...).val() lines
                  // below were the only thing actually working).
              });
                table.find("tbody").on("mousedown", "tr", function (e) {

                    e.preventDefault();

                    const clickedCust = $(this).data("customer");
                    isMouseSelectingBuyer = true;

                    $("#BuyerMessage").hide().text("");

                    $(inputElement).val(clickedCust.cuS_Name);

                    $panel.find(".JW_Customer_Number")
                        .val(clickedCust.cuS_Number);

                    let $currency = $panel.find(".Currency_Number");
                    $currency
                        .val(clickedCust.cuS_CUR_Number)
                        .trigger("change");

                    $("#RightPane").removeClass("show");
                    $("#RightPane .buyer-search-results").hide();

                    setTimeout(function () {
                        $currency.focus();
                        isMouseSelectingBuyer = false;
                    }, 100);
                });
                //-------------------------------------------------
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

function OnInputItem(inputElement) {
    SearchServiceOrderItem(inputElement);
}

function OnFocusItem(inputElement) {

    if (isSelectingItem) {
        return;
    }

    // Always re-bind search to the currently focused row,
    // even if the panel is already open from a different row's search.
    SearchServiceOrderItem(inputElement);
}
function SearchServiceOrderItem(inputElement) {

    let itemCode = inputElement.value.trim();
    let row = $(inputElement).closest("tr");
    let resultsDiv = $("#RightPane_Item").find(".search-results");
    let material = $('[name="JWIHeader.JIJWI_SVOH_MS_Number"]').val();

    if (!material) return;

    if (itemSearchXHR) {
        itemSearchXHR.abort();
    }

    itemSearchXHR = $.ajax({
        url: '/jobinward/transactions/service-order/item',
        type: 'GET',
        data: {
            ItemCode: itemCode,
            MS: material
        },
        success: function (data) {

            resultsDiv.empty();

            if (data && data.length > 0) {

                $("#RightPane_Item").addClass("show");
                resultsDiv.show();

                let table = $(`
<div class="card-body batchPopup modal-content p-0 table-responsive" style="z-index:999;">
    <table class="table table-bordered table-hover table-fixed table-grid mb-0" id="tblsearch">
        <thead>
            <tr class="table-info">
                <th style="width:30%;">Item Code</th>
                <th style="width:70%;">Description</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
</div>
`);

                $.each(data, function (i, item) {

                    let tr = $(`
<tr style="height:24px;cursor:pointer;">
    <td style="width:30%;">${item.itemCode}</td>
    <td style="width:70%;">${item.itemDescription}</td>
</tr>
`);

                    // Changed from "click" to "mousedown" so that the
                    // common HandleSearchSelection's rows.trigger("mousedown")
                    // (used for Tab/Enter auto-select and "Too many
                    // choices") actually fires row selection here.
                    tr.on("mousedown", function (e) {

                        e.preventDefault();

                        isSelectingItem = true;

                        row.find(".JIJWI_SVOI_Item_Code").val(item.itemCode);
                        row.find(".JIJWI_SVOI_Item_Number").val(item.itemNumber);

                        row.find(".Description").val(item.itemDescription);
                        row.find(".OuterDia").val(item.outerDia);
                        row.find(".Thickness").val(item.thickness);
                        row.find(".Length").val(item.length);
                        row.find(".Width").val(item.width);
                        row.find(".MaterialGrade").val(item.materialGrade);
                        row.find(".ItemGroup").val(item.itemGroup);
                        row.find(".JIJWI_SVOI_WH_Number").val(item.saleWarehouse);
                        row.find(".JIJWI_SVOI_UoM_Number").val(item.uoM);

                        row.find(".JIJWI_SVOI_Qty").focus();

                        setTimeout(function () {
                            isSelectingItem = false;
                        }, 100);

                        resultsDiv.hide();
                        $("#RightPane_Item").removeClass("show");
                    });

                    table.find("tbody").append(tr);

                });

                // IMPORTANT
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

                //==============================
                // Match Row Highlight
                //==============================

                let rows = resultsDiv.find("tbody tr");

                rows.removeClass("match-row current-row");

                $(inputElement).removeData("selectedIndex");

                let searchText = itemCode.toLowerCase();

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

                } else {

                    $(inputElement).removeData("firstMatch");
                    $(inputElement).removeData("lastMatch");
                }

            }
            else {

              

                resultsDiv.append(GetItemEmptyView());
                $("#RightPane_Item").addClass("show");
                resultsDiv.show();
            }
        },
        error: function (xhr, status) {

            if (status === "abort") {
                return;
            }
            resultsDiv.html("Error loading data.");
            resultsDiv.show();
        }
    });
}
//#region Calculate Total
function JWICalculateTotal() {

    let totalQty = 0;
    let totalAmount = 0;

    $("#JWIItemTable tbody tr.JWINewRow").each(function () {

        let row = $(this);

        if (row.find(".JIJWI_SVOI_IsDeleted").val() === "1" ||
            row.find(".JIJWI_SVOI_IsDeleted").val() === "true") {
            return;
        }

        let qty = parseFloat(removeComma(row.find(".JIJWI_SVOI_Qty").val())) || 0;
        let unitPrice = parseFloat(removeComma(row.find(".JIJWI_SVOI_UnitPrice").val())) || 0;
        let amount = qty * unitPrice;

        row.find(".JIJWI_SVOI_Amount").val(addComma(amount, "c"));

        totalQty += qty;
        totalAmount += amount;
    });

    $("#JWITotalQty").val(addComma(totalQty, "q"));
    $("#JWITotalAmount").val(addComma(totalAmount, "c"));
}

function FreightCalculateTotal() {

    let totalQty = 0;
    let totalAmount = 0;

    $("#FreightItemTable tbody tr.FreightNewRow").each(function () {

        let row = $(this);

        if (row.find(".JIFRT_SVOI_IsDeleted").val() === "1" ||
            row.find(".JIFRT_SVOI_IsDeleted").val() === "true") {
            return;
        }

        let qty = parseFloat(removeComma(row.find(".JIFRT_SVOI_Qty").val())) || 0;
        let rate = parseFloat(removeComma(row.find(".JIFRT_SVOI_Rate").val())) || 0;
        let amount = qty * rate;

        row.find(".JIFRT_SVOI_Amount").val(addComma(amount, "c"));

        totalQty += qty;
        totalAmount += amount;
    });

    $("#FreightTotalQty").val(addComma(totalQty, "q"));
    $("#FreightTotalAmount").val(addComma(totalAmount, "c"));
}
//#endregion Calculate Total

//#region VALIDATE ITEM GRID

function JWIValidateItemGrid() {

    let hasValidRow = false;
    let isValid = true;
    let rowNumber = 0;

    $("#JWIItemTable tbody tr").each(function () {

        let row = $(this);

        if (row.attr("id") === "JWITempRow") return;
        if (row.find(".JIJWI_SVOI_IsDeleted").val() === "1") return;

        let process = row.find(".JIJWI_SVOI_PRS_Number").val();
        let itemCode = row.find(".JIJWI_SVOI_Item_Code").val();
        let qty = row.find(".JIJWI_SVOI_Qty").val();
        let unitPrice = row.find(".JIJWI_SVOI_UnitPrice").val();

        let isRowStarted =
            (process && process.trim() !== "") ||
            (itemCode && itemCode.trim() !== "") ||
            (qty && qty.trim() !== "") ||
            (unitPrice && unitPrice.trim() !== "");

        if (!isRowStarted) return;

        rowNumber++;
        hasValidRow = true;

        if (!process || process.trim() === "" || process === "0") {
            showAlert('Process is required', row.find(".JIJWI_SVOI_PRS_Number"));
            isValid = false;
            return false;
        }

        if (!itemCode || itemCode.trim() === "") {
            showAlert('Item Code is required', row.find(".JIJWI_SVOI_Item_Code"));
            isValid = false;
            return false;
        }

        if (!qty || qty.trim() === "" || qty.trim() === "0") {
            showAlert('Row ' + rowNumber + ': Qty is required', row.find(".JIJWI_SVOI_Qty"));
            isValid = false;
            return false;
        }

        if (!unitPrice || unitPrice.trim() === "" || unitPrice.trim() === "0") {
            showAlert('Row ' + rowNumber + ': Unit Price is required', row.find(".JIJWI_SVOI_UnitPrice"));
            isValid = false;
            return false;
        }
    });

    if (!hasValidRow) {
        showAlert('Please add at least one item in grid', "#JWIItemTable tbody tr:first .JIJWI_SVOI_PRS_Number");
        return false;
    }

    return isValid;
}

function FreightValidateItemGrid() {

    let hasValidRow = false;
    let isValid = true;
    let rowNumber = 0;

    $("#FreightItemTable tbody tr").each(function () {

        let row = $(this);

        if (row.attr("id") === "FreightTempRow") return;
        if (row.find(".JIFRT_SVOI_IsDeleted").val() === "1") return;

        let process = row.find(".JIFRT_SVOI_PRS_Number").val();
        let fromWH = row.find(".JIFRT_SVOI_FromWH_Number").val();
        let toWH = row.find(".JIFRT_SVOI_ToWH_Number").val();
        let qty = row.find(".JIFRT_SVOI_Qty").val();
        let rate = row.find(".JIFRT_SVOI_Rate").val();

        let isRowStarted =
            (process && process.trim() !== "") ||
            (fromWH && fromWH.trim() !== "") ||
            (toWH && toWH.trim() !== "") ||
            (qty && qty.trim() !== "") ||
            (rate && rate.trim() !== "");

        if (!isRowStarted) return;

        rowNumber++;
        hasValidRow = true;

        if (!process || process.trim() === "" || process === "0") {
            showAlert('Process is required', row.find(".JIFRT_SVOI_PRS_Number"));
            isValid = false;
            return false;
        }

        if (!fromWH || fromWH.trim() === "" || fromWH.trim() === "0") {
            showAlert('Row ' + rowNumber + ': From WH is required', row.find(".JIFRT_SVOI_FromWH_Number"));
            isValid = false;
            return false;
        }

        if (!toWH || toWH.trim() === "" || toWH.trim() === "0") {
            showAlert('Row ' + rowNumber + ': To WH is required', row.find(".JIFRT_SVOI_ToWH_Number"));
            isValid = false;
            return false;
        }

        if (!qty || qty.trim() === "" || qty.trim() === "0") {
            showAlert('Row ' + rowNumber + ': Qty is required', row.find(".JIFRT_SVOI_Qty"));
            isValid = false;
            return false;
        }

        if (!rate || rate.trim() === "" || rate.trim() === "0") {
            showAlert('Row ' + rowNumber + ': Rate is required', row.find(".JIFRT_SVOI_Rate"));
            isValid = false;
            return false;
        }
    });

    if (!hasValidRow) {
        showAlert('Please add at least one item in grid', "#FreightItemTable tbody tr:first .JIFRT_SVOI_PRS_Number");
        return false;
    }

    return isValid;
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
