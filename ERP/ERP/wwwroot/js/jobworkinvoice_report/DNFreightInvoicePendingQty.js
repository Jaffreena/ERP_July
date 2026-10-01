$(document).ready(function () {

    var today = new Date();
    var monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    $("#FromDate").val(formatDateInput(monthStart));
    $("#ToDate").val(formatDateInput(today));

    LoadFilterOptions();
    LoadDNFreightInvoicePendingQty();

    $("#btnGet").on("click", function () {
        LoadDNFreightInvoicePendingQty();
    });

    $("#btnClear").on("click", function () {
        $("#FromDate").val(formatDateInput(monthStart));
        $("#ToDate").val(formatDateInput(today));
        $("#DN_No").val("");
        $("#Freight_SO_No").val("");
        $("#JW_Customer_Number").val("");
        LoadDNFreightInvoicePendingQty();
    });
});

function formatDateInput(d) {
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
}

function removeCommas(value) {
    return (value || "").toString().replace(/,/g, "");
}

function addCommaQty(value) {
    if (value === "" || isNaN(value)) return "0";
    var parts = parseFloat(value).toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function PopulateFilterDropdown(selectId, rows, valueField, textField) {
    var select = $("#" + selectId);
    var currentVal = select.val();
    var seen = {};
    var options = '<option value="">All</option>';

    $.each(rows, function (i, r) {
        var val = r[valueField];
        var text = r[textField];
        if (val === undefined || val === null || val === "" || text === undefined || text === null || text === "") return;
        if (seen[val]) return;
        seen[val] = true;
        options += '<option value="' + val + '">' + text + '</option>';
    });

    select.html(options);
    if (currentVal) select.val(currentVal);
}

function LoadFilterOptions() {

    $.ajax({
        url: "/jobworkinvoice/reports/dn-freight-pending-qty/get",
        type: "GET",
        data: {},
        dataType: "json",
        success: function (data) {
            PopulateFilterDropdown("DN_No", data, "dnNo", "dnNo");
            PopulateFilterDropdown("Freight_SO_No", data, "freightSONo", "freightSONo");
            PopulateFilterDropdown("JW_Customer_Number", data, "customerNumber", "jwCustomerName");
        },
        error: function (xhr) {
            console.error("Failed to load filter options", xhr);
        }
    });
}

function LoadDNFreightInvoicePendingQty() {

    var payload = {
        FromDate: $("#FromDate").val() || null,
        ToDate: $("#ToDate").val() || null,
        DN_No: $("#DN_No").val() || null,
        Freight_SO_No: $("#Freight_SO_No").val() || null,
        JW_Customer_Number: $("#JW_Customer_Number").val() || null
    };

    $.ajax({
        url: "/jobworkinvoice/reports/dn-freight-pending-qty/get",
        type: "GET",
        data: payload,
        dataType: "json",
        success: function (data) {
            RenderDNFreightInvoicePendingQtyGrid(data);
        },
        error: function (xhr) {
            console.error("Failed to load DN Freight Invoice Pending Qty", xhr);
        }
    });
}

function RenderDNFreightInvoicePendingQtyGrid(rows) {

    var tbody = $("#PendingQtyTableBody");
    tbody.empty();

    var totalDelivered = 0;
    var totalInvoiced = 0;
    var totalPending = 0;

    if (!rows || rows.length === 0) {
        tbody.append('<tr><td colspan="9" class="text-center">No pending records found</td></tr>');
    } else {
        $.each(rows, function (i, r) {

            totalDelivered += parseFloat(r.deliveredQty) || 0;
            totalInvoiced += parseFloat(r.invoicedQty) || 0;
            totalPending += parseFloat(r.pendingQty) || 0;

            var row = $("<tr></tr>");

            row.append("<td>" + (r.dnNo || "") + "</td>");
            row.append("<td>" + (r.dnDate || "") + "</td>");
            row.append("<td>" + (r.freightSONo || "") + "</td>");
            row.append("<td>" + (r.freightSODate || "") + "</td>");
            row.append("<td>" + (r.jwCustomerName || "") + "</td>");
            row.append("<td>" + (r.fromWH || "") + "</td>");
            row.append("<td>" + (r.toWH || "") + "</td>");
            row.append("<td class='text-end'>" + addCommaQty(r.deliveredQty) + "</td>");
            row.append("<td class='text-end'>" + addCommaQty(r.invoicedQty) + "</td>");
            row.append("<td class='text-end fw-bold text-danger'>" + addCommaQty(r.pendingQty) + "</td>");

            tbody.append(row);
        });
    }

    $("#TotalDeliveredQty").text(addCommaQty(totalDelivered));
    $("#TotalInvoicedQty").text(addCommaQty(totalInvoiced));
    $("#TotalPendingQty").text(addCommaQty(totalPending));
}