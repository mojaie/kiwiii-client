
import {default as def} from '../helper/definition.js';
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


function getTable(id=win.URLQuery().id) {
  return store.getItemById(id);
}


function getRecords(id=win.URLQuery().id) {
  return store.getItemById(id)
    .then(table => table.records);
}


function setFieldProperties(updates, id=win.URLQuery().id) {
  return store.updateItem(id, item => {
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


function updateTableAttribute(key, value, id=win.URLQuery().id) {
  return store.updateItem(id, item => {
    item[key] = value;
  });
}

function setDefaultFieldProperties(data) {
  data.fields.forEach(e => {
    e.visible = !def.defaultHiddenFields.includes(e.key);
    e.digit = 'raw';
  });
  return data;
}


function insertTable(data) {
  return store.putItem(setDefaultFieldProperties(data));
}


function updateTable(data) {
  if (data.status === 'failure') {  // No data found on server
    return updateTableAttribute('status', 'failure', data.id);
  }
  // update
  return store.updateItem(data.id, item => {
    Object.assign(item, setDefaultFieldProperties(data));
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
