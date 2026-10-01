function formatDateInput(d) {
    if (!d) return "";
    var dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    var dd = ("0" + dt.getDate()).slice(-2);
    var mm = ("0" + (dt.getMonth() + 1)).slice(-2);
    return dd + "-" + mm + "-" + dt.getFullYear();
}

function addCommaQty(v) {
    if (v === null || v === undefined || v === "") return "";
    return Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function PopulateFilterDropdown(selectId, rows, valueField, textField) {
    var $sel = $("#" + selectId);
    var currentVal = $sel.val();
    var seen = {};
    var options = [];

    rows.forEach(function (r) {
        var val = r[valueField];
        var text = r[textField];
        if (val === null || val === undefined || val === "" ||
            text === null || text === undefined || text === "") {
            return;
        }
        var key = val.toString();
        if (!seen[key]) {
            seen[key] = true;
            options.push({ value: key, text: text });
        }
    });

    options.sort(function (a, b) {
        return a.text.toString().localeCompare(b.text.toString());
    });

    $sel.find("option:not(:first)").remove();
    options.forEach(function (o) {
        $sel.append($("<option>").val(o.value).text(o.text));
    });

    if (currentVal) {
        $sel.val(currentVal);
    }
}

function LoadFilterOptions() {
    $.ajax({
        url: "/jobworkinvoice/reports/rn-freight-pending-qty/get",
        type: "GET",
        success: function (rows) {
            PopulateFilterDropdown("RN_No", rows, "rnNumber", "rnNo");
            PopulateFilterDropdown("JWC_DN_No", rows, "jwcdnNo", "jwcdnNo");
            PopulateFilterDropdown("Freight_SO_No", rows, "freightSONumber", "freightSONo");
            PopulateFilterDropdown("JW_Customer_Number", rows, "customerNumber", "jwCustomerName");
        }
    });
}

function LoadRNFreightInvoicePendingQty() {
    var data = {
        FromDate: $("#FromDate").val(),
        ToDate: $("#ToDate").val(),
        RN_No: $("#RN_No").val(),
        JWC_DN_No: $("#JWC_DN_No").val(),
        Freight_SO_No: $("#Freight_SO_No").val(),
        JW_Customer_Number: $("#JW_Customer_Number").val()
    };

    $.ajax({
        url: "/jobworkinvoice/reports/rn-freight-pending-qty/get",
        type: "GET",
        data: data,
        success: function (rows) {
            RenderRNFreightInvoicePendingQtyGrid(rows);
        }
    });
}

function RenderRNFreightInvoicePendingQtyGrid(rows) {
    var $tbody = $("#PendingQtyTableBody");
    $tbody.empty();

    var totalReceived = 0, totalInvoiced = 0, totalPending = 0;

    rows.forEach(function (r) {
        totalReceived += Number(r.receivedQty) || 0;
        totalInvoiced += Number(r.invoicedQty) || 0;
        totalPending += Number(r.pendingQty) || 0;

        var tr = $("<tr>");
        tr.append($("<td>").text(r.rnNo));
        tr.append($("<td>").text(formatDateInput(r.rnDate)));
        tr.append($("<td>").text(r.jwcdnNo));
        tr.append($("<td>").text(formatDateInput(r.jwcdnDate)));
        tr.append($("<td>").text(r.freightSONo));
        tr.append($("<td>").text(formatDateInput(r.freightSODate)));
        tr.append($("<td>").text(r.jwCustomerName));
        tr.append($("<td>").text(r.fromWH));
        tr.append($("<td>").text(r.toWH));
        tr.append($("<td class='qty'>").text(addCommaQty(r.receivedQty)));
        tr.append($("<td class='qty'>").text(addCommaQty(r.invoicedQty)));
        tr.append($("<td class='qty'>").text(addCommaQty(r.pendingQty)));

        $tbody.append(tr);
    });

    $("#TotalReceivedQty").text(addCommaQty(totalReceived));
    $("#TotalInvoicedQty").text(addCommaQty(totalInvoiced));
    $("#TotalPendingQty").text(addCommaQty(totalPending));
}

$(document).ready(function () {
    LoadFilterOptions();
    LoadRNFreightInvoicePendingQty();

    $("#btnGet").on("click", function () {
        LoadRNFreightInvoicePendingQty();
    });

    $("#btnClear").on("click", function () {
        $("#FromDate, #ToDate").val("");
        $("#RN_No, #JWC_DN_No, #Freight_SO_No, #JW_Customer_Number").val("");
        LoadRNFreightInvoicePendingQty();
    });
});