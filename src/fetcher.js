
const baseURL = '';

function get(url, query={}) {
  const isEmpty = Object.keys(query).length;
  const q = isEmpty ? `?query=${JSON.stringify(query)}` : '';
  return fetch(
    `${baseURL}${url}${q}`,
    {
      credentials: 'include'
    }
  );
}

function getJSON(url, query={}) {
  return get(url, query).then(res => res.json());
}

function getText(url, query={}) {
  return get(url, query).then(res => res.text());
}

function getBlob(url, query={}) {
  return get(url, query).then(res => res.blob());
}

function postform(url, formdata) {
  return fetch(
    `${baseURL}${url}`,
    {
      method: 'POST',
      body: formdata,
      credentials: 'include'
    }
  );
}


export default {
  getJSON, getText, getBlob, postform
};
