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

    LoadStockClosing();                            // load report on page open
});

$("#btnGet").on("click", function () {
    LoadStockClosing();
});

function LoadStockClosing() {
    $.ajax({
        url: "/StockClosing/GetStockClosingData",
        type: "GET",
        data: {
            FromDate: $("#FromDate").val(),
            ToDate: $("#ToDate").val(),
            ItemGroupNumber: $("#ItemGroupNumber").val(),
            WarehouseNumber: $("#WarehouseNumber").val(),
            ItemNumber: $("#ItemNumber").val()
        },
        success: function (rows) {
            RenderClosingRows(rows);
        }
    });
}

function RenderClosingRows(rows) {
    var body = $("#MyTableBody");
    body.empty();

    var totalClosing = 0;

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
            '<td class="qty">' + FmtQty(r.closingQty) + '</td>' +
            '</tr>'
        );
        totalClosing += r.closingQty;
    });

    $("#TotalClosing").text(FmtQty(totalClosing));
}