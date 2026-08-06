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
        ".JSOR_Date",
        ".JSOR_EndDate",
        "/ServiceOrderNumber/ValidateDateRange",
        "Reset"
    );

    // Prefix
    validateDateRange(
        ".JSOP_Date",
        ".JSOP_EndDate",
        "/ServiceOrderNumber/ValidatePrefixDateRange",
        "Prefix"
    );

    // Suffix
    validateDateRange(
        ".JSOS_Date",
        ".JSOS_EndDate",
        "/ServiceOrderNumber/ValidateSuffixDateRange",
        "Suffix"
    );
