$(document).ready(function () {

    // Default date range: month start to today
    var today = new Date();
    var monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    $("#FromDate").val(formatDateInput(monthStart));
    $("#ToDate").val(formatDateInput(today));

    LoadFilterOptions();
    LoadJWInvoicePendingQty();

    $("#btnGet").on("click", function () {
        LoadJWInvoicePendingQty();
    });

    $("#btnClear").on("click", function () {
        $("#FromDate").val(formatDateInput(monthStart));
        $("#ToDate").val(formatDateInput(today));
        $("#DN_No").val("");
        $("#JW_SO_No").val("");
        $("#JW_Customer_Number").val("");
        $("#PRS_Number").val("");
        $("#ItemGroup_Number").val("");
        $("#Item_Number").val("");
        LoadJWInvoicePendingQty();
    });
});

function formatDateInput(d) {
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
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

function removeCommas(value) {
    return (value || "").toString().replace(/,/g, "");
}

function addCommaQty(value) {
    if (value === "" || isNaN(value)) return "0";
    var parts = parseFloat(value).toFixed(0).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function LoadFilterOptions() {

    $.ajax({
        url: "/jobworkinvoice/reports/pending-qty/get",
        type: "GET",
        data: {},
        dataType: "json",
        success: function (data) {
            PopulateFilterDropdown("DN_No", data, "jidnH_DN_No", "jidnH_DN_No");
            PopulateFilterDropdown("JW_SO_No", data, "jwSONo", "jwSONo");
            PopulateFilterDropdown("JW_Customer_Number", data, "jidnH_JW_Customer_Number", "jwCustomerName");
            PopulateFilterDropdown("PRS_Number", data, "jidnI_PRS_Number", "prsProcessName");
            PopulateFilterDropdown("ItemGroup_Number", data, "itemGroupNumber", "itemGroupName");
            PopulateFilterDropdown("Item_Number", data, "itemNumber", "itemCode");
        },
        error: function (xhr) {
            console.error("Failed to load filter options", xhr);
        }
    });
}

function LoadJWInvoicePendingQty() {

    var payload = {
        FromDate: $("#FromDate").val() || null,
        ToDate: $("#ToDate").val() || null,
        DN_No: $("#DN_No").val() || null,
        JW_SO_No: $("#JW_SO_No").val() || null,
        JW_Customer_Number: $("#JW_Customer_Number").val() || null,
        PRS_Number: $("#PRS_Number").val() || null,
        ItemGroup_Number: $("#ItemGroup_Number").val() || null,
        Item_Number: $("#Item_Number").val() || null
    };

    $.ajax({
        url: "/jobworkinvoice/reports/pending-qty/get",
        type: "GET",
        data: payload,
        dataType: "json",
        success: function (data) {
            RenderJWInvoicePendingQtyGrid(data);
        },
        error: function (xhr) {
            console.error("Failed to load JW Invoice Pending Qty", xhr);
        }
    });
}

function RenderJWInvoicePendingQtyGrid(rows) {

    var tbody = $("#PendingQtyTableBody");
    tbody.empty();

    var totalDelivered = 0;
    var totalInvoiced = 0;
    var totalPending = 0;

    if (!rows || rows.length === 0) {
        tbody.append('<tr><td colspan="17" class="text-center">No pending records found</td></tr>');
    } else {
        $.each(rows, function (i, r) {

            totalDelivered += parseFloat(r.deliveredQty) || 0;
            totalInvoiced += parseFloat(r.invoicedQty) || 0;
            totalPending += parseFloat(r.pendingQty) || 0;

            var row = $("<tr></tr>");

            row.append("<td>" + (r.jidnhDNNo || r.jidnH_DN_No || "") + "</td>");
            row.append("<td>" + (r.jidnhDNDate || r.jidnH_DN_Date || "") + "</td>");
            row.append("<td>" + (r.jwSONo || "") + "</td>");
            row.append("<td>" + (r.jwSODate || "") + "</td>");
            row.append("<td>" + (r.jwCustomerName || "") + "</td>");
            row.append("<td>" + (r.prsProcessName || "") + "</td>");
            row.append("<td>" + (r.itemGroupName || "") + "</td>");
            row.append("<td>" + (r.itemCode || "") + "</td>");
            row.append("<td>" + (r.itemDescription || "") + "</td>");
            row.append("<td class='text-center'>" + (r.outerDia || "") + "</td>");
            row.append("<td class='text-center'>" + (r.thickness || "") + "</td>");
            row.append("<td class='text-center'>" + (r.length || "") + "</td>");
            row.append("<td class='text-center'>" + (r.materialGrade || "") + "</td>");
            row.append("<td class='text-center'>" + (r.uom || "") + "</td>");
            row.append("<td class='text-center'>" + addCommaQty(r.deliveredQty) + "</td>");
            row.append("<td class='text-center'>" + addCommaQty(r.invoicedQty) + "</td>");
            row.append("<td class='text-center fw-bold text-danger'>" + addCommaQty(r.pendingQty) + "</td>");

            tbody.append(row);
        });
    }

    $("#TotalDeliveredQty").text(addCommaQty(totalDelivered));
    $("#TotalInvoicedQty").text(addCommaQty(totalInvoiced));
    $("#TotalPendingQty").text(addCommaQty(totalPending));
}