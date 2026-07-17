<template>
  <div class="min-h-screen bg-gray-100">
    <AdminSidebar activePath="/admin/statistics" />

    <main class="ml-64 p-8">
      <header class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">数据统计</h1>
            <p class="text-gray-600 mt-2">查看系统数据统计报表</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <label class="text-gray-600 font-medium">统计月份:</label>
              <select v-model="selectedMonth" @change="loadStatistics" class="form-select w-40">
                <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>
            </div>
            <button @click="exportData" class="btn-primary">
              <Download class="w-4 h-4 inline mr-1" />
              导出Excel
            </button>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">总工单数</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">{{ statistics.totalOrders }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Ticket class="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">结案率</p>
              <p class="text-3xl font-bold text-green-600 mt-1">{{ statistics.completionRate }}%</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle class="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">平均时长</p>
              <p class="text-3xl font-bold text-orange-600 mt-1">{{ statistics.averageDuration }}h</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock class="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">外修工单</p>
              <p class="text-3xl font-bold text-purple-600 mt-1">{{ statistics.externalOrders }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ExternalLink class="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 class="w-5 h-5 mr-2 text-primary" />
            工单趋势
          </h3>
          <div class="h-64">
            <canvas ref="trendChartRef"></canvas>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <PieChartIcon class="w-5 h-5 mr-2 text-primary" />
            故障类型分布
          </h3>
          <div class="h-64">
            <canvas ref="faultChartRef"></canvas>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users class="w-5 h-5 mr-2 text-primary" />
          工程师绩效统计
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">工程师</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">区域</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">接单量</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">办结量</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">结案率</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">平均时长</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">紧急工单</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="engineer in engineerStats" :key="engineer.engineerId" class="border-b">
                <td class="px-4 py-3 font-medium text-gray-800">{{ engineer.name }}</td>
                <td class="px-4 py-3">
                  <span :class="engineer.area === 'A' ? 'area-a' : 'area-ck'">
                    {{ engineer.area === 'A' ? 'A区' : 'CK区' }}
                  </span>
                </td>
                <td class="px-4 py-3">{{ engineer.acceptedCount }}</td>
                <td class="px-4 py-3">{{ engineer.completedCount }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-20 bg-gray-200 rounded-full h-2">
                      <div class="bg-green-500 h-2 rounded-full" :style="{ width: engineer.completionRate + '%' }"></div>
                    </div>
                    <span class="text-sm">{{ engineer.completionRate }}%</span>
                  </div>
                </td>
                <td class="px-4 py-3">{{ engineer.avgDuration }}h</td>
                <td class="px-4 py-3">{{ engineer.urgentCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin class="w-5 h-5 mr-2 text-primary" />
            区域统计
          </h3>
          <div class="space-y-4">
            <div v-for="area in areaStats" :key="area.area" class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-gray-800">{{ area.area === 'A' ? 'A区' : 'CK区' }}</span>
                <span class="text-gray-500">{{ area.orderCount }} 单</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div :class="area.area === 'A' ? 'bg-blue-500' : 'bg-green-500'" class="h-3 rounded-full" :style="{ width: area.completionRate + '%' }"></div>
                </div>
                <span class="text-sm text-gray-600 w-12 text-right">{{ area.completionRate }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock class="w-5 h-5 mr-2 text-primary" />
            维修时长统计
          </h3>
          <div class="space-y-4">
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">平均维修时长</span>
                <span class="font-bold text-gray-800">{{ statistics.averageDuration }} 小时</span>
              </div>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">总工单数</span>
                <span class="font-bold text-gray-800">{{ statistics.totalOrders }} 单</span>
              </div>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">已完成工单</span>
                <span class="font-bold text-green-600">{{ statistics.completedOrders }} 单</span>
              </div>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">待处理工单</span>
                <span class="font-bold text-orange-600">{{ statistics.pendingOrders }} 单</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { Wrench, LayoutDashboard, Users, Settings, BarChart3, LogOut, Download, Ticket, CheckCircle, Clock, ExternalLink, PieChart as PieChartIcon, MapPin, ClipboardList, Home } from 'lucide-vue-next'
import { authApi } from '../api'
import { useRouter } from 'vue-router'

Chart.register(...registerables)

const router = useRouter()

// 获取当前用户角色
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

const selectedMonth = ref('')
const monthOptions = ref<Array<{ value: string; label: string }>>([])
const isLoading = ref(false)

// 生成月份选项（最近12个月 + 全部）
const generateMonthOptions = () => {
  const options = [{ value: 'all', label: '全部' }]
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = `${date.getFullYear()}年${date.getMonth() + 1}月`
    options.push({ value, label })
  }
  // 默认选中当月
  selectedMonth.value = options[1]?.value || 'all'
  return options
}

const trendChartRef = ref<HTMLCanvasElement | null>(null)
const faultChartRef = ref<HTMLCanvasElement | null>(null)
let trendChart: Chart | null = null
let faultChart: Chart | null = null

const statistics = ref({
  totalOrders: 0,
  completedOrders: 0,
  pendingOrders: 0,
  averageDuration: 0,
  externalOrders: 0,
  completionRate: 0
})

const engineerStats = ref<Array<{
  engineerId: string
  name: string
  area: string
  acceptedCount: number
  completedCount: number
  completionRate: number
  avgDuration: number
  urgentCount: number
}>>([])

const areaStats = ref<Array<{
  area: string
  orderCount: number
  completionRate: number
}>>([])

// 故障类型数据（从工单数据中统计）
const faultTypeData = ref<Array<{ name: string; count: number }>>([])

// 工单趋势数据（按日期统计）
const trendData = ref<Array<{ date: string; count: number }>>([])

// 加载统计数据
const loadStatistics = async () => {
  isLoading.value = true
  try {
    const monthParam = selectedMonth.value === 'all' ? 'all' : selectedMonth.value
    const response = await fetch(`/api/admin/statistics?month=${monthParam}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const result = await response.json()
    if (result.success) {
      statistics.value = {
        totalOrders: result.data.totalOrders || 0,
        completedOrders: result.data.completedOrders || 0,
        pendingOrders: result.data.pendingOrders || 0,
        averageDuration: result.data.averageDuration || 0,
        externalOrders: result.data.externalOrders || 0,
        completionRate: result.data.completionRate || 0
      }
      engineerStats.value = result.data.engineerStats || []
      areaStats.value = result.data.areaStats || []
      trendData.value = result.data.trendData || []
      faultTypeData.value = result.data.faultTypeData || []
      
      // 渲染图表
      renderTrendChart()
      renderFaultChart()
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 渲染工单趋势图
const renderTrendChart = () => {
  if (!trendChartRef.value) return
  
  if (trendChart) {
    trendChart.destroy()
  }
  
  const ctx = trendChartRef.value.getContext('2d')
  if (!ctx) return
  
  const labels = trendData.value.map(item => item.date)
  const data = trendData.value.map(item => item.count)
  
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '工单数量',
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
}

// 渲染故障类型分布图
const renderFaultChart = () => {
  if (!faultChartRef.value) return
  
  if (faultChart) {
    faultChart.destroy()
  }
  
  const ctx = faultChartRef.value.getContext('2d')
  if (!ctx) return
  
  const labels = faultTypeData.value.map(item => item.name)
  const data = faultTypeData.value.map(item => item.count)
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
  ]
  
  faultChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, data.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 15,
            font: {
              size: 12
            }
          }
        }
      }
    }
  })
}

const exportData = () => {
  alert('导出功能开发中')
}

const handleLogout = () => {
  authApi.logout()
  router.push('/admin/login')
}

onMounted(() => {
  monthOptions.value = generateMonthOptions()
  loadStatistics()
})

onUnmounted(() => {
  if (trendChart) trendChart.destroy()
  if (faultChart) faultChart.destroy()
})
</script>
