/* ==========================================================================
   WarehouseTransfer_Detailed.js   (wwwroot/js/WarehouseTransfer/WarehouseTransfer_Detailed.js)
   Footer totals for the Detailed (#MyTable) and Summary (#MyTable_Summary) pages
   ========================================================================== */

function WHColSum(rowSel, cls) {
    var t = 0;
    $(rowSel).each(function () {
        t += parseFloat($(this).find(cls).text().replace(/,/g, '').trim()) || 0;
    });
    return t;
}

function WHFmtTotal(v, dec) {
    return v.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function CalculateTotals() {
    if (!$('#MyTable').length) return;
    $('#Total_TransferQty').val(WHFmtTotal(WHColSum('#MyTable tbody tr', '.WHTI_Qty'), 0));
}

function CalculateTotals_Summary() {
    if (!$('#MyTable_Summary').length) return;
    var rows = '#MyTable_Summary tbody tr';
    $('#Total_Summary_Lines').text(WHFmtTotal(WHColSum(rows, '.NoOfLines'), 0));
    $('#Total_Summary_Qty').text(WHFmtTotal(WHColSum(rows, '.TotalQty'), 0));
}

$(document).ready(function () {
    CalculateTotals();
    CalculateTotals_Summary();
});