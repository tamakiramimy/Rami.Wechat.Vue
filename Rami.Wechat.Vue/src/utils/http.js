import axios from 'axios';
import { Promise } from 'q';

// 配置API接口地址
const root = process.env.NODE_ENV == 'development' ? 'http://localhost:5003/api/' : 'http://localhost:5003/api/';

// axios 选项
let options = {
  baseURL: root //根url
  //timeout: 20000,
};

let http = axios.create(options);

// 自定义判断元素类型JS
function toType(obj) {
  return {}.toString
    .call(obj)
    .match(/\s([a-zA-Z]+)/)[1]
    .toLowerCase();
}

// 参数过滤函数
function filterNull(o) {
  for (var key in o) {
    if (o[key] === null) {
      delete o[key];
    }
    if (toType(o[key]) === 'string') {
      o[key] = o[key].trim();
    } else if (toType(o[key]) === 'object') {
      o[key] = filterNull(o[key]);
    } else if (toType(o[key]) === 'array') {
      o[key] = filterNull(o[key]);
    }
  }

  return o;
}

/**
 * 封装axios 请求
 * @param {*} method
 * @param {*} url
 * @param {*} params
 */
function apiAxios(method, url, params) {
  if (params) {
    params = filterNull(params);
  }

  return new Promise((success, reject) => {
    http({
      method: method,
      url: url,
      data: method === 'POST' || method === 'PUT' ? params : null,
      params: method === 'GET' || method === 'DELETE' ? params : null
    })
      .then(res => {
        if (typeof res.data == 'undefined') {
          let resp = res.response;
          if (typeof resp != 'undefined') {
            if (resp.status == 200) {
              success(res.data);
            } else {
              console.log(`请求失败：${JSON.stringify(resp.data)}`);
            }
          }
        } else {
          success(res.data);
        }
      })
      .catch(res => {
        console.log(`请求失败:${res}`);
        reject(res);
      });
  });
}

// 返回在vue模板中的调用接口
export default {
  http: http,
  root: root,
  get: function(url, params) {
    return apiAxios('GET', url, params);
  },
  post: function(url, params) {
    return apiAxios('POST', url, params);
  },
  put: function(url, params) {
    return apiAxios('PUT', url, params);
  },
  delete: function(url, params) {
    return apiAxios('DELETE', url, params);
  }
};
