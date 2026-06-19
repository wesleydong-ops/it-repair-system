<template>
  <aside class="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-50">
    <div class="p-4 border-b border-gray-100">
      <button @click="goHome" class="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors w-full">
        <Home class="w-4 h-4" />
        返回首页
      </button>
    </div>
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-center gap-3">
        <img src="/logo.png" alt="FoxLink" class="w-16 h-6 object-contain drop-shadow-md" />
        <div>
          <span class="block font-bold text-darkblue text-lg">IT报修系统</span>
          <span class="block text-xs text-gray-500">Foxlink Admin</span>
        </div>
      </div>
    </div>
    <nav class="p-4">
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.path">
          <a
            :href="item.path"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
              isActive(item.path) ? 'bg-darkblue text-white shadow-md' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5" />
            {{ item.label }}
          </a>
        </li>
      </ul>
    </nav>
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
      <button @click="handleLogout" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-300 w-full">
        <LogOut class="w-5 h-5" />
        退出登录
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Home, LayoutDashboard, Users, Settings, BarChart3, ClipboardList, LogOut } from 'lucide-vue-next'
import { authApi } from '../api'

const router = useRouter()

const props = defineProps<{
  activePath?: string
}>()

const userRole = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.role || ''
  } catch {
    return ''
  }
})

const menuItems = computed(() => {
  const items = [
    { path: '/admin', icon: LayoutDashboard, label: '仪表盘' },
    { path: '/admin/users', icon: Users, label: '用户管理' },
    { path: '/admin/groups', icon: Users, label: '工程师分组' },
    { path: '/admin/projects', icon: Settings, label: '维修项目' },
    { path: '/admin/workorders', icon: ClipboardList, label: '工单管理' },
    { path: '/admin/statistics', icon: BarChart3, label: '数据统计' }
  ]
  
  // 运维员不显示系统设置
  if (userRole.value !== 'operator') {
    items.push({ path: '/admin/settings', icon: Settings, label: '系统设置' })
  }
  
  return items
})

const isActive = (path: string) => {
  if (props.activePath) {
    return props.activePath === path
  }
  return router.currentRoute.value.path === path
}

const goHome = () => {
  window.location.href = '/'
}

const handleLogout = () => {
  authApi.logout()
  router.push('/admin/login')
}
</script>
