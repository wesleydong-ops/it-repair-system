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
                <span class="text-gray-800">{{ order.department || '-' }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-500">内线分机</span>
                <span class="text-gray-800">{{ order.extension }}</span>
              </div>
              <div class="flex justify-between items-center py-3">
                <span class="text-gray-500">Email & Webex</span>
                <span class="text-gray-800">{{ order.email || '-' }}</span>
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
                <span class="text-gray-500">维修项目</span>
                <span class="text-gray-800">{{ order.projectName }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-500">区域</span>
                <span class="text-gray-800">{{ order.area === 'A' ? 'A区' : 'CK区' }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-gray-500">维修类型</span>
                <span class="text-gray-800">{{ order.repairType === 'internal' ? '资讯内部维修' : '资讯委外维修' }}</span>
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
          <button v-if="order.status === 'external_pending'" @click="handleStartExternal" class="btn-primary">
            <Play class="w-4 h-4" />
            开始外修
          </button>
          <button v-if="order.status === 'external_processing'" @click="showExternalCompleteModal = true" class="btn-secondary">
            <CheckCircle class="w-4 h-4" />
            完成外修
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

      <div v-if="showExternalCompleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="card max-w-lg w-full scale-in">
          <h3 class="text-xl font-bold text-gray-800 mb-6">完成外修</h3>
          <div class="space-y-5">
            <div>
              <label class="form-label">维修记录</label>
              <textarea v-model="externalCompleteForm.repairRecord" class="form-textarea" rows="4" placeholder="请描述维修过程..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">故障原因</label>
                <input v-model="externalCompleteForm.faultReason" type="text" class="form-input" placeholder="故障原因" />
              </div>
              <div>
                <label class="form-label">处理方案</label>
                <input v-model="externalCompleteForm.solution" type="text" class="form-input" placeholder="处理方案" />
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button @click="showExternalCompleteModal = false" class="btn-outline">取消</button>
            <button @click="handleExternalComplete" class="btn-primary">确认完成</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, User, Monitor, FileText, Wrench, History, CheckCircle, Play, Archive, ExternalLink, Home } from 'lucide-vue-next'
import { workOrderApi } from '../api'
import { getStatusClass, getStatusText } from '../utils/status'

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
  status: 'pending' as 'pending' | 'accepted' | 'processing' | 'external_pending' | 'external_processing' | 'completed' | 'closed',
  area: 'A',
  engineerId: '',
  engineerName: '',
  statusLog: '',
  createTime: '',
  updateTime: '',
  externalReason: '',
  externalParts: '',
  externalCost: 0,
  externalCompany: '',
  repairRecord: '',
  faultReason: '',
  solution: ''
})

const statusLogs = ref([
  { status: '工单创建', time: '2024-01-15 14:30:00', description: '系统已创建工单，等待工程师接单' },
  { status: '自动派单', time: '2024-01-15 14:30:05', description: '系统根据设备位置自动分配至A区维修组' }
])

// 只有工程师和管理员才能看到操作按钮
const showActionButtons = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.role === 'engineer' || user.role === 'admin'
  } catch {
    return false
  }
})
const showCompleteModal = ref(false)
const showExternalModal = ref(false)
const showExternalCompleteModal = ref(false)
const isLoading = ref(false)

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

const externalCompleteForm = reactive({
  repairRecord: '',
  faultReason: '',
  solution: ''
})

const fetchOrder = async () => {
  try {
    const response = await workOrderApi.detail(order.value.id)
    order.value = { ...response.data.data }
  } catch (error) {
    console.error('获取工单详情失败:', error)
  }
}

onMounted(() => {
  order.value.id = route.params.id as string
  fetchOrder()
})

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

const handleAccept = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await workOrderApi.accept(order.value.id)
    order.value.status = 'accepted'
    alert('接单成功')
  } catch (error) {
    console.error('接单失败:', error)
    alert('接单失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const handleStartProcess = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await workOrderApi.startProcess(order.value.id)
    order.value.status = 'processing'
    alert('开始处理')
  } catch (error) {
    console.error('开始处理失败:', error)
    alert('开始处理失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const handleComplete = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await workOrderApi.complete(order.value.id, {
      repairRecord: completeForm.repairRecord,
      faultReason: completeForm.faultReason,
      solution: completeForm.solution
    })
    order.value.status = 'completed'
    order.value.repairRecord = completeForm.repairRecord
    order.value.faultReason = completeForm.faultReason
    order.value.solution = completeForm.solution
    alert('完成维修')
    showCompleteModal.value = false
  } catch (error) {
    console.error('完成维修失败:', error)
    alert('完成维修失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const handleClose = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await workOrderApi.close(order.value.id)
    order.value.status = 'closed'
    alert('结案成功')
  } catch (error) {
    console.error('结案失败:', error)
    alert('结案失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const handleExternalRepair = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await workOrderApi.createExternalRepair(order.value.id, {
      reason: externalForm.reason,
      parts: externalForm.parts,
      estimatedCost: externalForm.estimatedCost,
      repairCompany: externalForm.repairCompany
    })
    order.value.status = 'external_pending'
    order.value.externalReason = externalForm.reason
    order.value.externalParts = externalForm.parts
    order.value.externalCost = externalForm.estimatedCost
    order.value.externalCompany = externalForm.repairCompany
    alert('外修申请已提交，请等待采购处理')
    showExternalModal.value = false
  } catch (error) {
    console.error('外修申请失败:', error)
    alert('外修申请失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const handleStartExternal = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await workOrderApi.startExternal(order.value.id)
    await fetchOrder()
    alert('已开始外修')
  } catch (error) {
    console.error('开始外修失败:', error)
    alert('操作失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const handleExternalComplete = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await workOrderApi.completeExternalRepair(order.value.id, externalCompleteForm)
    await fetchOrder()
    showExternalCompleteModal.value = false
    alert('外修已完成')
  } catch (error) {
    console.error('外修完成失败:', error)
    alert('提交失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}
</script>
