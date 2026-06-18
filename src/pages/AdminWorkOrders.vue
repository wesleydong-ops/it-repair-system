<template>
  <div class="min-h-screen bg-gray-100">
    <aside class="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg">
      <div class="p-4 border-b">
        <button @click="goHome" class="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors w-full">
          <Home class="w-4 h-4" />
          返回首页
        </button>
      </div>
      <div class="p-6 border-b">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="FoxLink" class="w-16 h-6 object-contain drop-shadow-md" />
          <span class="font-bold text-gray-800">IT报修系统</span>
        </div>
      </div>
      <nav class="p-4">
        <ul class="space-y-2">
          <li>
            <a href="/admin" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <LayoutDashboard class="w-5 h-5" />
              仪表盘
            </a>
          </li>
          <li>
            <a href="/admin/users" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Users class="w-5 h-5" />
              用户管理
            </a>
          </li>
          <li>
            <a href="/admin/groups" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Users class="w-5 h-5" />
              工程师分组
            </a>
          </li>
          <li>
            <a href="/admin/projects" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings class="w-5 h-5" />
              维修项目
            </a>
          </li>
          <li>
            <a href="/admin/workorders" class="flex items-center gap-3 px-4 py-3 bg-darkblue text-white rounded-xl shadow-md">
              <ClipboardList class="w-5 h-5" />
              工单管理
            </a>
          </li>
          <li>
            <a href="/admin/statistics" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <BarChart3 class="w-5 h-5" />
              数据统计
            </a>
          </li>
          <li v-if="userRole !== 'operator'">
            <a href="/admin/settings" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings class="w-5 h-5" />
              系统设置
            </a>
          </li>
        </ul>
      </nav>
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t">
        <button @click="handleLogout" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors w-full">
          <LogOut class="w-5 h-5" />
          退出登录
        </button>
      </div>
    </aside>

    <main class="ml-64 p-8">
      <header class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">工单管理</h1>
            <p class="text-gray-600 mt-2">查看所有工单和处理状态</p>
          </div>
          <div class="flex gap-3">
            <button @click="exportData" class="btn-outline">
              <Download class="w-4 h-4 inline mr-1" />
              导出
            </button>
          </div>
        </div>
      </header>

      <div class="card fade-in">
        <div class="flex flex-wrap gap-4 mb-6">
          <div class="flex items-center gap-2">
            <label class="text-gray-600 font-medium">状态:</label>
            <select v-model="filters.status" class="form-select w-32">
              <option value="">全部</option>
              <option value="pending">待接单</option>
              <option value="accepted">已接单</option>
              <option value="processing">处理中</option>
              <option value="external_pending">外修待处理</option>
              <option value="external_processing">外修处理中</option>
              <option value="completed">已完成</option>
              <option value="closed">已结案</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-gray-600 font-medium">区域:</label>
            <select v-model="filters.area" class="form-select w-24">
              <option value="">全部</option>
              <option value="A">A区</option>
              <option value="CK">CK区</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-gray-600 font-medium">优先级:</label>
            <select v-model="filters.priority" class="form-select w-24">
              <option value="">全部</option>
              <option value="urgent">紧急</option>
              <option value="normal">普通</option>
            </select>
          </div>
          <div class="flex-1"></div>
          <div class="flex gap-2">
            <input
              v-model="filters.search"
              type="text"
              class="form-input w-64"
              placeholder="搜索工单号、申请人..."
            />
            <button class="btn-outline px-4">
              <Search class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">工单号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">申请人</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">设备类型</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">故障类型</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">区域</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">优先级</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">状态</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">工程师</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">创建时间</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrders" :key="order.id" class="border-b hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-primary-600">{{ order.orderNo }}</td>
                <td class="px-4 py-3">{{ order.applicantName }}</td>
                <td class="px-4 py-3">{{ order.deviceType }}</td>
                <td class="px-4 py-3">{{ order.projectName }}</td>
                <td class="px-4 py-3">
                  <span :class="order.area === 'A' ? 'area-a' : 'area-ck'">
                    {{ order.area === 'A' ? 'A区' : 'CK区' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span :class="order.priority === 'urgent' ? 'priority-urgent' : 'priority-normal'">
                    {{ order.priority === 'urgent' ? '紧急' : '普通' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="order.engineerName">{{ order.engineerName }}</span>
                  <span v-else class="text-gray-400">未分配</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ order.createTime }}</td>
                <td class="px-4 py-3">
                  <button @click="viewOrder(order.id)" class="text-primary hover:text-blue-600 text-sm">
                    详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredOrders.length === 0" class="text-center py-12 text-gray-500">
          <ClipboardList class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>暂无工单数据</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { LayoutDashboard, Users, Settings, BarChart3, LogOut, Home, ClipboardList, Search, Download } from 'lucide-vue-next'
import { authApi, workOrderApi } from '../api'

const router = useRouter()

// 获取当前用户角色，运维员(operator)隐藏系统设置
const userRole = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.role || ''
  } catch {
    return ''
  }
})

const goHome = () => {
  window.location.href = '/'
}

interface WorkOrder {
  id: string
  orderNo: string
  applicantName: string
  deviceType: string
  projectName: string
  area: string
  priority: string
  status: string
  engineerName: string
  createTime: string
}

const orders = ref<WorkOrder[]>([])

const filters = ref({
  status: '',
  area: '',
  priority: '',
  search: ''
})

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    if (filters.value.status && order.status !== filters.value.status) return false
    if (filters.value.area && order.area !== filters.value.area) return false
    if (filters.value.priority && order.priority !== filters.value.priority) return false
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      return (
        order.orderNo.toLowerCase().includes(search) ||
        order.applicantName.toLowerCase().includes(search)
      )
    }
    return true
  })
})

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'status-pending',
    accepted: 'status-accepted',
    processing: 'status-processing',
    external_pending: 'status-external-pending',
    external_processing: 'status-external-processing',
    completed: 'status-completed',
    closed: 'status-closed'
  }
  return classes[status] || 'status-pending'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待接单',
    accepted: '已接单',
    processing: '处理中',
    external_pending: '外修待处理',
    external_processing: '外修处理中',
    completed: '已完成',
    closed: '已结案'
  }
  return texts[status] || '未知'
}

const loadOrders = async () => {
  try {
    const response = await workOrderApi.list()
    orders.value = response.data.data
  } catch (error) {
    console.error('加载工单列表失败:', error)
  }
}

const viewOrder = (id: string) => {
  router.push(`/workorder/${id}`)
}

const exportData = () => {
  alert('导出功能开发中')
}

const handleLogout = () => {
  authApi.logout()
  router.push('/admin/login')
}

onMounted(() => {
  loadOrders()
})
</script>
