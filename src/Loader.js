
import KArray from './helper/KArray.js';
import {default as store} from './store/StoreConnection.js';

const localServer = store.localChemInstance();


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
  const serverConfig = localServer.status().then(res => {
    store.setGlobalConfig('server', res);
  });
  return serverConfig.then(() => {
    const clientResource = store.getResourceVersion();
    if (server.resourceVersion === clientResource) {
      localServer.getResources().then(res => {
        const indexed = res.map((e, i) => {
          e.idx = i;
          return e;
        });
        store.setResources(indexed);
        store.setGlobalConfig('resources', res.resources);
        store.setGlobalConfig('templates', res.templates);
      });
    }
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
  return fetch(`${localServer.baseURL}favicon.ico`)
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
