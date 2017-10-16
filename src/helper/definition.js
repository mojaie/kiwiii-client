
/** @module helper/definition */


/**
 * Capitalize the text -- upper case => Upper Case
 */
function capitalized(str) {
  return str.replace(/(?:^|\s)\S/g, e => e.toUpperCase());
}


const defaultHiddenFields = ['_mw', '_mw_wo_sw', '_logp', '_formula', '_nonH'];


function ongoing(data) {
  return ['running', 'ready'].includes(data.status);
}


function conclike(col) {
  return col.hasOwnProperty('valueType')
    && ['AC50', 'IC50', 'ED50'].includes(col.valueType);
}


export default {
  defaultHiddenFields,
  capitalized, ongoing, conclike
};
