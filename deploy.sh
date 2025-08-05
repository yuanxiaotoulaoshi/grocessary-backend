# =====================================
# 完整操作步骤
# =====================================

# 1️⃣ 在项目根目录创建 deploy.sh 文件
# 复制上面的脚本内容到 deploy.sh 文件中

# 2️⃣ 给脚本文件执行权限
chmod +x deploy.sh

# 3️⃣ 修改脚本中的配置
# 编辑 deploy.sh，修改以下配置：
- REPO_URL: "https://github.com/yuanxiaotoulaoshi/grocessary-backend"
# - 其他配置如果需要的话

# 4️⃣ 确保代码已经推送到 GitHub
git add .
git commit -m "Add deployment script"
git push origin main

# 5️⃣ 运行部署脚本
./deploy.sh

# =====================================
# 如果遇到权限问题，可以这样运行：
# =====================================
bash deploy.sh

# =====================================
# 项目目录结构应该是这样：
# =====================================
# glossary-backend/
# ├── src/
# │   └── ... (你的源代码)
# ├── package.json
# ├── pnpm-lock.yaml
# ├── Dockerfile
# ├── docker-compose.prod.yml
# ├── requirements.txt
# ├── deploy.sh              ← 新建的部署脚本
# ├── .gitignore
# └── README.md

# =====================================
# 其他有用的脚本（可选）
# =====================================

# 创建一个快速重启脚本 restart.sh
cat > restart.sh << 'EOF'
#!/bin/bash
echo "🔄 重启生产环境服务..."
gcloud compute ssh ycong5547_gmail_com@instance-20250705-072546 \
  --zone=australia-southeast1-a \
  --ssh-key-file=~/.ssh/id_rsa \
  --command="
    cd glossary-backend
    docker-compose -f docker-compose.prod.yml restart
    echo '✅ 服务已重启'
    docker-compose -f docker-compose.prod.yml ps
  "
EOF

chmod +x restart.sh

# 创建一个查看日志的脚本 logs.sh
cat > logs.sh << 'EOF'
#!/bin/bash
echo "📋 查看生产环境日志..."
gcloud compute ssh ycong5547_gmail_com@instance-20250705-072546 \
  --zone=australia-southeast1-a \
  --ssh-key-file=~/.ssh/id_rsa \
  --command="
    cd glossary-backend
    docker-compose -f docker-compose.prod.yml logs -f --tail=50
  "
EOF

chmod +x logs.sh

# 创建一个检查服务状态的脚本 status.sh
cat > status.sh << 'EOF'
#!/bin/bash
echo "📊 检查生产环境状态..."
gcloud compute ssh ycong5547_gmail_com@instance-20250705-072546 \
  --zone=australia-southeast1-a \
  --ssh-key-file=~/.ssh/id_rsa \
  --command="
    cd glossary-backend
    echo '=== Docker 容器状态 ==='
    docker-compose -f docker-compose.prod.yml ps
    echo ''
    echo '=== 系统资源使用 ==='
    docker stats --no-stream
    echo ''
    echo '=== 磁盘使用情况 ==='
    df -h
  "
EOF

chmod +x status.sh