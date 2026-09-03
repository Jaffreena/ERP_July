//#region Initialize Flatpickr
InitializeGstFlatpickrs();

function InitializeGstFlatpickrs() {
    $(".datepicker").each(function () {

        if (this._flatpickr) {
            return;
        }

        $(this).flatpickr({
            dateFormat: "d-M-Y",
            altInput: true,
            altFormat: "d-M-Y",
            allowInput: true,

            onOpen: function (selectedDates, dateStr, instance) {
                $(instance.input).data("prevVal", instance.input.value);
            }
        });
    });
}
//#endregion


function validateDateRange(dateClass, endDateClass, sectionName) {

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
        //==============================================

        let overlap = false;

        $(dateClass).each(function () {

            let row = $(this).closest("tr");

            if (row.is(currentRow))
                return;

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
validateDateRange(".JIRN_NRS_StartDate", ".JIRN_NRS_EndDate", "Reset");

// Prefix
validateDateRange(".JIRN_PFX_StartDate", ".JIRN_PFX_EndDate", "Prefix");

// Suffix
validateDateRange(".JIRN_SFX_StartDate", ".JIRN_SFX_EndDate", "Suffix");
