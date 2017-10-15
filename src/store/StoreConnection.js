
import {default as win} from '../helper/window.js';
import {default as mapper} from '../helper/mapper.js';
import {default as store} from './IDBStore.js';


function getAppSetting(key) {
  return store.getAppSetting(key);
}


function setAppSetting(key, value) {
  return store.putAppSetting(key, value);
}


function getResources() {
  return store.getResources();
}


function setResources(rsrcs) {
  return store.putResources(rsrcs);
}


function getAllTables() {
  return store.getAllItems();
}


function getTablesByDataType(type) {
  return store.getItemsByDataType(type);
}


function getTable(id) {
  return store.getItemById(id);
}


function getRecords(id) {
  return store.getItemById(id)
    .then(table => table.records);
}


function setFieldProperties(updates) {
  return store.updateItem(win.URLQuery().id, item => {
    item.fields.forEach((fd, i) => {
      fd.visible = updates.visibles.includes(fd.key);
      fd.sortType = updates.sortTypes[i];
      fd.digit = updates.digits[i];
    });
  });
}


function joinFields(mapping, id=win.URLQuery().id) {
  return store.updateItem(id, item => {
    mapper.apply(item, mapping);
  });
}


function updateTableAttribute(id, key, value) {
  return store.updateItem(id, item => {
    item[key] = value;
  });
}


function insertTable(data) {
  return store.putItem(data);
}


function updateTable(data) {
  if (data === undefined) return Promise.resolve(null);  // No update
  if (data.status === 'failure') {  // No data found on server
    return updateTableAttribute(data.id, 'status', 'failure');
  }
  // update
  return store.updateItem(data.id, item => {
    Object.assign(item, data);
  });
}


function deleteTable(id) {
  return store.deleteItem(id);
}


function reset() {
  return store.reset();
}


export default {
  getAppSetting, setAppSetting, getResources, setResources,
  getAllTables, getTablesByDataType, getTable, getRecords,
  setFieldProperties, joinFields,
  updateTableAttribute, insertTable, updateTable,
  deleteTable, reset
};
