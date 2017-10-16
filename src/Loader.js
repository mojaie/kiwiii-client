
import {default as store} from './store/StoreConnection.js';
import {default as fetcher} from './fetcher.js';


function loader() {
  /*
  if (document.location.protocol === "file:") {
    console.info('Off-line mode (local file)');
    store.setGlobalConfig('onLine', false);
    return Promise.resolve();
  }
  if ('onLine' in navigator) {
    if (!navigator.onLine) {
      console.info('Off-line mode (no internet connection)');
      store.setGlobalConfig('onLine', false);
      return Promise.resolve();
    }
  }*/
  if ('serviceWorker' in navigator && !debug) {
    navigator.serviceWorker
      .register('sw.js')
      .then(reg => {
        console.info('ServiceWorker registration successful with scope: ', reg.scope);
      }).catch(err => {
        console.info('ServiceWorker registration failed: ', err);
      });
  } else if (debug) {
    console.info('Off-line mode is disabled for debugging');
  } else {
    console.info('Off-line mode is not supported');
  }
  const server = fetcher.get('server')
    .then(fetcher.json)
    .catch(() => null);
  const local = store.getAppSetting('serverInstance');
  return Promise.all([server, local]).then(ps => {
    const serverStatus = ps[0];
    const clientInstance = ps[1];
    if (!serverStatus) return Promise.resolve(null);
    if (serverStatus.instance === clientInstance) {
      console.info('Resource schema is already up to date');
      return Promise.resolve(serverStatus);
    } else {
      return fetcher.get('schema')
        .then(fetcher.json)
        .then(schema => {
          console.info(`New resource schema version: ${serverStatus.instance}`);
          return Promise.all([
            store.setAppSetting('serverInstance', serverStatus.instance),
            store.setResources(schema.resources),
            store.setAppSetting('templates', schema.templates),
            store.setAppSetting('rdkit', serverStatus.rdkit)
          ])
          .then(() => Promise.resolve(serverStatus));
        }, fetcher.error);
    }
  });
}


export default {
  loader
};
