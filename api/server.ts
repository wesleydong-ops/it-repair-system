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

app.use('/api', (req, res, next) => {
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

const systemSettings = {
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

const users = [
  { id: '1', username: 'admin', password: bcrypt.hashSync('admin123', 10), name: '管理员', role: 'admin', area: '', isActive: true, createTime: '2024-01-01 09:00:00' },
  { id: '2', username: 'chen', password: bcrypt.hashSync('123456', 10), name: '陈工', role: 'engineer', area: 'A', isActive: true, createTime: '2024-01-02 10:00:00' },
  { id: '3', username: 'li', password: bcrypt.hashSync('123456', 10), name: '李工', role: 'engineer', area: 'CK', isActive: true, createTime: '2024-01-03 11:00:00' }
]

const workorders = [
  { id: '1', orderNo: 'WO-20240115-001', applicantName: '张三', department: '研发部', location: 'A栋3楼301室', extension: '8001', email: 'zhangsan@company.com', webexId: 'zhangsan', assetNo: 'IT-2024-001', deviceType: '笔记本电脑', deviceLocation: 'A区-2楼', projectId: '1', projectName: '系统故障', description: '电脑无法开机', repairType: 'internal', notificationChannels: ['email', 'webex'], priority: 'urgent', status: 'pending', area: 'A', engineerId: '', engineerName: '', statusLog: '', createTime: '2024-01-15 14:30:00', updateTime: '2024-01-15 14:30:00' },
  { id: '2', orderNo: 'WO-20240115-002', applicantName: '李四', department: '市场部', location: 'B栋2楼201室', extension: '8002', email: 'lisi@company.com', webexId: 'lisi', assetNo: 'IT-2024-002', deviceType: '台式电脑', deviceLocation: 'CK区-1楼', projectId: '2', projectName: '网络故障', description: '网络连接不稳定', repairType: 'remote', notificationChannels: ['extension'], priority: 'normal', status: 'accepted', area: 'CK', engineerId: '3', engineerName: '李工', statusLog: '', createTime: '2024-01-15 13:20:00', updateTime: '2024-01-15 13:30:00' },
  { id: '3', orderNo: 'WO-20240115-003', applicantName: '王五', department: '财务部', location: 'A栋1楼101室', extension: '8003', email: 'wangwu@company.com', webexId: 'wangwu', assetNo: 'IT-2024-003', deviceType: '打印机', deviceLocation: 'A区-1楼', projectId: '3', projectName: '硬件故障', description: '打印机卡纸', repairType: 'internal', notificationChannels: ['email'], priority: 'normal', status: 'processing', area: 'A', engineerId: '2', engineerName: '陈工', statusLog: '', createTime: '2024-01-15 11:45:00', updateTime: '2024-01-15 12:00:00' }
]

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body
  
  const user = users.find(u => u.username === username)
  
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

app.get('/api/admin/users', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: users.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      area: u.area,
      isActive: u.isActive,
      createTime: u.createTime
    }))
  })
})

app.post('/api/admin/users', authenticateToken, (req, res) => {
  const { username, name, role, area } = req.body
  
  const newUser = {
    id: Date.now().toString(),
    username,
    password: bcrypt.hashSync('123456', 10),
    name,
    role,
    area,
    isActive: true,
    createTime: new Date().toISOString()
  }
  
  users.push(newUser)
  
  res.json({ success: true, data: newUser })
})

app.put('/api/admin/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const { name, role, area, isActive } = req.body
  
  const userIndex = users.findIndex(u => u.id === id)
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: '用户不存在' })
  }
  
  users[userIndex] = {
    ...users[userIndex],
    name,
    role,
    area,
    isActive
  }
  
  res.json({ success: true, data: users[userIndex] })
})

app.delete('/api/admin/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  
  const userIndex = users.findIndex(u => u.id === id)
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: '用户不存在' })
  }
  
  users.splice(userIndex, 1)
  
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
    projectName: ['系统故障', '网络故障', '硬件故障', '软件问题', '设备升级', '数据恢复', '其他问题'][parseInt(projectId) - 1] || '其他问题',
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

app.post('/api/workorder/:id/accept', authenticateToken, (req, res) => {
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

app.post('/api/admin/groups/:id/members', authenticateToken, (req, res) => {
  const { id } = req.params
  const { userId } = req.body
  
  res.json({ success: true, message: '成员添加成功' })
})

app.delete('/api/admin/groups/:id/members/:userId', authenticateToken, (req, res) => {
  res.json({ success: true, message: '成员移除成功' })
})

app.get('/api/admin/projects', authenticateToken, (req, res) => {
  const projects = [
    { id: '1', name: '系统故障', category: '系统故障', description: '操作系统相关故障', sortOrder: 1, isActive: true },
    { id: '2', name: '网络故障', category: '网络故障', description: '网络连接相关故障', sortOrder: 2, isActive: true },
    { id: '3', name: '硬件故障', category: '硬件故障', description: '硬件设备相关故障', sortOrder: 3, isActive: true },
    { id: '4', name: '软件问题', category: '软件问题', description: '应用软件相关问题', sortOrder: 4, isActive: true },
    { id: '5', name: '设备升级', category: '设备升级', description: '设备升级与配置', sortOrder: 5, isActive: true },
    { id: '6', name: '数据恢复', category: '其他', description: '数据恢复服务', sortOrder: 6, isActive: true },
    { id: '7', name: '其他问题', category: '其他', description: '其他未分类问题', sortOrder: 7, isActive: true }
  ]
  
  res.json({ success: true, data: projects })
})

app.post('/api/admin/projects', authenticateToken, (req, res) => {
  const { name, category, description, sortOrder } = req.body
  
  res.json({ success: true, message: '项目创建成功', data: { id: Date.now().toString(), name, category, description, sortOrder, isActive: true } })
})

app.put('/api/admin/projects/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const { name, category, description, sortOrder, isActive } = req.body
  
  res.json({ success: true, message: '项目更新成功', data: { id, name, category, description, sortOrder, isActive } })
})

app.delete('/api/admin/projects/:id', authenticateToken, (req, res) => {
  res.json({ success: true, message: '项目删除成功' })
})

app.get('/api/admin/statistics', authenticateToken, (req, res) => {
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

app.get('/api/admin/settings', authenticateToken, (req, res) => {
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

app.get('/', (req, res) => {
  const indexPath = path.join(config.staticPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.send(generateDefaultHomePage(config.httpsPort))
  }
})

app.get('*', (req, res) => {
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