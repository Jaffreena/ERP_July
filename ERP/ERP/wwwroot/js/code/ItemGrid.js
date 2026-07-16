function SetTableHeight() {
    let rowHeight = $(".table-body-f tbody tr:first").outerHeight() || 27;

    $(".table-body-f").css({
        "max-height": (rowHeight * 16) + "px",
        "overflow-y": "auto"
    });
}