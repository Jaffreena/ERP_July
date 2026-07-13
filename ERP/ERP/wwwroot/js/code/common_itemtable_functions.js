// Hide batch popup when Escape key is pressed
$(document).on("keydown", function (e) {

    if (e.key === "Escape") {
        $(".batchPopup:visible").hide();
        $(document.activeElement).blur();
    }
});

    //#endregion
//#region Row Click - Single Selection
$("#ItemTable").on("click focusin", "tbody tr.NewRow", function (e) {

    // Ignore direct checkbox click
    if ($(e.target).closest(".CheckItem").length) {
        return;
    }

    // Uncheck all row checkboxes
    $("#ItemTable .CheckItem").prop("checked", false);

    // Check only current row
    $(this).find(".CheckItem").prop("checked", true);
});
//#endregion

//#region Checkbox Click - Multiple Selection
$("#ItemTable").on("click", ".CheckItem", function (e) {

    // Prevent row click event
    e.stopPropagation();
});
//#endregion

$(document).on("click focusin", "#ItemTable input", function (e) {
    e.stopPropagation();

    let input = this;
    input.focus();

    setTimeout(function () {
        input.select();
    }, 10);
});
// Header checkbox -> Check/Uncheck all
$(document).on("change", "#IndexAllCheckItem", function () {
    $(".CheckItem").prop("checked", this.checked);
});

// Individual checkbox -> Update header checkbox
$(document).on("change", ".CheckItem", function () {
    $("#IndexAllCheckItem").prop(
        "checked",
        $(".CheckItem").length === $(".CheckItem:checked").length
    );
});
//#region Remove Checked Rows