/* eslint-disable no-undef */

//
// Usage :
//
// AJAX.post('get_all_dummies', { 'bar': 1 });
//

class AJAX {
  get(action, data = {}) {
    return this.send("get", action, data);
  }

  post(action, data = {}) {
    return this.send("post", action, data);
  }

  send(method = "get", action, data = {}) {
    const formData = new FormData();
    formData.append('action', action);
    //
    Object.entries(data).forEach((d) => {
      console.log('d:', d)
      formData.append(d[0], d[1]);
    })

    // combine optons and body unless method is in GET
    let options = { method, ...(method !== "get" ? { body: formData } : {}) };
    console.log('options:', options)

    return fetch(MILL3WP.admin_ajax, options)
      .then((response) => response.json())
      .then((json) => {
        return json;
      });
  }
}

const SINGLETON = new AJAX();
export default SINGLETON;
