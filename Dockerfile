# =====================
# 构建阶段
# =====================
FROM node:20-slim AS builder

WORKDIR /app

# 安装 pnpm 并安装依赖
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && \
    pnpm config set registry https://registry.npmmirror.com && \
    pnpm install --frozen-lockfile

# 复制源代码并构建
COPY . .
RUN pnpm run build

# =====================
# 生产环境
# =====================
FROM node:20-slim AS production

WORKDIR /app

# 先安装 pnpm（在 root 用户下）
RUN npm install -g pnpm && \
    pnpm config set registry https://registry.npmmirror.com

# 然后创建用户
RUN addgroup --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nestjs

# 复制 package 文件并安装生产依赖
COPY --chown=nestjs:nodejs package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# 复制构建产物
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# 创建 uploads 目录并设置权限
RUN mkdir -p uploads && chown nestjs:nodejs uploads

# 切换到 nestjs 用户
USER nestjs

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/main.js"]






# =====================
# 开发环境
# =====================
FROM node:20-slim AS development

WORKDIR /app

# 先安装 pnpm（在 root 用户下）
RUN npm install -g pnpm && \
    pnpm config set registry https://registry.npmmirror.com

# 然后创建用户
RUN addgroup --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nestjs

# 复制 package 文件并安装开发依赖
COPY --chown=nestjs:nodejs package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY --chown=nestjs:nodejs . .

# 切换到 nestjs 用户
USER nestjs

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["pnpm", "run", "start:dev"]