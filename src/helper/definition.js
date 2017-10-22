
/** @module helper/definition */


const defaultHiddenFields = ['_mw', '_mw_wo_sw', '_logp', '_formula', '_nonH'];

function defaultFieldProperties(fields) {
  return fields.map(e => {
    if (!e.hasOwnProperty('name')) e.name = e.key;
    if (!e.hasOwnProperty('sortType')) e.sortType = 'text';
    e.visible = !defaultHiddenFields.includes(e.key);
    e.digit = 'raw';
    return e;
  });
}

function ongoing(data) {
  return ['running', 'ready'].includes(data.status);
}


function conclike(col) {
  return col.hasOwnProperty('valueType')
    && ['AC50', 'IC50', 'ED50'].includes(col.valueType);
}


export default {
  defaultHiddenFields, defaultFieldProperties, ongoing, conclike
};
