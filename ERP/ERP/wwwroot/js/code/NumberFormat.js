function formatIndianQty(amount) {
    if (amount == null || amount == "" || isNaN(amount))
        return "0";

    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Number(amount));
}
function formatIndianCurrency(amount) {
    if (amount == null || amount == "" || isNaN(amount))
        return "0.00";

    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(amount));
}
function removeCommas(value) {
    return (value || "").toString().replace(/,/g, "").trim();
}
