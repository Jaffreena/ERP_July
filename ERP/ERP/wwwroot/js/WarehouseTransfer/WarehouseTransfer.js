/* ==========================================================================
   WarehouseTransfer.js   (wwwroot/js/WarehouseTransfer/WarehouseTransfer.js)
   Warehouse Transfer - CREATE page
   Header | Journal No | Item grid (From WH / To WH) | Batch popup | Validation | Save
   --------------------------------------------------------------------------
   Load order (Index.cshtml):
     common_itemtable_functions.js, ItemGrid.js, NumberFormat.js,
     JWC_ItemSearch_Functionality.js, WarehouseTransfer.js, Header.js
   ========================================================================== */

var WHT = {
    urls: {
        nextNumber: '/production/transactions/warehouse-transfer/next-number',
        save: '/production/transactions/warehouse-transfer/save',
        batch: '/production/transactions/warehouse-transfer/batch',
        tempSave: '/production/transactions/warehouse-transfer/temp-save',
        tempClear: '/production/transactions/warehouse-transfer/temp-clear'
    },

    numberOk: false,
    manualNo: false,
    seq: 0,
    batch: {},          // rowid -> saved batch entries
    draft: {},          // rowid -> unsaved (mismatch) entries
    cur: null,          // row whose batch popup is open
    saving: false,
    saved: false,

    sec: { tbl: '#ItemTable', body: '#TableBody_F', tmp: '#TempRow', add: '#AddRowButton', rem: '#RemoveItemRowButton', tot: '#TotalQty_F' }
};

var WHT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// column widths of the item grid (used by ApplyFieldWidths)
window.WarehouseTransferFields = window.WarehouseTransferFields || [
    { cls: '.JIDNI_Item_Code', min: 12, max: 25, align: 'left' },
    { cls: '.JIDNI_Item_Description', min: 20, max: 50, align: 'left' },
    { cls: '.JIDNI_OuterDia', min: 8, max: 15, align: 'right' },
    { cls: '.JIDNI_Thickness', min: 8, max: 15, align: 'right' },
    { cls: '.JIDNI_Length', min: 8, max: 15, align: 'right' },
    { cls: '.JIDNI_MaterialGrade', min: 10, max: 20, align: 'left' },
    { cls: '.JIDNI_ItemGroup', min: 10, max: 25, align: 'left' },
    { cls: '.JIDNI_FromWH_Number', min: 10, max: 25, align: 'left' },
    { cls: '.JIDNI_UoM_Number', min: 6, max: 12, align: 'center' },
    { cls: '.JIDNI_Qty', min: 10, max: 20, align: 'right' },
    { cls: '.JIDNI_ToWH_Number', min: 10, max: 25, align: 'left' }
];

//#region COMMON HELPERS --------------------------------------------------------
function removeCommas(value) {
    return (value === null || value === undefined ? '' : value).toString().replace(/,/g, '');
}
function WHTrim(v) { return (v === null || v === undefined ? '' : String(v)).trim(); }
function WHNum(value) { return parseFloat(removeCommas(value)) || 0; }

if (typeof formatIndianQty !== 'function') {
    window.formatIndianQty = function (v) {
        return (Number(v) || 0).toLocaleString('en-IN', { maximumFractionDigits: 3 });
    };
}

function DecimalIndianRupees(value) {
    if (value === '' || value === null || value === undefined || isNaN(value)) return '0.00';
    var parts = parseFloat(value).toFixed(2).split('.');
    parts[0] = parts[0].replace(/(\d)(?=(\d\d)+\d$)/g, '$1,');
    return parts.join('.');
}

function QtyDecimalRupees(value, decimalPlaces) {
    if (value === '' || value === null || value === undefined || isNaN(value)) return '0';
    var parts = parseFloat(value).toFixed(decimalPlaces).split('.');
    if (parts.length > 1) {
        parts[1] = parts[1].replace(/0+$/, '');
        if (parts[1].length === 0) parts.pop();
    }
    parts[0] = parts[0].replace(/(\d)(?=(\d\d)+\d$)/g, '$1,');
    return parts.join('.');
}

// "dd-MMM-yyyy" / "dd MMM yyyy" / any parsable date -> LOCAL "yyyy-MM-ddT00:00:00"
function ToLocalDateString(str) {
    if (!str) return null;
    var m = /^(\d{1,2})[- ]([A-Za-z]{3})[- ](\d{4})$/.exec(String(str).trim());
    var d;
    if (m) {
        var mon = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(m[2].toLowerCase());
        d = new Date(+m[3], mon, +m[1]);
    } else {
        d = new Date(str);
    }
    if (isNaN(d.getTime())) return null;
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T00:00:00';
}

function WHFmtDate(str) {                       // -> dd-MMM-yyyy
    var iso = ToLocalDateString(str);
    if (!iso) return '';
    return iso.substr(8, 2) + '-' + WHT_MONTHS[parseInt(iso.substr(5, 2), 10) - 1] + '-' + iso.substr(0, 4);
}

function WHToday() {
    var t = new Date();
    return String(t.getDate()).padStart(2, '0') + '-' + WHT_MONTHS[t.getMonth()] + '-' + t.getFullYear();
}

function WHAjax(opts) {                         // jQuery ajax -> native Promise
    return new Promise(function (resolve, reject) {
        $.ajax(opts).done(resolve).fail(reject);
    });
}

function WHModal(selector, action) {
    var el = document.querySelector(selector);
    if (!el) return;
    var inst = bootstrap.Modal.getOrCreateInstance(el);
    if (action === 'show') inst.show(); else inst.hide();
}

function showAlert(message, focusSelector) {
    $('#AlertMessage').html(message);
    var el = document.getElementById('ModelAlert');
    if (!el) { alert(String(message).replace(/<[^>]*>/g, '')); return; }
    var modal = bootstrap.Modal.getOrCreateInstance(el);
    modal.show();
    if (focusSelector) {
        $(el).off('hidden.bs.modal.whfocus').on('hidden.bs.modal.whfocus', function () {
            $(focusSelector).first().focus();
        });
    }
}

function WHFail(msg, sel) { showAlert(msg, sel); return false; }
//#endregion

//#region ROW HELPERS -----------------------------------------------------------
function WHrows() { return $(WHT.sec.body).children('tr.NewRow'); }

function WHEnsureRowId($row) {
    var id = $row.attr('data-rowid');
    if (!id || id === '1') {
        id = 'r' + (++WHT.seq) + '_' + new Date().getTime();
        $row.attr('data-rowid', id);
    }
    return id;
}

function WHRowByRowId(rid) {
    return WHrows().filter(function () { return $(this).attr('data-rowid') === String(rid); }).first();
}

function WHCheckedRow() {
    return $(WHT.sec.body).find('.CheckItem:checked').closest('tr.NewRow');
}

function WHBatchSum(rid) {
    var list = WHT.batch[rid] || [], sum = 0;
    for (var i = 0; i < list.length; i++) sum += WHNum(list[i].qty);
    return sum;
}

function WHFocusQty(rid) {
    var $q = WHRowByRowId(rid).find('.JIDNI_Qty');
    if ($q.length) { $q.focus(); $q.select(); }
}

function WHTotals() {
    var q = 0;
    WHrows().each(function () { q += WHNum($(this).find('.JIDNI_Qty').val()); });
    $(WHT.sec.tot).val(formatIndianQty(q));
}

function WHRowComplete($r) {
    return !!(WHTrim($r.find('.JIDNI_Item_Code').val()) && $r.find('.JIDNI_Item_Number').val() && WHNum($r.find('.JIDNI_Qty').val()) > 0);
}

function WHResize() {
    if (typeof ApplyFieldWidths !== 'function') return;
    ApplyFieldWidths({ fields: window.WarehouseTransferFields, container: WHT.sec.tbl, tempRow: WHT.sec.tmp, tableBody: WHT.sec.body, searchTable: '#tblsearch' });
}
//#endregion

//#region ROW ADD / REMOVE ------------------------------------------------------
function WHAddRow(silent) {
    var $last = WHrows().last();
    if ($last.length && !silent && !WHRowComplete($last)) {
        showAlert('Please fill Item Code and Qty before adding a new row.', $last.find('.JIDNI_Item_Code'));
        return null;
    }
    var $new = $(WHT.sec.tmp).clone();
    $new.removeAttr('id').removeAttr('style').addClass('NewRow').attr('data-rowid', 'r' + (++WHT.seq) + '_' + new Date().getTime());
    $new.find('input, select').each(function () {
        var el = $(this);
        if (el.attr('type') === 'checkbox') el.prop('checked', false);
        else if (el.is('select')) el.prop('selectedIndex', 0);
        else el.val('');
    });
    $(WHT.sec.body).append($new);
    $new.data('witem', '').data('wfrom', '');
    WHTotals();
    WHResize();
    return $new;
}

function WHRemoveRow() {
    var $checked = WHrows().has('.CheckItem:checked');
    if ($checked.length === 0) { showAlert('Please select a row.'); return; }
    if ($checked.length > 1) { showAlert('Please select only one row.'); return; }
    var rid = WHEnsureRowId($checked);
    delete WHT.batch[rid];
    delete WHT.draft[rid];
    $checked.remove();
    if (WHrows().length === 0) WHAddRow(true);
    WHTotals();
    WHSyncTemp();                                   // row positions changed
}
//#endregion

//#region ROW WATCHER (ItemGrid.js sets Item / UoM in code, so no change event) ---
function WHWatchRows() {
    WHrows().each(function () {
        var $r = $(this), rid = WHEnsureRowId($r);
        var item = $r.find('.JIDNI_Item_Number').val() || '';
        var prevItem = $r.data('witem');

        if (prevItem === undefined) {                       // first sight of the row
            $r.data('witem', item).data('wfrom', $r.find('.JIDNI_FromWH_Number').val() || '');
            return;
        }

        if (prevItem !== item) {                            // item changed -> old batches invalid
            $r.data('witem', item);
            if (WHT.batch[rid] || WHT.draft[rid]) {
                delete WHT.batch[rid];
                delete WHT.draft[rid];
                WHSyncTemp();
            }
        }

        var from = $r.find('.JIDNI_FromWH_Number').val() || '';
        if ($r.data('wfrom') !== from) {                    // From WH changed -> batches belong to item + From WH
            $r.data('wfrom', from);
            if ((WHT.batch[rid] || []).length) {
                delete WHT.batch[rid];
                delete WHT.draft[rid];
                WHSyncTemp();
                showAlert('From Warehouse changed - please enter the batch details again for this row.');
            }
        }
    });
}
//#endregion

//#region ITEM GRID EVENTS ------------------------------------------------------
function WHBindGrid() {
    var s = WHT.sec;

    // Qty: digits only, totals, auto add row
    $(document).on('input', s.body + ' .JIDNI_Qty', function () {
        var cleaned = this.value.replace(/[^0-9]/g, '');
        if (cleaned !== this.value) this.value = cleaned;
    });
    $(document).on('input change', s.body + ' .JIDNI_Qty', function () {
        var $r = $(this).closest('tr');
        WHTotals();
        if (WHRowComplete($r) && $r.is(WHrows().last())) WHAddRow(true);
    });
    $(document).on('focusout', s.body + ' .JIDNI_Qty', function () {
        var v = WHNum(this.value);
        $(this).attr('data-value', v).val(v === 0 ? '' : formatIndianQty(v));
    });

    // From WH and To WH must be different
    $(document).on('change', s.body + ' .JIDNI_ToWH_Number, ' + s.body + ' .JIDNI_FromWH_Number', function () {
        var $r = $(this).closest('tr');
        var f = $r.find('.JIDNI_FromWH_Number').val(), t = $r.find('.JIDNI_ToWH_Number').val();
        if (f && t && f === t) {
            $(this).val('');
            showAlert('From Warehouse and To Warehouse should not be same.', this);
        }
    });

    // single row selection
    $(document).on('click', s.tbl + ' tbody tr.NewRow', function (e) {
        if ($(e.target).closest('.CheckItem').length) return;
        $(s.tbl + ' .CheckItem').prop('checked', false);
        $(this).find('.CheckItem').prop('checked', true);
    });
    $(document).on('change', s.tbl + ' .CheckItem', function () {
        if (this.checked) $(s.tbl + ' .CheckItem').not(this).prop('checked', false);
    });

    // click in input = select all
    $(document).on('click', s.tbl + ' input[type=text], ' + s.tbl + ' input:not([type])', function (e) {
        e.stopPropagation();
        var input = this;
        input.focus();
        setTimeout(function () { input.select(); }, 10);
    });

    $(document).on('click', s.add, function () { WHAddRow(false); });
    $(document).on('click', s.rem, function () { WHRemoveRow(); });

    $(document).on('keyup', s.tbl + ' input', WHResize);
    $(document).on('change', s.tbl + ' select', WHResize);
}

// Item_Code keydown / focusout (item search pane)
$(document).on('keydown', '.JIDNI_Item_Code', function (e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') return;
    var rows = $('#RightPane_Item .search-results tbody tr');
    if (e.key === 'Enter' && WHTrim($(this).val()) === '' && rows.length > 0 &&
        !rows.filter('.current-row, .match-row').length) {
        e.preventDefault();
        isSelectingItem = true;
        rows.first().trigger('mousedown');
        return;
    }
    HandleSearchKeyDown(e, this, '#RightPane_Item', '.search-results', '#ItemMessage', '#Header_WHTH_MS_Number');
});

$(document).on('focusout', '.JIDNI_Item_Code', function () {
    if (isSelectingItem) return;
    var input = $(this);
    var rows = $('#RightPane_Item .search-results tbody tr');
    if (WHTrim(input.val()) === '' && rows.length > 0 && !rows.filter('.current-row, .match-row').length) {
        isSelectingItem = true;
        rows.first().trigger('mousedown');
        return;
    }
    HandleSearchSelection(input, rows, '#ItemMessage', '#RightPane_Item', '#RightPane_Item .search-results');
});

// keep the Qty already typed when only the item is re-selected on a row
var ItemCodeFocusRow = null;
$(document).on('focusin', '.JIDNI_Item_Code', function () {
    if (!WHTrim($('#Header_WHTH_MS_Number').val())) {
        $(this).blur();
        showAlert('Material Segregation is required', '#Header_WHTH_MS_Number');
        return;
    }
    ItemCodeFocusRow = $(this).closest('tr');
    ItemCodeFocusRow.data('preserve-qty', ItemCodeFocusRow.find('.JIDNI_Qty').val());
});
$(document).on('mousedown', '#RightPane_Item .search-results tbody tr', function () {
    var row = ItemCodeFocusRow;
    if (!row || !row.length) return;
    setTimeout(function () {
        var q = row.data('preserve-qty');
        if (q !== undefined) {
            row.find('.JIDNI_Qty').val(q);
            row.removeData('preserve-qty');
        }
    }, 0);
});

$(window).on('load', function () { setTimeout(WHResize, 200); });
//#endregion

//#region JOURNAL NO ------------------------------------------------------------
function WHGetNextNumber() {
    var iso = ToLocalDateString($('#Header_WHTH_Date').val());
    var $no = $('#Header_WHTH_JournalNo');
    if (!iso) return;

    $.ajax({
        url: WHT.urls.nextNumber, type: 'GET', cache: false, data: { WHTDate: iso.substring(0, 10) },
        success: function (r) {
            WHT.manualNo = !!(r && r.manual);
            $no.prop('readonly', !WHT.manualNo);
            if (!r || !r.success) {
                WHT.numberOk = false;
                $no.val('');
                showAlert((r && r.message) || 'Warehouse Transfer Journal Number is not configured for the selected date.');
                return;
            }
            WHT.numberOk = true;
            $no.val(r.number || '');
            if (typeof fitInputWidth === 'function') fitInputWidth($no[0], 20, 30);
        },
        error: function () {
            WHT.numberOk = false;
            showAlert('Unable to get the Warehouse Transfer Journal Number.');
        }
    });
}
$(document).on('change', '#Header_WHTH_Date', WHGetNextNumber);
//#endregion

//#region TEMP RESERVATION SYNC -------------------------------------------------
// Rebuilds the user's temp reservation from the saved batches (row position = DBCH_Index).
var WHTempQueue = Promise.resolve();

function WHSyncTemp() {
    var list = [];
    WHrows().each(function (i) {
        var $r = $(this), rid = WHEnsureRowId($r);
        var item = parseInt($r.find('.JIDNI_Item_Number').val(), 10) || 0;
        (WHT.batch[rid] || []).forEach(function (b) {
            if (WHNum(b.qty) <= 0) return;
            list.push({
                DBCH_Index: i,
                DBCH_Item_Number: item,
                DBCH_DBCH_Number: parseInt(b.ref, 10) || 0,
                DBCH_Warehouse_Number: parseInt(b.whNo, 10) || 0,
                DBCH_Date: ToLocalDateString(b.date),
                DBCH_No: b.no || '',
                DBCH_Qty: WHNum(b.qty),
                DBCH_UnitPrice: WHNum(b.price),
                DBCH_Value: WHNum(b.value),
                CreatorCode: 0
            });
        });
    });

    WHTempQueue = WHTempQueue.then(function () {
        return WHAjax({ url: WHT.urls.tempClear, type: 'POST' });
    }).then(function () {
        if (!list.length) return null;
        return WHAjax({ url: WHT.urls.tempSave, type: 'POST', contentType: 'application/json', data: JSON.stringify(list) });
    }).catch(function (xhr) {
        console.log('temp sync failed', xhr && xhr.responseText);
    });
    return WHTempQueue;
}
//#endregion

//#region BATCH POPUP : footers + bind ------------------------------------------
function CalculateBatchFooter() {
    var q = 0, avail = 0, val = 0, res = 0;
    $('#DeliveryNoteBatchTableBody tr.DeliveryNoteBatchRow').each(function () {
        var $t = $(this);
        q += WHNum($t.find('.JIDNI_BCH_QtyInvoice').val());
        avail += WHNum($t.find('.JIDNI_BCH_QtyAvailable').val());
        res += WHNum($t.find('.JIDNI_BCH_QtyReserved').val());
        val += WHNum($t.find('.JIDNI_BCH_BatchValue').val());
    });
    $('#TotalBatchQty').val(QtyDecimalRupees(q, 3));
    $('#TotalBatchValue').val(DecimalIndianRupees(val));
    $('#TotalAvailableQty').val(QtyDecimalRupees(avail, 3));
    $('#TotalReservedQty').val(QtyDecimalRupees(res, 3));
}

function CalculateOtherBatchFooter() {
    var q = 0, v = 0, $rows = $('#DeliveryNoteOtherBatchTableBody .DeliveryNoteOtherBatchRow');
    $rows.each(function () {
        q += WHNum($(this).find('.JIDNI_BCH_AvailableQty').val());
        v += WHNum($(this).find('.JIDNI_BCH_BatchValue').val());
    });
    $('#TotalBatchQtyOther').val(q.toFixed(2));
    $('#TotalBatchValueOther').val(v.toFixed(2));
    var $foot = $('#DeliveryNoteOtherBatchList tfoot');
    if ($rows.filter('.WHHasData').length) $foot.show(); else $foot.hide();
}

var WH_EMPTY_BATCH_ROW = '<tr class="DeliveryNoteBatchRow WHEmpty"><td style="height:25px;"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';

// From Warehouse tab (qty entry)
function WHBindBatch(rid, item, toWhName, resp) {
    var $body = $('#DeliveryNoteBatchTableBody');
    $body.find('.DeliveryNoteBatchRow').remove();

    var saved = {}, draft = {};
    (WHT.batch[rid] || []).forEach(function (b) { saved[b.ref] = b; });
    (WHT.draft[rid] || []).forEach(function (b) { draft[b.ref] = b; });

    $.each(resp, function (i, b) {
        var ref = b.lineBatch_Number;
        var qty = draft[ref] !== undefined ? draft[ref].qty : (saved[ref] !== undefined ? saved[ref].qty : 0);
        var price = b.batchUnitPrice || 0;

        var $tr = $('#DeliveryNoteBatchTemplateRow').clone().removeAttr('id').removeAttr('style').addClass('DeliveryNoteBatchRow');
        $tr.find('.JIDNI_BCH_Number').val(ref);
        $tr.find('.JIDNI_BCH_WH_Number').val(b.fromWarehouse);
        $tr.find('.JIDNI_BCH_JIDNI_Number').val(item);
        $tr.find('.JIDNI_BCH_WH_Name').val(b.warehouseCode);
        $tr.find('.JIDNI_BCH_BatchDate').val(WHFmtDate(b.batchDate));
        $tr.find('.JIDNI_BCH_BatchNo').val(b.batchNo);
        $tr.find('.JIDNI_BCH_QtyAvailable').val(QtyDecimalRupees(b.availableQty, 3));
        $tr.find('.JIDNI_BCH_QtyReserved').val(QtyDecimalRupees(b.reservedQty, 3));
        $tr.find('.JIDNI_BCH_QtyInvoice').val(QtyDecimalRupees(qty, 3));
        $tr.find('.JIDNI_BCH_BatchUnitPrice').val(DecimalIndianRupees(price));
        $tr.find('.JIDNI_BCH_BatchValue').val(DecimalIndianRupees(WHNum(qty) * WHNum(price)));
        $tr.find('.JIDNI_BCH_ToWH_Name').val(toWhName);
        $body.append($tr);
    });

    if (!resp.length) $body.append(WH_EMPTY_BATCH_ROW);
    CalculateBatchFooter();
    ApplyBatchFieldWidths('#DeliveryNoteBatchList');
}

// Other Warehouses tab (view only)
function WHBindOtherBatch(resp) {
    var $body = $('#DeliveryNoteOtherBatchTableBody');
    $body.find('.DeliveryNoteOtherBatchRow').remove();

    $.each(resp, function (i, d) {
        var $tr = $('#DeliveryNoteOtherBatchTemplateRow').clone().removeAttr('id').removeAttr('style').addClass('DeliveryNoteOtherBatchRow WHHasData');
        $tr.find('.JIDNI_BCH_Number').val(d.lineBatch_Number);
        $tr.find('.JIDNI_BCH_WH_Number').val(d.fromWarehouse);
        $tr.find('.JIDNI_BCH_WH_Name').val(d.warehouseCode);
        $tr.find('.JIDNI_BCH_BatchDate').val(WHFmtDate(d.batchDate));
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

function WHLoadOtherBatch(item, wh, gridIndex) {
    $.ajax({
        url: WHT.urls.batch, type: 'GET', cache: false,
        data: { ItemNumber: item, Warehouse: wh, ItemGridIndex: gridIndex, OtherWarehouses: true },
        success: function (resp) { WHBindOtherBatch(resp || []); },
        error: function (xhr) { console.log(xhr.responseText); WHBindOtherBatch([]); }
    });
}
//#endregion

//#region BATCH POPUP : open / qty / save ---------------------------------------
$(document).on('click', '.ItemBatch_F', function (e) {
    e.preventDefault();

    var $checked = WHCheckedRow();
    if ($checked.length === 0) { showAlert('Please select a row.'); return false; }
    if ($checked.length > 1) { showAlert('Please select only one row.'); return false; }

    var $row = $checked.first(), rid = WHEnsureRowId($row);
    var item = $row.find('.JIDNI_Item_Number').val();
    var from = $row.find('.JIDNI_FromWH_Number').val();
    var to = $row.find('.JIDNI_ToWH_Number').val();
    var qty = $row.find('.JIDNI_Qty').val();

    if (!item || !from || from === '0' || !to || to === '0' || WHNum(qty) <= 0) {
        showAlert('Select the Item, From Warehouse, To Warehouse and enter the Qty first.', $row.find('.JIDNI_Item_Code'));
        return false;
    }
    if (from === to) { showAlert('From Warehouse and To Warehouse should not be same.', $row.find('.JIDNI_ToWH_Number')); return false; }

    WHT.cur = $row;
    var gridIndex = WHrows().index($row);
    var toWhName = WHTrim($row.find('.JIDNI_ToWH_Number option:selected').text());
    $('#BatchPopupQty').text(qty);
    $('#DeliveryNoteBatchTableBody').find('.DeliveryNoteBatchRow').remove();

    $.ajax({
        url: WHT.urls.batch, type: 'GET', cache: false,
        data: { ItemNumber: item, Warehouse: from, ItemGridIndex: gridIndex, OtherWarehouses: false },
        success: function (resp) {
            WHBindBatch(rid, item, toWhName, resp || []);
            WHLoadOtherBatch(item, from, gridIndex);
            WHModal('#DeliveryNoteBatchModal', 'show');
        },
        error: function (xhr) {
            console.log(xhr.responseText);
            showAlert('Error loading batch details.');
        }
    });
});

$('#DeliveryNoteBatchModal').on('shown.bs.modal', function () {
    setTimeout(function () {
        var input = document.querySelector('#DeliveryNoteBatchTableBody tr.DeliveryNoteBatchRow:not(.WHEmpty) .JIDNI_BCH_QtyInvoice');
        if (input) { input.focus(); input.select(); }
    }, 200);
});

$(document).on('click', '#DeliveryNoteBatchClose', function () { WHModal('#DeliveryNoteBatchModal', 'hide'); });

// qty: digits only, not above Available - Reserved
$(document).on('keypress', '#DeliveryNoteBatchTableBody .JIDNI_BCH_QtyInvoice', function (e) {
    if (e.ctrlKey || e.metaKey) return;
    if (!/[0-9]/.test(String.fromCharCode(e.which ? e.which : e.keyCode))) e.preventDefault();
});

$(document).on('input', '#DeliveryNoteBatchTableBody .JIDNI_BCH_QtyInvoice', function () {
    var c = this.value.replace(/[^0-9]/g, '');
    if (c !== this.value) this.value = c;

    var $tr = $(this).closest('tr');
    var avail = WHNum($tr.find('.JIDNI_BCH_QtyAvailable').val());
    var reserved = WHNum($tr.find('.JIDNI_BCH_QtyReserved').val());
    var balance = avail - reserved;
    var qty = WHNum(this.value);

    if (qty > balance) {
        var max = Math.max(0, Math.floor(balance));
        alert('Qty (' + qty + ') cannot be greater than Available Qty - Reserved Qty (' + balance + ').\nIt will be reset to maximum allowed: ' + max);
        this.value = max;
        qty = max;
        $(this).focus().select();
    }
    var price = WHNum($tr.find('.JIDNI_BCH_BatchUnitPrice').val());
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

function WHCollectEntries() {
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
            avail: WHNum($t.find('.JIDNI_BCH_QtyAvailable').val()),
            reserved: WHNum($t.find('.JIDNI_BCH_QtyReserved').val()),
            qty: WHNum($t.find('.JIDNI_BCH_QtyInvoice').val()),
            price: WHNum($t.find('.JIDNI_BCH_BatchUnitPrice').val()),
            value: WHNum($t.find('.JIDNI_BCH_BatchValue').val())
        });
    });
    return list;
}

function CloseDeliveryNoteBatchModal(rid) {
    $('#DeliveryNoteBatchModal').one('hidden.bs.modal', function () {
        setTimeout(function () { WHFocusQty(rid); }, 300);
    });
    WHModal('#DeliveryNoteBatchModal', 'hide');
}

$(document).on('click', '#SaveBatchButton', function (e) {
    e.preventDefault();
    var $row = WHT.cur;
    if (!$row || !$row.length) return;

    var rid = WHEnsureRowId($row);
    var entries = WHCollectEntries();
    var total = 0;
    entries.forEach(function (b) { total += b.qty; });
    var itemQty = WHNum($('#BatchPopupQty').text());

    if (Math.abs(total - itemQty) > 0.0001) {
        alert('Qty Mismatch !');
        WHT.draft[rid] = entries;                // keep what was typed; popup re-opens with it
        CloseDeliveryNoteBatchModal(rid);
        return false;
    }

    delete WHT.draft[rid];
    WHT.batch[rid] = entries.filter(function (b) { return b.qty > 0; });
    WHSyncTemp();
    CloseDeliveryNoteBatchModal(rid);
});
//#endregion

//#region BATCH POPUP : column widths -------------------------------------------
function WHFitCols(containerSel, bodySel, tmplSel, rowCls, fields) {
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
            need = Math.max(need, getTextWidth(WHTrim(text), this));
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
    WHFitCols(container || '#DeliveryNoteBatchList', '#DeliveryNoteBatchTableBody', '#DeliveryNoteBatchTemplateRow', 'DeliveryNoteBatchRow', [
        { cls: '.JIDNI_BCH_WH_Name', min: 10, max: 25, align: 'left' },
        { cls: '.JIDNI_BCH_BatchDate', min: 10, max: 10, align: 'center' },
        { cls: '.JIDNI_BCH_BatchNo', min: 20, max: 50, align: 'left' },
        { cls: '.JIDNI_BCH_QtyAvailable', min: 10, max: 20, align: 'center' },
        { cls: '.JIDNI_BCH_QtyReserved', min: 10, max: 20, align: 'center' },
        { cls: '.JIDNI_BCH_QtyInvoice', min: 10, max: 20, align: 'center' },
        { cls: '.JIDNI_BCH_BatchUnitPrice', min: 11, max: 20, align: 'right' },
        { cls: '.JIDNI_BCH_BatchValue', min: 13, max: 25, align: 'right' },
        { cls: '.JIDNI_BCH_ToWH_Name', min: 10, max: 25, align: 'left' }
    ]);
}

function ApplyOtherBatchFieldWidths(container) {
    WHFitCols(container || '#DeliveryNoteOtherBatchList', '#DeliveryNoteOtherBatchTableBody', '#DeliveryNoteOtherBatchTemplateRow', 'DeliveryNoteOtherBatchRow', [
        { cls: '.JIDNI_BCH_WH_Name', min: 10, max: 25, align: 'left' },
        { cls: '.JIDNI_BCH_BatchDate', min: 10, max: 10, align: 'center' },
        { cls: '.JIDNI_BCH_BatchNo', min: 20, max: 50, align: 'left' },
        { cls: '.JIDNI_BCH_AvailableQty', min: 10, max: 20, align: 'right' },
        { cls: '.JIDNI_BCH_BatchUnitPrice', min: 11, max: 20, align: 'right' },
        { cls: '.JIDNI_BCH_BatchValue', min: 13, max: 25, align: 'right' }
    ]);
}
//#endregion

//#region VALIDATION ------------------------------------------------------------
function WHValidateHeader() {
    var v = function (id) { return WHTrim($('#' + id).val()); };
    if (!WHT.manualNo && !WHT.numberOk)
        return WHFail('Warehouse Transfer Journal Number is not configured for the selected date.', '#Header_WHTH_Date');
    if (v('Header_WHTH_JournalNo') === '') return WHFail('Journal No. is required', '#Header_WHTH_JournalNo');
    if (v('Header_WHTH_Date') === '') return WHFail('Date is required', '#Header_WHTH_Date');
    var ms = v('Header_WHTH_MS_Number');
    if (ms === '' || ms === '0') return WHFail('Material Segregation is required', '#Header_WHTH_MS_Number');
    return true;
}

function WHValidateGrid() {
    var ok = true, count = 0;

    WHrows().each(function (i) {
        var $r = $(this), rid = WHEnsureRowId($r);
        var code = WHTrim($r.find('.JIDNI_Item_Code').val());
        var qty = WHNum($r.find('.JIDNI_Qty').val());
        if (!code && !qty) return;                                  // empty row

        count++;
        var n = ' (row ' + (i + 1) + ')';
        var from = $r.find('.JIDNI_FromWH_Number').val(), to = $r.find('.JIDNI_ToWH_Number').val();
        var uom = $r.find('.JIDNI_UoM_Number').val();

        if (!code || !$r.find('.JIDNI_Item_Number').val()) ok = WHFail('Item Code is required' + n, $r.find('.JIDNI_Item_Code'));
        else if (!from || from === '0') ok = WHFail('From Warehouse is required' + n, $r.find('.JIDNI_FromWH_Number'));
        else if (!uom || uom === '0') ok = WHFail('UoM is required' + n, $r.find('.JIDNI_UoM_Number'));
        else if (qty <= 0) ok = WHFail('Qty is required' + n, $r.find('.JIDNI_Qty'));
        else if (!to || to === '0') ok = WHFail('To Warehouse is required' + n, $r.find('.JIDNI_ToWH_Number'));
        else if (from === to) ok = WHFail('From Warehouse and To Warehouse should not be same' + n, $r.find('.JIDNI_ToWH_Number'));
        else if (!(WHT.batch[rid] || []).length) ok = WHFail('Batch details are required' + n, $r.find('.JIDNI_Qty'));
        else if (Math.abs(WHBatchSum(rid) - qty) > 0.0001)
            ok = WHFail('Batch Qty mismatch' + n + ' - batch total ' + formatIndianQty(WHBatchSum(rid)) + ', item Qty ' + formatIndianQty(qty), $r.find('.JIDNI_Qty'));

        if (!ok) return false;
    });

    if (ok && count === 0) ok = WHFail('Please enter at least one item.');
    return ok;
}

function WHValidateAll() { return WHValidateHeader() && WHValidateGrid(); }
//#endregion

//#region SAVE MODEL ------------------------------------------------------------
function WHBuildModel() {
    var model = {
        Header: {
            WHTH_Number: 0,
            WHTH_JournalNo: WHTrim($('#Header_WHTH_JournalNo').val()),
            WHTH_Date: ToLocalDateString($('#Header_WHTH_Date').val()),
            WHTH_MS_Number: parseInt($('#Header_WHTH_MS_Number').val(), 10) || 0
        },
        Items: [], Batches: []
    };

    var idx = 0;
    var I = function ($r, c) { return parseInt($r.find(c).val(), 10) || 0; };

    WHrows().each(function () {
        var $r = $(this);
        if (!WHTrim($r.find('.JIDNI_Item_Code').val()) && !WHNum($r.find('.JIDNI_Qty').val())) return;

        var rid = WHEnsureRowId($r);
        var from = I($r, '.JIDNI_FromWH_Number'), to = I($r, '.JIDNI_ToWH_Number');

        model.Items.push({
            RowIndex: idx,
            WHTI_Item_Number: I($r, '.JIDNI_Item_Number'),
            WHTI_From_WH_Number: from,
            WHTI_UoM_Number: I($r, '.JIDNI_UoM_Number'),
            WHTI_Qty: WHNum($r.find('.JIDNI_Qty').val()),
            WHTI_To_WH_Number: to
        });

        (WHT.batch[rid] || []).forEach(function (b) {
            if (WHNum(b.qty) <= 0) return;
            model.Batches.push({
                WHTI_BCH_WHTI_Number: idx,
                WHTI_BCH_FWH_Number: parseInt(b.whNo, 10) || from,
                WHTI_BCH_BatchDate: ToLocalDateString(b.date),
                WHTI_BCH_BatchNo: b.no || '',
                WHTI_BCH_BatchQty: WHNum(b.qty),
                WHTI_BCH_BatchUnitPrice: WHNum(b.price),
                WHTI_BCH_BatchValue: WHNum(b.value),
                WHTI_BCH_TWH_Number: to,
                WHTI_BCH_RefBatch_Number: parseInt(b.ref, 10) || 0
            });
        });
        idx++;
    });

    return model;
}

function WHSave() {
    if (WHT.saving) return;
    if (!WHValidateAll()) return;

    var model = WHBuildModel();
    var $btn = $('#btnSave');
    WHT.saving = true;
    $btn.prop('disabled', true);

    $.ajax({
        url: WHT.urls.save, type: 'POST', contentType: 'application/json', data: JSON.stringify(model),
        success: function (r) {
            if (r && r.success) {
                WHT.saved = true;
                var el = document.getElementById('ModelAlert');
                if (el) $(el).off('hidden.bs.modal.whfocus').one('hidden.bs.modal', function () { window.location.reload(); });
                showAlert('Record saved. Journal No: <b>' + model.Header.WHTH_JournalNo + '</b>');
                if (!el) window.location.reload();
            } else {
                WHT.saving = false; $btn.prop('disabled', false);
                showAlert((r && r.message) || 'Save failed.');
            }
        },
        error: function (xhr) {
            WHT.saving = false; $btn.prop('disabled', false);
            var msg = (xhr.responseJSON && xhr.responseJSON.message) || 'Save failed.';
            showAlert(msg);
            console.log(xhr.responseText);
        }
    });
}
//#endregion

//#region READY
$(function () {
    if (typeof isSelectingItem === 'undefined') window.isSelectingItem = false;

    WHBindGrid();
    WHrows().each(function () { WHEnsureRowId($(this)); });
    if (WHrows().length === 0) WHAddRow(true);
    WHTotals();

    // header date (flatpickr) + journal no
    var dt = document.getElementById('Header_WHTH_Date');
    if (dt && typeof flatpickr === 'function' && !dt._flatpickr) {
        flatpickr(dt, { dateFormat: 'd-M-Y', altInput: true, altFormat: 'd-M-Y', allowInput: true, defaultDate: new Date() });
    } else if (dt && !dt.value) {
        dt.value = WHToday();
    }
    WHGetNextNumber();

    // item search reads these hidden ids
    function WHSyncMs() {
        var v = $('#Header_WHTH_MS_Number').val() || '0';
        $('#WHT_MS_Number, #JIRNH_MS_Number, #Header_JIDNH_MS_Number').val(v);
    }
    $(document).on('change', '#Header_WHTH_MS_Number', WHSyncMs);
    WHSyncMs();

    if (typeof fitInputWidth === 'function') fitInputWidth('Header_WHTH_JournalNo', 20, 30);
    if (typeof fitInputWidth === 'function') fitInputWidth('Header_WHTH_MS_Number', 20, 30);
    $(document).on('input keyup', '#Header_WHTH_JournalNo', function () { if (typeof fitInputWidth === 'function') fitInputWidth(this, 20, 30); });

    $('#btnSave').on('click', function (e) { e.preventDefault(); WHSave(); return false; });
    $(document).on('click', '#btnClearAll', function () {
        $.post(WHT.urls.tempClear).always(function () { window.location.reload(); });
    });

    // stale temp reservations from an earlier visit
    $.post(WHT.urls.tempClear);
    window.addEventListener('beforeunload', function () {
        if (!WHT.saved && navigator.sendBeacon) navigator.sendBeacon(WHT.urls.tempClear);
    });

    setInterval(WHWatchRows, 300);
});
//#endregion