/* ==========================================================================
   JO_Conversion.js      (wwwroot/js/JO_Conversion/JO_Conversion.js)
   JO Conversion - CREATE page
   Common helpers | Header | Journal No | Consumption + Production + Scrap
   item grids | Kgs calc | Validation | Save
   --------------------------------------------------------------------------
   Load order (Index.cshtml):
     common_itemtable_functions.js, ItemGrid.js, NumberFormat.js,
     JWC_ItemSearch_Functionality.js,
     JO_Conversion.js, JO_Conversion_Batch.js, JO_Conversion_ItemBatch.js,
     Header.js
   ========================================================================== */

var JOCNV = {
    urls: {
        nextNumber: '/joboutward/transactions/conversion/next-number',
        save: '/joboutward/transactions/conversion/save',
        batch: '/joboutward/transactions/conversion/batch',
        tempSave: '/joboutward/transactions/conversion/temp-save',
        tempClear: '/joboutward/transactions/conversion/temp-clear',
        unitConv: '/receiptnote/transactions/receiptnote/get-item-unit-conversion'
    },

    // switches ---------------------------------------------------------------
    useWcWarehouse: true,   // default row Warehouse = Work Centre warehouse
    useProcessUom: true,    // default row UoM = Process Cons/Prod/Scrap UoM

    // state ------------------------------------------------------------------
    numberOk: false,
    manualNo: false,
    seq: 0,
    conv: {},                               // "item|uom" -> {done, from, to}
    batch: { C: {}, P: {}, S: {} },         // rowid -> saved batch entries
    draft: { C: {}, P: {}, S: {} },         // rowid -> unsaved (mismatch) entries
    cur: { C: null, P: null, S: null },     // row whose batch popup is open
    saving: false,

    secs: {
        C: { k: 'C', label: 'Consumption', tbl: '#ItemTable', body: '#TableBody_F', tmp: '#TempRow', add: '#AddRowButton', rem: '#RemoveItemRowButton', tot: '#TotalQty_F', totKgs: '#TotalQtyKgs_F', kgs: true, required: true },
        P: { k: 'P', label: 'Production', tbl: '#ItemTable_P', body: '#TableBody_P', tmp: '#TempRow_P', add: '#AddRowButton_P', rem: '#RemoveItemRowButton_P', tot: '#TotalQty_P', totKgs: '#TotalQtyKgs_P', kgs: true, required: true },
        S: { k: 'S', label: 'Scrap', tbl: '#ItemTable_S', body: '#TableBody_S', tmp: '#TempRow_S', add: '#AddRowButton_S', rem: '#RemoveItemRowButton_S', tot: '#TotalQty_S', totKgs: null, kgs: false, required: false }
    }
};

var JO_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//#region COMMON HELPERS --------------------------------------------------------
function removeCommas(value) {
    return (value === null || value === undefined ? '' : value).toString().replace(/,/g, '');
}

function JOTrim(v) { return (v === null || v === undefined ? '' : String(v)).trim(); }

function JONum(value) {
    return parseFloat(removeCommas(value)) || 0;
}

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

function JOFmtDate(str) {                       // -> dd-MMM-yyyy
    var iso = ToLocalDateString(str);
    if (!iso) return '';
    return iso.substr(8, 2) + '-' + JO_MONTHS[parseInt(iso.substr(5, 2), 10) - 1] + '-' + iso.substr(0, 4);
}

function JOToday() {
    var t = new Date();
    return String(t.getDate()).padStart(2, '0') + '-' + JO_MONTHS[t.getMonth()] + '-' + t.getFullYear();
}

function JOAjax(opts) {                         // jQuery ajax -> native Promise
    return new Promise(function (resolve, reject) {
        $.ajax(opts).done(resolve).fail(reject);
    });
}

function JOModal(selector, action) {
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
        $(el).off('hidden.bs.modal.jofocus').on('hidden.bs.modal.jofocus', function () {
            $(focusSelector).first().focus();
        });
    }
}

function JOFail(msg, sel) {
    showAlert(msg, sel);
    return false;
}

function JOSetSelect($sel, v) {
    if (v === null || v === undefined || v === '' || String(v) === '0') return false;
    if ($sel.find('option[value="' + v + '"]').length) { $sel.val(String(v)); return true; }
    return false;
}

// server-injected lists (JOCNV_Cfg = { uom:[], process:[], workCentre:[] })
function JOCfg(name) { return (window.JOCNV_Cfg && window.JOCNV_Cfg[name]) || []; }
function JOg(o, k) {
    if (o === null || o === undefined) return undefined;
    if (o[k] !== undefined) return o[k];
    return o[k.charAt(0).toUpperCase() + k.slice(1)];
}
function JOFind(list, key, val) {
    for (var i = 0; i < list.length; i++) {
        if (String(JOg(list[i], key)) === String(val)) return list[i];
    }
    return null;
}
//#endregion

//#region SECTION / ROW HELPERS --------------------------------------------------
function JOsec(k) { return JOCNV.secs[k]; }
function JOrows(k) { return $(JOsec(k).body).children('tr.NewRow'); }

function JOEnsureRowId($row) {
    var id = $row.attr('data-rowid');
    if (!id || id === '1') {
        id = 'r' + (++JOCNV.seq) + '_' + new Date().getTime();
        $row.attr('data-rowid', id);
    }
    return id;
}

function JORowByRowId(k, rid) {
    return JOrows(k).filter(function () { return $(this).attr('data-rowid') === String(rid); }).first();
}

function JOCheckedRow(k) {
    return $(JOsec(k).body).find('.CheckItem:checked').closest('tr.NewRow');
}

function JOBatchSum(k, rid) {
    var list = JOCNV.batch[k][rid] || [], sum = 0;
    for (var i = 0; i < list.length; i++) sum += JONum(list[i].qty);
    return sum;
}

function JOFocusQty(k, rid) {
    var $q = JORowByRowId(k, rid).find('.JIDNI_Qty');
    if ($q.length) { $q.focus(); $q.select(); }
}
//#endregion

//#region DEFAULTS FROM WORK CENTRE / PROCESS ------------------------------------
function JOCurrentProcess() { return JOFind(JOCfg('process'), 'number', $('#Header_JOCNVH_JPRS_Number').val()); }
function JOCurrentWc() { return JOFind(JOCfg('workCentre'), 'number', $('#Header_JOCNVH_JWWC_Number').val()); }

function JODefaultWh() {
    if (!JOCNV.useWcWarehouse) return '';
    var wc = JOCurrentWc();
    var w = wc ? Number(JOg(wc, 'warehouseNumber')) : 0;
    return w > 0 ? String(w) : '';
}

function JOProcessUom(k) {
    if (!JOCNV.useProcessUom) return '';
    var p = JOCurrentProcess();
    if (!p) return '';
    var n = Number(JOg(p, k === 'C' ? 'consUoM' : (k === 'P' ? 'prodUoM' : 'scrapUoM')));
    return n > 0 ? String(n) : '';
}

function JOApplyRowDefaults(k, $row, withUom) {
    JOSetSelect($row.find('.JIDNI_WH_Number'), JODefaultWh());
    if (withUom) JOSetSelect($row.find('.JIDNI_UoM_Number'), JOProcessUom(k));
}

function JOReapplyDefaults() {
    ['C', 'P', 'S'].forEach(function (k) {
        JOrows(k).each(function () {
            var $r = $(this), rid = JOEnsureRowId($r);
            if ((JOCNV.batch[k][rid] || []).length) return;     // batches already entered - leave row alone
            JOApplyRowDefaults(k, $r, !!$r.find('.JIDNI_Item_Number').val());
            JOCalcKgs($r);
        });
        JOTotals(k);
    });
}
//#endregion

//#region WORK CENTRE LIST FILTERED BY PROCESS ----------------------------------
function JOFilterWorkCentres() {
    var $wc = $('#Header_JOCNVH_JWWC_Number');
    if (!$wc.length) return;
    if (!JOCNV.wcAll) JOCNV.wcAll = $wc.find('option').clone();

    var p = $('#Header_JOCNVH_JPRS_Number').val(), cur = $wc.val();
    $wc.empty();
    JOCNV.wcAll.each(function () {
        var v = $(this).val();
        var wc = v ? JOFind(JOCfg('workCentre'), 'number', v) : null;
        if (!v || !p || (wc && String(JOg(wc, 'processNumber')) === String(p))) $wc.append($(this).clone());
    });
    if (cur && $wc.find('option[value="' + cur + '"]').length) $wc.val(cur); else $wc.val('');
}
//#endregion

//#region KGS CALCULATION (same rule as Receipt Note) ----------------------------
function JOCalcKgs($row) {
    var $k = $row.find('.JIDNI_Qty_Kgs');
    if (!$k.length) return;

    var qty = JONum($row.find('.JIDNI_Qty').val());
    var uomTxt = JOTrim($row.find('.JIDNI_UoM_Number option:selected').text()).toUpperCase();
    var item = $row.find('.JIDNI_Item_Number').val();
    var uom = $row.find('.JIDNI_UoM_Number').val();
    var kg = 0;

    if (uomTxt === 'KGS') {
        kg = qty;
    } else if (item && uom) {
        var key = item + '|' + uom, c = JOCNV.conv[key];
        if (c && c.done) {
            kg = c.from > 0 ? qty * (c.to / c.from) : 0;
        } else if (!c) {
            JOCNV.conv[key] = { done: false };
            $.ajax({
                url: JOCNV.urls.unitConv, type: 'GET', data: { itemNumber: item, fromUnit: uom }, cache: false,
                success: function (res) {
                    JOCNV.conv[key] = { done: true, from: parseFloat(res && res.fromQty) || 0, to: parseFloat(res && res.toQty) || 0 };
                    ['C', 'P'].forEach(function (kk) { JOrows(kk).each(function () { JOCalcKgs($(this)); }); JOTotals(kk); });
                },
                error: function () { JOCNV.conv[key] = { done: true, from: 0, to: 0 }; }
            });
        }
    }
    $k.val(kg === 0 ? '' : kg.toFixed(2));
}

function JOTotals(k) {
    var s = JOsec(k), q = 0, kg = 0;
    JOrows(k).each(function () {
        q += JONum($(this).find('.JIDNI_Qty').val());
        kg += JONum($(this).find('.JIDNI_Qty_Kgs').val());
    });
    $(s.tot).val(formatIndianQty(q));
    if (s.totKgs) $(s.totKgs).val(kg === 0 ? '' : kg.toFixed(2));
}
//#endregion

//#region ROW ADD / REMOVE -------------------------------------------------------
function JORowComplete($r) {
    return !!(JOTrim($r.find('.JIDNI_Item_Code').val()) && $r.find('.JIDNI_Item_Number').val() && JONum($r.find('.JIDNI_Qty').val()) > 0);
}

function JOAddRow(k, silent) {
    var s = JOsec(k), $last = JOrows(k).last();
    if ($last.length && !silent && !JORowComplete($last)) {
        showAlert('Please fill Item Code and Qty before adding a new row.', $last.find('.JIDNI_Item_Code'));
        return null;
    }
    var $new = $(s.tmp).clone();
    $new.removeAttr('id').removeAttr('style').addClass('NewRow').attr('data-rowid', 'r' + (++JOCNV.seq) + '_' + new Date().getTime());
    $new.find('input, select').each(function () {
        var el = $(this);
        if (el.attr('type') === 'checkbox') el.prop('checked', false);
        else if (el.is('select')) el.prop('selectedIndex', 0);
        else el.val('');
    });
    $(s.body).append($new);
    JOApplyRowDefaults(k, $new, false);
    $new.data('wkey', '|').data('witem', '').data('wwh', $new.find('.JIDNI_WH_Number').val() || '');
    JOTotals(k);
    JOResize(k);
    return $new;
}

function JORemoveRow(k) {
    var s = JOsec(k), $checked = JOrows(k).has('.CheckItem:checked');
    if ($checked.length === 0) { showAlert('Please select a row.'); return; }
    if ($checked.length > 1) { showAlert('Please select only one row.'); return; }
    var rid = JOEnsureRowId($checked);
    delete JOCNV.batch[k][rid];
    delete JOCNV.draft[k][rid];
    $checked.remove();
    if (JOrows(k).length === 0) JOAddRow(k, true);
    JOTotals(k);
    if (k === 'C' && typeof JOSyncTemp === 'function') JOSyncTemp();   // row positions changed
}
//#endregion

//#region ROW WATCHER  (ItemGrid.js sets Item / UoM / WH in code, so no change event) --
function JOWatchRows() {
    ['C', 'P', 'S'].forEach(function (k) {
        JOrows(k).each(function () {
            var $r = $(this), rid = JOEnsureRowId($r);
            var item = $r.find('.JIDNI_Item_Number').val() || '';
            var prevItem = $r.data('witem');
            var changedItem = (prevItem !== undefined && prevItem !== item);

            if (prevItem === undefined) {                       // first sight of the row (page load)
                $r.data('witem', item).data('wkey', '').data('wwh', $r.find('.JIDNI_WH_Number').val() || '');
                prevItem = item;
            }

            if (changedItem) {
                if (prevItem && (JOCNV.batch[k][rid] || JOCNV.draft[k][rid])) {     // old item's batches are invalid now
                    delete JOCNV.batch[k][rid];
                    delete JOCNV.draft[k][rid];
                    if (k === 'C' && typeof JOSyncTemp === 'function') JOSyncTemp();
                }
                $r.data('witem', item);
                if (item) JOApplyRowDefaults(k, $r, true);
                $r.data('wwh', $r.find('.JIDNI_WH_Number').val() || '');
            }

            if (k === 'C') {                                    // consumption batches belong to item + warehouse
                var wh = $r.find('.JIDNI_WH_Number').val() || '';
                if ($r.data('wwh') !== wh) {
                    $r.data('wwh', wh);
                    if ((JOCNV.batch.C[rid] || []).length) {
                        delete JOCNV.batch.C[rid];
                        delete JOCNV.draft.C[rid];
                        if (typeof JOSyncTemp === 'function') JOSyncTemp();
                        showAlert('Warehouse changed - please enter the batch details again for this Consumption row.');
                    }
                }
            }

            var key = item + '|' + ($r.find('.JIDNI_UoM_Number').val() || '');
            if ($r.data('wkey') !== key) {
                $r.data('wkey', key);
                JOCalcKgs($r);
                JOTotals(k);
            }
        });
    });
}
//#endregion

//#region ITEM GRID EVENTS (generic for C / P / S) --------------------------------
function JOBindGrid(k) {
    var s = JOsec(k);

    // Qty: digits only, totals, Kgs, auto add row
    $(document).on('input', s.body + ' .JIDNI_Qty', function () {
        var cleaned = this.value.replace(/[^0-9]/g, '');
        if (cleaned !== this.value) this.value = cleaned;
    });
    $(document).on('input change', s.body + ' .JIDNI_Qty', function () {
        var $r = $(this).closest('tr');
        JOCalcKgs($r);
        JOTotals(k);
        if (JORowComplete($r) && $r.is(JOrows(k).last()) && JOrows(k).length === $r.index(s.body + ' tr.NewRow') + 1) {
            JOAddRow(k, true);
        }
    });
    $(document).on('focusout', s.body + ' .JIDNI_Qty', function () {
        var v = JONum(this.value);
        $(this).attr('data-value', v).val(v === 0 ? '' : formatIndianQty(v));
    });

    // UoM change -> Kgs
    $(document).on('change', s.body + ' .JIDNI_UoM_Number', function () {
        JOCalcKgs($(this).closest('tr'));
        JOTotals(k);
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

    $(document).on('click', s.add, function () { JOAddRow(k, false); });
    $(document).on('click', s.rem, function () { JORemoveRow(k); });

    $(document).on('keyup', s.tbl + ' input', function () { JOResize(k); });
    $(document).on('change', s.tbl + ' select', function () { JOResize(k); });
}

// Item_Code keydown / focusout  (item search pane)
$(document).on('keydown', '.JIDNI_Item_Code', function (e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') return;
    var rows = $('#RightPane_Item .search-results tbody tr');
    if (e.key === 'Enter' && JOTrim($(this).val()) === '' && rows.length > 0 &&
        !rows.filter('.current-row, .match-row').length) {
        e.preventDefault();
        isSelectingItem = true;
        rows.first().trigger('mousedown');
        return;
    }
    HandleSearchKeyDown(e, this, '#RightPane_Item', '.search-results', '#ItemMessage', '#Header_JOCNVH_MS_Number');
});

$(document).on('focusout', '.JIDNI_Item_Code', function () {
    if (isSelectingItem) return;
    var input = $(this);
    var rows = $('#RightPane_Item .search-results tbody tr');
    if (JOTrim(input.val()) === '' && rows.length > 0 && !rows.filter('.current-row, .match-row').length) {
        isSelectingItem = true;
        rows.first().trigger('mousedown');
        return;
    }
    HandleSearchSelection(input, rows, '#ItemMessage', '#RightPane_Item', '#RightPane_Item .search-results');
});

// keep the Qty already typed when only the item is re-selected on a row
var ItemCodeFocusRow = null;
$(document).on('focusin', '.JIDNI_Item_Code', function () {
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
//#endregion

//#region COLUMN WIDTHS ---------------------------------------------------------
function JOFields(globalName, withKgs) {
    var base = (window[globalName] || []).slice();
    if (withKgs && !base.some(function (f) { return f.cls === '.JIDNI_Qty_Kgs'; })) {
        base.push({ cls: '.JIDNI_Qty_Kgs', min: 10, max: 20, align: 'right' });
    }
    return base;
}

function JOResize(k) {
    if (typeof ApplyFieldWidths !== 'function') return;
    var s = JOsec(k);
    var g = k === 'C' ? 'ConversionConsumptionFields' : (k === 'P' ? 'ConversionProductionFields' : 'ConversionScrapFields');
    ApplyFieldWidths({ fields: JOFields(g, s.kgs), container: s.tbl, tempRow: s.tmp, tableBody: s.body, searchTable: '#tblsearch' });
}
function ResizeConsumptionColumns() { JOResize('C'); }
function ResizeProductionColumns() { JOResize('P'); }
function ResizeScrapColumns() { JOResize('S'); }

function AutoFit() {
    if (typeof fitInputWidth !== 'function') return;
    fitInputWidth('Header_JOCNVH_JournalNo', 20, 30);
    fitInputWidth('Header_JOCNVH_MS_Number', 20, 30);
    fitInputWidth('Header_JOCNVH_JSFT_Number', 20, 30);
    fitInputWidth('Header_JOCNVH_JWWC_Number', 25, 30);
    fitInputWidth('Header_JOCNVH_JPRS_Number', 25, 30);
}

$(window).on('load', function () {
    setTimeout(function () { JOResize('C'); JOResize('P'); JOResize('S'); }, 200);
});
//#endregion

//#region JOURNAL NO ------------------------------------------------------------
function JOGetNextNumber() {
    var iso = ToLocalDateString($('#Header_JOCNVH_Date').val());
    var $no = $('#Header_JOCNVH_JournalNo');
    if (!iso) return;

    $.ajax({
        url: JOCNV.urls.nextNumber, type: 'GET', cache: false, data: { CNVDate: iso.substring(0, 10) },
        success: function (r) {
            JOCNV.manualNo = !!(r && r.manual);
            $no.prop('readonly', !JOCNV.manualNo);
            if (!r || !r.success) {
                JOCNV.numberOk = false;
                $no.val('');
                showAlert((r && r.message) || 'Conversion Journal Number is not configured for the selected date.');
                return;
            }
            JOCNV.numberOk = true;
            $no.val(r.number || '');
            if (typeof fitInputWidth === 'function') fitInputWidth($no[0], 20, 30);
        },
        error: function () {
            JOCNV.numberOk = false;
            showAlert('Unable to get the Conversion Journal Number.');
        }
    });
}
$(document).on('change', '#Header_JOCNVH_Date', JOGetNextNumber);
//#endregion

//#region VALIDATION ------------------------------------------------------------
function JOValidateHeader() {
    var v = function (id) { return JOTrim($('#' + id).val()); };
    if (!JOCNV.manualNo && !JOCNV.numberOk)
        return JOFail('Conversion Journal Number is not configured for the selected date.', '#Header_JOCNVH_Date');
    if (v('Header_JOCNVH_JournalNo') === '') return JOFail('Conversion Journal No. is required', '#Header_JOCNVH_JournalNo');
    if (v('Header_JOCNVH_Date') === '') return JOFail('Date is required', '#Header_JOCNVH_Date');
    var need = [['Header_JOCNVH_MS_Number', 'Material Segregation'], ['Header_JOCNVH_JSFT_Number', 'Shift'],
                ['Header_JOCNVH_JWWC_Number', 'Work Centre'], ['Header_JOCNVH_JPRS_Number', 'Process']];
    for (var i = 0; i < need.length; i++) {
        var val = v(need[i][0]);
        if (val === '' || val === '0') return JOFail(need[i][1] + ' is required', '#' + need[i][0]);
    }
    return true;
}

function JOValidateGrid(k) {
    var s = JOsec(k), ok = true, count = 0;

    JOrows(k).each(function (i) {
        var $r = $(this), rid = JOEnsureRowId($r);
        var code = JOTrim($r.find('.JIDNI_Item_Code').val());
        var qty = JONum($r.find('.JIDNI_Qty').val());
        if (!code && !qty) return;                                  // empty row

        count++;
        var n = ' (' + s.label + ' row ' + (i + 1) + ')';
        var wh = $r.find('.JIDNI_WH_Number').val(), uom = $r.find('.JIDNI_UoM_Number').val();

        if (!code || !$r.find('.JIDNI_Item_Number').val()) ok = JOFail('Item Code is required' + n, $r.find('.JIDNI_Item_Code'));
        else if (!wh || wh === '0') ok = JOFail('Warehouse is required' + n, $r.find('.JIDNI_WH_Number'));
        else if (!uom || uom === '0') ok = JOFail('UoM is required' + n, $r.find('.JIDNI_UoM_Number'));
        else if (qty <= 0) ok = JOFail('Qty is required' + n, $r.find('.JIDNI_Qty'));
        else if (!(JOCNV.batch[k][rid] || []).length) ok = JOFail('Batch details are required' + n, $r.find('.JIDNI_Qty'));
        else if (Math.abs(JOBatchSum(k, rid) - qty) > 0.0001) ok = JOFail('Batch Qty mismatch' + n + ' - batch total ' + formatIndianQty(JOBatchSum(k, rid)) + ', item Qty ' + formatIndianQty(qty), $r.find('.JIDNI_Qty'));

        if (!ok) return false;
    });

    if (ok && s.required && count === 0) ok = JOFail('Please enter at least one ' + s.label.toLowerCase() + ' item.');
    return ok;
}

function JOValidateAll() {
    return JOValidateHeader() && JOValidateGrid('C') && JOValidateGrid('P') && JOValidateGrid('S');
}
//#endregion

//#region SAVE MODEL ------------------------------------------------------------
function JOBuildModel() {
    var model = {
        Header: {
            JOCNVH_Number: 0,
            JOCNVH_JournalNo: JOTrim($('#Header_JOCNVH_JournalNo').val()),
            JOCNVH_Date: ToLocalDateString($('#Header_JOCNVH_Date').val()),
            JOCNVH_MS_Number: parseInt($('#Header_JOCNVH_MS_Number').val(), 10) || 0,
            JOCNVH_JSFT_Number: parseInt($('#Header_JOCNVH_JSFT_Number').val(), 10) || 0,
            JOCNVH_JWWC_Number: parseInt($('#Header_JOCNVH_JWWC_Number').val(), 10) || 0,
            JOCNVH_JPRS_Number: parseInt($('#Header_JOCNVH_JPRS_Number').val(), 10) || 0
        },
        Items: [], ConsBatches: [],
        Items_Production: [], ItemBatch_Production: [],
        Items_Scrap: [], ItemBatch_Scrap: []
    };

    function each(k, fn) {
        var idx = 0;
        JOrows(k).each(function () {
            var $r = $(this);
            if (!JOTrim($r.find('.JIDNI_Item_Code').val()) && !JONum($r.find('.JIDNI_Qty').val())) return;
            fn($r, idx, JOEnsureRowId($r));
            idx++;
        });
    }
    var I = function ($r, c) { return parseInt($r.find(c).val(), 10) || 0; };

    // Consumption --------------------------------------------------------------
    each('C', function ($r, idx, rid) {
        var item = I($r, '.JIDNI_Item_Number');
        model.Items.push({
            RowIndex: idx, JOCNVC_Item_Number: item,
            JOCNVC_WH_Number: I($r, '.JIDNI_WH_Number'), JOCNVC_UoM_Number: I($r, '.JIDNI_UoM_Number'),
            JOCNVC_ConsQty: JONum($r.find('.JIDNI_Qty').val()), JOCNVC_ConsQty_Kgs: JONum($r.find('.JIDNI_Qty_Kgs').val())
        });
        (JOCNV.batch.C[rid] || []).forEach(function (b) {
            if (JONum(b.qty) <= 0) return;
            model.ConsBatches.push({
                ItemGridIndex: idx, ItemMasterNumber: item,
                JOCNVC_BCH_WH_Number: parseInt(b.whNo, 10) || 0,
                JOCNVC_BCH_BatchDate: ToLocalDateString(b.date), JOCNVC_BCH_BatchNo: b.no || '',
                JOCNVC_BCH_BatchQty: JONum(b.qty), JOCNVC_BCH_BatchUnitPrice: JONum(b.price), JOCNVC_BCH_BatchValue: JONum(b.value),
                JOCNVC_BCH_RefBatch_Number: parseInt(b.ref, 10) || 0
            });
        });
    });

    // Production ---------------------------------------------------------------
    each('P', function ($r, idx, rid) {
        var item = I($r, '.JIDNI_Item_Number'), list = JOCNV.batch.P[rid] || [];
        var status = $r.find('.JIDNI_ItemStatus').val() || 'Good';
        model.Items_Production.push({
            JOCNVP_Item_Number: item, JOCNVP_WH_Number: I($r, '.JIDNI_WH_Number'), JOCNVP_UoM_Number: I($r, '.JIDNI_UoM_Number'),
            JOCNVP_ItemStatus: status,
            JOCNVP_ProdQty: JONum($r.find('.JIDNI_Qty').val()), JOCNVP_ProdQty_Kgs: JONum($r.find('.JIDNI_Qty_Kgs').val())
        });
        list.forEach(function (b) {
            if (JONum(b.qty) <= 0) return;
            model.ItemBatch_Production.push({
                JOCNVP_BCH_JOCNVP_Number: idx, ItemMasterNumber: item,
                JOCNVP_BCH_WH_Number: parseInt(b.wh, 10) || 0,
                JOCNVP_BCH_BatchDate: ToLocalDateString(b.date), JOCNVP_BCH_BatchNo: b.no || '',
                JOCNVP_BCH_ItemStatus: status,
                JOCNVP_BCH_BatchQty: JONum(b.qty), JOCNVP_BCH_BatchUnitPrice: JONum(b.price), JOCNVP_BCH_BatchValue: JONum(b.value)
            });
        });
    });

    // Scrap --------------------------------------------------------------------
    each('S', function ($r, idx, rid) {
        var item = I($r, '.JIDNI_Item_Number');
        model.Items_Scrap.push({
            JOCNVS_Item_Number: item, JOCNVS_WH_Number: I($r, '.JIDNI_WH_Number'), JOCNVS_UoM_Number: I($r, '.JIDNI_UoM_Number'),
            JOCNVS_ScrapQty: JONum($r.find('.JIDNI_Qty').val())
        });
        (JOCNV.batch.S[rid] || []).forEach(function (b) {
            if (JONum(b.qty) <= 0) return;
            model.ItemBatch_Scrap.push({
                JOCNVS_BCH_JOCNVS_Number: idx, ItemMasterNumber: item,
                JOCNVS_BCH_WH_Number: parseInt(b.wh, 10) || 0,
                JOCNVS_BCH_BatchDate: ToLocalDateString(b.date), JOCNVS_BCH_BatchNo: b.no || '',
                JOCNVS_BCH_BatchQty: JONum(b.qty), JOCNVS_BCH_BatchUnitPrice: JONum(b.price), JOCNVS_BCH_BatchValue: JONum(b.value)
            });
        });
    });

    return model;
}

function JOSave() {
    if (JOCNV.saving) return;
    if (!JOValidateAll()) return;

    var model = JOBuildModel();
    var $btn = $('#btnSave');
    JOCNV.saving = true;
    $btn.prop('disabled', true);

    $.ajax({
        url: JOCNV.urls.save, type: 'POST', contentType: 'application/json', data: JSON.stringify(model),
        success: function (r) {
            if (r && r.success) {
                JOCNV.saved = true;
                var el = document.getElementById('ModelAlert');
                if (el) $(el).off('hidden.bs.modal.jofocus').one('hidden.bs.modal', function () { window.location.reload(); });
                showAlert('Record saved. Journal No: <b>' + (r.number || model.Header.JOCNVH_JournalNo) + '</b>');
                if (!el) window.location.reload();
            } else {
                JOCNV.saving = false; $btn.prop('disabled', false);
                showAlert((r && r.message) || 'Save failed.');
            }
        },
        error: function (xhr) {
            JOCNV.saving = false; $btn.prop('disabled', false);
            var msg = (xhr.responseJSON && xhr.responseJSON.message) || 'Save failed.';
            showAlert(msg);
            console.log(xhr.responseText);
        }
    });
}
//#endregion

//#region INPUT FILTERS (batch popups) -------------------------------------------
var JO_NUMERIC_ONLY = '#DeliveryNoteBatchTableBody .JIDNI_BCH_QtyInvoice,#IBatTableBody_P .JIRNI_BCH_BatchQty,#IBatTableBody_S .JIRNI_BCH_BatchQty';
$(document).on('keypress', JO_NUMERIC_ONLY, function (e) {
    if (e.ctrlKey || e.metaKey) return;
    if (!/[0-9]/.test(String.fromCharCode(e.which ? e.which : e.keyCode))) e.preventDefault();
});
$(document).on('input', JO_NUMERIC_ONLY, function () {
    var c = this.value.replace(/[^0-9]/g, '');
    if (c !== this.value) this.value = c;
});

var JO_DECIMAL_ONLY = ['#IBatTableBody_P', '#IBatTableBody_S'].map(function (t) {
    return t + ' .JIRNI_BCH_BatchUnitPrice';
}).join(', ');
var JO_DECIMAL_PATTERN = /^\d*\.?\d{0,2}$/;
$(document).on('keypress', JO_DECIMAL_ONLY, function (e) {
    if (e.ctrlKey || e.metaKey) return;
    var ch = String.fromCharCode(e.which ? e.which : e.keyCode);
    var nv = this.value.slice(0, this.selectionStart) + ch + this.value.slice(this.selectionEnd);
    if (!JO_DECIMAL_PATTERN.test(nv)) e.preventDefault();
});
$(document).on('input', JO_DECIMAL_ONLY, function () {
    var v = this.value;
    if (!JO_DECIMAL_PATTERN.test(v)) {
        v = v.replace(/[^0-9.]/g, '');
        var p = v.split('.');
        this.value = p.length > 1 ? p[0] + '.' + p.slice(1).join('').slice(0, 2) : p[0];
    }
});
$(document).on('blur', JO_DECIMAL_ONLY, function () {
    var v = removeCommas(this.value);
    this.value = (v !== '' && v !== '.') ? DecimalIndianRupees(parseFloat(v)) : '';
});
//#endregion

//#region DEFAULT FORM SETTING (DFS) ---------------------------------------------
function LoadDefaultFormSetting() {
    $.ajax({
        url: '/joboutward/transactions/conversion-dfs/get',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response && response.success && response.data) {
                var data = response.data;

                if (data.jocnV_DFS_MS_Number) {
                    $('#Header_JOCNVH_MS_Number').val(data.jocnV_DFS_MS_Number).trigger('change');
                }
                if (data.jocnV_DFS_JSFT_Number) {
                    $('#Header_JOCNVH_JSFT_Number').val(data.jocnV_DFS_JSFT_Number).trigger('change');
                }
                // Process first (filters the Work Centre list), then Work Centre
                if (data.jocnV_DFS_JPRS_Number) {
                    $('#Header_JOCNVH_JPRS_Number').val(data.jocnV_DFS_JPRS_Number).trigger('change');
                }
                if (data.jocnV_DFS_JWWC_Number) {
                    $('#Header_JOCNVH_JWWC_Number').val(data.jocnV_DFS_JWWC_Number).trigger('change');
                }
            }
        },
        error: function (xhr) {
            console.error('Failed to load default form setting', xhr);
        }
    });
}
//#endregion

//#region READY
$(function () {
    if (typeof isSelectingItem === 'undefined') window.isSelectingItem = false;

    ['C', 'P', 'S'].forEach(function (k) {
        JOBindGrid(k);
        JOrows(k).each(function () { JOEnsureRowId($(this)); });
        if (JOrows(k).length === 0) JOAddRow(k, true);
        JOTotals(k);
    });

    // header date (flatpickr) + journal no
    var dt = document.getElementById('Header_JOCNVH_Date');
    if (dt && typeof flatpickr === 'function' && !dt._flatpickr) {
        flatpickr(dt, { dateFormat: 'd-M-Y', altInput: true, altFormat: 'd-M-Y', allowInput: true, defaultDate: new Date() });
    } else if (dt && !dt.value) {
        dt.value = JOToday();
    }
    JOGetNextNumber();

    // Work Centre -> Process ; defaults
    $(document).on('change', '#Header_JOCNVH_JWWC_Number', function () {
        var wc = JOCurrentWc(), p = wc ? Number(JOg(wc, 'processNumber')) : 0;
        if (p > 0) { $('#Header_JOCNVH_JPRS_Number').val(String(p)); JOFilterWorkCentres(); }
        JOReapplyDefaults();
    });
    $(document).on('change', '#Header_JOCNVH_JPRS_Number', function () {
        JOFilterWorkCentres();
        JOReapplyDefaults();
    });
    JOFilterWorkCentres();

    LoadDefaultFormSetting();

    // header auto fit
    AutoFit();
    $(document).on('input keyup', '#Header_JOCNVH_JournalNo', function () { if (typeof fitInputWidth === 'function') fitInputWidth(this, 20, 30); });
    $(document).on('change', '#Header_JOCNVH_MS_Number, #Header_JOCNVH_JSFT_Number, #Header_JOCNVH_JWWC_Number, #Header_JOCNVH_JPRS_Number', function () {
        if (typeof fitInputWidth === 'function') fitInputWidth(this, 20, 30);
    });

    $('#btnSave').on('click', function (e) { e.preventDefault(); JOSave(); return false; });
    $(document).on('click', '#btnClearAll', function () {
        $.post(JOCNV.urls.tempClear).always(function () { window.location.reload(); });
    });

    // stale temp reservations from an earlier visit
    $.post(JOCNV.urls.tempClear);
    window.addEventListener('beforeunload', function () {
        if (!JOCNV.saved && navigator.sendBeacon) navigator.sendBeacon(JOCNV.urls.tempClear);
    });

    $(document).on('change', '#TableBody_P .JIDNI_ItemStatus', function () {
        var rid = JOEnsureRowId($(this).closest('tr')), v = $(this).val() || 'Good';
        (JOCNV.batch.P[rid] || []).forEach(function (b) { b.status = v; });
        (JOCNV.draft.P[rid] || []).forEach(function (b) { b.status = v; });
    });

    setInterval(JOWatchRows, 300);
});
//#endregion
