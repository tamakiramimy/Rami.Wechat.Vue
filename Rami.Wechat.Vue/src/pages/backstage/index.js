import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import './router/promissionRouter'
import ElementUI from 'element-ui'
import msg from '../../utils/msg'
import http from '../../utils/http'
import './utils/axiosfilter'
import storeHelper from '../../utils/storeHelper'

import 'element-ui/lib/theme-chalk/index.css'
import 'font-awesome/css/font-awesome.css'

Vue.config.productionTip = false;

// 挂载全局方法
Vue.prototype.$http = http;
Vue.prototype.$msg = msg;
Vue.prototype.$storeHelper = storeHelper;
Vue.use(ElementUI);

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')