// Allow deselecting an ACF Icon Picker icon by clicking on it again.
// Listens in capture phase to run before ACF's own click handler.
document.addEventListener(
    'click',
    (event) => {
        const icon = event.target.closest('.acf-icon-picker-list-icon.active');
        if (!icon) return;

        const $field = window.jQuery(icon).closest('.acf-field');
        const field = window.acf && window.acf.getField($field);
        if (!field || field.get('type') !== 'icon_picker') return;

        event.preventDefault();
        event.stopPropagation();

        const $list = window.jQuery(icon).closest('.acf-icon-list');

        field.unselectIcon($list);
        $list.find('input:checked').prop('checked', false);
        field.updateTypeAndValue('', '');
    },
    true
);
