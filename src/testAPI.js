
import d3 from 'd3';
import {default as cmp} from './component/Component.js';
import {LocalServerActivity, LocalServerChemical} from './fetcher/LocalServer.js';
import {ScreenerFitting, ScreenerRawValue} from './fetcher/Screener.js';
import {ScreenerFittingStub, ScreenerRawValueStub} from './fetcher/ScreenerTestStub.js';

const API = {
  chemical: new LocalServerChemical(),
  activity: new LocalServerActivity(),
  screenerrawvalue: new ScreenerRawValue(),
  screenerfitting: new ScreenerFitting(),
  screenerrawvaluestub: new ScreenerRawValueStub(),
  screenerfittingstub: new ScreenerFittingStub()
};

const testCases = [];

testCases.push({
  name: 'status',
  testCase: () => API.chemical.status()
});

testCases.push({
  name: 'resources',
  testCase: () => API.chemical.getResources()
});

testCases.push({
  name: 'sqlTest1',
  testCase: () => {
    const query = {
      type: 'chemsearch',
      tables: ['DRUGBANKFDA'],
      resourceFile: 'sdf_demo.sqlite3',
      key: 'id',
      values: ['DB00189', 'DB00193', 'DB00203', 'DB00865', 'DB01143']
    };
    return API.chemical.getRecords(query);
  }
});

testCases.push({
  name: 'sqlTest2',
  testCase: () => {
    const query = {
      type: 'filter',
      tables: ['TEST1_LIB1', 'FREQHIT'],
      resourceFile: 'text_demo.sqlite3',
      key: 'id',
      values: ['DB00189', 'DB00193', 'DB00203', 'DB00865', 'DB01143'],
      operator: 'in'
    };
    return API.activity.getRecords(query);
  }
});

testCases.push({
  name: 'computeTest1',
  testCase: () => {
    const query = {
      type: 'substr',
      tables: ['DRUGBANKFDA'],
      resourceFile: 'sdf_demo.sqlite3',
      queryMol: {
        format: 'dbid',
        table: 'DRUGBANKFDA',
        resourceFile: 'sdf_demo.sqlite3',
        value: 'DB00115'
      },
      ignoreHs: true
    };
    return API.chemical.getRecords(query).then(res => {
      return new Promise(r => {
        setTimeout(() => {
          const query = {id: res.id, command: 'abort'};
          API.chemical.getRecords(query).then(rows => r([res, rows]));
        }, 5000);
      });
    });
  }
});

testCases.push({
  name: 'computeTest2',
  testCase: () => {
    const query = {
      type: 'prop',
      tables: ['DRUGBANKFDA'],
      resourceFile: 'sdf_demo.sqlite3',
      key: '_mw',
      values: [1000],
      operator: 'gt'
    };
    return API.chemical.getRecords(query).then(res => {
      return new Promise(r => {
        setTimeout(() => {
          const query = {id: res.id, command: 'abort'};
          API.chemical.getRecords(query).then(rows => r([res, rows]));
        }, 10000);
      });
    });
  }
});

testCases.push({
  name: 'strprev',
  testCase: () => {
    const query = {
      format: 'dbid',
      table: 'DRUGBANKFDA',
      resourceFile: 'sdf_demo.sqlite3',
      value: 'DB00115'
    };
    return API.chemical.strprev(query)
      .then(res => new DOMParser().parseFromString(res, "image/svg+xml"));
  }
});


function run() {
  const tbl = {
      columns: [
        {key: 'test', sort: 'text', visible: true},
        {key: 'result', sort: 'text', visible: true}
      ],
      records: []
  };
  d3.select('#test').call(cmp.createTable, tbl);
  testCases.forEach(p => {
    p.testCase().then(res => {
      console.info(p.name);
      console.info(res);
      const row = [{'test': p.name, 'result': 'OK'}];
      cmp.appendTableRows(d3.select('#test'), row, d => d.key);
    }).catch(err => {
      console.error(err);
      const row = [{'test': p.name, 'result': '<span class="text-danger">NG<span>'}];
      cmp.appendTableRows(d3.select('#test'), row, d => d.key);
    });
  });
}
run();
