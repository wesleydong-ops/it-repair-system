<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <header class="mb-8 fade-in">
        <div class="flex items-center justify-between mb-4">
          <button @click="goHome" class="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
            <Home class="w-5 h-5" />
            返回首页
          </button>
          <div></div>
          <div></div>
        </div>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <img src="/logo.png" alt="FoxLink" class="w-24 h-9 object-contain drop-shadow-md" />
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-darkblue">工单查询</h1>
              <p class="text-gray-500">Foxlink IT Support</p>
            </div>
          </div>
          <a href="/repair" class="btn-primary">
            <Plus class="w-5 h-5" />
            提交新工单
          </a>
        </div>
      </header>

      <div class="card fade-in">
        <div class="flex flex-wrap gap-4 mb-6">
          <div class="flex items-center gap-3">
            <span class="text-gray-600 font-medium">状态:</span>
            <select v-model="filters.status" class="form-select w-36">
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
          <div class="flex items-center gap-3">
            <span class="text-gray-600 font-medium">区域:</span>
            <select v-model="filters.area" class="form-select w-28">
              <option value="">全部</option>
              <option value="A">A区</option>
              <option value="CK">CK区</option>
            </select>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-gray-600 font-medium">优先级:</span>
            <select v-model="filters.priority" class="form-select w-28">
              <option value="">全部</option>
              <option value="normal">普通</option>
              <option value="urgent">紧急</option>
            </select>
          </div>
          <div class="flex-1"></div>
          <div class="flex gap-2 w-full sm:w-auto">
            <input
              v-model="filters.search"
              type="text"
              class="form-input w-full sm:w-72"
              placeholder="搜索工单号或申请人..."
            />
            <button class="btn-outline px-4">
              <Search class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gradient-to-r from-gray-50 to-gray-100">
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700 rounded-tl-xl">工单号</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">申请人</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">设备类型</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">区域</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">优先级</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">状态</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">创建时间</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700 rounded-tr-xl">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(order, index) in orders" 
                :key="order.id" 
                class="border-b border-gray-100 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-secondary-50/50 transition-all duration-200 cursor-pointer"
                :style="{ animationDelay: index * 0.05 + 's' }"
              >
                <td class="px-6 py-4 font-mono text-primary-600 font-semibold">{{ order.orderNo }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {{ order.applicantName.charAt(0) }}
                    </div>
                    <span class="text-gray-800">{{ order.applicantName }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-700">{{ order.deviceType }}</td>
                <td class="px-6 py-4">
                  <span :class="order.area === 'A' ? 'area-a' : 'area-ck'">
                    {{ order.area === 'A' ? 'A区' : 'CK区' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span :class="order.priority === 'urgent' ? 'priority-urgent' : 'priority-normal'">
                    {{ order.priority === 'urgent' ? '紧急' : '普通' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span>
                </td>
                <td class="px-6 py-4 text-gray-500">{{ formatDate(order.createTime) }}</td>
                <td class="px-6 py-4">
                  <button @click="viewOrder(order.id)" class="btn-primary btn-sm">
                    <Eye class="w-4 h-4" />
                    查看
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="orders.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList class="w-10 h-10 text-gray-400" />
          </div>
          <p class="text-gray-500">暂无符合条件的工单</p>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-100 gap-4">
          <div class="flex items-center gap-4">
            <p class="text-gray-500 text-sm">共 <span class="font-semibold text-gray-800">{{ total }}</span> 条记录</p>
            <select v-model="pageSize" class="form-select w-24 text-sm">
              <option :value="10">每页10条</option>
              <option :value="20">每页20条</option>
              <option :value="50">每页50条</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              :class="[
                'px-4 py-2 rounded-xl border transition-all duration-300',
                currentPage === 1 
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                  : 'text-gray-600 hover:bg-primary-50 hover:border-primary-300'
              ]"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>
            <div class="flex items-center gap-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'w-9 h-9 rounded-lg font-medium transition-all duration-300',
                  page === currentPage 
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                ]"
              >
                {{ page }}
              </button>
            </div>
            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              :class="[
                'px-4 py-2 rounded-xl border transition-all duration-300',
                currentPage >= totalPages 
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                  : 'text-gray-600 hover:bg-primary-50 hover:border-primary-300'
              ]"
            >
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ClipboardList, Plus, Search, Eye, ChevronLeft, ChevronRight, Home } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  window.location.href = '/'
}

const filters = reactive({
  status: '',
  area: '',
  priority: '',
  search: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(42)
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, 5)
    } else if (current >= total - 2) {
      pages.push(total - 4, total - 3, total - 2, total - 1, total)
    } else {
      pages.push(current - 2, current - 1, current, current + 1, current + 2)
    }
  }
  
  return pages
})

const orders = ref([
  { id: '1', orderNo: 'WO-20240115-001', applicantName: '张三', deviceType: '笔记本电脑', area: 'A', priority: 'normal', status: 'pending', createTime: '2024-01-15 14:30:00' },
  { id: '2', orderNo: 'WO-20240115-002', applicantName: '李四', deviceType: '台式电脑', area: 'CK', priority: 'urgent', status: 'accepted', createTime: '2024-01-15 13:20:00' },
  { id: '3', orderNo: 'WO-20240115-003', applicantName: '王五', deviceType: '打印机', area: 'A', priority: 'normal', status: 'processing', createTime: '2024-01-15 11:45:00' },
  { id: '4', orderNo: 'WO-20240115-004', applicantName: '赵六', deviceType: '显示器', area: 'CK', priority: 'normal', status: 'completed', createTime: '2024-01-15 10:15:00' },
  { id: '5', orderNo: 'WO-20240114-005', applicantName: '孙七', deviceType: '网络设备', area: 'A', priority: 'urgent', status: 'closed', createTime: '2024-01-14 16:30:00' },
  { id: '6', orderNo: 'WO-20240114-006', applicantName: '周八', deviceType: '服务器', area: 'CK', priority: 'normal', status: 'pending', createTime: '2024-01-14 15:00:00' }
])

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

const formatDate = (dateStr: string) => {
  return dateStr.split(' ')[0]
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
}

const viewOrder = (id: string) => {
  router.push(`/workorder/${id}`)
}
</script>
