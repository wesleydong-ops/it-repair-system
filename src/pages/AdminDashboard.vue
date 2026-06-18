<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
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
          <li>
            <a href="/admin" class="flex items-center gap-3 px-4 py-3 bg-darkblue text-white rounded-xl shadow-md">
              <LayoutDashboard class="w-5 h-5" />
              仪表盘
            </a>
          </li>
          <li>
            <a href="/admin/users" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-300">
              <Users class="w-5 h-5" />
              用户管理
            </a>
          </li>
          <li>
            <a href="/admin/groups" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-300">
              <Users class="w-5 h-5" />
              工程师分组
            </a>
          </li>
          <li>
            <a href="/admin/projects" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-300">
              <Settings class="w-5 h-5" />
              维修项目
            </a>
          </li>
          <li>
            <a href="/admin/workorders" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-300">
              <ClipboardList class="w-5 h-5" />
              工单管理
            </a>
          </li>
          <li>
            <a href="/admin/statistics" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-300">
              <BarChart3 class="w-5 h-5" />
              数据统计
            </a>
          </li>
          <li v-if="userRole !== 'operator'">
            <a href="/admin/settings" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-300">
              <Settings class="w-5 h-5" />
              系统设置
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

    <main class="ml-64 p-8">
      <header class="mb-8 fade-in">
        <h1 class="text-2xl sm:text-3xl font-bold text-darkblue">仪表盘</h1>
        <p class="text-gray-500 mt-2">欢迎回来，管理员</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">本月工单</p>
              <p class="text-3xl font-bold text-gradient mt-1">{{ stats.monthlyOrders }}</p>
            </div>
            <div class="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
              <Ticket class="w-7 h-7 text-primary-600" />
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-green-500 text-sm flex items-center">
              <TrendingUp class="w-4 h-4 mr-1" />
              较上月 +12%
            </p>
          </div>
        </div>
        <div class="card card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">结案率</p>
              <p class="text-3xl font-bold text-gradient mt-1">{{ stats.completionRate }}%</p>
            </div>
            <div class="w-14 h-14 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center">
              <CheckCircle class="w-7 h-7 text-secondary-600" />
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-green-500 text-sm flex items-center">
              <TrendingUp class="w-4 h-4 mr-1" />
              目标 95%
            </p>
          </div>
        </div>
        <div class="card card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">平均时长</p>
              <p class="text-3xl font-bold text-orange-500 mt-1">{{ stats.avgDuration }}<span class="text-lg">h</span></p>
            </div>
            <div class="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center">
              <Clock class="w-7 h-7 text-orange-600" />
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-green-500 text-sm flex items-center">
              <TrendingUp class="w-4 h-4 mr-1" />
              优于行业标准
            </p>
          </div>
        </div>
        <div class="card card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">外修工单</p>
              <p class="text-3xl font-bold text-purple-500 mt-1">{{ stats.externalOrders }}</p>
            </div>
            <div class="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
              <ExternalLink class="w-7 h-7 text-purple-600" />
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-gray-500 text-sm flex items-center">
              <FileText class="w-4 h-4 mr-1" />
              占比 5.1%
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-800 flex items-center">
              <ClipboardList class="w-5 h-5 mr-3 text-primary-500" />
              待处理工单
            </h3>
            <a href="#" class="text-primary-600 hover:text-primary-700 text-sm font-medium">查看全部</a>
          </div>
          <div class="space-y-4">
            <div v-for="order in pendingOrders" :key="order.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-lg flex items-center justify-center text-white font-bold">
                  {{ order.orderNo.slice(-3) }}
                </div>
                <div>
                  <p class="font-semibold text-gray-800">{{ order.orderNo }}</p>
                  <p class="text-sm text-gray-500">{{ order.applicantName }} · {{ order.deviceType }}</p>
                </div>
              </div>
              <span class="status-pending">待接单</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <Activity class="w-5 h-5 mr-3 text-primary-500" />
            工单状态分布
          </h3>
          <div class="space-y-5">
            <div>
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 bg-yellow-400 rounded-full"></span>
                  <span class="text-gray-600">待接单</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-gray-800">{{ statusDistribution.pending }}</span>
                  <span class="text-gray-500 text-sm">单</span>
                </div>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div class="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-1000 ease-out" :style="{ width: getStatusPercentage('pending') + '%' }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 bg-orange-400 rounded-full"></span>
                  <span class="text-gray-600">处理中</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-gray-800">{{ statusDistribution.processing }}</span>
                  <span class="text-gray-500 text-sm">单</span>
                </div>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div class="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out" :style="{ width: getStatusPercentage('processing') + '%' }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 bg-green-400 rounded-full"></span>
                  <span class="text-gray-600">已完成</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-gray-800">{{ statusDistribution.completed }}</span>
                  <span class="text-gray-500 text-sm">单</span>
                </div>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div class="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out" :style="{ width: getStatusPercentage('completed') + '%' }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 bg-gray-400 rounded-full"></span>
                  <span class="text-gray-600">已结案</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-gray-800">{{ statusDistribution.closed }}</span>
                  <span class="text-gray-500 text-sm">单</span>
                </div>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div class="bg-gradient-to-r from-gray-400 to-gray-500 h-3 rounded-full transition-all duration-1000 ease-out" :style="{ width: getStatusPercentage('closed') + '%' }"></div>
              </div>
            </div>
            <div class="pt-4 border-t border-gray-100">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">总计</span>
                <span class="font-bold text-gray-800">{{ totalOrders }} 单</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-800 flex items-center">
            <TrendingUp class="w-5 h-5 mr-3 text-primary-500" />
            工程师工作量排行
          </h3>
          <a href="/admin/groups" class="text-primary-600 hover:text-primary-700 text-sm font-medium">管理工程师</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gradient-to-r from-gray-50 to-gray-100">
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700 rounded-tl-xl">排名</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">工程师</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">区域</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">接单量</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">结案率</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700 rounded-tr-xl">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(engineer, index) in engineerRanking" :key="engineer.id" class="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4">
                  <span :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm',
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                  ]">
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {{ engineer.name.charAt(0) }}
                    </div>
                    <span class="font-semibold text-gray-800">{{ engineer.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span :class="engineer.area === 'A' ? 'area-a' : 'area-ck'">
                    {{ engineer.area === 'A' ? 'A区' : 'CK区' }}
                  </span>
                </td>
                <td class="px-6 py-4 font-semibold text-gray-800">{{ engineer.acceptedCount }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-2 rounded-full transition-all duration-500" :class="engineer.completionRate >= 90 ? 'bg-green-500' : engineer.completionRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'" :style="{ width: engineer.completionRate + '%' }"></div>
                    </div>
                    <span class="font-semibold text-gray-800">{{ engineer.completionRate }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <button class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                    <Eye class="w-4 h-4" />
                    详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { LayoutDashboard, Users, Settings, BarChart3, LogOut, Ticket, CheckCircle, Clock, ExternalLink, ClipboardList, Activity, TrendingUp, FileText, Eye, Home } from 'lucide-vue-next'
import { authApi, statisticsApi, workOrderApi } from '../api'

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

const stats = ref({
  monthlyOrders: 0,
  completionRate: 0,
  avgDuration: 0,
  externalOrders: 0
})

const statusDistribution = ref({
  pending: 0,
  processing: 0,
  completed: 0,
  closed: 0
})

const totalOrders = computed(() => {
  return statusDistribution.value.pending + statusDistribution.value.processing + statusDistribution.value.completed + statusDistribution.value.closed
})

const pendingOrders = ref<Array<{ id: string; orderNo: string; applicantName: string; deviceType: string }>>([])

const engineerRanking = ref<Array<{ id: string; name: string; area: string; acceptedCount: number; completionRate: number }>>([])

const getStatusPercentage = (status: string) => {
  if (totalOrders.value === 0) return 0
  return Math.round((statusDistribution.value[status as keyof typeof statusDistribution.value] / totalOrders.value) * 100)
}

const loadStatistics = async () => {
  try {
    const response = await statisticsApi.get()
    const data = response.data.data
    
    stats.value.monthlyOrders = data.totalOrders
    stats.value.completionRate = data.totalOrders > 0 ? Math.round((data.completedOrders / data.totalOrders) * 100) : 0
    stats.value.avgDuration = data.averageDuration || 0
    stats.value.externalOrders = data.totalOrders - data.completedOrders - data.pendingOrders
    
    statusDistribution.value.pending = data.pendingOrders
    statusDistribution.value.completed = data.completedOrders
    
    // 计算工程师排名
    if (data.engineerStats && data.engineerStats.length > 0) {
      engineerRanking.value = data.engineerStats.map((stat: any) => ({
        id: stat.engineerId,
        name: stat.name,
        area: stat.area || 'A',
        acceptedCount: stat.acceptedCount,
        completionRate: stat.acceptedCount > 0 ? Math.round((stat.completedCount / stat.acceptedCount) * 100) : 0
      })).sort((a: any, b: any) => b.acceptedCount - a.acceptedCount).slice(0, 4)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadPendingOrders = async () => {
  try {
    const response = await workOrderApi.list({ status: 'pending', page: 1, size: 3 })
    pendingOrders.value = response.data.data || []
  } catch (error) {
    console.error('加载待处理工单失败:', error)
  }
}

const loadStatusDistribution = async () => {
  try {
    const response = await workOrderApi.list({ page: 1, size: 1000 })
    const orders = response.data.data || []
    
    statusDistribution.value = {
      pending: orders.filter((o: any) => o.status === 'pending').length,
      processing: orders.filter((o: any) => o.status === 'processing' || o.status === 'accepted').length,
      completed: orders.filter((o: any) => o.status === 'completed').length,
      closed: orders.filter((o: any) => o.status === 'closed').length
    }
  } catch (error) {
    console.error('加载状态分布失败:', error)
  }
}

const handleLogout = () => {
  authApi.logout()
  router.push('/admin/login')
}

onMounted(() => {
  loadStatistics()
  loadPendingOrders()
  loadStatusDistribution()
})
</script>
