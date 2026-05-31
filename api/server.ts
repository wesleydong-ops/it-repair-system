import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import path from 'path'
import https from 'https'
import fs from 'fs'
import nodemailer from 'nodemailer'
import { config } from './config'

const app = express()

const SSL_OPTIONS = {
  key: fs.existsSync(path.join(config.certPath, 'server.key')) 
    ? fs.readFileSync(path.join(config.certPath, 'server.key')) 
    : null,
  cert: fs.existsSync(path.join(config.certPath, 'server.crt')) 
    ? fs.readFileSync(path.join(config.certPath, 'server.crt')) 
    : null
}

app.use(cors())
app.use(express.json())

app.use('/api', (_req, _res, next) => {
  next()
})

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

const DATA_DIR = path.join(process.cwd(), 'data')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')

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
  systemUrl: 'https://localhost:8443'
}

const loadSettings = (): typeof defaultSettings => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8')
      const savedSettings = JSON.parse(data)
      return { ...defaultSettings, ...savedSettings }
    }
    saveSettings(defaultSettings)
    return defaultSettings
  } catch (error) {
    console.error('加载设置失败:', error)
    return defaultSettings
  }
}

const saveSettings = (settings: typeof defaultSettings): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
    console.log('设置已保存')
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

const systemSettings = loadSettings()

const WORKORDERS_FILE = path.join(DATA_DIR, 'workorders.json')
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')

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
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf8')
      return JSON.parse(data)
    }
    saveProjects(defaultProjects)
    return defaultProjects
  } catch (error) {
    console.error('加载项目数据失败:', error)
    return defaultProjects
  }
}

const saveProjects = (projectList: Project[]): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projectList, null, 2))
    console.log('项目数据已保存')
  } catch (error) {
    console.error('保存项目数据失败:', error)
  }
}

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
}

const loadWorkorders = (): WorkOrder[] => {
  try {
    if (fs.existsSync(WORKORDERS_FILE)) {
      const data = fs.readFileSync(WORKORDERS_FILE, 'utf8')
      return JSON.parse(data)
    }
    saveWorkorders(defaultWorkorders)
    return defaultWorkorders
  } catch (error) {
    console.error('加载工单数据失败:', error)
    return defaultWorkorders
  }
}

const saveWorkorders = (orders: WorkOrder[]): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(WORKORDERS_FILE, JSON.stringify(orders, null, 2))
    console.log('工单数据已保存')
  } catch (error) {
    console.error('保存工单数据失败:', error)
  }
}

const defaultWorkorders = [
  { id: '1', orderNo: 'WO-20240115-001', applicantName: '张三', department: '研发部', location: 'A栋3楼301室', extension: '8001', email: 'zhangsan@company.com', webexId: 'zhangsan', assetNo: 'IT-2024-001', deviceType: '笔记本电脑', deviceLocation: 'A区-2楼', projectId: '1', projectName: '系统故障', description: '电脑无法开机', repairType: 'internal', notificationChannels: ['email', 'webex'], priority: 'urgent', status: 'pending', area: 'A', engineerId: '', engineerName: '', statusLog: '', createTime: '2024-01-15 14:30:00', updateTime: '2024-01-15 14:30:00' },
  { id: '2', orderNo: 'WO-20240115-002', applicantName: '李四', department: '市场部', location: 'B栋2楼201室', extension: '8002', email: 'lisi@company.com', webexId: 'lisi', assetNo: 'IT-2024-002', deviceType: '台式电脑', deviceLocation: 'CK区-1楼', projectId: '2', projectName: '网络故障', description: '网络连接不稳定', repairType: 'remote', notificationChannels: ['extension'], priority: 'normal', status: 'accepted', area: 'CK', engineerId: '3', engineerName: '李工', statusLog: '', createTime: '2024-01-15 13:20:00', updateTime: '2024-01-15 13:30:00' },
  { id: '3', orderNo: 'WO-20240115-003', applicantName: '王五', department: '财务部', location: 'A栋1楼101室', extension: '8003', email: 'wangwu@company.com', webexId: 'wangwu', assetNo: 'IT-2024-003', deviceType: '打印机', deviceLocation: 'A区-1楼', projectId: '3', projectName: '硬件故障', description: '打印机卡纸', repairType: 'internal', notificationChannels: ['email'], priority: 'normal', status: 'processing', area: 'A', engineerId: '2', engineerName: '陈工', statusLog: '', createTime: '2024-01-15 11:45:00', updateTime: '2024-01-15 12:00:00' }
]

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
  { id: '1', username: 'admin', password: bcrypt.hashSync('admin123', 10), name: '管理员', role: 'admin', area: '', email: 'admin@foxlink.com', webexId: 'admin', isActive: true, createTime: '2024-01-01 09:00:00' },
  { id: '2', username: 'chen', password: bcrypt.hashSync('123456', 10), name: '陈工', role: 'engineer', area: 'A', email: 'chen@foxlink.com', webexId: 'chen', isActive: true, createTime: '2024-01-02 10:00:00' },
  { id: '3', username: 'li', password: bcrypt.hashSync('123456', 10), name: '李工', role: 'engineer', area: 'CK', email: 'li@foxlink.com', webexId: 'li', isActive: true, createTime: '2024-01-03 11:00:00' },
  { id: '4', username: 'wang', password: bcrypt.hashSync('123456', 10), name: '王工', role: 'engineer', area: 'A', email: 'wang@foxlink.com', webexId: 'wang', isActive: true, createTime: '2024-01-04 14:00:00' },
  { id: '5', username: 'zhao', password: bcrypt.hashSync('123456', 10), name: '赵工', role: 'engineer', area: 'CK', email: 'zhao@foxlink.com', webexId: 'zhao', isActive: false, createTime: '2024-01-05 15:00:00' },
  { id: '6', username: 'operator', password: bcrypt.hashSync('123456', 10), name: '运维员', role: 'operator', area: '', email: 'operator@foxlink.com', webexId: 'operator', isActive: true, createTime: '2024-01-06 09:00:00' }
]

const loadUsers = (): User[] => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8')
      return JSON.parse(data)
    }
    saveUsers(defaultUsers)
    return defaultUsers
  } catch (error) {
    console.error('加载用户数据失败:', error)
    return defaultUsers
  }
}

const saveUsers = (userList: User[]): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(userList, null, 2))
    console.log('用户数据已保存')
  } catch (error) {
    console.error('保存用户数据失败:', error)
  }
}

const users = loadUsers()

const verificationCodes: Record<string, { code: string; expiresAt: number }> = {}

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
  
  const freshUsers = loadUsers()
  const user = freshUsers.find(u => u.username === username)
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' })
  }
  
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: '1h' })
  
  res.json({
    success: true,
    token,
    user: { id: user.id, username: user.username, name: user.name, role: user.role }
  })
})

app.post('/api/admin/forgot-password', async (req, res) => {
  const { email } = req.body
  
  const freshUsers = loadUsers()
  const user = freshUsers.find(u => u.email === email)
  
  if (!user) {
    return res.json({ success: false, message: '该邮箱未注册' })
  }
  
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
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
  
  const freshUsers = loadUsers()
  const userIndex = freshUsers.findIndex(u => u.email === email)
  
  if (userIndex === -1) {
    return res.json({ success: false, message: '用户不存在' })
  }
  
  freshUsers[userIndex].password = bcrypt.hashSync(newPassword, 10)
  saveUsers(freshUsers)
  
  delete verificationCodes[email]
  
  res.json({ success: true, message: '密码重置成功，请使用新密码登录' })
})

app.get('/api/admin/me', authenticateToken, (req, res) => {
  const userId = (req as any).user.id
  const freshUsers = loadUsers()
  const user = freshUsers.find(u => u.id === userId)
  
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' })
  }
  
  res.json({
    success: true,
    user: { id: user.id, username: user.username, name: user.name, role: user.role }
  })
})

app.get('/api/admin/users', authenticateToken, (_req, res) => {
  const freshUsers = loadUsers()
  res.json({
    success: true,
    data: freshUsers.map(u => ({
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

app.post('/api/admin/users', authenticateToken, (req, res) => {
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
    password: bcrypt.hashSync(password || '123456', 10),
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

app.put('/api/admin/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const { name, role, area, isActive, email, webexId } = req.body
  
  const freshUsers = loadUsers()
  const userIndex = freshUsers.findIndex(u => u.id === id)
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: '用户不存在' })
  }
  
  freshUsers[userIndex] = {
    ...freshUsers[userIndex],
    name,
    role,
    area,
    isActive,
    email: email || freshUsers[userIndex].email,
    webexId: webexId || freshUsers[userIndex].webexId
  }
  
  saveUsers(freshUsers)
  
  res.json({ success: true, data: { ...freshUsers[userIndex], password: '' } })
})

app.delete('/api/admin/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  
  const freshUsers = loadUsers()
  const userIndex = freshUsers.findIndex(u => u.id === id)
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: '用户不存在' })
  }
  
  freshUsers.splice(userIndex, 1)
  saveUsers(freshUsers)
  
  res.json({ success: true, message: '删除成功' })
})

app.post('/api/workorder/submit', async (req, res) => {
  const { applicantName, department, location, extension, email, webexId, assetNo, deviceType, deviceLocation, projectId, description, repairType, notificationChannels, priority, area } = req.body
  
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
    status: 'pending',
    area,
    engineerId: '',
    engineerName: '',
    statusLog: '',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN')
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

app.get('/api/workorder/list', (req, res) => {
  const { status, area, page = 1, size = 10 } = req.query
  
  let filteredOrders = workorders
  
  if (status) {
    filteredOrders = filteredOrders.filter(o => o.status === status)
  }
  
  if (area) {
    filteredOrders = filteredOrders.filter(o => o.area === area)
  }
  
  const start = (Number(page) - 1) * Number(size)
  const end = start + Number(size)
  
  res.json({
    success: true,
    data: filteredOrders.slice(start, end),
    total: filteredOrders.length
  })
})

app.get('/api/workorder/:id', (req, res) => {
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
  
  const freshUsers = loadUsers()
  const user = freshUsers.find(u => u.id === userId)
  
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
  
  const order = workorders.find(o => o.id === id)
  
  if (!order) {
    return res.status(404).json({ success: false, message: '工单不存在' })
  }
  
  if (order.status !== 'processing') {
    return res.status(400).json({ success: false, message: '工单状态不允许完成' })
  }
  
  order.status = 'completed'
  order.updateTime = new Date().toLocaleString('zh-CN')
  saveWorkorders(workorders)
  
  res.json({ success: true, message: '维修完成' })
})

app.post('/api/workorder/:id/close', authenticateToken, (req, res) => {
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
  
  res.json({ success: true, message: '结案成功' })
})

app.post('/api/workorder/:id/external', authenticateToken, (req, res) => {
  const { id } = req.params
  const { reason, parts, estimatedCost, repairCompany } = req.body
  
  const order = workorders.find(o => o.id === id)
  
  if (!order) {
    return res.status(404).json({ success: false, message: '工单不存在' })
  }
  
  if (order.status !== 'processing') {
    return res.status(400).json({ success: false, message: '工单状态不允许申请外修' })
  }
  
  res.json({ success: true, message: '外修申请已提交', data: { reason, parts, estimatedCost, repairCompany } })
})

app.get('/api/admin/groups', authenticateToken, (req, res) => {
  const groups = [
    { id: '1', name: 'A区维修组', area: 'A', description: '负责A区所有办公区域、设备报修工单', isActive: true, members: users.filter(u => u.role === 'engineer' && u.area === 'A') },
    { id: '2', name: 'CK区维修组', area: 'CK', description: '负责CK区所有区域、设备报修工单', isActive: true, members: users.filter(u => u.role === 'engineer' && u.area === 'CK') }
  ]
  
  res.json({ success: true, data: groups })
})

app.post('/api/admin/groups', authenticateToken, (req, res) => {
  const { name, area, description } = req.body
  
  res.json({ success: true, message: '分组创建成功', data: { id: Date.now().toString(), name, area, description, isActive: true, members: [] } })
})

app.post('/api/admin/groups/:id/members', authenticateToken, (_req, res) => {
  res.json({ success: true, message: '成员添加成功' })
})

app.delete('/api/admin/groups/:id/members/:userId', authenticateToken, (_req, res) => {
  res.json({ success: true, message: '成员移除成功' })
})

app.get('/api/admin/projects', authenticateToken, (_req, res) => {
  const projects = loadProjects()
  res.json({ success: true, data: projects })
})

app.post('/api/admin/projects', authenticateToken, (req, res) => {
  const { name, category, description, sortOrder } = req.body
  
  const projects = loadProjects()
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

app.put('/api/admin/projects/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const { name, category, description, sortOrder, isActive } = req.body
  
  const projects = loadProjects()
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

app.delete('/api/admin/projects/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  
  const projects = loadProjects()
  const projectIndex = projects.findIndex(p => p.id === id)
  
  if (projectIndex === -1) {
    return res.status(404).json({ success: false, message: '项目不存在' })
  }
  
  projects.splice(projectIndex, 1)
  saveProjects(projects)
  
  res.json({ success: true, message: '项目删除成功' })
})

app.get('/api/admin/statistics', authenticateToken, (_req, res) => {
  const completedCount = workorders.filter(o => o.status === 'completed' || o.status === 'closed').length
  
  res.json({
    success: true,
    data: {
      totalOrders: workorders.length,
      completedOrders: completedCount,
      pendingOrders: workorders.filter(o => o.status === 'pending').length,
      averageDuration: 2.3,
      engineerStats: [
        { engineerId: '2', name: '陈工', acceptedCount: 15, completedCount: 14, avgDuration: 2.1 },
        { engineerId: '3', name: '李工', acceptedCount: 12, completedCount: 11, avgDuration: 2.5 }
      ],
      areaStats: [
        { area: 'A', orderCount: workorders.filter(o => o.area === 'A').length, completionRate: 93 },
        { area: 'CK', orderCount: workorders.filter(o => o.area === 'CK').length, completionRate: 89 }
      ]
    }
  })
})

app.post('/api/admin/settings/test-webex', authenticateToken, async (_req, res) => {
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

app.get('/api/admin/settings', authenticateToken, (_req, res) => {
  res.json({
    success: true,
    data: {
      smtpHost: systemSettings.smtpHost,
      smtpPort: systemSettings.smtpPort,
      smtpUsername: systemSettings.smtpUsername,
      smtpPassword: systemSettings.smtpPassword,
      smtpSecure: systemSettings.smtpSecure,
      webexToken: systemSettings.webexToken,
      webexRoomId: systemSettings.webexRoomId,
      extensionServer: systemSettings.extensionServer,
      extensionPort: systemSettings.extensionPort,
      systemUrl: systemSettings.systemUrl
    }
  })
})

app.put('/api/admin/settings', authenticateToken, (req, res) => {
  const { smtpHost, smtpPort, smtpUsername, smtpPassword, smtpSecure, webexToken, webexRoomId, extensionServer, extensionPort, systemUrl } = req.body
  
  if (smtpHost !== undefined) systemSettings.smtpHost = smtpHost
  if (smtpPort !== undefined) systemSettings.smtpPort = smtpPort
  if (smtpUsername !== undefined) systemSettings.smtpUsername = smtpUsername
  if (smtpPassword !== undefined) systemSettings.smtpPassword = smtpPassword
  if (smtpSecure !== undefined) systemSettings.smtpSecure = smtpSecure
  if (webexToken !== undefined) systemSettings.webexToken = webexToken
  if (webexRoomId !== undefined) systemSettings.webexRoomId = webexRoomId
  if (extensionServer !== undefined) systemSettings.extensionServer = extensionServer
  if (extensionPort !== undefined) systemSettings.extensionPort = extensionPort
  if (systemUrl !== undefined) systemSettings.systemUrl = systemUrl
  
  saveSettings(systemSettings)
  
  res.json({ success: true, message: '设置更新成功', data: systemSettings })
})

app.post('/api/admin/settings/test-email', authenticateToken, async (req, res) => {
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

if (SSL_OPTIONS.key && SSL_OPTIONS.cert) {
  https.createServer(SSL_OPTIONS, app).listen(config.httpsPort, () => {
    console.log(`HTTPS Server is running on https://localhost:${config.httpsPort}`)
    console.log(`证书路径: ${config.certPath}`)
  })
  
  app.listen(config.httpPort, () => {
    console.log(`HTTP Server is running on http://localhost:${config.httpPort}`)
    console.log(`HTTP请求将自动重定向到HTTPS`)
  })
} else {
  console.log('警告: 未找到SSL证书，仅启动HTTP服务')
  app.listen(config.httpPort, () => {
    console.log(`Server is running on http://localhost:${config.httpPort}`)
  })
}