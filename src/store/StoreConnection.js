
import KArray from '../helper/KArray.js';
import {default as store} from './IDBStore.js';


// Global config

const globalConfig = {
  "onLine": true,
  "server": {},
  "templates": {},
  "urlQuery": {}
};

window.location.search.substring(1).split("&")
  .map(e => e.split('=')).forEach(e => {
    globalConfig.urlQuery[e[0]] = e[1];
  });


function getGlobalConfig(key) {
  return globalConfig[key];
}


function setGlobalConfig(key, value) {
  globalConfig[key] = value;
}


function getAppSetting(key) {
  return store.getAppSetting(key);
}


function setAppSetting(key, value) {
  return store.putAppSetting(key, value);
}


// API data resource on local IndexedDB

function getResources(domains) {
  return store.getResources().then(rsrcs => {
    return rsrcs.filter(e => domains.includes(e.domain));
  });
}


function setResources(rsrcs) {
  return store.putResources(rsrcs);
}


// Datatable on local IndexedDB

function getAllTables() {
  return store.getAllItems();
}


function getTablesByFormat(format) {
  return store.getItemsByFormat(format);
}


function getTable(tableId) {
  return store.getItemById(tableId);
}


function getRecords(tableId) {
  return store.getItemById(tableId)
    .then(tbl => tbl.records);
}


function getCurrentTable() {
  const q = getGlobalConfig('urlQuery');
  if (!q.hasOwnProperty('id')) return Promise.resolve();
  return store.getItemById(q.id);
}


function getCurrentRecords() {
  return getCurrentTable().then(tbl => tbl.records);
}


function setFieldProperties(updates) {
  return store.updateItem(getGlobalConfig('urlQuery').id, item => {
    item.fields.forEach((fd, i) => {
      fd.visible = updates.visibles.includes(fd.key);
      fd.sort = updates.sorts[i];
      fd.digit = updates.digits[i];
    });
  });
}


function joinFields(mapping, tableId=globalConfig.urlQuery.id) {
  const fds = mapping.hasOwnProperty('field') ? mapping.field : mapping.fields;
  return store.updateItem(tableId, item => {
    item.records
      .filter(rcd => mapping.mapping.hasOwnProperty(rcd[mapping.key]))
      .forEach(rcd => {
        if (mapping.hasOwnProperty('field')) {
          rcd[mapping.field.key] = mapping.mapping[rcd[mapping.key]];
        } else {
          mapping.fields.forEach((fd, i) => {
            rcd[fd.key] = mapping.mapping[rcd[mapping.key]][i];
          });
        }
      });
    item.columns = KArray.from(item.columns).concat(fds).unique('key');
    item.lastUpdated = mapping.lastUpdated;
  });
}


function updateTableAttribute(tblID, key, value) {
  return store.updateItem(tblID, item => {
    item[key] = value;
  });
}


function insertTable(data) {
  return store.putItem(data);
}


function updateTable(data) {
  if (data === undefined) return Promise.resolve();  // No update
  if (data.status === 'failure') {  // No data found on server
    return updateTableAttribute(data.id, 'status', 'failure');
  }
  // update
  return store.updateItem(data.id, item => {
    Object.assign(item, data);
    if (data.hasOwnProperty('lastUpdated')) {
      item.lastUpdated = data.lastUpdated;
    }
  });
}


function deleteTable(id) {
  return store.deleteItem(id);
}


function reset() {
  return store.reset();
}


export default {
  getAppSetting, setAppSetting, getGlobalConfig, setGlobalConfig,
  getResources, setResources,
  getAllTables, getTablesByFormat, getTable, getRecords,
  getCurrentTable, getCurrentRecords,
  setFieldProperties, joinFields,
  updateTableAttribute, insertTable, updateTable,
  deleteTable, reset
};
