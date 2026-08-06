function validateDateRange(dateClass, endDateClass, url, sectionName) {

    $(document).on("change", `${dateClass}, ${endDateClass}`, function () {

        let currentRow = $(this).closest("tr");

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

            currentRow.find(endDateClass).val("").focus();
            return;
        }

        //==============================================
        // Validate against current table rows
        //==============================================

        let overlap = false;

        $(dateClass).each(function () {

            let row = $(this).closest("tr");

            // Skip current row
            if (row.is(currentRow))
                return;

            let rowStart = row.find(dateClass).val();
            let rowEnd = row.find(endDateClass).val();

            if (rowStart == "")
                return;

            if (rowEnd == "")
                rowEnd = rowStart;

            let s2 = new Date(rowStart);
            let e2 = new Date(rowEnd);

            // Overlap condition
            if (start <= e2 && end >= s2) {
                overlap = true;
                return false;
            }
        });

        if (overlap) {

            alert(`The selected ${sectionName} date range overlaps with another row.`);

            currentRow.find(dateClass).val("").focus();
            currentRow.find(endDateClass).val("");

            return;
        }

        //==============================================
        // Validate against database
        //==============================================

        $.ajax({
            url: url,
            type: "POST",
            data: {
                StartDate: startDate,
                EndDate: endDate
            },
            success: function (res) {

                if (!res.success) {

                    alert(res.message);

                    currentRow.find(dateClass).val("").focus();
                    currentRow.find(endDateClass).val("");

                    return;
                }

            },
            error: function () {
                alert(`Unable to validate ${sectionName} Date Range.`);
            }
        });

    });
}

// Reset
validateDateRange(
    ".JICR_Date",
    ".JICR_EndDate",
    "/ConversionNumber/ValidateDateRange",
    "Reset"
);

// Prefix
validateDateRange(
    ".JICP_Date",
    ".JICP_EndDate",
    "/ConversionNumber/ValidatePrefixDateRange",
    "Prefix"
);

// Suffix
validateDateRange(
    ".JICS_Date",
    ".JICS_EndDate",
    "/ConversionNumber/ValidateSuffixDateRange",
    "Suffix"
);