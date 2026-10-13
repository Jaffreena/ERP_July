/* =====================================================================
   JO_JobworkInvoiceList.js  -  SUMMARY + DETAILED pages
   Both pages post to their own route (Mode / JOSVIH_No handled in Controller)
   ===================================================================== */
(function () {
    var $form = $('#ListForm');

    function submitList() { $form.trigger('submit'); }

    // ---- View / Edit : set Mode + invoice number, post same page
    //      Controller redirects to /view or /edit
    $(document).on('click', '.btn-view, .btn-edit', function (e) {
        e.preventDefault();
        var $b = $(this);
        $('#Mode').val($b.hasClass('btn-edit') ? 'Edit' : 'View');
        $('#JOSVIH_No').val($b.data('no'));
        submitList();
    });

    // ---- Search : Enter key or Search button
    $(document).on('keydown', '#Search', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); resetMode(); $('#PageNumber').val(1); submitList(); }
    });
    $(document).on('click', '#BtnSearch', function (e) {
        e.preventDefault(); resetMode(); $('#PageNumber').val(1); submitList();
    });
    $(document).on('click', '#BtnClear', function (e) {
        e.preventDefault(); $('#Search').val(''); resetMode(); $('#PageNumber').val(1); submitList();
    });

    // ---- Page size / filter
    $(document).on('change', '#PSize, #PageFilter', function () {
        resetMode(); $('#PageNumber').val(1); submitList();
    });

    // ---- Paging links  (<a class="page-js" data-page="3">)
    $(document).on('click', '.page-js', function (e) {
        e.preventDefault();
        if ($(this).closest('li').hasClass('disabled')) return;
        resetMode();
        $('#PageNumber').val($(this).data('page'));
        submitList();
    });

    // ---- Column sort  (<th class="sort-js" data-sort="Title_desc">)
    $(document).on('click', '.sort-js', function () {
        resetMode();
        $('#SortOrder').val($(this).data('sort'));
        submitList();
    });

    function resetMode() { $('#Mode').val(''); $('#JOSVIH_No').val(''); }
})();