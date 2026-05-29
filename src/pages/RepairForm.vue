<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <header class="text-center mb-8 fade-in">
        <div class="flex items-center justify-between mb-4">
          <button @click="goHome" class="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
            <Home class="w-5 h-5" />
            返回首页
          </button>
          <div></div>
          <div></div>
        </div>
        <div class="inline-flex items-center gap-4 mb-4">
          <img src="/logo.png" alt="FoxLink" class="w-24 h-9 object-contain drop-shadow-md" />
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-darkblue">IT设备报修</h1>
            <p class="text-gray-500">Foxlink IT Support</p>
          </div>
        </div>
        <p class="text-gray-600">请填写以下信息提交报修工单，系统将尽快为您分配工程师</p>
      </header>

      <div class="card fade-in">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="border-b border-gray-100 pb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User class="w-5 h-5 mr-2 text-primary-500" />
              申请人信息
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="form-group">
                <label class="form-label">
                  <span class="text-red-500">*</span> 姓名
                </label>
                <input
                  v-model="form.applicantName"
                  type="text"
                  class="form-input"
                  placeholder="请输入姓名"
                  @blur="validateField('applicantName')"
                />
                <p v-if="errors.applicantName" class="text-red-500 text-sm mt-2">{{ errors.applicantName }}</p>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="text-red-500">*</span> 所属部门
                </label>
                <select
                  v-model="form.department"
                  class="form-select"
                  @change="validateField('department')"
                >
                  <option value="">请选择部门</option>
                  <option value="研发部">研发部</option>
                  <option value="市场部">市场部</option>
                  <option value="财务部">财务部</option>
                  <option value="人力资源部">人力资源部</option>
                  <option value="行政部">行政部</option>
                  <option value="生产部">生产部</option>
                </select>
                <p v-if="errors.department" class="text-red-500 text-sm mt-2">{{ errors.department }}</p>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="text-red-500">*</span> 内线分机
                </label>
                <input
                  v-model="form.extension"
                  type="text"
                  class="form-input"
                  placeholder="请输入内线分机号码"
                  @blur="validateField('extension')"
                />
                <p v-if="errors.extension" class="text-red-500 text-sm mt-2">{{ errors.extension }}</p>
              </div>

              <div class="form-group">
                <label class="form-label">Email&amp;Webex</label>
                <div class="flex border border-gray-200 rounded-xl overflow-hidden">
                  <input
                    v-model="form.emailPrefix"
                    type="text"
                    class="flex-1 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder="wesley_wen"
                    @blur="validateField('email')"
                    autofocus
                  />
                  <span class="flex-1 bg-gray-100 text-gray-500 px-4 py-3 flex items-center justify-start border-l border-gray-200 text-sm">@foxlink.com</span>
                </div>
                <p class="text-gray-400 text-sm mt-2">email帐号即为webex帐号，非必填项</p>
                <p v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</p>
              </div>
            </div>
          </div>

          <div class="border-b border-gray-100 pb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Monitor class="w-5 h-5 mr-2 text-primary-500" />
              设备信息
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="form-group">
                <label class="form-label">
                  <span class="text-red-500">*</span> 设备资产编号
                </label>
                <input
                  v-model="form.assetNo"
                  type="text"
                  class="form-input"
                  placeholder="请输入设备资产编号"
                  @blur="validateField('assetNo')"
                />
                <p v-if="errors.assetNo" class="text-red-500 text-sm mt-2">{{ errors.assetNo }}</p>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="text-red-500">*</span> 设备类型
                </label>
                <select
                  v-model="form.deviceType"
                  class="form-select"
                  @change="validateField('deviceType')"
                >
                  <option value="">请选择设备类型</option>
                  <option value="台式电脑">台式电脑</option>
                  <option value="笔记本电脑">笔记本电脑</option>
                  <option value="显示器">显示器</option>
                  <option value="打印机">打印机</option>
                  <option value="网络设备">网络设备</option>
                  <option value="服务器">服务器</option>
                  <option value="其他">其他</option>
                </select>
                <p v-if="errors.deviceType" class="text-red-500 text-sm mt-2">{{ errors.deviceType }}</p>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="text-red-500">*</span> 维修项目/故障分类
                </label>
                <select
                  v-model="form.projectId"
                  class="form-select"
                  @change="validateField('projectId')"
                >
                  <option value="">请选择维修项目</option>
                  <option value="1">系统故障</option>
                  <option value="2">网络故障</option>
                  <option value="3">硬件故障</option>
                  <option value="4">软件问题</option>
                  <option value="5">设备升级</option>
                  <option value="6">数据恢复</option>
                  <option value="7">其他问题</option>
                </select>
                <p v-if="errors.projectId" class="text-red-500 text-sm mt-2">{{ errors.projectId }}</p>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="text-red-500">*</span> 区域
                </label>
                <select
                  v-model="form.area"
                  class="form-select"
                  @change="validateField('area')"
                >
                  <option value="">请选择区域</option>
                  <option value="A">A区</option>
                  <option value="CK">CK区</option>
                </select>
                <p v-if="errors.area" class="text-red-500 text-sm mt-2">{{ errors.area }}</p>
              </div>
            </div>

            <div class="form-group mt-5">
              <label class="form-label">
                <span class="text-red-500">*</span> 故障详细描述
              </label>
              <textarea
                v-model="form.description"
                class="form-textarea"
                rows="4"
                placeholder="请详细描述故障现象，例如：电脑无法开机，开机后蓝屏，具体报错信息等..."
                @blur="validateField('description')"
              ></textarea>
              <div class="flex justify-between items-center mt-2">
                <p v-if="errors.description" class="text-red-500 text-sm">{{ errors.description }}</p>
                <span v-else class="text-gray-400 text-sm">{{ form.description.length }} / 500</span>
              </div>
            </div>
          </div>

          <div class="border-b border-gray-100 pb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Server class="w-5 h-5 mr-2 text-primary-500" />
              维修设置
            </h3>

            <div class="form-group">
              <label class="form-label">
                <span class="text-red-500">*</span> 维修场景类型
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <label 
                  :class="[
                    'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
                    form.repairType === 'internal' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  ]"
                >
                  <input
                    type="radio"
                    v-model="form.repairType"
                    value="internal"
                    class="w-5 h-5 text-primary-500"
                  />
                  <div class="flex-1">
                    <div class="font-medium text-gray-800">资讯内部维修</div>
                    <div class="text-sm text-gray-500">设备送修至资讯维修区，工程师统一处理</div>
                  </div>
                  <Server class="w-6 h-6 text-gray-400" />
                </label>
                <label 
                  :class="[
                    'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
                    form.repairType === 'remote' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  ]"
                >
                  <input
                    type="radio"
                    v-model="form.repairType"
                    value="remote"
                    class="w-5 h-5 text-primary-500"
                  />
                  <div class="flex-1">
                    <div class="font-medium text-gray-800">资讯委外维修</div>
                    <div class="text-sm text-gray-500">资讯采购协助外送维修处理</div>
                  </div>
                  <Monitor class="w-6 h-6 text-gray-400" />
                </label>
              </div>
              <p v-if="errors.repairType" class="text-red-500 text-sm mt-2">{{ errors.repairType }}</p>
            </div>

            <div class="form-group mt-5">
              <label class="form-label">
                <span class="text-red-500">*</span> 消息通知方式（至少选一项）
              </label>
              <div class="flex flex-wrap gap-3 mt-3">
                <label 
                  :class="[
                    'flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300',
                    form.notificationChannels.includes('extension') 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <input
                    type="checkbox"
                    :checked="form.notificationChannels.includes('extension')"
                    @change="toggleNotificationChannel('extension')"
                    class="form-checkbox"
                  />
                  <Phone class="w-5 h-5 text-gray-500" />
                  <span class="font-medium text-gray-700">分机呼叫</span>
                </label>
                <label 
                  :class="[
                    'flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300',
                    form.notificationChannels.includes('email') 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <input
                    type="checkbox"
                    :checked="form.notificationChannels.includes('email')"
                    @change="toggleNotificationChannel('email')"
                    class="form-checkbox"
                  />
                  <Mail class="w-5 h-5 text-gray-500" />
                  <span class="font-medium text-gray-700">邮件</span>
                </label>
                <label 
                  :class="[
                    'flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300',
                    form.notificationChannels.includes('webex') 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <input
                    type="checkbox"
                    :checked="form.notificationChannels.includes('webex')"
                    @change="toggleNotificationChannel('webex')"
                    class="form-checkbox"
                  />
                  <MessageCircle class="w-5 h-5 text-gray-500" />
                  <span class="font-medium text-gray-700">Webex</span>
                </label>
              </div>
              <p v-if="errors.notificationChannels" class="text-red-500 text-sm mt-2">{{ errors.notificationChannels }}</p>
            </div>

            <div class="form-group mt-5">
              <label class="form-label">
                <span class="text-red-500">*</span> 紧急等级
              </label>
              <div class="flex gap-4 mt-3">
                <label 
                  :class="[
                    'flex items-center gap-2 px-6 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300',
                    form.priority === 'normal' 
                      ? 'border-gray-500 bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <input
                    type="radio"
                    v-model="form.priority"
                    value="normal"
                    class="w-5 h-5 text-gray-500"
                  />
                  <Clock class="w-5 h-5 text-gray-400" />
                  <span class="font-medium text-gray-700">普通</span>
                </label>
                <label 
                  :class="[
                    'flex items-center gap-2 px-6 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300',
                    form.priority === 'urgent' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <input
                    type="radio"
                    v-model="form.priority"
                    value="urgent"
                    class="w-5 h-5 text-red-500"
                  />
                  <AlertTriangle class="w-5 h-5 text-red-400" />
                  <span class="font-medium text-red-600">紧急</span>
                </label>
              </div>
              <p v-if="errors.priority" class="text-red-500 text-sm mt-2">{{ errors.priority }}</p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">其他备注（选填）</label>
            <textarea
              v-model="form.remark"
              class="form-textarea"
              rows="3"
              placeholder="如有其他需要说明的情况，请填写..."
            ></textarea>
          </div>

          <div class="flex justify-center pt-4">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="btn-primary w-full sm:w-auto px-12"
            >
              <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
              {{ isSubmitting ? '提交中...' : '提交工单' }}
            </button>
          </div>
        </form>
      </div>

      <div v-if="showSuccess" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="card max-w-md w-full text-center scale-in">
          <div class="w-24 h-24 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-6 pulse-ring">
            <CheckCircle class="w-14 h-14 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-3">工单提交成功</h3>
          <p class="text-gray-600 mb-2">您的工单号：</p>
          <p class="text-2xl font-mono font-bold text-primary-600 mb-4">{{ submittedOrderNo }}</p>
          <p class="text-gray-500 text-sm mb-6">系统将尽快为您分配工程师，请保持通讯畅通</p>
          <button @click="resetForm" class="btn-primary w-full">
            提交新工单
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { 
  Home, Upload, Loader2, CheckCircle, 
  Server, Monitor, Phone, Mail, MessageCircle, Clock, AlertTriangle, User
} from 'lucide-vue-next'
import { workOrderApi } from '../api'

const isSubmitting = ref(false)
const showSuccess = ref(false)
const submittedOrderNo = ref('')

const goHome = () => {
  window.location.href = '/'
}

const form = reactive({
  applicantName: '',
  department: '',
  extension: '',
  emailPrefix: '',
  assetNo: '',
  deviceType: '',
  projectId: '',
  area: '',
  description: '',
  repairType: '' as 'internal' | 'remote' | '',
  notificationChannels: [] as ('extension' | 'email' | 'webex')[],
  priority: '' as 'normal' | 'urgent' | '',
  remark: ''
})

const errors = reactive<Record<string, string>>({})

const toggleNotificationChannel = (channel: 'extension' | 'email' | 'webex') => {
  const index = form.notificationChannels.indexOf(channel)
  if (index > -1) {
    form.notificationChannels.splice(index, 1)
  } else {
    form.notificationChannels.push(channel)
  }
}

const validateField = (field: string) => {
  errors[field] = ''
  
  switch (field) {
    case 'applicantName':
      if (!form.applicantName.trim()) errors[field] = '请输入姓名'
      break
    case 'department':
      if (!form.department) errors[field] = '请选择所属部门'
      break
    case 'extension':
      if (!form.extension.trim()) {
        errors[field] = '请输入内线分机'
      } else if (!/^\d{3,6}$/.test(form.extension)) {
        errors[field] = '分机号码格式不正确（3-6位数字）'
      }
      break
    case 'email':
      if (form.emailPrefix.trim() && !/^[a-zA-Z0-9._-]+$/.test(form.emailPrefix)) {
        errors[field] = '英文名格式不正确（仅支持字母、数字、下划线和连字符）'
      }
      break
    case 'assetNo':
      if (!form.assetNo.trim()) errors[field] = '请输入设备资产编号'
      break
    case 'deviceType':
      if (!form.deviceType) errors[field] = '请选择设备类型'
      break
    case 'projectId':
      if (!form.projectId) errors[field] = '请选择维修项目'
      break
    case 'area':
      if (!form.area) errors[field] = '请选择区域'
      break
    case 'description':
      if (!form.description.trim()) {
        errors[field] = '请填写故障描述'
      } else if (form.description.length < 10) {
        errors[field] = '故障描述至少需要10个字符'
      } else if (form.description.length > 500) {
        errors[field] = '故障描述不能超过500个字符'
      }
      break
    case 'repairType':
      if (!form.repairType) errors[field] = '请选择维修场景类型'
      break
    case 'notificationChannels':
      if (form.notificationChannels.length === 0) errors[field] = '请至少选择一种通知方式'
      break
    case 'priority':
      if (!form.priority) errors[field] = '请选择紧急等级'
      break
  }
}

const validateAll = (): boolean => {
  let isValid = true
  
  const fields = ['applicantName', 'department', 'extension', 'email', 'assetNo', 'deviceType', 'projectId', 'area', 'description', 'repairType', 'notificationChannels', 'priority']
  fields.forEach(field => {
    validateField(field)
    if (errors[field]) isValid = false
  })
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateAll()) return
  
  isSubmitting.value = true
  
  try {
    const email = form.emailPrefix.trim() ? `${form.emailPrefix}@foxlink.com` : ''
    const response = await workOrderApi.submit({
      applicantName: form.applicantName,
      department: form.department,
      extension: form.extension,
      email: email,
      assetNo: form.assetNo,
      deviceType: form.deviceType,
      projectId: form.projectId,
      description: form.description,
      repairType: form.repairType || 'internal',
      notificationChannels: form.notificationChannels,
      priority: form.priority || 'normal',
      area: form.area
    })
    
    if (response.data.success) {
      submittedOrderNo.value = response.data.orderNo
      showSuccess.value = true
    }
  } catch (error) {
    console.error('提交工单失败:', error)
    alert('提交工单失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  showSuccess.value = false
  form.applicantName = ''
  form.department = ''
  form.extension = ''
  form.emailPrefix = ''
  form.assetNo = ''
  form.deviceType = ''
  form.projectId = ''
  form.area = ''
  form.description = ''
  form.repairType = ''
  form.notificationChannels = []
  form.priority = ''
  form.remark = ''
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}
</script>
