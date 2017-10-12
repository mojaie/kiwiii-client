
import d3 from 'd3';

import {default as cmp} from './component/Component.js';
import {default as fetcher} from './fetcher.js';


const testCases = [];

testCases.push(() =>
  fetcher.getJSON('server')
    .then(res => ({output: res, test: 'server', pass: true}))
    .catch(err => ({output: err, test: 'server', pass: false}))
);

testCases.push(() =>
  fetcher.getJSON('schema')
    .then(res => ({output: res, test: 'schema', pass: true}))
    .catch(err => ({output: err, test: 'schema', pass: false}))
);

testCases.push(() =>
  fetcher.getJSON('run', {
    type: 'chemsearch',
    targets: ['drugbankfda'],
    key: 'id',
    values: ['DB00189', 'DB00193', 'DB00203', 'DB00865', 'DB01143']
  }).then(res => ({output: res, test: 'chemsearch', pass: true}))
    .catch(err => ({output: err, test: 'chemsearch', pass: false}))
);

testCases.push(() =>
  fetcher.getJSON('run', {
    type: 'filter',
    targets: ['test1', 'test1_2', 'freqhit'],
    key: 'id',
    values: ['DB00189', 'DB00193', 'DB00203', 'DB00865', 'DB01143'],
    operator: 'in'
  }).then(res => ({output: res, test: 'filter', pass: true}))
    .catch(err => ({output: err, test: 'filter', pass: false}))
);

testCases.push(() =>
  fetcher.getJSON('run', {
    type: 'profile',
    id: 'DB00189'
  }).then(res => ({output: res, test: 'profile', pass: true}))
    .catch(err => ({output: err, test: 'profile', pass: false}))
);

testCases.push(() =>
  fetcher.getText('strprev', {
    format: 'dbid',
    source: 'drugbankfda',
    value: 'DB00115'
  }).then(res => (
    {
      output: new DOMParser().parseFromString(res, "image/svg+xml"),
      test: 'strprev', pass: true
    }
  )).catch(err => ({output: err, test: 'strprev', pass: false}))
);

testCases.push(() =>
  new Promise(r => {
    fetcher.getJSON('async', {
      type: 'substr',
      targets: ['drugbankfda'],
      queryMol: {
        format: 'dbid',
        source: 'drugbankfda',
        value: 'DB00115'
      },
      params: {
        ignoreHs: true
      }
    }).then(res => {
      setTimeout(() => {
        const query = {id: res.id, command: 'abort'};
        fetcher.getJSON('res', query).then(rows => r([res, rows]));
      }, 2000);
    });
  }).then(res => ({output: res, test: 'substr', pass: true}))
    .catch(err => ({output: err, test: 'substr', pass: false}))
);

testCases.push(() =>
  new Promise(r => {
    fetcher.getJSON('async', {
      type: 'chemprop',
      targets: ['drugbankfda'],
      key: '_mw',
      values: [1000],
      operator: 'gt'
    }).then(res => {
      setTimeout(() => {
        const query = {id: res.id, command: 'abort'};
        fetcher.getJSON('res', query).then(rows => r([res, rows]));
      }, 2000);
    });
  }).then(res => ({output: res, test: 'prop', pass: true}))
    .catch(err => ({output: err, test: 'prop', pass: false}))
);


function run() {
  const tbl = {
      fields: [
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
        const pass = res.pass ? 'OK' : '<span class="text-danger">NG<span>';
        const row = [{'test': res.test, 'result': pass}];
        cmp.appendTableRows(d3.select('#test'), row, d => d.key);
      })
      ;
  }, () => Promise.resolve())();
}
run();
