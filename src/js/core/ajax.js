import axios from "axios";

class AJAX {
  get(action, data = {}) {
    return this.send("get", action, data);
  }

  post(action, data = {}) {
    return this.send("post", action, data);
  }

  send(method = "get", action, data = {}) {
    const params = {
      action: action,
      ...data
    };

    return axios({
      url: wp.admin_ajax,
      method,
      params
    });
  }
}

const SINGLETON = new AJAX();
export default SINGLETON;
