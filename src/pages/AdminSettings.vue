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
            <a href="/admin/workorders" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ClipboardList class="w-5 h-5" />
              工单管理
            </a>
          </li>
          <li>
            <a href="/admin/statistics" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <BarChart3 class="w-5 h-5" />
              数据统计
            </a>
          </li>
          <li v-if="userRole !== 'operator'">
            <a href="/admin/settings" class="flex items-center gap-3 px-4 py-3 bg-darkblue text-white rounded-xl shadow-md">
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

    <main class="ml-64 p-8" @input="saveDraft">
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-gray-800">系统设置</h1>
        <p class="text-gray-600 mt-2">配置系统参数和接口设置</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card fade-in">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Mail class="w-5 h-5 mr-2 text-primary" />
            SMTP邮件配置
          </h3>
          <div class="space-y-4">
            <div>
              <label class="form-label">SMTP服务器</label>
              <input v-model="settings.smtpHost" type="text" class="form-input" />
            </div>
            <div>
              <label class="form-label">SMTP端口</label>
              <input v-model.number="settings.smtpPort" type="number" class="form-input" />
            </div>
            <div>
              <label class="form-label">发件人邮箱</label>
              <input v-model="settings.smtpUsername" type="email" class="form-input" />
            </div>
            <div>
              <label class="form-label">邮箱密码/授权码</label>
              <input v-model="settings.smtpPassword" type="password" class="form-input" />
            </div>
          </div>
          <button @click="testEmail" class="btn-outline mt-4">
            <Send class="w-4 h-4 inline mr-1" />
            测试邮件发送
          </button>
        </div>

        <div class="card fade-in">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MessageSquare class="w-5 h-5 mr-2 text-primary" />
            Webex机器人配置
          </h3>
          <div class="space-y-4">
            <div>
              <label class="form-label">Webex Token</label>
              <input v-model="settings.webexToken" type="text" class="form-input" />
            </div>
            <div>
              <label class="form-label">Webex Room ID</label>
              <input v-model="settings.webexRoomId" type="text" class="form-input" />
            </div>
          </div>
          <button @click="testWebex" class="btn-outline mt-4">
            <Send class="w-4 h-4 inline mr-1" />
            测试消息发送
          </button>
        </div>

        <div class="card fade-in">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Globe class="w-5 h-5 mr-2 text-primary" />
            HTTPS证书配置
          </h3>
          <div class="space-y-4">
            <div>
              <label class="form-label">服务器证书 (cert.pem)</label>
              <div class="flex gap-2">
                <input v-model="settings.certFileName" type="text" class="form-input flex-1" readonly placeholder="未上传证书" />
                <label class="btn-outline cursor-pointer">
                  <Upload class="w-4 h-4 inline mr-1" />
                  上传
                  <input type="file" accept=".crt,.pem,.cer,.cert" class="hidden" @change="handleCertUpload" />
                </label>
              </div>
              <p class="text-gray-400 text-sm mt-1">服务器证书文件，如 cert.pem</p>
            </div>
            <div>
              <label class="form-label">中间证书链 (chain.pem)</label>
              <div class="flex gap-2">
                <input v-model="settings.chainFileName" type="text" class="form-input flex-1" readonly placeholder="未上传证书链" />
                <label class="btn-outline cursor-pointer">
                  <Upload class="w-4 h-4 inline mr-1" />
                  上传
                  <input type="file" accept=".crt,.pem,.cer,.cert" class="hidden" @change="handleChainUpload" />
                </label>
              </div>
              <p class="text-gray-400 text-sm mt-1">中间CA证书链文件，如 chain.pem</p>
            </div>
            <div>
              <label class="form-label">私钥文件 (privkey.pem)</label>
              <div class="flex gap-2">
                <input v-model="settings.keyFileName" type="text" class="form-input flex-1" readonly placeholder="未上传私钥" />
                <label class="btn-outline cursor-pointer">
                  <Upload class="w-4 h-4 inline mr-1" />
                  上传
                  <input type="file" accept=".key,.pem" class="hidden" @change="handleKeyUpload" />
                </label>
              </div>
              <p class="text-gray-400 text-sm mt-1">私钥文件，如 privkey.pem</p>
            </div>
            <div>
              <label class="form-label">私钥密码 (Key Password)</label>
              <input v-model="settings.certPassword" type="password" class="form-input" placeholder="如果私钥已加密，请输入密码" />
              <p class="text-gray-400 text-sm mt-1">如果私钥已加密(PEM pass phrase)，请填写密码</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-600">
                <span class="font-medium text-orange-600">提示：</span>证书上传后需重启服务生效。
                证书存放路径：<code class="bg-gray-200 px-1 rounded">{{ settings.certPath }}</code>
              </p>
            </div>
          </div>
          <button @click="testHttps" class="btn-outline mt-4">
            <ShieldCheck class="w-4 h-4 inline mr-1" />
            测试HTTPS连接
          </button>
        </div>

        <div class="card fade-in">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Globe class="w-5 h-5 mr-2 text-primary" />
            系统配置
          </h3>
          <div class="space-y-4">
            <div>
              <label class="form-label">系统URL</label>
              <input v-model="settings.systemUrl" type="text" class="form-input" />
            </div>
            <div>
              <label class="form-label">HTTPS端口</label>
              <input v-model.number="settings.httpsPort" type="number" class="form-input" />
            </div>
            <div>
              <label class="form-label">证书存放路径</label>
              <input v-model="settings.certPath" type="text" class="form-input" />
            </div>
          </div>
        </div>
      </div>

      <div class="card fade-in mt-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Bell class="w-5 h-5 mr-2 text-primary" />
          通知设置
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-800">工单提交通知</p>
              <p class="text-sm text-gray-500">新工单提交时发送通知</p>
            </div>
            <button
              @click="settings.notifications.orderSubmit = !settings.notifications.orderSubmit"
              :class="[
                'relative w-12 h-6 rounded-full transition-colors',
                settings.notifications.orderSubmit ? 'bg-primary' : 'bg-gray-300'
              ]"
            >
              <span
                :class="[
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                  settings.notifications.orderSubmit ? 'translate-x-7' : 'translate-x-1'
                ]"
              ></span>
            </button>
          </div>
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-800">工单接单通知</p>
              <p class="text-sm text-gray-500">工程师接单时发送通知</p>
            </div>
            <button
              @click="settings.notifications.orderAccept = !settings.notifications.orderAccept"
              :class="[
                'relative w-12 h-6 rounded-full transition-colors',
                settings.notifications.orderAccept ? 'bg-primary' : 'bg-gray-300'
              ]"
            >
              <span
                :class="[
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                  settings.notifications.orderAccept ? 'translate-x-7' : 'translate-x-1'
                ]"
              ></span>
            </button>
          </div>
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-800">工单完成通知</p>
              <p class="text-sm text-gray-500">工单完成时发送领机通知</p>
            </div>
            <button
              @click="settings.notifications.orderComplete = !settings.notifications.orderComplete"
              :class="[
                'relative w-12 h-6 rounded-full transition-colors',
                settings.notifications.orderComplete ? 'bg-primary' : 'bg-gray-300'
              ]"
            >
              <span
                :class="[
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                  settings.notifications.orderComplete ? 'translate-x-7' : 'translate-x-1'
                ]"
              ></span>
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-8">
        <button @click="saveSettings" class="btn-primary">
          <Save class="w-4 h-4 inline mr-1" />
          保存设置
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref, computed } from 'vue'
import { Wrench, LayoutDashboard, Users, Settings, BarChart3, LogOut, Mail, MessageSquare, Globe, Bell, Send, Save, Home, Upload, ShieldCheck, ClipboardList } from 'lucide-vue-next'
import { authApi, adminApi } from '../api'
import { useRouter } from 'vue-router'

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

const settings = reactive({
  smtpHost: 'smtp.example.com',
  smtpPort: 25,
  smtpUsername: 'it-support@example.com',
  smtpPassword: '',
  smtpSecure: false,
  webexToken: '',
  webexRoomId: '',
  systemUrl: 'https://localhost:8443',
  httpsPort: 443,
  certPath: './certs',
  certFileName: '',
  chainFileName: '',
  keyFileName: '',
  certPassword: '',
  notifications: {
    orderSubmit: true,
    orderAccept: true,
    orderComplete: true
  }
})

const isUploading = ref(false)

const handleCertUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('certFile', file)

    const response = await fetch('/api/admin/settings/upload-cert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })

    const result = await response.json()
    if (result.success) {
      settings.certFileName = file.name
      alert('证书上传成功')
    } else {
      alert('证书上传失败：' + result.message)
    }
  } catch (error) {
    alert('证书上传失败：网络错误')
  } finally {
    isUploading.value = false
  }
}

const handleKeyUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('keyFile', file)

    const response = await fetch('/api/admin/settings/upload-key', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })

    const result = await response.json()
    if (result.success) {
      settings.keyFileName = file.name
      alert('私钥上传成功')
    } else {
      alert('私钥上传失败：' + result.message)
    }
  } catch (error) {
    alert('私钥上传失败：网络错误')
  } finally {
    isUploading.value = false
  }
}

const handleChainUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('chainFile', file)

    const response = await fetch('/api/admin/settings/upload-chain', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })

    const result = await response.json()
    if (result.success) {
      settings.chainFileName = file.name
      alert('证书链上传成功')
    } else {
      alert('证书链上传失败：' + result.message)
    }
  } catch (error) {
    alert('证书链上传失败：网络错误')
  } finally {
    isUploading.value = false
  }
}

const testHttps = async () => {
  const baseUrl = settings.systemUrl.replace(/\/$/, '')
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET'
    })
    if (response.ok || response.status === 404) {
      alert('HTTPS连接正常')
    } else {
      alert('HTTPS连接异常')
    }
  } catch (error) {
    alert('HTTPS连接失败，请检查证书配置是否正确')
  }
}

const SETTINGS_CACHE_KEY = 'admin_settings_draft'

const saveDraft = () => {
  try {
    // 排除敏感字段（密码）
    const { smtpPassword, certPassword, ...safeSettings } = settings
    sessionStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(safeSettings))
  } catch (error) {
    console.error('保存草稿失败')
  }
}

const restoreDraft = (): boolean => {
  try {
    const cached = sessionStorage.getItem(SETTINGS_CACHE_KEY)
    if (cached) {
      const draft = JSON.parse(cached)
      Object.assign(settings, draft)
      return true
    }
  } catch (error) {
    console.error('恢复草稿失败')
  }
  return false
}

const clearDraft = () => {
  try {
    sessionStorage.removeItem(SETTINGS_CACHE_KEY)
  } catch (error) {
    console.error('清除草稿失败')
  }
}

const testEmail = async () => {
  const testEmailAddress = prompt('请输入测试邮箱地址：')
  if (!testEmailAddress) return
  
  try {
    const response = await adminApi.testEmail(testEmailAddress)
    if (response.data.success) {
      alert('测试邮件发送成功，请检查邮箱')
    } else {
      alert('测试邮件发送失败：' + response.data.message)
    }
  } catch (error) {
    alert('测试邮件发送失败：网络错误')
  }
}

const testWebex = async () => {
  try {
    const response = await fetch('/api/admin/settings/test-webex', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    const result = await response.json()
    alert(result.message)
  } catch (error) {
    alert('Webex测试失败：网络错误')
  }
}

const saveSettings = async () => {
  try {
    const saveData = {
      smtpHost: settings.smtpHost,
      smtpPort: settings.smtpPort,
      smtpUsername: settings.smtpUsername,
      smtpPassword: settings.smtpPassword,
      smtpSecure: settings.smtpSecure,
      webexToken: settings.webexToken,
      webexRoomId: settings.webexRoomId,
      systemUrl: settings.systemUrl,
      httpsPort: settings.httpsPort,
      certPath: settings.certPath,
      certPassword: settings.certPassword,
      certFileName: settings.certFileName,
      chainFileName: settings.chainFileName,
      keyFileName: settings.keyFileName
    }
    const response = await adminApi.updateSettings(saveData)
    if (response.data.success) {
      alert('设置保存成功')
      clearDraft()
    } else {
      alert('设置保存失败：' + response.data.message)
    }
  } catch (error) {
    alert('设置保存失败：网络错误')
  }
}

const loadSettings = async () => {
  try {
    const response = await adminApi.getSettings()
    if (response.data.success) {
      const data = response.data.data
      settings.smtpHost = data.smtpHost || settings.smtpHost
      settings.smtpPort = data.smtpPort || settings.smtpPort
      settings.smtpUsername = data.smtpUsername || settings.smtpUsername
      settings.smtpPassword = data.smtpPassword || settings.smtpPassword
      settings.smtpSecure = data.smtpSecure || settings.smtpSecure
      settings.webexToken = data.webexToken || settings.webexToken
      settings.webexRoomId = data.webexRoomId || settings.webexRoomId
      settings.systemUrl = data.systemUrl || settings.systemUrl
      settings.httpsPort = data.httpsPort || settings.httpsPort
      settings.certPath = data.certPath || settings.certPath
      settings.certPassword = data.certPassword || ''
      settings.certFileName = data.certFileName || ''
      settings.chainFileName = data.chainFileName || ''
      settings.keyFileName = data.keyFileName || ''
      // 通知设置从服务器加载
      if (data.notifications) {
        settings.notifications.orderSubmit = data.notifications.orderSubmit ?? true
        settings.notifications.orderAccept = data.notifications.orderAccept ?? true
        settings.notifications.orderComplete = data.notifications.orderComplete ?? true
      }
    }
  } catch (error) {
    // API 失败时才使用草稿
    if (!restoreDraft()) {
      console.log('加载设置失败')
    }
  }
}

const handleLogout = () => {
  authApi.logout()
  router.push('/admin/login')
}

onMounted(() => {
  loadSettings()
})
</script>
