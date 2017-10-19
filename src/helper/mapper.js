
/** @module helper/dataStructure */

import KArray from './KArray.js';


/**
 * Convert single field mapping to multi field mapping
 * @param {object} mapping - single field mapping
 * @return {object} multi field mapping
 */
function singleToMulti(mapping) {
  const newMapping = {};
  Object.entries(mapping.mapping).forEach(m => {
    newMapping[m[0]] = [m[1]];
  });
  return {
    created: mapping.created,
    fields: [mapping.field],
    key: mapping.key,
    mapping: newMapping
  };
}


/**
 * Convert field mapping to table
 * @param {object} mapping - field mapping
 * @return {object} table object
 */
function mappingToTable(mapping) {
  const mp = mapping.hasOwnProperty('field') ? singleToMulti(mapping) : mapping;
  const keyField = {
    key: mp.key,
    name: mp.key,
    sort: 'text',
    visible: true,
    digit: 'raw'
  };
  const data = {
    fields: [keyField].concat(mp.fields),
    records: Object.entries(mp.mapping).map(entry => {
      const rcd = {};
      rcd[mp.key] = entry[0];
      mp.fields.forEach((f, i) => {
        rcd[f.key] = entry[1][i];
      });
      return rcd;
    })
  };
  data.fields.forEach(e => {
    if (!e.hasOwnProperty('visible')) e.visible = true;
    if (!e.hasOwnProperty('digit')) e.digit = 'raw';
  });
  return data;
}


/**
 * Convert table to field mapping
 * @param {object} table - table
 * @param {object} key - key
 * @return {object} field mapping
 */
function tableToMapping(table, key, ignore=['_index']) {
  const now = new Date();
  const mapping = {
    created: now.toString(),
    fields: table.fields
      .filter(e => e.key !== key)
      .filter(e => !ignore.includes(e.key)),
    key: key,
    mapping: {}
  };
  table.records.forEach(row => {
    mapping.mapping[row[key]] = mapping.fields.map(e => row[e.key]);
  });
  return mapping;
}


/**
 * Convert csv text to field mapping
 * @param {string} csvString - csv data text
 * @return {object} field mapping
 */
function csvToMapping(csvString) {
  const lines = csvString.split(/\n|\r|\r\n/);
  const header = lines.shift().split(',');
  const key = header.shift();
  const now = new Date();
  const mapping = {
    created: now.toString(),
    fields: [],
    key: key,
    mapping: {}
  };
  const headerIdx = [];
  header.forEach((h, i) => {
    if (h === '') return;
    headerIdx.push(i);
    mapping.fields.push({key: h, name: h, sort: 'text', visible: true});
  });
  lines.forEach(line => {
    const values = line.split(',');
    const k = values.shift();
    mapping.mapping[k] = Array(headerIdx.length);
    headerIdx.forEach(i => {
      mapping.mapping[k][i] = values[i];
    });
  });
  return mapping;
}


/**
 * Apply mapping to the data (in-place)
 * @param {object} data - datatable JSON
 * @param {object} mapping - mapping JSON
 * @return {undefined} undefined
 */
function apply(data, mapping) {
  const mp = mapping.hasOwnProperty('field') ? singleToMulti(mapping) : mapping;
  data.records
    .filter(rcd => mp.mapping.hasOwnProperty(rcd[mp.key]))
    .forEach(rcd => {
      mp.fields.forEach((fd, i) => {
        rcd[fd.key] = mp.mapping[rcd[mp.key]][i];
      });
    });
  data.fields = KArray.from(data.fields).concat(mp.fields).unique('key');
  data.fields.forEach(e => {
    if (!e.hasOwnProperty('visible')) e.visible = true;
    if (!e.hasOwnProperty('digit')) e.digit = 'raw';
  });
}


export default {
  singleToMulti, mappingToTable, tableToMapping, csvToMapping, apply
};
