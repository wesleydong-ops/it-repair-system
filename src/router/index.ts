import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import RepairForm from '../pages/RepairForm.vue'
import WorkOrderList from '../pages/WorkOrderList.vue'
import AdminLogin from '../pages/AdminLogin.vue'
import AdminDashboard from '../pages/AdminDashboard.vue'
import AdminUsers from '../pages/AdminUsers.vue'
import AdminGroups from '../pages/AdminGroups.vue'
import AdminProjects from '../pages/AdminProjects.vue'
import AdminWorkOrders from '../pages/AdminWorkOrders.vue'
import AdminStatistics from '../pages/AdminStatistics.vue'
import AdminSettings from '../pages/AdminSettings.vue'
import WorkOrderDetail from '../pages/WorkOrderDetail.vue'
import EngineerLogin from '../pages/EngineerLogin.vue'
import EngineerDashboard from '../pages/EngineerDashboard.vue'
import PurchaserLogin from '../pages/PurchaserLogin.vue'
import PurchaserDashboard from '../pages/PurchaserDashboard.vue'

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
    path: '/engineer/login',
    name: 'EngineerLogin',
    component: EngineerLogin
  },
  {
    path: '/engineer',
    name: 'EngineerDashboard',
    component: EngineerDashboard,
    meta: { requiresAuth: true, role: 'engineer' }
  },
  {
    path: '/purchaser/login',
    name: 'PurchaserLogin',
    component: PurchaserLogin
  },
  {
    path: '/purchaser',
    name: 'PurchaserDashboard',
    component: PurchaserDashboard,
    meta: { requiresAuth: true, role: 'purchaser' }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: ['admin', 'operator'] }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true, role: ['admin', 'operator'] }
  },
  {
    path: '/admin/groups',
    name: 'AdminGroups',
    component: AdminGroups,
    meta: { requiresAuth: true, role: ['admin', 'operator'] }
  },
  {
    path: '/admin/projects',
    name: 'AdminProjects',
    component: AdminProjects,
    meta: { requiresAuth: true, role: ['admin', 'operator'] }
  },
  {
    path: '/admin/workorders',
    name: 'AdminWorkOrders',
    component: AdminWorkOrders,
    meta: { requiresAuth: true, role: ['admin', 'operator'] }
  },
  {
    path: '/admin/statistics',
    name: 'AdminStatistics',
    component: AdminStatistics,
    meta: { requiresAuth: true, role: ['admin', 'operator'] }
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: AdminSettings,
    meta: { requiresAuth: true, role: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('token') !== null
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    const requiredRole = to.meta.role as string | string[]
    if (Array.isArray(requiredRole)) {
      // 管理员页面：admin 或 operator 可以访问
      if (requiredRole.includes('admin')) {
        next('/admin/login')
      } else {
        next('/admin/login')
      }
    } else if (requiredRole === 'engineer') {
      next('/engineer/login')
    } else if (requiredRole === 'purchaser') {
      next('/purchaser/login')
    } else {
      next('/admin/login')
    }
    return
  }
  
  // 已登录用户访问需认证页面时，检查角色权限
  if (to.meta.requiresAuth && isLoggedIn) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const requiredRole = to.meta.role as string | string[]
      
      let hasPermission = false
      if (Array.isArray(requiredRole)) {
        hasPermission = requiredRole.includes(user.role)
      } else {
        hasPermission = user.role === requiredRole
      }
      
      if (!hasPermission) {
        // 根据用户角色重定向到对应页面
        if (user.role === 'engineer') {
          next('/engineer')
        } else if (user.role === 'purchaser') {
          next('/purchaser')
        } else {
          next('/admin')
        }
        return
      }
    } catch {}
  }
  
  // 运维员(operator)禁止访问系统设置页面
  if (to.path === '/admin/settings') {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.role === 'operator') {
        next('/admin')
        return
      }
    } catch {}
  }
  
  next()
})

export default router
