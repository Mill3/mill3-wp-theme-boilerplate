export const getFormId = (form) => form.dataset.formid;
export const getFieldId = (field) => field.name.replace('input_', '');

export default {
  getFormId,
  getFieldId,
};
