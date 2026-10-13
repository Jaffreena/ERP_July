/* =====================================================================
   JO_JobworkInvoiceEdit.js  -  EDIT / VIEW page
   Load order : JO_JobworkInvoice.js  ->  JO_JobworkInvoiceEdit.js
   cshtml must define :  var JWI_IsView = true/false;   (ViewBag.IsViewMode)
   ===================================================================== */

function setDateInput(id, v) {
    var p = parseDate(v), $e = $('#' + id);
    if (!p) { $e.val(''); return; }
    var txt = ($e.attr('type') === 'date')
        ? p.y + '-' + String(p.m).padStart(2, '0') + '-' + String(p.d).padStart(2, '0')
        : String(p.d).padStart(2, '0') + '-' + String(p.m).padStart(2, '0') + '-' + p.y;
    if ($e[0] && $e[0]._flatpickr) $e[0]._flatpickr.setDate(new Date(p.y, p.m - 1, p.d), false);
    else $e.val(txt);
}

/* ---------------- load saved invoice ---------------- */
function LoadInvoice() {
    var no = num($('#JOSVIH_Number').val()) || num(new URLSearchParams(location.search).get('JOSVIH_Number'));
    if (!no) return showAlert('Invoice number is missing.');
    $('#JOSVIH_Number').val(no);

    $.get(JWI_URL + '/get', { JOSVIH_Number: no }, function (m) {
        var h = g(m, 'Header') || {};
        var items = g(m, 'Items') || [], gsts = g(m, 'GST') || [];
        JWI_Addresses = g(m, 'Addresses') || [];

        // ----- header
        $('#JOSVIH_JournalNo').val(g(h, 'JOSVIH_JournalNo'));
        setDateInput('JOSVIH_JournalDate', g(h, 'JOSVIH_JournalDate'));
        $('#JOSVIH_VendorInvoiceNo').val(g(h, 'JOSVIH_VendorInvoiceNo'));
        setDateInput('JOSVIH_VendorInvoiceDate', g(h, 'JOSVIH_VendorInvoiceDate'));
        $('#JOSVIH_MS_Number').val(g(h, 'JOSVIH_MS_Number'));
        $('#JOSVIH_JW_Vendor_Number').val(g(h, 'JOSVIH_JW_Vendor_Number'));
        $('#JOSVIH_Currency_Number').val(g(h, 'JOSVIH_Currency_Number'));
        $('#JOSVIH_PaymentTerms').val(g(h, 'JOSVIH_PaymentTerms') || '');
        $('#JOSVIH_PaymentMethod').val(g(h, 'JOSVIH_PaymentMethod') || '');
        $('#JOSVIH_Remarks').val(g(h, 'JOSVIH_Remarks') || '');

        var vno = num(g(h, 'JOSVIH_JW_Vendor_Number'));
        var vname = g(h, 'JOSVIH_JW_Vendor_Name');
        if (vname) $('#JOSVIH_JW_Vendor_Name').val(vname);
        else $.get(JWI_URL + '/vendor/get', { VendorNumber: vno, InvoiceDate: dateYMD('JOSVIH_VendorInvoiceDate') },
            function (l) { if (l && l.length) $('#JOSVIH_JW_Vendor_Name').val(g(l[0], 'JWV_JW_VendorName')); });

        LoadTaxClusters(vno, g(h, 'JOSVIH_TCT_Number'));
        $('#JOSVIH_WHT_Number').val(num(g(h, 'JOSVIH_WHT_Number')));

        // Vendor + Material Segregation cannot change in Edit
        $('#JOSVIH_JW_Vendor_Name, #JOSVIH_MS_Number').prop('disabled', true);

        // ----- items (saved values shown as they are, no recalculation on load)
        $('#TableBody').empty();
        items.forEach(function (it) { AddSavedRow(it, gsts); });
        ReNumberRows();

        GetWHT(function () {          // only fills WHT % / IncludeTax for later qty change
            CalculateTotals();
            if (typeof AutoFit === 'function') AutoFit();
            if (window.JWI_IsView) ApplyViewMode();
        });
    });
}

function AddSavedRow(it, gsts) {
    var jornI = num(g(it, 'JOSVII_JORNI_Number'));
    var sacNo = num(g(it, 'JOSVII_SAC_Number'));

    // shape = RN item (same as 7A AddItemRow expects)
    AddItemRow({
        JORNH_Number: g(it, 'JOSVII_JORNH_Number'), JORNH_RN_No: g(it, 'JORNH_RN_No'),
        JORNH_VendorDC_No: g(it, 'JOSVII_Vendor_DN_No'),
        JORNI_Number: jornI, JORNI_JPRS_Number: g(it, 'JOSVII_JPRS_Number'),
        JPRS_ProcessName: g(it, 'JPRS_ProcessName'),
        JORNI_Item_Number: g(it, 'JOSVII_Item_Number'), JORNI_UoM_Number: g(it, 'JOSVII_UoM_Number'),
        JORNI_UnitPrice: g(it, 'JOSVII_UnitPrice'),
        JORNI_JOJWI_SVOH_Number: g(it, 'JOSVII_JOJWI_SVOH_Number'),
        JORNI_JOJWI_SVOI_Number: g(it, 'JOSVII_JOJWI_SVOI_Number'),
        ServiceOrderNo: g(it, 'ServiceOrderNo'),
        ItemCode: g(it, 'ItemCode'), ItemDescription: g(it, 'ItemDescription'), UOM: g(it, 'UOM'),
        SAC_Number: sacNo, SAC: g(it, 'SAC_Code'),
        ReceivedQty: g(it, 'DeliveredQty'), InvoicedQty: g(it, 'PrevInvoicedQty'),
        RemainingQty: g(it, 'RemainingQty')           // excludes this invoice's own qty
    });

    var $tr = $('#TableBody tr').last();
    $tr.data('item').JOSVII_Number = num(g(it, 'JOSVII_Number'));

    // saved GST rows of this item -> popup shape
    var rows = gsts.filter(function (x) { return num(g(x, 'JOSVIG_JOSVII_Number')) === num(g(it, 'JOSVII_Number')); })
        .map(function (x) {
            return {
                TaxIndex: g(x, 'JOSVIG_Index'), GSTCNumber: g(x, 'JOSVIG_GSTC_Number'),
                GSTTNumber: g(x, 'JOSVIG_GSTT_Number'), GSTENumber: g(x, 'JOSVIG_GSTE_Number'),
                AssessableValue: g(x, 'JOSVIG_AssessableValue'), Percentage: g(x, 'JOSVIG_Percent'),
                Amount: g(x, 'JOSVIG_GST_Amount')
            };
        });
    $tr.data('gst', rows);

    $tr.find('.qty').val(fmt(g(it, 'JOSVII_Qty')));
    $tr.find('.amt').val(fmt(g(it, 'JOSVII_Amount')));
    $tr.find('.gst-link').val(fmt(g(it, 'JOSVII_GST_Amount')));
    $tr.find('.whtp').val(fmt(g(it, 'JOSVII_WHT_Percent')));
    $tr.find('.wht').val(fmt(g(it, 'JOSVII_WH_TaxAmount')));
}

/* ---------------- VIEW mode : lock everything ---------------- */
function ApplyViewMode() {
    // GST box stays enabled so the GST popup can still be opened
    $('#JWI_Page').find('input, select, textarea').not('.gst-link').prop('disabled', true);
    $('.btn-del-row, #BtnAddRN, #BtnSave, #BtnAddAddressRow, #BtnSaveAddress, .ad-del').hide();
}
// Address popup is built dynamically -> lock its inputs each time it opens
$(document).on('shown.bs.modal', '#AddressModal', function () {
    if (window.JWI_IsView) $('#AddressTableBody').find('input, select').prop('disabled', true);
});

/* ---------------- UPDATE (replaces 7A save handler) ---------------- */
$(document).off('click', '#BtnSave');
$(document).on('click', '#BtnSave', function () {
    if (window.JWI_IsView || JWI_Saving) return;
    var errs = ValidateHeader().concat(ValidateItems());
    if (errs.length) return showAlert(errs.join('<br/>'));

    JWI_Saving = true; $('#BtnSave').prop('disabled', true);
    $.ajax({
        url: JWI_URL + '/update', type: 'POST', contentType: 'application/json',
        data: JSON.stringify(CreateModel())
    }).done(function (r) {
        if (r && r.success) { window.location.href = r.redirectUrl || (JWI_URL + '-summary'); }
        else { showAlert((r && r.message) || 'Update failed.'); JWI_Saving = false; $('#BtnSave').prop('disabled', false); }
    }).fail(function () {
        showAlert('Server error. Please try again.'); JWI_Saving = false; $('#BtnSave').prop('disabled', false);
    });
});

$(function () { LoadInvoice(); });