$(document).ready(function () {

    // Default date range: month start to today
    var today = new Date();
    var monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    $("#FromDate").val(formatDateInput(monthStart));
    $("#ToDate").val(formatDateInput(today));

    LoadFilterOptions();
    LoadJORNFreightInvoicePendingQty();

    $("#btnGet").on("click", function () {
        LoadJORNFreightInvoicePendingQty();
    });

    $("#btnClear").on("click", function () {
        $("#FromDate").val(formatDateInput(monthStart));
        $("#ToDate").val(formatDateInput(today));
        $("#RN_No").val("");
        $("#VendorDN_No").val("");
        $("#Freight_SO_No").val("");
        $("#JW_Vendor_Number").val("");
        LoadJORNFreightInvoicePendingQty();
    });
});

function formatDateInput(d) {
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
}

function addCommaQty(value) {
    if (value === "" || isNaN(value)) return "0";
    var parts = parseFloat(value).toFixed(0).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function PopulateFilterDropdown(selectId, rows, valueField, textField) {
    var select = $("#" + selectId);
    var currentVal = select.val();
    var seen = {};
    var options = [];

    $.each(rows, function (i, r) {
        var val = r[valueField];
        var text = r[textField];
        if (val === undefined || val === null || val === "" || text === undefined || text === null || text === "") return;
        if (seen[val]) return;
        seen[val] = true;
        options.push({ value: val, text: text });
    });

    options.sort(function (a, b) {
        return a.text.toString().localeCompare(b.text.toString());
    });

    select.empty().append($("<option>").val("").text("All"));
    $.each(options, function (i, o) {
        select.append($("<option>").val(o.value).text(o.text));
    });

    if (currentVal) select.val(currentVal);
}

// Filter options are loaded ONCE (no filters) so the lists stay fixed
function LoadFilterOptions() {

    $.ajax({
        url: "/jo/reports/rn-freight-pending-qty/get",
        type: "GET",
        data: {},
        dataType: "json",
        success: function (data) {
            PopulateFilterDropdown("RN_No", data, "rnNo", "rnNo");
            PopulateFilterDropdown("VendorDN_No", data, "vendorDCNo", "vendorDCNo");
            PopulateFilterDropdown("Freight_SO_No", data, "freightSONo", "freightSONo");
            PopulateFilterDropdown("JW_Vendor_Number", data, "jwVendorNumber", "jwVendorName");
        },
        error: function (xhr) {
            console.error("Failed to load filter options", xhr);
        }
    });
}

function LoadJORNFreightInvoicePendingQty() {

    var payload = {
        FromDate: $("#FromDate").val() || null,
        ToDate: $("#ToDate").val() || null,
        RN_No: $("#RN_No").val() || null,
        VendorDN_No: $("#VendorDN_No").val() || null,
        Freight_SO_No: $("#Freight_SO_No").val() || null,
        JW_Vendor_Number: $("#JW_Vendor_Number").val() || null
    };

    $.ajax({
        url: "/jo/reports/rn-freight-pending-qty/get",
        type: "GET",
        data: payload,
        dataType: "json",
        success: function (data) {
            RenderJORNFreightInvoicePendingQtyGrid(data);
        },
        error: function (xhr) {
            console.error("Failed to load JO RN Freight Invoice Pending Qty", xhr);
        }
    });
}

function RenderJORNFreightInvoicePendingQtyGrid(rows) {

    var tbody = $("#PendingQtyTableBody");
    tbody.empty();

    var totalReceived = 0;
    var totalInvoiced = 0;
    var totalPending = 0;

    if (!rows || rows.length === 0) {
        tbody.append('<tr><td colspan="12" class="text-center">No pending records found</td></tr>');
    } else {
        $.each(rows, function (i, r) {

            totalReceived += parseFloat(r.receivedQty) || 0;
            totalInvoiced += parseFloat(r.invoicedQty) || 0;
            totalPending += parseFloat(r.pendingQty) || 0;

            var row = $("<tr></tr>");

            row.append($("<td>").text(r.rnNo || ""));
            row.append($("<td>").text(r.rnDate || ""));
            row.append($("<td>").text(r.vendorDCNo || ""));
            row.append($("<td>").text(r.vendorDCDate || ""));
            row.append($("<td>").text(r.freightSONo || ""));
            row.append($("<td>").text(r.freightSODate || ""));
            row.append($("<td>").text(r.jwVendorName || ""));
            row.append($("<td class='text-center'>").text(r.fromWH || ""));
            row.append($("<td class='text-center'>").text(r.toWH || ""));
            row.append($("<td class='text-center'>").text(addCommaQty(r.receivedQty)));
            row.append($("<td class='text-center'>").text(addCommaQty(r.invoicedQty)));
            row.append($("<td class='text-center fw-bold text-danger'>").text(addCommaQty(r.pendingQty)));

            tbody.append(row);
        });
    }

    $("#TotalReceivedQty").text(addCommaQty(totalReceived));
    $("#TotalInvoicedQty").text(addCommaQty(totalInvoiced));
    $("#TotalPendingQty").text(addCommaQty(totalPending));
}