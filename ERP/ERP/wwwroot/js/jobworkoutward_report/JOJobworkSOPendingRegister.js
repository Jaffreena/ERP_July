$(document).ready(function () {

    LoadFilterOptions();
    LoadJOJobworkSOPendingRegister();

    $("#btnGet").on("click", function () {
        LoadJOJobworkSOPendingRegister();
    });

    $("#btnClear").on("click", function () {
        $("#FromDate, #ToDate").val("");
        $("#SO_No, #JW_Vendor_Number, #JPRS_Number, #ItemGroup_Number, #Item_Number").val("");
        LoadJOJobworkSOPendingRegister();
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
        url: "/jo/reports/jobwork-so-pending-register/get",
        type: "GET",
        data: {},
        dataType: "json",
        success: function (data) {
            PopulateFilterDropdown("SO_No", data, "svoNo", "svoNo");
            PopulateFilterDropdown("JW_Vendor_Number", data, "jwVendorNumber", "jwVendorName");
            PopulateFilterDropdown("JPRS_Number", data, "processNumber", "processName");
            PopulateFilterDropdown("ItemGroup_Number", data, "itemGroupNumber", "itemGroupName");
            PopulateFilterDropdown("Item_Number", data, "itemNumber", "itemCode");
        },
        error: function (xhr) {
            console.error("Failed to load filter options", xhr);
        }
    });
}

function LoadJOJobworkSOPendingRegister() {

    var payload = {
        FromDate: $("#FromDate").val() || null,
        ToDate: $("#ToDate").val() || null,
        SO_No: $("#SO_No").val() || null,
        JW_Vendor_Number: $("#JW_Vendor_Number").val() || null,
        JPRS_Number: $("#JPRS_Number").val() || null,
        ItemGroup_Number: $("#ItemGroup_Number").val() || null,
        Item_Number: $("#Item_Number").val() || null
    };

    $.ajax({
        url: "/jo/reports/jobwork-so-pending-register/get",
        type: "GET",
        data: payload,
        dataType: "json",
        success: function (data) {
            RenderJOJobworkSOPendingRegisterGrid(data);
        },
        error: function (xhr) {
            console.error("Failed to load JO Jobwork SO Pending Register", xhr);
        }
    });
}

function RenderJOJobworkSOPendingRegisterGrid(rows) {

    var tbody = $("#PendingQtyTableBody");
    tbody.empty();

    var totalOrdered = 0;
    var totalRN = 0;
    var totalDirect = 0;
    var totalPending = 0;

    if (!rows || rows.length === 0) {
        tbody.append('<tr><td colspan="16" class="text-center">No pending records found</td></tr>');
    } else {
        $.each(rows, function (i, r) {

            totalOrdered += parseFloat(r.orderedQty) || 0;
            totalRN += parseFloat(r.rnAssignedQty) || 0;
            totalDirect += parseFloat(r.directlyInvoicedQty) || 0;
            totalPending += parseFloat(r.pendingQty) || 0;

            var row = $("<tr></tr>");

            row.append($("<td>").text(r.svoNo || ""));
            row.append($("<td>").text(r.svoDate || ""));
            row.append($("<td>").text(r.jwVendorName || ""));
            row.append($("<td>").text(r.processName || ""));
            row.append($("<td>").text(r.itemGroupName || ""));
            row.append($("<td>").text(r.itemCode || ""));
            row.append($("<td>").text(r.itemDescription || ""));
            row.append($("<td class='text-center'>").text(r.outerDia || ""));
            row.append($("<td class='text-center'>").text(r.thickness || ""));
            row.append($("<td class='text-center'>").text(r.length || ""));
            row.append($("<td class='text-center'>").text(r.materialGrade || ""));
            row.append($("<td class='text-center'>").text(r.uom || ""));
            row.append($("<td class='text-center'>").text(addCommaQty(r.orderedQty)));
            row.append($("<td class='text-center'>").text(addCommaQty(r.rnAssignedQty)));
            row.append($("<td class='text-center'>").text(addCommaQty(r.directlyInvoicedQty)));
            row.append($("<td class='text-center fw-bold text-danger'>").text(addCommaQty(r.pendingQty)));

            tbody.append(row);
        });
    }

    $("#TotalOrderedQty").text(addCommaQty(totalOrdered));
    $("#TotalRNAssignedQty").text(addCommaQty(totalRN));
    $("#TotalDirectlyInvoicedQty").text(addCommaQty(totalDirect));
    $("#TotalPendingQty").text(addCommaQty(totalPending));
}