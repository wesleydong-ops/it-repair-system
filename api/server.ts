import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import path from 'path'
import https from 'https'
import fs from 'fs'
import nodemailer from 'nodemailer'
import multer from 'multer'
import crypto from 'crypto'
import { config } from './config'

const app = express()

app.use(cors())
app.use(express.json())

const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ success: false, message: '未授权' })
  }
  
  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '无效的token' })
    }
    (req as any).user = user
    next()
  })
}

// 角色权限检查中间件
const requireRole = (...roles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ success: false, message: '权限不足' })
    }
    next()
  }
}

const DATA_DIR = path.join(process.cwd(), 'data')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')
const CERTS_DIR = path.join(process.cwd(), 'certs')

// 确保目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}
if (!fs.existsSync(CERTS_DIR)) {
  fs.mkdirSync(CERTS_DIR, { recursive: true })
}

// 通用 JSON 读写工具
const loadJSON = <T>(filePath: string, defaultValue: T, label: string): T => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    }
    saveJSON(filePath, defaultValue, label)
    return defaultValue
  } catch (error) {
    console.error(`加载${label}数据失败:`, error)
    return defaultValue
  }
}

const saveJSON = (filePath: string, data: unknown, label: string): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    console.log(`${label}数据已保存`)
  } catch (error) {
    console.error(`保存${label}数据失败:`, error)
  }
}

const defaultSettings = {
  smtpHost: 'smtp.example.com',
  smtpPort: 25,
  smtpUsername: 'it-support@example.com',
  smtpPassword: '',
  smtpSecure: false,
  webexToken: '',
  webexRoomId: '',
  extensionServer: 'pbx.example.com',
  extensionPort: 5060,
  systemUrl: 'https://localhost:8443',
  httpsPort: 8443,
  certPath: './certs',
  certPassword: '',
  certFileName: '',
  chainFileName: '',
  keyFileName: ''
}

const loadSettings = (): typeof defaultSettings => {
  return loadJSON(SETTINGS_FILE, defaultSettings, '设置')
}

const saveSettings = (settings: typeof defaultSettings): void => {
  saveJSON(SETTINGS_FILE, settings, '设置')
}

const systemSettings = loadSettings()

// 文件上传配置（限制大小和类型）
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, CERTS_DIR)
  },
  filename: (_req, file, cb) => {
    // 使用 path.basename 去除路径部分，防止路径遍历攻击
    const safeName = path.basename(file.originalname)
    cb(null, safeName)
  }
})
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 最大 5MB
  fileFilter: (_req, file, cb) => {
    const allowedExts = ['.pem', '.crt', '.key', '.cer', '.pfx']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedExts.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型，仅支持 .pem/.crt/.key/.cer/.pfx'))
    }
  }
})

const WORKORDERS_FILE = path.join(DATA_DIR, 'workorders.json')
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')
const GROUPS_FILE = path.join(DATA_DIR, 'groups.json')

const defaultProjects = [
  { id: '1', name: '系统故障', category: '系统故障', description: '操作系统相关故障', sortOrder: 1, isActive: true },
  { id: '2', name: '网络故障', category: '网络故障', description: '网络连接相关故障', sortOrder: 2, isActive: true },
  { id: '3', name: '硬件故障', category: '硬件故障', description: '硬件设备相关故障', sortOrder: 3, isActive: true },
  { id: '4', name: '软件问题', category: '软件问题', description: '应用软件相关问题', sortOrder: 4, isActive: true },
  { id: '5', name: '设备升级', category: '设备升级', description: '设备升级与配置', sortOrder: 5, isActive: true },
  { id: '6', name: '信息安全', category: '信息安全', description: '信息安全相关问题', sortOrder: 6, isActive: true },
  { id: '7', name: '语音通讯', category: '语音通讯', description: '语音通讯相关问题', sortOrder: 7, isActive: true },
  { id: '8', name: '资料恢复', category: '资料恢复', description: '资料恢复服务', sortOrder: 8, isActive: true },
  { id: '9', name: '更新升级', category: '更新升级', description: '系统更新与升级', sortOrder: 9, isActive: true },
  { id: '10', name: '其他问题', category: '其他', description: '其他未分类问题', sortOrder: 10, isActive: true }
]

interface Project {
  id: string
  name: string
  category: string
  description: string
  sortOrder: number
  isActive: boolean
}

const loadProjects = (): Project[] => {
  return loadJSON(PROJECTS_FILE, defaultProjects, '项目')
}

const saveProjects = (projectList: Project[]): void => {
  saveJSON(PROJECTS_FILE, projectList, '项目')
}

interface GroupMember {
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
  members: GroupMember[]
}

const defaultGroups: Group[] = [
  { id: '1', name: 'A区维修组', area: 'A', description: '负责A区所有办公区域、设备报修工单', isActive: true, members: [] },
  { id: '2', name: 'CK区维修组', area: 'CK', description: '负责CK区所有区域、设备报修工单', isActive: true, members: [] }
]

const loadGroups = (): Group[] => {
  return loadJSON(GROUPS_FILE, defaultGroups, '分组')
}

const saveGroups = (groupList: Group[]): void => {
  saveJSON(GROUPS_FILE, groupList, '分组')
}

const groups = loadGroups()
const projects = loadProjects()

interface WorkOrder {
  id: string
  orderNo: string
  applicantName: string
  department: string
  location: string
  extension: string
  email: string
  webexId: string
  assetNo: string
  deviceType: string
  deviceLocation: string
  projectId: string
  projectName: string
  description: string
  repairType: string
  notificationChannels: string[]
  priority: string
  status: string
  area: string
  engineerId: string
  engineerName: string
  statusLog: string
  createTime: string
  updateTime: string
  externalReason: string
  externalParts: string
  externalCost: number
  externalCompany: string
  repairRecord: string
  faultReason: string
  solution: string
}

const loadWorkorders = (): WorkOrder[] => {
  return loadJSON(WORKORDERS_FILE, defaultWorkorders, '工单')
}

const saveWorkorders = (orders: WorkOrder[]): void => {
  saveJSON(WORKORDERS_FILE, orders, '工单')
}

const defaultWorkorders: WorkOrder[] = []

const workorders = loadWorkorders()

const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: systemSettings.smtpHost,
    port: systemSettings.smtpPort,
    secure: systemSettings.smtpSecure,
    auth: {
      user: systemSettings.smtpUsername,
      pass: systemSettings.smtpPassword
    }
  })
}

const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    if (!systemSettings.smtpPassword) {
      console.log('邮件发送跳过：SMTP密码未配置')
      return true
    }
    
    const transporter = createEmailTransporter()
    const info = await transporter.sendMail({
      from: `"IT报修系统" <${systemSettings.smtpUsername}>`,
      to,
      subject,
      html
    })
    console.log(`邮件发送成功: ${info.messageId}`)
    return true
  } catch (error) {
    console.error('邮件发送失败:', error)
    return false
  }
}

const USERS_FILE = path.join(DATA_DIR, 'users.json')

interface User {
  id: string
  username: string
  password: string
  name: string
  role: string
  area: string
  email: string
  webexId: string
  isActive: boolean
  createTime: string
}

const defaultUsers: User[] = [
  { id: '1', username: 'admin', password: bcrypt.hashSync('admin123', 10), name: '管理员', role: 'admin', area: '', email: 'admin@foxlink.com', webexId: 'admin', isActive: true, createTime: '2024-01-01 09:00:00' }
]

const loadUsers = (): User[] => {
  return loadJSON(USERS_FILE, defaultUsers, '用户')
}

const saveUsers = (userList: User[]): void => {
  saveJSON(USERS_FILE, userList, '用户')
}

const users = loadUsers()

const verificationCodes: Record<string, { code: string; expiresAt: number }> = {}

// 定期清理过期的验证码（每分钟清理一次）
setInterval(() => {
  const now = Date.now()
  for (const [email, data] of Object.entries(verificationCodes)) {
    if (now > data.expiresAt) {
      delete verificationCodes[email]
    }
  }
}, 60000)

const validatePassword = (password: string): boolean => {
  if (password.length < 6) {
    return false
  }
  if (!/[A-Z]/.test(password)) {
    return false
  }
  if (!/[a-z]/.test(password)) {
    return false
  }
  if (!/[0-9]/.test(password)) {
    return false
  }
  return true
}

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body
  
  const user = users.find(u => u.username === username)
  
  if (!user) {
    return res.status(401).json({ success: false, message: '用户名不存在' })
  }
  
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, message: '密码错误' })
  }
  
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: '1h' })
  
  res.json({
    success: true,
    token,
    user: { id: user.id, username: user.username, name: user.name, role: user.role, area: user.area }
  })
})

app.post('/api/admin/forgot-password', async (req, res) => {
  const { email } = req.body
  
  const user = users.find(u => u.email === email)
  
  if (!user) {
    return res.json({ success: false, message: '该邮箱未注册' })
  }
  
  const code = crypto.randomBytes(3).toString('hex').substring(0, 6).toUpperCase()
  const expiresAt = Date.now() + 300000
  
  verificationCodes[email] = { code, expiresAt }
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1E3A5F; border-bottom: 2px solid #6BB3D9; padding-bottom: 10px;">IT报修系统 - 密码重置</h2>
      <p>尊敬的 ${user.name} 先生/女士：</p>
      <p>您正在进行密码重置操作，以下是您的验证码：</p>
      <div style="background: #f8fafc; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
        <span style="font-size: 32px; font-weight: bold; color: #1E3A5F;">${code}</span>
      </div>
      <p>验证码有效期为5分钟，请及时使用。</p>
      <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
    </div>
  `
  
  await sendEmail(email, 'IT报修系统 - 密码重置验证码', emailHtml)
  
  res.json({ success: true, message: '验证码已发送至您的邮箱' })
})

app.post('/api/admin/verify-code', (req, res) => {
  const { email, code } = req.body
  
  const stored = verificationCodes[email]
  
  if (!stored) {
    return res.json({ success: false, message: '请先获取验证码' })
  }
  
  if (Date.now() > stored.expiresAt) {
    delete verificationCodes[email]
    return res.json({ success: false, message: '验证码已过期，请重新获取' })
  }
  
  if (stored.code !== code.toUpperCase()) {
    return res.json({ success: false, message: '验证码错误' })
  }
  
  res.json({ success: true, message: '验证码验证成功' })
})

app.post('/api/admin/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body
  
  const stored = verificationCodes[email]
  
  if (!stored) {
    return res.json({ success: false, message: '请先获取验证码' })
  }
  
  if (Date.now() > stored.expiresAt) {
    delete verificationCodes[email]
    return res.json({ success: false, message: '验证码已过期，请重新获取' })
  }
  
  if (stored.code !== code.toUpperCase()) {
    return res.json({ success: false, message: '验证码错误' })
  }
  
  if (!validatePassword(newPassword)) {
    return res.json({ success: false, message: '密码必须至少6位，且包含大小写字母和数字' })
  }
  
  const userIndex = users.findIndex(u => u.email === email)

  if (userIndex === -1) {
    return res.json({ success: false, message: '用户不存在' })
  }

  users[userIndex].password = bcrypt.hashSync(newPassword, 10)
  saveUsers(users)
  
  delete verificationCodes[email]
  
  res.json({ success: true, message: '密码重置成功，请使用新密码登录' })
})

app.get('/api/admin/me', authenticateToken, (req, res) => {
  const userId = (req as any).user.id
  const user = users.find(u => u.id === userId)

  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' })
  }

  res.json({
    success: true,
    user: { id: user.id, username: user.username, name: user.name, role: user.role }
  })
})

app.get('/api/admin/users', authenticateToken, requireRole('admin'), (_req, res) => {
  res.json({
    success: true,
    data: users.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      area: u.area,
      email: u.email,
      webexId: u.webexId,
      isActive: u.isActive,
      createTime: u.createTime
    }))
  })
})

app.post('/api/admin/users', authenticateToken, requireRole('admin'), (req, res) => {
  const { username, name, role, area, email, webexId, password } = req.body
  
  if (!email && !webexId) {
    return res.json({ success: false, message: '请至少填写邮箱或Webex ID中的一项' })
  }
  
  if (password && !validatePassword(password)) {
    return res.json({ success: false, message: '密码必须至少6位，且包含大小写字母和数字' })
  }
  
  const newUser: User = {
    id: Date.now().toString(),
    username,
    password: bcrypt.hashSync(password || 'Admin1', 10),
    name,
    role,
    area: area || '',
    email: email || '',
    webexId: webexId || '',
    isActive: true,
    createTime: new Date().toLocaleString('zh-CN')
  }
  
  users.push(newUser)
  saveUsers(users)
  
  res.json({ success: true, data: { ...newUser, password: '' } })
})

app.put('/api/admin/users/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params
  const { name, role, area, isActive, email, webexId } = req.body

  const userIndex = users.findIndex(u => u.id === id)

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: '用户不存在' })
  }

  users[userIndex] = {
    ...users[userIndex],
    name,
    role,
    area,
    isActive,
    email: email || users[userIndex].email,
    webexId: webexId || users[userIndex].webexId
  }

  saveUsers(users)

  res.json({ success: true, data: { ...users[userIndex], password: '' } })
})

app.delete('/api/admin/users/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params

  const userIndex = users.findIndex(u => u.id === id)

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: '用户不存在' })
  }

  users.splice(userIndex, 1)
  saveUsers(users)

  res.json({ success: true, message: '删除成功' })
})

app.post('/api/workorder/submit', async (req, res) => {
  const { applicantName, department, location, extension, email, webexId, assetNo, deviceType, deviceLocation, projectId, description, repairType, notificationChannels, priority, area } = req.body

  // 自动派单：查找对应区域的分组，按组内工程师当前工单数最少的分配
  // 注意：新工单保持 pending 状态，工程师可以抢单
  let assignedEngineerId = ''
  let assignedEngineerName = ''
  let orderStatus = 'pending' // 保持 pending 状态，允许工程师抢单

  const matchedGroup = groups.find(g => String(g.area).trim() === String(area).trim() && g.isActive)
  
  if (matchedGroup && matchedGroup.members.length > 0) {
    // 获取组内活跃工程师
    const activeMembers = matchedGroup.members.filter(m => m.isActive)
    
    if (activeMembers.length > 0) {
      // 优化：单次遍历统计所有工程师的工作量
      // 包含已接单、处理中、以及已分配但未接单的 pending 工单
      const engineerLoad = new Map<string, number>()
      for (const order of workorders) {
        if (order.engineerId && (order.status === 'accepted' || order.status === 'processing' || order.status === 'pending')) {
          engineerLoad.set(order.engineerId, (engineerLoad.get(order.engineerId) || 0) + 1)
        }
      }
      
      // 选择工单数最少的工程师（平均派单）
      let minLoad = Infinity
      let selectedMember = activeMembers[0]
      for (const member of activeMembers) {
        const load = engineerLoad.get(member.id) || 0
        if (load < minLoad) {
          minLoad = load
          selectedMember = member
        }
      }
      
      // 记录预分配工程师信息，但不改变工单状态
      assignedEngineerId = selectedMember.id
      assignedEngineerName = selectedMember.name
      // 保持 orderStatus = 'pending'，让工程师可以抢单
    }
  }
  
  const newOrder = {
    id: Date.now().toString(),
    orderNo: `WO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(workorders.length + 1).padStart(3, '0')}`,
    applicantName,
    department,
    location,
    extension,
    email,
    webexId,
    assetNo,
    deviceType,
    deviceLocation,
    projectId,
    projectName: ['系统故障', '网络故障', '硬件故障', '软件问题', '设备升级', '信息安全', '语音通讯', '资料恢复', '更新升级', '其他问题'][parseInt(projectId) - 1] || '其他问题',
    description,
    repairType,
    notificationChannels,
    priority,
    status: orderStatus,
    area,
    engineerId: assignedEngineerId,
    engineerName: assignedEngineerName,
    statusLog: assignedEngineerId ? `系统自动派单给${assignedEngineerName}` : '',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
    externalReason: '',
    externalParts: '',
    externalCost: 0,
    externalCompany: '',
    repairRecord: '',
    faultReason: '',
    solution: ''
  }
  
  workorders.push(newOrder)
  saveWorkorders(workorders)
  
  if (notificationChannels.includes('email') && email) {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1E3A5F; border-bottom: 2px solid #6BB3D9; padding-bottom: 10px;">IT报修系统 - 工单提交成功</h2>
        <p>尊敬的 ${applicantName} 先生/女士：</p>
        <p>您的报修工单已成功提交，以下是工单详情：</p>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>工单号：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${newOrder.orderNo}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>设备类型：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${deviceType}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>资产编号：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${assetNo}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>紧急等级：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${priority === 'urgent' ? '紧急' : '普通'}</td></tr>
          <tr><td style="padding: 8px;"><strong>故障描述：</strong></td><td style="padding: 8px;">${description}</td></tr>
        </table>
        <p>系统将尽快为您分配工程师处理，请保持通讯畅通。</p>
        <p>您可以通过以下链接查看工单进度：</p>
        <p><a href="${systemSettings.systemUrl}/workorder/${newOrder.id}" style="color: #6BB3D9; text-decoration: none;">${systemSettings.systemUrl}/workorder/${newOrder.id}</a></p>
        <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    `
    sendEmail(email, `工单提交成功 - ${newOrder.orderNo}`, emailHtml)
  }
  
  res.json({ success: true, orderNo: newOrder.orderNo, message: '工单提交成功' })
})

app.get('/api/workorder/list', authenticateToken, (req, res) => {
  const { status, area, priority, search, page = 1, size = 10 } = req.query
  const keyword = search ? String(search).toLowerCase() : null
  
  // 单次遍历，避免多次 filter 产生中间数组
  const matched: WorkOrder[] = []
  for (const o of workorders) {
    if (status && o.status !== status) continue
    if (area && o.area !== area) continue
    if (priority && o.priority !== priority) continue
    if (keyword) {
      const hay = `${o.orderNo} ${o.applicantName} ${o.department} ${o.description}`.toLowerCase()
      if (!hay.includes(keyword)) continue
    }
    matched.push(o)
  }
  
  const start = (Number(page) - 1) * Number(size)
  res.json({
    success: true,
    data: matched.slice(start, start + Number(size)),
    total: matched.length
  })
})

// 首页公开接口（无需认证）
app.get('/api/home/stats', (_req, res) => {
  // 按自然月统计（当月）
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  let monthlyCount = 0
  let monthlyCompleted = 0
  let areaA = 0
  let areaCK = 0
  let totalDuration = 0
  let durationCount = 0

  for (const order of workorders) {
    if (!order.createTime) continue
    const orderMonth = order.createTime.substring(0, 7)
    if (orderMonth !== currentMonth) continue

    monthlyCount++
    if (order.area === 'A') areaA++
    if (order.area === 'CK') areaCK++
    if (order.status === 'completed' || order.status === 'closed') {
      monthlyCompleted++
      // 计算维修时长（创建时间到更新时间的小时差）
      if (order.updateTime) {
        const create = new Date(order.createTime).getTime()
        const update = new Date(order.updateTime).getTime()
        if (!isNaN(create) && !isNaN(update)) {
          totalDuration += (update - create) / (1000 * 60 * 60)
          durationCount++
        }
      }
    }
  }

  // 最近3笔工单
  const recent = [...workorders]
    .sort((a, b) => {
      const dateA = new Date(a.createTime).getTime()
      const dateB = new Date(b.createTime).getTime()
      return dateB - dateA
    })
    .slice(0, 3)
    .map(o => ({
      id: o.id,
      orderNo: o.orderNo,
      applicantName: o.applicantName,
      deviceType: o.deviceType,
      status: o.status
    }))

  // 统计各区域工程师人数
  const engineers = users.filter(u => u.role === 'engineer' && u.isActive)
  const engineerAreaA = engineers.filter(u => u.area === 'A').length
  const engineerAreaCK = engineers.filter(u => u.area === 'CK').length

  res.json({
    success: true,
    data: {
      monthlyOrders: monthlyCount,
      completedCount: monthlyCompleted,
      completionRate: monthlyCount > 0 ? Math.round((monthlyCompleted / monthlyCount) * 100) : 0,
      avgDuration: durationCount > 0 ? Math.round((totalDuration / durationCount) * 10) / 10 : 0,
      areaStats: { A: areaA, CK: areaCK },
      engineerStats: { A: engineerAreaA, CK: engineerAreaCK, total: engineers.length },
      recentOrders: recent
    }
  })
})

app.get('/api/workorder/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  
  const order = workorders.find(o => o.id === id)
  
  if (!order) {
    return res.status(404).json({ success: false, message: '工单不存在' })
  }
  
  res.json({ success: true, data: order })
})

app.post('/api/workorder/:id/accept', authenticateToken, async (req, res) => {
  const { id } = req.params
  const userId = (req as any).user.id
  
  const order = workorders.find(o => o.id === id)
  
  if (!order) {
    return res.status(404).json({ success: false, message: '工单不存在' })
  }
  
  if (order.status !== 'pending') {
    return res.status(400).json({ success: false, message: '工单状态不允许接单' })
  }

  const user = users.find(u => u.id === userId)

  order.status = 'accepted'
  order.engineerId = userId
  order.engineerName = user?.name || ''
  order.updateTime = new Date().toLocaleString('zh-CN')
  saveWorkorders(workorders)

  if (user?.email) {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1E3A5F; border-bottom: 2px solid #6BB3D9; padding-bottom: 10px;">IT报修系统 - 新工单通知</h2>
        <p>尊敬的 ${user.name} 先生/女士：</p>
        <p>您有新的报修工单需要处理：</p>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>工单号：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.orderNo}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>设备类型：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.deviceType}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>申请人：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.applicantName}</td></tr>
          <tr><td style="padding: 8px;"><strong>故障描述：</strong></td><td style="padding: 8px;">${order.description}</td></tr>
        </table>
        <p>请尽快处理工单。</p>
        <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    `
    sendEmail(user.email, `新工单通知 - ${order.orderNo}`, emailHtml)
  }
  
  res.json({ success: true, message: '接单成功' })
})

app.post('/api/workorder/:id/start', authenticateToken, (req, res) => {
  const { id } = req.params
  
  const order = workorders.find(o => o.id === id)
  
  if (!order) {
    return res.status(404).json({ success: false, message: '工单不存在' })
  }
  
  if (order.status !== 'accepted') {
    return res.status(400).json({ success: false, message: '工单状态不允许开始处理' })
  }
  
  order.status = 'processing'
  order.updateTime = new Date().toLocaleString('zh-CN')
  saveWorkorders(workorders)
  
  res.json({ success: true, message: '开始处理' })
})

app.post('/api/workorder/:id/complete', authenticateToken, (req, res) => {
  const { id } = req.params
  const { repairRecord, faultReason, solution } = req.body
  
  const order = workorders.find(o => o.id === id)
  
  if (!order) {
    return res.status(404).json({ success: false, message: '工单不存在' })
  }
  
  if (order.status !== 'processing') {
    return res.status(400).json({ success: false, message: '工单状态不允许完成' })
  }
  
  order.status = 'completed'
  order.repairRecord = repairRecord
  order.faultReason = faultReason
  order.solution = solution
  order.updateTime = new Date().toLocaleString('zh-CN')
  saveWorkorders(workorders)
  
  res.json({ success: true, message: '维修完成' })
})

app.post('/api/workorder/:id/close', authenticateToken, async (req, res) => {
  const { id } = req.params
  
  const order = workorders.find(o => o.id === id)
  
  if (!order) {
    return res.status(404).json({ success: false, message: '工单不存在' })
  }
  
  if (order.status !== 'completed') {
    return res.status(400).json({ success: false, message: '工单状态不允许结案' })
  }
  
  order.status = 'closed'
  order.updateTime = new Date().toLocaleString('zh-CN')
  saveWorkorders(workorders)
  
  if (order.notificationChannels.includes('email') && order.email) {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1E3A5F; border-bottom: 2px solid #6BB3D9; padding-bottom: 10px;">IT报修系统 - 工单已结案</h2>
        <p>尊敬的 ${order.applicantName} 先生/女士：</p>
        <p>您提交的报修工单已完成结案，以下是工单详情：</p>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>工单号：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.orderNo}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>设备类型：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.deviceType}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>资产编号：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.assetNo}</td></tr>
          ${order.faultReason ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>故障原因：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.faultReason}</td></tr>` : ''}
          ${order.solution ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>处理方案：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.solution}</td></tr>` : ''}
          ${order.repairRecord ? `<tr><td style="padding: 8px;"><strong>维修记录：</strong></td><td style="padding: 8px;">${order.repairRecord}</td></tr>` : ''}
        </table>
        <p>感谢您使用IT报修系统，如有其他问题请随时提交新工单。</p>
        <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    `
    try {
      await sendEmail(order.email, `工单已结案 - ${order.orderNo}`, emailHtml)
    } catch (error) {
      console.error('发送结案通知邮件失败:', error)
    }
  }
  
  res.json({ success: true, message: '结案成功，已通知开单人' })
})

app.post('/api/workorder/:id/external', authenticateToken, async (req, res) => {
  const { id } = req.params
  const { reason, parts, estimatedCost, repairCompany } = req.body
  
  const order = workorders.find(o => o.id === id)
  
  if (!order) {
    return res.status(404).json({ success: false, message: '工单不存在' })
  }
  
  if (order.status !== 'processing') {
    return res.status(400).json({ success: false, message: '工单状态不允许申请外修' })
  }
  
  order.status = 'external_pending'
  order.externalReason = reason
  order.externalParts = parts
  order.externalCost = estimatedCost
  order.externalCompany = repairCompany
  order.updateTime = new Date().toLocaleString('zh-CN')
  saveWorkorders(workorders)
  
  const purchaseUsers = users.filter(u => u.role === 'purchaser' && u.isActive)
  for (const user of purchaseUsers) {
    if (user.email) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1E3A5F; border-bottom: 2px solid #6BB3D9; padding-bottom: 10px;">IT报修系统 - 外修申请通知</h2>
          <p>尊敬的 ${user.name} 先生/女士：</p>
          <p>有新的外修申请需要处理：</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>工单号：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.orderNo}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>设备类型：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.deviceType}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>外修原因：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${reason}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>所需配件：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${parts}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>预估费用：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${estimatedCost} 元</td></tr>
            <tr><td style="padding: 8px;"><strong>送修单位：</strong></td><td style="padding: 8px;">${repairCompany}</td></tr>
          </table>
          <p>请尽快处理外修申请。</p>
          <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
        </div>
      `
      try {
        await sendEmail(user.email, `外修申请通知 - ${order.orderNo}`, emailHtml)
      } catch (error) {
        console.error('发送外修通知邮件失败:', error)
      }
    }
  }
  
  res.json({ success: true, message: '外修申请已提交，请等待采购处理' })
})

app.post('/api/workorder/:id/external/start', authenticateToken, (req, res) => {
  const { id } = req.params
  
  const order = workorders.find(o => o.id === id)
  
  if (!order) {
    return res.status(404).json({ success: false, message: '工单不存在' })
  }
  
  if (order.status !== 'external_pending') {
    return res.status(400).json({ success: false, message: '工单状态不允许开始外修' })
  }
  
  order.status = 'external_processing'
  order.updateTime = new Date().toLocaleString('zh-CN')
  saveWorkorders(workorders)
  
  res.json({ success: true, message: '外修处理中' })
})

// 采购员驳回外修申请
app.post('/api/workorder/:id/external/reject', authenticateToken, (req, res) => {
  const { id } = req.params
  const { reason } = req.body
  
  const order = workorders.find(o => o.id === id)
  
  if (!order) {
    return res.status(404).json({ success: false, message: '工单不存在' })
  }
  
  if (order.status !== 'external_pending') {
    return res.status(400).json({ success: false, message: '工单状态不允许驳回' })
  }
  
  order.status = 'external_rejected'
  order.externalReason = reason || '外修申请被驳回'
  order.updateTime = new Date().toLocaleString('zh-CN')
  saveWorkorders(workorders)
  
  res.json({ success: true, message: '已驳回外修申请' })
})

app.post('/api/workorder/:id/external/complete', authenticateToken, (req, res) => {
  const { id } = req.params
  const { repairRecord, faultReason, solution } = req.body
  
  const order = workorders.find(o => o.id === id)
  
  if (!order) {
    return res.status(404).json({ success: false, message: '工单不存在' })
  }
  
  if (order.status !== 'external_processing') {
    return res.status(400).json({ success: false, message: '工单状态不允许完成外修' })
  }
  
  order.status = 'completed'
  order.repairRecord = repairRecord
  order.faultReason = faultReason
  order.solution = solution
  order.updateTime = new Date().toLocaleString('zh-CN')
  saveWorkorders(workorders)
  
  res.json({ success: true, message: '外修完成' })
})

app.get('/api/admin/groups', authenticateToken, requireRole('admin'), (_req, res) => {
  res.json({ success: true, data: groups })
})

app.post('/api/admin/groups', authenticateToken, requireRole('admin'), (req, res) => {
  const { name, area, description } = req.body
  
  if (!name || !area) {
    return res.status(400).json({ success: false, message: '分组名称和区域不能为空' })
  }
  
  const newGroup: Group = {
    id: Date.now().toString(),
    name,
    area,
    description: description || '',
    isActive: true,
    members: []
  }
  
  groups.push(newGroup)
  saveGroups(groups)
  
  res.json({ success: true, message: '分组创建成功', data: newGroup })
})

app.put('/api/admin/groups/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params
  const { name, area, description, isActive } = req.body
  
  const groupIndex = groups.findIndex(g => g.id === id)
  
  if (groupIndex === -1) {
    return res.status(404).json({ success: false, message: '分组不存在' })
  }
  
  groups[groupIndex] = {
    ...groups[groupIndex],
    name: name || groups[groupIndex].name,
    area: area || groups[groupIndex].area,
    description: description !== undefined ? description : groups[groupIndex].description,
    isActive: isActive !== undefined ? isActive : groups[groupIndex].isActive
  }
  
  saveGroups(groups)
  
  res.json({ success: true, message: '分组更新成功', data: groups[groupIndex] })
})

app.delete('/api/admin/groups/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params
  
  const groupIndex = groups.findIndex(g => g.id === id)
  
  if (groupIndex === -1) {
    return res.status(404).json({ success: false, message: '分组不存在' })
  }
  
  groups.splice(groupIndex, 1)
  saveGroups(groups)
  
  res.json({ success: true, message: '分组删除成功' })
})

app.post('/api/admin/groups/:id/members', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params
  const { userId } = req.body

  const user = users.find(u => u.id === userId)

  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' })
  }

  const groupIndex = groups.findIndex(g => g.id === id)

  if (groupIndex === -1) {
    return res.status(404).json({ success: false, message: '分组不存在' })
  }

  // 检查成员是否已在分组中
  const memberExists = groups[groupIndex].members.some(m => m.id === userId)
  if (memberExists) {
    return res.json({ success: false, message: '该成员已在分组中' })
  }

  // 添加成员到分组
  const newMember: GroupMember = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    area: user.area,
    isActive: user.isActive
  }

  groups[groupIndex].members.push(newMember)
  saveGroups(groups)

  res.json({ success: true, message: '成员添加成功', data: groups[groupIndex] })
})

app.delete('/api/admin/groups/:id/members/:userId', authenticateToken, requireRole('admin'), (req, res) => {
  const { id, userId } = req.params

  const groupIndex = groups.findIndex(g => g.id === id)

  if (groupIndex === -1) {
    return res.status(404).json({ success: false, message: '分组不存在' })
  }

  // 从分组中移除成员
  const memberIndex = groups[groupIndex].members.findIndex(m => m.id === userId)
  if (memberIndex === -1) {
    return res.status(404).json({ success: false, message: '成员不在该分组中' })
  }

  groups[groupIndex].members.splice(memberIndex, 1)
  saveGroups(groups)

  res.json({ success: true, message: '成员移除成功', data: groups[groupIndex] })
})

app.get('/api/admin/projects', authenticateToken, requireRole('admin'), (_req, res) => {
  res.json({ success: true, data: projects })
})

app.post('/api/admin/projects', authenticateToken, (req, res) => {
  const { name, category, description, sortOrder } = req.body
  
  const newProject: Project = {
    id: Date.now().toString(),
    name,
    category,
    description,
    sortOrder: sortOrder || projects.length + 1,
    isActive: true
  }
  
  projects.push(newProject)
  saveProjects(projects)
  
  res.json({ success: true, message: '项目创建成功', data: newProject })
})

app.put('/api/admin/projects/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params
  const { name, category, description, sortOrder, isActive } = req.body
  
  const projectIndex = projects.findIndex(p => p.id === id)
  
  if (projectIndex === -1) {
    return res.status(404).json({ success: false, message: '项目不存在' })
  }
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    name,
    category,
    description,
    sortOrder,
    isActive
  }
  
  saveProjects(projects)
  
  res.json({ success: true, message: '项目更新成功', data: projects[projectIndex] })
})

app.delete('/api/admin/projects/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params
  
  const projectIndex = projects.findIndex(p => p.id === id)
  
  if (projectIndex === -1) {
    return res.status(404).json({ success: false, message: '项目不存在' })
  }
  
  projects.splice(projectIndex, 1)
  saveProjects(projects)
  
  res.json({ success: true, message: '项目删除成功' })
})

app.get('/api/admin/statistics', authenticateToken, requireRole('admin'), (req, res) => {
  // 支持按月筛选，默认当月；传 all 表示全部
  const monthParam = (req.query.month as string) || ''
  const now = new Date()
  const targetMonth = monthParam === 'all' ? '' : (monthParam || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

  // 按月份过滤工单
  const filtered = targetMonth
    ? workorders.filter(o => o.createTime && o.createTime.substring(0, 7) === targetMonth)
    : workorders

  // 单次遍历计算所有统计数据
  let pendingCount = 0
  let completedCount = 0
  let externalCount = 0
  const areaStats = new Map<string, { orderCount: number; completedCount: number }>()
  const faultTypeMap = new Map<string, number>()
  const trendMap = new Map<string, number>()
  let totalDuration = 0
  let durationCount = 0

  for (const order of filtered) {
    // 统计状态
    if (order.status === 'pending') pendingCount++
    if (order.status === 'completed' || order.status === 'closed') completedCount++
    if (order.status === 'external_pending' || order.status === 'external_processing' || order.status === 'external_rejected') externalCount++

    // 统计区域
    const area = order.area || 'unknown'
    const stats = areaStats.get(area) || { orderCount: 0, completedCount: 0 }
    stats.orderCount++
    if (order.status === 'completed' || order.status === 'closed') {
      stats.completedCount++
    }
    areaStats.set(area, stats)

    // 统计故障类型
    if (order.projectName) {
      faultTypeMap.set(order.projectName, (faultTypeMap.get(order.projectName) || 0) + 1)
    }

    // 统计趋势（按日期）
    if (order.createTime) {
      const date = order.createTime.split(' ')[0]
      trendMap.set(date, (trendMap.get(date) || 0) + 1)
    }

    // 计算维修时长
    if (order.createTime && order.updateTime && (order.status === 'completed' || order.status === 'closed')) {
      const create = new Date(order.createTime).getTime()
      const update = new Date(order.updateTime).getTime()
      if (!isNaN(create) && !isNaN(update)) {
        totalDuration += (update - create) / (1000 * 60 * 60)
        durationCount++
      }
    }
  }

  const avgDuration = durationCount > 0 ? Math.round((totalDuration / durationCount) * 10) / 10 : 0

  // 计算工程师统计
  const engineerStatsMap = new Map<string, { acceptedCount: number; completedCount: number; totalDuration: number; durationCount: number; urgentCount: number }>()
  for (const order of filtered) {
    if (order.engineerId) {
      const stats = engineerStatsMap.get(order.engineerId) || { acceptedCount: 0, completedCount: 0, totalDuration: 0, durationCount: 0, urgentCount: 0 }
      if (order.status !== 'pending') {
        stats.acceptedCount++
      }
      if (order.status === 'completed' || order.status === 'closed') {
        stats.completedCount++
        if (order.createTime && order.updateTime) {
          const create = new Date(order.createTime).getTime()
          const update = new Date(order.updateTime).getTime()
          if (!isNaN(create) && !isNaN(update)) {
            stats.totalDuration += (update - create) / (1000 * 60 * 60)
            stats.durationCount++
          }
        }
      }
      if (order.priority === 'urgent') {
        stats.urgentCount++
      }
      engineerStatsMap.set(order.engineerId, stats)
    }
  }

  // 转换为数组格式
  const engineerStats = Array.from(engineerStatsMap.entries()).map(([engineerId, stats]) => ({
    engineerId,
    name: users.find(u => u.id === engineerId)?.name || '未知',
    area: users.find(u => u.id === engineerId)?.area || 'unknown',
    acceptedCount: stats.acceptedCount,
    completedCount: stats.completedCount,
    completionRate: stats.acceptedCount > 0 ? Math.round((stats.completedCount / stats.acceptedCount) * 100) : 0,
    avgDuration: stats.durationCount > 0 ? Math.round((stats.totalDuration / stats.durationCount) * 10) / 10 : 0,
    urgentCount: stats.urgentCount
  }))

  // 转换区域统计
  const areaStatsArray = Array.from(areaStats.entries()).map(([area, stats]) => ({
    area,
    orderCount: stats.orderCount,
    completionRate: stats.orderCount > 0 ? Math.round((stats.completedCount / stats.orderCount) * 100) : 0
  }))

  // 转换故障类型统计
  const faultTypeData = Array.from(faultTypeMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // 转换趋势数据（按日期排序）
  const trendData = Array.from(trendMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  res.json({
    success: true,
    data: {
      totalOrders: filtered.length,
      completedOrders: completedCount,
      pendingOrders: pendingCount,
      averageDuration: avgDuration,
      externalOrders: externalCount,
      completionRate: filtered.length > 0 ? Math.round((completedCount / filtered.length) * 100) : 0,
      engineerStats,
      areaStats: areaStatsArray,
      trendData,
      faultTypeData
    }
  })
})

app.post('/api/admin/settings/test-webex', authenticateToken, requireRole('admin'), async (_req, res) => {
  try {
    if (!systemSettings.webexToken || !systemSettings.webexRoomId) {
      return res.json({ success: false, message: 'Webex配置不完整，请先配置Token和Room ID' })
    }

    const webexUrl = `https://webexapis.com/v1/messages`
    const message = {
      roomId: systemSettings.webexRoomId,
      text: 'IT报修系统 - Webex测试消息\n\n这是一条测试消息，说明Webex通知功能配置正确！'
    }

    const response = await fetch(webexUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${systemSettings.webexToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    })

    if (response.ok) {
      res.json({ success: true, message: 'Webex消息发送成功！' })
    } else {
      const errorData = await response.json().catch(() => ({ message: '未知错误' }))
      const msg = (errorData as { message?: string })?.message || response.statusText
      res.json({ success: false, message: `Webex消息发送失败: ${msg}` })
    }
  } catch (error) {
    console.error('Webex消息发送错误:', error)
    res.json({ success: false, message: `Webex消息发送失败: ${(error as Error).message}` })
  }
})

app.get('/api/admin/settings', authenticateToken, requireRole('admin'), (_req, res) => {
  res.json({
    success: true,
    data: {
      smtpHost: systemSettings.smtpHost,
      smtpPort: systemSettings.smtpPort,
      smtpUsername: systemSettings.smtpUsername,
      smtpPassword: systemSettings.smtpPassword ? '******' : '',
      smtpSecure: systemSettings.smtpSecure,
      webexToken: systemSettings.webexToken,
      webexRoomId: systemSettings.webexRoomId,
      extensionServer: systemSettings.extensionServer,
      extensionPort: systemSettings.extensionPort,
      systemUrl: systemSettings.systemUrl,
      httpsPort: systemSettings.httpsPort,
      certPath: systemSettings.certPath,
      certPassword: systemSettings.certPassword ? '******' : '',
      certFileName: systemSettings.certFileName,
      chainFileName: systemSettings.chainFileName,
      keyFileName: systemSettings.keyFileName
    }
  })
})

app.put('/api/admin/settings', authenticateToken, requireRole('admin'), (req, res) => {
  const { smtpHost, smtpPort, smtpUsername, smtpPassword, smtpSecure, webexToken, webexRoomId, extensionServer, extensionPort, systemUrl, httpsPort, certPath, certPassword, certFileName, chainFileName, keyFileName } = req.body
  
  if (smtpHost !== undefined) systemSettings.smtpHost = smtpHost
  if (smtpPort !== undefined) systemSettings.smtpPort = Number(smtpPort)
  if (smtpUsername !== undefined) systemSettings.smtpUsername = smtpUsername
  // 密码脱敏后不覆盖真实值
  if (smtpPassword !== undefined && smtpPassword !== '******') systemSettings.smtpPassword = smtpPassword
  if (smtpSecure !== undefined) systemSettings.smtpSecure = smtpSecure
  if (webexToken !== undefined) systemSettings.webexToken = webexToken
  if (webexRoomId !== undefined) systemSettings.webexRoomId = webexRoomId
  if (extensionServer !== undefined) systemSettings.extensionServer = extensionServer
  if (extensionPort !== undefined) systemSettings.extensionPort = Number(extensionPort)
  if (systemUrl !== undefined) systemSettings.systemUrl = systemUrl
  if (httpsPort !== undefined) systemSettings.httpsPort = Number(httpsPort)
  if (certPath !== undefined) systemSettings.certPath = certPath
  if (certPassword !== undefined && certPassword !== '******') systemSettings.certPassword = certPassword
  if (certFileName !== undefined) systemSettings.certFileName = certFileName
  if (chainFileName !== undefined) systemSettings.chainFileName = chainFileName
  if (keyFileName !== undefined) systemSettings.keyFileName = keyFileName
  
  saveSettings(systemSettings)
  
  res.json({ success: true, message: '设置更新成功', data: systemSettings })
})

// 上传证书文件
app.post('/api/admin/settings/upload-cert', authenticateToken, requireRole('admin'), upload.single('certFile'), (req, res) => {
  if (!req.file) {
    return res.json({ success: false, message: '请选择证书文件' })
  }
  
  systemSettings.certFileName = req.file.originalname
  saveSettings(systemSettings)
  
  res.json({ success: true, message: '证书上传成功', fileName: req.file.originalname })
})

// 上传私钥文件
app.post('/api/admin/settings/upload-key', authenticateToken, requireRole('admin'), upload.single('keyFile'), (req, res) => {
  if (!req.file) {
    return res.json({ success: false, message: '请选择私钥文件' })
  }
  
  systemSettings.keyFileName = req.file.originalname
  saveSettings(systemSettings)
  
  res.json({ success: true, message: '私钥上传成功', fileName: req.file.originalname })
})

// 上传中间证书链文件
app.post('/api/admin/settings/upload-chain', authenticateToken, upload.single('chainFile'), (req, res) => {
  if (!req.file) {
    return res.json({ success: false, message: '请选择证书链文件' })
  }
  
  systemSettings.chainFileName = req.file.originalname
  saveSettings(systemSettings)
  
  res.json({ success: true, message: '证书链上传成功', fileName: req.file.originalname })
})

app.post('/api/admin/settings/test-email', authenticateToken, requireRole('admin'), async (req, res) => {
  const { testEmail: toEmail } = req.body
  
  if (!systemSettings.smtpPassword) {
    return res.json({ success: false, message: '请先配置SMTP密码' })
  }
  
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1E3A5F; border-bottom: 2px solid #6BB3D9; padding-bottom: 10px;">IT报修系统 - 邮件测试</h2>
        <p>这是一封测试邮件，说明SMTP配置已生效。</p>
        <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    `
    
    const success = await sendEmail(toEmail, 'IT报修系统 - 邮件测试', emailHtml)
    
    if (success) {
      res.json({ success: true, message: '测试邮件发送成功' })
    } else {
      res.json({ success: false, message: '测试邮件发送失败，请检查SMTP配置' })
    }
  } catch (error) {
    res.json({ success: false, message: '测试邮件发送失败: ' + (error as Error).message })
  }
})

app.use(express.static(config.staticPath))

// API 404 处理（在通配路由之前）
app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'API 不存在' })
})

app.get('/', (_req, res) => {
  const indexPath = path.join(config.staticPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.send(generateDefaultHomePage(config.httpsPort))
  }
})

app.get('*', (_req, res) => {
  const indexPath = path.join(config.staticPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.send(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IT设备报修系统</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; text-align: center; background: linear-gradient(135deg, #E3F2FD 0%, #E8F5E9 100%); min-height: 100vh; }
          .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .logo { width: 60px; height: 60px; margin: 0 auto 20px; background: linear-gradient(135deg, #6BB3D9 0%, #7ED3A5 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 30px; color: white; }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; margin-bottom: 20px; }
          .btn { display: inline-block; padding: 10px 20px; background: #6BB3D9; color: white; text-decoration: none; border-radius: 4px; margin: 5px; }
          .btn:hover { background: #5a9bc7; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🔧</div>
          <h1>页面建设中</h1>
          <p>该页面正在建设中，请稍后访问</p>
          <p>
            <a href="/" class="btn">返回首页</a>
            <a href="/repair" class="btn">提交报修</a>
            <a href="/workorders" class="btn">工单查询</a>
          </p>
        </div>
      </body>
      </html>
    `)
  }
})

function generateDefaultHomePage(httpsPort: number): string {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>IT设备扫码报修系统</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #E3F2FD 0%, #E8F5E9 100%); min-height: 100vh; }
        .header { background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 20px; }
        .header-content { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .logo { display: flex; align-items: center; gap: 12px; }
        .logo-icon { width: 50px; height: 50px; background: linear-gradient(135deg, #6BB3D9 0%, #7ED3A5 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white; }
        .logo-text h1 { color: #333; font-size: 20px; }
        .logo-text p { color: #666; font-size: 12px; }
        .nav-links { display: flex; gap: 20px; }
        .nav-links a { text-decoration: none; color: #666; padding: 8px 16px; border-radius: 8px; transition: all 0.3s; }
        .nav-links a:hover { background: #f0f0f0; color: #333; }
        .hero { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
        .hero-content { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 60px; text-align: center; }
        .hero-icon { width: 100px; height: 100px; background: linear-gradient(135deg, #6BB3D9 0%, #7ED3A5 100%); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 48px; color: white; margin: 0 auto 24px; }
        .hero h2 { color: #333; font-size: 32px; margin-bottom: 16px; }
        .hero p { color: #666; font-size: 16px; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto; }
        .cta-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .btn { padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 500; transition: all 0.3s; }
        .btn-primary { background: linear-gradient(135deg, #6BB3D9 0%, #7ED3A5 100%); color: white; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(107, 179, 217, 0.4); }
        .btn-secondary { background: white; color: #6BB3D9; border: 2px solid #6BB3D9; }
        .btn-secondary:hover { background: #f0f8fc; }
        .api-status { background: #f8f9fa; border-radius: 8px; padding: 16px; margin-top: 24px; text-align: left; }
        .api-status h4 { color: #333; margin-bottom: 12px; }
        .api-status p { color: #666; font-size: 13px; margin-bottom: 8px; }
        .api-status .success { color: #28a745; font-weight: bold; }
        .api-status .info { color: #17a2b8; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-content">
          <div class="logo">
            <div class="logo-icon">🔧</div>
            <div class="logo-text">
              <h1>IT设备扫码报修系统</h1>
              <p>企业专属IT设备报修管理平台</p>
            </div>
          </div>
          <div class="nav-links">
            <a href="/">首页</a>
            <a href="/repair">提交报修</a>
            <a href="/workorders">工单查询</a>
            <a href="/admin/login">管理员</a>
          </div>
        </div>
      </div>
      <div class="hero">
        <div class="hero-content">
          <div class="hero-icon">🛠️</div>
          <h2>高效管理IT设备报修流程</h2>
          <p>支持扫码报修、多渠道通知、工程师分组管理，让IT运维更加高效便捷</p>
          <div class="cta-buttons">
            <a href="/repair" class="btn btn-primary">立即报修</a>
            <a href="/workorders" class="btn btn-secondary">查询工单</a>
          </div>
          <div class="api-status">
            <h4>📊 系统状态</h4>
            <p><span class="success">✅</span> 后端API服务运行正常</p>
            <p><span class="info">📍</span> API地址: <strong>http://localhost:${config.httpPort}/api</strong></p>
            <p><span class="info">📍</span> HTTPS地址: <strong>https://localhost:${httpsPort}/api</strong></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// 读取SSL证书配置（从settings.json中读取上传的文件名）
const certFile = systemSettings.certFileName || 'server.crt'
const chainFile = systemSettings.chainFileName || ''
const keyFile = systemSettings.keyFileName || 'server.key'

// 证书路径转为绝对路径（避免启动目录不同导致找不到文件）
const sslCertPath = path.isAbsolute(systemSettings.certPath) 
  ? systemSettings.certPath 
  : path.resolve(process.cwd(), systemSettings.certPath)

// 读取证书和密钥
const certBuffer = fs.existsSync(path.join(sslCertPath, certFile)) 
  ? fs.readFileSync(path.join(sslCertPath, certFile)) 
  : null
const chainBuffer = chainFile && fs.existsSync(path.join(sslCertPath, chainFile)) 
  ? fs.readFileSync(path.join(sslCertPath, chainFile)) 
  : null
const keyBuffer = fs.existsSync(path.join(sslCertPath, keyFile)) 
  ? fs.readFileSync(path.join(sslCertPath, keyFile)) 
  : null

// 合并服务器证书和中间证书链（中间加换行符防止 PEM 格式损坏）
const fullCert = certBuffer && chainBuffer 
  ? Buffer.concat([certBuffer, Buffer.from('\n'), chainBuffer]) 
  : certBuffer

const SSL_OPTIONS: https.ServerOptions = {
  key: keyBuffer,
  cert: fullCert
}

if (SSL_OPTIONS.key && SSL_OPTIONS.cert) {
  https.createServer(SSL_OPTIONS, app).listen(systemSettings.httpsPort, () => {
    console.log(`HTTPS Server is running on https://localhost:${systemSettings.httpsPort}`)
    console.log(`证书文件: ${certFile}${chainFile ? ' + ' + chainFile : ''}`)
    console.log(`私钥文件: ${keyFile}`)
    console.log(`证书路径: ${sslCertPath}`)
  })
  
  // HTTP 服务器重定向到 HTTPS
  const httpApp = express()
  httpApp.use((req, res) => {
    const host = req.headers.host?.replace(/:\d+/, '') || 'localhost'
    res.redirect(`https://${host}:${systemSettings.httpsPort}${req.url}`)
  })
  httpApp.listen(config.httpPort, () => {
    console.log(`HTTP Server is running on http://localhost:${config.httpPort}`)
    console.log(`HTTP请求将自动重定向到HTTPS`)
  })
} else {
  console.log('警告: 未找到SSL证书，仅启动HTTP服务')
  app.listen(config.httpPort, () => {
    console.log(`Server is running on http://localhost:${config.httpPort}`)
  })
}