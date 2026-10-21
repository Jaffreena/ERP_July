/* =====================================================================
   JO Freight Invoice  -  EDIT / VIEW page
   wwwroot/js/JO_FreightInvoice/JO_FreightInvoiceEdit.js
   Needs from cshtml:  window.JOFTIH_Number (long), window.IsViewMode (bool)
   Edit grid: Delivered | Prev Invoiced | Invoice Qty (saved, readonly) | Amend Qty (.JOFTII_Qty_Kgs, editable)
   Server JSON uses EXACT column / property names (no camel-casing).
   Needs from cshtml (globals):  warehouseList, whtList  =  [{Value,Text}]
   ===================================================================== */

const JOFT_URL = "/joboutward/transactions/jo-freight-invoice";
const FREIGHT_JPRS = 40008;                 // freight process (same as old page)
let isMouseSelectingBuyer = false;
let buyerSearchXHR = null;
let addressIndex = 0;
let PrevCategory = null;

//#region ---------- COMMON ----------
function removeCommas(v) { return (v || "").toString().replace(/,/g, ""); }
function JN(v) { return parseFloat(removeCommas(v)) || 0; }

// "30-Apr-2026" / "2026-04-30"  ->  "2026-04-30"   (no timezone shift)
function ToIsoDate(txt) {
    if (!txt) return null;
    txt = txt.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(txt)) return txt.substring(0, 10);
    const m = txt.match(/^(\d{1,2})[-\/ ]([A-Za-z]{3})[A-Za-z]*[-\/ ](\d{4})$/);
    if (m) {
        const mon = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
            .indexOf(m[2].toLowerCase()) + 1;
        return m[3] + "-" + String(mon).padStart(2, "0") + "-" + m[1].padStart(2, "0");
    }
    const d = new Date(txt);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function showAlert(message, focusSelector = null) {
    $("#AlertMessage").html(message);
    const el = document.getElementById("ModelAlert");
    const modal = new bootstrap.Modal(el);
    modal.show();
    if (focusSelector) {
        $(el).off("hidden.bs.modal").on("hidden.bs.modal", function () { $(focusSelector).focus(); });
    }
}

function GetWarehouseOptions(selected) {
    let o = '<option value="0"></option>';
    (window.warehouseList || []).forEach(function (i) {
        if (i.Value !== "") o += `<option value="${i.Value}" ${i.Value == selected ? "selected" : ""}>${i.Text}</option>`;
    });
    return o;
}

function GetWhtCodeText(whtNo) {
    let t = "";
    (window.whtList || []).forEach(function (i) { if (i.Value == whtNo) t = i.Text; });
    return t || (whtNo > 0 ? whtNo : "");
}

function IsReceipt() { return $("#Header_JOFTIH_Category").val() === "RECEIPT NOTE"; }
function CurrentCategory() { return IsReceipt() ? "RECEIPT NOTE" : "DELIVERY NOTE"; }
function VendorHasWHT() { return $("#Header_JWV_WithholdTax").val() === "1"; }
function HeaderRCM() { return $("#Header_JOFTIH_RCM").is(":checked"); }
//#endregion

//#region ---------- COLUMN WIDTHS ----------
const AddressFields = [
    { cls: ".JOFTIA_ADTP_Number", min: 10, max: 25, align: "left", extraPadding: 20 },
    { cls: ".JOFTIA_Address_ID", min: 10, max: 25, align: "left", extraPadding: 20 },
    { cls: ".JOFTIA_Address", min: 40, max: 40, align: "left" },
    { cls: ".JOFTIA_City", min: 10, max: 25, align: "left" },
    { cls: ".JOFTIA_State", min: 10, max: 25, align: "left" },
    { cls: ".JOFTIA_Country", min: 10, max: 25, align: "left" },
    { cls: ".JOFTIA_PIN", min: 10, max: 10, align: "left" },
    { cls: ".JOFTIA_GSTIN", min: 15, max: 15, align: "left" }
];

const ItemTableFields = [
    { cls: ".JOFTII_SO", min: 20, max: 25, align: "left" },
    { cls: ".JOFTII_SourceNo", min: 20, max: 25, align: "left" },
    { cls: ".JOFTII_Process", min: 10, max: 25, align: "left" },
    { cls: ".JOFTII_ItemCode", min: 10, max: 15, align: "left" },
    { cls: ".JOFTII_ItemDescription", min: 40, max: 40, align: "left" },
    { cls: ".JOFTII_OuterDia", min: 8, max: 8, align: "center" },
    { cls: ".JOFTII_Thickness", min: 8, max: 8, align: "center" },
    { cls: ".JOFTII_Length", min: 8, max: 8, align: "center" },
    { cls: ".JOFTII_MaterialGrade", min: 10, max: 25, align: "left" },
    { cls: ".JOFTII_ItemGroup", min: 10, max: 30, align: "left" },
    { cls: ".JOFTII_FromWH_Number", min: 10, max: 15, align: "center" },
    { cls: ".JOFTII_ToWH_Number", min: 10, max: 15, align: "center" },
    { cls: ".JOFTII_UoM", min: 10, max: 15, align: "center" },
    { cls: ".JOFTII_DeliveredQty", min: 10, max: 20, align: "center" },
    { cls: ".JOFTII_PrevInvoiceQty", min: 10, max: 20, align: "center" },
    { cls: ".JOFTII_InvoiceQty", min: 10, max: 20, align: "center" },
    { cls: ".JOFTII_Qty_Kgs", min: 10, max: 20, align: "center" },
    { cls: ".JOFTII_Rate", min: 10, max: 20, align: "right" },
    { cls: ".JOFTII_RateLabel", min: 10, max: 20, align: "right" },
    { cls: ".JOFTII_Amount", min: 13, max: 25, align: "right" },
    { cls: ".JOFTII_SAC", min: 8, max: 8, align: "left" },
    { cls: ".JOFTII_GST_Amount", min: 13, max: 25, align: "right" },
    { cls: ".JOFTII_WHT_Percent", min: 8, max: 10, align: "right" },
    { cls: ".JOFTII_WH_TaxAmount", min: 13, max: 25, align: "right" }
];

const HeaderWidths = {
    Header_JOFTIH_JournalNo: [20, 25],
    Header_JOFTIH_VendorInvoiceNo: [20, 25],
    Header_JOFTIH_Category: [20, 30],
    Header_JWV_JW_VendorName: [40, 50],
    Header_JOFTIH_Currency_Number: [10, 10],
    Header_JOFTIH_TCT_Number: [20, 25],
    Header_JOFTIH_WHT_Number: [15, 25],
    Header_JOFTIH_PaymentTerms: [30, 40],
    Header_JOFTIH_PaymentMethod: [30, 40],
    Header_JOFTIH_Remarks: [40, 40]
};

function AutoFit() {
    Object.keys(HeaderWidths).forEach(function (id) { fitInputWidth(id, HeaderWidths[id][0], HeaderWidths[id][1]); });
}
function ResizeColumns() {
    ApplyFieldWidths({ fields: ItemTableFields, container: "#ItemTable", tableBody: "#TableBody" });
}
function ResizeAddressColumns() {
    ApplyFieldWidths({ fields: AddressFields, container: "#AddressTable", tempRow: "#AddTempRow", tableBody: "#AddTableBody" });
}
function ResizeAddressPopup(tableSelector = "#AddressTable", modalSelector = "#BuyerAddress") {
    const table = document.querySelector(tableSelector);
    const dialog = document.querySelector(modalSelector + " .modal-dialog");
    if (!table || !dialog) return;
    const w = table.offsetWidth + 40;
    dialog.style.setProperty("width", w + "px", "important");
    dialog.style.setProperty("max-width", w + "px", "important");
}
function ResizeSourcePopup() {
    const table = document.querySelector("#SourceTableView table");
    const dialog = document.querySelector("#SourceView .modal-dialog");
    if (!table || !dialog) return;
    let w = Math.min(window.innerWidth - 40, Math.max(500, table.offsetWidth + 60));
    dialog.style.maxWidth = w + "px";
    dialog.style.width = w + "px";
}
//#endregion

//#region ---------- CATEGORY / RCM / WHT UI ----------
function UpdateCategoryUI() {
    const rn = IsReceipt();
    $("#ColHeader_SourceNo").text(rn ? "Vendor Receipt Note No." : "Vendor Delivery Note No.");
    $("#ColHeader_DeliveredQty").text(rn ? "Received Qty" : "Delivered Qty");
    $("#SourceViewLabel").text(rn ? "Receipt Note" : "Delivery Note");
    $("#LoadSource").text(rn ? "Load Receipt Note" : "Load Delivery Note");
}

// RCM column visible only when header RCM checked
function ApplyRcmUI(keepRows) {
    const on = HeaderRCM();
    $(".col-rcm").toggle(on);
    if (keepRows !== true) $("#TableBody .JOFTII_RCM").prop("checked", on);
    ResizeColumns();
}

// WHT columns visible only when vendor WithholdTax = 1
function ApplyWhtUI() {
    const on = VendorHasWHT();
    $(".col-wht").toggle(on);
    $("#Header_JOFTIH_WHT_Number").prop("disabled", !on || window.IsViewMode === true);
    if (!on) {
        $("#Header_JOFTIH_WHT_Number").val(0);
        $("#Header_WHT_Percent").val(0);
    }
    $("#TableBody tr.NewRow").each(function () { RecalcWht($(this)); });
    CalculateTotals();
}
//#endregion

//#region ---------- VENDOR SEARCH (right pane) ----------
function OnBuyerSelectCall(inputElement) {
    OnBuyerSelect(inputElement, "#RightPane", ".buyer-search-results");
}

// common OnBuyerSelect() calls SearchBuyer on first focus
function SearchBuyer(inputElement) {
    SearchVendor(inputElement);
}

function OnBuyerInput(inputElement) {
    if (inputElement.selectionStart !== inputElement.selectionEnd) return;
    SearchVendor(inputElement);
}

function SearchVendor(inputElement) {
    const text = inputElement.value;
    const dt = ToIsoDate($("#Header_JOFTIH_JournalDate").val());
    const resultsDiv = $("#RightPane").find(".buyer-search-results");

    if (buyerSearchXHR) buyerSearchXHR.abort();

    buyerSearchXHR = $.ajax({
        url: JOFT_URL + "/vendor-search",
        type: "GET",
        data: { Search: text, InvoiceDate: dt },
        success: function (data) {
            resultsDiv.empty();
            $("#BuyerMessage").hide().text("");

            if (!data || data.length === 0) {
                resultsDiv.append(GetBuyerEmptyView());
                $("#RightPane").addClass("show");
                resultsDiv.show();
                return;
            }

            $("#RightPane").addClass("show");
            resultsDiv.show();

            const table = $(
                '<div class="card-body modal-content batchPopup p-0" style="z-index:999;">' +
                '<table class="table table-bordered table-hover table-fixed table-grid mb-0 w-100">' +
                '<thead><tr class="table-info"><th>JW Vendor Name</th></tr></thead><tbody></tbody></table></div>');

            $.each(data, function (i, v) {
                const row = $("<tr></tr>").css("height", "24px");
                row.data("vendor", v);
                row.append("<td>" + v.JWV_JW_VendorName + "</td>");
                table.find("tbody").append(row);
            });

            table.find("tbody").on("mousedown", "tr", function (e) {
                e.preventDefault();
                isMouseSelectingBuyer = true;
                SelectVendor($(this).data("vendor"));
                $("#BuyerMessage").hide().text("");
                $("#RightPane").removeClass("show");
                $("#RightPane .buyer-search-results").hide();
                setTimeout(function () {
                    $("#Header_JOFTIH_Currency_Number").focus();
                    isMouseSelectingBuyer = false;
                }, 100);
            });

            resultsDiv.append(table);
            resultsDiv.append(
                '<div id="BuyerMessage" style="display:none;background:#bdbdbd;border-top:1px solid #ced4da;color:#dc3545;' +
                'font-weight:bold;text-align:center;padding:4px 52px;font-size:18px;position:absolute;bottom:0;left:-2px;' +
                'right:0;z-index:10;box-sizing:border-box;"></div>');

            // highlight starts-with matches
            const rows = resultsDiv.find("tbody tr");
            rows.removeClass("match-row current-row");
            $(inputElement).removeData("selectedIndex");
            const s = text.trim().toLowerCase();
            let first = -1, last = -1;
            rows.each(function (i) {
                const nm = $(this).find("td:first").text().trim().toLowerCase();
                if (s !== "" && nm.startsWith(s)) {
                    $(this).addClass("match-row");
                    if (first === -1) first = i;
                    last = i;
                }
            });
            if (first >= 0) { $(inputElement).data("firstMatch", first); $(inputElement).data("lastMatch", last); }
            else { $(inputElement).removeData("firstMatch"); $(inputElement).removeData("lastMatch"); }
        },
        error: function (xhr, status) {
            if (status === "abort") return;
            resultsDiv.text("Error loading data.").show();
        }
    });
}

// vendor row  ->  header fields (Currency / Tax Cluster / WHT / Payment)
function SelectVendor(v) {
    const changed = $("#Header_JOFTIH_JW_Vendor_Number").val() != v.JWV_Number;

    $("#Header_JOFTIH_JW_Vendor_Number").val(v.JWV_Number);
    $("#Header_JWV_JW_VendorName").val(v.JWV_JW_VendorName);

    if (changed && $("#TableBody tr.NewRow").length > 0) {
        $("#TableBody").empty();
        CalculateTotals();
    }
    if (changed) { $("#AddTableBody tr.AddNewRow").remove(); addressIndex = 0; }

    ApplyVendorInfo(v);
    LoadTaxClusterList(v.JWV_Number, v.TaxClusterNumber, v.TaxCluster);
}

function ApplyVendorInfo(v) {
    $("#Header_JOFTIH_Currency_Number").val(v.JWV_Currency_Number || "");
    if (v.JWV_PaymentTerms) $("#Header_JOFTIH_PaymentTerms").val(v.JWV_PaymentTerms);
    if (v.JWV_PaymentMode) $("#Header_JOFTIH_PaymentMethod").val(v.JWV_PaymentMode);

    $("#Header_JWV_WithholdTax").val(v.JWV_WithholdTax == 1 ? "1" : "0");
    const whtNo = v.JWV_WithholdTax == 1 ? (parseInt(v.JWV_WH_Number) || 0) : 0;
    $("#Header_JOFTIH_WHT_Number").val(whtNo).prop("disabled", v.JWV_WithholdTax != 1);

    LoadWhtPercent(function () { ApplyWhtUI(); });
    AutoFit();
}

// Tax Cluster dropdown (Id 8) then select the vendor's cluster
function LoadTaxClusterList(vendorNo, selectedTct, selectedName) {
    function fill(data) {
        const ddl = $("#Header_JOFTIH_TCT_Number").empty();
        ddl.append('<option value="0">-- Select --</option>');
        $.each(data || [], function (i, t) {
            ddl.append($("<option>", { value: t.TaxClusterNumber, text: t.TaxCluster }));
        });
        if (selectedTct && ddl.find('option[value="' + selectedTct + '"]').length === 0) {
            ddl.append($("<option>", { value: selectedTct, text: selectedName || selectedTct }));
        }
        ddl.val(selectedTct || 0);
        AutoFit();
    }
    $.get(JOFT_URL + "/tax-cluster", { VendorNumber: vendorNo, Search: "" }, fill)
        .fail(function () { fill([]); });
}

// Journal Date change -> refresh vendor's Tax Cluster / WHT for that date
function RefreshVendorByDate() {
    const vendorNo = $("#Header_JOFTIH_JW_Vendor_Number").val();
    const dt = ToIsoDate($("#Header_JOFTIH_JournalDate").val());
    if (!vendorNo || vendorNo === "0" || !dt) return;

    $.get(JOFT_URL + "/vendor-info", { VendorNumber: vendorNo, InvoiceDate: dt }, function (data) {
        if (!data || data.length === 0) return;
        const v = data[0];
        $("#Header_JWV_WithholdTax").val(v.JWV_WithholdTax == 1 ? "1" : "0");
        const whtNo = v.JWV_WithholdTax == 1 ? (parseInt(v.TaxCode) || 0) : 0;
        $("#Header_JOFTIH_WHT_Number").val(whtNo).prop("disabled", v.JWV_WithholdTax != 1);
        LoadTaxClusterList(vendorNo, v.TaxClusterNumber, v.TaxCluster);
        LoadWhtPercent(function () { ApplyWhtUI(); });
        $("#TableBody .JOFTII_Qty_Kgs").first().trigger("change"); // re-calc GST for new date
    });
}

// WHT % (Id 7) - only when vendor WHT = 1
function LoadWhtPercent(callback) {
    const vendorNo = $("#Header_JOFTIH_JW_Vendor_Number").val();
    const whtNo = $("#Header_JOFTIH_WHT_Number").val();
    const dt = ToIsoDate($("#Header_JOFTIH_JournalDate").val());

    if (!VendorHasWHT() || !vendorNo || !whtNo || whtNo === "0") {
        $("#Header_WHT_Percent").val(0);
        if (callback) callback();
        return;
    }
    $.get(JOFT_URL + "/wht-percent", { VendorNumber: vendorNo, WHTNumber: whtNo, InvoiceDate: dt }, function (data) {
        const p = data && data.length > 0 ? parseFloat(data[0].TaxPercentage) || 0 : 0;
        $("#Header_WHT_Percent").val(p);
        if (callback) callback();
    });
}
//#endregion

//#region ---------- ROW CALCULATIONS ----------
function RecalcWht(row) {
    let pct = 0, amt = 0;
    if (VendorHasWHT()) {
        pct = parseFloat($("#Header_WHT_Percent").val()) || 0;
        amt = JN(row.find(".JOFTII_Amount").val()) * pct / 100;
    }
    row.find(".JOFTII_WHT_Percent").val(addComma(pct, "c"));
    row.find(".JOFTII_WH_TaxAmount").val(addComma(amt, "c"));
}

async function GetGSTAmount(cluster, journalDate, sacNumber, baseAmount) {
    return await $.ajax({
        url: "/income/gst", type: "GET",
        data: { Cluster: cluster, SIHDate: journalDate, SAC: sacNumber, BaseAmount: baseAmount }
    });
}

async function RecalcRow(row) {
    const amount = JN(row.find(".JOFTII_Qty_Kgs").val()) * JN(row.find(".JOFTII_Rate").val());
    row.find(".JOFTII_Amount").val(addComma(amount, "c"));
    RecalcWht(row);

    const cluster = $("#Header_JOFTIH_TCT_Number").val();
    const jdate = $("#Header_JOFTIH_JournalDate").val();
    const sac = row.find(".JOFTII_SAC_Number").val();
    let gst = 0;
    if (cluster && cluster !== "0" && sac && sac !== "0") {
        gst = await GetGSTAmount(cluster, jdate, sac, amount);
    }
    row.find(".JOFTII_GST_Amount").val(addComma(parseFloat(gst || 0), "c"));
    CalculateTotals();
}

// Σ qty of OTHER rows using the same Freight SO
function GetOtherRowsQtyForSO(svoh, currentRow) {
    let total = 0;
    $("#TableBody tr.NewRow").each(function () {
        const r = $(this);
        if (r.is(currentRow)) return;
        if ((r.find(".JOFTII_JOFRT_SVOH_Number").val() || 0) == svoh)
            total += JN(r.find(".JOFTII_Qty_Kgs").val());
    });
    return total;
}

function GetAllowedQty(svoh, jprs, fromWH, toWH, uom, callback) {
    $.get(JOFT_URL + "/check-allowed-qty", {
        jofrtSvohNumber: svoh, jprsNumber: jprs, fromWH: fromWH, toWH: toWH, uomNumber: uom, joftihNumber: window.JOFTIH_Number || 0
    }, function (res) {
        callback(res ? (parseFloat(res.soQty) || 0) - (parseFloat(res.usedQty) || 0) : 0);
    });
}

// Max allowed qty check of one row : Balance (Delivered - Prev Invoiced, this invoice excluded by SP)
// + Freight SO allowed qty (this invoice excluded by check-allowed-qty). Then RecalcRow.
function ValidateRowQty(row) {
    const q = row.find(".JOFTII_Qty_Kgs");
    let cur = JN(q.val());
    const balance = JN(row.find(".JOFTII_DeliveredQty").val()) - JN(row.find(".JOFTII_PrevInvoiceQty").val());

    if (cur < 0) { cur = 0; q.val(addComma(0, "q")); }
    if (cur > balance) {
        alert("Current Invoice Qty cannot exceed Balance Qty (" + balance + ")");
        q.val(addComma(balance, "q"));
        RecalcRow(row);
        return;
    }

    const svoh = row.find(".JOFTII_JOFRT_SVOH_Number").val() || 0;
    if (svoh > 0) {
        GetAllowedQty(svoh, FREIGHT_JPRS,
            row.find(".JOFTII_FromWH_Number").val() || 0,
            row.find(".JOFTII_ToWH_Number").val() || 0,
            row.find(".JOFTII_UoM_Number").val() || 0,
            function (allowed) {
                const real = allowed - GetOtherRowsQtyForSO(svoh, row);
                if (JN(q.val()) > real) {
                    q.val(addComma(Math.max(0, real), "q"));
                    alert("Qty Allowed: " + real);
                }
                RecalcRow(row);
            });
        return;
    }
    RecalcRow(row);
}

function CalculateTotals() {
    let dQ = 0, pQ = 0, iQ = 0, cQ = 0, amt = 0, gst = 0, wht = 0;
    $("#TableBody tr.NewRow").each(function () {
        dQ += JN($(this).find(".JOFTII_DeliveredQty").val());
        pQ += JN($(this).find(".JOFTII_PrevInvoiceQty").val());
        iQ += JN($(this).find(".JOFTII_InvoiceQty").val());
        cQ += JN($(this).find(".JOFTII_Qty_Kgs").val());
        amt += JN($(this).find(".JOFTII_Amount").val());
        gst += JN($(this).find(".JOFTII_GST_Amount").val());
        wht += JN($(this).find(".JOFTII_WH_TaxAmount").val());
    });
    $("#TotalDeliveredQty").val(addComma(dQ, "q"));
    $("#TotalPrevInvoiceQty").val(addComma(pQ, "q"));
    $("#TotalQty").val(addComma(iQ, "q"));
    $("#TotalAmendedQty").val(addComma(cQ, "q"));
    $("#TotalAmount").val(addComma(amt, "c"));
    $("#TotalGSTAmount").val(addComma(gst, "c"));
    $("#TotalWHTAmount").val(addComma(wht, "c"));
    setTimeout(ResizeColumns, 200);
}
//#endregion

//#region ---------- SOURCE POPUP (DN / RN) ----------
function GetGridSourceHeaders() {
    const ids = [];
    $("#TableBody tr.NewRow").each(function () {
        const id = String($(this).attr("data-mnh"));
        if ($.inArray(id, ids) === -1) ids.push(id);
    });
    return ids;
}

function ValidateVendorForLoad() {
    const v = $("#Header_JOFTIH_JW_Vendor_Number").val();
    if (!v || v === "0" || $.trim($("#Header_JWV_JW_VendorName").val()) === "") {
        showAlert("JW Vendor is required", "#Header_JWV_JW_VendorName");
        return false;
    }
    return true;
}

function LoadSourceGroups() {
    const vendorNo = $("#Header_JOFTIH_JW_Vendor_Number").val();
    const category = CurrentCategory();
    const resultsDiv = $("#SourceTableView");
    const inGrid = GetGridSourceHeaders();
    const no = IsReceipt() ? "Receipt Note No" : "Delivery Note No";
    const dtl = IsReceipt() ? "Receipt Note Date" : "Delivery Note Date";

    $.get(JOFT_URL + "/source-group", { VendorNumber: vendorNo, Category: category }, function (list) {
        resultsDiv.empty();

        if (!list || list.length === 0) {
            resultsDiv.html('<div class="text-center p-3">No ' + (IsReceipt() ? "Receipt Note" : "Delivery Note") + ' Found</div>');
            $("#SourceView").modal("show");
            return;
        }

        const table = $(
            '<table class="table table-bordered mb-0 table-hover table-grid"><thead><tr class="table-info">' +
            '<th class="px-2 del"></th><th>' + no + '</th><th>' + dtl + '</th><th class="text-end">Balance Qty</th>' +
            '</tr></thead><tbody></tbody></table>');

        list.forEach(function (d) {
            const dt = d.JOMNH_Date ? new Date(d.JOMNH_Date).toLocaleDateString("en-GB",
                { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-") : "";
            const cb = $('<input type="checkbox" class="form-check-input source-checkbox">').val(d.JOMNH_Number);
            if ($.inArray(String(d.JOMNH_Number), inGrid) !== -1) cb.prop("checked", true);

            const tr = $("<tr></tr>");
            tr.append($('<td class="px-2 del text-center"></td>').append(cb));
            tr.append("<td>" + d.JOMNH_No + "</td>");
            tr.append("<td>" + dt + "</td>");
            tr.append('<td class="text-center">' + addComma(d.RemainingQty, "q") + "</td>");
            table.find("tbody").append(tr);
        });

        const btn = $('<div class="w-100 p-2 text-center"><button type="button" class="btn btn-primary" id="GetSource">Get</button></div>');
        resultsDiv.append(table).append(btn);

        btn.find("#GetSource").on("click", function () {
            const selected = $.map(table.find(".source-checkbox:checked"), function (c) { return c.value; });

            // remove rows of un-ticked documents
            $("#TableBody tr.NewRow").each(function () {
                if ($.inArray(String($(this).attr("data-mnh")), selected) === -1) $(this).remove();
            });

            if (selected.length > 0) InsertSourceItems(selected.join(","));
            else CalculateTotals();

            $("#SourceView").modal("hide");
        });

        ResizeSourcePopup();
        $("#SourceView").modal("show");
    });
}

function InsertSourceItems(numbers) {
    const vendorNo = $("#Header_JOFTIH_JW_Vendor_Number").val();
    const category = CurrentCategory();

    $.get(JOFT_URL + "/source-items", { VendorNumber: vendorNo, Category: category, Numbers: numbers }, function (items) {
        const added = [];
        $.each(items || [], function (i, it) {

            // skip item already in grid
            const exists = $("#TableBody tr.NewRow").filter(function () {
                return $(this).attr("data-mnh") == it.JOMNH_Number && $(this).attr("data-mni") == it.JOMNI_Number;
            }).length > 0;
            if (exists) return;

            const $new = $(BuildRow(RowFromSource(it, category)));
            $("#TableBody").append($new);
            added.push($new);
        });

        $("#TableBody tr.NewRow").each(function () { RecalcRow($(this)); });
        // new rows that already carry a Freight SO -> SO allowed qty check
        added.forEach(function ($r) { if ((parseInt($r.find(".JOFTII_JOFRT_SVOH_Number").val()) || 0) > 0) ValidateRowQty($r); });
        ApplyRcmUI(true);
        CalculateTotals();
    });
}

// popup item  ->  normalized row object
function RowFromSource(it, category) {
    const delivered = parseFloat(it.DeliveredQty) || 0;
    const prev = parseFloat(it.InvoicedQty) || 0;
    const hasSO = it.hasServiceOrder == 1;
    return {
        number: 0, category: category,
        mnh: it.JOMNH_Number, mni: it.JOMNI_Number,
        svoh: it.JOFRT_SVOH_Number || 0, svoi: it.JOFRT_SVOI_Number || 0,
        assign: hasSO ? category : "INVOICE", soLabel: hasSO, soNo: it.ServiceOrderNo || "",
        lockRate: hasSO,
        rate: hasSO ? (parseFloat(it.SO_Rate) || 0) : 0,
        itemNo: it.Item_Number, uomNo: it.UoM_Number,
        sourceNo: it.JOMNH_No, process: it.ProcessName,
        itemCode: it.ItemCode, desc: it.ItemDescription, od: it.OuterDia, th: it.Thickness, len: it.Length,
        grade: it.MaterialGrade, group: it.ItemGroup,
        fromWH: it.FromWH_Number, toWH: it.ToWH_Number, uom: it.UOM,
        delivered: delivered, prev: prev, invQty: 0, qty: Math.max(0, delivered - prev),
        sacNo: it.SAC_Number || 0, sac: it.SAC, gst: 0, rcm: HeaderRCM()
    };
}

// saved row (Get SP result set 1)  ->  normalized row object
function RowFromSaved(it) {
    const soAssigned = (it.JOFTII_SVO_Assign || "") !== "INVOICE" && (it.JOFTII_JOFRT_SVOH_Number || 0) > 0;
    return {
        number: it.JOFTII_Number, category: it.JOFTII_SourceCategory,
        mnh: it.JOFTII_JOMNH_Number, mni: it.JOFTII_JOMNI_Number,
        svoh: it.JOFTII_JOFRT_SVOH_Number || 0, svoi: it.JOFTII_JOFRT_SVOI_Number || 0,
        assign: it.JOFTII_SVO_Assign || "INVOICE", soLabel: soAssigned, soNo: it.ServiceOrderNo || "",
        lockRate: (it.JOFTII_JOFRT_SVOH_Number || 0) > 0,
        rate: parseFloat(it.JOFTII_Rate) || 0,
        itemNo: it.JOFTII_Item_Number, uomNo: it.JOFTII_UoM_Number,
        sourceNo: it.SourceNo, process: it.JPRS_ProcessName,
        itemCode: it.ItemCode, desc: it.ItemDescription, od: it.OuterDia, th: it.Thickness, len: it.Length,
        grade: it.MaterialGrade, group: it.ItemGroup,
        fromWH: it.JOFTII_FromWH_Number, toWH: it.JOFTII_ToWH_Number, uom: it.UnitCode,
        delivered: parseFloat(it.DeliveredQty) || 0, prev: parseFloat(it.PrevInvoicedQty) || 0,
        invQty: parseFloat(it.JOFTII_Qty_Kgs) || 0, qty: parseFloat(it.JOFTII_Qty_Kgs) || 0,
        sacNo: it.JOFTII_SAC_Number || 0, sac: it.SAC_Code,
        gst: parseFloat(it.JOFTII_GST_Amount) || 0,
        amount: parseFloat(it.JOFTII_Amount) || 0,
        whtPct: parseFloat(it.JOFTII_WHT_Percent) || 0,
        whtAmt: parseFloat(it.JOFTII_WH_TaxAmount) || 0,
        rcm: it.JOFTII_RCM === "Yes"
    };
}

function BuildRow(r) {
    const soCell = r.soLabel
        ? `<label class="form-control JOFTII_SO JOFTII_SOLabel">${r.soNo}</label>`
        : `<select class="form-select JOFTII_SO JOFTII_SOSelect" onchange="OnServiceOrderChange(this)">` +
          `<option value="0"></option>${r.svoh > 0 ? `<option value="${r.svoh}" selected>${r.soNo}</option>` : ""}</select>`;

    const rateCell = r.soLabel
        ? `<label class="form-control JOFTII_RateLabel">${addComma(r.rate, "c")}</label>
           <input type="hidden" value="${r.rate}" class="JOFTII_Rate" />`
        : `<input value="${addComma(r.rate, "c")}" class="form-control JOFTII_Rate" ${r.lockRate ? "readonly" : ""} />`;

    const whtShow = VendorHasWHT() ? "" : 'style="display:none"';
    const rcmShow = HeaderRCM() ? "" : 'style="display:none"';

    return `
<tr class="NewRow" data-source="${r.category === "RECEIPT NOTE" ? "RN" : "DN"}"
    data-mnh="${r.mnh}" data-mni="${r.mni}">
  <td class="p-2 del"><input type="checkbox" class="CheckItem form-check-input"></td>

  <td class="col-rcm text-center" ${rcmShow}>
      <input type="checkbox" class="form-check-input JOFTII_RCM" ${r.rcm ? "checked" : ""}></td>

  <td>${soCell}
      <input type="hidden" class="JOFTII_JOFRT_SVOH_Number" value="${r.svoh}" />
      <input type="hidden" class="JOFTII_JOFRT_SVOI_Number" value="${r.svoi}" />
      <input type="hidden" class="JOFTII_SVO_Assign" value="${r.assign}" /></td>

  <td>
      <input type="hidden" class="JOFTII_Number" value="${r.number}" />
      <input type="hidden" class="JOFTII_JOMNH_Number" value="${r.mnh}" />
      <input type="hidden" class="JOFTII_JOMNI_Number" value="${r.mni}" />
      <input type="hidden" class="JOFTII_Item_Number" value="${r.itemNo}" />
      <input type="hidden" class="JOFTII_UoM_Number" value="${r.uomNo}" />
      <input class="form-control JOFTII_SourceNo" value="${r.sourceNo ?? ""}" readonly /></td>

  <td><input class="form-control JOFTII_Process" value="${r.process ?? ""}" readonly /></td>
  <td><input class="form-control JOFTII_ItemCode" value="${r.itemCode ?? ""}" readonly /></td>
  <td><input class="form-control JOFTII_ItemDescription" value="${r.desc ?? ""}" readonly /></td>
  <td><input class="form-control JOFTII_OuterDia" value="${r.od ?? ""}" readonly /></td>
  <td><input class="form-control JOFTII_Thickness" value="${r.th ?? ""}" readonly /></td>
  <td><input class="form-control JOFTII_Length" value="${r.len ?? ""}" readonly /></td>
  <td><input class="form-control JOFTII_MaterialGrade" value="${r.grade ?? ""}" readonly /></td>
  <td><input class="form-control JOFTII_ItemGroup" value="${r.group ?? ""}" readonly /></td>

  <td><select class="form-select JOFTII_FromWH_Number">${GetWarehouseOptions(r.fromWH)}</select></td>
  <td><select class="form-select JOFTII_ToWH_Number">${GetWarehouseOptions(r.toWH)}</select></td>
  <td><input class="form-control JOFTII_UoM text-center" value="${r.uom ?? ""}" readonly /></td>

  <td class="text-center"><input value="${addComma(r.delivered, "q")}" class="form-control JOFTII_DeliveredQty" readonly tabindex="-1" /></td>
  <td class="text-center"><input value="${addComma(r.prev, "q")}" class="form-control JOFTII_PrevInvoiceQty" readonly tabindex="-1" /></td>
  <td class="text-center"><input value="${addComma(r.invQty, "q")}" class="form-control JOFTII_InvoiceQty" readonly tabindex="-1" /></td>
  <td><input value="${addComma(r.qty, "q")}" class="form-control JOFTII_Qty_Kgs" /></td>

  <td>${rateCell}</td>
  <td><input value="${addComma(r.amount ?? 0, "c")}" class="form-control JOFTII_Amount" readonly /></td>

  <td><input type="hidden" class="JOFTII_SAC_Number" value="${r.sacNo}" />
      <input value="${r.sac ?? ""}" class="form-control JOFTII_SAC" readonly /></td>
  <td><input value="${addComma(r.gst ?? 0, "c")}" class="form-control JOFTII_GST_Amount" readonly /></td>

  <td class="col-wht" ${whtShow}>
      <input value="${addComma(r.whtPct ?? 0, "c")}" class="form-control JOFTII_WHT_Percent" readonly /></td>
  <td class="col-wht" ${whtShow}>
      <input value="${addComma(r.whtAmt ?? 0, "c")}" class="form-control JOFTII_WH_TaxAmount" readonly /></td>
</tr>`;
}
//#endregion

//#region ---------- FREIGHT SERVICE ORDER (row) ----------
function LoadServiceOrderDropdown(dropdown) {
    const row = $(dropdown).closest("tr");
    $.get(JOFT_URL + "/freight-so", {
        vendorId: $("#Header_JOFTIH_JW_Vendor_Number").val(),
        category: row.attr("data-source") === "RN" ? "RECEIPT NOTE" : "DELIVERY NOTE",
        uomNumber: row.find(".JOFTII_UoM_Number").val() || 0,
        fromWHNumber: row.find(".JOFTII_FromWH_Number").val() || 0,
        toWHNumber: row.find(".JOFTII_ToWH_Number").val() || 0
    }, function (res) {
        let o = '<option value="0"></option>';
        $.each(res || [], function (_, i) { if (i.value) o += `<option value="${i.value}">${i.text}</option>`; });
        const prev = row.find(".JOFTII_JOFRT_SVOH_Number").val() || "0";
        $(dropdown).html(o).val(prev);
    });
}

function OnServiceOrderChange(ele) {
    const row = $(ele).closest("tr");
    const so = $(ele).val();
    row.find(".JOFTII_JOFRT_SVOH_Number").val(so || 0);
    row.find(".JOFTII_SVO_Assign").val("INVOICE");

    const rateBox = row.find(".JOFTII_Rate");
    const unlock = function () {
        row.find(".JOFTII_JOFRT_SVOI_Number").val(0);
        rateBox.off("keydown keypress paste").prop("readonly", false);
    };

    if (!so || so === "0") { unlock(); rateBox.val(addComma(0, "c")); RecalcRow(row); return; }

    $.get(JOFT_URL + "/freight-so-item", {
        JOFRT_SVOH_Number: so,
        FromWH: row.find(".JOFTII_FromWH_Number").val() || 0,
        ToWH: row.find(".JOFTII_ToWH_Number").val() || 0,
        UoM_Number: row.find(".JOFTII_UoM_Number").val() || 0
    }, function (res) {
        if (!res) { unlock(); rateBox.val(""); return; }
        row.find(".JOFTII_JOFRT_SVOI_Number").val(res.jofrtSvoiNumber || 0);
        if (res.unitPrice == null) { rateBox.off("keydown keypress paste").prop("readonly", false); }
        else {
            rateBox.val(addComma(res.unitPrice, "c")).prop("readonly", true)
                .off("keydown keypress paste").on("keydown keypress paste", function (e) { e.preventDefault(); });
        }
        ValidateRowQty(row);           // SO changed -> Balance + SO allowed qty check, then recalc
    });
}
//#endregion

//#region ---------- GST POPUP ----------
function ClusterTaxView(data) {
    const table = document.createElement("table");
    table.classList.add("table", "table-bordered", "table-hover", "align-middle", "w-100", "mb-0");
    const headers = ["Tax Category", "Tax Type", "Tax Index", "Tax Element", "Assessable Value", "Tax Rate", "Tax Amount", "Load on Inventory", "Load on Inventory %"];

    const hr = table.createTHead().insertRow();
    headers.forEach(function (h) {
        const th = document.createElement("th");
        th.textContent = h;
        th.classList.add("table-info");
        if (/Assessable|Tax Rate|Tax Amount|Inventory %/.test(h)) th.classList.add("text-end", "table-width-xl");
        else if (/Tax Index|Load on Inventory/.test(h)) th.classList.add("text-center", "table-width-md");
        hr.appendChild(th);
    });

    const tb = table.createTBody();
    let totalTax = 0;
    data.forEach(function (t) {
        const r = tb.insertRow();
        r.dataset.gstc = t.gstcNumber; r.dataset.gstt = t.gsttNumber; r.dataset.gste = t.gsteNumber; r.dataset.taxindex = t.taxIndex;
        const c = [];
        for (let i = 0; i < 9; i++) c.push(r.insertCell());
        c[0].textContent = t.taxCategory;
        c[1].textContent = t.taxType;
        c[2].textContent = t.taxIndex; c[2].classList.add("text-center", "table-width-md");
        c[3].textContent = t.taxElement;
        c[4].textContent = t.assessableValue.toFixed(2); c[4].classList.add("text-end", "table-width-xl");
        c[5].textContent = t.percentage.toFixed(2); c[5].classList.add("text-end", "table-width-xl");
        c[6].textContent = t.amount.toFixed(2); c[6].classList.add("text-end", "table-width-xl");
        c[7].textContent = t.loadonInventory; c[7].classList.add("text-center", "table-width-md");
        c[8].textContent = t.loadonInventoryPercent; c[8].classList.add("text-end", "table-width-xl");
        totalTax += t.amount;
    });

    const fr = table.createTFoot().insertRow();
    const fc = headers.map(function () { const x = fr.insertCell(); x.classList.add("table-info"); return x; });
    fc[fc.length - 4].textContent = "Total"; fc[fc.length - 4].style.textAlign = "right";
    fc[fc.length - 3].textContent = totalTax.toFixed(2); fc[fc.length - 3].style.textAlign = "right";
    return table;
}
//#endregion

//#region ---------- ADDRESS POPUP (JWV_Address) ----------
function GetVisibleAddressRowCount() { return $("#AddTableBody tr.AddNewRow").length; }

function addAddressRow() {
    const i = addressIndex;
    const $row = $("#AddTempRow").clone();
    $row.removeAttr("id").addClass("AddNewRow").show();
    $row.find("input, textarea").val("");
    $row.find(".JOFTIA_ADTP_Number").val("");
    $row.find(".JOFTIA_Address_ID").empty();
    $row.data("addrs", []);
    $row.attr("data-idx", i);
    $("#AddTableBody").append($row);
    addressIndex++;
    return $row;
}

function FillAddressFields(row, a) {
    row.find(".JOFTIA_Address").val(a ? a.JWV_ADD_Address : "");
    row.find(".JOFTIA_City").val(a ? a.JWV_ADD_City : "");
    row.find(".JOFTIA_State").val(a ? a.JWV_ADD_State : "");
    row.find(".JOFTIA_Country").val(a ? a.JWV_ADD_Country : "");
    row.find(".JOFTIA_PIN").val(a ? a.JWV_ADD_PIN : "");
    row.find(".JOFTIA_GSTIN").val(a ? a.JWV_ADD_GSTIN : "");
}

// fill Address ID dropdown of a row for the given type list; select default
function FillAddressIdDropdown(row, list, selectId) {
    const dd = row.find(".JOFTIA_Address_ID").empty().append('<option value=""></option>');
    row.data("addrs", list);
    list.forEach(function (a) { dd.append($("<option>", { value: a.JWV_ADD_Address_ID, text: a.JWV_ADD_Address_ID })); });

    let pick = null;
    if (selectId) pick = list.find(function (a) { return a.JWV_ADD_Address_ID == selectId; });
    if (!pick) pick = list.find(function (a) { return a.JWV_ADD_Default == 1; }) || list[0];
    if (pick) { dd.val(pick.JWV_ADD_Address_ID); FillAddressFields(row, pick); }
    else FillAddressFields(row, null);
}

function isDuplicateAddress(type, currentRow) {
    let dup = false;
    $("tr.AddNewRow").not(currentRow).each(function () {
        if ($(this).find(".JOFTIA_ADTP_Number").val() === type) { dup = true; return false; }
    });
    return dup;
}

function LoadVendorAddress() {
    const vendorNo = $("#Header_JOFTIH_JW_Vendor_Number").val();
    $.get(JOFT_URL + "/vendor-address", { VendorNumber: vendorNo }, function (all) {
        if (all && all.length) {
            // one row per Address Type that has a default address
            all.filter(function (a) { return a.JWV_ADD_Default == 1; }).forEach(function (d) {
                const row = addAddressRow();
                row.find(".JOFTIA_ADTP_Number").val(d.JWV_ADD_ADTP_Number);
                FillAddressIdDropdown(row, all.filter(function (x) { return x.JWV_ADD_ADTP_Number == d.JWV_ADD_ADTP_Number; }), d.JWV_ADD_Address_ID);
            });
        }
        ShowAddressPopup();
    });
}

function ShowAddressPopup() {
    ResizeAddressColumns();
    $("#BuyerAddress").off("shown.bs.modal.resize").one("shown.bs.modal.resize", function () { ResizeAddressPopup(); });
    $("#BuyerAddress").modal("show");
}
//#endregion

//#region ---------- SAVE ----------
function ValidateHeader() {
    const req = function (sel, msg) {
        const v = ($(sel).val() || "").toString().trim();
        if (v === "" || v === "0") { showAlert(msg, sel); return false; }
        return true;
    };
    return req("#Header_JOFTIH_JournalNo", "Journal No is required") &&
        req("#Header_JOFTIH_JournalDate", "Journal Date is required") &&
        req("#Header_JOFTIH_VendorInvoiceNo", "Vendor Invoice No is required") &&
        req("#Header_JOFTIH_VendorInvoiceDate", "Vendor Invoice Date is required") &&
        req("#Header_JOFTIH_JW_Vendor_Number", "JW Vendor is required") &&
        req("#Header_JOFTIH_Currency_Number", "Currency is required") &&
        req("#Header_JOFTIH_TCT_Number", "Tax Cluster is required");
}

function ValidateItems() {
    const rows = $("#TableBody tr.NewRow");
    if (rows.length === 0) { showAlert("At least one item row is required"); return false; }

    let ok = true;
    rows.each(function (idx) {
        const r = $(this);
        r.removeClass("error-row");
        const fail = function (msg, sel) {
            r.addClass("error-row");
            showAlert("Row " + (idx + 1) + " : " + msg);
            r.find(sel).focus();
            ok = false;
            return false;
        };
        if (JN(r.find(".JOFTII_Qty_Kgs").val()) <= 0) return fail("Current Invoice Qty cannot be 0", ".JOFTII_Qty_Kgs");
        if (JN(r.find(".JOFTII_Rate").val()) <= 0) return fail("Rate cannot be 0", ".JOFTII_Rate");
        if (JN(r.find(".JOFTII_Amount").val()) <= 0) return fail("Amount cannot be 0", ".JOFTII_Amount");
    });
    return ok;
}

function CreateItemModel() {
    const rcmOn = HeaderRCM();
    const items = [];
    $("#TableBody tr.NewRow").each(function () {
        const r = $(this);
        const toWH = parseInt(r.find(".JOFTII_ToWH_Number").val()) || 0;
        const fromWH = parseInt(r.find(".JOFTII_FromWH_Number").val()) || 0;
        items.push({
            JOFTII_Number: parseInt(r.find(".JOFTII_Number").val()) || 0,
            JOFTII_JOFRT_SVOH_Number: parseInt(r.find(".JOFTII_JOFRT_SVOH_Number").val()) || 0,
            JOFTII_JOFRT_SVOI_Number: parseInt(r.find(".JOFTII_JOFRT_SVOI_Number").val()) || 0,
            JOFTII_JOMNH_Number: parseInt(r.find(".JOFTII_JOMNH_Number").val()) || 0,
            JOFTII_JOMNI_Number: parseInt(r.find(".JOFTII_JOMNI_Number").val()) || 0,
            JOFTII_SourceCategory: r.attr("data-source") === "RN" ? "RECEIPT NOTE" : "DELIVERY NOTE",
            JOFTII_JPRS_Number: FREIGHT_JPRS,
            JOFTII_Item_Number: parseInt(r.find(".JOFTII_Item_Number").val()) || 0,
            JOFTII_FromWH_Number: fromWH || null,
            JOFTII_ToWH_Number: toWH || null,
            JOFTII_UoM_Number: parseInt(r.find(".JOFTII_UoM_Number").val()) || 0,
            JOFTII_Qty_Kgs: JN(r.find(".JOFTII_Qty_Kgs").val()),
            JOFTII_Rate: JN(r.find(".JOFTII_Rate").val()),
            JOFTII_Amount: JN(r.find(".JOFTII_Amount").val()),
            JOFTII_SAC_Number: parseInt(r.find(".JOFTII_SAC_Number").val()) || 0,
            JOFTII_GST_Amount: JN(r.find(".JOFTII_GST_Amount").val()),
            JOFTII_WHT_Percent: JN(r.find(".JOFTII_WHT_Percent").val()),
            JOFTII_WH_TaxAmount: JN(r.find(".JOFTII_WH_TaxAmount").val()),
            JOFTII_RCM: rcmOn && r.find(".JOFTII_RCM").is(":checked") ? "Yes" : "No",
            JOFTII_SVO_Assign: r.find(".JOFTII_SVO_Assign").val() || "INVOICE"
        });
    });
    return items;
}

function CreateAddressModel() {
    const list = [];
    $("#AddTableBody tr.AddNewRow").each(function () {
        const r = $(this);
        if (!r.find(".JOFTIA_Address_ID").val()) return;
        list.push({
            JOFTIA_ADTP_Number: parseInt(r.find(".JOFTIA_ADTP_Number").val()) || 0,
            JOFTIA_Address_ID: r.find(".JOFTIA_Address_ID").val() || "",
            JOFTIA_Address: r.find(".JOFTIA_Address").val() || "",
            JOFTIA_City: r.find(".JOFTIA_City").val() || "",
            JOFTIA_State: r.find(".JOFTIA_State").val() || "",
            JOFTIA_Country: r.find(".JOFTIA_Country").val() || "",
            JOFTIA_PIN: r.find(".JOFTIA_PIN").val() || "",
            JOFTIA_GSTIN: r.find(".JOFTIA_GSTIN").val() || ""
        });
    });
    return list;
}

function CreateModel() {
    return {
        Header: {
            JOFTIH_Number: window.JOFTIH_Number || 0,
            JOFTIH_JournalNo: $("#Header_JOFTIH_JournalNo").val(),
            JOFTIH_JournalDate: ToIsoDate($("#Header_JOFTIH_JournalDate").val()),
            JOFTIH_VendorInvoiceNo: $("#Header_JOFTIH_VendorInvoiceNo").val(),
            JOFTIH_VendorInvoiceDate: ToIsoDate($("#Header_JOFTIH_VendorInvoiceDate").val()),
            JOFTIH_Category: CurrentCategory(),
            JOFTIH_JW_Vendor_Number: parseInt($("#Header_JOFTIH_JW_Vendor_Number").val()) || 0,
            JOFTIH_Currency_Number: parseInt($("#Header_JOFTIH_Currency_Number").val()) || 0,
            JOFTIH_TCT_Number: parseInt($("#Header_JOFTIH_TCT_Number").val()) || 0,
            JOFTIH_WHT_Number: VendorHasWHT() ? (parseInt($("#Header_JOFTIH_WHT_Number").val()) || 0) : 0,
            JOFTIH_RCM: HeaderRCM() ? "Yes" : "No",
            JOFTIH_PaymentTerms: $("#Header_JOFTIH_PaymentTerms").val(),
            JOFTIH_PaymentMethod: $("#Header_JOFTIH_PaymentMethod").val(),
            JOFTIH_Remarks: $("#Header_JOFTIH_Remarks").val()
        },
        Items: CreateItemModel(),
        Addresses: CreateAddressModel()
    };
}
//#endregion

//#region ---------- READY ----------
$(document).ready(function () {

    // dates (flatpickr)  -  today as default for both
    $(".datepicker").flatpickr({
        dateFormat: "d-M-Y", altInput: true, altFormat: "d-M-Y", allowInput: true
    });

    PrevCategory = $("#Header_JOFTIH_Category").val();
    UpdateCategoryUI();
    $(".col-rcm").hide();
    $(".col-wht").hide();
    AutoFit();
    setTimeout(ResizeColumns, 200);

    LoadInvoice();

    //#region header events
    $(document).on("keyup change input", Object.keys(HeaderWidths).map(function (i) { return "#" + i; }).join(","), function () {
        const w = HeaderWidths[this.id];
        if (w) fitInputWidth(this, w[0], w[1]);
    });

    $("#Header_JOFTIH_JournalDate").on("change", RefreshVendorByDate);

    $("#Header_JOFTIH_TCT_Number").on("change", function () {
        $("#TableBody tr.NewRow").each(function () { RecalcRow($(this)); });
    });

    $("#Header_JOFTIH_WHT_Number").on("change", function () {
        LoadWhtPercent(function () { ApplyWhtUI(); });
    });

    $("#Header_JOFTIH_RCM").on("change", function () { ApplyRcmUI(); });

    $("#Header_JOFTIH_Category").on("change", function () {
        const sel = $(this);
        if ($("#TableBody tr.NewRow").length > 0) {
            if (!confirm("Changing Category will clear the item rows. Continue?")) {
                sel.val(PrevCategory);
                return;
            }
            $("#TableBody").empty();
            CalculateTotals();
        }
        PrevCategory = sel.val();
        UpdateCategoryUI();
    });
    //#endregion

    //#region vendor name: focusout / keydown (common search helpers)
    $(document).on("focusout", "#Header_JWV_JW_VendorName", function () {
        if (isMouseSelectingBuyer) return;
        const input = $(this);
        const rows = $("#RightPane .buyer-search-results tbody tr");

        if ($.trim(input.val()) === "" && rows.length > 0 && !rows.filter(".current-row, .match-row").length) {
            isMouseSelectingBuyer = true;
            rows.first().trigger("mousedown");
            return;
        }
        HandleSearchSelection(input, rows, "#BuyerMessage", "#RightPane", "#RightPane .buyer-search-results");
    });

    $(document).on("keydown", "#Header_JWV_JW_VendorName", function (e) {
        if (["ArrowDown", "ArrowUp", "Enter", "Escape"].indexOf(e.key) < 0) return;
        const input = $(this);
        const rows = $("#RightPane .buyer-search-results tbody tr");

        if ((e.key === "Enter" || e.key === "Escape") && $.trim(input.val()) === "" && rows.length > 0 &&
            !rows.filter(".current-row, .match-row").length) {
            e.preventDefault();
            isMouseSelectingBuyer = true;
            rows.first().trigger("mousedown");
            return;
        }
        if (e.key === "Escape" || e.key === "Enter") {
            HandleSearchSelection(input, rows, "#BuyerMessage", "#RightPane", "#RightPane .buyer-search-results");
            return;
        }
        HandleSearchKeyDown(e, this, "#RightPane", ".buyer-search-results", "#BuyerMessage");
    });
    //#endregion

    //#region item grid events
    $(document).on("input change", "#ItemTable input, #ItemTable select", function () { ResizeColumns(); });

    $(document).on("focus", ".JOFTII_SOSelect", function () { LoadServiceOrderDropdown($(this)); });

    $(document).on("focusout", ".JOFTII_Qty_Kgs, .JOFTII_Rate", function () {
        $(this).val(addComma($(this).val(), $(this).is(".JOFTII_Qty_Kgs") ? "q" : "c"));
    });

    // qty validation (Balance + Freight SO allowed qty) then recalc
    $(document).on("keyup change", ".JOFTII_Qty_Kgs", function () {
        ValidateRowQty($(this).closest("tr"));
    });

    $(document).on("keyup change", ".JOFTII_Rate", function () { RecalcRow($(this).closest("tr")); });

    $(document).on("change", "#IndexAllCheckItem", function () {
        $("#TableBody .CheckItem").prop("checked", $(this).is(":checked"));
    });

    $(document).on("click", "#RemoveItemRowButton", function () {
        $("#TableBody tr.NewRow").each(function () {
            if ($(this).find(".CheckItem").is(":checked")) $(this).remove();
        });
        $("#IndexAllCheckItem").prop("checked", false);
        CalculateTotals();
    });
    //#endregion

    //#region GST popup (first ticked row)
    $(document).on("click", ".GSTView", function () {
        const cb = document.querySelector(".CheckItem:checked");
        if (!cb) return;
        const row = $(cb).closest("tr.NewRow");
        const sac = row.find(".JOFTII_SAC_Number").val();
        const item = row.find(".JOFTII_Item_Number").val();
        if (!item || !sac) return;

        $.ajax({
            type: "get", url: "/gst/view",
            data: {
                Cluster: $("#Header_JOFTIH_TCT_Number").val(),
                SIHDate: $("#Header_JOFTIH_JournalDate").val(),
                SAC: sac,
                BaseAmount: JN(row.find(".JOFTII_Amount").val())
            },
            success: function (data) {
                const t = document.getElementById("GSTTableView");
                t.innerHTML = "";
                t.appendChild(ClusterTaxView(data));
                new bootstrap.Modal($("#GSTView")).show();
            }
        });
    });
    //#endregion

    //#region source popup buttons
    $("#LoadSource").on("click", function () {
        if (!ValidateVendorForLoad()) return false;
        LoadSourceGroups();
    });
    //#endregion

    //#region address
    $("#AddressButton").on("click", function () {
        if (!ValidateVendorForLoad()) return;
        if (GetVisibleAddressRowCount() === 0) LoadVendorAddress();
        else ShowAddressPopup();
    });

    $("#AddressAddButton").on("click", function () { addAddressRow(); ResizeAddressColumns(); });

    $(document).on("click", "#AddTableBody .AddressRowRemove", function () {
        $(this).closest("tr.AddNewRow").remove();
    });

    $(document).on("change", "tr.AddNewRow select.JOFTIA_ADTP_Number", function () {
        const row = $(this).closest("tr.AddNewRow");
        const type = $(this).val();

        if (type && isDuplicateAddress(type, row)) {
            alert("This Address Type already exists!");
            $(this).val("").focus();
            return;
        }
        if (!type) { FillAddressIdDropdown(row, [], null); return; }

        $.get(JOFT_URL + "/vendor-address", {
            VendorNumber: $("#Header_JOFTIH_JW_Vendor_Number").val(), ADTPNumber: type
        }, function (list) {
            FillAddressIdDropdown(row, list || [], null);
            ResizeAddressColumns();
        });
    });

    $(document).on("change", "tr.AddNewRow select.JOFTIA_Address_ID", function () {
        const row = $(this).closest("tr.AddNewRow");
        const id = $(this).val();
        const a = (row.data("addrs") || []).find(function (x) { return x.JWV_ADD_Address_ID == id; });
        FillAddressFields(row, a);
        ResizeAddressColumns();
    });

    $(document).on("input", "#AddressTable input, #AddressTable textarea", ResizeAddressColumns);
    $(document).on("change", "#AddressTable select", ResizeAddressColumns);
    //#endregion

    //#region save / clear
    $("#btnSave").on("click", function (e) {
        e.preventDefault();
        if (!ValidateHeader()) return false;
        if (!ValidateItems()) return false;

        $.ajax({
            url: JOFT_URL + "/update", type: "POST", contentType: "application/json",
            data: JSON.stringify(CreateModel()),
            success: function (res) {
                if (res && res.success) {
                    $("#ModelAlert").one("hidden.bs.modal", function () { window.location.href = res.redirectUrl; });
                    showAlert("Record Updated");
                } else {
                    showAlert((res && res.message) ? res.message : "Save failed");
                }
            },
            error: function (xhr) { showAlert("Save failed"); console.log(xhr.responseText); }
        });
    });

    $(document).on("click", "#btnClearAll", function () { window.location.href = JOFT_URL + "/summary"; });
    //#endregion
});
//#endregion

//#region ---------- LOAD (Edit / View) ----------
function SetDate(sel, val) {
    const el = document.querySelector(sel);
    if (!el || !val) return;
    const d = String(val).substring(0, 10);
    if (el._flatpickr) el._flatpickr.setDate(d, false, "Y-m-d"); else $(sel).val(d);
}

function LoadInvoice() {
    $.get(JOFT_URL + "/get", { JOFTIH_Number: window.JOFTIH_Number }, function (res) {
        if (!res || !res.header) return;
        BindHeader(res.header, res.items || []);
        BindItems(res.items || []);
        BindAddress(res.addresses || []);
        ApplyViewMode();
    });
}

function BindHeader(h, items) {
    $("#Header_JOFTIH_Number").val(h.JOFTIH_Number);
    $("#Header_JOFTIH_JournalNo").val(h.JOFTIH_JournalNo);
    SetDate("#Header_JOFTIH_JournalDate", h.JOFTIH_JournalDate);
    $("#Header_JOFTIH_VendorInvoiceNo").val(h.JOFTIH_VendorInvoiceNo);
    SetDate("#Header_JOFTIH_VendorInvoiceDate", h.JOFTIH_VendorInvoiceDate);

    $("#Header_JOFTIH_Category").val(h.JOFTIH_Category);
    PrevCategory = h.JOFTIH_Category;
    UpdateCategoryUI();

    $("#Header_JOFTIH_JW_Vendor_Number").val(h.JOFTIH_JW_Vendor_Number);
    $("#Header_JWV_JW_VendorName").val(h.JWV_JW_VendorName);
    $("#Header_JOFTIH_Currency_Number").val(h.JOFTIH_Currency_Number);

    $("#Header_JOFTIH_PaymentTerms").val(h.JOFTIH_PaymentTerms);
    $("#Header_JOFTIH_PaymentMethod").val(h.JOFTIH_PaymentMethod);
    $("#Header_JOFTIH_Remarks").val(h.JOFTIH_Remarks);

    // Tax Cluster list for this vendor, select saved one
    LoadTaxClusterList(h.JOFTIH_JW_Vendor_Number, h.JOFTIH_TCT_Number);

    // WHT : saved WHT code > 0  =>  vendor WHT applies
    const whtNo = parseInt(h.JOFTIH_WHT_Number) || 0;
    $("#Header_JWV_WithholdTax").val(whtNo > 0 ? "1" : "0");
    $("#Header_JOFTIH_WHT_Number").val(whtNo).prop("disabled", whtNo <= 0);

    let pct = 0;
    items.forEach(function (i) { if (!pct) pct = parseFloat(i.JOFTII_WHT_Percent) || 0; });
    $("#Header_WHT_Percent").val(pct);
    $(".col-wht").toggle(whtNo > 0);
    if (whtNo > 0 && !pct) LoadWhtPercent();

    // RCM
    $("#Header_JOFTIH_RCM").prop("checked", h.JOFTIH_RCM === "Yes");
    $(".col-rcm").toggle(h.JOFTIH_RCM === "Yes");

    AutoFit();
}

function BindItems(items) {
    $("#TableBody").empty();
    $.each(items, function (i, it) { $("#TableBody").append(BuildRow(RowFromSaved(it))); });
    CalculateTotals();
}

function BindAddress(list) {
    $("#AddTableBody tr.AddNewRow").remove();
    addressIndex = 0;
    const vendorNo = $("#Header_JOFTIH_JW_Vendor_Number").val();

    list.forEach(function (a) {
        const row = addAddressRow();
        row.find(".JOFTIA_ADTP_Number").val(a.JOFTIA_ADTP_Number);

        const saved = {
            JWV_ADD_Address_ID: a.JOFTIA_Address_ID, JWV_ADD_Address: a.JOFTIA_Address, JWV_ADD_City: a.JOFTIA_City,
            JWV_ADD_State: a.JOFTIA_State, JWV_ADD_Country: a.JOFTIA_Country, JWV_ADD_PIN: a.JOFTIA_PIN,
            JWV_ADD_GSTIN: a.JOFTIA_GSTIN, JWV_ADD_ADTP_Number: a.JOFTIA_ADTP_Number, JWV_ADD_Default: 0
        };

        // dropdown options from master; saved values shown as stored on the invoice
        $.get(JOFT_URL + "/vendor-address", { VendorNumber: vendorNo, ADTPNumber: a.JOFTIA_ADTP_Number }, function (master) {
            const listM = (master || []).slice();
            if (!listM.some(function (x) { return x.JWV_ADD_Address_ID == saved.JWV_ADD_Address_ID; })) listM.push(saved);
            FillAddressIdDropdown(row, listM, saved.JWV_ADD_Address_ID);
            FillAddressFields(row, saved);
            ApplyViewMode();
        });
    });
}
//#endregion

//#region ---------- VIEW MODE (read-only, same page) ----------
function ApplyViewMode() {
    if (!window.IsViewMode) return;

    $("#JOFTForm").find("input, select, textarea")
        .not(".CheckItem, #IndexAllCheckItem")
        .prop("disabled", true);

    $("#btnSave, #LoadSource, #RemoveItemRowButton, #AddressAddButton, .AddressRowRemove, #btnClearAll").hide();

    if (!$("#ViewModeStyle").length) {
        $("<style id='ViewModeStyle'>input:disabled, select:disabled, textarea:disabled { color:#212529 !important; opacity:1 !important; }</style>").appendTo("head");
    }
    if (!$("#ViewOnlyBadge").length) {
        $(".panel-header .h6 a.float-end").first()
            .before('<span id="ViewOnlyBadge" class="badge bg-warning text-dark ms-2">VIEW ONLY</span>');
    }
}

$(function () {
    if (!window.IsViewMode) return;
    let t = null;
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(ApplyViewMode, 50); })
        .observe(document.body, { childList: true, subtree: true });
});
//#endregion
