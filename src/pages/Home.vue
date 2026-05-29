<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
    <header class="glass-effect border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 group cursor-pointer">
            <img src="/logo.png" alt="FoxLink" class="w-28 h-10 object-contain drop-shadow-md" />
            <div>
              <span class="text-xl font-bold text-darkblue">IT报修系统</span>
              <span class="hidden sm:inline block text-xs text-gray-500">Foxlink IT Support</span>
            </div>
          </div>
          <nav class="flex items-center gap-2 sm:gap-6">
            <a href="/" class="text-gray-700 hover:text-primary-600 font-medium transition-colors flex items-center gap-2">
              <Home class="w-4 h-4" />
              <span>首页</span>
            </a>
            <a href="/workorders" class="text-gray-700 hover:text-primary-600 font-medium transition-colors flex items-center gap-2">
              <ClipboardList class="w-4 h-4" />
              <span>工单查询</span>
            </a>
            <a href="/repair" class="btn-primary">
              <Plus class="w-4 h-4" />
              提交报修
            </a>
            <a href="/admin/login" class="btn-outline">
              <User class="w-4 h-4" />
              管理员
            </a>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section class="text-center mb-16 fade-in">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl shadow-xl mb-6 pulse-ring">
          <ShieldCheck class="w-12 h-12 text-white" />
        </div>
        <h1 class="text-4xl sm:text-5xl font-bold text-darkblue mb-4">
          IT设备扫码报修系统
        </h1>
        <p class="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
          企业专属IT设备报修管理平台，扫码即可快速提交工单，高效解决设备故障
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a href="/repair" class="btn-primary text-lg px-8 py-4">
            <FileText class="w-5 h-5" />
            立即报修
          </a>
          <a href="/workorders" class="btn-secondary text-lg px-8 py-4">
            <ClipboardList class="w-5 h-5" />
            工单查询
          </a>
        </div>
      </section>

      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-16">
        <div class="card text-center card-hover">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Ticket class="w-8 h-8 text-primary-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">今日工单</h3>
          <p class="text-4xl font-bold text-gradient">{{ todayOrders }}</p>
          <p class="text-sm text-gray-500 mt-1">较昨日 +12%</p>
        </div>
        <div class="card text-center card-hover">
          <div class="w-16 h-16 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle class="w-8 h-8 text-secondary-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">本月结案率</h3>
          <p class="text-4xl font-bold text-gradient">{{ completionRate }}%</p>
          <p class="text-sm text-gray-500 mt-1">目标 95%</p>
        </div>
        <div class="card text-center card-hover">
          <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock class="w-8 h-8 text-orange-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">平均维修时长</h3>
          <p class="text-4xl font-bold text-orange-500">{{ avgDuration }}<span class="text-lg">小时</span></p>
          <p class="text-sm text-gray-500 mt-1">优于行业标准</p>
        </div>
        <div class="card text-center card-hover">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users class="w-8 h-8 text-purple-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">在线工程师</h3>
          <p class="text-4xl font-bold text-purple-500">{{ onlineEngineers }}</p>
          <p class="text-sm text-gray-500 mt-1">A区 5人 / CK区 3人</p>
        </div>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-800 flex items-center">
              <ClipboardList class="w-6 h-6 mr-3 text-primary-500" />
              最新工单
            </h2>
            <a href="/workorders" class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              查看全部 <ChevronRight class="w-4 h-4" />
            </a>
          </div>
          <div class="space-y-3">
            <div 
              v-for="(order, index) in recentOrders" 
              :key="order.id" 
              class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
              :style="{ animationDelay: index * 0.1 + 's' }"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-lg flex items-center justify-center text-white font-bold">
                  {{ order.orderNo.slice(-3) }}
                </div>
                <div>
                  <p class="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">{{ order.orderNo }}</p>
                  <p class="text-sm text-gray-500">{{ order.applicantName }} · {{ order.deviceType }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span>
                <ChevronRight class="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-800 flex items-center">
              <BarChart3 class="w-6 h-6 mr-3 text-primary-500" />
              区域工单统计
            </h2>
          </div>
          <div class="space-y-6">
            <div>
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 bg-primary-500 rounded-full"></span>
                  <span class="font-medium text-gray-700">A区</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-gray-800">{{ areaStats.A }}</span>
                  <span class="text-gray-500 text-sm">单</span>
                </div>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  class="bg-gradient-to-r from-primary-400 to-primary-600 h-3 rounded-full transition-all duration-1000 ease-out" 
                  :style="{ width: getAreaPercentage('A') + '%' }"
                ></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 bg-secondary-500 rounded-full"></span>
                  <span class="font-medium text-gray-700">CK区</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-gray-800">{{ areaStats.CK }}</span>
                  <span class="text-gray-500 text-sm">单</span>
                </div>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  class="bg-gradient-to-r from-secondary-400 to-secondary-600 h-3 rounded-full transition-all duration-1000 ease-out" 
                  :style="{ width: getAreaPercentage('CK') + '%' }"
                ></div>
              </div>
            </div>
            <div class="pt-4 border-t border-gray-100">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">总计</span>
                <span class="font-bold text-gray-800">{{ areaStats.A + areaStats.CK }} 单</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="card mb-16">
        <h2 class="text-xl font-bold text-gray-800 mb-8 flex items-center">
          <Info class="w-6 h-6 mr-3 text-primary-500" />
          系统使用指南
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="flex gap-5 group">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <QrCode class="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">扫码报修</h3>
              <p class="text-gray-500">使用手机扫描二维码，快速进入报修页面，无需手动输入网址</p>
            </div>
          </div>
          <div class="flex gap-5 group">
            <div class="w-16 h-16 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <FileEdit class="w-8 h-8 text-secondary-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">填写表单</h3>
              <p class="text-gray-500">按要求填写设备信息和故障描述，系统自动校验确保信息完整</p>
            </div>
          </div>
          <div class="flex gap-5 group">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Bell class="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">接收通知</h3>
              <p class="text-gray-500">系统通过您选择的渠道推送工单进度和领机通知，及时掌握状态</p>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl p-8 lg:p-12 text-white mb-16">
        <div class="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h2 class="text-2xl lg:text-3xl font-bold mb-4">需要帮助？联系IT支持团队</h2>
            <p class="text-white/80 mb-6">我们的工程师团队随时为您提供技术支持服务</p>
            <div class="flex flex-wrap gap-4">
              <div class="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <Phone class="w-5 h-5" />
                <span>分机: 1234</span>
              </div>
              <div class="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <Mail class="w-5 h-5" />
                <span>it-support@company.com</span>
              </div>
              <div class="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <MessageCircle class="w-5 h-5" />
                <span>Webex: ITSupport</span>
              </div>
            </div>
          </div>
          <div class="flex-shrink-0">
            <div class="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <QrCode class="w-24 h-24 text-gray-700" />
            </div>
            <p class="text-center text-white/80 text-sm mt-3">扫码快速报修</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="bg-white border-t border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Wrench class="w-6 h-6 text-white" />
            </div>
            <div>
              <span class="font-bold text-gray-800">IT设备扫码报修系统</span>
              <p class="text-xs text-gray-500">Enterprise IT Support System</p>
            </div>
          </div>
          <div class="flex items-center gap-6 text-sm text-gray-500">
            <span>© 2024 企业专属IT设备报修管理平台</span>
            <a href="#" class="hover:text-primary-600 transition-colors">使用条款</a>
            <a href="#" class="hover:text-primary-600 transition-colors">隐私政策</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Wrench, Plus, FileText, ClipboardList, Ticket, CheckCircle, Clock, Users, 
  BarChart3, Info, QrCode, FileEdit, Bell, Home, User, ChevronRight, ShieldCheck,
  Phone, Mail, MessageCircle
} from 'lucide-vue-next'

const todayOrders = ref(12)
const completionRate = ref(94)
const avgDuration = ref(2.5)
const onlineEngineers = ref(8)

const areaStats = ref({
  A: 45,
  CK: 38
})

const recentOrders = ref([
  { id: '1', orderNo: 'WO-20240115-001', applicantName: '张三', deviceType: '笔记本电脑', status: 'pending' },
  { id: '2', orderNo: 'WO-20240115-002', applicantName: '李四', deviceType: '台式电脑', status: 'accepted' },
  { id: '3', orderNo: 'WO-20240115-003', applicantName: '王五', deviceType: '打印机', status: 'processing' },
  { id: '4', orderNo: 'WO-20240115-004', applicantName: '赵六', deviceType: '显示器', status: 'completed' }
])

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'status-pending',
    accepted: 'status-accepted',
    processing: 'status-processing',
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
    completed: '已完成',
    closed: '已结案'
  }
  return texts[status] || '未知'
}

const getAreaPercentage = (area: string) => {
  const total = areaStats.value.A + areaStats.value.CK
  return Math.round((areaStats.value[area as keyof typeof areaStats.value] / total) * 100)
}
</script>
