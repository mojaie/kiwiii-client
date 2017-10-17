
import Fetcher from './Fetcher.js';


export class LocalServerActivity extends Fetcher {
  constructor() {
    super();
    this.baseURL = './';
    this.domain = 'activity';
    this.entities = [];
  }

  serializedRequest(url, query={}) {
    const formData = new FormData();
    formData.set('query', JSON.stringify(query));
    return fetch(`${this.baseURL}${url}`,
      {method: 'get', body: formData, credentials: 'include'});
  }

  request(url, query={}) {
    const isEmpty = Object.keys(query).length;
    const q = isEmpty ? `?query=${JSON.stringify(query)}` : '';
    return fetch(`${this.baseURL}${url}${q}`, {credentials: 'include'});
  }

  getResources() {
    return this.request('schema').then(res => res.json());
  }

  getRecords(queries) {
    return this.request('run', queries)
      .then(res => res.json());
  }

  getRecordsByCompound(compound) {
    // TODO: this.entities
    const query = {
      method: 'sql',
      targets: this.entities,
      key: 'ID',
      values: [compound],
      operator: 'eq'
    };
    return this.getRecords(query);
  }

  getMapping(ids, column) {
    const query = {
      method: 'sql',
      targets: [column.entity],
      key: 'ID',
      values: ids,
      operator: 'fm'
    };
    return this.request('sql', query)
      .then(res => res.json())
      .then(json => {
        const mapping = {};
        json.records
          .forEach(row => { mapping[row.ID] = row[column.key]; });
        return {
          key: query.key,
          column: column,
          mapping: mapping,
          lastUpdated: this.now(),
        };
      });
  }

  schema() {
    return this.request('schema').then(res => res.json());
  }

  status() {
    return this.request('server').then(res => res.json());
  }

  strprev(query) {
    return this.request('strprev', query).then(res => res.text());
  }

  exportExcel(query) {
    return this.request('xlsx', query).then(res => res.blob());
  }

  exportSDFile(query) {
    return this.request('sdfout', query).then(res => res.text());
  }

  reportPreview(query) {
    return this.request('reportprev', query).then(res => res.json());
  }

  report(query) {
    return this.request('report', query).then(res => res.blob());
  }
}


export class LocalServerChemical extends LocalServerActivity {
  constructor() {
    super();
    this.domain = 'chemical';
    this.hiddenColumns = ["_mw", "_mw_wo_sw", "_formula", "_logp", "_nonH"];
  }

  formatResult(cols, data) {
    if (cols.length === 0) {  // sdf
      data.columns.forEach(col => {
        col.visible = this.hiddenColumns.includes(col.key) ? false : true;
      });
      return data;
    }
    Array.prototype.push.apply(data.columns, cols);
    if (data.hasOwnProperty('extraColumns')) {
      Array.prototype.push.apply(data.columns, data.extraColumns);
      delete data.extraColumns;
    }
    data.columns.forEach(col => {
      if (!col.hasOwnProperty('name')) col.name = col.key;
      if (col.key === data.query.key) {
        col.visible = true;  // Search key
      } else {
        col.visible = this.hiddenColumns.includes(col.key) ? false : true;
      }
    });
    data.lastUpdated = this.now();
    return data;
  }

  getResources() {
    return this.request('schema')
      .then(res => res.json())
      .then(json => {
        this.available = true;
        return json.resources;
      });
  }

  getRecords(query) {
    let url;
    if (query.hasOwnProperty('command')) {
      url = 'res';
    } else if (query.hasOwnProperty('nodesID')) {
      url = 'simnet';
    } else if (["search", "filter", "chemsearch", "chemfilter", "exact"].includes(query.type)) {
      url = 'run';
    } else {
      url = 'async';
    }
    return this.request(url, query).then(res => res.json());
  }

  importSDF(query) {
    return this.request('sdfin', query)
    .then(res => res.json())
    .then(json => {
      json.columns.forEach(col =>{
        col.visible = this.hiddenColumns.includes(col.key) ? false : true;
      });
      const now = new Date();
      json.lastUpdated = now.toString();
      return json;
    });
  }
}
