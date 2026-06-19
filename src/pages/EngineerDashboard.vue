<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <img src="/logo.png" alt="FoxLink" class="w-28 h-10 object-contain" />
            <div>
              <span class="text-xl font-bold text-darkblue">工程师工作台</span>
            </div>
          </div>
          <nav class="flex items-center gap-4">
            <span class="text-gray-600 flex items-center gap-2">
              <User class="w-5 h-5" />
              {{ user.name }} · {{ user.area }}区
            </span>
            <button @click="handleLogout" class="text-gray-500 hover:text-red-500 transition-colors">
              <LogOut class="w-5 h-5" />
            </button>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">待接单</p>
              <p class="text-3xl font-bold text-primary-600 mt-1">{{ pendingCount }}</p>
            </div>
            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
              <ClipboardList class="w-7 h-7 text-primary-600" />
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">处理中</p>
              <p class="text-3xl font-bold text-secondary-600 mt-1">{{ processingCount }}</p>
            </div>
            <div class="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center">
              <Wrench class="w-7 h-7 text-secondary-600" />
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">本月完成</p>
              <p class="text-3xl font-bold text-green-600 mt-1">{{ completedCount }}</p>
            </div>
            <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle class="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle class="w-5 h-5 text-orange-500" />
            可抢单工单
            <span class="text-sm font-normal text-gray-400">（未分配工单，可主动抢单增加业绩）</span>
          </h2>
          <span class="text-sm text-gray-500">双击抢单</span>
        </div>
        <div v-if="pendingOrders.length === 0" class="text-center py-12 text-gray-500">
          <ClipboardList class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>暂无待接单工单</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">工单号</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">设备类型</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">区域</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">申请人</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">优先级</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">创建时间</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="order in pendingOrders" 
                :key="order.id" 
                class="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                @dblclick="handleAcceptOrder(order)"
              >
                <td class="py-3 px-4">
                  <span class="font-medium text-primary-600">{{ order.orderNo }}</span>
                </td>
                <td class="py-3 px-4">{{ order.deviceType }}</td>
                <td class="py-3 px-4">
                  <span :class="order.area === 'A' ? 'area-A' : 'area-CK'">{{ order.area }}区</span>
                </td>
                <td class="py-3 px-4">{{ order.applicantName }}</td>
                <td class="py-3 px-4">
                  <span :class="getPriorityClass(order.priority)">{{ getPriorityText(order.priority) }}</span>
                </td>
                <td class="py-3 px-4 text-sm text-gray-500">{{ order.createTime }}</td>
                <td class="py-3 px-4">
                  <button @click.stop="handleAcceptOrder(order)" class="btn-sm-primary">抢单</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock class="w-5 h-5 text-blue-500" />
            我的工单
          </h2>
        </div>
        <div v-if="myOrders.length === 0" class="text-center py-12 text-gray-500">
          <Wrench class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>暂无处理中的工单</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">工单号</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">设备类型</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">申请人</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">更新时间</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="order in myOrders" 
                :key="order.id" 
                class="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                @click="viewOrderDetail(order.id)"
              >
                <td class="py-3 px-4">
                  <span class="font-medium text-primary-600">{{ order.orderNo }}</span>
                </td>
                <td class="py-3 px-4">{{ order.deviceType }}</td>
                <td class="py-3 px-4">
                  <span :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span>
                </td>
                <td class="py-3 px-4">{{ order.applicantName }}</td>
                <td class="py-3 px-4 text-sm text-gray-500">{{ order.updateTime }}</td>
                <td class="py-3 px-4">
                  <div class="flex gap-2">
                    <button v-if="order.status === 'accepted'" @click.stop="handleStartProcess(order)" class="btn-sm-primary">开始处理</button>
                    <button v-if="order.status === 'processing'" @click.stop="showCompleteModal(order)" class="btn-sm-primary">完成维修</button>
                    <button v-if="order.status === 'processing'" @click.stop="showExternalModal(order)" class="btn-sm-outline">外修申请</button>
                    <button v-if="order.status === 'external_pending'" @click.stop="handleStartExternal(order)" class="btn-sm-primary">开始外修</button>
                    <button v-if="order.status === 'external_processing'" @click.stop="showExternalCompleteModal(order)" class="btn-sm-primary">完成外修</button>
                    <button @click.stop="viewOrderDetail(order.id)" class="btn-sm-outline">详情</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 完成维修模态框 -->
      <div v-if="completeModalVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold mb-4">完成维修</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">维修记录</label>
              <textarea v-model="completeForm.repairRecord" class="form-textarea" rows="3" placeholder="请输入维修记录"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">故障原因</label>
              <input v-model="completeForm.faultReason" type="text" class="form-input" placeholder="请输入故障原因" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">解决方案</label>
              <input v-model="completeForm.solution" type="text" class="form-input" placeholder="请输入解决方案" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="completeModalVisible = false" class="btn-sm-outline">取消</button>
            <button @click="handleComplete" class="btn-sm-primary">确认完成</button>
          </div>
        </div>
      </div>

      <!-- 外修申请模态框 -->
      <div v-if="externalModalVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold mb-4">外修申请</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">外修原因</label>
              <textarea v-model="externalForm.reason" class="form-textarea" rows="3" placeholder="请输入外修原因"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="externalModalVisible = false" class="btn-sm-outline">取消</button>
            <button @click="handleExternal" class="btn-sm-primary">提交申请</button>
          </div>
        </div>
      </div>

      <!-- 外修完成模态框 -->
      <div v-if="externalCompleteModalVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md">
          <h3 class="text-lg font-semibold mb-4">外修完成</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">维修记录</label>
              <textarea v-model="externalCompleteForm.repairRecord" class="form-textarea" rows="3" placeholder="请输入维修记录"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">故障原因</label>
              <input v-model="externalCompleteForm.faultReason" type="text" class="form-input" placeholder="请输入故障原因" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">解决方案</label>
              <input v-model="externalCompleteForm.solution" type="text" class="form-input" placeholder="请输入解决方案" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">实际费用</label>
              <input v-model="externalCompleteForm.actualCost" type="number" class="form-input" placeholder="请输入实际费用" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="externalCompleteModalVisible = false" class="btn-sm-outline">取消</button>
            <button @click="handleExternalComplete" class="btn-sm-primary">确认完成</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { 
  User, LogOut, ClipboardList, Wrench, CheckCircle, AlertCircle, Clock 
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { workOrderApi, authApi } from '../api'
import { getStatusClass, getStatusText } from '../utils/status'

const router = useRouter()

interface WorkOrder {
  id: string
  orderNo: string
  deviceType: string
  area: string
  applicantName: string
  priority: string
  status: string
  engineerId: string
  createTime: string
  updateTime: string
}

let initialUser = {}
try {
  initialUser = JSON.parse(localStorage.getItem('user') || '{}')
} catch {
  initialUser = {}
}
const user = ref(initialUser)
const orders = ref<WorkOrder[]>([])
const isAccepting = ref(false) // 防止重复抢单

// 模态框状态
const completeModalVisible = ref(false)
const externalModalVisible = ref(false)
const externalCompleteModalVisible = ref(false)
const currentOrder = ref<WorkOrder | null>(null)

// 表单数据
const completeForm = reactive({
  repairRecord: '',
  faultReason: '',
  solution: ''
})

const externalForm = reactive({
  reason: ''
})

const externalCompleteForm = reactive({
  repairRecord: '',
  faultReason: '',
  solution: '',
  actualCost: 0
})

const pendingOrders = computed(() => {
  return orders.value.filter(o => o.status === 'pending')
})

const myOrders = computed(() => {
  return orders.value.filter(o => o.engineerId === user.value.id)
})

const pendingCount = computed(() => pendingOrders.value.length)
const processingCount = computed(() => myOrders.value.filter(o => o.status === 'processing').length)
const completedCount = computed(() => myOrders.value.filter(o => o.status === 'completed').length)

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    urgent: 'priority-urgent',
    high: 'priority-high',
    medium: 'priority-medium',
    low: 'priority-low'
  }
  return classes[priority] || 'priority-medium'
}

const getPriorityText = (priority: string) => {
  const texts: Record<string, string> = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低'
  }
  return texts[priority] || '中'
}

const fetchOrders = async () => {
  try {
    const response = await workOrderApi.list()
    orders.value = response.data.data
  } catch (error) {
    console.error('获取工单列表失败:', error)
  }
}

const handleAcceptOrder = async (order: WorkOrder) => {
  if (isAccepting.value) return // 防止重复点击
  isAccepting.value = true
  try {
    await workOrderApi.accept(order.id)
    await fetchOrders()
    alert('抢单成功')
  } catch (error) {
    alert('抢单失败')
  } finally {
    isAccepting.value = false
  }
}

const handleStartProcess = async (order: WorkOrder) => {
  if (!confirm('确认开始处理该工单？')) return
  try {
    await workOrderApi.startProcess(order.id)
    await fetchOrders()
    alert('已开始处理')
  } catch (error) {
    alert('操作失败')
  }
}

const showCompleteModal = (order: WorkOrder) => {
  currentOrder.value = order
  completeForm.repairRecord = ''
  completeForm.faultReason = ''
  completeForm.solution = ''
  completeModalVisible.value = true
}

const handleComplete = async () => {
  if (!currentOrder.value) return
  if (!completeForm.repairRecord || !completeForm.faultReason || !completeForm.solution) {
    alert('请填写完整信息')
    return
  }
  try {
    await workOrderApi.complete(currentOrder.value.id, {
      repairRecord: completeForm.repairRecord,
      faultReason: completeForm.faultReason,
      solution: completeForm.solution
    })
    completeModalVisible.value = false
    await fetchOrders()
    alert('维修完成')
  } catch (error) {
    alert('操作失败')
  }
}

const showExternalModal = (order: WorkOrder) => {
  currentOrder.value = order
  externalForm.reason = ''
  externalModalVisible.value = true
}

const handleExternal = async () => {
  if (!currentOrder.value) return
  if (!externalForm.reason) {
    alert('请填写外修原因')
    return
  }
  try {
    await workOrderApi.createExternalRepair(currentOrder.value.id, {
      reason: externalForm.reason,
      parts: '',
      estimatedCost: 0,
      repairCompany: ''
    })
    externalModalVisible.value = false
    await fetchOrders()
    alert('外修申请已提交')
  } catch (error) {
    alert('操作失败')
  }
}

const handleStartExternal = async (order: WorkOrder) => {
  if (!confirm('确认开始外修？')) return
  try {
    await workOrderApi.startExternal(order.id)
    await fetchOrders()
    alert('已开始外修')
  } catch (error) {
    alert('操作失败')
  }
}

const showExternalCompleteModal = (order: WorkOrder) => {
  currentOrder.value = order
  externalCompleteForm.repairRecord = ''
  externalCompleteForm.faultReason = ''
  externalCompleteForm.solution = ''
  externalCompleteForm.actualCost = 0
  externalCompleteModalVisible.value = true
}

const handleExternalComplete = async () => {
  if (!currentOrder.value) return
  if (!externalCompleteForm.repairRecord || !externalCompleteForm.faultReason || !externalCompleteForm.solution || externalCompleteForm.actualCost <= 0) {
    alert('请填写完整信息')
    return
  }
  try {
    await workOrderApi.completeExternalRepair(currentOrder.value.id, {
      repairRecord: externalCompleteForm.repairRecord,
      faultReason: externalCompleteForm.faultReason,
      solution: externalCompleteForm.solution,
      actualCost: externalCompleteForm.actualCost
    })
    externalCompleteModalVisible.value = false
    await fetchOrders()
    alert('外修完成')
  } catch (error) {
    alert('操作失败')
  }
}

const viewOrderDetail = (id: string) => {
  router.push(`/workorder/${id}`)
}

const handleLogout = () => {
  authApi.logout()
  router.push('/engineer/login')
}

onMounted(() => {
  if (!user.value.id || user.value.role !== 'engineer') {
    router.push('/engineer/login')
    return
  }
  fetchOrders()
})
</script>
