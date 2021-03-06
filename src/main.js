import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
// import store from './store'
import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 通过axios请求拦截器添加token
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  // store,
  render: h => h(App)
}).$mount('#app')
