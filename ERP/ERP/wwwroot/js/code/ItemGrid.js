function SetTableHeight() {
    let rowHeight = $(".table-body-f tbody tr:first").outerHeight() || 27;

    $(".table-body-f").css({
        "max-height": (rowHeight * 16) + "px",
        "overflow-y": "auto"
    });
}
function OpenItemCodeSearch(inputElement) {
    $("#RightPane_Item").show().addClass("show");
    $("#RightPane_Item .search-results").show();
    searchItemJIDNI(inputElement);
}
function OnFocus(inputElement) {
    $(inputElement).data("oldItemCode", $(inputElement).val());
    if (inputElement.value) {
        $(inputElement).select();
    }
    OpenItemCodeSearch(inputElement);
}
function OnInput(inputElement) {
    searchItemJIDNI(inputElement);
}
let itemSearchXHR = null;
function searchItemJIDNI(inputElement) {

    if (itemSearchXHR) itemSearchXHR.abort();

    let itemCode = inputElement.value.trim();
    let row = $(inputElement).closest("tr");
    let resultsDiv = $("#RightPane_Item").find(".search-results");
    let material = $("#Header_JIDNH_MS_Number").val();

    if (!material) return;

    itemSearchXHR = $.ajax({
        url: '/jobinward/transactions/conversion/item',
        type: 'GET',
        data: { ItemCode: itemCode, MS: material },
        success: function (data) {

            resultsDiv.empty();
            $("#ItemMessage").hide().text("");

            if (data && data.length > 0) {

                $("#RightPane_Item").addClass("show");
                resultsDiv.show();

                let table = $(`
<div class="card-body modal-content batchPopup p-0" style="z-index:999;">
    <table class="table table-bordered table-hover table-fixed table-grid mb-0 w-100" id="tblsearch">
        <thead>
            <tr class="table-info">
                <th style="width:30%;">Item Code</th>
                <th style="width:70%;">Description</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
</div>`);

                $.each(data, function (i, item) {

                    let tr = $("<tr></tr>").css({ height: "24px", cursor: "pointer" });
                    tr.append('<td style="width:30%;">' + item.itemCode + '</td>');
                    tr.append('<td style="width:70%;">' + item.itemDescription + '</td>');
                    table.find("tbody").append(tr);

                    tr.on("click", function () {

                        row.find(".JIDNI_Item_Code").val(item.itemCode);
                        row.find(".JIDNI_Item_Number").val(item.itemNumber);
                        row.find(".JIDNI_Number").val(item.itemNumber);

                        row.find(".JIDNI_Item_Description").val(item.itemDescription);
                        row.find(".JIDNI_OuterDia").val(item.outerDia);
                        row.find(".JIDNI_Thickness").val(item.thickness);
                        row.find(".JIDNI_Length").val(item.length);
                        row.find(".JIDNI_Width").val(item.width);
                        row.find(".JIDNI_MaterialGrade").val(item.materialGrade);
                        row.find(".JIDNI_ItemGroup").val(item.itemGroup);

                        row.find(".JIDNI_UoM_Number").val(item.uoM);
                        row.find(".JIDNI_WH_Number").val(item.saleWarehouse);

                        let qtyInput = row.find(".JIDNI_Qty");
                        qtyInput.focus();
                        setTimeout(function () { qtyInput.select(); }, 100);

                        resultsDiv.hide();
                        $("#RightPane_Item").removeClass("show");
                    });
                });

                resultsDiv.append(table);

                // match-row / current-row highlight logic (identical to ItemGrid.js)
                let rows = resultsDiv.find("tbody tr");
                rows.removeClass("match-row current-row");
                $(inputElement).removeData("selectedIndex");

                let searchText = itemCode.toLowerCase();
                let firstMatch = -1, lastMatch = -1;

                rows.each(function (i) {
                    let code = $(this).find("td:first").text().trim().toLowerCase();
                    if (searchText !== "" && code.startsWith(searchText)) {
                        $(this).addClass("match-row");
                        if (firstMatch === -1) firstMatch = i;
                        lastMatch = i;
                    }
                });

                if (firstMatch >= 0) {
                    $(inputElement).data("firstMatch", firstMatch);
                    $(inputElement).data("lastMatch", lastMatch);
                } else {
                    $(inputElement).removeData("firstMatch");
                    $(inputElement).removeData("lastMatch");
                }

            } else {
                resultsDiv.append(GetItemEmptyView());
                $("#RightPane_Item").addClass("show");
                resultsDiv.show();
            }
        },
        error: function () {
            resultsDiv.text("Error loading data.").show();
        }
    });
}