# Act 本地调试指南

## 安装 Act

### Linux
```bash
# 方法 1: 使用官方脚本（推荐）
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# 方法 2: 使用包管理器
# Arch Linux
yay -S act

# Debian/Ubuntu
curl -s https://api.github.com/repos/nektos/act/releases/latest | grep "browser_download_url.*linux_amd64.tar.gz" | cut -d '"' -f 4 | wget -qi - -O act.tar.gz
tar -xzf act.tar.gz
sudo mv act /usr/local/bin/

# 验证安装
act --version
```

### macOS
```bash
# Homebrew
brew install act

# MacPorts
port install act
```

### Windows
```powershell
# Chocolatey
choco install act-cli

# Scoop
scoop install act

# 手动安装
# 从 GitHub Releases 下载: https://github.com/nektos/act/releases
```

## 快速开始

### 1. 配置 Secrets

```bash
# 复制 secrets 示例文件
cp .secrets.example .secrets

# 编辑 secrets 文件，填入真实配置
vim .secrets
```

`.secrets` 文件内容示例：
```
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxxxx
FEISHU_APP_ID=cli_xxxxxxxxxx
FEISHU_APP_SECRET=your-app-secret
FEISHU_RECEIVE_ID=ou_xxxxxxxxxx
```

### 2. 运行测试

```bash
# 列出所有可用的 workflow
act -l

# 运行所有 push 事件触发的 workflow
act push

# 运行指定的 job
act -j test-custom-bot

# 运行 workflow_dispatch 事件（手动触发）
act workflow_dispatch

# 使用自定义消息测试
act workflow_dispatch -e <<EOF
{
  "inputs": {
    "message": "🎯 自定义测试消息"
  }
}
EOF

# 干运行（不实际执行）
act -n

# 详细输出
act -v

# 调试模式
act --debug
```

## 常用命令

### 选择运行环境
```bash
# 使用默认环境
act

# 指定 Docker 镜像
act -P ubuntu-latest=node:16-buster

# 使用本地 Docker 镜像缓存
act --pull=false
```

### 过滤 Jobs
```bash
# 运行特定 job
act -j test-custom-bot

# 使用正则表达式匹配
act -j "test-.*"

# 排除某些 job
act --exclude test-card-message
```

### 环境变量和 Secrets
```bash
# 临时设置环境变量
act -s FEISHU_WEBHOOK_URL=https://...

# 使用环境变量文件
act --env-file .env

# 使用 secrets 文件
act --secret-file .secrets

# 命令行直接设置 secret
act -s FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx
```

### 调试选项
```bash
# 干运行
act -n

# 详细日志
act -v

# 调试模式
act --debug

# 保留容器（用于调试）
act --reuse

# 使用交互式终端
act -t
```

## 测试场景

### 1. 测试自定义机器人文本消息
```bash
act -j test-custom-bot
```

### 2. 测试应用机器人消息
```bash
act -j test-app-bot
```

### 3. 测试富文本消息
```bash
act -j test-rich-message
```

### 4. 测试卡片消息
```bash
act -j test-card-message
```

### 5. 自定义消息内容测试
```bash
act workflow_dispatch \
  -s FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx \
  -e <<EOF
{
  "inputs": {
    "message": "🔥 这是我的自定义测试消息"
  }
}
EOF
```

## 高级用法

### 1. 模拟不同事件
```bash
# push 事件
act push

# pull_request 事件
act pull_request

# workflow_dispatch 事件
act workflow_dispatch

# 使用自定义事件 payload
act -e payload.json
```

### 2. 调试工作流
```bash
# 只拉取 Docker 镜像
act --pull

# 重用容器
act --reuse

# 绑定挂载
act --bind
```

### 3. 性能优化
```bash
# 使用缓存
act --cache-from type=local,src=/tmp/act-cache

# 并行运行
act --matrix test:custom,app,card
```

## 故障排查

### 问题 1: Docker 权限错误
```bash
# 将用户加入 docker 组
sudo usermod -aG docker $USER
newgrp docker

# 或使用 sudo 运行
sudo act
```

### 问题 2: 镜像拉取失败
```bash
# 手动拉取镜像
docker pull node:16-buster-slim

# 使用本地镜像
act --pull=false
```

### 问题 3: 权限问题
```bash
# 给脚本执行权限
chmod +x .github/workflows/*.yml

# 检查文件权限
ls -la .github/workflows/
```

### 问题 4: 内存不足
```bash
# 增加 Docker 内存限制
# Docker Desktop -> Settings -> Resources -> Memory

# 或使用更小的镜像
act -P ubuntu-latest=node:16-alpine
```

### 问题 5: 网络问题
```bash
# 使用代理
export HTTP_PROXY=http://proxy:port
export HTTPS_PROXY=http://proxy:port
act

# 或配置 Docker 代理
# ~/.docker/config.json
```

## 配置文件说明

### .actrc
全局配置文件，支持以下选项：
- `-P` 或 `--platform`: 指定平台镜像
- `-W` 或 `--workflows`: workflow 文件路径
- `--secret-file`: secrets 文件路径
- `--env-file`: 环境变量文件路径
- `--verbose`: 详细输出
- `--pull`: 自动拉取镜像

### .secrets
存储敏感信息，格式为 `KEY=value`：
```
FEISHU_WEBHOOK_URL=https://...
FEISHU_APP_SECRET=xxx
```

### .env
存储环境变量：
```
NODE_ENV=development
DEBUG=*
```

## 最佳实践

1. **版本控制**
   - 将 `.actrc` 和 `.github/workflows/` 提交到仓库
   - 不要提交 `.secrets` 文件（已在 .gitignore 中）

2. **测试流程**
   ```bash
   # 1. 干运行检查
   act -n
   
   # 2. 单个 job 测试
   act -j test-custom-bot
   
   # 3. 完整 workflow 测试
   act push
   ```

3. **持续集成**
   ```bash
   # 在 CI 中使用 act 进行预测试
   npm run build
   act -j test-custom-bot
   ```

4. **调试技巧**
   - 使用 `-n` 参数先干运行
   - 使用 `-v` 或 `--debug` 查看详细日志
   - 使用 `--reuse` 保留容器状态
   - 检查 `.secrets` 文件格式和权限

## 参考资源

- [Act 官方文档](https://github.com/nektos/act)
- [Act Wiki](https://github.com/nektos/act/wiki)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [飞书开放平台](https://open.feishu.cn/document/home/introduction-to-feishu-platform/)