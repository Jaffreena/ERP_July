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
        url: "/jobworkinvoice/reports/jobwork-so-pending-register/get",
        type: "GET",
        success: function (rows) {
            PopulateFilterDropdown("SO_No", rows, "svoNumber", "svoNo");
            PopulateFilterDropdown("JW_Customer_Number", rows, "customerNumber", "jwCustomerName");
            PopulateFilterDropdown("PRS_Number", rows, "processNumber", "processName");
            PopulateFilterDropdown("ItemGroup_Number", rows, "itemGroupNumber", "itemGroupName");
            PopulateFilterDropdown("Item_Number", rows, "itemNumber", "itemCode");
        }
    });
}

function LoadJobworkSOPendingRegister() {
    var data = {
        FromDate: $("#FromDate").val(),
        ToDate: $("#ToDate").val(),
        SO_No: $("#SO_No").val(),
        JW_Customer_Number: $("#JW_Customer_Number").val(),
        PRS_Number: $("#PRS_Number").val(),
        ItemGroup_Number: $("#ItemGroup_Number").val(),
        Item_Number: $("#Item_Number").val()
    };

    $.ajax({
        url: "/jobworkinvoice/reports/jobwork-so-pending-register/get",
        type: "GET",
        data: data,
        success: function (rows) {
            RenderJobworkSOPendingRegisterGrid(rows);
        }
    });
}

function RenderJobworkSOPendingRegisterGrid(rows) {
    var $tbody = $("#PendingQtyTableBody");
    $tbody.empty();

    var totalOrdered = 0, totalDNAssigned = 0, totalDirectlyInvoiced = 0, totalPending = 0;

    rows.forEach(function (r) {
        totalOrdered += Number(r.orderedQty) || 0;
        totalDNAssigned += Number(r.dnAssignedQty) || 0;
        totalDirectlyInvoiced += Number(r.directlyInvoicedQty) || 0;
        totalPending += Number(r.pendingQty) || 0;

        var tr = $("<tr>");
        tr.append($("<td>").text(r.regNo));
        tr.append($("<td>").text(formatDateInput(r.regDate)));
        tr.append($("<td>").text(r.svoNo));
        tr.append($("<td>").text(formatDateInput(r.svoDate)));
        tr.append($("<td>").text(r.jwCustomerName));
        tr.append($("<td>").text(r.processName));
        tr.append($("<td>").text(r.itemGroupName));
        tr.append($("<td>").text(r.itemCode));
        tr.append($("<td>").text(r.itemDescription));
        tr.append($("<td>").text(r.outerDia));
        tr.append($("<td>").text(r.thickness));
        tr.append($("<td>").text(r.length));
        tr.append($("<td>").text(r.materialGrade));
        tr.append($("<td>").text(r.uom));
        tr.append($("<td class='qty'>").text(addCommaQty(r.orderedQty)));
        tr.append($("<td class='qty'>").text(addCommaQty(r.dnAssignedQty)));
        tr.append($("<td class='qty'>").text(addCommaQty(r.directlyInvoicedQty)));
        tr.append($("<td class='qty'>").text(addCommaQty(r.pendingQty)));

        $tbody.append(tr);
    });

    $("#TotalOrderedQty").text(addCommaQty(totalOrdered));
    $("#TotalDNAssignedQty").text(addCommaQty(totalDNAssigned));
    $("#TotalDirectlyInvoicedQty").text(addCommaQty(totalDirectlyInvoiced));
    $("#TotalPendingQty").text(addCommaQty(totalPending));
}

$(document).ready(function () {
    LoadFilterOptions();
    LoadJobworkSOPendingRegister();

    $("#btnGet").on("click", function () {
        LoadJobworkSOPendingRegister();
    });

    $("#btnClear").on("click", function () {
        $("#FromDate, #ToDate").val("");
        $("#SO_No, #JW_Customer_Number, #PRS_Number, #ItemGroup_Number, #Item_Number").val("");
        LoadJobworkSOPendingRegister();
    });
});