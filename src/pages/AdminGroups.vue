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
            <a href="/admin/groups" class="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg">
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
        <h1 class="text-2xl font-bold text-gray-800">工程师分组</h1>
        <p class="text-gray-600 mt-2">管理工程师分组和成员分配</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card fade-in" v-for="group in groups" :key="group.id">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">{{ group.name }}</h3>
              <p class="text-gray-500 text-sm">{{ group.description }}</p>
            </div>
            <span :class="group.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ group.isActive ? '启用' : '停用' }}
            </span>
          </div>

          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-600 mb-2">组成员</h4>
            <div class="space-y-2">
              <div v-for="member in group.members" :key="member.id" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User class="w-4 h-4 text-blue-500" />
                  </div>
                  <span>{{ member.name }}</span>
                </div>
                <button @click="removeMember(group.id, member.id)" class="text-gray-400 hover:text-red-500">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <button @click="showAddMemberModal(group)" class="btn-outline w-full">
              <Plus class="w-4 h-4 inline mr-1" />
              添加成员
            </button>
          </div>
        </div>
      </div>

      <div v-if="showMemberModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="card max-w-md mx-4 fade-in">
          <h3 class="text-xl font-bold text-gray-800 mb-4">添加成员到 {{ selectedGroup?.name }}</h3>
          <div>
            <label class="form-label">选择工程师</label>
            <select v-model="selectedEngineer" class="form-select">
              <option value="">请选择工程师</option>
              <option v-for="engineer in availableEngineers" :key="engineer.id" :value="engineer.id">
                {{ engineer.name }}
              </option>
            </select>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="closeMemberModal" class="btn-outline">取消</button>
            <button @click="addMember" class="btn-primary">添加</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { LayoutDashboard, Users, Settings, BarChart3, LogOut, User, Plus, X } from 'lucide-vue-next'
import { authApi } from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()

const groups = ref([
  {
    id: '1',
    name: 'A区维修组',
    area: 'A',
    description: '负责A区所有办公区域、设备报修工单',
    isActive: true,
    members: [
      { id: '1', username: 'chen', name: '陈工', role: 'engineer', area: 'A', isActive: true },
      { id: '2', username: 'wang', name: '王工', role: 'engineer', area: 'A', isActive: true }
    ]
  },
  {
    id: '2',
    name: 'CK区维修组',
    area: 'CK',
    description: '负责CK区所有区域、设备报修工单',
    isActive: true,
    members: [
      { id: '3', username: 'li', name: '李工', role: 'engineer', area: 'CK', isActive: true },
      { id: '4', username: 'zhao', name: '赵工', role: 'engineer', area: 'CK', isActive: false }
    ]
  }
])

const showMemberModal = ref(false)
const selectedGroup = ref<typeof groups.value[0] | null>(null)
const selectedEngineer = ref('')

const allEngineers = ref([
  { id: '1', username: 'chen', name: '陈工', role: 'engineer', area: 'A', isActive: true },
  { id: '2', username: 'wang', name: '王工', role: 'engineer', area: 'A', isActive: true },
  { id: '3', username: 'li', name: '李工', role: 'engineer', area: 'CK', isActive: true },
  { id: '4', username: 'zhao', name: '赵工', role: 'engineer', area: 'CK', isActive: false },
  { id: '5', username: 'sun', name: '孙工', role: 'engineer', area: 'A', isActive: true }
])

const availableEngineers = computed(() => {
  if (!selectedGroup.value) return []
  const memberIds = selectedGroup.value.members.map(m => m.id)
  return allEngineers.value.filter(e => !memberIds.includes(e.id))
})

const showAddMemberModal = (group: typeof groups.value[0]) => {
  selectedGroup.value = group
  selectedEngineer.value = ''
  showMemberModal.value = true
}

const closeMemberModal = () => {
  showMemberModal.value = false
  selectedGroup.value = null
  selectedEngineer.value = ''
}

const addMember = () => {
  if (!selectedGroup.value || !selectedEngineer.value) return
  
  const engineer = allEngineers.value.find(e => e.id === selectedEngineer.value)
  if (engineer) {
    selectedGroup.value.members.push(engineer)
    alert(`已将${engineer.name}添加到${selectedGroup.value.name}`)
  }
  closeMemberModal()
}

const removeMember = (groupId: string, memberId: string) => {
  const group = groups.value.find(g => g.id === groupId)
  if (group) {
    group.members = group.members.filter(m => m.id !== memberId)
    alert('已移除成员')
  }
}

const handleLogout = () => {
  authApi.logout()
  router.push('/admin/login')
}
</script>
