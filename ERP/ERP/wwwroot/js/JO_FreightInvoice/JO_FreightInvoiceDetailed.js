/* JO Freight Invoice - DETAILED list page
   wwwroot/js/JO_FreightInvoice/JO_FreightInvoiceDetailed.js
   Grand totals come from the server (SP result set 2); this only sums the visible page rows (optional). */
$(document).ready(function () {
    CalculateTotals();
});

function CalculateTotals() {
    let qty = 0, amount = 0, gst = 0, wht = 0;
    const val = function (r, c) { return parseFloat($(r).find(c).text().replace(/,/g, "").trim()) || 0; };

    $("#MyTable tbody tr").each(function () {
        qty += val(this, ".Qty");
        amount += val(this, ".Amount");
        gst += val(this, ".GST");
        wht += val(this, ".WHT");
    });

    // page totals (optional footer cells; ignored if not present)
    $("#PageTotalQty").text(qty.toLocaleString("en-IN"));
    $("#PageTotalAmount").text(amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    $("#PageTotalGST").text(gst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    $("#PageTotalWHT").text(wht.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
}
