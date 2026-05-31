<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center py-8">
    <div class="card max-w-md w-full mx-4 scale-in">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center mb-4">
          <img src="/logo.png" alt="FoxLink" class="w-32 h-12 object-contain drop-shadow-lg" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-darkblue">管理员登录</h1>
        <p class="text-gray-500 mt-2">Foxlink IT Support</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div class="form-group">
          <label class="form-label">
            <span class="text-red-500">*</span> 用户名
          </label>
          <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <div class="px-4 py-3 bg-gray-50">
              <User class="w-5 h-5 text-gray-400" />
            </div>
            <input
              v-model="form.username"
              type="text"
              class="flex-1 px-3 py-3 bg-white focus:outline-none placeholder-gray-400"
              placeholder="请输入用户名"
            />
          </div>
          <p v-if="errors.username" class="text-red-500 text-sm mt-2">{{ errors.username }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="text-red-500">*</span> 密码
          </label>
          <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <div class="px-4 py-3 bg-gray-50">
              <Lock class="w-5 h-5 text-gray-400" />
            </div>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="flex-1 px-3 py-3 bg-white focus:outline-none placeholder-gray-400"
              placeholder="请输入密码"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="px-4 py-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Eye v-if="showPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          <p v-if="errors.password" class="text-red-500 text-sm mt-2">{{ errors.password }}</p>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="btn-primary w-full mt-2"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
          {{ isLoading ? '登录中...' : '登 录' }}
        </button>
      </form>

      <p class="text-center text-gray-500 text-sm mt-6">
        <button @click="showForgotModal = true" class="text-primary-600 hover:text-primary-700 hover:underline transition-colors">忘记密码？</button>
      </p>
    </div>

    <div v-if="showForgotModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="card max-w-md mx-4 fade-in">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-800">忘记密码</h3>
          <button @click="closeForgotModal" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div v-if="forgotStep === 1">
          <p class="text-gray-600 mb-4">请输入您的邮箱，我们将发送验证码到您的邮箱</p>
          <div>
            <label class="form-label">邮箱</label>
            <input v-model="forgotForm.email" type="email" class="form-input" placeholder="请输入邮箱" />
          </div>
          <button @click="sendCode" class="btn-primary w-full mt-4">发送验证码</button>
        </div>
        
        <div v-else-if="forgotStep === 2">
          <p class="text-gray-600 mb-4">请输入收到的验证码</p>
          <div>
            <label class="form-label">验证码</label>
            <input v-model="forgotForm.code" type="text" class="form-input" placeholder="请输入验证码" />
          </div>
          <button @click="verifyCode" class="btn-primary w-full mt-4">验证</button>
          <button @click="forgotStep = 1" class="btn-outline w-full mt-2">返回</button>
        </div>
        
        <div v-else-if="forgotStep === 3">
          <p class="text-gray-600 mb-4">请设置新密码</p>
          <div>
            <label class="form-label">新密码</label>
            <input v-model="forgotForm.newPassword" type="password" class="form-input" placeholder="至少6位，包含大小写字母和数字" />
          </div>
          <div>
            <label class="form-label">确认密码</label>
            <input v-model="forgotForm.confirmPassword" type="password" class="form-input" placeholder="请确认密码" />
          </div>
          <button @click="resetPassword" class="btn-primary w-full mt-4">重置密码</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Lock, Eye, EyeOff, Loader2, X } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { authApi } from '../api'

const router = useRouter()

const form = reactive({
  username: '',
  password: ''
})

const errors = reactive<Record<string, string>>({})
const showPassword = ref(false)
const isLoading = ref(false)

const showForgotModal = ref(false)
const forgotStep = ref(1)
const forgotForm = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

const closeForgotModal = () => {
  showForgotModal.value = false
  forgotStep.value = 1
  forgotForm.email = ''
  forgotForm.code = ''
  forgotForm.newPassword = ''
  forgotForm.confirmPassword = ''
}

const sendCode = async () => {
  if (!forgotForm.email) {
    alert('请输入邮箱')
    return
  }
  
  try {
    const response = await fetch('/api/admin/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotForm.email })
    })
    const result = await response.json()
    if (result.success) {
      alert(result.message)
      forgotStep.value = 2
    } else {
      alert(result.message)
    }
  } catch (error) {
    alert('发送失败：网络错误')
  }
}

const verifyCode = async () => {
  if (!forgotForm.code) {
    alert('请输入验证码')
    return
  }
  
  try {
    const response = await fetch('/api/admin/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotForm.email, code: forgotForm.code })
    })
    const result = await response.json()
    if (result.success) {
      alert(result.message)
      forgotStep.value = 3
    } else {
      alert(result.message)
    }
  } catch (error) {
    alert('验证失败：网络错误')
  }
}

const resetPassword = async () => {
  if (!forgotForm.newPassword || !forgotForm.confirmPassword) {
    alert('请输入密码')
    return
  }
  
  if (forgotForm.newPassword !== forgotForm.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  
  if (!validatePassword(forgotForm.newPassword)) {
    return
  }
  
  try {
    const response = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: forgotForm.email, 
        code: forgotForm.code,
        newPassword: forgotForm.newPassword 
      })
    })
    const result = await response.json()
    if (result.success) {
      alert(result.message)
      closeForgotModal()
    } else {
      alert(result.message)
    }
  } catch (error) {
    alert('重置失败：网络错误')
  }
}

const validatePassword = (password: string): boolean => {
  if (password.length < 6) {
    alert('密码长度至少为6位')
    return false
  }
  
  if (!/[A-Z]/.test(password)) {
    alert('密码必须包含至少一个大写字母')
    return false
  }
  
  if (!/[a-z]/.test(password)) {
    alert('密码必须包含至少一个小写字母')
    return false
  }
  
  if (!/[0-9]/.test(password)) {
    alert('密码必须包含至少一个数字')
    return false
  }
  
  return true
}

const handleLogin = async () => {
  errors.username = ''
  errors.password = ''
  
  if (!form.username.trim()) {
    errors.username = '请输入用户名'
    return
  }
  
  if (!form.password.trim()) {
    errors.password = '请输入密码'
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await authApi.login({
      username: form.username,
      password: form.password
    })
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      router.push('/admin')
    }
  } catch (error) {
    errors.password = '用户名或密码错误'
  } finally {
    isLoading.value = false
  }
}
</script>
