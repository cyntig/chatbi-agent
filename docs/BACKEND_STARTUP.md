# ChatBI 后端服务启动指南

## 📋 前置要求

- Python 3.8+
- pip (Python 包管理器)

## 🚀 快速启动

### 方法一：使用启动脚本（推荐）

```bash
# 使用启动脚本
cd /Users/monacui/about_src/personal_learning/chatbi-agent
./bin/start_api_server.sh
```

### 方法二：手动启动

```bash
# 1. 进入后端源码目录
cd /Users/monacui/about_src/personal_learning/chatbi-agent/bankend/src

# 2. 安装依赖（首次运行）
pip install -r ../requirements.txt

# 3. 启动服务器
python3 main.py
```

## 🔧 配置

### 环境变量

创建 `.env` 文件（可选）：

```bash
cp bankend/.env.example bankend/.env
# 编辑 .env 文件，配置你的 API 密钥等
```

### 配置文件

编辑 `bankend/src/config.yaml` 来修改：

```yaml
logging:
  level: INFO          # 日志级别
  dir: ../logs         # 日志目录

llm_model:
  agent_model: kimi-k2.5  # 使用的模型
```

## 🌐 服务信息

启动成功后，你可以访问：

- **API 服务**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

## 📡 API 端点

### 聊天接口
- `GET /api/chatbi/chat` - SSE 流式聊天接口

### 会话管理
- `GET /api/chatbi/sessions` - 获取所有会话
- `GET /api/chatbi/sessions/{id}` - 获取会话详情
- `POST /api/chatbi/sessions` - 创建新会话
- `DELETE /api/chatbi/sessions/{id}` - 删除会话
- `PATCH /api/chatbi/sessions/{id}` - 更新会话标题

## ⚠️ 常见问题

### 1. 端口被占用

如果 8000 端口被占用，修改 `main.py` 中的端口号：

```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # 改为其他端口
```

### 2. 依赖安装失败

尝试升级 pip：

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. 权限错误

给启动脚本添加执行权限：

```bash
chmod +x bin/start_api_server.sh
```

## 🔄 同时启动前端和后端

### 终端 1 - 启动后端
```bash
cd /Users/monacui/about_src/personal_learning/chatbi-agent
./bin/start_api_server.sh
```

### 终端 2 - 启动前端
```bash
cd /Users/monacui/about_src/personal_learning/chatbi-agent/frontend
npm run dev
```

然后访问 http://localhost:3000 使用 ChatBI 前端界面。

## 📚 更多信息

查看 [项目 README](../README.md) 了解更多关于项目的信息。
