<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center py-8">
    <div class="card max-w-md w-full mx-4 scale-in">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center mb-4">
          <img src="/logo.png" alt="FoxLink" class="w-32 h-12 object-contain drop-shadow-lg" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-darkblue">工程师登录</h1>
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
        <button @click="goHome" class="text-primary-600 hover:text-primary-700 hover:underline transition-colors">返回首页</button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
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

const goHome = () => {
  router.push('/')
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
      const user = response.data.user
      if (user.role === 'engineer') {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(user))
        router.push('/engineer')
      } else {
        errors.password = '您不是工程师账号'
      }
    }
  } catch (error) {
    errors.password = '用户名或密码错误'
  } finally {
    isLoading.value = false
  }
}
</script>
