<template>
  <div class="min-h-screen bg-gray-100">
    <AdminSidebar activePath="/admin/groups" />

    <main class="ml-64 p-8">
      <header class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">工程师分组</h1>
            <p class="text-gray-600 mt-2">管理工程师分组和成员分配</p>
          </div>
          <button @click="showCreateGroupModal" class="btn-primary">
            <Plus class="w-4 h-4 inline mr-1" />
            创建分组
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card fade-in" v-for="group in groups" :key="group.id">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">{{ group.name }}</h3>
              <p class="text-gray-500 text-sm">{{ group.description }} · {{ group.area }}区</p>
            </div>
            <div class="flex items-center gap-2">
              <span :class="group.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'" class="px-3 py-1 rounded-full text-sm font-medium">
                {{ group.isActive ? '启用' : '停用' }}
              </span>
              <button @click="showEditGroupModal(group)" class="text-primary hover:text-blue-600 text-sm">编辑</button>
              <button @click="deleteGroup(group)" class="text-red-500 hover:text-red-700 text-sm">删除</button>
            </div>
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
        <div class="card max-w-md mx-4 fade-in" @input="saveDraft">
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

      <!-- 分组创建/编辑模态框 -->
      <div v-if="showGroupModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="card max-w-md mx-4 fade-in">
          <h3 class="text-xl font-bold text-gray-800 mb-4">{{ groupForm.id ? '编辑分组' : '创建分组' }}</h3>
          <div class="space-y-4">
            <div>
              <label class="form-label">分组名称</label>
              <input v-model="groupForm.name" type="text" class="form-input" placeholder="请输入分组名称" />
            </div>
            <div>
              <label class="form-label">所属区域</label>
              <select v-model="groupForm.area" class="form-select">
                <option value="">请选择区域</option>
                <option value="A">A区</option>
                <option value="CK">CK区</option>
              </select>
            </div>
            <div>
              <label class="form-label">描述</label>
              <textarea v-model="groupForm.description" class="form-textarea" rows="3" placeholder="请输入分组描述"></textarea>
            </div>
            <div class="flex items-center gap-2">
              <input v-model="groupForm.isActive" type="checkbox" class="form-checkbox" />
              <label class="text-sm text-gray-600">启用</label>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="closeGroupModal" class="btn-outline">取消</button>
            <button @click="saveGroup" class="btn-primary">保存</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { LayoutDashboard, Users, Settings, BarChart3, LogOut, User, Plus, X, ClipboardList, Home } from 'lucide-vue-next'
import { authApi } from '../api'
import { useRouter } from 'vue-router'

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

const goHome = () => {
  window.location.href = '/'
}

interface Engineer {
  id: string
  username: string
  name: string
  role: string
  area: string
  isActive: boolean
}

interface Group {
  id: string
  name: string
  area: string
  description: string
  isActive: boolean
  members: Engineer[]
}

const groups = ref<Group[]>([])
const allEngineers = ref<Engineer[]>([])

const showMemberModal = ref(false)
const selectedGroup = ref<Group | null>(null)
const selectedEngineer = ref('')

const showGroupModal = ref(false)
const groupForm = ref({
  id: '',
  name: '',
  area: '',
  description: '',
  isActive: true
})

const GROUP_CACHE_KEY = 'admin_group_draft'

const saveDraft = () => {
  try {
    if (selectedGroup.value || selectedEngineer.value) {
      sessionStorage.setItem(GROUP_CACHE_KEY, JSON.stringify({
        selectedGroup: selectedGroup.value,
        selectedEngineer: selectedEngineer.value
      }))
    }
  } catch (error) {
    console.error('保存草稿失败')
  }
}

const restoreDraft = (): boolean => {
  try {
    const cached = sessionStorage.getItem(GROUP_CACHE_KEY)
    if (cached) {
      const draft = JSON.parse(cached)
      selectedGroup.value = draft.selectedGroup
      selectedEngineer.value = draft.selectedEngineer
      return true
    }
  } catch (error) {
    console.error('恢复草稿失败')
  }
  return false
}

const clearDraft = () => {
  try {
    sessionStorage.removeItem(GROUP_CACHE_KEY)
  } catch (error) {
    console.error('清除草稿失败')
  }
}

const loadGroups = async () => {
  try {
    const response = await fetch('/api/admin/groups', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const result = await response.json()
    if (result.success) {
      groups.value = result.data
    }
  } catch (error) {
    console.error('加载分组列表失败:', error)
  }
}

const loadEngineers = async () => {
  try {
    const response = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const result = await response.json()
    if (result.success) {
      allEngineers.value = result.data.filter((u: Engineer) => u.role === 'engineer' && u.isActive)
    }
  } catch (error) {
    console.error('加载工程师列表失败:', error)
  }
}

onMounted(() => {
  loadGroups()
  loadEngineers()
})

const availableEngineers = computed(() => {
  if (!selectedGroup.value) return []
  const memberIds = selectedGroup.value.members.map(m => m.id)
  return allEngineers.value.filter(e => !memberIds.includes(e.id))
})

const showAddMemberModal = async (group: Group) => {
  await loadEngineers()
  const hasDraft = restoreDraft()
  if (hasDraft && selectedGroup.value?.id !== group.id) {
    if (!confirm('检测到未保存的内容,是否恢复?')) {
      clearDraft()
      selectedGroup.value = group
      selectedEngineer.value = ''
    }
  } else {
    selectedGroup.value = group
    selectedEngineer.value = ''
  }
  showMemberModal.value = true
}

const closeMemberModal = () => {
  showMemberModal.value = false
  selectedGroup.value = null
  selectedEngineer.value = ''
  clearDraft()
}

const addMember = async () => {
  if (!selectedGroup.value || !selectedEngineer.value) return
  
  const engineer = allEngineers.value.find(e => e.id === selectedEngineer.value)
  if (engineer) {
    try {
      const response = await fetch(`/api/admin/groups/${selectedGroup.value.id}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: selectedEngineer.value })
      })

      const result = await response.json()
      if (result.success) {
        selectedGroup.value.members.push(engineer)
        alert(`已将${engineer.name}添加到${selectedGroup.value.name}`)
        clearDraft()
        closeMemberModal()
      } else {
        alert('添加失败：' + result.message)
      }
    } catch (error) {
      alert('添加失败：网络错误')
    }
  }
}

const removeMember = async (groupId: string, memberId: string) => {
  const group = groups.value.find(g => g.id === groupId)
  if (group) {
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const result = await response.json()
      if (result.success) {
        group.members = group.members.filter(m => m.id !== memberId)
        alert('已移除成员')
      } else {
        alert('移除失败：' + result.message)
      }
    } catch (error) {
      alert('移除失败：网络错误')
    }
  }
}

const showCreateGroupModal = () => {
  groupForm.value = {
    id: '',
    name: '',
    area: '',
    description: '',
    isActive: true
  }
  showGroupModal.value = true
}

const showEditGroupModal = (group: Group) => {
  groupForm.value = {
    id: group.id,
    name: group.name,
    area: group.area,
    description: group.description,
    isActive: group.isActive
  }
  showGroupModal.value = true
}

const closeGroupModal = () => {
  showGroupModal.value = false
  groupForm.value = {
    id: '',
    name: '',
    area: '',
    description: '',
    isActive: true
  }
}

const saveGroup = async () => {
  if (!groupForm.value.name || !groupForm.value.area) {
    alert('请填写分组名称和区域')
    return
  }

  try {
    const url = groupForm.value.id
      ? `/api/admin/groups/${groupForm.value.id}`
      : '/api/admin/groups'
    const method = groupForm.value.id ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: groupForm.value.name,
        area: groupForm.value.area,
        description: groupForm.value.description,
        isActive: groupForm.value.isActive
      })
    })

    const result = await response.json()
    if (result.success) {
      alert(groupForm.value.id ? '分组已更新' : '分组已创建')
      closeGroupModal()
      await loadGroups()
    } else {
      alert('保存失败：' + result.message)
    }
  } catch (error) {
    alert('保存失败：网络错误')
  }
}

const deleteGroup = async (group: Group) => {
  if (!confirm(`确定要删除分组"${group.name}"吗？此操作不可撤销。`)) {
    return
  }

  try {
    const response = await fetch(`/api/admin/groups/${group.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const result = await response.json()
    if (result.success) {
      alert('分组已删除')
      await loadGroups()
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
