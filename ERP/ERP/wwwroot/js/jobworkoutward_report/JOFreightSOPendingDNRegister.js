$(document).ready(function () {

    LoadFilterOptions();
    LoadJOFreightSOPendingDNRegister();

    $("#btnGet").on("click", function () {
        LoadJOFreightSOPendingDNRegister();
    });

    $("#btnClear").on("click", function () {
        $("#FromDate, #ToDate").val("");
        $("#SO_No, #JW_Vendor_Number, #JPRS_Number, #FromWH_Number, #ToWH_Number").val("");
        LoadJOFreightSOPendingDNRegister();
    });
});

function addCommaQty(value) {
    if (value === "" || value === null || value === undefined || isNaN(value)) return "0";
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
        if (val === undefined || val === null || val === "" || val === 0 || text === undefined || text === null || text === "") return;
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
        url: "/jo/reports/freight-so-pending-dn-register/get",
        type: "GET",
        data: {},
        dataType: "json",
        success: function (data) {
            PopulateFilterDropdown("SO_No", data, "svoNo", "svoNo");
            PopulateFilterDropdown("JW_Vendor_Number", data, "jwVendorNumber", "jwVendorName");
            PopulateFilterDropdown("JPRS_Number", data, "processNumber", "processName");
            PopulateFilterDropdown("FromWH_Number", data, "fromWHNumber", "fromWH");
            PopulateFilterDropdown("ToWH_Number", data, "toWHNumber", "toWH");
        },
        error: function (xhr) {
            console.error("Failed to load filter options", xhr);
        }
    });
}

function LoadJOFreightSOPendingDNRegister() {

    var payload = {
        FromDate: $("#FromDate").val() || null,
        ToDate: $("#ToDate").val() || null,
        SO_No: $("#SO_No").val() || null,
        JW_Vendor_Number: $("#JW_Vendor_Number").val() || null,
        JPRS_Number: $("#JPRS_Number").val() || null,
        FromWH_Number: $("#FromWH_Number").val() || null,
        ToWH_Number: $("#ToWH_Number").val() || null
    };

    $.ajax({
        url: "/jo/reports/freight-so-pending-dn-register/get",
        type: "GET",
        data: payload,
        dataType: "json",
        success: function (data) {
            RenderJOFreightSOPendingDNRegisterGrid(data);
        },
        error: function (xhr) {
            console.error("Failed to load JO Freight SO Pending (DN) Register", xhr);
        }
    });
}

function RenderJOFreightSOPendingDNRegisterGrid(rows) {

    var tbody = $("#PendingQtyTableBody");
    tbody.empty();

    var totalOrdered = 0;
    var totalDN = 0;
    var totalDirect = 0;
    var totalPending = 0;

    if (!rows || rows.length === 0) {
        tbody.append('<tr><td colspan="11" class="text-center">No pending records found</td></tr>');
    } else {
        $.each(rows, function (i, r) {

            totalOrdered += parseFloat(r.orderedQty) || 0;
            totalDN += parseFloat(r.dnAssignedQty) || 0;
            totalDirect += parseFloat(r.directlyInvoicedQty) || 0;
            totalPending += parseFloat(r.pendingQty) || 0;

            var row = $("<tr></tr>");

            row.append($("<td>").text(r.svoNo || ""));
            row.append($("<td>").text(r.svoDate || ""));
            row.append($("<td>").text(r.jwVendorName || ""));
            row.append($("<td>").text(r.processName || ""));
            row.append($("<td class='text-center'>").text(r.fromWH || ""));
            row.append($("<td class='text-center'>").text(r.toWH || ""));
            row.append($("<td class='text-center'>").text(r.uom || ""));
            row.append($("<td class='text-center'>").text(addCommaQty(r.orderedQty)));
            row.append($("<td class='text-center'>").text(addCommaQty(r.dnAssignedQty)));
            row.append($("<td class='text-center'>").text(addCommaQty(r.directlyInvoicedQty)));
            row.append($("<td class='text-center fw-bold text-danger'>").text(addCommaQty(r.pendingQty)));

            tbody.append(row);
        });
    }

    $("#TotalOrderedQty").text(addCommaQty(totalOrdered));
    $("#TotalDNAssignedQty").text(addCommaQty(totalDN));
    $("#TotalDirectlyInvoicedQty").text(addCommaQty(totalDirect));
    $("#TotalPendingQty").text(addCommaQty(totalPending));
}