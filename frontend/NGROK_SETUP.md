# 使用 ngrok 进行外网访问

## 安装 ngrok

### macOS
```bash
# 使用 Homebrew 安装
brew install ngrok/ngrok/ngrok

# 或下载安装包
# https://ngrok.com/download
```

### Windows
```bash
# 下载安装包
# https://ngrok.com/download
```

### Linux
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

## 配置 ngrok

1. **注册账号**
   - 访问 https://ngrok.com/
   - 注册免费账号
   - 获取 authtoken

2. **配置 authtoken**
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

## 启动 ngrok

### 基础用法
```bash
# 暴露本地 5173 端口
ngrok http 5173
```

### 高级用法
```bash
# 指定子域名（需要付费计划）
ngrok http 5173 --domain=my-chatbi.ngrok.io

# 指定地区
ngrok http 5173 --region=ap

# 基本认证
ngrok http 5173 --auth="username:password"
```

## 使用示例

1. **启动 ngrok**
   ```bash
   # 在新的终端窗口中
   ngrok http 5173
   ```

2. **获取公网地址**
   ```
   Session Status                online
   Forwarding                    https://abc123.ngrok.io -> http://localhost:5173
   ```

3. **分享地址**
   - 将 https://abc123.ngrok.io 分享给任何人
   - 他们可以在任何地方访问您的应用

## 注意事项

- ⚠️ **免费版**: 每次重启 ngrok，地址会变化
- ⚠️ **安全性**: 任何人都可以访问，建议添加认证
- ⚠️ **速度**: 免费版有速度限制
- ⚠️ **稳定性**: 适合测试，不适合生产环境

## 同时暴露前端和后端

### 方式 1: 使用多个 ngrok 隧道
```bash
# 终端 1: 前端
ngrok http 5173

# 终端 2: 后端 API
ngrok http 8001
```

### 方式 2: 使用配置文件
创建 `ngrok.yml`:
```yaml
tunnels:
  frontend:
    addr: 5173
    proto: http
    bind_tls: true
  backend:
    addr: 8001
    proto: http
    bind_tls: true
```

启动:
```bash
ngrok start --all
```

## 高级配置

### 自定义域名
```bash
ngrok http 5173 --domain=my-custom-domain.ngrok.io
```

### 访问控制
```bash
# 基本认证
ngrok http 5173 --auth="user:password"

# IP 白名单（需要付费）
ngrok http 5173 --cidr-allow=1.2.3.4/32
```

### 监控和日志
```bash
# 启动 Web 界面
ngrok http 5173 --log=stdout

# 查看请求日志
ngrok http 5173 --log-level=debug
```