# 构建阶段
FROM node:20-slim AS builder

WORKDIR /app

# 复制包管理文件并安装依赖
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && \
    pnpm config set registry https://registry.npmmirror.com && \
    pnpm install --frozen-lockfile

# 复制源代码并构建
COPY . .
RUN pnpm run build

# 生产环境 - 使用 Python 官方镜像
FROM python:3.11-slim AS production

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    libpng-dev \
    libjpeg-dev \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖（Python 官方镜像没有 externally-managed-environment 限制）
COPY requirements.txt ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# 安装 Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm && \
    pnpm config set registry https://registry.npmmirror.com

# 安装 Node.js 依赖
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/uploads ./uploads

# 创建用户并设置权限
RUN addgroup --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nestjs && \
    mkdir -p /app/.cache && \
    chown -R nestjs:nodejs /app

# 设置 Hugging Face 缓存目录环境变量
ENV HF_HOME=/app/.cache/huggingface
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface
ENV HUGGINGFACE_HUB_CACHE=/app/.cache/huggingface

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]

# 开发环境
FROM production AS development

USER root

# 安装开发依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .
RUN chown -R nestjs:nodejs /app

# 设置开发环境的缓存目录
ENV HF_HOME=/app/.cache/huggingface
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface
ENV HUGGINGFACE_HUB_CACHE=/app/.cache/huggingface

USER nestjs

CMD ["pnpm", "run", "start:dev"]