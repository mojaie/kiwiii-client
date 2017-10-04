
import d3 from 'd3';

import {default as def} from './helper/definition.js';
import {default as loader} from './Loader.js';
import {default as fetcher} from './fetcher.js';
import {default as cmp} from './component/Component.js';
import {default as store} from './store/StoreConnection.js';


function actionTable(selection, tbl) {
  tbl.records.forEach(rcd => {
    rcd.action = `<a role="button" class="btn btn-secondary btn-sm" href="${tbl.app}?id=${rcd.id}" target="_blank">Open</a>`;
    if (def.fetchable(tbl)) {
      rcd.action += `<button type="button" class="btn btn-warning btn-sm" disabled>Running</button>`;
    } else {
      rcd.action += `<button type="button" class="btn btn-warning btn-sm delete-item" data-toggle="modal" data-target="#confirm-dialog" data-tblid="${rcd.id}" data-tblname="${rcd.name}">Delete</button>`;
    }
  });
  d3.select(selection).call(cmp.createTable, tbl)
    .call(cmp.updateTableRecords, tbl.records, d => d.id);
  d3.selectAll('tr button.delete-item')
    .on('click', function() {
      const id = d3.select(this).attr('data-tblid');
      const name = d3.select(this).attr('data-tblname');
      d3.select('#confirm-message')
        .text(`Are you sure you want to delete ${name} ?`);
      d3.select('#confirm-submit')
        .on('click', () => store.deleteTable(id).then(render));
    });
}


function renderTableStatus(tbls) {
  const data = {
    app: 'datatable.html',
    columns: [
      {key: 'name'},
      {key: 'responseDate'},
      {key: 'status'},
      {key: 'records'},
      {key: 'action'}
    ]};
  data.records = tbls.map(tbl => {
    if (!tbl.hasOwnProperty('status')) tbl.status = 'Completed';
    return {
      "id": tbl.id,
      "name": tbl.name,
      "responseDate": tbl.responseDate,
      "status": tbl.status,
      "records": tbl.records.length,
    };
  });
  actionTable('#local-tables', data);
}


function renderGraphStatus(grfs) {
  const data = {
    app: 'graph.html',
    columns: [
      {key: 'name'},
      {key: 'responseDate'},
      {key: 'nodeTableId'},
      {key: 'status'},
      {key: 'edges'},
      {key: 'action'}
    ]};
  data.records = grfs.map(grf => {
    if (!grf.hasOwnProperty('status')) grf.status = 'Completed';
    return {
      "id": grf.id,
      "name": grf.name,
      "responseDate": grf.responseDate,
      "nodeTableId": grf.nodeTableId,
      "status": grf.status,
      "edges": grf.records.length,
    };
  });
  actionTable('#local-graphs', data);
}


function renderServerStatus(data) {
  d3.select('#server-calc').call(cmp.createTable, data.calc)
    .call(cmp.updateTableRecords, data.calc.records, d => d._index);
  const server = {
    columns: [{key: 'key'}, {key: 'value'}],
    records: []
  };
  Object.entries(data).filter(e => e[0] !== 'calc')
    .forEach(e => server.records.push({key: e[0], value: e[1]}));
  d3.select('#server-status').call(cmp.createTable, server)
    .call(cmp.updateTableRecords, server.records, d => d._index);
}


function render() {
  if (store.getGlobalConfig('onLine')) {
    renderServerStatus(store.getGlobalConfig('server'));
  }
  return Promise.all([
    store.getTablesByFormat('datatable').then(renderTableStatus),
    store.getTablesByFormat('connection').then(renderGraphStatus)
  ]);
}


d3.select('#refresh-all')
  .on('click', () => {
    return store.getAllTables().then(tbls => {
      const tasks = tbls.map(tbl => {
        if (!def.fetchable(tbl)) return Promise.resolve();
        const query = {id: tbl.id, command: 'fetch'};
        return fetcher.getJSON('res', query).then(store.updateTable);
      });
      return Promise.all(tasks);
    }).then(render);
  });


d3.select('#reset-local')
  .on('click', () => {
    d3.select('#confirm-message')
      .text('Are you sure you want to delete all local tables and reset the datastore ?');
    d3.select('#confirm-submit')
      .on('click', () => store.reset().then(render));
  });



function run() {
  return loader.loader().then(render);
}
run();
