# 🌐 ChatBI Agent 外网访问完整指南

## 📋 目录

- [快速开始](#快速开始)
- [方案对比](#方案对比)
- [局域网访问](#局域网访问)
- [ngrok 外网访问](#ngrok-外网访问)
- [云服务器部署](#云服务器部署)
- [安全注意事项](#安全注意事项)

---

## 🚀 快速开始

### 方案选择指南

```
需要访问范围       推荐方案              难度      成本
─────────────────────────────────────────────────────
仅自己使用        本地访问              ⭐       免费
局域网内共享      局域网访问            ⭐⭐     免费
临时外网分享      ngrok                ⭐⭐⭐   免费/付费
长期外网访问      云服务器部署          ⭐⭐⭐⭐  付费
```

---

## 📊 方案对比

### 方案 1: 局域网访问 ✅ **已配置**
- **适用场景**: 家庭/办公室内部分享
- **优点**: 免费、快速、安全
- **缺点**: 仅限同一网络
- **地址**: http://192.168.31.12:5173

### 方案 2: ngrok 穿透
- **适用场景**: 临时外网访问、测试演示
- **优点**: 设置简单、免费、HTTPS
- **缺点**: 地址变化、有流量限制
- **地址**: https://xxx.ngrok.io (动态)

### 方案 3: 云服务器部署
- **适用场景**: 生产环境、长期使用
- **优点**: 稳定、固定地址、高性能
- **缺点**: 需要配置、付费
- **地址**: 自定义域名

---

## 🏠 局域网访问

### ✅ **已自动配置完成**

#### 访问地址
```bash
# 主要地址
http://192.168.31.12:5173

# 备用地址
http://192.168.255.10:5173
```

#### 使用方法
1. **确保设备在同一 WiFi 网络**
   - 手机连接到与电脑相同的 WiFi
   - 其他电脑连接到相同网络

2. **在浏览器中访问**
   ```
   http://192.168.31.12:5173
   ```

3. **测试连接**
   ```bash
   # 检查服务器是否运行
   curl http://192.168.31.12:5173

   # 或在浏览器中直接访问
   ```

#### 故障排除
```bash
# 检查防火墙
# macOS: 系统偏好设置 -> 安全性与隐私 -> 防火墙
# Windows: 控制面板 -> Windows 防火墙

# 检查端口是否开放
lsof -i :5173

# 查看当前 IP 地址
./external-access.sh status
```

---

## 🚀 ngrok 外网访问

### 快速设置

#### 1. 安装 ngrok
```bash
# 使用我们的脚本
./external-access.sh install

# 或手动安装
# macOS
brew install ngrok/ngrok/ngrok

# Windows/Linux
# 访问 https://ngrok.com/download
```

#### 2. 配置 ngrok
```bash
# 1. 访问 https://ngrok.com/ 注册免费账号
# 2. 复制您的 authtoken
# 3. 配置 token

ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

#### 3. 启动 ngrok
```bash
# 使用我们的脚本
./external-access.sh ngrok

# 或直接运行
ngrok http 5173
```

#### 4. 获取外网地址
启动后会显示：
```
Session Status: online
Forwarding: https://abc123-def456.ngrok.io -> http://localhost:5173
```

**这个地址 (`https://abc123-def456.ngrok.io`) 就是您的外网访问地址！**

### 高级用法

#### 添加基本认证
```bash
ngrok http 5173 --auth="username:password"
```

#### 指定子域名（需付费）
```bash
ngrok http 5173 --domain=my-chatbi.ngrok.io
```

#### 同时暴露前端和后端
```bash
# 终端 1: 前端
ngrok http 5173

# 终端 2: 后端 API
ngrok http 8001
```

### ngrok 配置文件

创建 `ngrok.yml`:
```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN

tunnels:
  frontend:
    addr: 5173
    proto: http
    bind_tls: true
    auth: "username:password"
    region: ap

  backend:
    addr: 8001
    proto: http
    bind_tls: true
```

启动所有隧道:
```bash
ngrok start --all
```

---

## ☁️ 云服务器部署

### 方案 A: 免费云平台

#### 1. Vercel (推荐前端)
```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
cd frontend
vercel

# 您将获得: https://your-app.vercel.app
```

#### 2. Netlify (推荐前端)
```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 构建并部署
npm run build
netlify deploy --prod --dir=dist
```

#### 3. Railway (推荐全栈应用)
```bash
# 访问 https://railway.app/
# 连接 GitHub 仓库
# 自动部署
```

### 方案 B: 付费云服务器

#### AWS EC2 部署
```bash
# 1. 启动 EC2 实例
# 2. 配置安全组 (开放端口 80, 443)
# 3. SSH 连接到服务器

# 4. 安装环境
sudo apt update
sudo apt install nodejs npm nginx -y

# 5. 上传应用文件
scp -r frontend/ user@your-server:/var/www/

# 6. 配置 Nginx
sudo nano /etc/nginx/sites-available/chatbi
```

#### 阿里云/腾讯云部署
```bash
# 1. 购买云服务器
# 2. 配置安全组
# 3. 安装环境 (同 AWS)
# 4. 部署应用
# 5. 配置域名 (可选)
```

### Docker 云部署

#### 使用 Docker Compose
```bash
# 1. 构建镜像
docker-compose build

# 2. 启动服务
docker-compose up -d

# 3. 配置反向代理
```

#### 推送镜像到 Docker Hub
```bash
# 1. 登录 Docker Hub
docker login

# 2. 标记镜像
docker tag frontend:latest yourname/frontend:latest

# 3. 推送镜像
docker push yourname/frontend:latest

# 4. 在云服务器上运行
docker run -d -p 80:80 yourname/frontend:latest
```

---

## 🔒 安全注意事项

### ⚠️ 重要安全提醒

#### 1. 生产环境安全
```bash
# ❌ 不要在生产环境使用默认配置
# ✅ 应该添加认证和授权

# 修改环境变量
VITE_ENABLE_AUTH=true
VITE_ADMIN_PASSWORD=your-strong-password
```

#### 2. ngrok 安全
```bash
# 添加基本认证
ngrok http 5173 --auth="admin:strong-password"

# 或使用 IP 白名单
ngrok http 5173 --cidr-allow=1.2.3.4/32
```

#### 3. 云服务器安全
```bash
# 配置防火墙
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable

# 定期更新系统
sudo apt update && sudo apt upgrade -y

# 使用 HTTPS
# 配置 SSL 证书 (Let's Encrypt)
```

#### 4. 数据安全
```bash
# 不要在代码中硬编码敏感信息
# 使用环境变量
echo "VITE_API_KEY=your-key" > .env.production

# 不要提交 .env 文件到 Git
echo ".env.local" >> .gitignore
```

---

## 🎯 推荐方案

### 🏠 **家庭/办公室使用**
```bash
# 使用局域网访问
http://192.168.31.12:5173

# 运行状态查看
./external-access.sh status
```

### 🧪 **测试/演示**
```bash
# 使用 ngrok (免费)
./external-access.sh install
./external-access.sh ngrok

# 获得 https://xxx.ngrok.io 地址
```

### 🌐 **长期公开访问**
```bash
# 方案 1: 部署到 Vercel (免费)
npm install -g vercel
vercel

# 方案 2: 部署到云服务器
# 使用 Docker Compose
docker-compose up -d
```

---

## 📞 技术支持

如有问题，请查看：
- 📖 [ngrok 详细指南](./NGROK_SETUP.md)
- 📖 [部署指南](./DEPLOYMENT.md)
- 🐛 [问题反馈](https://github.com/your-repo/issues)

---

**最后更新**: 2025-03-16
**版本**: v1.0.0