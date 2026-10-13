/* ==========================================================================
   JO_Conversion_ItemBatch.js  (wwwroot/js/JO_Conversion/JO_Conversion_ItemBatch.js)
   PRODUCTION (#IBatch) and SCRAP (#IBatch_S) batch popups - one generic code.
   Batches are typed by the user and saved per item row in JOCNV.batch.P / .S
   ========================================================================== */

var JOIB = {
    P: {
        k: 'P', sfx: 'P', modal: '#IBatch', body: '#IBatTableBody_P', itemBody: '#TableBody_P',
        qtyLbl: '#RNI_BATCHQty_P', totQty: '#BatchTotalQty_P', totVal: '#BatchTotalValue_P',
        addBtn: '#IBatNewRowButton', closeBtn: '#IBatCloseButton', openBtn: '.ItemBatch_P', hasStatus: true, label: 'Production'
    },
    S: {
        k: 'S', sfx: 'S', modal: '#IBatch_S', body: '#IBatTableBody_S', itemBody: '#TableBody_S',
        qtyLbl: '#RNI_BATCHQty_S', totQty: '#BatchTotalQty_S', totVal: '#BatchTotalValue_S',
        addBtn: '#IBatNewRowButton_S', closeBtn: '#IBatCloseButton_S', openBtn: '.ItemBatch_S', hasStatus: false, label: 'Scrap'
    }
};

function JOIBrows(c) { return $(c.body).children('tr.IBatNewRow'); }
function JOIBtemplate(c) { return $(c.body).children('tr').not('.IBatNewRow').first(); }

//#region ROWS ------------------------------------------------------------------
function JOIBNewRow(c, data) {
    var $row = JOIBtemplate(c).clone().removeAttr('style').removeAttr('id').addClass('IBatNewRow');
    $row.find('input').not('[type=checkbox]').val('');
    $row.find('.JIRNI_BCH_WH_Number').prop('selectedIndex', 0);
    $row.find('.JIRNI_BCH_ItemStatus').prop('selectedIndex', 0);
    $(c.body).append($row);

    var $dt = $row.find('.JIRNI_BCH_BatchDate');
    if (typeof flatpickr === 'function') {
        flatpickr($dt[0], { dateFormat: 'd-M-Y', allowInput: true, defaultDate: (data && data.date) ? JOFmtDate(data.date) : new Date() });
    } else {
        $dt.val((data && data.date) ? JOFmtDate(data.date) : JOToday());
    }

    // warehouse = the item row's warehouse unless the saved entry says otherwise
    var itemWh = JOCNV.cur[c.k] ? JOCNV.cur[c.k].find('.JIDNI_WH_Number').val() : '';
    JOSetSelect($row.find('.JIRNI_BCH_WH_Number'), (data && data.wh) ? data.wh : itemWh);

    if (c.hasStatus) {
        // Status is read only - always the Production item row's Status
        var itemSt = JOCNV.cur[c.k] ? (JOCNV.cur[c.k].find('.JIDNI_ItemStatus').val() || 'Good') : 'Good';
        $row.find('.JIRNI_BCH_ItemStatus').val(itemSt);
    }

    if (data) {
        $row.find('.JIRNI_BCH_Number').val(data.no || '');
        $row.find('.JIRNI_BCH_BatchQty').val(data.qty ? formatIndianQty(data.qty) : '');
        $row.find('.JIRNI_BCH_BatchUnitPrice').val(DecimalIndianRupees(data.price));
        $row.find('.JIRNI_BCH_BatchValue').val(DecimalIndianRupees(data.value));
    }
    JOIBFooter(c);
    ApplyIBatFieldWidths(c.sfx);
    return $row;
}

function JOIBRowComplete($row) {
    return !!(JOTrim($row.find('.JIRNI_BCH_Number').val()) && JONum($row.find('.JIRNI_BCH_BatchQty').val()) > 0);
}

function JOIBFooter(c) {
    var q = 0, v = 0;
    JOIBrows(c).each(function () {
        q += JONum($(this).find('.JIRNI_BCH_BatchQty').val());
        v += JONum($(this).find('.JIRNI_BCH_BatchValue').val());
    });
    $(c.totQty).val(QtyDecimalRupees(q, 3));
    $(c.totVal).val(DecimalIndianRupees(v));
}

function JOIBCollect(c) {
    var list = [];
    JOIBrows(c).each(function () {
        var $r = $(this);
        var no = JOTrim($r.find('.JIRNI_BCH_Number').val());
        var qty = JONum($r.find('.JIRNI_BCH_BatchQty').val());
        if (!no && !qty) return;                         // untouched row
        list.push({
            no: no,
            date: $r.find('.JIRNI_BCH_BatchDate').val(),
            wh: $r.find('.JIRNI_BCH_WH_Number').val(),
            status: c.hasStatus ? ($r.find('.JIRNI_BCH_ItemStatus').val() || 'Good') : '',
            qty: qty,
            price: JONum($r.find('.JIRNI_BCH_BatchUnitPrice').val()),
            value: JONum($r.find('.JIRNI_BCH_BatchValue').val())
        });
    });
    return list;
}
//#endregion

//#region EVENTS ----------------------------------------------------------------
function JOIBBind(c) {

    // open popup
    $(document).on('click', c.openBtn, function () {
        var $checked = JOCheckedRow(c.k);
        if ($checked.length !== 1) { showAlert('Please select one ' + c.label + ' row.'); return; }

        var $row = $checked.first(), rid = JOEnsureRowId($row);
        var qty = $row.find('.JIDNI_Qty').val();
        if (!$row.find('.JIDNI_Item_Number').val() || JONum(qty) <= 0) {
            showAlert('Select the Item and enter the Qty first.', $row.find('.JIDNI_Item_Code'));
            return;
        }
        var wh = $row.find('.JIDNI_WH_Number').val();
        if (!wh || wh === '0') { showAlert('Select the Warehouse first.', $row.find('.JIDNI_WH_Number')); return; }

        JOCNV.cur[c.k] = $row;
        JOIBrows(c).remove();

        var rows = JOCNV.draft[c.k][rid] || JOCNV.batch[c.k][rid] || [];
        if (!rows.length) JOIBNewRow(c, null);
        else rows.forEach(function (b) { JOIBNewRow(c, b); });

        $(c.qtyLbl).text(qty);
        JOIBFooter(c);
        JOModal(c.modal, 'show');
        JOLoadAllWH(c.sfx, $row.find('.JIDNI_Item_Number').val());
        ApplyIBatFieldWidths(c.sfx);
        setTimeout(function () { JOIBrows(c).last().find('.JIRNI_BCH_Number').focus(); }, 300);
    });

    // qty / price -> value, auto add next row
    $(document).on('input', c.body + ' tr.IBatNewRow .JIRNI_BCH_BatchQty, ' + c.body + ' tr.IBatNewRow .JIRNI_BCH_BatchUnitPrice', function () {
        var $r = $(this).closest('tr');
        var v = JONum($r.find('.JIRNI_BCH_BatchQty').val()) * JONum($r.find('.JIRNI_BCH_BatchUnitPrice').val());
        $r.find('.JIRNI_BCH_BatchValue').val(DecimalIndianRupees(v));
        JOIBFooter(c);
        ApplyIBatFieldWidths(c.sfx);
        if ($r.is(JOIBrows(c).last()) && JOIBRowComplete($r)) JOIBNewRow(c, null);
    });
    $(document).on('input', c.body + ' tr.IBatNewRow .JIRNI_BCH_Number', function () { ApplyIBatFieldWidths(c.sfx); });

    $(document).on('blur', c.body + ' .JIRNI_BCH_BatchQty', function () {
        var v = removeCommas(this.value);
        this.value = v !== '' ? QtyDecimalRupees(parseFloat(v), 0) : '';
    });

    // add / remove row
    $(c.addBtn).on('click', function () {
        if (JOIBRowComplete(JOIBrows(c).last())) JOIBNewRow(c, null);
        else showAlert('Please complete the Batch No and Qty first.');
        JOIBFooter(c);
    });
    $(document).on('click', c.body + ' .IBatRowRemove', function () {
        $(this).closest('tr').remove();
        if (JOIBrows(c).length === 0) JOIBNewRow(c, null);
        JOIBFooter(c);
        ApplyIBatFieldWidths(c.sfx);
    });

    // click in input = select all
    $(document).on('click', c.body + ' input', function (e) {
        e.stopPropagation();
        var input = this;
        input.focus();
        setTimeout(function () { input.select(); }, 10);
    });

    // close = validate + save
    $(c.closeBtn).on('click', function () {
        var $row = JOCNV.cur[c.k];
        if (!$row || !$row.length) { JOModal(c.modal, 'hide'); return; }
        var rid = JOEnsureRowId($row);
        var entries = JOIBCollect(c);

        for (var i = 0; i < entries.length; i++) {
            if (entries[i].qty > 0 && !entries[i].no) { alert('Please enter Batch Number'); return false; }
            if (entries[i].qty <= 0) { alert('Please enter Qty for Batch ' + entries[i].no); return false; }
            if (!entries[i].wh || entries[i].wh === '0') { alert('Please select Warehouse for Batch ' + entries[i].no); return false; }
        }

        var total = 0;
        entries.forEach(function (b) { total += b.qty; });
        var itemQty = JONum($(c.qtyLbl).text());

        $(c.modal).one('hidden.bs.modal', function () {
            setTimeout(function () { JOFocusQty(c.k, rid); }, 300);
        });

        if (Math.abs(total - itemQty) > 0.0001) {
            alert('Qty Mismatch !');
            JOCNV.draft[c.k][rid] = entries;
            JOModal(c.modal, 'hide');
            return false;
        }
        delete JOCNV.draft[c.k][rid];
        JOCNV.batch[c.k][rid] = entries;
        JOModal(c.modal, 'hide');
    });
}
//#endregion

//#region COLUMN WIDTHS ---------------------------------------------------------
function ApplyIBatFieldWidths(suffix) {
    var id = '#IBatTableBody_' + suffix;
    var fields = [
        { cls: '.JIRNI_BCH_BatchDate', min: 10, max: 10, align: 'center' },
        { cls: '.JIRNI_BCH_Number', min: 15, max: 30, align: 'left' },
        { cls: '.JIRNI_BCH_BatchQty', min: 10, max: 20, align: 'right' },
        { cls: '.JIRNI_BCH_BatchUnitPrice', min: 11, max: 20, align: 'right' },
        { cls: '.JIRNI_BCH_BatchValue', min: 13, max: 25, align: 'right' }
    ];
    if (typeof chToPx !== 'function' || typeof getTextWidth !== 'function') return;
    var $table = $(id).closest('table');
    var tmplId = $(id).children('tr').not('.IBatNewRow').first();

    fields.forEach(function (f) {
        var $controls = tmplId.find(f.cls).add($(id).children('tr.IBatNewRow').find(f.cls));
        if (!$controls.length) return;

        var sample = $controls.first()[0];
        var minW = chToPx(f.min, sample);
        var maxW = f.max != null ? chToPx(f.max, sample) : Number.MAX_SAFE_INTEGER;
        var need = minW;
        $controls.each(function () { need = Math.max(need, getTextWidth(JOTrim(this.value || ''), this)); });
        need = Math.min(need, maxW);
        if (/UnitPrice|Value/.test(f.cls)) need = Math.min(need + 8, maxW);

        $controls.each(function () {
            this.style.setProperty('width', '100%', 'important');
            this.style.setProperty('box-sizing', 'border-box', 'important');
            this.style.setProperty('text-align', f.align, 'important');
            this.style.setProperty('padding', '2px', 'important');
            var td = $(this).closest('td')[0];
            if (!td) return;
            td.style.setProperty('width', need + 'px', 'important');
            td.style.setProperty('min-width', minW + 'px', 'important');
            td.style.setProperty('max-width', maxW + 'px', 'important');
            var th = $table.find('thead th').eq(td.cellIndex)[0];
            if (th) {
                th.style.setProperty('width', need + 'px', 'important');
                th.style.setProperty('min-width', minW + 'px', 'important');
                th.style.setProperty('max-width', maxW + 'px', 'important');
            }
        });
    });
}
//#endregion

$(function () {
    JOIBBind(JOIB.P);
    JOIBBind(JOIB.S);
    JOIBFooter(JOIB.P);
    JOIBFooter(JOIB.S);
    ApplyIBatFieldWidths('P');
    ApplyIBatFieldWidths('S');
});
