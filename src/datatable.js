
/** @module datatable */

import d3 from 'd3';

import {default as d3form} from './helper/d3Form.js';
import {default as def} from './helper/definition.js';
import {default as hfile} from './helper/file.js';
import {default as win} from './helper/window.js';
import {default as fetcher} from './fetcher.js';
import {default as loader} from './Loader.js';
import {default as store} from './store/StoreConnection.js';
import {default as dialog} from './component/Dialog.js';
import {default as header} from './component/Header.js';
import {default as grid} from './component/DataGrid.js';


function idLink(rcds, idKey) {
  rcds.filter(e => e.hasOwnProperty(idKey))
    .forEach(e => {
      e[idKey] = `<a href="profile.html?compound=${e[idKey]}" target="_blank">${e[idKey]}</a>`;
    });
}


function renderTableContents(tbl) {
  return store.getRecords(win.URLQuery().id)
    .then(rcds => {
      const copied = JSON.parse(JSON.stringify(rcds));  // deep copy
      idLink(copied, 'id');
      d3.select('#datatable')
        .call(grid.createDataGrid, tbl)
        .call(grid.dataGridRecords, copied, d => d._index)
        .call(grid.addSort, copied, d => d._index);
      dialog.graphDialog(tbl, rcds, res => {
        res.networkThreshold = res.query.threshold;
        return store.insertTable(res).then(() => {
          d3.select('#loading-circle').style('display', 'none');
          window.open(`graph.html?id=${res.id}`, '_blank');
        });
      });
      dialog.joinDialog(tbl, rcds, mappings => {
        return Promise.all(mappings.map(e => store.joinColumn(e))).then(render);
      });
    });
}


function render() {
  return store.getTable(win.URLQuery().id).then(tbl => {
    dialog.columnDialog(tbl, render);
    dialog.importColDialog(tbl, colMaps => {
      const joined = colMaps.map(mp => store.joinFields(mp));
      return Promise.all(joined).then(render);
    });
    header.renderStatus(tbl, fetchResults, () => fetchResults('abort'));
    d3.select('#rename')
      .on('click', () => {
        d3.select('#prompt-title').text('Rename table');
        d3.select('#prompt-label').text('New name');
        d3.select('#prompt-input').attr('value', tbl.name);
        d3.select('#prompt-submit')
          .on('click', () => {
            const name = d3form.value('#prompt-input');
            return store.updateTableAttribute(tbl.id, 'name', name)
              .then(store.getCurrentTable)
              .then(t => header.renderStatus(t, fetchResults, () => fetchResults('abort')));
          });
      });
    d3.select('#export')
      .on('click', () => hfile.downloadJSON(tbl, tbl.name, true));
    d3.select('#excel')
      .on('click', () => {
        const query = {json: new Blob([JSON.stringify(tbl)])};
        return fetcher.get('xlsx', query)
          .then(fetcher.blob)
          .then(xhr => hfile.downloadDataFile(xhr, `${tbl.name}.xlsx`));
      });
    d3.select('#sdfile')
      .on('click', () => {
        const query = {json: new Blob([JSON.stringify(tbl)])};
        return fetcher.get('sdfout', query)
          .then(fetcher.text)
          .then(xhr => hfile.downloadDataFile(xhr, `${tbl.name}.sdf`));
      });
    return renderTableContents(tbl);
  });
}


function loadNewTable(data) {
  data.fields = def.setDefaultFieldProperties(data.fields);
  return store.insertTable(data).then(() => {
    window.location = `datatable.html?id=${data.id}`;
  });
}


function fetchResults(command='update') {
  return store.getTable(win.URLQuery().id)
    .then(data => def.ongoing(data))
    .then(hasUpdate => {
      if (!hasUpdate) return Promise.resolve();
      const query = {id: win.URLQuery().id, command: command};
      return fetcher.get('res', query)
        .then(fetcher.json)
        .then(data => {
          data.fields = def.setDefaultFieldProperties(data.fields);
          return data;
        })
        .then(store.updateTable);
    });
}


function run() {
  d3.select('#import-json')
    .on('click', () => document.getElementById('select-file').click());
  d3.select('#select-file')
    .on('change', () => {
      const file = document.getElementById('select-file').files[0];
      hfile.loadJSON(file).then(loadNewTable);
    });
  // location parameter enables direct access to datatable JSON via HTTP
  if (win.URLQuery().hasOwnProperty('location')) {
    const url = win.URLQuery().location;
    return hfile.fetchJSON(url)
      .then(data => store.insertTable(data))
      .then(id => {
        window.location = `datatable.html?id=${id}`;
      });
  }
  return loader.loader().then(serverStatus => {
    if (!serverStatus) {
      // Disable offline comannds
      d3.selectAll('.online-command')
        .style('color', '#cccccc')
        .classed('disabled', true)
        .on('click', () => d3.event.stopPropagation());
    }
    // Loading tables
    if (win.URLQuery().hasOwnProperty('id')) {
      header.initializeWithData();
      return fetchResults().then(render);
    } else {
      header.initialize();
      dialog.sdfDialog(loadNewTable);
      if (!serverStatus) return Promise.resolve();
      return store.getResources().then(rsrc => {
        const chemres = rsrc.filter(e => e.domain === 'chemical');
        dialog.pickDialog(chemres, loadNewTable);
        dialog.structDialog(chemres, loadNewTable);
        dialog.propDialog(chemres, loadNewTable);
      });
    }
  });
}


export default {
  grid, render, run
};
