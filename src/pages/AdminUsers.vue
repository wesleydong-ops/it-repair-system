<template>
  <div class="min-h-screen bg-gray-100">
    <AdminSidebar activePath="/admin/users" />

    <main class="ml-64 p-8">
      <header class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">用户管理</h1>
            <p class="text-gray-600 mt-2">管理系统用户和权限</p>
          </div>
          <button @click="showAddModal = true" class="btn-primary">
            <Plus class="w-4 h-4 inline mr-1" />
            添加用户
          </button>
        </div>
      </header>

      <div class="card fade-in">
        <div class="flex flex-wrap gap-4 mb-6">
          <div class="flex items-center gap-2">
            <label class="text-gray-600 font-medium">角色:</label>
            <select v-model="filters.role" class="form-select w-32">
              <option value="">全部</option>
              <option value="admin">超级管理员</option>
              <option value="engineer">工程师</option>
              <option value="purchaser">资讯采购</option>
              <option value="user">普通用户</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-gray-600 font-medium">区域:</label>
            <select v-model="filters.area" class="form-select w-24">
              <option value="">全部</option>
              <option value="A">A区</option>
              <option value="CK">CK区</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-gray-600 font-medium">状态:</label>
            <select v-model="filters.status" class="form-select w-24">
              <option value="">全部</option>
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
          </div>
          <div class="flex-1"></div>
          <div class="flex gap-2">
            <input
              v-model="filters.search"
              type="text"
              class="form-input w-64"
              placeholder="搜索用户名或姓名..."
            />
            <button class="btn-outline px-4">
              <Search class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">用户名</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">姓名</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">角色</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">区域</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">状态</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">创建时间</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="border-b hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-800">{{ user.username }}</td>
                <td class="px-4 py-3">{{ user.name }}</td>
                <td class="px-4 py-3">{{ getRoleText(user.role) }}</td>
                <td class="px-4 py-3">
                  <span v-if="user.area" :class="user.area === 'A' ? 'area-a' : 'area-ck'">
                    {{ user.area === 'A' ? 'A区' : 'CK区' }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3">
                  <span :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ user.isActive ? '启用' : '禁用' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ formatDate(user.createTime) }}</td>
                <td class="px-4 py-3">
                  <button @click="editUser(user)" class="text-primary hover:text-blue-600 mr-3">编辑</button>
                  <button @click="toggleUserStatus(user)" class="text-gray-600 hover:text-red-500 mr-3">
                    {{ user.isActive ? '禁用' : '启用' }}
                  </button>
                  <button v-if="currentUser?.role === 'admin'" @click="deleteUser(user)" class="text-red-600 hover:text-red-800">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="card max-w-md mx-4 fade-in" @input="saveDraft">
          <h3 class="text-xl font-bold text-gray-800 mb-4">{{ editUserModel.id ? '编辑用户' : '添加用户' }}</h3>
          <div class="space-y-4">
            <div>
              <label class="form-label">用户名</label>
              <input v-model="editUserModel.username" type="text" class="form-input" />
            </div>
            <div>
              <label class="form-label">姓名</label>
              <input v-model="editUserModel.name" type="text" class="form-input" />
            </div>
            <div>
              <label class="form-label">角色</label>
              <select v-model="editUserModel.role" class="form-select">
                <option value="admin">超级管理员</option>
                <option value="engineer">工程师</option>
                <option value="purchaser">资讯采购</option>
                <option value="user">普通用户</option>
              </select>
            </div>
            <div>
              <label class="form-label">区域</label>
              <select v-model="editUserModel.area" class="form-select">
                <option value="">无</option>
                <option value="A">A区</option>
                <option value="CK">CK区</option>
              </select>
            </div>
            <div>
              <label class="form-label">邮箱 <span class="text-red-500">*</span></label>
              <input v-model="editUserModel.email" type="email" class="form-input" placeholder="用于接收工单通知、密码重置，默认作为Webex ID" />
            </div>
            <div v-if="!editUserModel.id">
              <label class="form-label">初始密码 <span class="text-gray-400">(选填)</span></label>
              <input v-model="editUserModel.password" type="password" class="form-input" placeholder="至少6位，包含大小写字母和数字" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="closeModal" class="btn-outline">取消</button>
            <button @click="saveUser" class="btn-primary">保存</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { LayoutDashboard, Users, Settings, BarChart3, LogOut, Plus, Search, ClipboardList, Home } from 'lucide-vue-next'
import { authApi } from '../api'
import { useRouter } from 'vue-router'

interface User {
  id: string
  username: string
  name: string
  role: string
  area: string
  email?: string
  webexId?: string
  isActive: boolean
  createTime: string
}

const router = useRouter()

// 获取当前用户角色
const userRole = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.role || ''
  } catch {
    return ''
  }
})

const currentUser = ref<{ id: string; username: string; name: string; role: string } | null>(null)

const goHome = () => {
  window.location.href = '/'
}

const filters = reactive({
  role: '',
  area: '',
  status: '',
  search: ''
})

const showAddModal = ref(false)

const USER_CACHE_KEY = 'admin_user_draft'

const editUserModel = reactive({
  id: '',
  username: '',
  name: '',
  role: 'user',
  area: '',
  password: '',
  email: '',
  webexId: ''
})

const saveDraft = () => {
  try {
    if (editUserModel.id || editUserModel.username || editUserModel.name) {
      sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(editUserModel))
    }
  } catch (error) {
    console.error('保存草稿失败')
  }
}

const restoreDraft = (): boolean => {
  try {
    const cached = sessionStorage.getItem(USER_CACHE_KEY)
    if (cached) {
      const draft = JSON.parse(cached)
      Object.assign(editUserModel, draft)
      return true
    }
  } catch (error) {
    console.error('恢复草稿失败')
  }
  return false
}

const clearDraft = () => {
  try {
    sessionStorage.removeItem(USER_CACHE_KEY)
  } catch (error) {
    console.error('清除草稿失败')
  }
}

const users = ref<User[]>([])
const isLoading = ref(false)

const getRoleText = (role: string) => {
  const texts: Record<string, string> = {
    admin: '超级管理员',
    engineer: '工程师',
    purchaser: '资讯采购',
    user: '普通用户'
  }
  return texts[role] || role
}

const formatDate = (dateStr: string) => {
  return dateStr.split(' ')[0]
}

const editUser = (user: User) => {
  const hasDraft = restoreDraft()
  if (hasDraft) {
    if (!confirm('检测到未保存的编辑内容,是否恢复?')) {
      clearDraft()
      editUserModel.id = user.id
      editUserModel.username = user.username
      editUserModel.name = user.name
      editUserModel.role = user.role
      editUserModel.area = user.area || ''
      editUserModel.password = ''
      editUserModel.email = user.email || ''
      editUserModel.webexId = user.webexId || ''
    }
  } else {
    editUserModel.id = user.id
    editUserModel.username = user.username
    editUserModel.name = user.name
    editUserModel.role = user.role
    editUserModel.area = user.area || ''
    editUserModel.password = ''
    editUserModel.email = user.email || ''
    editUserModel.webexId = user.webexId || ''
  }
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editUserModel.id = ''
  editUserModel.username = ''
  editUserModel.name = ''
  editUserModel.role = 'user'
  editUserModel.area = ''
  editUserModel.password = ''
  editUserModel.email = ''
  editUserModel.webexId = ''
  clearDraft()
}

const loadUsers = async () => {
  isLoading.value = true
  try {
    const response = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const result = await response.json()
    if (result.success) {
      users.value = result.data
    } else {
      console.error('加载用户列表失败:', result.message)
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

const loadCurrentUser = async () => {
  try {
    const response = await fetch('/api/admin/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const result = await response.json()
    if (result.success) {
      currentUser.value = result.user
    }
  } catch (error) {
    console.error('加载当前用户信息失败:', error)
  }
}

onMounted(() => {
  loadUsers()
  loadCurrentUser()
})

// 监听路由变化，确保每次进入页面都重新加载数据
watch(() => router.currentRoute.value.path, () => {
  if (router.currentRoute.value.path === '/admin/users') {
    loadUsers()
    loadCurrentUser()
  }
})

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

const saveUser = async () => {
  try {
    if (!editUserModel.username || !editUserModel.name) {
      alert('请填写用户名和姓名')
      return
    }

    if ((editUserModel.role === 'admin' || editUserModel.role === 'engineer') && 
        !editUserModel.email && !editUserModel.webexId) {
      alert('工程师及管理员必须填写邮箱或Webex ID至少一项，用于接收工单通知和密码重置')
      return
    }

    if (!editUserModel.id && editUserModel.password && !validatePassword(editUserModel.password)) {
      return
    }

    const url = editUserModel.id ? `/api/admin/users/${editUserModel.id}` : '/api/admin/users'
    const method = editUserModel.id ? 'PUT' : 'POST'

    const bodyData: Record<string, any> = {
      username: editUserModel.username,
      name: editUserModel.name,
      role: editUserModel.role,
      area: editUserModel.area,
      email: editUserModel.email,
      webexId: editUserModel.email || editUserModel.webexId
    }

    if (editUserModel.id) {
      bodyData.isActive = users.value.find(u => u.id === editUserModel.id)?.isActive ?? true
    } else if (editUserModel.password) {
      bodyData.password = editUserModel.password
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    })

    const result = await response.json()
    if (result.success) {
      alert('保存成功')
      closeModal()
      loadUsers()
      clearDraft()
    } else {
      alert('保存失败：' + result.message)
    }
  } catch (error) {
    alert('保存失败：网络错误')
  }
}

const toggleUserStatus = async (user: User) => {
  try {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: user.name,
        role: user.role,
        area: user.area,
        isActive: !user.isActive,
        email: user.email || '',
        webexId: user.webexId || ''
      })
    })

    const result = await response.json()
    if (result.success) {
      user.isActive = !user.isActive
      alert(`${user.name}已${user.isActive ? '启用' : '禁用'}`)
    } else {
      alert('操作失败：' + result.message)
    }
  } catch (error) {
    alert('操作失败：网络错误')
  }
}

const deleteUser = async (user: User) => {
  if (!confirm(`确定要删除用户"${user.name}"吗？此操作不可撤销。`)) {
    return
  }

  try {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const result = await response.json()
    if (result.success) {
      alert('用户已删除')
      loadUsers()
    } else {
      alert('删除失败：' + result.message)
    }
  } catch (error) {
    alert('删除失败：网络错误')
  }
}

const handleLogout = () => {
  authApi.logout()
  router.push('/admin/login')
}
</script>
