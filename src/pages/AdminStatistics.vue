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
          <div class="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Wrench class="w-6 h-6 text-white" />
          </div>
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
            <a href="/admin/statistics" class="flex items-center gap-3 px-4 py-3 bg-darkblue text-white rounded-xl shadow-md">
              <BarChart3 class="w-5 h-5" />
              数据统计
            </a>
          </li>
          <li>
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
            <h1 class="text-2xl font-bold text-gray-800">数据统计</h1>
            <p class="text-gray-600 mt-2">查看系统数据统计报表</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <label class="text-gray-600 font-medium">时间范围:</label>
              <select v-model="timeRange" class="form-select w-32">
                <option value="today">今日</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
                <option value="custom">自定义</option>
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
          <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <BarChart3 class="w-16 h-16 text-gray-300 mx-auto mb-2" />
              <p class="text-gray-400">图表展示区域</p>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <PieChartIcon class="w-5 h-5 mr-2 text-primary" />
            故障类型分布
          </h3>
          <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <PieChartIcon class="w-16 h-16 text-gray-300 mx-auto mb-2" />
              <p class="text-gray-400">图表展示区域</p>
            </div>
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
                <span class="text-gray-600">最短维修时长</span>
                <span class="font-bold text-gray-800">0.5 小时</span>
              </div>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">最长维修时长</span>
                <span class="font-bold text-gray-800">24 小时</span>
              </div>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">超时工单数量</span>
                <span class="font-bold text-orange-600">3 单</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Wrench, LayoutDashboard, Users, Settings, BarChart3, LogOut, Download, Ticket, CheckCircle, Clock, ExternalLink, PieChart as PieChartIcon, MapPin, Home } from 'lucide-vue-next'
import { authApi } from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  window.location.href = '/'
}

const timeRange = ref('month')

const statistics = ref({
  totalOrders: 156,
  completedOrders: 144,
  pendingOrders: 12,
  averageDuration: 2.3,
  externalOrders: 8
})

const engineerStats = ref([
  { engineerId: '1', name: '陈工', area: 'A', acceptedCount: 28, completedCount: 27, completionRate: 96, avgDuration: 1.8, urgentCount: 5 },
  { engineerId: '2', name: '李工', area: 'CK', acceptedCount: 25, completedCount: 23, completionRate: 92, avgDuration: 2.1, urgentCount: 3 },
  { engineerId: '3', name: '王工', area: 'A', acceptedCount: 23, completedCount: 21, completionRate: 91, avgDuration: 2.5, urgentCount: 4 },
  { engineerId: '4', name: '赵工', area: 'CK', acceptedCount: 21, completedCount: 19, completionRate: 90, avgDuration: 2.8, urgentCount: 2 }
])

const areaStats = ref([
  { area: 'A', orderCount: 89, completionRate: 93 },
  { area: 'CK', orderCount: 67, completionRate: 89 }
])

const exportData = () => {
  alert('导出功能开发中')
}

const handleLogout = () => {
  authApi.logout()
  router.push('/admin/login')
}
</script>
