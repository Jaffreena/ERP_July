/* =====================================================================
   JO_JobworkInvoiceList.js  -  SUMMARY + DETAILED pages
   Both pages post to their own route (Mode / JOSVIH_No handled in Controller)
   ===================================================================== */
(function () {
    var $form = $('#ListForm');

    function submitList() { $form.trigger('submit'); }

    // ---- Journal No link : open the invoice in View mode
    $(document).on('click', '.btn-view, .btn-edit', function (e) {
        e.preventDefault();
        var $b = $(this);
        $('#Mode').val($b.hasClass('btn-edit') ? 'Edit' : 'View');
        $('#JOSVIH_No').val($b.data('no'));
        submitList();
    });

    // ---- Checkbox selection : View / Edit buttons work only when exactly one row is ticked
    function updateButtons() {
        var one = $('.DeleteNumber:checked').length === 1;
        $('#BtnViewSel, #BtnEditSel').prop('disabled', !one);
    }

    function openSelected(mode) {
        var $c = $('.DeleteNumber:checked');
        if ($c.length !== 1) return;
        $('#Mode').val(mode);
        $('#JOSVIH_No').val($c.val());
        submitList();
    }

    $(document).on('click', '#BtnViewSel', function (e) { e.preventDefault(); openSelected('View'); });
    $(document).on('click', '#BtnEditSel', function (e) { e.preventDefault(); openSelected('Edit'); });

    // row click -> tick / untick its checkbox
    $(document).on('click', '#MyTable tbody tr', function (e) {
        if ($(e.target).closest('input[type="checkbox"], a, button').length) return;
        var $cb = $(this).find('.DeleteNumber');
        if ($cb.length) { $cb.prop('checked', !$cb.prop('checked')); updateButtons(); }
    });

    $(document).on('change', '.DeleteNumber', updateButtons);

    $(document).on('change', '#selectAllCheckbox', function () {
        $('.DeleteNumber').prop('checked', this.checked);
        updateButtons();
    });

    $(updateButtons);

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
