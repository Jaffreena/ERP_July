/* =====================================================================
   JO_JobworkInvoiceEdit.js  -  EDIT / VIEW page
   Load order : JO_JobworkInvoice.js  ->  JO_JobworkInvoiceEdit.js
   cshtml must define :  var JWI_IsView = true/false;   (ViewBag.IsViewMode)
   ===================================================================== */

// Create JS has $(function(){ LoadDefaultFormSetting(); }) - it would overwrite saved values on Edit, so disable it.
LoadDefaultFormSetting = function () { };

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
    var assign = (g(it, 'JOSVII_SVO_Assign') || 'RECEIPT NOTE').toUpperCase();
    var isInv = (assign === 'INVOICE');            // INVOICE = SO dropdown, RECEIPT NOTE = SO label
    var savedSvoh = num(g(it, 'JOSVII_JOJWI_SVOH_Number'));
    var savedSvoi = num(g(it, 'JOSVII_JOJWI_SVOI_Number'));

    // shape = RN item (same as 7A AddItemRow expects)
    AddItemRow({
        JORNH_Number: g(it, 'JOSVII_JORNH_Number'), JORNH_RN_No: g(it, 'JORNH_RN_No'),
        JORNH_VendorDC_No: g(it, 'JOSVII_Vendor_DN_No'),
        JORNI_Number: jornI, JORNI_JPRS_Number: g(it, 'JOSVII_JPRS_Number'),
        JPRS_ProcessName: g(it, 'JPRS_ProcessName'),
        JORNI_Item_Number: g(it, 'JOSVII_Item_Number'), JORNI_UoM_Number: g(it, 'JOSVII_UoM_Number'),
        JORNI_UnitPrice: g(it, 'JOSVII_UnitPrice'),
        JORNI_JOJWI_SVOH_Number: isInv ? 0 : savedSvoh,
        JORNI_JOJWI_SVOI_Number: isInv ? 0 : savedSvoi,
        HasServiceOrder: isInv ? 0 : 1,
        ServiceOrderNo: g(it, 'ServiceOrderNo'),
        ItemCode: g(it, 'ItemCode'), ItemDescription: g(it, 'ItemDescription'), UOM: g(it, 'UOM'),
        SAC_Number: sacNo, SAC: g(it, 'SAC_Code'),
        ReceivedQty: g(it, 'DeliveredQty'), InvoicedQty: g(it, 'PrevInvoicedQty'),
        // max allowed = Delivered - PrevInvoiced (SP: other invoices only, this invoice's own qty already excluded)
        RemainingQty: Math.max(0, num(g(it, 'DeliveredQty')) - num(g(it, 'PrevInvoicedQty')))
    });

    var $tr = $('#TableBody tr').last();
    var item = $tr.data('item');
    item.JOSVII_Number = num(g(it, 'JOSVII_Number'));
    item.JOSVII_SVO_Assign = assign;
    if (isInv) {                                   // saved SO selected in dropdown
        item.JOSVII_JOJWI_SVOH_Number = savedSvoh;
        item.JOSVII_JOJWI_SVOI_Number = savedSvoi;
        $tr.find('.so-select').append(
            $('<option></option>').val(savedSvoh).attr('data-svoi', savedSvoi).text(g(it, 'ServiceOrderNo') || savedSvoh)
        ).val(savedSvoh);
        // SO max for saved row (SO qty - qty on other invoices; this invoice excluded by SP)
        $.get(JWI_URL + '/service-order-item-info', {
            SVOH_Number: savedSvoh, JPRS_Number: item.JOSVII_JPRS_Number,
            Item_Number: item.JOSVII_Item_Number, UoM_Number: item.JOSVII_UoM_Number,
            JOSVIH_Number: num($('#JOSVIH_Number').val()) || ''
        }, function (r) { item.SoMax = Math.max(0, num(g(r, 'svoiQty')) - num(g(r, 'prevInvoiceQty'))); });
    }

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
    $tr.find('.gst').val(fmt(g(it, 'JOSVII_GST_Amount')));
    $tr.find('.whtp').val(fmt(g(it, 'JOSVII_WHT_Percent')));
    $tr.find('.wht').val(fmt(g(it, 'JOSVII_WH_TaxAmount')));
}

/* ---------------- VIEW mode : lock everything ---------------- */
function ApplyViewMode() {
    // GST box stays enabled so the GST popup can still be opened
    $('#JWI_Page').find('input, select, textarea').not('.gst').prop('disabled', true);
    $('#BtnDeleteRow, #BtnAddRN, #BtnSave, #BtnAddAddressRow, #BtnSaveAddress, .ad-del').hide();
}
// Replaces Create JS version: no duplicate option, saved SO stays selected
function LoadSoDropdown($tr) {
    var item = $tr.data('item'), $s = $tr.find('.so-select');
    $.get(JWI_URL + '/service-order', {
        VendorNumber: num($('#JOSVIH_JW_Vendor_Number').val()),
        JPRS_Number: item.JOSVII_JPRS_Number,
        Item_Number: item.JOSVII_Item_Number,
        UoM_Number: item.JOSVII_UoM_Number,
        JOSVIH_Number: num($('#JOSVIH_Number').val()) || ''
    }, function (list) {
        var keep = $s.val();
        (list || []).forEach(function (o) {
            if ($s.find('option[value="' + o.value + '"]').length) return;
            $s.append($('<option></option>').val(o.value).attr('data-svoi', o.svoiNumber).text(o.text));
        });
        $s.val(keep);
    }).fail(function (xhr) {
        console.error('Service Order dropdown failed', xhr.status, xhr.responseText);
        showAlert('Service Order list could not be loaded.');
    });
}

// Address popup is built dynamically -> lock its inputs each time it opens
$(document).on('shown.bs.modal', '#AddressModal', function () {
    if (window.JWI_IsView) $('#AddressTableBody').find('input, select').prop('disabled', true);
});

/* ---------------- MAX ALLOWED QTY check ----------------
   Max allowed = Delivered - Prev Invoiced (other invoices only) = item.Remaining
   checked : Qty focus-out / change, and after Receipt Note items are inserted */
// effective max = RN max (Delivered - Prev Invoiced)  and  SO max (SO qty - Prev Invoiced on SO, INVOICE rows only) -> lower one
function GetMaxQty(it) {
    var m = it.Remaining;
    if (it.SoMax !== undefined && it.SoMax !== null && it.SoMax < m) m = it.SoMax;
    return Math.max(0, m);
}
function CheckMaxQty($tr) {
    var it = $tr.data('item');
    if (!it) return true;
    var q = num($tr.find('.qty').val()), max = GetMaxQty(it);
    if (q > max) {
        var bySo = (it.SoMax !== undefined && it.SoMax !== null && it.SoMax < it.Remaining);
        showAlert('Qty cannot exceed Max Allowed Qty (' + fmtQ(max) + ')' + (bySo ? ' of the Service Order.' : '.'));
        $tr.find('.qty').val(fmtQ(max));
        RecalcRow($tr);
        return false;
    }
    return true;
}
$(document).on('focusout change', '#TableBody .qty', function () {
    if (window.JWI_IsView) return;
    CheckMaxQty($(this).closest('tr'));
});
// Service Order dropdown change (replaces Create handler) : price + assign flag + SO max, then Max Allowed check
$(document).off('change', '#TableBody .so-select');
$(document).on('change', '#TableBody .so-select', function () {
    var $s = $(this), $tr = $s.closest('tr'), item = $tr.data('item');
    var svoh = num($s.val());

    if (!svoh) {                                   // blank -> clear
        item.JOSVII_JOJWI_SVOH_Number = 0;
        item.JOSVII_JOJWI_SVOI_Number = 0;
        item.JOSVII_UnitPrice = 0;
        item.JOSVII_SVO_Assign = 'RECEIPT NOTE';
        item.SoMax = undefined;
        $tr.find('.up').val(fmt(0));
        RecalcRow($tr);
        return;
    }

    $.get(JWI_URL + '/service-order-item-info', {
        SVOH_Number: svoh,
        JPRS_Number: item.JOSVII_JPRS_Number,
        Item_Number: item.JOSVII_Item_Number,
        UoM_Number: item.JOSVII_UoM_Number,
        JOSVIH_Number: num($('#JOSVIH_Number').val()) || ''
    }, function (r) {
        item.JOSVII_JOJWI_SVOH_Number = svoh;
        item.JOSVII_JOJWI_SVOI_Number = num(g(r, 'svoiNumber')) || num($s.find('option:selected').attr('data-svoi'));
        item.JOSVII_UnitPrice = num(g(r, 'unitPrice'));
        item.JOSVII_SVO_Assign = 'INVOICE';
        item.SoMax = Math.max(0, num(g(r, 'svoiQty')) - num(g(r, 'prevInvoiceQty')));
        $tr.find('.up').val(fmt(item.JOSVII_UnitPrice));
        if (!CheckMaxQty($tr)) return;             // clamps + recalcs
        RecalcRow($tr);
    }).fail(function () { showAlert('Service Order price could not be loaded.'); });
});

// Update : Create ValidateItems checks RN max only -> add SO max
var _ValidateItemsBase = ValidateItems;
ValidateItems = function () {
    var e = _ValidateItemsBase();
    ActiveRows().each(function (i) {
        var it = $(this).data('item');
        if (it.SoMax !== undefined && it.SoMax !== null && num($(this).find('.qty').val()) > it.SoMax)
            e.push('Row ' + (i + 1) + ': Qty exceeds Service Order Max Allowed Qty (' + fmtQ(it.SoMax) + ').');
    });
    return e;
};

// Receipt Note insert -> rows come from /receipt-note-items : check every active row once they are in the grid
$(document).ajaxComplete(function (e, xhr, opt) {
    if (window.JWI_IsView || !opt || String(opt.url).indexOf('/receipt-note-items') < 0) return;
    setTimeout(function () { ActiveRows().each(function () { CheckMaxQty($(this)); }); }, 300);
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