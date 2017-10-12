
import {default as store} from './store/StoreConnection.js';
import {default as fetcher} from './fetcher.js';


function initialize() {
  if ('serviceWorker' in navigator && !debug) {
    navigator.serviceWorker
      .register('sw.js')
      .then(registration => {
        console.info(
          'ServiceWorker registration successful with scope: ',
          registration.scope
        );
      }).catch(err => {
        console.info('ServiceWorker registration failed: ', err);
      });
  } else if (debug) {
    console.info('Off-line mode is disabled for debugging');
  } else {
    console.info('Off-line mode is not supported');
  }
  return fetcher.getJSON('server').then(server => {
    store.setGlobalConfig('server', server);
    return store.getAppSetting('serverInstance').then(instance => {
      if (server.instance === instance) {
        console.info('Local resource schema is already up to date');
        return;
      }
      return fetcher.getJSON('schema').then(schema => {
        console.info(`Resource schema is updated to version <${server.instance}>`);
        return Promise.All([
          store.setAppSetting('serverInstance', server.instance),
          store.setResources(schema.resources),
          store.setAppSetting('templates', schema.templates),
          store.setAppSetting('rdkit', schema.rdkit)
        ]);
      });
    });
  });
}


function loader() {
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
  }
  return fetcher.getBlob('favicon.ico')
    .then(() => {
      // HTTP 404
      store.setGlobalConfig('onLine', true);
      return initialize();
    }).catch(() => {
      console.info('Off-line mode (server not responding)');
      store.setGlobalConfig('onLine', false);
      return Promise.resolve();
    });
}


export default {
  loader
};
