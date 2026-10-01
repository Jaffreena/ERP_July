function ToInputDate(d) {
    // local date as yyyy-MM-dd (toISOString would shift the date because of the UTC offset)
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
}

$(document).ready(function () {
    var today = new Date();
    var monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    $("#FromDate").val(ToInputDate(monthStart));   // 1st of this month
    $("#ToDate").val(ToInputDate(today));          // today

    // Group / Warehouse / Item -> "All" (value = "")
    $("#ItemGroupNumber").val("");
    $("#WarehouseNumber").val("");
    $("#ItemNumber").val("");

    LoadStockMovement();                           // load report on page open
});

$("#btnGet").on("click", function () {
    LoadStockMovement();
});

function LoadStockMovement() {
    $.ajax({
        url: "/StockMovement/GetStockMovementData",
        type: "GET",
        data: {
            FromDate: $("#FromDate").val(),
            ToDate: $("#ToDate").val(),
            ItemGroupNumber: $("#ItemGroupNumber").val(),
            WarehouseNumber: $("#WarehouseNumber").val(),
            ItemNumber: $("#ItemNumber").val()
        },
        success: function (rows) {
            RenderRows(rows);
        }
    });
}

function RenderRows(rows) {
    let body = $("#MyTableBody");
    body.empty();

    let totalOpening = 0, totalInward = 0, totalOutward = 0, totalClosing = 0;

    rows.forEach(function (r) {
        body.append(`
            <tr>
                           <td>${r.itemGroupName}</td>
                <td>${r.itemNumber}</td>
                <td class="text-start">${r.description}</td>
                <td class="text-start">${r.outerDia}</td>
                <td class="text-start">${r.thickness}</td>
                <td class="text-start">${r.length}</td>
                <td class="text-start">${r.materialGrade}</td>
                <td class="text-end">${r.openingQty.toLocaleString('en-IN')}</td>
                <td class="text-end">${r.inwardQty.toLocaleString('en-IN')}</td>
                <td class="text-end">${r.outwardQty.toLocaleString('en-IN')}</td>
                <td class="text-end">${r.closingQty.toLocaleString('en-IN')}</td>
            </tr>
        `);
        totalOpening += r.openingQty;
        totalInward += r.inwardQty;
        totalOutward += r.outwardQty;
        totalClosing += r.closingQty;
    });

    $("#TotalOpening").text(totalOpening.toLocaleString('en-IN'));
    $("#TotalInward").text(totalInward.toLocaleString('en-IN'));
    $("#TotalOutward").text(totalOutward.toLocaleString('en-IN'));
    $("#TotalClosing").text(totalClosing.toLocaleString('en-IN'));
}