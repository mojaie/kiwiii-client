
import d3 from 'd3';

import {default as cmp} from './component/Component.js';
import {default as fetcher} from './fetcher.js';


const testCases = [];

testCases.push(() =>
  fetcher.getJSON('server')
    .then(res => ({output: res, test: 'server'}))
    .catch(err => ({output: err, test: 'server'}))
);

testCases.push(() =>
  fetcher.getJSON('schema')
    .then(res => ({output: res, test: 'schema'}))
    .catch(err => ({output: err, test: 'schema'}))
);

testCases.push(() =>
  fetcher.getJSON('run', {
    type: 'chemsearch',
    tables: ['DRUGBANKFDA'],
    resourceFile: 'sdf_demo.sqlite3',
    key: 'id',
    values: ['DB00189', 'DB00193', 'DB00203', 'DB00865', 'DB01143']
  }).then(res => ({output: res, test: 'chemsearch'}))
    .catch(err => ({output: err, test: 'chemsearch'}))
);

testCases.push(() =>
  fetcher.getJSON('run', {
    type: 'filter',
    tables: ['TEST1_LIB1', 'FREQHIT'],
    resourceFile: 'text_demo.sqlite3',
    key: 'id',
    values: ['DB00189', 'DB00193', 'DB00203', 'DB00865', 'DB01143'],
    operator: 'in'
  }).then(res => ({output: res, test: 'filter'}))
    .catch(err => ({output: err, test: 'filter'}))
);

testCases.push(() =>
  fetcher.getJSON('run', {
    type: 'profile',
    key: 'id',
    values: 'DB00189'
  }).then(res => ({output: res, test: 'profile'}))
    .catch(err => ({output: err, test: 'profile'}))
);

testCases.push(() =>
  new Promise(r => {
    fetcher.getJSON('async', {
      type: 'substr',
      tables: ['DRUGBANKFDA'],
      resourceFile: 'sdf_demo.sqlite3',
      queryMol: {
        format: 'dbid',
        table: 'DRUGBANKFDA',
        resourceFile: 'sdf_demo.sqlite3',
        value: 'DB00115'
      },
      params: {
        ignoreHs: true
      }
    }).then(res => {
      setTimeout(() => {
        const query = {id: res.id, command: 'abort'};
        fetcher.getJSON('res', query).then(rows => r([res, rows]));
      }, 5000);
    });
  }).then(res => ({output: res, test: 'substr'}))
    .catch(err => ({output: err, test: 'substr'}))
);

testCases.push(() =>
  new Promise(r => {
    fetcher.getJSON('async', {
      type: 'chemprop',
      tables: ['DRUGBANKFDA'],
      resourceFile: 'sdf_demo.sqlite3',
      key: '_mw',
      values: [1000],
      operator: 'gt'
    }).then(res => {
      setTimeout(() => {
        const query = {id: res.id, command: 'abort'};
        fetcher.getJSON('res', query).then(rows => r([res, rows]));
      }, 5000);
    });
  }).then(res => ({output: res, test: 'prop'}))
    .catch(err => ({output: err, test: 'prop'}))
);

testCases.push(() =>
  fetcher.getText('strprev', {
    format: 'dbid',
    table: 'DRUGBANKFDA',
    resourceFile: 'sdf_demo.sqlite3',
    value: 'DB00115'
  }).then(res => (
    {
      output: new DOMParser().parseFromString(res, "image/svg+xml"),
      test: 'strprev'
    }
  )).catch(err => ({output: err, test: 'strprev'}))
);


function run() {
  const tbl = {
      columns: [
        {key: 'test', sort: 'text', visible: true},
        {key: 'result', sort: 'text', visible: true}
      ],
      records: []
  };
  d3.select('#test').call(cmp.createTable, tbl);
  testCases.reduce((ps, curr) => {
    return () => ps()
      .then(curr)
      .then(res => {
        console.info(res.test);
        console.info(res.output);
        const row = [{'test': res.test, 'result': 'OK'}];
        cmp.appendTableRows(d3.select('#test'), row, d => d.key);
      })
      .catch(err => {
        console.error(err.test);
        console.error(err.output);
        const row = [{'test': err.test, 'result': '<span class="text-danger">NG<span>'}];
        cmp.appendTableRows(d3.select('#test'), row, d => d.key);
      });
  }, () => Promise.resolve())();
}
run();
