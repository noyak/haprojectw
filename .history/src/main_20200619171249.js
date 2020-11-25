import Vue from 'vue'
import App from './App.vue'
import router  from './router'
import qs from 'qs';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
import VueWechatTitle from 'vue-wechat-title'
Vue.use(VueWechatTitle)
import customComponents from  "./custom-components.js"
Vue.use(customComponents);
import {get,post} from './common/api'
Vue.prototype.get = get;
Vue.prototype.post = post;
Vue.prototype.$qs = qs
Vue.prototype.userApiUrl = 'http://mobilet.haxm.org'
Vue.prototype.pdfurl = 'https://mobile.haxm.com/kos/pdf/web/viewer.html?file=https://hrpservice.cndcare.com/hrpservice/attachment/getPDF/'



new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
router.beforeEach((to, from, next) => {
  /* 路由发生变化修改页面title */
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})