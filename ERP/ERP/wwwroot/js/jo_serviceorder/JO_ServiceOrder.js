$(document).ready(function () {

    //#region JW_Vendor – Focus Out
    $(document).on("focusout", ".JW_Vendor_Name", function () {
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

    //#region JW_Vendor – Keydown
    $(document).on("keydown", ".JW_Vendor_Name", function (e) {

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

    //#region Item_Code – Keydown
    $(document).on("keydown", ".JOJWI_SVOI_Item_Code", function (e) {

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
            '[name="JWIHeader.JOJWI_SVOH_MS_Number"]'
        );
    });

    // mousedown -> (re)open the item pane and load/refresh the search.
    $(document).on("mousedown", ".JOJWI_SVOI_Item_Code", function (e) {

        let $msField = $(this).closest(".card").find('[name="JWIHeader.JOJWI_SVOH_MS_Number"]');

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
    $(document).on("focusout", ".JOJWI_SVOI_Item_Code", function () {

        if (isSelectingItem)
            return;

        let $msField = $(this).closest(".card").find('[name="JWIHeader.JOJWI_SVOH_MS_Number"]');

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

//#region item grid field widths
const JWIItemTableFields = [
    { cls: ".JOJWI_SVOI_JPRS_Number", min: 10, max: 25, align: "left" },   // Process
    { cls: ".JOJWI_SVOI_Item_Code", min: 10, max: 15, align: "left" },   // Item Code
    { cls: ".Description", min: 40, max: 40, align: "left" },   // Description
    { cls: ".OuterDia", min: 8, max: 8, align: "center" },   // Outer Dia
    { cls: ".Thickness", min: 8, max: 8, align: "center" },   // Thickness
    { cls: ".Length", min: 8, max: 8, align: "center" },   // Length
    { cls: ".Width", min: 8, max: 8, align: "center" },   // Width
    { cls: ".MaterialGrade", min: 10, max: 25, align: "left" },   // Material Grade
    { cls: ".ItemGroup", min: 10, max: 30, align: "left" },   // Item Group
    { cls: ".JOJWI_SVOI_WH_Number", min: 10, max: 25, align: "left" },   // Warehouse
    { cls: ".JOJWI_SVOI_UoM_Number", min: 10, max: 15, align: "center" },   // UoM
    { cls: ".JOJWI_SVOI_Qty", min: 10, max: 20, align: "center" },   // Qty
    { cls: ".JOJWI_SVOI_UnitPrice", min: 10, max: 20, align: "right" },   // Unit Price
    { cls: ".JOJWI_SVOI_Amount", min: 13, max: 25, align: "right" },   // Amount
    { cls: ".JOJWI_SVOI_DeliveryDate", min: 10, max: 10, align: "center" }    // Delivery Date
];

const FreightItemTableFields = [
    { cls: ".JOFRT_SVOI_JPRS_Number", min: 10, max: 25, align: "left", extraPadding: 28 },   // Process
    { cls: ".JOFRT_SVOI_FromWH_Number", min: 10, max: 25, align: "left", extraPadding: 28 },   // From WH
    { cls: ".JOFRT_SVOI_ToWH_Number", min: 10, max: 25, align: "left", extraPadding: 28 },   // To WH
    { cls: ".JOFRT_SVOI_UoM_Number", min: 10, max: 15, align: "center", extraPadding: 28 },   // UoM
    { cls: ".JOFRT_SVOI_Qty", min: 10, max: 20, align: "center" },   // Qty
    { cls: ".JOFRT_SVOI_Rate", min: 10, max: 20, align: "right", extraPadding: 28 },   // Rate
    { cls: ".JOFRT_SVOI_Amount", min: 13, max: 25, align: "right", extraPadding: 28 }    // Amount
];

let isMouseSelectingBuyer = false;
//#endregion

//#region JW Vendor search functions
function OnBuyerSelectCall(inputElement) {
    OnBuyerSelect(inputElement, "#RightPane", ".buyer-search-results");
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

    var JW_Vendor = inputElement.value;
    var $panel = $(inputElement).closest(".card");
    var resultsDiv = $("#RightPane").find(".buyer-search-results");

    if (buyerSearchXHR) {
        buyerSearchXHR.abort();
    }

    buyerSearchXHR = $.ajax({
        url: '/joboutward/transactions/jo-service-order/vendor',
        type: 'GET',
        data: { JW_Vendor: JW_Vendor },
        success: function (data) {

            resultsDiv.empty();
            $("#BuyerMessage").hide().text("");

            if (data && data.length > 0) {

                $("#RightPane").addClass("show");
                resultsDiv.show();

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

                $.each(data, function (i, vendor) {
                    var row = $("<tr></tr>").css("height", "24px");
                    row.data("vendor", vendor);
                    row.append("<td>" + vendor.jwV_JW_VendorName + "</td>");
                    table.find("tbody").append(row);
                });

                table.find("tbody").on("mousedown", "tr", function (e) {

                    e.preventDefault();

                    const clickedVendor = $(this).data("vendor");
                    isMouseSelectingBuyer = true;

                    $("#BuyerMessage").hide().text("");

                    $(inputElement).val(clickedVendor.jwV_JW_VendorName);

                    $panel.find(".JW_Vendor_Number")
                        .val(clickedVendor.jwV_Number);

                    let $currency = $panel.find(".Currency_Number");
                    $currency
                        .val(clickedVendor.jwV_Currency_Number)
                        .trigger("change");

                    $("#RightPane").removeClass("show");
                    $("#RightPane .buyer-search-results").hide();

                    setTimeout(function () {
                        $currency.focus();
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

                //#region search logic highlight
                let rows = resultsDiv.find("tbody tr");
                rows.removeClass("match-row current-row");
                $(inputElement).removeData("selectedIndex");

                let searchText = JW_Vendor.trim().toLowerCase();
                let firstMatch = -1;
                let lastMatch = -1;

                rows.each(function (i) {
                    let name = $(this).find("td:first").text().trim().toLowerCase();

                    if (searchText !== "" && name.startsWith(searchText)) {
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
//#endregion JW Vendor search functions

//#region Item search functions
function OnInputItem(inputElement) {
    SearchServiceOrderItem(inputElement);
}

function OnFocusItem(inputElement) {

    if (isSelectingItem) {
        return;
    }

    let material = $('[name="JWIHeader.JOJWI_SVOH_MS_Number"]').val();

    if (!material) {
        $("#RightPane_Item").removeClass("show");
        $("#RightPane_Item .search-results").hide();

        showAlert('Please select Material Segregation before searching for an item.', '[name="JWIHeader.JOJWI_SVOH_MS_Number"]');
        return;
    }

    SearchServiceOrderItem(inputElement);
}

function SearchServiceOrderItem(inputElement) {

    let itemCode = inputElement.value.trim();
    let row = $(inputElement).closest("tr");
    let resultsDiv = $("#RightPane_Item").find(".search-results");
    let material = $('[name="JWIHeader.JOJWI_SVOH_MS_Number"]').val();

    if (!material) {
        showAlert('Please select Material Segregation before searching for an item.', '[name="JWIHeader.JOJWI_SVOH_MS_Number"]');
        return;
    }

    if (itemSearchXHR) {
        itemSearchXHR.abort();
    }

    itemSearchXHR = $.ajax({
        url: '/joboutward/transactions/jo-service-order/item',
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

                    // "mousedown" so HandleSearchSelection's rows.trigger("mousedown") selects the row
                    tr.on("mousedown", function (e) {

                        e.preventDefault();

                        isSelectingItem = true;

                        row.find(".JOJWI_SVOI_Item_Code").val(item.itemCode);
                        row.find(".JOJWI_SVOI_Item_Number").val(item.itemNumber);

                        row.find(".Description").val(item.itemDescription);
                        row.find(".OuterDia").val(item.outerDia);
                        row.find(".Thickness").val(item.thickness);
                        row.find(".Length").val(item.length);
                        row.find(".Width").val(item.width);
                        row.find(".MaterialGrade").val(item.materialGrade);
                        row.find(".ItemGroup").val(item.itemGroup);
                        row.find(".JOJWI_SVOI_WH_Number").val(item.saleWarehouse);
                        row.find(".JOJWI_SVOI_UoM_Number").val(item.uoM);

                        row.find(".JOJWI_SVOI_Qty").focus();

                        setTimeout(function () {
                            isSelectingItem = false;
                        }, 100);

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

                //#region match row highlight
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
                //#endregion
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
//#endregion Item search functions

//#region helpers
function getTextWidth(text, element) {

    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");

    const style = window.getComputedStyle(element);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    return Math.ceil(ctx.measureText(text).width);
}

// Converts characters (ch) to pixels (1ch = width of "0" in the current font)
function chToPx(ch, element) {

    const canvas = chToPx.canvas || (chToPx.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");

    const style = window.getComputedStyle(element);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    const oneCh = ctx.measureText("0").width;

    return Math.ceil(ch * oneCh);
}

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
    fitInputWidth($('[name="JWIHeader.JOJWI_SVOH_ServiceOrderNo"]')[0], 20, 25);
    fitInputWidth($('[name="JWIHeader.JOJWI_SVOH_MS_Number"]')[0], 20, 30);
    fitInputWidth($('[name="JWIHeader.JOJWI_SVOH_JW_Vendor_Name"]')[0], 40, 50);
    fitInputWidth($('#JWIHeaderPanel .Currency_Number')[0], 10, 10);
    fitInputWidth($('[name="JWIHeader.JOJWI_SVOH_PaymentTerms"]')[0], 30, 40);
    fitInputWidth($('[name="JWIHeader.JOJWI_SVOH_DeliveryTerms"]')[0], 30, 40);
    fitInputWidth($('[name="JWIHeader.JOJWI_SVOH_DeliveryMode"]')[0], 30, 40);
    fitInputWidth($('[name="JWIHeader.JOJWI_SVOH_Tax"]')[0], 40, 40);
    fitInputWidth($('[name="JWIHeader.JOJWI_SVOH_TDC"]')[0], 40, 40);
    fitInputWidth($('[name="JWIHeader.JOJWI_SVOH_Remarks"]')[0], 40, 40);

    // Freight panel
    fitInputWidth($('[name="FreightHeader.JOFRT_SVOH_ServiceOrderNo"]')[0], 20, 25);
    fitInputWidth($('[name="FreightHeader.JOFRT_SVOH_Category"]')[0], 20, 20);
    fitInputWidth($('[name="FreightHeader.JOFRT_SVOH_JW_Vendor_Name"]')[0], 40, 50);
    fitInputWidth($('#FreightHeaderPanel .Currency_Number')[0], 10, 10);
    fitInputWidth($('[name="FreightHeader.JOFRT_SVOH_PaymentTerms"]')[0], 30, 40);
    fitInputWidth($('[name="FreightHeader.JOFRT_SVOH_DeliveryTerms"]')[0], 30, 40);
    fitInputWidth($('[name="FreightHeader.JOFRT_SVOH_DeliveryMode"]')[0], 30, 40);
    fitInputWidth($('[name="FreightHeader.JOFRT_SVOH_Tax"]')[0], 40, 40);
    fitInputWidth($('[name="FreightHeader.JOFRT_SVOH_TDC"]')[0], 40, 40);
    fitInputWidth($('[name="FreightHeader.JOFRT_SVOH_Remarks"]')[0], 40, 40);
}
//#endregion

$(document).ready(function () {

    // search-results row click -> current row
    $(document).on("mousedown", ".search-results tbody tr", function () {

        let rows = $(".search-results tbody tr");
        rows.removeClass("current-row");
        $(this).addClass("current-row");
    });

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

    AutoFit();

    //#region Header AutoFit - KeyUp
    const jwiFieldWidths = {
        "JWIHeader.JOJWI_SVOH_ServiceOrderNo": [20, 25],
        "JWIHeader.JOJWI_SVOH_MS_Number": [20, 30],
        "JWIHeader.JOJWI_SVOH_JW_Vendor_Name": [40, 50],
        "JWIHeader.JOJWI_SVOH_PaymentTerms": [30, 40],
        "JWIHeader.JOJWI_SVOH_DeliveryTerms": [30, 40],
        "JWIHeader.JOJWI_SVOH_DeliveryMode": [30, 40],
        "JWIHeader.JOJWI_SVOH_Tax": [40, 40],
        "JWIHeader.JOJWI_SVOH_TDC": [40, 40],
        "JWIHeader.JOJWI_SVOH_Remarks": [40, 40]
    };

    const freightFieldWidths = {
        "FreightHeader.JOFRT_SVOH_ServiceOrderNo": [20, 25],
        "FreightHeader.JOFRT_SVOH_Category": [20, 20],
        "FreightHeader.JOFRT_SVOH_JW_Vendor_Name": [40, 50],
        "FreightHeader.JOFRT_SVOH_PaymentTerms": [30, 40],
        "FreightHeader.JOFRT_SVOH_DeliveryTerms": [30, 40],
        "FreightHeader.JOFRT_SVOH_DeliveryMode": [30, 40],
        "FreightHeader.JOFRT_SVOH_Tax": [40, 40],
        "FreightHeader.JOFRT_SVOH_TDC": [40, 40],
        "FreightHeader.JOFRT_SVOH_Remarks": [40, 40]
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

    //#region item grid - select full content on click/focus
    $(document).on("click focusin", "#JWIItemTable input, #FreightItemTable input", function (e) {
        e.stopPropagation();

        let input = this;
        input.focus();

        setTimeout(function () {
            input.select();
        }, 10);
    });
    //#endregion

    //#region restrict Qty to whole numbers only (no decimal point)
    $(document).on("keydown", ".JOJWI_SVOI_Qty, .JOFRT_SVOI_Qty", function (e) {

        if ($.inArray(e.key, ["Backspace", "Delete", "Tab", "Escape", "Enter",
            "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]) !== -1) {
            return;
        }

        if ((e.ctrlKey || e.metaKey) &&
            ["a", "c", "v", "x"].indexOf(e.key.toLowerCase()) !== -1) {
            return;
        }

        if (e.key >= "0" && e.key <= "9") {
            return;
        }

        e.preventDefault();
    });

    $(document).on("input", ".JOJWI_SVOI_Qty, .JOFRT_SVOI_Qty", function () {

        let cleaned = $(this).val().replace(/[^0-9]/g, "");

        if (cleaned !== $(this).val()) {
            $(this).val(cleaned);
        }
    });
    //#endregion

    //#region restrict UnitPrice/Rate to numbers + single decimal point
    $(document).on("keydown", ".JOJWI_SVOI_UnitPrice, .JOFRT_SVOI_Rate", function (e) {

        if ($.inArray(e.key, ["Backspace", "Delete", "Tab", "Escape", "Enter",
            "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]) !== -1) {
            return;
        }

        if ((e.ctrlKey || e.metaKey) &&
            ["a", "c", "v", "x"].indexOf(e.key.toLowerCase()) !== -1) {
            return;
        }

        if (e.key >= "0" && e.key <= "9") {
            return;
        }

        if (e.key === "." && this.value.indexOf(".") === -1) {
            return;
        }

        e.preventDefault();
    });

    $(document).on("input", ".JOJWI_SVOI_UnitPrice, .JOFRT_SVOI_Rate", function () {

        let cleaned = $(this).val().replace(/[^0-9.]/g, "");

        let firstDot = cleaned.indexOf(".");
        if (firstDot !== -1) {
            cleaned = cleaned.substring(0, firstDot + 1) +
                cleaned.substring(firstDot + 1).replace(/\./g, "");
        }

        if (cleaned !== $(this).val()) {
            $(this).val(cleaned);
        }
    });
    //#endregion

    //#region Amount = Qty x UnitPrice / Rate
    $(document).on("keyup change", ".JOJWI_SVOI_Qty, .JOJWI_SVOI_UnitPrice", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat((row.find(".JOJWI_SVOI_Qty").val() || "0").replace(/,/g, "")) || 0;
        let price = parseFloat((row.find(".JOJWI_SVOI_UnitPrice").val() || "0").replace(/,/g, "")) || 0;

        row.find(".JOJWI_SVOI_Amount").val(formatIndianCurrency(qty * price));

        JWICalculateTotal();

        JWIAutoAddRow(row);
    });

    $(document).on("keyup change", ".JOFRT_SVOI_Qty, .JOFRT_SVOI_Rate", function () {

        let row = $(this).closest("tr");

        let qty = parseFloat((row.find(".JOFRT_SVOI_Qty").val() || "0").replace(/,/g, "")) || 0;
        let rate = parseFloat((row.find(".JOFRT_SVOI_Rate").val() || "0").replace(/,/g, "")) || 0;

        row.find(".JOFRT_SVOI_Amount").val(formatIndianCurrency(qty * rate));

        FreightCalculateTotal();

        FreightAutoAddRow(row);
    });
    //#endregion

    //#region comma format on focusout
    $(document).on("focusout", ".JOJWI_SVOI_Qty, .JOJWI_SVOI_UnitPrice, .JOJWI_SVOI_Amount", function () {

        let type = $(this).hasClass("JOJWI_SVOI_Qty") ? "q" : "c";

        $(this).val(addComma($(this).val(), type));
    });

    $(document).on("focusout", ".JOFRT_SVOI_Qty, .JOFRT_SVOI_Rate, .JOFRT_SVOI_Amount", function () {

        let type = $(this).hasClass("JOFRT_SVOI_Qty") ? "q" : "c";

        $(this).val(addComma($(this).val(), type));
    });
    //#endregion

});

$(document).ready(function () {

    //#region date pickers
    InitializeGstFlatpickrs();
    DateBind();
    BindServiceOrderNumbering();
    //#endregion

    //#region add row item grid
    let jwiRowIndex = 1;
    let freightRowIndex = 1;

    $("#AddRowButton").on("click", function () {

        let isValid = true;

        $("#JWIItemTable tbody tr.JWINewRow:last").find("input, select").each(function () {

            let el = $(this);

            if (el.hasClass("JOJWI_SVOI_IsDeleted")) return;

            if (el.hasClass("JOJWI_SVOI_Item_Code")) {
                if (!el.val()) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOJWI_SVOI_Qty")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOJWI_SVOI_UnitPrice")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOJWI_SVOI_JPRS_Number")) {
                if (!el.val() || el.val() === "0") { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOJWI_SVOI_WH_Number")) {
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

            if (!el.hasClass("JOJWI_SVOI_IsDeleted")) el.val("");

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

            if (el.hasClass("JOFRT_SVOI_IsDeleted")) return;

            if (el.hasClass("JOFRT_SVOI_FromWH_Number")) {
                if (!el.val() || el.val() === "0") { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOFRT_SVOI_ToWH_Number")) {
                if (!el.val() || el.val() === "0") { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOFRT_SVOI_Qty")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOFRT_SVOI_Rate")) {
                if (!el.val() || parseFloat(removeComma(el.val())) <= 0) { isValid = false; el.focus(); return false; }
            }
            if (el.hasClass("JOFRT_SVOI_JPRS_Number")) {
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

            if (!el.hasClass("JOFRT_SVOI_IsDeleted")) el.val("");

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

    //#region row remove (single row button)
    $(document).on("click", ".RowRemove", function () {

        let row = $(this).closest("tr");

        if (row.closest("table").attr("id") === "JWIItemTable") {
            row.find(".JOJWI_SVOI_IsDeleted").val("1");
            row.hide();
            JWICalculateTotal();
        } else {
            row.find(".JOFRT_SVOI_IsDeleted").val("1");
            row.hide();
            FreightCalculateTotal();
        }
    });
    //#endregion

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

        $.ajax({
            url: '/joboutward/transactions/jo-service-order/save',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(model),

            success: function (response) {

                if (response.success) {
                    $('#ModelAlert').one('hidden.bs.modal', function () {
                        location.reload();
                    });
                    showAlert('Record Inserted');
                } else {
                    showAlert(response.message || 'Save failed');
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
            let itemNumber = currentRow.find(".JOJWI_SVOI_Number").val();

            if (itemNumber && itemNumber !== "0") {
                currentRow.find(".JOJWI_SVOI_IsDeleted").val("1");
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
            let itemNumber = currentRow.find(".JOFRT_SVOI_Number").val();

            if (itemNumber && itemNumber !== "0") {
                currentRow.find(".JOFRT_SVOI_IsDeleted").val("1");
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

//#region duplicate validation
function JWIValidateDuplicateItemCombination() {

    let combinationMap = {};
    let duplicateMessages = [];

    $("#JWIItemTable tbody tr.JWINewRow").each(function (index) {

        let row = $(this);

        if (row.find(".JOJWI_SVOI_IsDeleted").val() == "1") return;
        if (!row.find(".JOJWI_SVOI_Item_Number").val()) return;

        let jprs = row.find(".JOJWI_SVOI_JPRS_Number").val() || 0;
        let item = row.find(".JOJWI_SVOI_Item_Number").val() || 0;
        let uom = row.find(".JOJWI_SVOI_UoM_Number").val() || 0;

        let key = jprs + "_" + item + "_" + uom;
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

        if (row.find(".JOFRT_SVOI_IsDeleted").val() == "1") return;

        let jprs = row.find(".JOFRT_SVOI_JPRS_Number").val() || 0;
        let fromWH = row.find(".JOFRT_SVOI_FromWH_Number").val() || 0;
        let toWH = row.find(".JOFRT_SVOI_ToWH_Number").val() || 0;

        if (fromWH === 0 && toWH === 0) return;

        let key = jprs + "_" + fromWH + "_" + toWH;
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

//#region auto add row function
function JWIAutoAddRow(currentRow) {

    let qty = parseFloat(removeComma(currentRow.find(".JOJWI_SVOI_Qty").val())) || 0;
    let price = parseFloat(removeComma(currentRow.find(".JOJWI_SVOI_UnitPrice").val())) || 0;

    let itemCode = currentRow.find(".JOJWI_SVOI_Item_Code").val();
    let jprsNo = currentRow.find(".JOJWI_SVOI_JPRS_Number").val();
    let whNo = currentRow.find(".JOJWI_SVOI_WH_Number").val();

    let isRowValid =
        itemCode &&
        qty > 0 &&
        price > 0 &&
        jprsNo && jprsNo !== "0" &&
        whNo && whNo !== "0";

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

    let qty = parseFloat(removeComma(currentRow.find(".JOFRT_SVOI_Qty").val())) || 0;
    let rate = parseFloat(removeComma(currentRow.find(".JOFRT_SVOI_Rate").val())) || 0;

    let fromWH = currentRow.find(".JOFRT_SVOI_FromWH_Number").val();
    let jprsNo = currentRow.find(".JOFRT_SVOI_JPRS_Number").val();

    let isRowValid =
        fromWH && fromWH !== "0" &&
        qty > 0 &&
        rate > 0 &&
        jprsNo && jprsNo !== "0";

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

//#region date pickers
function InitializeGstFlatpickrs() {
    $(".datepicker").flatpickr({
        dateFormat: "d-M-Y",   // 30-Apr-2026
        altInput: true,        // shows formatted date
        altFormat: "d-M-Y",    // display format
        allowInput: true,      // user can type manually
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
    var jwiSODateInput = $('[name="JWIHeader.JOJWI_SVOH_ServiceOrderDate"]')[0];
    var jwiSODate = jwiSODateInput?._flatpickr;
    if (jwiSODate) jwiSODate.setDate(formattedDate, true, "d-M-Y");

    // Freight panel
    var frtSODateInput = $('[name="FreightHeader.JOFRT_SVOH_ServiceOrderDate"]')[0];
    var frtSODate = frtSODateInput?._flatpickr;
    if (frtSODate) frtSODate.setDate(formattedDate, true, "d-M-Y");
}
//#endregion

//#region auto service order number
function LoadServiceOrderNumber(orderType, silent) {
    var isFreight = orderType === "FREIGHT";
    var dateSel = isFreight
        ? '[name="FreightHeader.JOFRT_SVOH_ServiceOrderDate"]'
        : '[name="JWIHeader.JOJWI_SVOH_ServiceOrderDate"]';
    var noSel = isFreight
        ? '[name="FreightHeader.JOFRT_SVOH_ServiceOrderNo"]'
        : '[name="JWIHeader.JOJWI_SVOH_ServiceOrderNo"]';

    var dateInput = $(dateSel)[0];
    var fp = dateInput ? dateInput._flatpickr : null;
    var $no = $(noSel);

    if (!fp || !fp.selectedDates || fp.selectedDates.length === 0) return;

    var soDate = fp.formatDate(fp.selectedDates[0], "Y-m-d");

    $.ajax({
        url: "/joboutward/transactions/jo-service-order/next-number",
        type: "GET",
        data: { SODate: soDate, OrderType: orderType },
        success: function (res) {
            if (res && res.success) {
                $no.val(res.number).prop("readonly", true);
                if (typeof fitInputWidth === "function") fitInputWidth($no[0], 20, 25);
            } else {
                // numbering not configured for this date: keep manual entry possible
                $no.val("").prop("readonly", false);
                if (!silent) showAlert((res && res.message) || "Service Order Number is not configured for the selected date.", noSel);
            }
        },
        error: function () {
            $no.val("").prop("readonly", false);
            if (!silent) showAlert("Unable to get Service Order Number.", noSel);
        }
    });
}

function BindServiceOrderNumbering() {
    $('[name="JWIHeader.JOJWI_SVOH_ServiceOrderDate"]').on("change", function () {
        LoadServiceOrderNumber("JWI", false);
    });

    $('[name="FreightHeader.JOFRT_SVOH_ServiceOrderDate"]').on("change", function () {
        LoadServiceOrderNumber("FREIGHT", false);
    });

    $('input[name="ServiceType"]').on("change", function () {
        LoadServiceOrderNumber($('input[name="ServiceType"]:checked').val() === "FREIGHT" ? "FREIGHT" : "JWI", true);
    });

    // first load (today's date is already set by DateBind)
    LoadServiceOrderNumber("JWI", true);
    LoadServiceOrderNumber("FREIGHT", true);
}
//#endregion

//#region model builders
function CreateJWIHeaderModel() {

    return {
        JOJWI_SVOH_Number: 0,

        JOJWI_SVOH_ServiceOrderNo:
            $('[name="JWIHeader.JOJWI_SVOH_ServiceOrderNo"]').val(),

        JOJWI_SVOH_ServiceOrderDate:
            $('[name="JWIHeader.JOJWI_SVOH_ServiceOrderDate"]').val()
                ? new Date($('[name="JWIHeader.JOJWI_SVOH_ServiceOrderDate"]').val()).toISOString()
                : null,

        JOJWI_SVOH_MS_Number:
            parseInt($('[name="JWIHeader.JOJWI_SVOH_MS_Number"]').val()) || 0,

        JOJWI_SVOH_JW_Vendor_Number:
            parseInt($('#JWIHeaderPanel .JW_Vendor_Number').val()) || 0,

        JOJWI_SVOH_Currency_Number:
            parseInt($('#JWIHeaderPanel .Currency_Number').val()) || 0,

        JOJWI_SVOH_PaymentTerms:
            $('[name="JWIHeader.JOJWI_SVOH_PaymentTerms"]').val(),

        JOJWI_SVOH_DeliveryTerms:
            $('[name="JWIHeader.JOJWI_SVOH_DeliveryTerms"]').val(),

        JOJWI_SVOH_DeliveryMode:
            $('[name="JWIHeader.JOJWI_SVOH_DeliveryMode"]').val(),

        JOJWI_SVOH_Tax:
            $('[name="JWIHeader.JOJWI_SVOH_Tax"]').val(),

        JOJWI_SVOH_TDC:
            $('[name="JWIHeader.JOJWI_SVOH_TDC"]').val(),

        JOJWI_SVOH_Remarks:
            $('[name="JWIHeader.JOJWI_SVOH_Remarks"]').val()
    };
}

function CreateJWIItemsModel() {

    let items = [];

    $("#JWIItemTable tbody tr.JWINewRow").each(function () {

        let row = $(this);

        if (row.find(".JOJWI_SVOI_IsDeleted").val() == "1") return;
        if (!row.find(".JOJWI_SVOI_Item_Number").val()) return;

        items.push({
            JOJWI_SVOI_Number:
                parseInt(row.find(".JOJWI_SVOI_Number").val()) || 0,

            JOJWI_SVOI_IsDeleted: false,

            JOJWI_SVOI_JPRS_Number:
                parseInt(row.find(".JOJWI_SVOI_JPRS_Number").val()) || 0,

            JOJWI_SVOI_Item_Number:
                parseInt(row.find(".JOJWI_SVOI_Item_Number").val()) || 0,

            JOJWI_SVOI_WH_Number:
                parseInt(row.find(".JOJWI_SVOI_WH_Number").val()) || null,

            JOJWI_SVOI_UoM_Number:
                parseInt(row.find(".JOJWI_SVOI_UoM_Number").val()) || 0,

            JOJWI_SVOI_Qty:
                parseFloat(removeComma(row.find(".JOJWI_SVOI_Qty").val())) || 0,

            JOJWI_SVOI_UnitPrice:
                parseFloat(removeComma(row.find(".JOJWI_SVOI_UnitPrice").val())) || 0,

            JOJWI_SVOI_Amount:
                parseFloat(removeComma(row.find(".JOJWI_SVOI_Amount").val())) || 0,

            JOJWI_SVOI_DeliveryDate:
                row.find(".JOJWI_SVOI_DeliveryDate").val()
                    ? new Date(row.find(".JOJWI_SVOI_DeliveryDate").val()).toISOString()
                    : null
        });
    });

    return items;
}

function CreateFreightHeaderModel() {

    return {
        JOFRT_SVOH_Number: 0,

        JOFRT_SVOH_ServiceOrderNo:
            $('[name="FreightHeader.JOFRT_SVOH_ServiceOrderNo"]').val(),

        JOFRT_SVOH_ServiceOrderDate:
            $('[name="FreightHeader.JOFRT_SVOH_ServiceOrderDate"]').val()
                ? new Date($('[name="FreightHeader.JOFRT_SVOH_ServiceOrderDate"]').val()).toISOString()
                : null,

        JOFRT_SVOH_Category:
            $('[name="FreightHeader.JOFRT_SVOH_Category"]').val() === "RN" ? "RECEIPT NOTE" : "DELIVERY NOTE",

        JOFRT_SVOH_JW_Vendor_Number:
            parseInt($('#FreightHeaderPanel .JW_Vendor_Number').val()) || 0,

        JOFRT_SVOH_Currency_Number:
            parseInt($('#FreightHeaderPanel .Currency_Number').val()) || 0,

        JOFRT_SVOH_PaymentTerms:
            $('[name="FreightHeader.JOFRT_SVOH_PaymentTerms"]').val(),

        JOFRT_SVOH_DeliveryTerms:
            $('[name="FreightHeader.JOFRT_SVOH_DeliveryTerms"]').val(),

        JOFRT_SVOH_DeliveryMode:
            $('[name="FreightHeader.JOFRT_SVOH_DeliveryMode"]').val(),

        JOFRT_SVOH_Tax:
            $('[name="FreightHeader.JOFRT_SVOH_Tax"]').val(),

        JOFRT_SVOH_TDC:
            $('[name="FreightHeader.JOFRT_SVOH_TDC"]').val(),

        JOFRT_SVOH_Remarks:
            $('[name="FreightHeader.JOFRT_SVOH_Remarks"]').val()
    };
}

function CreateFreightItemsModel() {

    let items = [];

    $("#FreightItemTable tbody tr.FreightNewRow").each(function () {

        let row = $(this);

        if (row.find(".JOFRT_SVOI_IsDeleted").val() == "1") return;

        let jprs = row.find(".JOFRT_SVOI_JPRS_Number").val();
        let fromWH = row.find(".JOFRT_SVOI_FromWH_Number").val();

        // empty row skip
        if ((!jprs || jprs === "0") && (!fromWH || fromWH === "0")) return;

        items.push({
            JOFRT_SVOI_Number:
                parseInt(row.find(".JOFRT_SVOI_Number").val()) || 0,

            JOFRT_SVOI_IsDeleted: false,

            JOFRT_SVOI_JPRS_Number:
                parseInt(jprs) || 0,

            JOFRT_SVOI_FromWH_Number:
                parseInt(fromWH) || null,

            JOFRT_SVOI_ToWH_Number:
                parseInt(row.find(".JOFRT_SVOI_ToWH_Number").val()) || null,

            JOFRT_SVOI_UoM_Number:
                parseInt(row.find(".JOFRT_SVOI_UoM_Number").val()) || 0,

            JOFRT_SVOI_Qty:
                parseFloat(removeComma(row.find(".JOFRT_SVOI_Qty").val())) || 0,

            JOFRT_SVOI_Rate:
                parseFloat(removeComma(row.find(".JOFRT_SVOI_Rate").val())) || 0,

            JOFRT_SVOI_Amount:
                parseFloat(removeComma(row.find(".JOFRT_SVOI_Amount").val())) || 0
        });
    });

    return items;
}
//#endregion model builders

//#region SUBMIT VALIDATION (header)
function ValidateJWIHeader() {

    if ($('[name="JWIHeader.JOJWI_SVOH_ServiceOrderNo"]').val().trim() === "") {
        showAlert('Service Order No. is required', '[name="JWIHeader.JOJWI_SVOH_ServiceOrderNo"]');
        return false;
    }

    if ($('[name="JWIHeader.JOJWI_SVOH_MS_Number"]').val().trim() === "") {
        showAlert('Material Segregation is required', '[name="JWIHeader.JOJWI_SVOH_MS_Number"]');
        return false;
    }

    if ($('[name="JWIHeader.JOJWI_SVOH_ServiceOrderDate"]').val().trim() === "") {
        showAlert('Service Order Date is required', '[name="JWIHeader.JOJWI_SVOH_ServiceOrderDate"]');
        return false;
    }

    if (
        $('#JWIHeaderPanel .JW_Vendor_Number').val().trim() === "" ||
        $('[name="JWIHeader.JOJWI_SVOH_JW_Vendor_Name"]').val().trim() === ""
    ) {
        showAlert('JW Vendor is required', '[name="JWIHeader.JOJWI_SVOH_JW_Vendor_Name"]');
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

    if ($('[name="FreightHeader.JOFRT_SVOH_ServiceOrderNo"]').val().trim() === "") {
        showAlert('Service Order No. is required', '[name="FreightHeader.JOFRT_SVOH_ServiceOrderNo"]');
        return false;
    }

    if ($('[name="FreightHeader.JOFRT_SVOH_ServiceOrderDate"]').val().trim() === "") {
        showAlert('Service Order Date is required', '[name="FreightHeader.JOFRT_SVOH_ServiceOrderDate"]');
        return false;
    }

    if (
        $('#FreightHeaderPanel .JW_Vendor_Number').val().trim() === "" ||
        $('[name="FreightHeader.JOFRT_SVOH_JW_Vendor_Name"]').val().trim() === ""
    ) {
        showAlert('JW Vendor is required', '[name="FreightHeader.JOFRT_SVOH_JW_Vendor_Name"]');
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

//#region Calculate Total
function JWICalculateTotal() {

    let totalQty = 0;
    let totalAmount = 0;

    $("#JWIItemTable tbody tr.JWINewRow").each(function () {

        let row = $(this);

        if (row.find(".JOJWI_SVOI_IsDeleted").val() === "1" ||
            row.find(".JOJWI_SVOI_IsDeleted").val() === "true") {
            return;
        }

        let qty = parseFloat(removeComma(row.find(".JOJWI_SVOI_Qty").val())) || 0;
        let unitPrice = parseFloat(removeComma(row.find(".JOJWI_SVOI_UnitPrice").val())) || 0;
        let amount = qty * unitPrice;

        row.find(".JOJWI_SVOI_Amount").val(addComma(amount, "c"));

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

        if (row.find(".JOFRT_SVOI_IsDeleted").val() === "1" ||
            row.find(".JOFRT_SVOI_IsDeleted").val() === "true") {
            return;
        }

        let qty = parseFloat(removeComma(row.find(".JOFRT_SVOI_Qty").val())) || 0;
        let rate = parseFloat(removeComma(row.find(".JOFRT_SVOI_Rate").val())) || 0;
        let amount = qty * rate;

        row.find(".JOFRT_SVOI_Amount").val(addComma(amount, "c"));

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
        if (row.find(".JOJWI_SVOI_IsDeleted").val() === "1") return;

        let process = row.find(".JOJWI_SVOI_JPRS_Number").val();
        let itemCode = row.find(".JOJWI_SVOI_Item_Code").val();
        let warehouse = row.find(".JOJWI_SVOI_WH_Number").val();
        let uom = row.find(".JOJWI_SVOI_UoM_Number").val();
        let qty = row.find(".JOJWI_SVOI_Qty").val();
        let unitPrice = row.find(".JOJWI_SVOI_UnitPrice").val();

        let isRowStarted =
            (process && process.trim() !== "") ||
            (itemCode && itemCode.trim() !== "") ||
            (warehouse && warehouse.trim() !== "") ||
            (uom && uom.trim() !== "") ||
            (qty && qty.trim() !== "") ||
            (unitPrice && unitPrice.trim() !== "");

        if (!isRowStarted) return;

        rowNumber++;
        hasValidRow = true;

        if (!process || process.trim() === "" || process === "0") {
            showAlert('Process is required', row.find(".JOJWI_SVOI_JPRS_Number"));
            isValid = false;
            return false;
        }

        if (!itemCode || itemCode.trim() === "") {
            showAlert('Item Code is required', row.find(".JOJWI_SVOI_Item_Code"));
            isValid = false;
            return false;
        }

        if (!warehouse || warehouse.trim() === "" || warehouse.trim() === "0") {
            showAlert('Row ' + rowNumber + ': Warehouse is required', row.find(".JOJWI_SVOI_WH_Number"));
            isValid = false;
            return false;
        }

        if (!uom || uom.trim() === "" || uom.trim() === "0") {
            showAlert('Row ' + rowNumber + ': UOM is required', row.find(".JOJWI_SVOI_UoM_Number"));
            isValid = false;
            return false;
        }

        if (!qty || qty.trim() === "" || qty.trim() === "0") {
            showAlert('Row ' + rowNumber + ': Qty is required', row.find(".JOJWI_SVOI_Qty"));
            isValid = false;
            return false;
        }

        if (!unitPrice || unitPrice.trim() === "" || unitPrice.trim() === "0") {
            showAlert('Row ' + rowNumber + ': Unit Price is required', row.find(".JOJWI_SVOI_UnitPrice"));
            isValid = false;
            return false;
        }
    });

    if (!hasValidRow) {
        showAlert('Please add at least one item in grid', "#JWIItemTable tbody tr:first .JOJWI_SVOI_JPRS_Number");
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
        if (row.find(".JOFRT_SVOI_IsDeleted").val() === "1") return;

        let process = row.find(".JOFRT_SVOI_JPRS_Number").val();
        let fromWH = row.find(".JOFRT_SVOI_FromWH_Number").val();
        let toWH = row.find(".JOFRT_SVOI_ToWH_Number").val();
        let uom = row.find(".JOFRT_SVOI_UoM_Number").val();
        let qty = row.find(".JOFRT_SVOI_Qty").val();
        let rate = row.find(".JOFRT_SVOI_Rate").val();

        let isRowStarted =
            (process && process.trim() !== "") ||
            (fromWH && fromWH.trim() !== "") ||
            (toWH && toWH.trim() !== "") ||
            (uom && uom.trim() !== "") ||
            (qty && qty.trim() !== "") ||
            (rate && rate.trim() !== "");

        if (!isRowStarted) return;

        rowNumber++;
        hasValidRow = true;

        if (!process || process.trim() === "" || process === "0") {
            showAlert('Process is required', row.find(".JOFRT_SVOI_JPRS_Number"));
            isValid = false;
            return false;
        }

        if (!fromWH || fromWH.trim() === "" || fromWH.trim() === "0") {
            showAlert('Row ' + rowNumber + ': From WH is required', row.find(".JOFRT_SVOI_FromWH_Number"));
            isValid = false;
            return false;
        }

        if (!toWH || toWH.trim() === "" || toWH.trim() === "0") {
            showAlert('Row ' + rowNumber + ': To WH is required', row.find(".JOFRT_SVOI_ToWH_Number"));
            isValid = false;
            return false;
        }

        if (!uom || uom.trim() === "" || uom.trim() === "0") {
            showAlert('Row ' + rowNumber + ': UOM is required', row.find(".JOFRT_SVOI_UoM_Number"));
            isValid = false;
            return false;
        }

        if (!qty || qty.trim() === "" || qty.trim() === "0") {
            showAlert('Row ' + rowNumber + ': Qty is required', row.find(".JOFRT_SVOI_Qty"));
            isValid = false;
            return false;
        }

        if (!rate || rate.trim() === "" || rate.trim() === "0") {
            showAlert('Row ' + rowNumber + ': Rate is required', row.find(".JOFRT_SVOI_Rate"));
            isValid = false;
            return false;
        }
    });

    if (!hasValidRow) {
        showAlert('Please add at least one item in grid', "#FreightItemTable tbody tr:first .JOFRT_SVOI_JPRS_Number");
        return false;
    }

    return isValid;
}
//#endregion VALIDATE ITEM GRID

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