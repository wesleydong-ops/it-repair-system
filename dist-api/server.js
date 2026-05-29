"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var jsonwebtoken_1 = require("jsonwebtoken");
var bcryptjs_1 = require("bcryptjs");
var path_1 = require("path");
var https_1 = require("https");
var fs_1 = require("fs");
var nodemailer_1 = require("nodemailer");
var config_1 = require("./config");
var app = (0, express_1.default)();
var SSL_OPTIONS = {
    key: fs_1.default.existsSync(path_1.default.join(config_1.config.certPath, 'server.key'))
        ? fs_1.default.readFileSync(path_1.default.join(config_1.config.certPath, 'server.key'))
        : undefined,
    cert: fs_1.default.existsSync(path_1.default.join(config_1.config.certPath, 'server.crt'))
        ? fs_1.default.readFileSync(path_1.default.join(config_1.config.certPath, 'server.crt'))
        : undefined
};
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', function (_req, _res, next) {
    next();
});
var authenticateToken = function (req, res, next) {
    var authHeader = req.headers['authorization'];
    var token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: '未授权' });
    }
    jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret, function (err, user) {
        if (err) {
            return res.status(403).json({ success: false, message: '无效的token' });
        }
        req.user = user;
        next();
    });
};
var DATA_DIR = path_1.default.join(process.cwd(), 'data');
var SETTINGS_FILE = path_1.default.join(DATA_DIR, 'settings.json');
var defaultSettings = {
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
};
var loadSettings = function () {
    try {
        if (!fs_1.default.existsSync(DATA_DIR)) {
            fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (fs_1.default.existsSync(SETTINGS_FILE)) {
            var data = fs_1.default.readFileSync(SETTINGS_FILE, 'utf8');
            var savedSettings = JSON.parse(data);
            return __assign(__assign({}, defaultSettings), savedSettings);
        }
        saveSettings(defaultSettings);
        return defaultSettings;
    }
    catch (error) {
        console.error('加载设置失败:', error);
        return defaultSettings;
    }
};
var saveSettings = function (settings) {
    try {
        if (!fs_1.default.existsSync(DATA_DIR)) {
            fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs_1.default.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        console.log('设置已保存');
    }
    catch (error) {
        console.error('保存设置失败:', error);
    }
};
var systemSettings = loadSettings();
var WORKORDERS_FILE = path_1.default.join(DATA_DIR, 'workorders.json');
var PROJECTS_FILE = path_1.default.join(DATA_DIR, 'projects.json');
var defaultProjects = [
    { id: '1', name: '系统故障', category: '系统故障', description: '操作系统相关故障', sortOrder: 1, isActive: true },
    { id: '2', name: '网络故障', category: '网络故障', description: '网络连接相关故障', sortOrder: 2, isActive: true },
    { id: '3', name: '硬件故障', category: '硬件故障', description: '硬件设备相关故障', sortOrder: 3, isActive: true },
    { id: '4', name: '软件问题', category: '软件问题', description: '应用软件相关问题', sortOrder: 4, isActive: true },
    { id: '5', name: '设备升级', category: '设备升级', description: '设备升级与配置', sortOrder: 5, isActive: true },
    { id: '6', name: '数据恢复', category: '其他', description: '数据恢复服务', sortOrder: 6, isActive: true },
    { id: '7', name: '其他问题', category: '其他', description: '其他未分类问题', sortOrder: 7, isActive: true }
];
var loadProjects = function () {
    try {
        if (fs_1.default.existsSync(PROJECTS_FILE)) {
            var data = fs_1.default.readFileSync(PROJECTS_FILE, 'utf8');
            return JSON.parse(data);
        }
        saveProjects(defaultProjects);
        return defaultProjects;
    }
    catch (error) {
        console.error('加载项目数据失败:', error);
        return defaultProjects;
    }
};
var saveProjects = function (projectList) {
    try {
        if (!fs_1.default.existsSync(DATA_DIR)) {
            fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs_1.default.writeFileSync(PROJECTS_FILE, JSON.stringify(projectList, null, 2));
        console.log('项目数据已保存');
    }
    catch (error) {
        console.error('保存项目数据失败:', error);
    }
};
var loadWorkorders = function () {
    try {
        if (fs_1.default.existsSync(WORKORDERS_FILE)) {
            var data = fs_1.default.readFileSync(WORKORDERS_FILE, 'utf8');
            return JSON.parse(data);
        }
        saveWorkorders(defaultWorkorders);
        return defaultWorkorders;
    }
    catch (error) {
        console.error('加载工单数据失败:', error);
        return defaultWorkorders;
    }
};
var saveWorkorders = function (orders) {
    try {
        if (!fs_1.default.existsSync(DATA_DIR)) {
            fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs_1.default.writeFileSync(WORKORDERS_FILE, JSON.stringify(orders, null, 2));
        console.log('工单数据已保存');
    }
    catch (error) {
        console.error('保存工单数据失败:', error);
    }
};
var defaultWorkorders = [
    { id: '1', orderNo: 'WO-20240115-001', applicantName: '张三', department: '研发部', location: 'A栋3楼301室', extension: '8001', email: 'zhangsan@company.com', webexId: 'zhangsan', assetNo: 'IT-2024-001', deviceType: '笔记本电脑', deviceLocation: 'A区-2楼', projectId: '1', projectName: '系统故障', description: '电脑无法开机', repairType: 'internal', notificationChannels: ['email', 'webex'], priority: 'urgent', status: 'pending', area: 'A', engineerId: '', engineerName: '', statusLog: '', createTime: '2024-01-15 14:30:00', updateTime: '2024-01-15 14:30:00' },
    { id: '2', orderNo: 'WO-20240115-002', applicantName: '李四', department: '市场部', location: 'B栋2楼201室', extension: '8002', email: 'lisi@company.com', webexId: 'lisi', assetNo: 'IT-2024-002', deviceType: '台式电脑', deviceLocation: 'CK区-1楼', projectId: '2', projectName: '网络故障', description: '网络连接不稳定', repairType: 'remote', notificationChannels: ['extension'], priority: 'normal', status: 'accepted', area: 'CK', engineerId: '3', engineerName: '李工', statusLog: '', createTime: '2024-01-15 13:20:00', updateTime: '2024-01-15 13:30:00' },
    { id: '3', orderNo: 'WO-20240115-003', applicantName: '王五', department: '财务部', location: 'A栋1楼101室', extension: '8003', email: 'wangwu@company.com', webexId: 'wangwu', assetNo: 'IT-2024-003', deviceType: '打印机', deviceLocation: 'A区-1楼', projectId: '3', projectName: '硬件故障', description: '打印机卡纸', repairType: 'internal', notificationChannels: ['email'], priority: 'normal', status: 'processing', area: 'A', engineerId: '2', engineerName: '陈工', statusLog: '', createTime: '2024-01-15 11:45:00', updateTime: '2024-01-15 12:00:00' }
];
var workorders = loadWorkorders();
var assignEngineer = function (area) {
    var currentUsers = loadUsers();
    var targetEngineers;
    if (area === 'A区') {
        targetEngineers = currentUsers.filter(function (u) { return u.role === 'engineer' && u.area === 'A'; });
    }
    else if (area === 'C区' || area === 'K区') {
        targetEngineers = currentUsers.filter(function (u) { return u.role === 'engineer' && u.area === 'CK'; });
    }
    else {
        targetEngineers = currentUsers.filter(function (u) { return u.role === 'engineer'; });
    }
    if (targetEngineers.length === 0) {
        var allEngineers = currentUsers.filter(function (u) { return u.role === 'engineer'; });
        if (allEngineers.length === 0)
            return null;
        targetEngineers = allEngineers;
    }
    var engineerOrderCount = {};
    targetEngineers.forEach(function (eng) {
        engineerOrderCount[eng.id] = workorders.filter(function (w) { return w.engineerId === eng.id && w.status !== 'completed'; }).length;
    });
    var sortedEngineers = __spreadArray([], targetEngineers, true).sort(function (a, b) {
        return (engineerOrderCount[a.id] || 0) - (engineerOrderCount[b.id] || 0);
    });
    return sortedEngineers[0] || null;
};
var createEmailTransporter = function () {
    return nodemailer_1.default.createTransport({
        host: systemSettings.smtpHost,
        port: systemSettings.smtpPort,
        secure: systemSettings.smtpSecure,
        auth: {
            user: systemSettings.smtpUsername,
            pass: systemSettings.smtpPassword
        }
    });
};
var sendEmail = function (to, subject, html) { return __awaiter(void 0, void 0, void 0, function () {
    var transporter, info, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!systemSettings.smtpPassword) {
                    console.log('邮件发送跳过：SMTP密码未配置');
                    return [2 /*return*/, true];
                }
                transporter = createEmailTransporter();
                return [4 /*yield*/, transporter.sendMail({
                        from: "\"IT\u62A5\u4FEE\u7CFB\u7EDF\" <".concat(systemSettings.smtpUsername, ">"),
                        to: to,
                        subject: subject,
                        html: html
                    })];
            case 1:
                info = _a.sent();
                console.log("\u90AE\u4EF6\u53D1\u9001\u6210\u529F: ".concat(info.messageId));
                return [2 /*return*/, true];
            case 2:
                error_1 = _a.sent();
                console.error('邮件发送失败:', error_1);
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
var USERS_FILE = path_1.default.join(DATA_DIR, 'users.json');
var defaultUsers = [
    { id: '1', username: 'admin', password: bcryptjs_1.default.hashSync('admin123', 10), name: '管理员', role: 'admin', area: '', email: 'admin@foxlink.com', webexId: 'admin', isActive: true, createTime: '2024-01-01 09:00:00' },
    { id: '2', username: 'chen', password: bcryptjs_1.default.hashSync('123456', 10), name: '陈工', role: 'engineer', area: 'A', email: 'chen@foxlink.com', webexId: 'chen', isActive: true, createTime: '2024-01-02 10:00:00' },
    { id: '3', username: 'li', password: bcryptjs_1.default.hashSync('123456', 10), name: '李工', role: 'engineer', area: 'CK', email: 'li@foxlink.com', webexId: 'li', isActive: true, createTime: '2024-01-03 11:00:00' },
    { id: '4', username: 'wang', password: bcryptjs_1.default.hashSync('123456', 10), name: '王工', role: 'engineer', area: 'A', email: 'wang@foxlink.com', webexId: 'wang', isActive: true, createTime: '2024-01-04 14:00:00' },
    { id: '5', username: 'zhao', password: bcryptjs_1.default.hashSync('123456', 10), name: '赵工', role: 'engineer', area: 'CK', email: 'zhao@foxlink.com', webexId: 'zhao', isActive: false, createTime: '2024-01-05 15:00:00' },
    { id: '6', username: 'operator', password: bcryptjs_1.default.hashSync('123456', 10), name: '运维员', role: 'operator', area: '', email: 'operator@foxlink.com', webexId: 'operator', isActive: true, createTime: '2024-01-06 09:00:00' }
];
var loadUsers = function () {
    try {
        if (fs_1.default.existsSync(USERS_FILE)) {
            var data = fs_1.default.readFileSync(USERS_FILE, 'utf8');
            return JSON.parse(data);
        }
        saveUsers(defaultUsers);
        return defaultUsers;
    }
    catch (error) {
        console.error('加载用户数据失败:', error);
        return defaultUsers;
    }
};
var saveUsers = function (userList) {
    try {
        if (!fs_1.default.existsSync(DATA_DIR)) {
            fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs_1.default.writeFileSync(USERS_FILE, JSON.stringify(userList, null, 2));
        console.log('用户数据已保存');
    }
    catch (error) {
        console.error('保存用户数据失败:', error);
    }
};
var users = loadUsers();
var verificationCodes = {};
app.post('/api/admin/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, freshUsers, user, token;
    return __generator(this, function (_b) {
        _a = req.body, username = _a.username, password = _a.password;
        freshUsers = loadUsers();
        user = freshUsers.find(function (u) { return u.username === username; });
        if (!user || !bcryptjs_1.default.compareSync(password, user.password)) {
            return [2 /*return*/, res.status(401).json({ success: false, message: '用户名或密码错误' })];
        }
        token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, config_1.config.jwtSecret, { expiresIn: '1h' });
        res.json({
            success: true,
            token: token,
            user: { id: user.id, username: user.username, name: user.name, role: user.role }
        });
        return [2 /*return*/];
    });
}); });
app.post('/api/admin/forgot-password', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, freshUsers, user, code, expiresAt, emailHtml;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.email;
                freshUsers = loadUsers();
                user = freshUsers.find(function (u) { return u.email === email; });
                if (!user) {
                    return [2 /*return*/, res.json({ success: false, message: '该邮箱未注册' })];
                }
                code = Math.random().toString(36).substring(2, 8).toUpperCase();
                expiresAt = Date.now() + 300000;
                verificationCodes[email] = { code: code, expiresAt: expiresAt };
                emailHtml = "\n    <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n      <h2 style=\"color: #1E3A5F; border-bottom: 2px solid #6BB3D9; padding-bottom: 10px;\">IT\u62A5\u4FEE\u7CFB\u7EDF - \u5BC6\u7801\u91CD\u7F6E</h2>\n      <p>\u5C0A\u656C\u7684 ".concat(user.name, " \u5148\u751F/\u5973\u58EB\uFF1A</p>\n      <p>\u60A8\u6B63\u5728\u8FDB\u884C\u5BC6\u7801\u91CD\u7F6E\u64CD\u4F5C\uFF0C\u4EE5\u4E0B\u662F\u60A8\u7684\u9A8C\u8BC1\u7801\uFF1A</p>\n      <div style=\"background: #f8fafc; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;\">\n        <span style=\"font-size: 32px; font-weight: bold; color: #1E3A5F;\">").concat(code, "</span>\n      </div>\n      <p>\u9A8C\u8BC1\u7801\u6709\u6548\u671F\u4E3A5\u5206\u949F\uFF0C\u8BF7\u53CA\u65F6\u4F7F\u7528\u3002</p>\n      <p style=\"color: #999; font-size: 12px;\">\u6B64\u90AE\u4EF6\u7531\u7CFB\u7EDF\u81EA\u52A8\u53D1\u9001\uFF0C\u8BF7\u52FF\u56DE\u590D\u3002</p>\n    </div>\n  ");
                return [4 /*yield*/, sendEmail(email, 'IT报修系统 - 密码重置验证码', emailHtml)];
            case 1:
                _a.sent();
                res.json({ success: true, message: '验证码已发送至您的邮箱' });
                return [2 /*return*/];
        }
    });
}); });
app.post('/api/admin/verify-code', function (req, res) {
    var _a = req.body, email = _a.email, code = _a.code;
    var stored = verificationCodes[email];
    if (!stored) {
        return res.json({ success: false, message: '请先获取验证码' });
    }
    if (Date.now() > stored.expiresAt) {
        delete verificationCodes[email];
        return res.json({ success: false, message: '验证码已过期，请重新获取' });
    }
    if (stored.code !== code.toUpperCase()) {
        return res.json({ success: false, message: '验证码错误' });
    }
    res.json({ success: true, message: '验证码验证成功' });
});
app.post('/api/admin/reset-password', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, code, newPassword, stored, freshUsers, userIndex;
    return __generator(this, function (_b) {
        _a = req.body, email = _a.email, code = _a.code, newPassword = _a.newPassword;
        stored = verificationCodes[email];
        if (!stored) {
            return [2 /*return*/, res.json({ success: false, message: '请先获取验证码' })];
        }
        if (Date.now() > stored.expiresAt) {
            delete verificationCodes[email];
            return [2 /*return*/, res.json({ success: false, message: '验证码已过期，请重新获取' })];
        }
        if (stored.code !== code.toUpperCase()) {
            return [2 /*return*/, res.json({ success: false, message: '验证码错误' })];
        }
        freshUsers = loadUsers();
        userIndex = freshUsers.findIndex(function (u) { return u.email === email; });
        if (userIndex === -1) {
            return [2 /*return*/, res.json({ success: false, message: '用户不存在' })];
        }
        freshUsers[userIndex].password = bcryptjs_1.default.hashSync(newPassword, 10);
        saveUsers(freshUsers);
        delete verificationCodes[email];
        res.json({ success: true, message: '密码重置成功，请使用新密码登录' });
        return [2 /*return*/];
    });
}); });
app.get('/api/admin/me', authenticateToken, function (req, res) {
    var userId = req.user.id;
    var freshUsers = loadUsers();
    var user = freshUsers.find(function (u) { return u.id === userId; });
    if (!user) {
        return res.status(404).json({ success: false, message: '用户不存在' });
    }
    res.json({
        success: true,
        user: { id: user.id, username: user.username, name: user.name, role: user.role }
    });
});
app.get('/api/admin/users', authenticateToken, function (_req, res) {
    var freshUsers = loadUsers();
    res.json({
        success: true,
        data: freshUsers.map(function (u) { return ({
            id: u.id,
            username: u.username,
            name: u.name,
            role: u.role,
            area: u.area,
            email: u.email,
            webexId: u.webexId,
            isActive: u.isActive,
            createTime: u.createTime
        }); })
    });
});
app.post('/api/admin/users', authenticateToken, function (req, res) {
    var _a = req.body, username = _a.username, name = _a.name, role = _a.role, area = _a.area, email = _a.email, webexId = _a.webexId;
    if (!email && !webexId) {
        return res.json({ success: false, message: '请至少填写邮箱或Webex ID中的一项' });
    }
    var newUser = {
        id: Date.now().toString(),
        username: username,
        password: bcryptjs_1.default.hashSync('123456', 10),
        name: name,
        role: role,
        area: area || '',
        email: email || '',
        webexId: webexId || '',
        isActive: true,
        createTime: new Date().toLocaleString('zh-CN')
    };
    users.push(newUser);
    saveUsers(users);
    res.json({ success: true, data: __assign(__assign({}, newUser), { password: '' }) });
});
app.put('/api/admin/users/:id', authenticateToken, function (req, res) {
    var id = req.params.id;
    var _a = req.body, name = _a.name, role = _a.role, area = _a.area, isActive = _a.isActive, email = _a.email, webexId = _a.webexId;
    var freshUsers = loadUsers();
    var userIndex = freshUsers.findIndex(function (u) { return u.id === id; });
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: '用户不存在' });
    }
    freshUsers[userIndex] = __assign(__assign({}, freshUsers[userIndex]), { name: name, role: role, area: area, isActive: isActive, email: email || freshUsers[userIndex].email, webexId: webexId || freshUsers[userIndex].webexId });
    saveUsers(freshUsers);
    res.json({ success: true, data: __assign(__assign({}, freshUsers[userIndex]), { password: '' }) });
});
app.delete('/api/admin/users/:id', authenticateToken, function (req, res) {
    var id = req.params.id;
    var freshUsers = loadUsers();
    var userIndex = freshUsers.findIndex(function (u) { return u.id === id; });
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: '用户不存在' });
    }
    freshUsers.splice(userIndex, 1);
    saveUsers(freshUsers);
    res.json({ success: true, message: '删除成功' });
});
app.post('/api/workorder/submit', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, applicantName, department, location, extension, email, webexId, assetNo, deviceType, deviceLocation, projectId, description, repairType, notificationChannels, priority, area, assignedEngineer, newOrder, emailHtml, emailHtml;
    return __generator(this, function (_b) {
        _a = req.body, applicantName = _a.applicantName, department = _a.department, location = _a.location, extension = _a.extension, email = _a.email, webexId = _a.webexId, assetNo = _a.assetNo, deviceType = _a.deviceType, deviceLocation = _a.deviceLocation, projectId = _a.projectId, description = _a.description, repairType = _a.repairType, notificationChannels = _a.notificationChannels, priority = _a.priority, area = _a.area;
        assignedEngineer = assignEngineer(department);
        newOrder = {
            id: Date.now().toString(),
            orderNo: "WO-".concat(new Date().getFullYear()).concat(String(new Date().getMonth() + 1).padStart(2, '0')).concat(String(new Date().getDate()).padStart(2, '0'), "-").concat(String(workorders.length + 1).padStart(3, '0')),
            applicantName: applicantName,
            department: department,
            location: location,
            extension: extension,
            email: email,
            webexId: webexId,
            assetNo: assetNo,
            deviceType: deviceType,
            deviceLocation: deviceLocation,
            projectId: projectId,
            projectName: ['系统故障', '网络故障', '硬件故障', '软件问题', '设备升级', '数据恢复', '其他问题'][parseInt(projectId) - 1] || '其他问题',
            description: description,
            repairType: repairType,
            notificationChannels: notificationChannels,
            priority: priority,
            status: assignedEngineer ? 'assigned' : 'pending',
            area: area,
            engineerId: (assignedEngineer === null || assignedEngineer === void 0 ? void 0 : assignedEngineer.id) || '',
            engineerName: (assignedEngineer === null || assignedEngineer === void 0 ? void 0 : assignedEngineer.name) || '',
            statusLog: assignedEngineer ? "\u5DE5\u5355\u5DF2\u5206\u914D\u7ED9\u5DE5\u7A0B\u5E08 ".concat(assignedEngineer.name) : '',
            createTime: new Date().toLocaleString('zh-CN'),
            updateTime: new Date().toLocaleString('zh-CN')
        };
        workorders.push(newOrder);
        saveWorkorders(workorders);
        if (assignedEngineer) {
            if (assignedEngineer.email) {
                emailHtml = "\n        <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n          <h2 style=\"color: #1E3A5F; border-bottom: 2px solid #6BB3D9; padding-bottom: 10px;\">IT\u62A5\u4FEE\u7CFB\u7EDF - \u65B0\u5DE5\u5355\u5206\u914D</h2>\n          <p>\u5C0A\u656C\u7684 ".concat(assignedEngineer.name, " \u5DE5\u7A0B\u5E08\uFF1A</p>\n          <p>\u60A8\u6709\u65B0\u7684\u62A5\u4FEE\u5DE5\u5355\u9700\u8981\u5904\u7406\uFF0C\u4EE5\u4E0B\u662F\u5DE5\u5355\u8BE6\u60C5\uFF1A</p>\n          <table style=\"width: 100%; border-collapse: collapse; margin: 15px 0;\">\n            <tr><td style=\"padding: 8px; border-bottom: 1px solid #eee;\"><strong>\u5DE5\u5355\u53F7\uFF1A</strong></td><td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(newOrder.orderNo, "</td></tr>\n            <tr><td style=\"padding: 8px; border-bottom: 1px solid #eee;\"><strong>\u7533\u8BF7\u4EBA\uFF1A</strong></td><td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(applicantName, "</td></tr>\n            <tr><td style=\"padding: 8px; border-bottom: 1px solid #eee;\"><strong>\u533A\u57DF\uFF1A</strong></td><td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(department, "</td></tr>\n            <tr><td style=\"padding: 8px; border-bottom: 1px solid #eee;\"><strong>\u8BBE\u5907\u7C7B\u578B\uFF1A</strong></td><td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(deviceType, "</td></tr>\n            <tr><td style=\"padding: 8px; border-bottom: 1px solid #eee;\"><strong>\u7D27\u6025\u7B49\u7EA7\uFF1A</strong></td><td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(priority === 'urgent' ? '紧急' : '普通', "</td></tr>\n            <tr><td style=\"padding: 8px;\"><strong>\u6545\u969C\u63CF\u8FF0\uFF1A</strong></td><td style=\"padding: 8px;\">").concat(description, "</td></tr>\n          </table>\n          <p>\u8BF7\u53CA\u65F6\u5904\u7406\u5DE5\u5355\uFF0C\u611F\u8C22\u60A8\u7684\u652F\u6301\uFF01</p>\n          <p><a href=\"").concat(systemSettings.systemUrl, "/admin/workorders\" style=\"color: #6BB3D9; text-decoration: none;\">\u70B9\u51FB\u67E5\u770B\u5DE5\u5355\u8BE6\u60C5</a></p>\n          <p style=\"color: #999; font-size: 12px;\">\u6B64\u90AE\u4EF6\u7531\u7CFB\u7EDF\u81EA\u52A8\u53D1\u9001\uFF0C\u8BF7\u52FF\u56DE\u590D\u3002</p>\n        </div>\n      ");
                sendEmail(assignedEngineer.email, "\u65B0\u5DE5\u5355\u5206\u914D - ".concat(newOrder.orderNo), emailHtml);
            }
        }
        if (notificationChannels.includes('email') && email) {
            emailHtml = "\n      <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n        <h2 style=\"color: #1E3A5F; border-bottom: 2px solid #6BB3D9; padding-bottom: 10px;\">IT\u62A5\u4FEE\u7CFB\u7EDF - \u5DE5\u5355\u63D0\u4EA4\u6210\u529F</h2>\n        <p>\u5C0A\u656C\u7684 ".concat(applicantName, " \u5148\u751F/\u5973\u58EB\uFF1A</p>\n        <p>\u60A8\u7684\u62A5\u4FEE\u5DE5\u5355\u5DF2\u6210\u529F\u63D0\u4EA4\uFF0C\u4EE5\u4E0B\u662F\u5DE5\u5355\u8BE6\u60C5\uFF1A</p>\n        <table style=\"width: 100%; border-collapse: collapse; margin: 15px 0;\">\n          <tr><td style=\"padding: 8px; border-bottom: 1px solid #eee;\"><strong>\u5DE5\u5355\u53F7\uFF1A</strong></td><td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(newOrder.orderNo, "</td></tr>\n          <tr><td style=\"padding: 8px; border-bottom: 1px solid #eee;\"><strong>\u8BBE\u5907\u7C7B\u578B\uFF1A</strong></td><td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(deviceType, "</td></tr>\n          <tr><td style=\"padding: 8px; border-bottom: 1px solid #eee;\"><strong>\u8D44\u4EA7\u7F16\u53F7\uFF1A</strong></td><td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(assetNo, "</td></tr>\n          <tr><td style=\"padding: 8px; border-bottom: 1px solid #eee;\"><strong>\u7D27\u6025\u7B49\u7EA7\uFF1A</strong></td><td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(priority === 'urgent' ? '紧急' : '普通', "</td></tr>\n          <tr><td style=\"padding: 8px;\"><strong>\u6545\u969C\u63CF\u8FF0\uFF1A</strong></td><td style=\"padding: 8px;\">").concat(description, "</td></tr>\n        </table>\n        <p>\u7CFB\u7EDF\u5C06\u5C3D\u5FEB\u4E3A\u60A8\u5206\u914D\u5DE5\u7A0B\u5E08\u5904\u7406\uFF0C\u8BF7\u4FDD\u6301\u901A\u8BAF\u7545\u901A\u3002</p>\n        <p>\u60A8\u53EF\u4EE5\u901A\u8FC7\u4EE5\u4E0B\u94FE\u63A5\u67E5\u770B\u5DE5\u5355\u8FDB\u5EA6\uFF1A</p>\n        <p><a href=\"").concat(systemSettings.systemUrl, "/workorder/").concat(newOrder.id, "\" style=\"color: #6BB3D9; text-decoration: none;\">").concat(systemSettings.systemUrl, "/workorder/").concat(newOrder.id, "</a></p>\n        <p style=\"color: #999; font-size: 12px;\">\u6B64\u90AE\u4EF6\u7531\u7CFB\u7EDF\u81EA\u52A8\u53D1\u9001\uFF0C\u8BF7\u52FF\u56DE\u590D\u3002</p>\n      </div>\n    ");
            sendEmail(email, "\u5DE5\u5355\u63D0\u4EA4\u6210\u529F - ".concat(newOrder.orderNo), emailHtml);
        }
        res.json({ success: true, orderNo: newOrder.orderNo, message: '工单提交成功' });
        return [2 /*return*/];
    });
}); });
app.get('/api/workorder/list', function (req, res) {
    var _a = req.query, status = _a.status, area = _a.area, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.size, size = _c === void 0 ? 10 : _c;
    var filteredOrders = workorders;
    if (status) {
        filteredOrders = filteredOrders.filter(function (o) { return o.status === status; });
    }
    if (area) {
        filteredOrders = filteredOrders.filter(function (o) { return o.area === area; });
    }
    var start = (Number(page) - 1) * Number(size);
    var end = start + Number(size);
    res.json({
        success: true,
        data: filteredOrders.slice(start, end),
        total: filteredOrders.length
    });
});
app.get('/api/workorder/:id', function (req, res) {
    var id = req.params.id;
    var order = workorders.find(function (o) { return o.id === id; });
    if (!order) {
        return res.status(404).json({ success: false, message: '工单不存在' });
    }
    res.json({ success: true, data: order });
});
app.post('/api/workorder/:id/accept', authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, order, freshUsers, user, emailHtml;
    return __generator(this, function (_a) {
        id = req.params.id;
        userId = req.user.id;
        order = workorders.find(function (o) { return o.id === id; });
        if (!order) {
            return [2 /*return*/, res.status(404).json({ success: false, message: '工单不存在' })];
        }
        if (order.status !== 'pending') {
            return [2 /*return*/, res.status(400).json({ success: false, message: '工单状态不允许接单' })];
        }
        freshUsers = loadUsers();
        user = freshUsers.find(function (u) { return u.id === userId; });
        order.status = 'accepted';
        order.engineerId = userId;
        order.engineerName = (user === null || user === void 0 ? void 0 : user.name) || '';
        order.updateTime = new Date().toLocaleString('zh-CN');
        saveWorkorders(workorders);
        if (user === null || user === void 0 ? void 0 : user.email) {
            emailHtml = "\n      <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n        <h2 style=\"color: #1E3A5F; border-bottom: 2px solid #6BB3D9; padding-bottom: 10px;\">IT\u62A5\u4FEE\u7CFB\u7EDF - \u65B0\u5DE5\u5355\u901A\u77E5</h2>\n        <p>\u5C0A\u656C\u7684 ".concat(user.name, " \u5148\u751F/\u5973\u58EB\uFF1A</p>\n        <p>\u60A8\u6709\u65B0\u7684\u62A5\u4FEE\u5DE5\u5355\u9700\u8981\u5904\u7406\uFF1A</p>\n        <table style=\"width: 100%; border-collapse: collapse; margin: 15px 0;\">\n          <tr><td style=\"padding: 8px; border-bottom: 1px solid #eee;\"><strong>\u5DE5\u5355\u53F7\uFF1A</strong></td><td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(order.orderNo, "</td></tr>\n          <tr><td style=\"padding: 8px; border-bottom: 1px solid #eee;\"><strong>\u8BBE\u5907\u7C7B\u578B\uFF1A</strong></td><td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(order.deviceType, "</td></tr>\n          <tr><td style=\"padding: 8px; border-bottom: 1px solid #eee;\"><strong>\u7533\u8BF7\u4EBA\uFF1A</strong></td><td style=\"padding: 8px; border-bottom: 1px solid #eee;\">").concat(order.applicantName, "</td></tr>\n          <tr><td style=\"padding: 8px;\"><strong>\u6545\u969C\u63CF\u8FF0\uFF1A</strong></td><td style=\"padding: 8px;\">").concat(order.description, "</td></tr>\n        </table>\n        <p>\u8BF7\u5C3D\u5FEB\u5904\u7406\u5DE5\u5355\u3002</p>\n        <p style=\"color: #999; font-size: 12px;\">\u6B64\u90AE\u4EF6\u7531\u7CFB\u7EDF\u81EA\u52A8\u53D1\u9001\uFF0C\u8BF7\u52FF\u56DE\u590D\u3002</p>\n      </div>\n    ");
            sendEmail(user.email, "\u65B0\u5DE5\u5355\u901A\u77E5 - ".concat(order.orderNo), emailHtml);
        }
        res.json({ success: true, message: '接单成功' });
        return [2 /*return*/];
    });
}); });
app.post('/api/workorder/:id/start', authenticateToken, function (req, res) {
    var id = req.params.id;
    var order = workorders.find(function (o) { return o.id === id; });
    if (!order) {
        return res.status(404).json({ success: false, message: '工单不存在' });
    }
    if (order.status !== 'accepted') {
        return res.status(400).json({ success: false, message: '工单状态不允许开始处理' });
    }
    order.status = 'processing';
    order.updateTime = new Date().toLocaleString('zh-CN');
    saveWorkorders(workorders);
    res.json({ success: true, message: '开始处理' });
});
app.post('/api/workorder/:id/complete', authenticateToken, function (req, res) {
    var id = req.params.id;
    var order = workorders.find(function (o) { return o.id === id; });
    if (!order) {
        return res.status(404).json({ success: false, message: '工单不存在' });
    }
    if (order.status !== 'processing') {
        return res.status(400).json({ success: false, message: '工单状态不允许完成' });
    }
    order.status = 'completed';
    order.updateTime = new Date().toLocaleString('zh-CN');
    saveWorkorders(workorders);
    res.json({ success: true, message: '维修完成' });
});
app.post('/api/workorder/:id/close', authenticateToken, function (req, res) {
    var id = req.params.id;
    var order = workorders.find(function (o) { return o.id === id; });
    if (!order) {
        return res.status(404).json({ success: false, message: '工单不存在' });
    }
    if (order.status !== 'completed') {
        return res.status(400).json({ success: false, message: '工单状态不允许结案' });
    }
    order.status = 'closed';
    order.updateTime = new Date().toLocaleString('zh-CN');
    saveWorkorders(workorders);
    res.json({ success: true, message: '结案成功' });
});
app.post('/api/workorder/:id/external', authenticateToken, function (req, res) {
    var id = req.params.id;
    var _a = req.body, reason = _a.reason, parts = _a.parts, estimatedCost = _a.estimatedCost, repairCompany = _a.repairCompany;
    var order = workorders.find(function (o) { return o.id === id; });
    if (!order) {
        return res.status(404).json({ success: false, message: '工单不存在' });
    }
    if (order.status !== 'processing') {
        return res.status(400).json({ success: false, message: '工单状态不允许申请外修' });
    }
    res.json({ success: true, message: '外修申请已提交', data: { reason: reason, parts: parts, estimatedCost: estimatedCost, repairCompany: repairCompany } });
});
app.get('/api/admin/groups', authenticateToken, function (_req, res) {
    var groups = [
        { id: '1', name: 'A区维修组', area: 'A', description: '负责A区所有办公区域、设备报修工单', isActive: true, members: users.filter(function (u) { return u.role === 'engineer' && u.area === 'A'; }) },
        { id: '2', name: 'CK区维修组', area: 'CK', description: '负责CK区所有区域、设备报修工单', isActive: true, members: users.filter(function (u) { return u.role === 'engineer' && u.area === 'CK'; }) }
    ];
    res.json({ success: true, data: groups });
});
app.post('/api/admin/groups', authenticateToken, function (req, res) {
    var _a = req.body, name = _a.name, area = _a.area, description = _a.description;
    res.json({ success: true, message: '分组创建成功', data: { id: Date.now().toString(), name: name, area: area, description: description, isActive: true, members: [] } });
});
app.post('/api/admin/groups/:id/members', authenticateToken, function (_req, res) {
    res.json({ success: true, message: '成员添加成功' });
});
app.delete('/api/admin/groups/:id/members/:userId', authenticateToken, function (_req, res) {
    res.json({ success: true, message: '成员移除成功' });
});
app.get('/api/admin/projects', authenticateToken, function (_req, res) {
    var projects = loadProjects();
    res.json({ success: true, data: projects });
});
app.post('/api/admin/projects', authenticateToken, function (req, res) {
    var _a = req.body, name = _a.name, category = _a.category, description = _a.description, sortOrder = _a.sortOrder;
    var projects = loadProjects();
    var newProject = {
        id: Date.now().toString(),
        name: name,
        category: category,
        description: description,
        sortOrder: sortOrder || projects.length + 1,
        isActive: true
    };
    projects.push(newProject);
    saveProjects(projects);
    res.json({ success: true, message: '项目创建成功', data: newProject });
});
app.put('/api/admin/projects/:id', authenticateToken, function (req, res) {
    var id = req.params.id;
    var _a = req.body, name = _a.name, category = _a.category, description = _a.description, sortOrder = _a.sortOrder, isActive = _a.isActive;
    var projects = loadProjects();
    var projectIndex = projects.findIndex(function (p) { return p.id === id; });
    if (projectIndex === -1) {
        return res.status(404).json({ success: false, message: '项目不存在' });
    }
    projects[projectIndex] = __assign(__assign({}, projects[projectIndex]), { name: name, category: category, description: description, sortOrder: sortOrder, isActive: isActive });
    saveProjects(projects);
    res.json({ success: true, message: '项目更新成功', data: projects[projectIndex] });
});
app.delete('/api/admin/projects/:id', authenticateToken, function (req, res) {
    var id = req.params.id;
    var projects = loadProjects();
    var projectIndex = projects.findIndex(function (p) { return p.id === id; });
    if (projectIndex === -1) {
        return res.status(404).json({ success: false, message: '项目不存在' });
    }
    projects.splice(projectIndex, 1);
    saveProjects(projects);
    res.json({ success: true, message: '项目删除成功' });
});
app.get('/api/admin/statistics', authenticateToken, function (_req, res) {
    var completedCount = workorders.filter(function (o) { return o.status === 'completed' || o.status === 'closed'; }).length;
    res.json({
        success: true,
        data: {
            totalOrders: workorders.length,
            completedOrders: completedCount,
            pendingOrders: workorders.filter(function (o) { return o.status === 'pending'; }).length,
            averageDuration: 2.3,
            engineerStats: [
                { engineerId: '2', name: '陈工', acceptedCount: 15, completedCount: 14, avgDuration: 2.1 },
                { engineerId: '3', name: '李工', acceptedCount: 12, completedCount: 11, avgDuration: 2.5 }
            ],
            areaStats: [
                { area: 'A', orderCount: workorders.filter(function (o) { return o.area === 'A'; }).length, completionRate: 93 },
                { area: 'CK', orderCount: workorders.filter(function (o) { return o.area === 'CK'; }).length, completionRate: 89 }
            ]
        }
    });
});
app.post('/api/admin/settings/test-webex', authenticateToken, function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var webexUrl, message, response, errorData, msg, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!systemSettings.webexToken || !systemSettings.webexRoomId) {
                    return [2 /*return*/, res.json({ success: false, message: 'Webex配置不完整，请先配置Token和Room ID' })];
                }
                webexUrl = "https://webexapis.com/v1/messages";
                message = {
                    roomId: systemSettings.webexRoomId,
                    text: 'IT报修系统 - Webex测试消息\n\n这是一条测试消息，说明Webex通知功能配置正确！'
                };
                return [4 /*yield*/, fetch(webexUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': "Bearer ".concat(systemSettings.webexToken),
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(message)
                    })];
            case 1:
                response = _a.sent();
                if (!response.ok) return [3 /*break*/, 2];
                res.json({ success: true, message: 'Webex消息发送成功！' });
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, response.json().catch(function () { return ({ message: '未知错误' }); })];
            case 3:
                errorData = _a.sent();
                msg = (errorData === null || errorData === void 0 ? void 0 : errorData.message) || response.statusText;
                res.json({ success: false, message: "Webex\u6D88\u606F\u53D1\u9001\u5931\u8D25: ".concat(msg) });
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                console.error('Webex消息发送错误:', error_2);
                res.json({ success: false, message: "Webex\u6D88\u606F\u53D1\u9001\u5931\u8D25: ".concat(error_2.message) });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.get('/api/admin/settings', authenticateToken, function (_req, res) {
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
    });
});
app.put('/api/admin/settings', authenticateToken, function (req, res) {
    var _a = req.body, smtpHost = _a.smtpHost, smtpPort = _a.smtpPort, smtpUsername = _a.smtpUsername, smtpPassword = _a.smtpPassword, smtpSecure = _a.smtpSecure, webexToken = _a.webexToken, webexRoomId = _a.webexRoomId, extensionServer = _a.extensionServer, extensionPort = _a.extensionPort, systemUrl = _a.systemUrl;
    if (smtpHost !== undefined)
        systemSettings.smtpHost = smtpHost;
    if (smtpPort !== undefined)
        systemSettings.smtpPort = smtpPort;
    if (smtpUsername !== undefined)
        systemSettings.smtpUsername = smtpUsername;
    if (smtpPassword !== undefined)
        systemSettings.smtpPassword = smtpPassword;
    if (smtpSecure !== undefined)
        systemSettings.smtpSecure = smtpSecure;
    if (webexToken !== undefined)
        systemSettings.webexToken = webexToken;
    if (webexRoomId !== undefined)
        systemSettings.webexRoomId = webexRoomId;
    if (extensionServer !== undefined)
        systemSettings.extensionServer = extensionServer;
    if (extensionPort !== undefined)
        systemSettings.extensionPort = extensionPort;
    if (systemUrl !== undefined)
        systemSettings.systemUrl = systemUrl;
    saveSettings(systemSettings);
    res.json({ success: true, message: '设置更新成功', data: systemSettings });
});
app.post('/api/admin/settings/test-email', authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var toEmail, emailHtml, success, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                toEmail = req.body.testEmail;
                if (!systemSettings.smtpPassword) {
                    return [2 /*return*/, res.json({ success: false, message: '请先配置SMTP密码' })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                emailHtml = "\n      <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n        <h2 style=\"color: #1E3A5F; border-bottom: 2px solid #6BB3D9; padding-bottom: 10px;\">IT\u62A5\u4FEE\u7CFB\u7EDF - \u90AE\u4EF6\u6D4B\u8BD5</h2>\n        <p>\u8FD9\u662F\u4E00\u5C01\u6D4B\u8BD5\u90AE\u4EF6\uFF0C\u8BF4\u660ESMTP\u914D\u7F6E\u5DF2\u751F\u6548\u3002</p>\n        <p style=\"color: #999; font-size: 12px;\">\u6B64\u90AE\u4EF6\u7531\u7CFB\u7EDF\u81EA\u52A8\u53D1\u9001\uFF0C\u8BF7\u52FF\u56DE\u590D\u3002</p>\n      </div>\n    ";
                return [4 /*yield*/, sendEmail(toEmail, 'IT报修系统 - 邮件测试', emailHtml)];
            case 2:
                success = _a.sent();
                if (success) {
                    res.json({ success: true, message: '测试邮件发送成功' });
                }
                else {
                    res.json({ success: false, message: '测试邮件发送失败，请检查SMTP配置' });
                }
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                res.json({ success: false, message: '测试邮件发送失败: ' + error_3.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.use(express_1.default.static(config_1.config.staticPath));
app.get('/', function (_req, res) {
    var indexPath = path_1.default.join(config_1.config.staticPath, 'index.html');
    if (fs_1.default.existsSync(indexPath)) {
        res.sendFile(indexPath);
    }
    else {
        res.send(generateDefaultHomePage(config_1.config.httpsPort));
    }
});
app.get('*', function (_req, res) {
    var indexPath = path_1.default.join(config_1.config.staticPath, 'index.html');
    if (fs_1.default.existsSync(indexPath)) {
        res.sendFile(indexPath);
    }
    else {
        res.send("\n      <!DOCTYPE html>\n      <html lang=\"zh-CN\">\n      <head>\n        <meta charset=\"UTF-8\">\n        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n        <title>IT\u8BBE\u5907\u62A5\u4FEE\u7CFB\u7EDF</title>\n        <style>\n          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; text-align: center; background: linear-gradient(135deg, #E3F2FD 0%, #E8F5E9 100%); min-height: 100vh; }\n          .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }\n          .logo { width: 60px; height: 60px; margin: 0 auto 20px; background: linear-gradient(135deg, #6BB3D9 0%, #7ED3A5 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 30px; color: white; }\n          h1 { color: #333; margin-bottom: 10px; }\n          p { color: #666; margin-bottom: 20px; }\n          .btn { display: inline-block; padding: 10px 20px; background: #6BB3D9; color: white; text-decoration: none; border-radius: 4px; margin: 5px; }\n          .btn:hover { background: #5a9bc7; }\n        </style>\n      </head>\n      <body>\n        <div class=\"container\">\n          <div class=\"logo\">\uD83D\uDD27</div>\n          <h1>\u9875\u9762\u5EFA\u8BBE\u4E2D</h1>\n          <p>\u8BE5\u9875\u9762\u6B63\u5728\u5EFA\u8BBE\u4E2D\uFF0C\u8BF7\u7A0D\u540E\u8BBF\u95EE</p>\n          <p>\n            <a href=\"/\" class=\"btn\">\u8FD4\u56DE\u9996\u9875</a>\n            <a href=\"/repair\" class=\"btn\">\u63D0\u4EA4\u62A5\u4FEE</a>\n            <a href=\"/workorders\" class=\"btn\">\u5DE5\u5355\u67E5\u8BE2</a>\n          </p>\n        </div>\n      </body>\n      </html>\n    ");
    }
});
function generateDefaultHomePage(httpsPort) {
    return "\n    <!DOCTYPE html>\n    <html lang=\"zh-CN\">\n    <head>\n      <meta charset=\"UTF-8\">\n      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n      <title>IT\u8BBE\u5907\u626B\u7801\u62A5\u4FEE\u7CFB\u7EDF</title>\n      <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #E3F2FD 0%, #E8F5E9 100%); min-height: 100vh; }\n        .header { background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 20px; }\n        .header-content { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }\n        .logo { display: flex; align-items: center; gap: 12px; }\n        .logo-icon { width: 50px; height: 50px; background: linear-gradient(135deg, #6BB3D9 0%, #7ED3A5 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white; }\n        .logo-text h1 { color: #333; font-size: 20px; }\n        .logo-text p { color: #666; font-size: 12px; }\n        .nav-links { display: flex; gap: 20px; }\n        .nav-links a { text-decoration: none; color: #666; padding: 8px 16px; border-radius: 8px; transition: all 0.3s; }\n        .nav-links a:hover { background: #f0f0f0; color: #333; }\n        .hero { max-width: 1200px; margin: 40px auto; padding: 0 20px; }\n        .hero-content { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 60px; text-align: center; }\n        .hero-icon { width: 100px; height: 100px; background: linear-gradient(135deg, #6BB3D9 0%, #7ED3A5 100%); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 48px; color: white; margin: 0 auto 24px; }\n        .hero h2 { color: #333; font-size: 32px; margin-bottom: 16px; }\n        .hero p { color: #666; font-size: 16px; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto; }\n        .cta-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }\n        .btn { padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 500; transition: all 0.3s; }\n        .btn-primary { background: linear-gradient(135deg, #6BB3D9 0%, #7ED3A5 100%); color: white; }\n        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(107, 179, 217, 0.4); }\n        .btn-secondary { background: white; color: #6BB3D9; border: 2px solid #6BB3D9; }\n        .btn-secondary:hover { background: #f0f8fc; }\n        .api-status { background: #f8f9fa; border-radius: 8px; padding: 16px; margin-top: 24px; text-align: left; }\n        .api-status h4 { color: #333; margin-bottom: 12px; }\n        .api-status p { color: #666; font-size: 13px; margin-bottom: 8px; }\n        .api-status .success { color: #28a745; font-weight: bold; }\n        .api-status .info { color: #17a2b8; }\n      </style>\n    </head>\n    <body>\n      <div class=\"header\">\n        <div class=\"header-content\">\n          <div class=\"logo\">\n            <div class=\"logo-icon\">\uD83D\uDD27</div>\n            <div class=\"logo-text\">\n              <h1>IT\u8BBE\u5907\u626B\u7801\u62A5\u4FEE\u7CFB\u7EDF</h1>\n              <p>\u4F01\u4E1A\u4E13\u5C5EIT\u8BBE\u5907\u62A5\u4FEE\u7BA1\u7406\u5E73\u53F0</p>\n            </div>\n          </div>\n          <div class=\"nav-links\">\n            <a href=\"/\">\u9996\u9875</a>\n            <a href=\"/repair\">\u63D0\u4EA4\u62A5\u4FEE</a>\n            <a href=\"/workorders\">\u5DE5\u5355\u67E5\u8BE2</a>\n            <a href=\"/admin/login\">\u7BA1\u7406\u5458</a>\n          </div>\n        </div>\n      </div>\n      <div class=\"hero\">\n        <div class=\"hero-content\">\n          <div class=\"hero-icon\">\uD83D\uDEE0\uFE0F</div>\n          <h2>\u9AD8\u6548\u7BA1\u7406IT\u8BBE\u5907\u62A5\u4FEE\u6D41\u7A0B</h2>\n          <p>\u652F\u6301\u626B\u7801\u62A5\u4FEE\u3001\u591A\u6E20\u9053\u901A\u77E5\u3001\u5DE5\u7A0B\u5E08\u5206\u7EC4\u7BA1\u7406\uFF0C\u8BA9IT\u8FD0\u7EF4\u66F4\u52A0\u9AD8\u6548\u4FBF\u6377</p>\n          <div class=\"cta-buttons\">\n            <a href=\"/repair\" class=\"btn btn-primary\">\u7ACB\u5373\u62A5\u4FEE</a>\n            <a href=\"/workorders\" class=\"btn btn-secondary\">\u67E5\u8BE2\u5DE5\u5355</a>\n          </div>\n          <div class=\"api-status\">\n            <h4>\uD83D\uDCCA \u7CFB\u7EDF\u72B6\u6001</h4>\n            <p><span class=\"success\">\u2705</span> \u540E\u7AEFAPI\u670D\u52A1\u8FD0\u884C\u6B63\u5E38</p>\n            <p><span class=\"info\">\uD83D\uDCCD</span> API\u5730\u5740: <strong>http://localhost:".concat(config_1.config.httpPort, "/api</strong></p>\n            <p><span class=\"info\">\uD83D\uDCCD</span> HTTPS\u5730\u5740: <strong>https://localhost:").concat(httpsPort, "/api</strong></p>\n          </div>\n        </div>\n      </div>\n    </body>\n    </html>\n  ");
}
if (SSL_OPTIONS.key && SSL_OPTIONS.cert) {
    https_1.default.createServer(SSL_OPTIONS, app).listen(config_1.config.httpsPort, function () {
        console.log("HTTPS Server is running on https://localhost:".concat(config_1.config.httpsPort));
        console.log("\u8BC1\u4E66\u8DEF\u5F84: ".concat(config_1.config.certPath));
    });
    app.listen(config_1.config.httpPort, function () {
        console.log("HTTP Server is running on http://localhost:".concat(config_1.config.httpPort));
        console.log("HTTP\u8BF7\u6C42\u5C06\u81EA\u52A8\u91CD\u5B9A\u5411\u5230HTTPS");
    });
}
else {
    console.log('警告: 未找到SSL证书，仅启动HTTP服务');
    app.listen(config_1.config.httpPort, function () {
        console.log("Server is running on http://localhost:".concat(config_1.config.httpPort));
    });
}
