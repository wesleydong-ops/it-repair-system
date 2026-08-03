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
            <a href="/purchaser" class="flex items-center gap-3 px-4 py-3 bg-darkblue text-white rounded-xl shadow-md">
              <ClipboardList class="w-5 h-5" />
              外修审批
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
      <div v-if="isLoading" class="text-center py-12 text-gray-500">
        <p>加载中...</p>
      </div>
      <div v-else-if="error" class="text-center py-12 text-red-500">
        <p>加载失败：{{ error }}</p>
        <button @click="loadOrders" class="btn-primary mt-4">重试</button>
      </div>
      <template v-else>
      <header class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">外修审批</h1>
            <p class="text-gray-600 mt-2">处理工程师提交的外修申请</p>
          </div>
          <div class="flex gap-3">
            <div class="flex items-center gap-2">
              <label class="text-gray-600 font-medium">状态:</label>
              <select v-model="filterStatus" class="form-select w-32">
                <option value="">全部</option>
                <option value="external_pending">待审批</option>
                <option value="external_processing">处理中</option>
                <option value="external_rejected">已驳回</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">待审批</p>
              <p class="text-3xl font-bold text-orange-600 mt-1">{{ pendingCount }}</p>
            </div>
            <div class="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock class="w-7 h-7 text-orange-600" />
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">处理中</p>
              <p class="text-3xl font-bold text-blue-600 mt-1">{{ processingCount }}</p>
            </div>
            <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <Wrench class="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">已完成</p>
              <p class="text-3xl font-bold text-green-600 mt-1">{{ completedCount }}</p>
            </div>
            <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle class="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">工单号</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">申请人</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">设备类型</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">外修原因</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">预估费用</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">送修单位</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">状态</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">申请时间</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrders" :key="order.id" class="border-b hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-primary-600">{{ order.orderNo }}</td>
                <td class="px-4 py-3">{{ order.applicantName }}</td>
                <td class="px-4 py-3">{{ order.deviceType }}</td>
                <td class="px-4 py-3">{{ order.externalReason }}</td>
                <td class="px-4 py-3">¥{{ order.externalCost ? Number(order.externalCost).toFixed(2) : '0.00' }}</td>
                <td class="px-4 py-3">{{ order.externalCompany }}</td>
                <td class="px-4 py-3">
                  <span :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ order.updateTime }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button v-if="order.status === 'external_pending'" @click="approveOrder(order)" class="btn-sm-primary">审批通过</button>
                    <button v-if="order.status === 'external_pending'" @click="rejectOrder(order)" class="btn-sm-outline">驳回</button>
                    <button v-if="order.status === 'completed'" @click="closeOrder(order)" class="btn-sm-primary">结案</button>
                    <button @click="viewOrder(order.id)" class="btn-sm-outline">详情</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredOrders.length === 0" class="text-center py-12 text-gray-500">
          <ClipboardList class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>暂无外修申请</p>
        </div>
      </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Home, LogOut, ClipboardList, Clock, Wrench, CheckCircle } from 'lucide-vue-next'
import { authApi, workOrderApi } from '../api'

const router = useRouter()

const goHome = () => {
  window.location.href = '/'
}

interface WorkOrder {
  id: string
  orderNo: string
  applicantName: string
  deviceType: string
  externalReason: string
  externalCost: number
  externalCompany: string
  status: string
  updateTime: string
}

const orders = ref<WorkOrder[]>([])
const filterStatus = ref('')
const isLoading = ref(false)
const error = ref('')

const filteredOrders = computed(() => {
  let result = orders.value.filter(o => 
    o.status === 'external_pending' || 
    o.status === 'external_processing' || 
    o.status === 'external_rejected' ||
    o.status === 'completed'
  )
  
  if (filterStatus.value) {
    result = result.filter(o => o.status === filterStatus.value)
  }
  
  // 最新的排最前面
  return result.sort((a, b) => Number(b.id) - Number(a.id))
})

const pendingCount = computed(() => orders.value.filter(o => o.status === 'external_pending').length)
const processingCount = computed(() => orders.value.filter(o => o.status === 'external_processing').length)
const completedCount = computed(() => orders.value.filter(o => o.status === 'completed' || o.status === 'external_rejected').length)

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    external_pending: 'status-external-pending',
    external_processing: 'status-external-processing',
    external_rejected: 'status-rejected',
    completed: 'status-completed'
  }
  return classes[status] || 'status-pending'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    external_pending: '待审批',
    external_processing: '处理中',
    external_rejected: '已驳回',
    completed: '已完成'
  }
  return texts[status] || '未知'
}

const loadOrders = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await workOrderApi.list()
    console.log('采购员加载工单响应:', response.data)
    if (response.data.success) {
      orders.value = response.data.data || []
    } else {
      error.value = response.data.message || '加载失败'
      console.error('API 返回错误:', response.data.message)
    }
  } catch (err: any) {
    error.value = err.message || '网络错误'
    console.error('加载工单列表失败:', err)
  } finally {
    isLoading.value = false
  }
}

const approveOrder = async (order: WorkOrder) => {
  if (!confirm(`确认通过工单 ${order.orderNo} 的外修申请？`)) return
  
  try {
    await workOrderApi.startExternal(order.id)
    await loadOrders()
    alert('已审批通过')
  } catch (error) {
    alert('操作失败')
  }
}

const rejectOrder = async (order: WorkOrder) => {
  const reason = prompt('请输入驳回原因：')
  if (!reason) return
  
  try {
    await workOrderApi.rejectExternal(order.id, reason)
    await loadOrders()
    alert('已驳回')
  } catch (error) {
    alert('操作失败')
  }
}

const closeOrder = async (order: WorkOrder) => {
  if (!confirm(`确认结案工单 ${order.orderNo}？`)) return
  
  try {
    await workOrderApi.close(order.id)
    await loadOrders()
    alert('已结案')
  } catch (error: any) {
    alert(error.response?.data?.message || '操作失败')
  }
}

const viewOrder = (id: string) => {
  router.push(`/workorder/${id}`)
}

const handleLogout = () => {
  authApi.logout()
  router.push('/purchaser/login')
}

onMounted(() => {
  let user = {}
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    user = {}
  }
  console.log('采购员页面加载，用户信息:', user)
  if (!user.id || user.role !== 'purchaser') {
    console.log('用户角色不是采购员，重定向到登录页')
    router.push('/purchaser/login')
    return
  }
  loadOrders()
})
</script>
