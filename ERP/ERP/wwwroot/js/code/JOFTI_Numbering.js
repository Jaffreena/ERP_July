// restores the field to its last valid value (never keeps the invalid date)
function JOFTI_revertField($field) {
    let prevVal = $field.data("prevVal") || "";
    let fp = $field[0]._flatpickr;

    if (fp) {
        if (prevVal) fp.setDate(prevVal, false);
        else fp.clear(false);
    } else {
        $field.val(prevVal);
    }
}

function JOFTI_validateDateRange(dateClass, endDateClass, sectionName) {

    // rows already rendered on the page = known good values
    $(dateClass + ", " + endDateClass).each(function () {
        $(this).data("prevVal", $(this).val());
    });

    $(document).on("change", dateClass + ", " + endDateClass, function () {

        let $changed = $(this);
        let row = $changed.closest("tr");

        let startDate = row.find(dateClass).val();
        let endDate = row.find(endDateClass).val();

        if (startDate == "") return;
        if (endDate == "") endDate = startDate;

        let start = new Date(startDate);
        let end = new Date(endDate);

        if (end < start) {
            alert("End Date must be greater than or equal to Start Date.");
            JOFTI_revertField($changed);
            return;
        }

        // overlap with the other visible rows
        let overlap = false;

        $(dateClass).each(function () {
            let other = $(this).closest("tr");

            if (other.is(row)) return;
            if (other.is(":hidden")) return;

            let del = other.find("input[name*='IsDeleted']");
            if (del.length && del.val() === "true") return;

            let s2 = other.find(dateClass).val();
            let e2 = other.find(endDateClass).val();

            if (s2 == "") return;
            if (e2 == "") e2 = s2;

            if (start <= new Date(e2) && end >= new Date(s2)) {
                overlap = true;
                return false;
            }
        });

        if (overlap) {
            alert("The selected " + sectionName + " date range overlaps with another row.");
            JOFTI_revertField($changed);
            return;
        }

        $changed.data("prevVal", $changed.val());
    });
}

JOFTI_validateDateRange(".JOFTI_NRS_StartDate", ".JOFTI_NRS_EndDate", "Reset");
JOFTI_validateDateRange(".JOFTI_PFX_StartDate", ".JOFTI_PFX_EndDate", "Prefix");
JOFTI_validateDateRange(".JOFTI_SFX_StartDate", ".JOFTI_SFX_EndDate", "Suffix");

// ---------------------------------------------------------------- submit
$(function () {
    $("#JOFTI_NumberForm").on("submit", function (event) {

        // blank rows are dropped
        $("tr.SubNewRow").each(function () {
            let d = $(this).find("input.JOFTI_SFX_StartDate").val();
            let p = $(this).find("input.JOFTI_SFX_Particulars").val();
            if (!d && !p) $(this).remove();
        });

        $("tr.PreNewRow").each(function () {
            let d = $(this).find("input.JOFTI_PFX_StartDate").val();
            let p = $(this).find("input.JOFTI_PFX_Particulars").val();
            if (!d && !p) $(this).remove();
        });

        $("tr.ResetNewRow").each(function () {
            let d = $(this).find("input.JOFTI_NRS_StartDate").val();
            let sn = $(this).find("input.JOFTI_NRS_StartingNumber").val();
            let dg = $(this).find("input.JOFTI_NRS_NumberofDigits").val();
            if (!d && !sn && !dg) $(this).remove();
        });

        let startBad = false, digitsBad = false, first = null;

        $("tr.ResetNewRow:visible").each(function () {
            let sn = $(this).find("input.JOFTI_NRS_StartingNumber");
            let n = parseInt(sn.val(), 10);
            if (isNaN(n) || n <= 0) {
                startBad = true;
                if (!first) first = sn;
            }

            let dg = $(this).find("input.JOFTI_NRS_NumberofDigits");
            if (!/^[3-9]$/.test($.trim(dg.val()))) {
                digitsBad = true;
                if (!first) first = dg;
            }
        });

        if (startBad || digitsBad) {
            event.preventDefault();

            let msg;
            if (startBad && digitsBad)
                msg = "Start Number must be greater than 0, and Number Of Digits must be a single digit between 3 and 9.";
            else if (startBad)
                msg = "Start Number must be greater than 0. Negative numbers, 0, or blank are not allowed.";
            else
                msg = "Number Of Digits must be a single digit between 3 and 9.";

            alert(msg);
            if (first) first.focus();
            return false;
        }

        // start / end date are both required
        let dateBad = false;
        $("tr.ResetNewRow:visible, tr.PreNewRow:visible, tr.SubNewRow:visible").each(function () {
            let dates = $(this).find("input.datepicker");
            if (dates.length >= 2 && (!$(dates[0]).val() || !$(dates[1]).val())) {
                dateBad = true;
                $(dates[0]).focus();
                return false;
            }
        });

        if (dateBad) {
            event.preventDefault();
            alert("Start Date and End Date are required.");
            return false;
        }
    });
});
