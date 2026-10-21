/* =====================================================================
   JO_JobworkInvoice.js  -  CREATE page
   Folder : wwwroot/js/JO_JobworkInvoice/
   ===================================================================== */
var JWI_URL = '/joboutward/transactions/jobwork-invoice';
var JWI_Addresses = [];          // address popup data (in memory)
var JWI_LastVendor = 0;          // vendor of the rows currently in the grid

/* ---------------- small helpers ---------------- */
function g(o, ...keys) {          // case-insensitive getter
    if (!o) return undefined;
    for (var k of keys) {
        if (o[k] !== undefined && o[k] !== null) return o[k];
        var lk = k.toLowerCase();
        for (var p in o) if (p.toLowerCase() === lk && o[p] !== null) return o[p];
    }
    return undefined;
}
function num(v) { var n = parseFloat(String(v === undefined || v === null ? '' : v).replace(/,/g, '')); return isNaN(n) ? 0 : n; }
function r2(v) { return Math.round((num(v) + Number.EPSILON) * 100) / 100; }
function fmtQ(v) { return String(Math.round(num(v))); }   // whole-number qty
function fmt(v) { return r2(v).toFixed(2); }
function esc(s) { return $('<div>').text(s === undefined || s === null ? '' : s).html(); }

// date input -> {y,m,d}  (supports yyyy-mm-dd, dd-mm-yyyy, dd/mm/yyyy)
function parseDate(txt) {
    if (!txt) return null;
    txt = String(txt).trim();
    var m = txt.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return { y: +m[1], m: +m[2], d: +m[3] };
    m = txt.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
    if (m) return { y: +m[3], m: +m[2], d: +m[1] };
    return null;
}
function dateYMD(id) {            // for GET queries  -> yyyy-mm-dd
    var p = parseDate($('#' + id).val());
    if (!p) return '';
    return p.y + '-' + String(p.m).padStart(2, '0') + '-' + String(p.d).padStart(2, '0');
}
function dateISO(id) {            // for save payload -> UTC ISO (controller FromBrowserUtc)
    var p = parseDate($('#' + id).val());
    return p ? new Date(p.y, p.m - 1, p.d).toISOString() : null;
}
function showAlert(msg) {
    if ($('#AlertModal').length) { $('#AlertMessage').html(msg); $('#AlertModal').modal('show'); }
    else alert(msg.replace(/<br\s*\/?>/g, '\n'));
}

/* =====================================================================
   VENDOR SEARCH  (self-contained : RightPane list + keyboard navigation)
   Needs only : #RightPane > .buyer-search-results in the cshtml
   ===================================================================== */
var isMouseSelectingBuyer = false;
var buyerSearchXHR = null;

function ShowVendorPane() {
    $("#RightPane").show().addClass("show");
    $("#RightPane .buyer-search-results").show();
}
function HideVendorPane() {
    $("#RightPane").removeClass("show");
    $("#RightPane .buyer-search-results").hide();
}
function VendorRows() { return $("#RightPane .buyer-search-results tbody tr"); }

// refresh vendor list when user comes back to this tab (e.g. after adding vendor in master)
function RefreshVendorList() {
    var inp = $('#JOSVIH_JW_Vendor_Name')[0];
    if (!inp || !$('#RightPane').hasClass('show')) return;
    SearchBuyer(inp);
}
document.addEventListener('visibilitychange', function () { if (!document.hidden) RefreshVendorList(); });
$(window).on('focus', RefreshVendorList);

// focus (inline onfocus="ShowVendorPane();OnBuyerSelectCall(this)")
function OnBuyerSelectCall(inputElement) {
    ShowVendorPane();
    SearchBuyer(inputElement);
}
// typing (inline oninput="OnBuyerInput(this)")
function OnBuyerInput(inputElement) {
    if (inputElement.selectionStart !== inputElement.selectionEnd) return;
    $('#JOSVIH_JW_Vendor_Number').val('');           // typed again -> must pick from list
    ShowVendorPane();
    SearchBuyer(inputElement);
}

function SearchBuyer(inputElement) {
    var txt = inputElement.value;
    var resultsDiv = $("#RightPane").find(".buyer-search-results");
    if (buyerSearchXHR) buyerSearchXHR.abort();

    buyerSearchXHR = $.ajax({
        url: JWI_URL + '/vendor', type: 'GET', cache: false,
        data: { Vendor: txt, InvoiceDate: dateYMD('JOSVIH_VendorInvoiceDate') },
        success: function (data) {
            resultsDiv.empty();
            $(inputElement).removeData("selectedIndex").removeData("firstMatch");
            if (data && data.length > 0) {
                var table = $(
                    '<div class="card-body modal-content batchPopup p-0" style="z-index:999;">' +
                    '<table class="table table-bordered table-hover table-fixed table-grid mb-0 w-100">' +
                    '<thead><tr class="table-info"><th>JW Vendor Name</th></tr></thead><tbody></tbody></table></div>');

                $.each(data, function (i, v) {
                    var row = $("<tr></tr>").css("height", "24px").data("vendor", v);
                    row.append($("<td></td>").text(g(v, 'JWV_JW_VendorName') || ''));
                    table.find("tbody").append(row);
                });

                // click on a vendor
                table.find("tbody").on("mousedown", "tr", function (e) {
                    e.preventDefault();
                    isMouseSelectingBuyer = true;
                    ApplyVendor($(this).data("vendor"), true);
                    HideVendorPane();
                    setTimeout(function () { isMouseSelectingBuyer = false; }, 100);
                });
                resultsDiv.append(table);

                // highlight rows starting with typed text
                var rows = VendorRows(), s = $.trim(txt).toLowerCase(), first = -1;
                rows.removeClass("match-row current-row");
                rows.each(function (i) {
                    if (s !== "" && $(this).find("td:first").text().trim().toLowerCase().startsWith(s)) {
                        $(this).addClass("match-row");
                        if (first === -1) first = i;
                    }
                });
                if (first >= 0) $(inputElement).data("firstMatch", first);
            } else {
                resultsDiv.append('<div class="p-2 text-danger fw-bold">No vendor found</div>');
            }
            resultsDiv.show();
        },
        error: function (xhr, status) {
            if (status === "abort") return;
            resultsDiv.text("Error loading data.").show();
        }
    });
}

// mark one row as current (arrow keys)
function MarkVendorRow(input, idx) {
    var rows = VendorRows();
    rows.removeClass("current-row");
    if (idx >= 0 && idx < rows.length) {
        var r = rows.eq(idx).addClass("current-row");
        if (r[0] && r[0].scrollIntoView) r[0].scrollIntoView({ block: "nearest" });
    }
    $(input).data("selectedIndex", idx);
}

$(document).on("keydown", "#JOSVIH_JW_Vendor_Name", function (e) {
    var rows = VendorRows(), input = this, $in = $(this);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!rows.length) return;
        e.preventDefault();
        var idx = $in.data("selectedIndex");
        if (idx === undefined) idx = ($in.data("firstMatch") !== undefined) ? $in.data("firstMatch") - (e.key === "ArrowDown" ? 1 : -1) : -1;
        idx = (e.key === "ArrowDown") ? Math.min(idx + 1, rows.length - 1) : Math.max(idx - 1, 0);
        MarkVendorRow(input, idx);
        return;
    }
    if (e.key === "Enter") {
        e.preventDefault();
        var pick = rows.filter(".current-row").first();
        if (!pick.length) pick = rows.filter(".match-row").first();
        if (!pick.length && rows.length === 1) pick = rows.first();
        if (!pick.length && $.trim($in.val()) === "" && rows.length) pick = rows.first();
        if (pick.length) {
            pick.trigger("mousedown");
            var f = $('input:visible, select:visible, textarea:visible, button:visible')
                .filter(function () { return !this.disabled && this.tabIndex !== -1 && this.type !== 'hidden'; });
            var n = f.index(input) + 1;
            if (n < f.length) f.eq(n).focus();      // next control (Currency)
        }
        return;
    }
    if (e.key === "Escape") { HideVendorPane(); }
    if (e.key === "Tab") {
        if (num($('#JOSVIH_JW_Vendor_Number').val()) > 0) return;   // already picked
        var pick = rows.filter(".current-row").first();
        if (!pick.length) pick = rows.filter(".match-row").first();
        if (!pick.length && rows.length === 1) pick = rows.first();
        if (pick.length) pick.trigger("mousedown");               // Tab default stays -> moves to next control
    }
});

// leaving the box
$(document).on("focusout", "#JOSVIH_JW_Vendor_Name", function () {
    if (isMouseSelectingBuyer) return;
    var $in = $(this), txt = $.trim($in.val()).toLowerCase();

    if (num($('#JOSVIH_JW_Vendor_Number').val()) > 0) { HideVendorPane(); return; }   // already picked
    if (txt === "") { HideVendorPane(); return; }

    // typed full name but did not click -> pick the exact match
    var exact = VendorRows().filter(function () { return $(this).find("td:first").text().trim().toLowerCase() === txt; }).first();
    if (exact.length) { exact.trigger("mousedown"); return; }

    // nothing matched -> clear the text
    $in.val('');
    HideVendorPane();
});

function ApplyVendor(v, clearItems) {
    var vno = num(g(v, 'JWV_Number'));
    if (clearItems && JWI_LastVendor && JWI_LastVendor !== vno) {
        $('#TableBody').empty(); JWI_Addresses = []; CalculateTotals();   // different vendor -> old rows/address go
    }
    JWI_LastVendor = vno;

    $('#JOSVIH_JW_Vendor_Number').val(vno);
    $('#JOSVIH_JW_Vendor_Name').val(g(v, 'JWV_JW_VendorName'));
    $('#JOSVIH_Currency_Number').val(g(v, 'JWV_Currency_Number'));
    $('#JOSVIH_PaymentTerms').val(g(v, 'JWV_PaymentTerms') || '');
    $('#JOSVIH_PaymentMethod').val(g(v, 'JWV_PaymentMode') || '');
    $('#WHT_Flag').val(g(v, 'JWV_WithholdTax') || 0);

    LoadTaxClusters(vno, g(v, 'TaxClusterNumber'), g(v, 'TaxCluster'));
    var wht = num(g(v, 'JWV_WH_Number'));
    $('#JOSVIH_WHT_Number').val(wht > 0 ? wht : 0);
    $('#JOSVIH_WHT_Number').prop('disabled', num(g(v, 'JWV_WithholdTax')) !== 1);
    GetWHT(function () { RecalcAllRows(); });
    if (typeof AutoFit === 'function') AutoFit();
}

function LoadDefaultFormSetting() {
    $.ajax({
        url: '/joboutward/transactions/jobwork-invoice-dfs/get',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response && response.success && response.data) {
                var data = response.data;

                if (data.josvI_DFS_MS_Number) {
                    $('#JOSVIH_MS_Number').val(data.josvI_DFS_MS_Number).trigger('change');
                }

                if (data.josvI_DFS_JW_Vendor_Number) {
                    var vendorNo = data.josvI_DFS_JW_Vendor_Number;
                    var $vName = $('#JOSVIH_JW_Vendor_Name');

                    $('#JOSVIH_JW_Vendor_Number').val(vendorNo);
                    $vName.val(data.jwV_JW_VendorName);

                    // load vendor list, then select the default vendor row
                    // (same logic as manual select: fills Currency, Tax Cluster, WHT)
                    SearchBuyer($vName[0]);

                    setTimeout(function () {
                        var $row = VendorRows().filter(function () {
                            var v = $(this).data("vendor");
                            return v && num(g(v, 'JWV_Number')) == num(vendorNo);
                        }).first();

                        if ($row.length) {
                            $row.trigger("mousedown");
                        }

                        // DFS values win over vendor master values
                        setTimeout(function () {
                            ApplyDfsTextFields(data);
                        }, 500);
                    }, 1000);
                } else {
                    ApplyDfsTextFields(data);
                }
            }
        },
        error: function (xhr) {
            console.error('Failed to load default form setting', xhr);
        }
    });
}

function ApplyDfsTextFields(data) {
    if (data.josvI_DFS_PaymentTerms) {
        $('#JOSVIH_PaymentTerms').val(data.josvI_DFS_PaymentTerms);
    }
    if (data.josvI_DFS_PaymentMethod) {
        $('#JOSVIH_PaymentMethod').val(data.josvI_DFS_PaymentMethod);
    }
    if (data.josvI_DFS_Remarks) {
        $('#JOSVIH_Remarks').val(data.josvI_DFS_Remarks);
    }
}

function LoadTaxClusters(vno, selected, selectedName) {
    function fill(list) {
        var $s = $('#JOSVIH_TCT_Number').empty().append('<option value="0">-- Select --</option>');
        (list || []).forEach(function (c) {
            $s.append('<option value="' + g(c, 'TaxClusterNumber') + '">' + esc(g(c, 'TaxCluster')) + '</option>');
        });
        // list-ல இல்லன்னா vendor-ஓட cluster-ஐ சேர்க்கவும்
        if (selected && $s.find('option[value="' + selected + '"]').length === 0) {
            $s.append('<option value="' + selected + '">' + esc(selectedName || selected) + '</option>');
        }
        if (selected) $s.val(selected);
    }
    $.get(JWI_URL + '/cluster', { VendorNumber: vno, Search: '' }, fill)
        .fail(function () { fill([]); });
}

// WHT % + IncludeTax for current vendor / code / vendor invoice date
function GetWHT(cb) {
    var vno = num($('#JOSVIH_JW_Vendor_Number').val()), wno = num($('#JOSVIH_WHT_Number').val());
    if (!vno || !wno) { $('#WHT_Percent').val(0); $('#WHT_IncludeTax').val(0); if (cb) cb(); return; }
    $.get(JWI_URL + '/wht', { VendorNumber: vno, WHTNumber: wno, InvoiceDate: dateYMD('JOSVIH_VendorInvoiceDate') }, function (list) {
        var w = (list || [])[0];
        $('#WHT_Percent').val(w ? g(w, 'TaxPercentage') : 0);
        $('#WHT_IncludeTax').val(w ? g(w, 'IncludeTax') : 0);
        if (cb) cb();
    });
}

// Vendor Invoice Date / Cluster / WHT code change -> re-fetch + recalc
$(document).on('change', '#JOSVIH_VendorInvoiceDate', function () {
    var vno = num($('#JOSVIH_JW_Vendor_Number').val());
    if (!vno) return;
    $.get(JWI_URL + '/vendor/get', { VendorNumber: vno, InvoiceDate: dateYMD('JOSVIH_VendorInvoiceDate') }, function (list) {
        if (list && list.length) {
            var v = list[0];
            LoadTaxClusters(vno, g(v, 'TaxClusterNumber'), g(v, 'TaxCluster'));
            $('#JOSVIH_WHT_Number').val(num(g(v, 'TaxCode')));
        }
        GetWHT(RecalcAllRows);
    });
});
$(document).on('change', '#JOSVIH_TCT_Number', function () { RecalcAllRows(); });
$(document).on('change', '#JOSVIH_WHT_Number', function () { GetWHT(RecalcAllRows); });

// Material Segregation change -> items belong to old MS, clear
$(document).on('change', '#JOSVIH_MS_Number', function () {
    if ($('#TableBody tr').length) { $('#TableBody').empty(); CalculateTotals(); }
});

/* =====================================================================
   RECEIPT NOTE POPUP
   ===================================================================== */
$(document).on('click', '#BtnAddRN', function () {
    var vno = num($('#JOSVIH_JW_Vendor_Number').val()), ms = num($('#JOSVIH_MS_Number').val());
    if (!vno) return showAlert('Select Vendor first.');
    if (!ms) return showAlert('Select Material Segregation first.');
    $.get(JWI_URL + '/receipt-note', { VendorNumber: vno, MSNumber: ms, JOSVIH_Number: num($('#JOSVIH_Number').val()) || null }, function (list) {
        var $b = $('#RNTableBody').empty();
        var inGrid = {};
        ActiveRows().each(function () { inGrid[$(this).attr('data-rn')] = 1; });
        (list || []).forEach(function (r) {
            var no = g(r, 'JORNH_Number');
            $b.append('<tr><td class="text-center"><input type="checkbox" class="rn-chk form-check-input" value="' + no + '"' + (inGrid[no] ? ' checked' : '') + '></td>' +
                '<td>' + esc(g(r, 'JORNH_RN_No')) + '</td>' +
                '<td>' + fmtDate(g(r, 'JORNH_RN_Date')) + '</td>' +
                '<td>' + esc(g(r, 'JORNH_VendorDC_No') || '') + '</td>' +
                '<td class="text-end">' + fmt(g(r, 'TotalQty')) + '</td>' +
                '<td class="text-end">' + fmt(g(r, 'TotalInvoicedQty')) + '</td>' +
                '<td class="text-end">' + fmt(g(r, 'RemainingQty')) + '</td>' +
                '<td class="text-center"><input type="checkbox" class="rn-recover form-check-input" value="' + no + '"></td></tr>');
        });
        if (!$b.children().length) $b.append('<tr><td colspan="8" class="text-center">No Receipt Note available</td></tr>');
        SyncRNCheckAll();
        $('#RNModal').modal('show');
    });
});
function SyncRNCheckAll() {
    var n = $('.rn-chk').length;
    $('#RNCheckAll').prop('checked', n > 0 && $('.rn-chk:checked').length === n);
}
$(document).on('change', '#RNCheckAll', function () { $('.rn-chk').prop('checked', this.checked); });
$(document).on('change', '.rn-chk', SyncRNCheckAll);

$(document).on('click', '#RNInsertBtn', function () {
    var ids = $('.rn-chk:checked').map(function () { return this.value; }).get();
    var rec = $('.rn-recover:checked').map(function () { return this.value; }).get();
    var shown = $('.rn-chk').map(function () { return this.value; }).get();

    // 1. un-ticked RN (that was listed) -> remove its rows from grid
    shown.forEach(function (rn) {
        if (ids.indexOf(rn) < 0) $('#TableBody tr[data-rn="' + rn + '"]').remove();
    });
    // 2. recover deleted rows
    rec.forEach(function (rn) {
        $('#TableBody tr[data-rn="' + rn + '"][data-deleted="1"]').show().attr('data-deleted', '0');
    });
    $('#JWI_ChkAll').prop('checked', false);

    if (!ids.length) { $('#RNModal').modal('hide'); CalculateTotals(); return; }
    CalculateTotals();
    $.get(JWI_URL + '/receipt-note-items', { VendorNumber: $('#JOSVIH_JW_Vendor_Number').val(), RNNumbers: ids.join(',') }, function (list) {
        var $new = [];
        (list || []).forEach(function (it) {
            if (num(g(it, 'RemainingQty')) <= 0) return;
            if (FindRowByItem(num(g(it, 'JORNI_Number'))).length) return;   // already in grid (incl. deleted)
            $new.push(AddItemRow(it));
        });
        $('#RNModal').modal('hide');
        if ($new.length) $new.forEach(function ($r) { RecalcRow($r); });
        else CalculateTotals();
    });
});

function fmtDate(v) {
    var p = parseDate(v); if (!p) return '';
    return String(p.d).padStart(2, '0') + '-' + String(p.m).padStart(2, '0') + '-' + p.y;
}

/* =====================================================================
   ITEM GRID
   ===================================================================== */
function ActiveRows() { return $('#TableBody tr[data-deleted="0"]'); }
function FindRowByItem(no) { return $('#TableBody tr[data-jorni="' + no + '"]'); }

function AddItemRow(it) {
    var item = {
        JOSVII_JORNH_Number: num(g(it, 'JORNH_Number')),
        JOSVII_JORNI_Number: num(g(it, 'JORNI_Number')),
        JOSVII_JOJWI_SVOH_Number: num(g(it, 'JORNI_JOJWI_SVOH_Number')),
        JOSVII_JOJWI_SVOI_Number: num(g(it, 'JORNI_JOJWI_SVOI_Number')),
        JOSVII_Vendor_DN_No: g(it, 'JORNH_VendorDC_No') || '',
        JOSVII_SVO_Assign: 'RECEIPT NOTE',
        HasSO: num(g(it, 'HasServiceOrder')) === 1 || num(g(it, 'JORNI_JOJWI_SVOH_Number')) > 0,
        JOSVII_JPRS_Number: num(g(it, 'JORNI_JPRS_Number')),
        JOSVII_Item_Number: num(g(it, 'JORNI_Item_Number')),
        JOSVII_UoM_Number: num(g(it, 'JORNI_UoM_Number')),
        JOSVII_SAC_Number: num(g(it, 'SAC_Number')),
        JOSVII_UnitPrice: num(g(it, 'JORNI_UnitPrice')),
        Remaining: num(g(it, 'RemainingQty'))
    };
    var $tr = $('<tr></tr>').data('item', item).data('gst', [])
        .attr('data-rn', item.JOSVII_JORNH_Number).attr('data-jorni', item.JOSVII_JORNI_Number).attr('data-deleted', '0');
    // every cell = readonly form-control with its own class (width logic works on these classes)
    var ro = function (cls, v) {
        return '<td><input class="form-control ' + cls + '" value="' + String(v === undefined || v === null ? '' : v)
            .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;') + '" readonly autocomplete="off"></td>';
    };
    $tr.append(
        '<td class="p-2 del text-center"><input type="checkbox" class="JWI_RowChk form-check-input"></td>' +
        SoCell(item, g(it, 'ServiceOrderNo')) +
        ro('JOSVII_DN_No', item.JOSVII_Vendor_DN_No) +
        ro('JOSVII_Process', g(it, 'JPRS_ProcessName')) +
        ro('JOSVII_ItemCode', g(it, 'ItemCode')) +
        ro('JOSVII_ItemDescription', g(it, 'ItemDescription')) +
        ro('JOSVII_OuterDia', g(it, 'OuterDia')) +
        ro('JOSVII_Thickness', g(it, 'Thickness')) +
        ro('JOSVII_Length', g(it, 'Length')) +
        ro('JOSVII_MaterialGrade', g(it, 'MaterialGrade')) +
        ro('JOSVII_ItemGroup', g(it, 'ItemGroup')) +
        ro('JOSVII_UoM', g(it, 'UOM')) +
        ro('JOSVII_DeliveredQty', fmtQ(g(it, 'ReceivedQty'))) +
        ro('JOSVII_PrevInvoiceQty', fmtQ(g(it, 'InvoicedQty'))) +
        '<td><input type="text" class="form-control JOSVII_Qty qty" autocomplete="off" value="' + fmtQ(item.Remaining) + '"></td>' +
        ro('JOSVII_UnitPrice up', fmt(item.JOSVII_UnitPrice)) +
        ro('JOSVII_Amount amt', '0.00') +
        ro('JOSVII_SAC', g(it, 'SAC')) +
        ro('JOSVII_GST_Amount gst', '0.00') +
        ro('JOSVII_WHT_Percent whtp', '0.00') +
        ro('JOSVII_WH_TaxAmount wht', '0.00'));
    $('#TableBody').append($tr);
    if (!item.HasSO) LoadSoDropdown($tr);
    return $tr;
}

/* ---- Service Order cell : label (RN item already has SO) / dropdown (no SO) ---- */
function SoCell(item, soNo) {
    if (item.HasSO) {
        return '<td><input class="form-control JOSVII_SO_No" value="' +
            String(soNo === undefined || soNo === null ? '' : soNo).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;') +
            '" readonly autocomplete="off"></td>';
    }
    return '<td><select class="form-control JOSVII_SO_No so-select" autocomplete="off">' +
        '<option value="0" data-svoi="0"></option></select></td>';
}

// Vendor + Process + Item + UoM matching Service Orders
function LoadSoDropdown($tr) {
    var item = $tr.data('item'), $s = $tr.find('.so-select');
    $.get(JWI_URL + '/service-order', {
        VendorNumber: num($('#JOSVIH_JW_Vendor_Number').val()),
        JPRS_Number: item.JOSVII_JPRS_Number,
        Item_Number: item.JOSVII_Item_Number,
        UoM_Number: item.JOSVII_UoM_Number,
        JOSVIH_Number: num($('#JOSVIH_Number').val()) || ''
    }, function (list) {
        (list || []).forEach(function (o) {
            $s.append($('<option></option>').val(o.value).attr('data-svoi', o.svoiNumber).text(o.text));
        });
    }).fail(function (xhr) {
        // was silent before : a server error looked like an empty dropdown
        console.error('Service Order dropdown failed', xhr.status, xhr.responseText);
        showAlert('Service Order list could not be loaded.');
    });
}

// SO selected -> SVOH/SVOI, unit price (readonly), assign flag, recalc row
$(document).on('change', '#TableBody .so-select', function () {
    var $s = $(this), $tr = $s.closest('tr'), item = $tr.data('item');
    var svoh = num($s.val());

    if (!svoh) {                                   // blank -> clear
        item.JOSVII_JOJWI_SVOH_Number = 0;
        item.JOSVII_JOJWI_SVOI_Number = 0;
        item.JOSVII_UnitPrice = 0;
        item.JOSVII_SVO_Assign = 'RECEIPT NOTE';
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
        $tr.find('.up').val(fmt(item.JOSVII_UnitPrice));   // unit price stays readonly
        RecalcRow($tr);
    }).fail(function () { showAlert('Service Order price could not be loaded.'); });
});

/* ---- checkbox / delete row ---- */
$(document).on('change', '#JWI_ChkAll', function () {
    ActiveRows().find('.JWI_RowChk').prop('checked', this.checked);
});
$(document).on('change', '.JWI_RowChk', function () {
    var $a = ActiveRows();
    $('#JWI_ChkAll').prop('checked', $a.length > 0 && $a.find('.JWI_RowChk:checked').length === $a.length);
});
// remove RN rows completely when every row of that RN is deleted
function RemoveEmptyRN() {
    var seen = {};
    $('#TableBody tr').each(function () { seen[$(this).attr('data-rn')] = 1; });
    Object.keys(seen).forEach(function (rn) {
        var $all = $('#TableBody tr[data-rn="' + rn + '"]');
        if ($all.length && $all.filter('[data-deleted="0"]').length === 0) $all.remove();
    });
}
$(document).on('click', '#BtnDeleteRow', function () {
    var $sel = ActiveRows().filter(function () { return $(this).find('.JWI_RowChk').prop('checked'); });
    if (!$sel.length) return showAlert('Select at least one row.');
    $sel.each(function () {
        $(this).attr('data-deleted', '1').hide().find('.JWI_RowChk').prop('checked', false);
    });
    RemoveEmptyRN();
    $('#JWI_ChkAll').prop('checked', false);
    CalculateTotals();
});

$(document).on('input', '#TableBody .qty', function () {
    var $tr = $(this).closest('tr'), rem = $tr.data('item').Remaining, q = num(this.value);
    if (q > rem) { showAlert('Qty cannot exceed Remaining Qty (' + fmtQ(rem) + ').'); this.value = fmtQ(rem); }
});
$(document).on('change', '#TableBody .qty', function () {
    this.value = fmtQ(this.value);
    RecalcRow($(this).closest('tr'));
});

// Amount -> GST -> WHT for one row (async because GST is server calculated)
function RecalcRow($tr, done) {
    var item = $tr.data('item');
    var qty = num($tr.find('.qty').val());
    var amount = r2(qty * item.JOSVII_UnitPrice);
    $tr.find('.amt').val(fmt(amount));

    var cluster = num($('#JOSVIH_TCT_Number').val());
    var finish = function (gstRows) {
        var gstAmt = r2(gstRows.reduce(function (s, x) { return s + num(g(x, 'Amount')); }, 0));
        $tr.data('gst', gstRows);
        $tr.find('.gst').val(fmt(gstAmt));
        var pct = num($('#WHT_Percent').val());
        var base = (num($('#WHT_IncludeTax').val()) === 1) ? amount + gstAmt : amount;
        var wht = pct > 0 ? r2(base * pct / 100) : 0;
        $tr.find('.whtp').val(fmt(pct));
        $tr.find('.wht').val(fmt(wht));
        CalculateTotals();
        if (done) done();
    };
    if (!cluster || !item.JOSVII_SAC_Number || amount <= 0) return finish([]);
    $.get(JWI_URL + '/gst', { Cluster: cluster, SAC: item.JOSVII_SAC_Number, InvoiceDate: dateYMD('JOSVIH_VendorInvoiceDate'), BaseAmount: amount }, finish)
        .fail(function () { finish([]); });
}

function RecalcAllRows() {
    var $rows = $('#TableBody tr');
    if (!$rows.length) return CalculateTotals();
    $rows.each(function () { RecalcRow($(this)); });
}

function CalculateTotals() {
    var d = 0, p = 0, q = 0, a = 0, gs = 0, w = 0;
    ActiveRows().each(function () {
        d += num($(this).find('.JOSVII_DeliveredQty').val());
        p += num($(this).find('.JOSVII_PrevInvoiceQty').val());
        q += num($(this).find('.qty').val());
        a += num($(this).find('.amt').val());
        gs += num($(this).find('.gst').val());
        w += num($(this).find('.wht').val());
    });
    $('#TotalDelivered').text(fmtQ(d)); $('#TotalPrev').text(fmtQ(p));
    $('#TotalQty').text(fmtQ(q)); $('#TotalAmount').text(fmt(a));
    $('#TotalGST').text(fmt(gs)); $('#TotalWHT').text(fmt(w));
    $('#NetTotal').text(fmt(a + gs - w));
    setTimeout(ResizeColumns, 200);
}

/* =====================================================================
   GST BUTTON (read only - fresh GST breakup of the ticked row)
   ===================================================================== */
$(document).on('click', '#BtnGST', function () {
    var $r = ActiveRows().filter(function () { return $(this).find('.JWI_RowChk').prop('checked'); }).first();
    if (!$r.length) return showAlert('Select a row.');
    var item = $r.data('item'), amount = num($r.find('.amt').val()), cluster = num($('#JOSVIH_TCT_Number').val());
    var $b = $('#GSTTableBody').empty();
    var render = function (rows) {
        var tot = 0;
        if (!rows || !rows.length) $b.append('<tr><td colspan="9" class="text-center">No GST</td></tr>');
        (rows || []).forEach(function (x) {
            tot += num(g(x, 'Amount'));
            $b.append('<tr><td>' + esc(g(x, 'TaxCategory')) + '</td><td>' + esc(g(x, 'TaxType')) + '</td><td class="text-center">' + esc(g(x, 'TaxIndex')) +
                '</td><td>' + esc(g(x, 'TaxElementName')) + '</td><td class="text-end">' + fmt(g(x, 'AssessableValue')) +
                '</td><td class="text-end">' + fmt(g(x, 'Percentage')) + '</td><td class="text-end">' + fmt(g(x, 'Amount')) +
                '</td><td class="text-center">' + esc(g(x, 'LoadonInventory')) + '</td><td class="text-end">' + fmt(g(x, 'LoadonInventoryPercent')) + '</td></tr>');
        });
        $('#GSTTotal').text(fmt(tot));
        $('#GSTModal').modal('show');
    };
    if (!cluster || !item.JOSVII_SAC_Number || amount <= 0) return render([]);
    $.get(JWI_URL + '/gst', { Cluster: cluster, SAC: item.JOSVII_SAC_Number, InvoiceDate: dateYMD('JOSVIH_VendorInvoiceDate'), BaseAmount: amount }, render)
        .fail(function () { render([]); });
});

/* =====================================================================
   ADDRESS POPUP   (vendor address endpoint = Step 6B : /vendor-address)
   ===================================================================== */
function AddressRowHtml(a) {
    var $sel = $('#AddressTypeSelect').clone().removeAttr('id').addClass('form-select form-select-sm adtp').show();
    $sel.val(g(a, 'JOSVIA_ADTP_Number', 'ADTP_Number') || 0);
    var $tr = $('<tr></tr>');
    $tr.append($('<td></td>').append($sel));
    [['Address_ID', 'adid'], ['Address', 'adr'], ['City', 'city'], ['State', 'state'], ['Country', 'country'], ['PIN', 'pin'], ['GSTIN', 'gstin']]
        .forEach(function (f) {
            $tr.append('<td><input type="text" class="form-control form-control-sm ' + f[1] + '" value="' +
                esc(g(a, 'JOSVIA_' + f[0], f[0]) || '').replace(/"/g, '&quot;') + '"></td>');
        });
    $tr.append('<td><button type="button" class="btn btn-sm btn-danger ad-del">X</button></td>');
    return $tr;
}
function RenderAddresses() {
    var $b = $('#AddressTableBody').empty();
    JWI_Addresses.forEach(function (a) { $b.append(AddressRowHtml(a)); });
}
$(document).on('click', '#BtnAddress', function () {
    var vno = num($('#JOSVIH_JW_Vendor_Number').val());
    if (!vno) return showAlert('Select Vendor first.');
    if (!JWI_Addresses.length) {
        $.get(JWI_URL + '/vendor-address', { VendorNumber: vno }, function (list) {
            JWI_Addresses = list || []; RenderAddresses();
            $('#AddressModal').modal('show');
        });
    } else { RenderAddresses(); $('#AddressModal').modal('show'); }
});
$(document).on('click', '#BtnAddAddressRow', function () { $('#AddressTableBody').append(AddressRowHtml({})); });
$(document).on('click', '.ad-del', function () { $(this).closest('tr').remove(); });
$(document).on('click', '#BtnSaveAddress', function () {
    var list = [];
    $('#AddressTableBody tr').each(function () {
        var $r = $(this);
        list.push({
            JOSVIA_ADTP_Number: num($r.find('.adtp').val()),
            JOSVIA_Address_ID: $r.find('.adid').val(), JOSVIA_Address: $r.find('.adr').val(),
            JOSVIA_City: $r.find('.city').val(), JOSVIA_State: $r.find('.state').val(),
            JOSVIA_Country: $r.find('.country').val(), JOSVIA_PIN: $r.find('.pin').val(),
            JOSVIA_GSTIN: $r.find('.gstin').val()
        });
    });
    for (var i = 0; i < list.length; i++)
        if (!list[i].JOSVIA_ADTP_Number || !list[i].JOSVIA_Address_ID) return showAlert('Address Type and Address ID are required (row ' + (i + 1) + ').');
    JWI_Addresses = list;
    $('#AddressModal').modal('hide');
});

/* =====================================================================
   VALIDATE + MODEL + SAVE
   ===================================================================== */
function ValidateHeader() {
    var e = [];
    if (!$.trim($('#JOSVIH_JournalNo').val())) e.push('Journal No. is required.');
    if (!parseDate($('#JOSVIH_JournalDate').val())) e.push('Journal Date is required.');
    if (!$.trim($('#JOSVIH_VendorInvoiceNo').val())) e.push('Vendor Invoice No. is required.');
    if (!parseDate($('#JOSVIH_VendorInvoiceDate').val())) e.push('Vendor Invoice Date is required.');
    if (!num($('#JOSVIH_MS_Number').val())) e.push('Material Segregation is required.');
    if (!num($('#JOSVIH_JW_Vendor_Number').val())) e.push('Select Vendor from the list.');
    if (!num($('#JOSVIH_TCT_Number').val())) e.push('Tax Cluster is required.');
    return e;
}
function ValidateItems() {
    var e = [], $rows = ActiveRows();
    if (!$rows.length) e.push('Add at least one item.');
    $rows.each(function (i) {
        var $r = $(this), q = num($r.find('.qty').val()), rem = $r.data('item').Remaining;
        if (q <= 0) e.push('Row ' + (i + 1) + ': Qty must be greater than 0.');
        else if (q > rem) e.push('Row ' + (i + 1) + ': Qty exceeds Remaining Qty.');
        if (!$r.data('item').JOSVII_SAC_Number) e.push('Row ' + (i + 1) + ': SAC missing.');
    });
    return e;
}

function CreateModel() {
    var m = { Header: {}, Items: [], Addresses: JWI_Addresses, GST: [] };
    m.Header = {
        JOSVIH_Number: num($('#JOSVIH_Number').val()),
        JOSVIH_JournalNo: $.trim($('#JOSVIH_JournalNo').val()),
        JOSVIH_JournalDate: dateISO('JOSVIH_JournalDate'),
        JOSVIH_VendorInvoiceNo: $.trim($('#JOSVIH_VendorInvoiceNo').val()),
        JOSVIH_VendorInvoiceDate: dateISO('JOSVIH_VendorInvoiceDate'),
        JOSVIH_MS_Number: num($('#JOSVIH_MS_Number').val()),
        JOSVIH_JW_Vendor_Number: num($('#JOSVIH_JW_Vendor_Number').val()),
        JOSVIH_Currency_Number: num($('#JOSVIH_Currency_Number').val()),
        JOSVIH_TCT_Number: num($('#JOSVIH_TCT_Number').val()),
        JOSVIH_WHT_Number: num($('#JOSVIH_WHT_Number').val()),
        JOSVIH_PaymentTerms: $('#JOSVIH_PaymentTerms').val(),
        JOSVIH_PaymentMethod: $('#JOSVIH_PaymentMethod').val(),
        JOSVIH_Remarks: $('#JOSVIH_Remarks').val()
    };
    ActiveRows().each(function () {
        var $r = $(this), it = $r.data('item');
        m.Items.push({
            JOSVII_Number: it.JOSVII_Number || 0,
            JOSVII_JORNH_Number: it.JOSVII_JORNH_Number, JOSVII_JORNI_Number: it.JOSVII_JORNI_Number,
            JOSVII_JOJWI_SVOH_Number: it.JOSVII_JOJWI_SVOH_Number, JOSVII_JOJWI_SVOI_Number: it.JOSVII_JOJWI_SVOI_Number,
            JOSVII_Vendor_DN_No: it.JOSVII_Vendor_DN_No,
            JOSVII_SVO_Assign: it.JOSVII_SVO_Assign || 'RECEIPT NOTE',
            JOSVII_JPRS_Number: it.JOSVII_JPRS_Number, JOSVII_Item_Number: it.JOSVII_Item_Number,
            JOSVII_UoM_Number: it.JOSVII_UoM_Number,
            JOSVII_Qty: num($r.find('.qty').val()), JOSVII_UnitPrice: it.JOSVII_UnitPrice,
            JOSVII_Amount: num($r.find('.amt').val()), JOSVII_SAC_Number: it.JOSVII_SAC_Number,
            JOSVII_GST_Amount: num($r.find('.gst').val()),
            JOSVII_WHT_Percent: num($r.find('.whtp').val()), JOSVII_WH_TaxAmount: num($r.find('.wht').val())
        });
        ($r.data('gst') || []).forEach(function (x) {
            m.GST.push({
                JOSVII_JORNI_Number: it.JOSVII_JORNI_Number,
                JOSVIG_Index: num(g(x, 'TaxIndex')),
                JOSVIG_GSTC_Number: num(g(x, 'GSTCNumber')), JOSVIG_GSTT_Number: num(g(x, 'GSTTNumber')),
                JOSVIG_GSTE_Number: num(g(x, 'GSTENumber')),
                JOSVIG_AssessableValue: num(g(x, 'AssessableValue')),
                JOSVIG_Percent: num(g(x, 'Percentage')), JOSVIG_GST_Amount: num(g(x, 'Amount'))
            });
        });
    });
    return m;
}

var JWI_Saving = false;
$(document).on('click', '#BtnSave', function () {
    if (JWI_Saving) return;
    var errs = ValidateHeader().concat(ValidateItems());
    if (errs.length) return showAlert(errs.join('<br/>'));

    JWI_Saving = true; $('#BtnSave').prop('disabled', true);
    $.ajax({
        url: JWI_URL + '/save', type: 'POST', contentType: 'application/json',
        data: JSON.stringify(CreateModel())
    }).done(function (r) {
        if (r && r.success) { window.location.href = r.redirectUrl || (JWI_URL + '-summary'); }
        else { showAlert((r && r.message) || 'Save failed.'); JWI_Saving = false; $('#BtnSave').prop('disabled', false); }
    }).fail(function () {
        showAlert('Server error. Please try again.'); JWI_Saving = false; $('#BtnSave').prop('disabled', false);
    });
});

/* =====================================================================
   WIDTH LOGIC  (same as old Jobwork Invoice : ApplyFieldWidths / fitInputWidth)
   ===================================================================== */
const ItemTableFields = [
    { cls: ".JOSVII_SO_No", min: 20, max: 25, align: "left" },
    { cls: ".JOSVII_DN_No", min: 20, max: 25, align: "left" },
    { cls: ".JOSVII_Process", min: 10, max: 25, align: "left" },
    { cls: ".JOSVII_ItemCode", min: 10, max: 15, align: "left" },
    { cls: ".JOSVII_ItemDescription", min: 40, max: 40, align: "left" },
    { cls: ".JOSVII_OuterDia", min: 8, max: 8, align: "center" },
    { cls: ".JOSVII_Thickness", min: 8, max: 8, align: "center" },
    { cls: ".JOSVII_Length", min: 8, max: 8, align: "center" },
    { cls: ".JOSVII_MaterialGrade", min: 10, max: 25, align: "left" },
    { cls: ".JOSVII_ItemGroup", min: 10, max: 30, align: "left" },
    { cls: ".JOSVII_UoM", min: 10, max: 15, align: "center" },
    { cls: ".JOSVII_SAC", min: 8, max: 8, align: "left" },
    { cls: ".JOSVII_DeliveredQty", min: 10, max: 20, align: "center" },
    { cls: ".JOSVII_PrevInvoiceQty", min: 10, max: 20, align: "center" },
    { cls: ".JOSVII_Qty", min: 10, max: 20, align: "center" },
    { cls: ".JOSVII_UnitPrice", min: 10, max: 20, align: "right" },
    { cls: ".JOSVII_Amount", min: 13, max: 25, align: "right" },
    { cls: ".JOSVII_GST_Amount", min: 13, max: 25, align: "right" },
    { cls: ".JOSVII_WHT_Percent", min: 10, max: 20, align: "right" },
    { cls: ".JOSVII_WH_TaxAmount", min: 13, max: 25, align: "right" }
];

function ResizeColumns() {
    if (typeof ApplyFieldWidths !== 'function') return;
    ApplyFieldWidths({ fields: ItemTableFields, container: "#ItemTable", tableBody: "#TableBody" });
}

var HeaderWidths = {
    JOSVIH_JournalNo: [20, 25], JOSVIH_VendorInvoiceNo: [20, 25], JOSVIH_MS_Number: [20, 30],
    JOSVIH_JW_Vendor_Name: [40, 50], JOSVIH_Currency_Number: [10, 10], JOSVIH_TCT_Number: [20, 25],
    JOSVIH_WHT_Number: [20, 25], JOSVIH_PaymentTerms: [30, 40], JOSVIH_PaymentMethod: [30, 40], JOSVIH_Remarks: [40, 40]
};
function AutoFit() {
    if (typeof fitInputWidth !== 'function') return;
    Object.keys(HeaderWidths).forEach(function (id) { fitInputWidth(id, HeaderWidths[id][0], HeaderWidths[id][1]); });
}
$(document).on("keyup change input", "#" + Object.keys(HeaderWidths).join(", #"), function () {
    if (typeof fitInputWidth !== 'function') return;
    var w = HeaderWidths[this.id];
    if (w) fitInputWidth(this, w[0], w[1]);
});

// Date field: Tab / Shift+Tab -> skip day/month/year, go to next/previous control
$(document).on('keydown', '#JOSVIH_JournalDate, #JOSVIH_VendorInvoiceDate', function (e) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    var f = $('input:visible, select:visible, textarea:visible, button:visible')
        .filter(function () { return !this.disabled && this.tabIndex !== -1 && this.type !== 'hidden'; });
    var i = f.index(this);
    var n = e.shiftKey ? i - 1 : i + 1;
    if (n >= 0 && n < f.length) f.eq(n).focus();
});
// document ready + load : whichever fires, widths are applied
$(function () { CalculateTotals(); setTimeout(function () { AutoFit(); ResizeColumns(); }, 300); });

// default form setting (Create page only)
$(function () { LoadDefaultFormSetting(); });
$(window).on("load", function () { setTimeout(function () { AutoFit(); ResizeColumns(); }, 300); });
