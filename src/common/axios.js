import axios from 'axios';
import global from './global.js'
import router from '@/router/index.js';


// 创建axios实例
const service = axios.create();

// 切换域名
const baseUrl = process.env.NODE_ENV === 'development' ? global.baseUrl.dev : global.baseUrl.pro

// 默认设置
service.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
// service.defaults.headers.get['content-type'] = 'application/json;charset=UTF-8'
service.defaults.baseURL = baseUrl;

// http request 拦截器
service.interceptors.request.use(
  config => {
    // 请求之前
    return config
  },
  err => {
    // 对请求错误做些什么
    return Promise.reject(err)
  })

// http response 拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据操作
    return response.data
  },
  async error => {

    let { data, status } = error.response;
    if (status == 401 && data.code == -1) {
      router.replace({
        path: '/404',
        query: {
          redirect: router.currentRoute.fullPath
        }
      });
    } else if (status === 404) {
      router.replace({
        path: '/404',
        query: {
          redirect: router.currentRoute.fullPath
        }
      });
    }
    return Promise.reject(error.response.data)
  })

export default service
