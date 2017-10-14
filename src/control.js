
import d3 from 'd3';

import {default as loader} from './Loader.js';
import {default as fetcher} from './fetcher.js';
import {default as cmp} from './component/Component.js';
import {default as store} from './store/StoreConnection.js';


function tableAction(selection, record, app) {
  selection.append('a')
      .classed('btn btn-secondary btn-sm', true)
      .attr('role', 'button')
      .attr('href', `${app}?id=${record.id}`)
      .attr('target', '_blank')
      .text('Open');
  const isRunning = record.status === 'running';
  selection.insert('button')
      .classed('btn btn-warning btn-sm', true)
      .attr('type', 'button')
      .attr('data-toggle', isRunning ? null : 'modal')
      .attr('data-target', isRunning ? null : '#confirm-dialog')
      .property('disabled', isRunning ? 'disabled' : null)
      .text(isRunning ? 'Running' : 'Delete')
      .on('click', function() {
        d3.select('#confirm-message')
          .text(`Are you sure you want to delete ${record.name} ?`);
        d3.select('#confirm-submit')
          .on('click', () => store.deleteTable(record.id).then(run));
      });
}


function renderTableStatus(data) {
  const table = {
    fields: [
      {key: 'name'},
      {key: 'status'},
      {key: 'resultCount'},
      {key: 'action', valueType: 'control'}
    ]
  };
  const records = data.map(e => {
    e.action = (s) => tableAction(s, e, 'datatable.html');
    return e;
  });
  d3.select('#local-tables').call(cmp.createTable, table)
    .call(cmp.updateTableRecords, records, d => d.id);
}


function renderGraphStatus(data) {
  const table = {
    fields: [
      {key: 'name'},
      {key: 'nodeTableId'},
      {key: 'status'},
      {key: 'resultCount'},
      {key: 'action', valueType: 'control'}
    ]
  };
  const records = data.map(e => {
    e.action = (s) => tableAction(s, e, 'graph.html');
    return e;
  });
  d3.select('#local-graphs').call(cmp.createTable, table)
    .call(cmp.updateTableRecords, records, d => d.id);
}


function renderServerStatus(data) {
  d3.select('#server-calc').call(cmp.createTable, data.calc)
    .call(cmp.updateTableRecords, data.calc.records, d => d._index);
  const server = {
    fields: [{key: 'key'}, {key: 'value'}]
  };
  server.records = Object.entries(data)
    .filter(e => e[0] !== 'calc')
    .map(e => ({key: e[0], value: e[1]}));
  d3.select('#server-status').call(cmp.createTable, server)
    .call(cmp.updateTableRecords, server.records, d => d._index);
}


function render(serverStatus) {
  d3.select('#refresh-all')
    .on('click', () => {
      return store.getAllTables().then(tables => {
        return Promise.all(tables.map(tbl => {
          if (tbl.status !== 'running') return Promise.resolve();
          const query = {id: tbl.id, command: 'fetch'};
          return fetcher.get('res', query)
            .then(fetcher.json)
            .then(store.updateTable);
        }));
      }).then(run);
    });
  d3.select('#reset-local')
    .on('click', () => {
      d3.select('#confirm-message')
        .text('Are you sure you want to delete all local tables and reset the datastore ?');
      d3.select('#confirm-submit')
        .on('click', () => store.reset().then(run));
    });
  if (serverStatus) renderServerStatus(serverStatus);
  return Promise.all([
    store.getTablesByDataType('nodes').then(renderTableStatus),
    store.getTablesByDataType('edges').then(renderGraphStatus)
  ]);
}


function run() {
  return loader.loader().then(render);
}
run();
