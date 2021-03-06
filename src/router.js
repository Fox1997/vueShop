import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/users.vue'
import Right from './components/power/Right.vue'
import Roles from './components/power/Roles.vue'
import Cate from './components/goods/Cate.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component: Welcome
        }, {
          path: '/users',
          component: Users
        }, {
          path: '/rights',
          component: Right
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path: '/categories',
          component: Cate
        }
      ]
    }
  ]
})
// 挂载路由导航守卫,路由导航守卫，主要是不允许未登录通过路由去访问额外的网页
router.beforeEach((to, from, next) => {
  // to是将要访问的路径，from是从哪个路径来，next是一个函数表示放行
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
