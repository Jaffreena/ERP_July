function ToInputDate(d) {
    // local date as yyyy-MM-dd (toISOString would shift the date because of the UTC offset)
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
}

// zero / empty -> "-", otherwise Indian comma format
function FmtQty(v) {
    var n = Number(v) || 0;
    return n === 0 ? '-' : n.toLocaleString('en-IN');
}

function Esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

$(document).ready(function () {
    var today = new Date();
    var monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    $("#FromDate").val(ToInputDate(monthStart));   // RN Date from: 1st of this month
    $("#ToDate").val(ToInputDate(today));          // RN Date to: today

    $("#DCNo").val("");
    $("#CustomerNumber").val("");                  // All
    $("#ItemGroupNumber").val("");
    $("#ItemNumber").val("");
    $("#BatchNo").val("");

    LoadItemTracker();
});

$("#btnGet").on("click", function () {
    LoadItemTracker();
});

function LoadItemTracker() {
    $.ajax({
        url: "/ItemTrackerGeneral/GetItemTrackerGeneralData",
        type: "GET",
        data: {
            FromDate: $("#FromDate").val(),
            ToDate: $("#ToDate").val(),
            DCNo: $("#DCNo").val(),
            CustomerNumber: $("#CustomerNumber").val(),
            ItemGroupNumber: $("#ItemGroupNumber").val(),
            ItemNumber: $("#ItemNumber").val(),
            BatchNo: $("#BatchNo").val()
        },
        success: function (rows) {
            RenderTrackerRows(rows);
        }
    });
}

function RenderTrackerRows(rows) {
    var body = $("#MyTableBody");
    body.empty();

    var t = { batchQty: 0, received: 0, production: 0, inward: 0, consumption: 0, delivered: 0, outward: 0, closing: 0 };

    var batchFilter = ($("#BatchNo").val() || "").trim().toLowerCase();
    var lastHeader = null;      // DC group (RN header)
    var lastItem = null;        // last item shown inside this DC

    rows.forEach(function (r) {
        var newDC = (r.headerNo !== lastHeader);
        // Item details only when the item changes inside the DC (Excel style)
        var showItem = newDC || r.itemNumber !== lastItem;
        lastHeader = r.headerNo;
        lastItem = r.itemNumber;

        var hit = batchFilter !== "" && (r.batchNo || "").toLowerCase().indexOf(batchFilter) > -1;

        body.append(
            '<tr' + (hit ? ' class="table-warning"' : '') + '>' +
            // Delivery Note (DC) + Customer: first row of each DC only
            '<td>' + (newDC ? Esc(r.dcNo) : '') + '</td>' +
            '<td>' + (newDC ? Esc(r.dcDate) : '') + '</td>' +
            '<td>' + (newDC ? Esc(r.jwCustomerName) : '') + '</td>' +
            // Item details
            '<td>' + (showItem ? Esc(r.itemGroupName) : '') + '</td>' +
            '<td>' + (showItem ? Esc(r.itemNumber) : '') + '</td>' +
            '<td>' + (showItem ? Esc(r.description) : '') + '</td>' +
            '<td>' + (showItem ? Esc(r.outerDia) : '') + '</td>' +
            '<td>' + (showItem ? Esc(r.thickness) : '') + '</td>' +
            '<td>' + (showItem ? Esc(r.length) : '') + '</td>' +
            '<td>' + (showItem ? Esc(r.materialGrade) : '') + '</td>' +
            // Batch details
            '<td>' + Esc(r.warehouse) + '</td>' +
            '<td>' + Esc(r.batchDate) + '</td>' +
            '<td>' + Esc(r.batchNo) + '</td>' +
            '<td class="qty">' + FmtQty(r.batchQty) + '</td>' +
            // Inward
            '<td class="qty">' + FmtQty(r.received) + '</td>' +
            '<td class="qty">' + FmtQty(r.production) + '</td>' +
            '<td class="qty">' + FmtQty(r.inwardSum) + '</td>' +
            // Outward
            '<td class="qty">' + FmtQty(r.consumption) + '</td>' +
            '<td class="qty">' + FmtQty(r.delivered) + '</td>' +
            '<td class="qty">' + FmtQty(r.outwardSum) + '</td>' +
            // Closing
            '<td class="qty">' + FmtQty(r.closingQty) + '</td>' +
            '</tr>'
        );

        t.batchQty += r.batchQty;
        t.received += r.received;
        t.production += r.production;
        t.inward += r.inwardSum;
        t.consumption += r.consumption;
        t.delivered += r.delivered;
        t.outward += r.outwardSum;
        t.closing += r.closingQty;
    });

    $("#TotalBatchQty").text(FmtQty(t.batchQty));
    $("#TotalReceived").text(FmtQty(t.received));
    $("#TotalProduction").text(FmtQty(t.production));
    $("#TotalInward").text(FmtQty(t.inward));
    $("#TotalConsumption").text(FmtQty(t.consumption));
    $("#TotalDelivered").text(FmtQty(t.delivered));
    $("#TotalOutward").text(FmtQty(t.outward));
    $("#TotalClosing").text(FmtQty(t.closing));
}