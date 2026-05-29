import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import RepairForm from '../pages/RepairForm.vue'
import WorkOrderList from '../pages/WorkOrderList.vue'
import AdminLogin from '../pages/AdminLogin.vue'
import AdminDashboard from '../pages/AdminDashboard.vue'
import AdminUsers from '../pages/AdminUsers.vue'
import AdminGroups from '../pages/AdminGroups.vue'
import AdminProjects from '../pages/AdminProjects.vue'
import AdminStatistics from '../pages/AdminStatistics.vue'
import AdminSettings from '../pages/AdminSettings.vue'
import WorkOrderDetail from '../pages/WorkOrderDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/repair',
    name: 'RepairForm',
    component: RepairForm
  },
  {
    path: '/workorders',
    name: 'WorkOrderList',
    component: WorkOrderList
  },
  {
    path: '/workorder/:id',
    name: 'WorkOrderDetail',
    component: WorkOrderDetail
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/groups',
    name: 'AdminGroups',
    component: AdminGroups,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/projects',
    name: 'AdminProjects',
    component: AdminProjects,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/statistics',
    name: 'AdminStatistics',
    component: AdminStatistics,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: AdminSettings,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('token') !== null
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/admin/login')
  } else {
    next()
  }
})

export default router
