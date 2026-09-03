function validateDateRange(dateClass, endDateClass, sectionName) {

    // Initialize prevVal with whatever's already rendered (existing rows)
    $(`${dateClass}, ${endDateClass}`).each(function () {
        $(this).data("prevVal", $(this).val());
    });

    $(document).on("change", `${dateClass}, ${endDateClass}`, function () {

        let $changedField = $(this);
        let currentRow = $changedField.closest("tr");

        let startDate = currentRow.find(dateClass).val();
        let endDate = currentRow.find(endDateClass).val();

        if (startDate == "")
            return;

        if (endDate == "")
            endDate = startDate;

        let start = new Date(startDate);
        let end = new Date(endDate);

        // End Date Validation
        if (end < start) {
            alert("End Date must be greater than or equal to Start Date.");
            revertField($changedField);
            return;
        }

        //==============================================
        // Validate against current table rows
        // (covers saved rows too, since they're already
        // rendered in the table — no AJAX needed)
        //==============================================

        let overlap = false;

        $(dateClass).each(function () {

            let row = $(this).closest("tr");

            if (row.is(currentRow))
                return;

            // Skip removed/hidden rows
            if (row.is(":hidden"))
                return;

            let isDeletedInput = row.find("input[name*='IsDeleted']");
            if (isDeletedInput.length && isDeletedInput.val() === "true")
                return;

            let rowStart = row.find(dateClass).val();
            let rowEnd = row.find(endDateClass).val();

            if (rowStart == "")
                return;

            if (rowEnd == "")
                rowEnd = rowStart;

            let s2 = new Date(rowStart);
            let e2 = new Date(rowEnd);

            if (start <= e2 && end >= s2) {
                overlap = true;
                return false;
            }
        });

        if (overlap) {
            alert(`The selected ${sectionName} date range overlaps with another row.`);
            revertField($changedField);
            return;
        }

        // Validation passed - this becomes the new "known good" value
        $changedField.data("prevVal", $changedField.val());

    });
}

// Restores the field to its last valid value (prevVal) — never clears,
// never keeps the invalid chosen date.
function revertField($field) {
    let prevVal = $field.data("prevVal") || "";
    let fp = $field[0]._flatpickr;

    if (fp) {
        if (prevVal) {
            fp.setDate(prevVal, false);
        } else {
            fp.clear(false);
        }
    } else {
        $field.val(prevVal);
    }
}

// Reset
validateDateRange(
    ".JIJWI_SVO_NRS_StartDate",
    ".JIJWI_SVO_NRS_EndDate",
    "Reset"
);

// Prefix
validateDateRange(
    ".JIJWI_SVO_PFX_StartDate",
    ".JIJWI_SVO_PFX_EndDate",
    "Prefix"
);

// Suffix
validateDateRange(
    ".JIJWI_SVO_SFX_StartDate",
    ".JIJWI_SVO_SFX_EndDate",
    "Suffix"
);