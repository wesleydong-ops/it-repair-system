<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 py-8">
    <div class="max-w-5xl mx-auto px-4">
      <header class="mb-8 fade-in">
        <div class="flex items-center justify-between mb-4">
          <button @click="goHome" class="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
            <Home class="w-5 h-5" />
            返回首页
          </button>
          <div></div>
          <div></div>
        </div>
        <button @click="goBack" class="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-6">
          <ArrowLeft class="w-5 h-5" />
          返回工单列表
        </button>
        <div class="flex items-center gap-4">
          <img src="/logo.png" alt="FoxLink" class="w-24 h-9 object-contain drop-shadow-md" />
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-darkblue">工单详情</h1>
            <p class="text-gray-500">Foxlink IT Support</p>
          </div>
        </div>
      </header>

      <div class="card fade-in mb-6">
        <div class="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <span :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span>
          <span :class="order.priority === 'urgent' ? 'priority-urgent' : 'priority-normal'">
            {{ order.priority === 'urgent' ? '紧急' : '普通' }}
          </span>
          <span :class="order.area === 'A' ? 'area-a' : 'area-ck'">
            {{ order.area === 'A' ? 'A区' : 'CK区' }}
          </span>
          <span class="text-gray-500 text-sm">创建时间: {{ order.createTime }}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-gray-50 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <User class="w-5 h-5 mr-3 text-primary-500" />
              申请人信息
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-500">姓名</span>
                <span class="text-gray-800 font-medium">{{ order.applicantName }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-500">部门</span>
                <span class="text-gray-800">{{ order.department }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-500">工位</span>
                <span class="text-gray-800">{{ order.location }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-500">分机</span>
                <span class="text-gray-800">{{ order.extension }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-500">邮箱</span>
                <span class="text-gray-800">{{ order.email }}</span>
              </div>
              <div class="flex justify-between items-center py-3">
                <span class="text-gray-500">Webex</span>
                <span class="text-gray-800">{{ order.webexId }}</span>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <Monitor class="w-5 h-5 mr-3 text-primary-500" />
              设备信息
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-500">资产编号</span>
                <span class="text-gray-800 font-mono">{{ order.assetNo }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-500">设备类型</span>
                <span class="text-gray-800">{{ order.deviceType }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-500">设备位置</span>
                <span class="text-gray-800">{{ order.deviceLocation }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-500">维修项目</span>
                <span class="text-gray-800">{{ order.projectName }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-500">维修类型</span>
                <span class="text-gray-800">{{ order.repairType === 'internal' ? '内部机房维修' : '现场远程维修' }}</span>
              </div>
              <div class="flex justify-between items-center py-3">
                <span class="text-gray-500">通知方式</span>
                <span class="text-gray-800">{{ getNotificationText(order.notificationChannels) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText class="w-5 h-5 mr-3 text-primary-500" />
            故障描述
          </h3>
          <div class="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6">
            <p class="text-gray-700 leading-relaxed">{{ order.description }}</p>
          </div>
        </div>

        <div v-if="order.engineerId" class="mt-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Wrench class="w-5 h-5 mr-3 text-primary-500" />
            负责工程师
          </h3>
          <div class="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
            <div class="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
              <User class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="font-semibold text-gray-800 text-lg">{{ order.engineerName }}</p>
              <p class="text-gray-500">{{ order.area === 'A' ? 'A区维修组' : 'CK区维修组' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card fade-in mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <History class="w-5 h-5 mr-3 text-primary-500" />
          状态变更记录
        </h3>
        <div class="space-y-6">
          <div v-for="(log, index) in statusLogs" :key="index" class="flex gap-4">
            <div class="flex flex-col items-center">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-all duration-300',
                index === 0 ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white' : 'bg-gray-100 text-gray-600'
              ]">
                {{ index + 1 }}
              </div>
              <div v-if="index < statusLogs.length - 1" class="w-0.5 h-10 bg-gray-200"></div>
            </div>
            <div class="flex-1 pb-2">
              <div class="flex items-center gap-3 mb-2">
                <span class="font-semibold text-gray-800">{{ log.status }}</span>
                <span class="text-gray-400 text-sm">{{ log.time }}</span>
              </div>
              <p class="text-gray-500">{{ log.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showActionButtons" class="card fade-in">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">操作</h3>
        <div class="flex flex-wrap gap-4">
          <button v-if="order.status === 'pending'" @click="handleAccept" class="btn-primary">
            <CheckCircle class="w-4 h-4" />
            接单
          </button>
          <button v-if="order.status === 'accepted'" @click="handleStartProcess" class="btn-primary">
            <Play class="w-4 h-4" />
            开始处理
          </button>
          <button v-if="order.status === 'processing'" @click="showCompleteModal = true" class="btn-secondary">
            <CheckCircle class="w-4 h-4" />
            完成维修
          </button>
          <button v-if="order.status === 'completed'" @click="handleClose" class="btn-primary">
            <Archive class="w-4 h-4" />
            结案
          </button>
          <button v-if="order.status === 'processing'" @click="showExternalModal = true" class="btn-outline">
            <ExternalLink class="w-4 h-4" />
            外修申请
          </button>
        </div>
      </div>

      <div v-if="showCompleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="card max-w-lg w-full scale-in">
          <h3 class="text-xl font-bold text-gray-800 mb-6">完成维修</h3>
          <div class="space-y-5">
            <div>
              <label class="form-label">维修记录</label>
              <textarea v-model="completeForm.repairRecord" class="form-textarea" rows="4" placeholder="请描述维修过程..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">故障原因</label>
                <input v-model="completeForm.faultReason" type="text" class="form-input" placeholder="故障原因" />
              </div>
              <div>
                <label class="form-label">处理方案</label>
                <input v-model="completeForm.solution" type="text" class="form-input" placeholder="处理方案" />
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button @click="showCompleteModal = false" class="btn-outline">取消</button>
            <button @click="handleComplete" class="btn-primary">确认完成</button>
          </div>
        </div>
      </div>

      <div v-if="showExternalModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="card max-w-lg w-full scale-in">
          <h3 class="text-xl font-bold text-gray-800 mb-6">外修申请</h3>
          <div class="space-y-5">
            <div>
              <label class="form-label">外修原因</label>
              <textarea v-model="externalForm.reason" class="form-textarea" rows="3" placeholder="请说明外修原因..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">所需配件</label>
                <input v-model="externalForm.parts" type="text" class="form-input" placeholder="所需配件" />
              </div>
              <div>
                <label class="form-label">预估费用</label>
                <input v-model.number="externalForm.estimatedCost" type="number" class="form-input" placeholder="预估费用" />
              </div>
            </div>
            <div>
              <label class="form-label">送修单位</label>
              <input v-model="externalForm.repairCompany" type="text" class="form-input" placeholder="送修单位" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button @click="showExternalModal = false" class="btn-outline">取消</button>
            <button @click="handleExternalRepair" class="btn-primary">提交申请</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, User, Monitor, FileText, Wrench, History, CheckCircle, Play, Archive, ExternalLink, Home } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const order = ref({
  id: '',
  orderNo: '',
  applicantName: '',
  department: '',
  location: '',
  extension: '',
  email: '',
  webexId: '',
  assetNo: '',
  deviceType: '',
  deviceLocation: '',
  projectId: '',
  projectName: '',
  description: '',
  repairType: 'internal' as 'internal' | 'remote',
  notificationChannels: [] as ('extension' | 'email' | 'webex')[],
  priority: 'normal' as 'normal' | 'urgent',
  status: 'pending' as 'pending' | 'accepted' | 'processing' | 'completed' | 'closed',
  area: 'A',
  engineerId: '',
  engineerName: '',
  statusLog: '',
  createTime: '',
  updateTime: ''
})

const statusLogs = ref([
  { status: '工单创建', time: '2024-01-15 14:30:00', description: '系统已创建工单，等待工程师接单' },
  { status: '自动派单', time: '2024-01-15 14:30:05', description: '系统根据设备位置自动分配至A区维修组' }
])

const showActionButtons = ref(true)
const showCompleteModal = ref(false)
const showExternalModal = ref(false)

const completeForm = reactive({
  repairRecord: '',
  faultReason: '',
  solution: ''
})

const externalForm = reactive({
  reason: '',
  parts: '',
  estimatedCost: 0,
  repairCompany: ''
})

onMounted(() => {
  order.value = {
    id: route.params.id as string,
    orderNo: 'WO-20240115-001',
    applicantName: '张三',
    department: '研发部',
    location: 'A栋3楼301室',
    extension: '8001',
    email: 'zhangsan@company.com',
    webexId: 'zhangsan',
    assetNo: 'IT-2024-001',
    deviceType: '笔记本电脑',
    deviceLocation: 'A区-2楼',
    projectId: '1',
    projectName: '系统故障',
    description: '电脑无法开机，按下电源键后屏幕无反应，电源指示灯闪烁。尝试过更换电源适配器，问题依然存在。',
    repairType: 'internal',
    notificationChannels: ['email', 'webex'],
    priority: 'urgent',
    status: 'pending',
    area: 'A',
    engineerId: '',
    engineerName: '',
    statusLog: '',
    createTime: '2024-01-15 14:30:00',
    updateTime: '2024-01-15 14:30:00'
  }
})

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

const getNotificationText = (channels: ('extension' | 'email' | 'webex')[]) => {
  const textMap: Record<string, string> = {
    extension: '分机呼叫',
    email: '邮件',
    webex: 'Webex'
  }
  return channels.map(c => textMap[c]).join(', ')
}

const goBack = () => {
  router.push('/workorders')
}

const goHome = () => {
  window.location.href = '/'
}

const handleAccept = () => {
  alert('接单成功')
}

const handleStartProcess = () => {
  alert('开始处理')
}

const handleComplete = () => {
  alert('完成维修')
  showCompleteModal.value = false
}

const handleClose = () => {
  alert('结案成功')
}

const handleExternalRepair = () => {
  alert('外修申请已提交')
  showExternalModal.value = false
}
</script>
