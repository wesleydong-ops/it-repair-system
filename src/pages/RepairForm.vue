<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <header class="text-center mb-8 fade-in">
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
        <div class="flex border-b border-gray-100 mb-8">
          <button
            v-for="(step, index) in steps"
            :key="step.id"
            @click="currentStep = index"
            :class="[
              'flex-1 flex flex-col items-center gap-2 px-4 py-4 font-medium transition-all duration-300',
              currentStep === index
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            <span :class="[
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
              currentStep === index 
                ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600'
            ]">
              <CheckCircle v-if="index < currentStep" class="w-5 h-5" />
              <span v-else>{{ index + 1 }}</span>
            </span>
            <span class="text-sm">{{ step.name }}</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-0">
          <div v-show="currentStep === 0" class="space-y-5">
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
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="form-group">
                <label class="form-label">
                  <span class="text-red-500">*</span> 工位位置
                </label>
                <input
                  v-model="form.location"
                  type="text"
                  class="form-input"
                  placeholder="请输入工位位置，如：A栋3楼301室"
                  @blur="validateField('location')"
                />
                <p v-if="errors.location" class="text-red-500 text-sm mt-2">{{ errors.location }}</p>
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
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="form-group">
                <label class="form-label">
                  <span class="text-red-500">*</span> 企业邮箱
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  placeholder="请输入企业邮箱"
                  @blur="validateField('email')"
                />
                <p v-if="errors.email" class="text-red-500 text-sm mt-2">{{ errors.email }}</p>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="text-red-500">*</span> Webex账号
                </label>
                <input
                  v-model="form.webexId"
                  type="text"
                  class="form-input"
                  placeholder="请输入Webex账号"
                  @blur="validateField('webexId')"
                />
                <p v-if="errors.webexId" class="text-red-500 text-sm mt-2">{{ errors.webexId }}</p>
              </div>
            </div>
          </div>

          <div v-show="currentStep === 1" class="space-y-5">
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
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="form-group">
                <label class="form-label">
                  <span class="text-red-500">*</span> 设备具体位置
                </label>
                <select
                  v-model="form.deviceLocation"
                  class="form-select"
                  @change="validateField('deviceLocation')"
                >
                  <option value="">请选择设备位置</option>
                  <option value="A区-1楼">A区-1楼</option>
                  <option value="A区-2楼">A区-2楼</option>
                  <option value="A区-3楼">A区-3楼</option>
                  <option value="CK区-1楼">CK区-1楼</option>
                  <option value="CK区-2楼">CK区-2楼</option>
                  <option value="CK区-3楼">CK区-3楼</option>
                </select>
                <p v-if="errors.deviceLocation" class="text-red-500 text-sm mt-2">{{ errors.deviceLocation }}</p>
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
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="text-red-500">*</span> 故障详细描述
              </label>
              <textarea
                v-model="form.description"
                class="form-textarea"
                rows="5"
                placeholder="请详细描述故障现象，例如：电脑无法开机，开机后蓝屏，具体报错信息等..."
                @blur="validateField('description')"
              ></textarea>
              <div class="flex justify-between items-center mt-2">
                <p v-if="errors.description" class="text-red-500 text-sm">{{ errors.description }}</p>
                <span v-else class="text-gray-400 text-sm">{{ form.description.length }} / 500</span>
              </div>
            </div>
          </div>

          <div v-show="currentStep === 2" class="space-y-5">
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
                    <div class="font-medium text-gray-800">内部机房维修</div>
                    <div class="text-sm text-gray-500">设备送修至机房，工程师统一处理</div>
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
                    <div class="font-medium text-gray-800">现场远程维修</div>
                    <div class="text-sm text-gray-500">工程师远程协助或现场处理</div>
                  </div>
                  <Monitor class="w-6 h-6 text-gray-400" />
                </label>
              </div>
              <p v-if="errors.repairType" class="text-red-500 text-sm mt-2">{{ errors.repairType }}</p>
            </div>

            <div class="form-group">
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

            <div class="form-group">
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

            <div class="form-group">
              <label class="form-label">附件（选填）</label>
              <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-300 transition-colors cursor-pointer">
                <Upload class="w-14 h-14 text-gray-400 mx-auto mb-3" />
                <p class="text-gray-600 font-medium">点击或拖拽上传故障照片/视频</p>
                <p class="text-gray-400 text-sm mt-2">支持 JPG、PNG、MP4 格式，单个文件不超过10MB</p>
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
          </div>

          <div class="flex justify-between mt-10 pt-6 border-t border-gray-100">
            <button
              v-if="currentStep > 0"
              type="button"
              @click="currentStep--"
              class="btn-outline-secondary"
            >
              <ArrowLeft class="w-4 h-4" />
              上一步
            </button>
            <div v-else></div>
            
            <template v-if="currentStep < steps.length - 1">
              <button
                type="button"
                @click="nextStep"
                class="btn-primary"
              >
                下一步
                <ArrowRight class="w-4 h-4" />
              </button>
            </template>
            <template v-else>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="btn-primary"
              >
                <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                {{ isSubmitting ? '提交中...' : '提交工单' }}
              </button>
            </template>
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
  ArrowLeft, ArrowRight, Upload, Loader2, CheckCircle, 
  Server, Monitor, Phone, Mail, MessageCircle, Clock, AlertTriangle
} from 'lucide-vue-next'
import { workOrderApi } from '../api'

const steps = [
  { id: 'info', name: '申请人信息' },
  { id: 'device', name: '设备信息' },
  { id: 'repair', name: '维修信息' }
]

const currentStep = ref(0)
const isSubmitting = ref(false)
const showSuccess = ref(false)
const submittedOrderNo = ref('')

const form = reactive({
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
    case 'location':
      if (!form.location.trim()) errors[field] = '请输入工位位置'
      break
    case 'extension':
      if (!form.extension.trim()) {
        errors[field] = '请输入内线分机'
      } else if (!/^\d{3,6}$/.test(form.extension)) {
        errors[field] = '分机号码格式不正确（3-6位数字）'
      }
      break
    case 'email':
      if (!form.email.trim()) {
        errors[field] = '请输入企业邮箱'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors[field] = '邮箱格式不正确'
      }
      break
    case 'webexId':
      if (!form.webexId.trim()) errors[field] = '请输入Webex账号'
      break
    case 'assetNo':
      if (!form.assetNo.trim()) errors[field] = '请输入设备资产编号'
      break
    case 'deviceType':
      if (!form.deviceType) errors[field] = '请选择设备类型'
      break
    case 'deviceLocation':
      if (!form.deviceLocation) errors[field] = '请选择设备位置'
      break
    case 'projectId':
      if (!form.projectId) errors[field] = '请选择维修项目'
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

const validateCurrentStep = (): boolean => {
  let isValid = true
  
  if (currentStep.value === 0) {
    const fields = ['applicantName', 'department', 'location', 'extension', 'email', 'webexId']
    fields.forEach(field => {
      validateField(field)
      if (errors[field]) isValid = false
    })
  } else if (currentStep.value === 1) {
    const fields = ['assetNo', 'deviceType', 'deviceLocation', 'projectId', 'description']
    fields.forEach(field => {
      validateField(field)
      if (errors[field]) isValid = false
    })
  } else if (currentStep.value === 2) {
    const fields = ['repairType', 'notificationChannels', 'priority']
    fields.forEach(field => {
      validateField(field)
      if (errors[field]) isValid = false
    })
  }
  
  return isValid
}

const nextStep = () => {
  if (validateCurrentStep()) {
    currentStep.value++
  }
}

const getArea = (): string => {
  if (form.deviceLocation.startsWith('A区')) return 'A'
  if (form.deviceLocation.startsWith('CK区')) return 'CK'
  return 'A'
}

const handleSubmit = async () => {
  if (!validateCurrentStep()) return
  
  isSubmitting.value = true
  
  try {
    const response = await workOrderApi.submit({
      applicantName: form.applicantName,
      department: form.department,
      location: form.location,
      extension: form.extension,
      email: form.email,
      webexId: form.webexId,
      assetNo: form.assetNo,
      deviceType: form.deviceType,
      deviceLocation: form.deviceLocation,
      projectId: form.projectId,
      description: form.description,
      repairType: form.repairType || 'internal',
      notificationChannels: form.notificationChannels,
      priority: form.priority || 'normal',
      area: getArea()
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
  currentStep.value = 0
  form.applicantName = ''
  form.department = ''
  form.location = ''
  form.extension = ''
  form.email = ''
  form.webexId = ''
  form.assetNo = ''
  form.deviceType = ''
  form.deviceLocation = ''
  form.projectId = ''
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
