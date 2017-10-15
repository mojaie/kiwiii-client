
import d3 from 'd3';
import {default as d3form} from './helper/d3Form.js';
import {default as fmt} from './helper/formatValue.js';
import {default as win} from './helper/window.js';
import {default as fetcher} from './fetcher.js';
import {default as loader} from './Loader.js';
import {default as store} from './store/StoreConnection.js';
import {default as cmp} from './component/Component.js';


function updateChem(resources) {
  const compound = win.URLQuery().compound;
  const query = {
    type: 'chemsearch',
    targets: resources.filter(e => e.domain === 'chemical').map(e => e.id),
    key: 'id',
    values: [compound]
  };
  return fetcher.get('run', query)
    .then(fetcher.json)
    .then(res => {
      const rcd = res.records[0];
      d3.select('#compoundid').html(rcd.id);
      d3.select('#compounddb').html(resources.find(e => e.id === rcd.source).name);
      d3.select('#structure').html(rcd._structure);
      const records = res.fields
        .filter(e => !['_structure', '_index', 'id'].includes(e.key))
        .map(e => ({ key: e.name, value: rcd[e.key] }));
      const data = {
        fields: [
          {key: 'key', sort: 'text', visible: true},
          {key: 'value', sort: 'text', visible: true}
        ]
      };
    d3.select('#properties').call(cmp.createTable, data)
      .call(cmp.updateTableRecords, records, d => d.key);
    return rcd;
  });
}


function updateChemAliases(resources, qrcd) {
  const query = {
    type: 'exact',
    targets: resources.filter(e => e.domain === 'chemical').map(e => e.id),
    queryMol: {
      format: 'dbid',
      source: qrcd.source,
      value: qrcd.id
    },
    params: {ignoreHs: true}
  };
  return fetcher.get('run', query)
    .then(fetcher.json)
    .then(res => {
      const records = res.records
        .filter(rcd => rcd.id !== qrcd.id || rcd.source !== qrcd.source)
        .map(rcd => {
          return {
            id: `<a href="profile.html?compound=${rcd.id}" target="_blank">${rcd.id}</a>`,
            database: resources.find(e => e.id === rcd.source).name
          };
        });
      const data = {
        fields: [
          {key: 'id', sort: 'text', visible: true},
          {key: 'database', sort: 'text', visible: true}
        ]
      };
      d3.select('#aliases').call(cmp.createTable, data)
        .call(cmp.updateTableRecords, records, d => d.id);
    });
}


function updateActivities() {
  const compound = win.URLQuery().compound;
  // Prevent implicit submission
  document.getElementById('search')
    .addEventListener('keypress', event => {
      if (event.keyCode === 13) event.preventDefault();
    });
  d3.select('#search').on('keyup', function () {
    const match = obj => Object.values(obj)
      .some(e => fmt.partialMatch(d3form.value(this), e));
    d3.select('#results tbody').selectAll('tr')
      .style('visibility', d => match(d) ? null : 'hidden')
      .style('position', d => match(d) ? null : 'absolute');
  });
  /*d3.select('#results').call(cmp.createTable, tbl)
    .call(cmp.addSort);*/
  const query = {
    type: 'profile',
    id: compound
  };
  return fetcher.get('run', query)
    .then(fetcher.json)
    .then(res => {
      const table = {
        fields: [
          {key: 'name', sort: 'text', visible: true},
          {key: 'tags', sort: 'text', visible: true},
          {key: 'valueType', sort: 'text', visible: true},
          {key: 'value', sort: 'numeric', visible: true, valueType: 'AC50'},
          {key: 'remarks', sort: 'none', visible: true}
        ]
      };
      d3.select('#results').call(cmp.createTable, table)
        .call(cmp.updateTableRecords, res.records, d => d.id);
    });

  /*
  const tasks = store.dataFetcherInstances()
    .filter(fetcher => fetcher.available === true)
    .map(fetcher => {
      return fetcher.getRecordsByCompound(compound).then(res => {
        const rcds = KArray.from(res.records.map(rcd => {
          return Object.entries(rcd).map(r => {
            const rcdKey = r[0];
            const rcdValue = r[1];
            const sourceKey = def.dataSourceId(fetcher.domain, rcd.source, rcdKey);
            const sourceCol = activities.find(e => e.key === sourceKey);
            if (sourceCol === undefined) return;  // found in database but not annotated
            if (sourceCol.valueType === 'flag' && rcdValue === 0) return;  // empty flag
            return {
              name: sourceCol.name,
              tags: sourceCol.tags,
              valueType: sourceCol.valueType,
              value: d3.format('.3c')(rcdValue),
              remarks: ''
            };
          }).filter(e => e !== undefined);
        })).extend();
        cmp.appendTableRows(d3.select('#results'), rcds, undefined);
      });
    });
  return Promise.all(tasks);
  */
}


function run() {
  return loader.loader()
    .then(() => store.getResources())
    .then(rsrcs => Promise.all([
      updateChem(rsrcs).then(qrcd => updateChemAliases(rsrcs, qrcd)),
      updateActivities()
    ]));
}


export default {
  run
};
