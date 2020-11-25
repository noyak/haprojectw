import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

  const routes = [
  {
    path: '/ApproveDetail',
    name: 'ApproveDetail',
    component: () => import( '../views/approve/ApproveDetail.vue'),
    meta:{
      title: '审批'
  }
  }

]




const router = new VueRouter({
  routes
})

export default router
