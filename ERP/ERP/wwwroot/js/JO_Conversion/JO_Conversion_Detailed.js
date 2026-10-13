/* ==========================================================================
   JO_Conversion_Detailed.js   (wwwroot/js/JO_Conversion/JO_Conversion_Detailed.js)
   Footer totals for the Detailed (#MyTable) and Summary (#MyTable_Summary) pages
   ========================================================================== */

function JOColSum(rowSel, cls) {
    var t = 0;
    $(rowSel).each(function () {
        t += parseFloat($(this).find(cls).text().replace(/,/g, '').trim()) || 0;
    });
    return t;
}

function JOFmtTotal(v, dec) {
    return v.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function CalculateTotals() {
    var rows = '#MyTable tbody tr';
    if (!$('#MyTable').length) return;

    $('#Total_ConsumptionQty').val(JOFmtTotal(JOColSum(rows, '.JOCNVC_ConsQty'), 0));
    $('#Total_ProductionQty').val(JOFmtTotal(JOColSum(rows, '.JOCNVP_ProdQty'), 0));
    $('#Total_ScrapQty').val(JOFmtTotal(JOColSum(rows, '.JOCNVS_ScrapQty'), 0));

    // optional Kgs totals (only if the page has the boxes)
    $('#Total_ConsumptionQtyKgs').val(JOFmtTotal(JOColSum(rows, '.JOCNVC_ConsQty_Kgs'), 2));
    $('#Total_ProductionQtyKgs').val(JOFmtTotal(JOColSum(rows, '.JOCNVP_ProdQty_Kgs'), 2));
}

function CalculateTotals_Summary() {
    var rows = '#MyTable_Summary tbody tr';
    if (!$('#MyTable_Summary').length) return;

    $('#Total_Summary_Consumption').text(JOFmtTotal(JOColSum(rows, '.Cons_Qty'), 0));
    $('#Total_Summary_ProductionQty').text(JOFmtTotal(JOColSum(rows, '.Prod_Qty'), 0));
    $('#Total_Summary_ScrapQty').text(JOFmtTotal(JOColSum(rows, '.Scrap_Qty'), 0));

    $('#Total_Summary_ConsumptionKgs').text(JOFmtTotal(JOColSum(rows, '.Cons_Qty_Kgs'), 2));
    $('#Total_Summary_ProductionKgs').text(JOFmtTotal(JOColSum(rows, '.Prod_Qty_Kgs'), 2));
}

$(document).ready(function () {
    CalculateTotals();
    CalculateTotals_Summary();
});
