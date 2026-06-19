<template>
  <div class="min-h-screen bg-gray-100">
    <AdminSidebar activePath="/admin/workorders" />

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
              @keyup.enter="handleSearch"
            />
            <button class="btn-outline px-4" @click="handleSearch">
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
              <tr v-for="order in orders" :key="order.id" class="border-b hover:bg-gray-50 transition-colors">
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

        <div v-if="orders.length === 0" class="text-center py-12 text-gray-500">
          <ClipboardList class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>暂无工单数据</p>
        </div>

        <!-- 分页组件 -->
        <div v-if="total > 0" class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-600">
            共 {{ total }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
          </div>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage >= totalPages"
              class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { LayoutDashboard, Users, Settings, BarChart3, LogOut, Home, ClipboardList, Search, Download } from 'lucide-vue-next'
import { authApi, workOrderApi } from '../api'
import { getStatusClass, getStatusText } from '../utils/status'

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
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isLoading = ref(false)

const filters = ref({
  status: '',
  area: '',
  priority: '',
  search: ''
})

// 加载工单列表（后端分页筛选）
const loadOrders = async () => {
  isLoading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      size: pageSize.value.toString()
    })
    if (filters.value.status) params.append('status', filters.value.status)
    if (filters.value.area) params.append('area', filters.value.area)
    if (filters.value.priority) params.append('priority', filters.value.priority)
    if (filters.value.search) params.append('search', filters.value.search)

    const response = await fetch(`/api/workorder/list?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const result = await response.json()
    if (result.success) {
      orders.value = result.data
      total.value = result.total
    }
  } catch (error) {
    console.error('加载工单列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  loadOrders()
}

// 监听筛选条件变化
watch([() => filters.value.status, () => filters.value.area, () => filters.value.priority], () => {
  currentPage.value = 1
  loadOrders()
})

// 监听分页变化
watch([currentPage, pageSize], () => {
  loadOrders()
})

// 计算总页数
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

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
