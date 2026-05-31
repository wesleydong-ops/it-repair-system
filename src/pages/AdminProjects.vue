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
            <a href="/admin/projects" class="flex items-center gap-3 px-4 py-3 bg-darkblue text-white rounded-xl shadow-md">
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
            <h1 class="text-2xl font-bold text-gray-800">维修项目</h1>
            <p class="text-gray-600 mt-2">管理维修项目和故障分类</p>
          </div>
          <button @click="showAddModal = true" class="btn-primary">
            <Plus class="w-4 h-4 inline mr-1" />
            添加项目
          </button>
        </div>
      </header>

      <div class="card fade-in">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">名称</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">分类</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">描述</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">状态</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">排序</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="project in projects" :key="project.id" class="border-b hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-800">{{ project.name }}</td>
                <td class="px-4 py-3">{{ project.category }}</td>
                <td class="px-4 py-3 text-gray-500">{{ project.description }}</td>
                <td class="px-4 py-3">
                  <span :class="project.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ project.isActive ? '启用' : '停用' }}
                  </span>
                </td>
                <td class="px-4 py-3">{{ project.sortOrder }}</td>
                <td class="px-4 py-3">
                  <button @click="editProject(project)" class="text-primary hover:text-blue-600 mr-3">编辑</button>
                  <button @click="toggleProjectStatus(project)" class="text-gray-600 hover:text-red-500">
                    {{ project.isActive ? '停用' : '启用' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="card max-w-md mx-4 fade-in" @input="saveDraft">
          <h3 class="text-xl font-bold text-gray-800 mb-4">{{ editProjectModel.id ? '编辑项目' : '添加项目' }}</h3>
          <div class="space-y-4">
            <div>
              <label class="form-label">项目名称</label>
              <input v-model="editProjectModel.name" type="text" class="form-input" />
            </div>
            <div>
              <label class="form-label">分类</label>
              <select v-model="editProjectModel.category" class="form-select">
                <option value="">请选择分类</option>
                <option value="系统故障">系统故障</option>
                <option value="网络故障">网络故障</option>
                <option value="硬件故障">硬件故障</option>
                <option value="软件问题">软件问题</option>
                <option value="设备升级">设备升级</option>
                <option value="信息安全">信息安全</option>
                <option value="语音通讯">语音通讯</option>
                <option value="资料恢复">资料恢复</option>
                <option value="更新升级">更新升级</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label class="form-label">描述</label>
              <textarea v-model="editProjectModel.description" class="form-textarea" rows="2"></textarea>
            </div>
            <div>
              <label class="form-label">排序</label>
              <input v-model.number="editProjectModel.sortOrder" type="number" class="form-input" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="closeModal" class="btn-outline">取消</button>
            <button @click="saveProject" class="btn-primary">保存</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { LayoutDashboard, Users, Settings, BarChart3, LogOut, Plus, Home } from 'lucide-vue-next'
import { authApi } from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  window.location.href = '/'
}

const showAddModal = ref(false)

const PROJECT_CACHE_KEY = 'admin_project_draft'

const editProjectModel = reactive({
  id: '',
  name: '',
  category: '',
  description: '',
  sortOrder: 0,
  isActive: true
})

const saveDraft = () => {
  try {
    if (editProjectModel.id || editProjectModel.name) {
      sessionStorage.setItem(PROJECT_CACHE_KEY, JSON.stringify(editProjectModel))
    }
  } catch (error) {
    console.error('保存草稿失败')
  }
}

const restoreDraft = (): boolean => {
  try {
    const cached = sessionStorage.getItem(PROJECT_CACHE_KEY)
    if (cached) {
      const draft = JSON.parse(cached)
      Object.assign(editProjectModel, draft)
      return true
    }
  } catch (error) {
    console.error('恢复草稿失败')
  }
  return false
}

const clearDraft = () => {
  try {
    sessionStorage.removeItem(PROJECT_CACHE_KEY)
  } catch (error) {
    console.error('清除草稿失败')
  }
}

const projects = ref<typeof editProjectModel[]>([])

const loadProjects = async () => {
  try {
    const response = await fetch('/api/admin/projects', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const result = await response.json()
    if (result.success) {
      projects.value = result.data
    }
  } catch (error) {
    console.error('加载项目列表失败:', error)
  }
}

loadProjects()

const editProject = (project: typeof projects.value[0]) => {
  const hasDraft = restoreDraft()
  if (hasDraft) {
    if (!confirm('检测到未保存的编辑内容,是否恢复?')) {
      clearDraft()
      editProjectModel.id = project.id
      editProjectModel.name = project.name
      editProjectModel.category = project.category
      editProjectModel.description = project.description
      editProjectModel.sortOrder = project.sortOrder
      editProjectModel.isActive = project.isActive
    }
  } else {
    editProjectModel.id = project.id
    editProjectModel.name = project.name
    editProjectModel.category = project.category
    editProjectModel.description = project.description
    editProjectModel.sortOrder = project.sortOrder
    editProjectModel.isActive = project.isActive
  }
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editProjectModel.id = ''
  editProjectModel.name = ''
  editProjectModel.category = ''
  editProjectModel.description = ''
  editProjectModel.sortOrder = 0
  editProjectModel.isActive = true
  clearDraft()
}

const saveProject = async () => {
  try {
    if (!editProjectModel.name || !editProjectModel.category) {
      alert('请填写项目名称和分类')
      return
    }

    const url = editProjectModel.id ? `/api/admin/projects/${editProjectModel.id}` : '/api/admin/projects'
    const method = editProjectModel.id ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: editProjectModel.name,
        category: editProjectModel.category,
        description: editProjectModel.description,
        sortOrder: editProjectModel.sortOrder,
        isActive: editProjectModel.isActive
      })
    })

    const result = await response.json()
    if (result.success) {
      alert('保存成功')
      closeModal()
      loadProjects()
      clearDraft()
    } else {
      alert('保存失败：' + result.message)
    }
  } catch (error) {
    alert('保存失败：网络错误')
  }
}

const toggleProjectStatus = async (project: typeof projects.value[0]) => {
  try {
    const response = await fetch(`/api/admin/projects/${project.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...project,
        isActive: !project.isActive
      })
    })

    const result = await response.json()
    if (result.success) {
      project.isActive = !project.isActive
      alert(`${project.name}已${project.isActive ? '启用' : '停用'}`)
    } else {
      alert('操作失败：' + result.message)
    }
  } catch (error) {
    alert('操作失败：网络错误')
  }
}

const handleLogout = () => {
  authApi.logout()
  router.push('/admin/login')
}
</script>
