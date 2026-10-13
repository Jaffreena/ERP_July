/* ==========================================================================
   JO_Conversion_Batch.js   (wwwroot/js/JO_Conversion/JO_Conversion_Batch.js)
   CONSUMPTION batch popup  (#DeliveryNoteBatchModal)
   - batches come from the IN ledger (GET .../conversion/batch)
   - saved per row in JOCNV.batch.C[rowid]
   - Temp_DeliveryNoteBatch is kept in step with JOSyncTemp()
   ========================================================================== */

//#region TEMP RESERVATION SYNC -------------------------------------------------
// Rebuilds the user's temp reservation from the saved batches (row position = DBCH_Index).
var JOTempQueue = Promise.resolve();

function JOSyncTemp() {
    var list = [];
    JOrows('C').each(function (i) {
        var $r = $(this), rid = JOEnsureRowId($r);
        var item = parseInt($r.find('.JIDNI_Item_Number').val(), 10) || 0;
        (JOCNV.batch.C[rid] || []).forEach(function (b) {
            if (JONum(b.qty) <= 0) return;
            list.push({
                DBCH_Index: i,
                DBCH_Item_Number: item,
                DBCH_DBCH_Number: parseInt(b.ref, 10) || 0,
                DBCH_Warehouse_Number: parseInt(b.whNo, 10) || 0,
                DBCH_Date: ToLocalDateString(b.date),
                DBCH_No: b.no || '',
                DBCH_Qty: JONum(b.qty),
                DBCH_UnitPrice: JONum(b.price),
                DBCH_Value: JONum(b.value),
                CreatorCode: 0
            });
        });
    });

    JOTempQueue = JOTempQueue.then(function () {
        return JOAjax({ url: JOCNV.urls.tempClear, type: 'POST' });
    }).then(function () {
        if (!list.length) return null;
        return JOAjax({ url: JOCNV.urls.tempSave, type: 'POST', contentType: 'application/json', data: JSON.stringify(list) });
    }).catch(function (xhr) {
        console.log('temp sync failed', xhr && xhr.responseText);
    });
    return JOTempQueue;
}
//#endregion

//#region FOOTER ----------------------------------------------------------------
function CalculateBatchFooter() {
    var q = 0, avail = 0, val = 0, res = 0;
    $('#DeliveryNoteBatchTableBody tr.DeliveryNoteBatchRow').each(function () {
        var $t = $(this);
        q += JONum($t.find('.JIDNI_BCH_QtyInvoice').val());
        avail += JONum($t.find('.JIDNI_BCH_QtyAvailable').val());
        res += JONum($t.find('.JIDNI_BCH_QtyReserved').val());
        val += JONum($t.find('.JIDNI_BCH_BatchValue').val());
    });
    $('#TotalBatchQty').val(QtyDecimalRupees(q, 3));
    $('#TotalBatchValue').val(DecimalIndianRupees(val));
    $('#TotalAvailableQty').val(QtyDecimalRupees(avail, 3));
    $('#TotalReservedQty').val(QtyDecimalRupees(res, 3));
}

function CalculateOtherBatchFooter() {
    var q = 0, v = 0, $rows = $('#DeliveryNoteOtherBatchTableBody .DeliveryNoteOtherBatchRow');
    $rows.each(function () {
        q += JONum($(this).find('.JIDNI_BCH_AvailableQty').val());
        v += JONum($(this).find('.JIDNI_BCH_BatchValue').val());
    });
    $('#TotalBatchQtyOther').val(q.toFixed(2));
    $('#TotalBatchValueOther').val(v.toFixed(2));
    var $foot = $('#DeliveryNoteOtherBatchList tfoot');
    if ($rows.filter('.JOHasData').length) $foot.show(); else $foot.hide();
}
//#endregion

//#region BIND MAIN WAREHOUSE BATCHES -------------------------------------------
var JO_EMPTY_BATCH_ROW = '<tr class="DeliveryNoteBatchRow JOEmpty"><td style="height:25px;"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';

function JOBindConsBatch(rid, item, resp) {
    var $body = $('#DeliveryNoteBatchTableBody');
    $body.find('.DeliveryNoteBatchRow').remove();

    var saved = {}, draft = {};
    (JOCNV.batch.C[rid] || []).forEach(function (b) { saved[b.ref] = b; });
    (JOCNV.draft.C[rid] || []).forEach(function (b) { draft[b.ref] = b; });

    $.each(resp, function (i, b) {
        var ref = b.lineBatch_Number;
        var qty = draft[ref] !== undefined ? draft[ref].qty
            : (saved[ref] !== undefined ? saved[ref].qty : (b.deliveredQty || 0));
        var price = b.batchUnitPrice || 0;

        var $tr = $('#DeliveryNoteBatchTemplateRow').clone().removeAttr('id').removeAttr('style').addClass('DeliveryNoteBatchRow');
        $tr.find('.JIDNI_BCH_Number').val(ref);
        $tr.find('.JIDNI_BCH_WH_Number').val(b.fromWarehouse);
        $tr.find('.JIDNI_BCH_JIDNI_Number').val(item);
        $tr.find('.JIDNI_BCH_WH_Name').val(b.warehouseCode);
        $tr.find('.JIDNI_BCH_BatchDate').val(JOFmtDate(b.batchDate));
        $tr.find('.JIDNI_BCH_BatchNo').val(b.batchNo);
        $tr.find('.JIDNI_BCH_QtyAvailable').val(QtyDecimalRupees(b.availableQty, 3));
        $tr.find('.JIDNI_BCH_QtyReserved').val(QtyDecimalRupees(b.reservedQty, 3));
        $tr.find('.JIDNI_BCH_QtyInvoice').val(QtyDecimalRupees(qty, 3));
        $tr.find('.JIDNI_BCH_BatchUnitPrice').val(DecimalIndianRupees(price));
        $tr.find('.JIDNI_BCH_BatchValue').val(DecimalIndianRupees(JONum(qty) * JONum(price)));
        $body.append($tr);
    });

    if (!resp.length) $body.append(JO_EMPTY_BATCH_ROW);
    CalculateBatchFooter();
    ApplyBatchFieldWidths('#DeliveryNoteBatchList');
}

function JOBindOtherBatch(resp) {
    var $body = $('#DeliveryNoteOtherBatchTableBody');
    $body.find('.DeliveryNoteOtherBatchRow').remove();

    $.each(resp, function (i, d) {
        var $tr = $('#DeliveryNoteOtherBatchTemplateRow').clone().removeAttr('id').removeAttr('style').addClass('DeliveryNoteOtherBatchRow JOHasData');
        $tr.find('.JIDNI_BCH_Number').val(d.lineBatch_Number);
        $tr.find('.JIDNI_BCH_WH_Number').val(d.fromWarehouse);
        $tr.find('.JIDNI_BCH_WH_Name').val(d.warehouseCode);
        $tr.find('.JIDNI_BCH_BatchDate').val(JOFmtDate(d.batchDate));
        $tr.find('.JIDNI_BCH_BatchNo').val(d.batchNo);
        $tr.find('.JIDNI_BCH_AvailableQty').val(d.availableQty);
        $tr.find('.JIDNI_BCH_BatchUnitPrice').val(d.batchUnitPrice);
        $tr.find('.JIDNI_BCH_BatchValue').val(d.batchValue);
        $body.append($tr);
    });

    if (!resp.length) {
        $body.append('<tr class="DeliveryNoteOtherBatchRow"><td style="height:25px;"></td><td></td><td></td><td></td><td></td><td></td></tr>');
    }
    ApplyOtherBatchFieldWidths();
    CalculateOtherBatchFooter();
}

function JOLoadOtherBatch(item, wh, gridIndex) {
    $.ajax({
        url: JOCNV.urls.batch, type: 'GET', cache: false,
        data: { ItemNumber: item, Warehouse: wh, ItemGridIndex: gridIndex, OtherWarehouses: true },
        success: function (resp) { JOBindOtherBatch(resp || []); },
        error: function (xhr) { console.log(xhr.responseText); JOBindOtherBatch([]); }
    });
}

// ---- "All WH" tab of the Production (P) / Scrap (S) popups: item's batches in ALL warehouses ----
function JOCalcAllWHFooter(sfx) {
    var q = 0, v = 0, $rows = $('#AllWHBatchTableBody_' + sfx + ' .AllWHBatchRow');
    $rows.each(function () {
        q += JONum($(this).find('.JIDNI_BCH_AvailableQty').val());
        v += JONum($(this).find('.JIDNI_BCH_BatchValue').val());
    });
    $('#TotalBatchQtyAll_' + sfx).val(QtyDecimalRupees(q, 3));
    $('#TotalBatchValueAll_' + sfx).val(DecimalIndianRupees(v));
    var $foot = $('#AllWHBatchList_' + sfx + ' tfoot');
    if ($rows.filter('.JOHasData').length) $foot.show(); else $foot.hide();
}

function JOApplyAllWHWidths(sfx) {
    JOFitCols('#AllWHBatchList_' + sfx, '#AllWHBatchTableBody_' + sfx, '#AllWHBatchTemplateRow_' + sfx, 'AllWHBatchRow', [
        { cls: '.JIDNI_BCH_WH_Name', min: 10, max: 25, align: 'left' },
        { cls: '.JIDNI_BCH_BatchDate', min: 10, max: 10, align: 'center' },
        { cls: '.JIDNI_BCH_BatchNo', min: 20, max: 50, align: 'left' },
        { cls: '.JIDNI_BCH_AvailableQty', min: 10, max: 20, align: 'right' },
        { cls: '.JIDNI_BCH_BatchUnitPrice', min: 11, max: 20, align: 'right' },
        { cls: '.JIDNI_BCH_BatchValue', min: 13, max: 25, align: 'right' }
    ]);
}

function JOBindAllWH(sfx, resp) {
    var $body = $('#AllWHBatchTableBody_' + sfx);
    $body.find('.AllWHBatchRow').remove();

    $.each(resp, function (i, d) {
        var $tr = $('#AllWHBatchTemplateRow_' + sfx).clone().removeAttr('id').removeAttr('style').addClass('AllWHBatchRow JOHasData');
        $tr.find('.JIDNI_BCH_WH_Number').val(d.fromWarehouse);
        $tr.find('.JIDNI_BCH_WH_Name').val(d.warehouseCode);
        $tr.find('.JIDNI_BCH_BatchDate').val(d.batchDate);
        $tr.find('.JIDNI_BCH_BatchNo').val(d.batchNo);
        $tr.find('.JIDNI_BCH_AvailableQty').val(QtyDecimalRupees(d.availableQty, 3));
        $tr.find('.JIDNI_BCH_BatchUnitPrice').val(DecimalIndianRupees(d.batchUnitPrice));
        $tr.find('.JIDNI_BCH_BatchValue').val(DecimalIndianRupees(JONum(d.availableQty) * JONum(d.batchUnitPrice)));
        $body.append($tr);
    });

    if (!resp.length) $body.append('<tr class="AllWHBatchRow"><td style="height:25px;"></td><td></td><td></td><td></td><td></td><td></td></tr>');
    JOApplyAllWHWidths(sfx);
    JOCalcAllWHFooter(sfx);
}

// Warehouse = 0 + OtherWarehouses = true  =>  SP returns the item's batches of every warehouse
function JOLoadAllWH(sfx, item) {
    $.ajax({
        url: JOCNV.urls.batch, type: 'GET', cache: false,
        data: { ItemNumber: item, Warehouse: 0, ItemGridIndex: -1, OtherWarehouses: true },
        success: function (resp) { JOBindAllWH(sfx, resp || []); },
        error: function (xhr) { console.log(xhr.responseText); JOBindAllWH(sfx, []); }
    });
}
//#endregion

//#region OPEN POPUP -------------------------------------------------------------
$(document).on('click', '.ItemBatch_F', function (e) {
    e.preventDefault();

    var $checked = JOCheckedRow('C');
    if ($checked.length === 0) { showAlert('Please select a Consumption row.'); return false; }
    if ($checked.length > 1) { showAlert('Please select only one row.'); return false; }

    var $row = $checked.first(), rid = JOEnsureRowId($row);
    var item = $row.find('.JIDNI_Item_Number').val();
    var wh = $row.find('.JIDNI_WH_Number').val();
    var qty = $row.find('.JIDNI_Qty').val();

    if (!item || !wh || wh === '0' || JONum(qty) <= 0) {
        showAlert('Select the Item and Warehouse and enter the Qty first.', $row.find('.JIDNI_Item_Code'));
        return false;
    }

    JOCNV.cur.C = $row;
    var gridIndex = JOrows('C').index($row);
    $('#BatchPopupQty').text(qty);
    $('#DeliveryNoteBatchTableBody').find('.DeliveryNoteBatchRow').remove();

    $.ajax({
        url: JOCNV.urls.batch, type: 'GET', cache: false,
        data: { ItemNumber: item, Warehouse: wh, ItemGridIndex: gridIndex, OtherWarehouses: false },
        success: function (resp) {
            JOBindConsBatch(rid, item, resp || []);
            JOLoadOtherBatch(item, wh, gridIndex);
            JOModal('#DeliveryNoteBatchModal', 'show');
        },
        error: function (xhr) {
            console.log(xhr.responseText);
            showAlert('Error loading batch details.');
        }
    });
});

$('#DeliveryNoteBatchModal').on('shown.bs.modal', function () {
    setTimeout(function () {
        var input = document.querySelector('#DeliveryNoteBatchTableBody tr.DeliveryNoteBatchRow:not(.JOEmpty) .JIDNI_BCH_QtyInvoice');
        if (input) { input.focus(); input.select(); }
    }, 200);
});

$(document).on('click', '#DeliveryNoteBatchClose', function () { JOModal('#DeliveryNoteBatchModal', 'hide'); });
//#endregion

//#region QTY INPUT --------------------------------------------------------------
$(document).on('input', '#DeliveryNoteBatchTableBody .JIDNI_BCH_QtyInvoice', function () {
    var $tr = $(this).closest('tr');
    var avail = JONum($tr.find('.JIDNI_BCH_QtyAvailable').val());
    var reserved = JONum($tr.find('.JIDNI_BCH_QtyReserved').val());
    var balance = avail - reserved;
    var qty = JONum(this.value);

    if (qty > balance) {
        var max = Math.max(0, Math.floor(balance));
        alert('Consumed Qty (' + qty + ') cannot be greater than Available Qty - Reserved Qty (' + balance + ').\nIt will be reset to maximum allowed: ' + max);
        this.value = max;
        qty = max;
        $(this).focus().select();
    }
    var price = JONum($tr.find('.JIDNI_BCH_BatchUnitPrice').val());
    $tr.find('.JIDNI_BCH_BatchValue').val(DecimalIndianRupees(qty * price));

    CalculateBatchFooter();
    ApplyBatchFieldWidths('#DeliveryNoteBatchList');
});

$(document).on('click', '#DeliveryNoteBatchList input', function (e) {
    e.stopPropagation();
    var input = this;
    input.focus();
    setTimeout(function () { input.select(); }, 10);
});
//#endregion

//#region SAVE POPUP -------------------------------------------------------------
function JOCollectConsEntries() {
    var list = [];
    $('#DeliveryNoteBatchTableBody tr.DeliveryNoteBatchRow').each(function () {
        var $t = $(this), ref = $t.find('.JIDNI_BCH_Number').val();
        if (!ref) return;                                   // placeholder row
        list.push({
            ref: parseInt(ref, 10) || 0,
            whNo: $t.find('.JIDNI_BCH_WH_Number').val(),
            whName: $t.find('.JIDNI_BCH_WH_Name').val(),
            date: $t.find('.JIDNI_BCH_BatchDate').val(),
            no: $t.find('.JIDNI_BCH_BatchNo').val(),
            avail: JONum($t.find('.JIDNI_BCH_QtyAvailable').val()),
            reserved: JONum($t.find('.JIDNI_BCH_QtyReserved').val()),
            qty: JONum($t.find('.JIDNI_BCH_QtyInvoice').val()),
            price: JONum($t.find('.JIDNI_BCH_BatchUnitPrice').val()),
            value: JONum($t.find('.JIDNI_BCH_BatchValue').val())
        });
    });
    return list;
}

function CloseDeliveryNoteBatchModal(rid) {
    $('#DeliveryNoteBatchModal').one('hidden.bs.modal', function () {
        setTimeout(function () { JOFocusQty('C', rid); }, 300);
    });
    JOModal('#DeliveryNoteBatchModal', 'hide');
}

$(document).on('click', '#SaveBatchButton', function (e) {
    e.preventDefault();
    var $row = JOCNV.cur.C;
    if (!$row || !$row.length) return;

    var rid = JOEnsureRowId($row);
    var entries = JOCollectConsEntries();
    var total = 0;
    entries.forEach(function (b) { total += b.qty; });
    var itemQty = JONum($('#BatchPopupQty').text());

    if (Math.abs(total - itemQty) > 0.0001) {
        alert('Qty Mismatch !');
        JOCNV.draft.C[rid] = entries;            // keep what was typed; popup re-opens with it
        CloseDeliveryNoteBatchModal(rid);
        return false;
    }

    delete JOCNV.draft.C[rid];
    JOCNV.batch.C[rid] = entries.filter(function (b) { return b.qty > 0; });
    JOSyncTemp();
    CloseDeliveryNoteBatchModal(rid);
});
//#endregion

//#region COLUMN WIDTHS (popup tables) --------------------------------------------
function JOFitCols(containerSel, bodySel, tmplSel, rowCls, fields) {
    if (typeof chToPx !== 'function' || typeof getTextWidth !== 'function') return;
    var $c = $(containerSel);

    fields.forEach(function (f) {
        var $controls = $c.find(bodySel + ' > ' + tmplSel + ' ' + f.cls + ', ' + bodySel + ' > tr.' + rowCls + ' ' + f.cls);
        if (!$controls.length) return;

        var sample = $controls.first()[0];
        var minW = chToPx(f.min, sample);
        var maxW = f.max != null ? chToPx(f.max, sample) : Number.MAX_SAFE_INTEGER;
        var need = minW;

        $controls.each(function () {
            var text = this.tagName === 'SELECT' ? ((this.options[this.selectedIndex] || {}).text || '') : (this.value || '');
            need = Math.max(need, getTextWidth(JOTrim(text), this));
        });
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
            var th = $c.find('thead th').eq(td.cellIndex)[0];
            if (th) {
                th.style.setProperty('width', need + 'px', 'important');
                th.style.setProperty('min-width', minW + 'px', 'important');
                th.style.setProperty('max-width', maxW + 'px', 'important');
            }
        });
    });
}

function ApplyBatchFieldWidths(container) {
    JOFitCols(container || '#DeliveryNoteBatchList', '#DeliveryNoteBatchTableBody', '#DeliveryNoteBatchTemplateRow', 'DeliveryNoteBatchRow', [
        { cls: '.JIDNI_BCH_WH_Name', min: 10, max: 25, align: 'left' },
        { cls: '.JIDNI_BCH_BatchDate', min: 10, max: 10, align: 'center' },
        { cls: '.JIDNI_BCH_BatchNo', min: 20, max: 50, align: 'left' },
        { cls: '.JIDNI_BCH_QtyAvailable', min: 10, max: 20, align: 'center' },
        { cls: '.JIDNI_BCH_QtyReserved', min: 10, max: 20, align: 'center' },
        { cls: '.JIDNI_BCH_QtyInvoice', min: 10, max: 20, align: 'center' },
        { cls: '.JIDNI_BCH_BatchUnitPrice', min: 11, max: 20, align: 'right' },
        { cls: '.JIDNI_BCH_BatchValue', min: 13, max: 25, align: 'right' }
    ]);
}

function ApplyOtherBatchFieldWidths(container) {
    JOFitCols(container || '#DeliveryNoteOtherBatchList', '#DeliveryNoteOtherBatchTableBody', '#DeliveryNoteOtherBatchTemplateRow', 'DeliveryNoteOtherBatchRow', [
        { cls: '.JIDNI_BCH_WH_Name', min: 10, max: 25, align: 'left' },
        { cls: '.JIDNI_BCH_BatchDate', min: 10, max: 10, align: 'center' },
        { cls: '.JIDNI_BCH_BatchNo', min: 20, max: 50, align: 'left' },
        { cls: '.JIDNI_BCH_AvailableQty', min: 10, max: 20, align: 'right' },
        { cls: '.JIDNI_BCH_BatchUnitPrice', min: 11, max: 20, align: 'right' },
        { cls: '.JIDNI_BCH_BatchValue', min: 13, max: 25, align: 'right' }
    ]);
}
//#endregion
