$(document).ready(function () {
    CalculateTotals();
    CalculateTotals_Summary();
});

function CalculateTotals() {

    let totalQty_C = 0;
    let totalQty_P = 0;
    let totalQty_S= 0;

    $("#MyTable tbody tr").each(function () {

        totalQty_C += parseFloat(
            $(this).find(".JICNVC_ConsQty").text().replace(/,/g, '').trim()
        ) || 0;

        totalQty_S += parseFloat(
            $(this).find(".JICNVS_ScrapQty").text().replace(/,/g, '').trim()
        ) || 0;

        totalQty_P += parseFloat(
            $(this).find(".JICNVP_ProdQty").text().replace(/,/g, '').trim()
        ) || 0;

    });

    $("#Total_ConsumptionQty").val(totalQty_C.toLocaleString('en-IN'));
    $("#Total_ProductionQty").val(totalQty_P.toLocaleString('en-IN'));
    $("#Total_ScrapQty").val(totalQty_S.toLocaleString('en-IN'));
  
    //$("#TotalAmount").text(totalAmount.toLocaleString('en-IN', {
    //    minimumFractionDigits: 2,
    //    maximumFractionDigits: 2
    //}));

    //$("#TotalGST").text(totalGST.toLocaleString('en-IN', {
    //    minimumFractionDigits: 2,
    //    maximumFractionDigits: 2
    //}));
}


function CalculateTotals_Summary() {

    let totalQty_C = 0;
    let totalQty_P = 0;
    let totalQty_S = 0;

    $("#MyTable_Summary tbody tr").each(function () {

        totalQty_C += parseFloat(
            $(this).find(".Cons_Qty").text().replace(/,/g, '').trim()
        ) || 0;

        totalQty_S += parseFloat(
            $(this).find(".Scrap_Qty").text().replace(/,/g, '').trim()
        ) || 0;

        totalQty_P += parseFloat(
            $(this).find(".Prod_Qty").text().replace(/,/g, '').trim()
        ) || 0;

    });

    $("#Total_Summary_Consumption").text(totalQty_C.toLocaleString('en-IN'));
    $("#Total_Summary_ProductionQty").text(totalQty_P.toLocaleString('en-IN'));
    $("#Total_Summary_ScrapQty").text(totalQty_S.toLocaleString('en-IN'));

    //$("#TotalAmount").text(totalAmount.toLocaleString('en-IN', {
    //    minimumFractionDigits: 2,
    //    maximumFractionDigits: 2
    //}));

    //$("#TotalGST").text(totalGST.toLocaleString('en-IN', {
    //    minimumFractionDigits: 2,
    //    maximumFractionDigits: 2
    //}));
}