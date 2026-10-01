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

    $("#FromDate").val(ToInputDate(monthStart));   // 1st of this month
    $("#ToDate").val(ToInputDate(today));          // today

    $("#ItemGroupNumber").val("");                 // All
    $("#WarehouseNumber").val("");
    $("#ItemNumber").val("");

    LoadStockMovementDetail();
});

$("#btnGet").on("click", function () {
    LoadStockMovementDetail();
});

function LoadStockMovementDetail() {
    $.ajax({
        url: "/StockMovementDetail/GetStockMovementDetailData",
        type: "GET",
        data: {
            FromDate: $("#FromDate").val(),
            ToDate: $("#ToDate").val(),
            ItemGroupNumber: $("#ItemGroupNumber").val(),
            WarehouseNumber: $("#WarehouseNumber").val(),
            ItemNumber: $("#ItemNumber").val()
        },
        success: function (rows) {
            RenderDetailRows(rows);
        }
    });
}

function RenderDetailRows(rows) {
    var body = $("#MyTableBody");
    body.empty();

    var t = { opening: 0, received: 0, production: 0, inward: 0, consumption: 0, delivered: 0, outward: 0, closing: 0 };

    rows.forEach(function (r) {
        body.append(
            '<tr>' +
            '<td>' + Esc(r.itemGroupName) + '</td>' +
            '<td>' + Esc(r.itemNumber) + '</td>' +
            '<td>' + Esc(r.description) + '</td>' +
            '<td>' + Esc(r.outerDia) + '</td>' +
            '<td>' + Esc(r.thickness) + '</td>' +
            '<td>' + Esc(r.length) + '</td>' +
            '<td>' + Esc(r.materialGrade) + '</td>' +
            '<td class="qty">' + FmtQty(r.openingQty) + '</td>' +
            '<td class="qty">' + FmtQty(r.receivedQty) + '</td>' +
            '<td class="qty">' + FmtQty(r.productionQty) + '</td>' +
            '<td class="qty">' + FmtQty(r.inwardSum) + '</td>' +
            '<td class="qty">' + FmtQty(r.consumptionQty) + '</td>' +
            '<td class="qty">' + FmtQty(r.deliveredQty) + '</td>' +
            '<td class="qty">' + FmtQty(r.outwardSum) + '</td>' +
            '<td class="qty">' + FmtQty(r.closingQty) + '</td>' +
            '</tr>'
        );
        t.opening += r.openingQty;
        t.received += r.receivedQty;
        t.production += r.productionQty;
        t.inward += r.inwardSum;
        t.consumption += r.consumptionQty;
        t.delivered += r.deliveredQty;
        t.outward += r.outwardSum;
        t.closing += r.closingQty;
    });

    $("#TotalOpening").text(FmtQty(t.opening));
    $("#TotalReceived").text(FmtQty(t.received));
    $("#TotalProduction").text(FmtQty(t.production));
    $("#TotalInward").text(FmtQty(t.inward));
    $("#TotalConsumption").text(FmtQty(t.consumption));
    $("#TotalDelivered").text(FmtQty(t.delivered));
    $("#TotalOutward").text(FmtQty(t.outward));
    $("#TotalClosing").text(FmtQty(t.closing));
}