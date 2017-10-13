
/** @module helper/definition */


/**
 * Capitalize the text -- upper case => Upper Case
 */
function capitalized(str) {
  return str.replace(/(?:^|\s)\S/g, e => e.toUpperCase());
}


const defaultHiddenFields = ['_mw', '_mw_wo_sw', '_logp', '_formula', '_nonH'];


function setDefaultFieldProperties(fields) {
  return fields.map(e => {
    e.visible = !defaultHiddenFields.includes(e.id);
    e.digit = 'raw';
    return e;
  });
}


function fetchable(tbl) {
  return ['In progress', 'Queued', 'Aborting'].includes(tbl.status);
}


function abortRequestable(tbl) {
  return ['In progress', 'Queued'].includes(tbl.status);
}


function conclike(col) {
  return col.hasOwnProperty('valueType')
    && ['AC50', 'IC50', 'ED50'].includes(col.valueType);
}


function dataSourceId(domain, resource, column) {
  return [domain, resource, column]
    .map(e => capitalized(e))
    .join('');  // DomainResourceColumn
}


export default {
  setDefaultFieldProperties,
  capitalized, fetchable, abortRequestable, conclike, dataSourceId
};
