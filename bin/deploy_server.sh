#!/bin/bash
# 启动 FastAPI 后端服务
cd "$(dirname "$0")/../src" || exit 1
uvicorn server:app --host 0.0.0.0 --port 8080 --reload
