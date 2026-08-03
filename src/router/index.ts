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
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/groups',
    name: 'AdminGroups',
    component: AdminGroups,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/projects',
    name: 'AdminProjects',
    component: AdminProjects,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/workorders',
    name: 'AdminWorkOrders',
    component: AdminWorkOrders,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/statistics',
    name: 'AdminStatistics',
    component: AdminStatistics,
    meta: { requiresAuth: true, role: 'admin' }
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

// 检查 token 是否过期
function isTokenExpired(): boolean {
  const token = localStorage.getItem('token')
  if (!token) return true
  
  try {
    // JWT 格式：header.payload.signature
    const payload = JSON.parse(atob(token.split('.')[1]))
    // exp 是秒级时间戳
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

// 清除登录状态并根据角色跳转到对应登录页
function clearAndRedirect(requiredRole: string | string[], next: Function) {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  if (Array.isArray(requiredRole)) {
    next('/admin/login')
  } else if (requiredRole === 'engineer') {
    next('/engineer/login')
  } else if (requiredRole === 'purchaser') {
    next('/purchaser/login')
  } else {
    next('/admin/login')
  }
}

router.beforeEach((to, from, next) => {
  const hasToken = localStorage.getItem('token') !== null
  const tokenExpired = isTokenExpired()
  
  // token 过期时清除登录状态
  if (hasToken && tokenExpired) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
  
  const isLoggedIn = hasToken && !tokenExpired
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    const requiredRole = to.meta.role as string | string[]
    clearAndRedirect(requiredRole, next)
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
  
  next()
})

export default router
