function ToInputDate(d) {
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
}

function FmtDate(v) {
    if (!v) return '-';
    var d = new Date(v);
    if (isNaN(d)) return '-';
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    return dd + '-' + mm + '-' + d.getFullYear();
}

// zero / empty -> "-", otherwise Indian comma format
function FmtQty(v) {
    var n = Number(v) || 0;
    return n === 0 ? '-' : n.toLocaleString('en-IN');
}

function Esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

var MAX_BUCKETS = 10;

// buckets currently in force (applied on last "OK") - used by Get
var AppliedBuckets = [
    { from: 0, to: 30 },
    { from: 31, to: 60 },
    { from: 61, to: 90 },
    { from: 91, to: 180 },
    { from: 181, to: null }
];

$(document).ready(function () {
    $("#ClosingDate").val(ToInputDate(new Date()));   // today
    $("#ItemGroupNumber").val("");
    $("#WarehouseNumber").val("");
    $("#ItemNumber").val("");
    $("#BatchNumber").val("");

    RenderBucketRows(AppliedBuckets);
    LoadInventoryAgeing();
});

$("#btnGet").on("click", function () {
    LoadInventoryAgeing();
});

/* ---------------- Ageing bucket popover ---------------- */

$("#btnAgeingBucket").on("click", function () {
    RenderBucketRows(AppliedBuckets);      // reopen showing last-applied config
    $("#AgeingBucketPopover").toggle();
});

$("#btnAddBucketPair").on("click", function () {
    var rows = $("#BucketPairsList .bucket-pair");
    if (rows.length >= MAX_BUCKETS) {
        alert("Maximum " + MAX_BUCKETS + " buckets allowed.");
        return;
    }
    AddBucketRow(null, null);
});

$(document).on("click", "#BucketPairsList .btnRemoveBucketPair", function () {
    if ($("#BucketPairsList .bucket-pair").length <= 1) return; // keep at least 1
    $(this).closest(".bucket-pair").remove();
});

$("#btnBucketOk").on("click", function () {
    var parsed = CollectBucketRows();
    if (!parsed.ok) {
        alert(parsed.message);
        return;
    }
    AppliedBuckets = parsed.buckets;
    $("#AgeingBucketPopover").hide();
    // per spec: bucket change only takes effect when Get is clicked, not applied automatically
});

function RenderBucketRows(buckets) {
    var list = $("#BucketPairsList");
    list.empty();
    buckets.forEach(function (b) { AddBucketRow(b.from, b.to); });
}

function AddBucketRow(from, to) {
    var row = $(
        '<div class="bucket-pair d-flex align-items-center gap-1 mb-1">' +
        '<input type="number" class="form-control form-control-sm bucket-from" style="width:80px" placeholder="From" />' +
        '<span>to</span>' +
        '<input type="number" class="form-control form-control-sm bucket-to" style="width:80px" placeholder="To (blank = open-ended)" />' +
        '<button type="button" class="btn btn-sm btn-outline-danger btnRemoveBucketPair">&times;</button>' +
        '</div>'
    );
    if (from !== null && from !== undefined) row.find(".bucket-from").val(from);
    if (to !== null && to !== undefined) row.find(".bucket-to").val(to);
    $("#BucketPairsList").append(row);
}

function CollectBucketRows() {
    var rows = $("#BucketPairsList .bucket-pair");
    if (rows.length === 0) return { ok: false, message: "Add at least one bucket." };

    var buckets = [];
    var invalid = false;
    rows.each(function () {
        var fromVal = $(this).find(".bucket-from").val();
        var toVal = $(this).find(".bucket-to").val();
        if (fromVal === "" || fromVal === null) { invalid = true; return false; }
        var from = parseInt(fromVal, 10);
        var to = (toVal === "" || toVal === null) ? null : parseInt(toVal, 10);
        if (isNaN(from) || (to !== null && isNaN(to))) { invalid = true; return false; }
        buckets.push({ from: from, to: to });
    });
    if (invalid) return { ok: false, message: "Enter a valid number in every From box (To may be left blank only for an open-ended bucket)." };

    buckets.sort(function (a, b) { return a.from - b.from; });

    for (var i = 0; i < buckets.length; i++) {
        var b = buckets[i];
        if (b.to !== null && b.to < b.from) {
            return { ok: false, message: "Bucket " + b.from + "-" + b.to + " is invalid (To < From)." };
        }
        var isLast = i === buckets.length - 1;
        if (b.to === null && !isLast) {
            return { ok: false, message: "Only the last bucket can be left open-ended (blank To)." };
        }
        if (i > 0) {
            var prev = buckets[i - 1];
            if (prev.to === null || b.from <= prev.to) {
                return { ok: false, message: "Buckets overlap: " + prev.from + "-" + prev.to + " and " + b.from + "-" + b.to + "." };
            }
        }
    }
    return { ok: true, buckets: buckets };
}

/* ---------------- Load + render report ---------------- */

function LoadInventoryAgeing() {
    $.ajax({
        url: "/InventoryAgeing/GetInventoryAgeingData",
        type: "GET",
        data: {
            ClosingDate: $("#ClosingDate").val(),
            ItemGroupNumber: $("#ItemGroupNumber").val(),
            WarehouseNumber: $("#WarehouseNumber").val(),
            ItemNumber: $("#ItemNumber").val(),
            BatchNumber: $("#BatchNumber").val(),
            Buckets: JSON.stringify(AppliedBuckets)
        },
        success: function (data) {
            if (data.error) {
                alert(data.error);
                return;
            }
            RenderAgeingHeader(data.buckets);
            RenderAgeingRows(data.rows, data.buckets);
        }
    });
}

function RenderAgeingHeader(bucketLabels) {
    // static columns live permanently in these same rows (cshtml) -
    // only remove/re-add the dynamic bucket columns, never the whole row
    $("#MainHeaderRow .bucket-col-th").remove();
    var headRow = $("#MainHeaderRow");
    bucketLabels.forEach(function (label) {
        headRow.append('<th class="qty bucket-col-th">' + Esc(label) + '</th>');
    });

    $("#MainFooterRow .bucket-col-td").remove();
    var footRow = $("#MainFooterRow");
    bucketLabels.forEach(function (label) {
        footRow.append('<td class="qty bucket-col-td" data-label="' + Esc(label) + '">-</td>');
    });
}

function RenderAgeingRows(rows, bucketLabels) {
    var body = $("#MyTableBody");
    body.empty();

    var totalClosing = 0;
    var bucketTotals = {};
    bucketLabels.forEach(function (label) { bucketTotals[label] = 0; });

    rows.forEach(function (r) {
        var tr = $('<tr></tr>');
        tr.append('<td>' + Esc(r.itemGroupName) + '</td>');
        tr.append('<td>' + Esc(r.itemNumber) + '</td>');
        tr.append('<td>' + Esc(r.description) + '</td>');
        tr.append('<td>' + Esc(r.outerDia) + '</td>');
        tr.append('<td>' + Esc(r.thickness) + '</td>');
        tr.append('<td>' + Esc(r.length) + '</td>');
        tr.append('<td>' + Esc(r.materialGrade) + '</td>');
        tr.append('<td>' + FmtDate(r.batchDate) + '</td>');
        tr.append('<td>' + Esc(r.batchNumber) + '</td>');
        tr.append('<td class="qty">' + FmtQty(r.closingQty) + '</td>');
        tr.append('<td class="qty">' + r.days + '</td>');

        bucketLabels.forEach(function (label) {
            var v = r[label] || 0;
            tr.append('<td class="qty">' + FmtQty(v) + '</td>');
            bucketTotals[label] += v;
        });

        body.append(tr);
        totalClosing += r.closingQty;
    });

    $("#TotalClosing").text(FmtQty(totalClosing));
    $("#MainFooterRow .bucket-col-td").each(function () {
        var label = $(this).data("label");
        $(this).text(FmtQty(bucketTotals[label]));
    });
}