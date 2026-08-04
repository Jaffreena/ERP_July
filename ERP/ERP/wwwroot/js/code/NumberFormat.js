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
 
function removeComma(val) {
    return (val || "").toString().replace(/,/g, "").trim();
}

function addComma(val, type = "c") {

    let num = parseFloat(removeComma(val));

    if (isNaN(num)) return val;

    return type === "q"
        ? formatIndianQty(num)
        : formatIndianCurrency(num);
}