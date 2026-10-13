/* ==========================================================================
   JO_CNVNumbering.js   (wwwroot/js/JO_Conversion/JO_CNVNumbering.js)
   Conversion Numbering page - date-range overlap check for the
   Reset (JOCR_), Prefix (JOCP_) and Suffix (JOCS_) grids.
   ========================================================================== */

// "dd-MMM-yyyy" (flatpickr) or any parsable date -> Date (local, no UTC shift)
function JONParseDate(str) {
    if (!str) return null;
    var m = /^(\d{1,2})[- ]([A-Za-z]{3})[- ](\d{4})$/.exec(String(str).trim());
    var d;
    if (m) {
        var mon = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(m[2].toLowerCase());
        d = new Date(+m[3], mon, +m[1]);
    } else {
        d = new Date(str);
    }
    return isNaN(d.getTime()) ? null : d;
}

// put the field back to its last valid value (never clears, never keeps the bad date)
function JONRevertField($field) {
    var prev = $field.data('prevVal') || '';
    var fp = $field[0] && $field[0]._flatpickr;
    if (fp) {
        if (prev) fp.setDate(prev, false); else fp.clear(false);
    } else {
        $field.val(prev);
    }
}

function JONMsg(text) {
    if (typeof showAlert === 'function' && document.getElementById('ModelAlert')) showAlert(text);
    else alert(text);
}

function validateDateRange(dateClass, endDateClass, sectionName) {

    // remember the values already on the page
    $(dateClass + ', ' + endDateClass).each(function () { $(this).data('prevVal', $(this).val()); });

    // rows added later: remember the value when the field is first touched
    $(document).on('focusin', dateClass + ', ' + endDateClass, function () {
        if ($(this).data('prevVal') === undefined) $(this).data('prevVal', $(this).val());
    });

    $(document).on('change', dateClass + ', ' + endDateClass, function () {
        var $changed = $(this);
        var $row = $changed.closest('tr');

        var startStr = $row.find(dateClass).val();
        var endStr = $row.find(endDateClass).val();
        if (!startStr) return;
        if (!endStr) endStr = startStr;

        var start = JONParseDate(startStr), end = JONParseDate(endStr);
        if (!start || !end) return;

        if (end < start) {
            JONMsg('End Date must be greater than or equal to Start Date.');
            JONRevertField($changed);
            return;
        }

        var overlap = false;
        $(dateClass).each(function () {
            var $r = $(this).closest('tr');
            if ($r.is($row) || $r.is(':hidden')) return;

            var del = $r.find("input[name*='IsDeleted']");
            if (del.length && String(del.val()).toLowerCase() === 'true') return;

            var s2Str = $r.find(dateClass).val();
            var e2Str = $r.find(endDateClass).val();
            if (!s2Str) return;
            if (!e2Str) e2Str = s2Str;

            var s2 = JONParseDate(s2Str), e2 = JONParseDate(e2Str);
            if (s2 && e2 && start <= e2 && end >= s2) { overlap = true; return false; }
        });

        if (overlap) {
            JONMsg('The selected ' + sectionName + ' date range overlaps with another row.');
            JONRevertField($changed);
            return;
        }

        $changed.data('prevVal', $changed.val());     // new known-good value
    });
}

validateDateRange('.JOCR_Date', '.JOCR_EndDate', 'Reset');
validateDateRange('.JOCP_Date', '.JOCP_EndDate', 'Prefix');
validateDateRange('.JOCS_Date', '.JOCS_EndDate', 'Suffix');
