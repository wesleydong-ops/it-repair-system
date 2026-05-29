<template>
  <div class="min-h-screen bg-gray-100">
    <aside class="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg">
      <div class="p-6 border-b">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="FoxLink" class="w-16 h-6 object-contain drop-shadow-md" />
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
            <a href="/admin/users" class="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg">
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
            <a href="/admin/statistics" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <BarChart3 class="w-5 h-5" />
              数据统计
            </a>
          </li>
          <li>
            <a href="/admin/settings" class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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
              <option value="operator">运维管理员</option>
              <option value="engineer">工程师</option>
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
          <div class="relative">
            <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="filters.search"
              type="text"
              class="form-input pl-10 w-64"
              placeholder="搜索用户名或姓名..."
            />
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
                  <button @click="toggleUserStatus(user)" class="text-gray-600 hover:text-red-500">
                    {{ user.isActive ? '禁用' : '启用' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="card max-w-md mx-4 fade-in">
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
                <option value="operator">运维管理员</option>
                <option value="engineer">工程师</option>
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
            <div v-if="!editUserModel.id">
              <label class="form-label">密码</label>
              <input v-model="editUserModel.password" type="password" class="form-input" />
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
import { ref, reactive } from 'vue'
import { LayoutDashboard, Users, Settings, BarChart3, LogOut, Plus, Search } from 'lucide-vue-next'
import { authApi } from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()

const filters = reactive({
  role: '',
  area: '',
  status: '',
  search: ''
})

const showAddModal = ref(false)

const editUserModel = reactive({
  id: '',
  username: '',
  name: '',
  role: 'user',
  area: '',
  password: ''
})

const users = ref([
  { id: '1', username: 'admin', name: '管理员', role: 'admin', area: '', isActive: true, createTime: '2024-01-01 09:00:00' },
  { id: '2', username: 'chen', name: '陈工', role: 'engineer', area: 'A', isActive: true, createTime: '2024-01-02 10:00:00' },
  { id: '3', username: 'li', name: '李工', role: 'engineer', area: 'CK', isActive: true, createTime: '2024-01-03 11:00:00' },
  { id: '4', username: 'wang', name: '王工', role: 'engineer', area: 'A', isActive: true, createTime: '2024-01-04 14:00:00' },
  { id: '5', username: 'zhao', name: '赵工', role: 'engineer', area: 'CK', isActive: false, createTime: '2024-01-05 15:00:00' },
  { id: '6', username: 'operator', name: '运维员', role: 'operator', area: '', isActive: true, createTime: '2024-01-06 09:00:00' }
])

const getRoleText = (role: string) => {
  const texts: Record<string, string> = {
    admin: '超级管理员',
    operator: '运维管理员',
    engineer: '工程师',
    user: '普通用户'
  }
  return texts[role] || role
}

const formatDate = (dateStr: string) => {
  return dateStr.split(' ')[0]
}

const editUser = (user: typeof users.value[0]) => {
  editUserModel.id = user.id
  editUserModel.username = user.username
  editUserModel.name = user.name
  editUserModel.role = user.role
  editUserModel.area = user.area || ''
  editUserModel.password = ''
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
}

const saveUser = () => {
  alert('保存成功')
  closeModal()
}

const toggleUserStatus = (user: typeof users.value[0]) => {
  user.isActive = !user.isActive
  alert(`${user.name}已${user.isActive ? '启用' : '禁用'}`)
}

const handleLogout = () => {
  authApi.logout()
  router.push('/admin/login')
}
</script>
