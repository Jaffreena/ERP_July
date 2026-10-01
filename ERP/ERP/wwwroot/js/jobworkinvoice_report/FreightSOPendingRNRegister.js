function PopulateFilterDropdown(selector, rows, valueField, textField) {
    var seen = {};
    var $sel = $(selector);
    $sel.find("option:not(:first)").remove();
    rows.forEach(function (r) {
        var val = r[valueField];
        var text = r[textField];
        if (val && !seen[val]) {
            seen[val] = true;
            $sel.append($("<option>", { value: val, text: text }));
        }
    });
}

function LoadFilterOptions() {
    $.get("/jobworkinvoice/reports/freight-so-pending-rn-register/get", {}, function (rows) {
        PopulateFilterDropdown("#SO_No", rows, "svoNo", "svoNo");
        PopulateFilterDropdown("#JW_Customer_Number", rows, "customerNumber", "jwCustomerName");
        PopulateFilterDropdown("#PRS_Number", rows, "processNumber", "processName");
        PopulateFilterDropdown("#FromWH_Number", rows, "fromWHNumber", "fromWH");
        PopulateFilterDropdown("#ToWH_Number", rows, "toWHNumber", "toWH");
    });
}

function addCommaQty(v) {
    v = parseFloat(v) || 0;
    return v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function LoadFreightSOPendingRNRegister() {
    var data = {
        FromDate: $("#FromDate").val(),
        ToDate: $("#ToDate").val(),
        SO_No: $("#SO_No").val(),
        JW_Customer_Number: $("#JW_Customer_Number").val(),
        PRS_Number: $("#PRS_Number").val(),
        FromWH_Number: $("#FromWH_Number").val(),
        ToWH_Number: $("#ToWH_Number").val()
    };

    $.get("/jobworkinvoice/reports/freight-so-pending-rn-register/get", data, function (rows) {
        RenderFreightSOPendingRNRegisterGrid(rows);
    });
}

function RenderFreightSOPendingRNRegisterGrid(rows) {
    var $body = $("#PendingQtyTableBody");
    $body.empty();

    var totalOrdered = 0, totalRN = 0, totalDirect = 0, totalPending = 0;

    rows.forEach(function (r) {
        totalOrdered += r.orderedQty || 0;
        totalRN += r.rnAssignedQty || 0;
        totalDirect += r.directlyInvoicedQty || 0;
        totalPending += r.pendingQty || 0;

        $body.append(
            "<tr>" +
            "<td>" + (r.regNo || "") + "</td>" +
            "<td>" + (r.regDate || "") + "</td>" +
            "<td>" + (r.svoNo || "") + "</td>" +
            "<td>" + (r.svoDate || "") + "</td>" +
            "<td>" + (r.jwCustomerName || "") + "</td>" +
            "<td>" + (r.processName || "") + "</td>" +
            "<td>" + (r.fromWH || "") + "</td>" +
            "<td>" + (r.toWH || "") + "</td>" +
            "<td>" + (r.uom || "") + "</td>" +
            "<td class='text-end'>" + addCommaQty(r.orderedQty) + "</td>" +
            "<td class='text-end'>" + addCommaQty(r.rnAssignedQty) + "</td>" +
            "<td class='text-end'>" + addCommaQty(r.directlyInvoicedQty) + "</td>" +
            "<td class='text-end'>" + addCommaQty(r.pendingQty) + "</td>" +
            "</tr>"
        );
    });

    $("#TotalOrderedQty").text(addCommaQty(totalOrdered));
    $("#TotalRNAssignedQty").text(addCommaQty(totalRN));
    $("#TotalDirectlyInvoicedQty").text(addCommaQty(totalDirect));
    $("#TotalPendingQty").text(addCommaQty(totalPending));
}

$(document).ready(function () {
    LoadFilterOptions();
    LoadFreightSOPendingRNRegister();

    $("#btnGet").on("click", function () { LoadFreightSOPendingRNRegister(); });
    $("#btnClear").on("click", function () {
        $("#FromDate, #ToDate").val("");
        $("#SO_No, #JW_Customer_Number, #PRS_Number, #FromWH_Number, #ToWH_Number").val("");
        LoadFreightSOPendingRNRegister();
    });
});