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
            <a href="/admin/projects" class="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg">
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
        <div class="card max-w-md mx-4 fade-in">
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
import { LayoutDashboard, Users, Settings, BarChart3, LogOut, Plus } from 'lucide-vue-next'
import { authApi } from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()

const showAddModal = ref(false)

const editProjectModel = reactive({
  id: '',
  name: '',
  category: '',
  description: '',
  sortOrder: 0,
  isActive: true
})

const projects = ref([
  { id: '1', name: '系统故障', category: '系统故障', description: '操作系统相关故障', sortOrder: 1, isActive: true },
  { id: '2', name: '网络故障', category: '网络故障', description: '网络连接相关故障', sortOrder: 2, isActive: true },
  { id: '3', name: '硬件故障', category: '硬件故障', description: '硬件设备相关故障', sortOrder: 3, isActive: true },
  { id: '4', name: '软件问题', category: '软件问题', description: '应用软件相关问题', sortOrder: 4, isActive: true },
  { id: '5', name: '设备升级', category: '设备升级', description: '设备升级与配置', sortOrder: 5, isActive: true },
  { id: '6', name: '数据恢复', category: '其他', description: '数据恢复服务', sortOrder: 6, isActive: true },
  { id: '7', name: '其他问题', category: '其他', description: '其他未分类问题', sortOrder: 7, isActive: true }
])

const editProject = (project: typeof projects.value[0]) => {
  editProjectModel.id = project.id
  editProjectModel.name = project.name
  editProjectModel.category = project.category
  editProjectModel.description = project.description
  editProjectModel.sortOrder = project.sortOrder
  editProjectModel.isActive = project.isActive
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
}

const saveProject = () => {
  alert('保存成功')
  closeModal()
}

const toggleProjectStatus = (project: typeof projects.value[0]) => {
  project.isActive = !project.isActive
  alert(`${project.name}已${project.isActive ? '启用' : '停用'}`)
}

const handleLogout = () => {
  authApi.logout()
  router.push('/admin/login')
}
</script>
