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
    const options = { method };
    let url = MILL3WP.admin_ajax;

    // set action on formdata
    formData.append('action', action);

    // append to formData all data entries
    Object.entries(data).forEach((d) => {
      formData.append(d[0], d[1]);
    })

    // Combine options and body unless method is GET.
    // Reason : Fetch API won't accept body param in GET mode
    if( method !== "get" ) options.body = formData;

    // Append formData to URL params
    if( method === "get" ) {
      const params = [];
      for(const [key, value] of formData.entries()) params.push(`${key}=${encodeURIComponent(value)}`);
      url += `?${params.join('&')}`;
    }

    return fetch(url, options)
      .then((response) => response.json())
      .then((json) => {
        return json;
      });
  }
}

const SINGLETON = new AJAX();
export default SINGLETON;
