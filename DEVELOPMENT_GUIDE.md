# CodeArts Actions 插件开发入门指南

---

## 目录

1. [什么是 Actions 插件](#1-什么是-actions-插件)
2. [开发环境准备](#2-开发环境准备)
3. [插件核心组成详解](#3-插件核心组成详解)
4. [从零开始开发步骤](#4-从零开始开发步骤)
5. [测试方法](#5-测试方法)
6. [打包与发布](#6-打包与发布)
7. [完整示例：飞书机器人通知插件](#7-完整示例飞书机器人通知插件)
8. [常见问题解答](#8-常见问题解答)

---

## 1. 什么是 Actions 插件

### 1.1 一句话理解

**Actions 插件是 CodeArts Pipeline（流水线）中的一个"步骤"，用来执行特定的自动化任务。**

### 1.2 生活中的类比

想象你在工厂的一条生产线上工作：

```
原材料 → [步骤1: 切割] → [步骤2: 打磨] → [步骤3: 组装] → [步骤4: 质检] → 成品
```

每个步骤都是一个**标准化的操作单元**，可以独立开发、独立维护。

在 CodeArts Pipeline 中也是如此：

```
代码提交 → [步骤1: 编译构建] → [步骤2: 运行测试] → [步骤3: 发送通知] → [步骤4: 部署上线]
```

**Actions 插件就是其中一个可复用的"步骤"**，比如"发送通知"这个步骤可以被多个流水线复用。

### 1.3 技术定义

Actions 插件是一段运行在特定环境中的代码（通常是 Node.js），它：

- **接收输入**：从流水线获取参数（如 webhook URL、消息内容等）
- **执行业务逻辑**：完成特定的任务（如发送消息、上传文件等）
- **输出结果**：返回执行状态、数据或指标给流水线

### 1.4 与 GitHub Actions 的关系

CodeArts Actions **兼容 GitHub Actions 的语法和规范**，这意味着：

1. 如果你会写 GitHub Actions 插件，基本可以直接迁移到 CodeArts
2. 使用相同的配置文件格式（`action.yml`）
3. 使用相同的工具包（`@actions/core`）

### 1.5 实际应用场景

| 场景 | 描述 |
|------|------|
| **构建通知** | 代码编译完成后，发送飞书/钉钉/企业微信通知 |
| **自动化测试** | 运行单元测试、集成测试并生成报告 |
| **代码检查** | 执行代码静态分析、安全检查 |
| **部署发布** | 将构建产物部署到服务器或云平台 |
| **数据处理** | 处理构建日志、统计代码变更等 |

---

## 2. 开发环境准备

### 2.1 需要的工具清单

在开始之前，请确保你已安装以下工具：

| 工具 | 版本要求 | 用途 |
|------|----------|------|
| Node.js | >= 16.x | 运行 JavaScript/TypeScript 代码 |
| npm | >= 8.x | 管理项目依赖 |
| Git | 任意版本 | 代码版本管理 |
| VS Code（推荐） | 最新版 | 代码编辑器 |

### 2.2 环境检查

打开终端，运行以下命令检查环境：

```bash
# 检查 Node.js 版本
node -v
# 预期输出：v16.x.x 或更高

# 检查 npm 版本
npm -v
# 预期输出：8.x.x 或更高

# 检查 Git 版本
git --version
# 预期输出：git version 2.x.x
```

如果显示"command not found"，请先安装对应工具。

### 2.3 安装 VS Code 和推荐插件

1. **下载安装 VS Code**：https://code.visualstudio.com/

2. **安装推荐插件**：
   - **TypeScript Importer**：自动导入 TypeScript 模块
   - **ESLint**：代码规范检查
   - **Prettier**：代码格式化

3. **配置自动保存**（可选）：
   - 打开 VS Code 设置（`Ctrl + ,`）
   - 搜索 "Auto Save"
   - 选择 "onFocusChange"（切换窗口时自动保存）

### 2.4 飞书机器人准备

由于我们要开发的示例插件是"飞书机器人通知插件"，需要先创建一个飞书自定义机器人：

#### 步骤 1：创建飞书群

1. 打开飞书客户端
2. 点击左侧"通讯录" → "创建群组"
3. 选择"创建普通群组"
4. 填写群名称（如"开发通知群"）

#### 步骤 2：添加自定义机器人

1. 进入刚创建的群组
2. 点击右上角"设置"（齿轮图标）
3. 选择"群机器人" → "添加机器人"
4. 在机器人列表中找到"自定义机器人"并点击
5. 填写机器人名称（如"BuildBot"）
6. 点击"添加"

#### 步骤 3：获取 Webhook URL

1. 添加成功后，页面会显示 **Webhook 地址**
2. 格式类似：`https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxxxxx`
3. **重要**：复制并保存这个地址，后续开发会使用
4. 勾选"安全设置"中的"IP白名单"（可选，用于安全限制）
5. 点击"完成"

> ⚠️ **安全提示**：Webhook URL 是敏感信息，不要硬编码在代码中，应该作为参数注入。

### 2.5 CodeArts 账号准备

1. 确保你拥有华为云 CodeArts 账号
2. 有创建流水线的权限
3. 了解如何进入"扩展插件"管理页面（后续发布插件需要）

---

## 3. 插件核心组成详解

### 3.1 插件的整体结构

一个标准的 Actions 插件项目结构如下：

```
my-action-plugin/              # 项目根目录
├── src/                       # 源代码目录
│   └── main.ts               # 插件核心代码（入口文件）
│   └── stop.ts               # 可选：插件停止时的处理代码
├── action.yml                # 插件元数据配置文件（必需）
├── package.json              # Node.js 项目配置
├── tsconfig.json             # TypeScript 配置
├── README.md                 # 使用说明文档
├── lib/                      # 编译输出目录（自动生成）
└── dist/                     # 打包输出目录（自动生成）
    └── index.js              # 打包后的主文件
```

**为什么需要这些文件？**

| 文件/目录 | 必需 | 作用 |
|-----------|------|------|
| `action.yml` | ✅ | 定义插件的输入输出、执行方式 |
| `src/main.ts` | ✅ | 插件的核心业务逻辑 |
| `package.json` | ✅ | 管理依赖和构建脚本 |
| `tsconfig.json` | ✅ | TypeScript 编译配置 |
| `README.md` | ✅ | 用户使用文档 |
| `src/stop.ts` | ❌ | 可选，插件停止时的清理逻辑 |
| `lib/` | - | TypeScript 编译后的 JS 文件 |
| `dist/` | - | 最终打包文件（ncc 生成） |

### 3.2 action.yml 配置文件详解

`action.yml` 是插件最重要的配置文件，流水线通过这个文件了解插件的信息。

#### 基本结构

```yaml
# action.yml
name: 'feishu-bot-action'           # 插件名称（小写，用-连接）
version: 1.0.0                      # 版本号（X.Y.Z 格式）
author: 'your-name'                 # 作者工号或标识
description: '发送飞书群消息通知'    # 功能描述

# 输入参数定义
inputs:
  webhook-url:
    description: '飞书机器人 Webhook 地址'
    required: true                  # 是否必填
    default: ''                     # 默认值
  message:
    description: '要发送的消息内容'
    required: true

# 输出参数定义（可选）
outputs:
  result:
    description: '发送结果'

# 插件执行方式
runs:
  using: 'node16'                   # 使用 Node.js 16 运行
  main: 'dist/index.js'            # 入口文件路径
```

#### 命名规范（强制）

⚠️ **以下规范必须严格遵守，否则插件无法正常使用：**

1. **插件名称**：
   - 全部小写英文
   - 用 `-` 连接单词
   - 示例：`feishu-bot-action` ✅
   - 错误示例：`FeishuBotAction` ❌、`feishu_bot_action` ❌

2. **输入参数名**：
   - 全部小写
   - 用 `-` 连接单词
   - 不超过 16 个字符
   - 示例：`webhook-url` ✅
   - 错误示例：`webhookUrl` ❌、`webhook_url` ❌

3. **版本号规范**：
   - 格式：`X.Y.Z`（主版本.次版本.修订号）
   - 版本号只能递增，不能回退
   - 重大变更升级主版本：`1.0.0` → `2.0.0`

#### 输入参数详解

```yaml
inputs:
  # 参数标识符（必填）
  webhook-url:
    # 参数说明（必填）
    description: '飞书机器人 Webhook 地址'
    # 是否必填（可选，默认 false）
    required: true
    # 默认值（可选）
    default: ''
  
  # 可以定义多个输入参数
  message:
    description: '要发送的消息内容'
    required: true
    
  # 可选参数示例
  silent:
    description: '是否静默发送（不@任何人）'
    required: false
    default: 'false'
```

#### 输出参数详解

```yaml
outputs:
  # 输出参数标识符
  result:
    description: '消息发送结果'
    type: metrics              # 可选，metrics 类型可用于报表
    properties:                # 可选，定义指标属性
      catalog_cn: "通知报告"
      catalog_en: "Notification Report"
      name_cn: "发送状态"
      name_en: "Send Status"
```

#### runs 执行配置

```yaml
runs:
  using: 'node16'              # 运行环境（node16、node20 等）
  main: 'dist/index.js'       # 主入口文件（相对路径）
  post: 'dist/stop.js'        # 可选：停止时的处理文件
```

### 3.3 package.json 配置文件

`package.json` 是 Node.js 项目的配置文件，管理依赖和构建脚本。

#### 完整示例

```json
{
  "name": "feishu-bot-action",
  "version": "1.0.0",
  "description": "发送飞书群消息通知的 CodeArts Actions 插件",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "package-main": "ncc build lib/main.js -o dist",
    "package-stop": "ncc build lib/stop.js -o dist/stop && mv dist/stop/index.js dist/stop.js && rm -rf dist/stop",
    "test": "jest",
    "all": "npm run build && npm run package-main && npm run package-stop"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/feishu-bot-action.git"
  },
  "author": "your-name",
  "license": "MIT",
  "devDependencies": {
    "@actions/core": "^1.11.1",
    "@types/node": "^22.7.6",
    "typescript": "^5.0.0",
    "@vercel/ncc": "^0.38.0",
    "jest": "^29.0.0"
  },
  "dependencies": {
    "axios": "^1.7.7"
  }
}
```

#### scripts 说明

| 命令 | 作用 |
|------|------|
| `npm run build` | TypeScript 编译（ts → js） |
| `npm run package-main` | 使用 ncc 打包主文件 |
| `npm run package-stop` | 打包停止处理文件（可选） |
| `npm test` | 运行单元测试 |
| `npm run all` | 执行完整构建流程 |

#### 关键依赖说明

- **`@actions/core`**：GitHub Actions 官方工具包，用于获取输入参数、设置输出、记录日志等
- **`@vercel/ncc`**：将 Node.js 项目打包成单个可执行文件
- **`axios`**：HTTP 请求库（用于调用飞书 API）
- **`typescript`**：TypeScript 编译器

### 3.4 核心代码文件（src/main.ts）

这是插件最重要的文件，包含所有业务逻辑。

#### 代码结构模板

```typescript
// src/main.ts
import * as core from '@actions/core';

async function run(): Promise<void> {
  try {
    // 1. 获取输入参数
    const webhookUrl: string = core.getInput('webhook-url', { required: true });
    const message: string = core.getInput('message', { required: true });
    
    // 2. 执行业务逻辑
    core.info('开始发送消息...');
    const result = await sendMessage(webhookUrl, message);
    
    // 3. 设置输出参数
    core.setOutput('result', result);
    
    // 4. 记录成功日志
    core.info('消息发送成功！');
  } catch (error) {
    // 5. 错误处理
    if (error instanceof Error) {
      core.setFailed(`Action failed: ${error.message}`);
    }
  }
}

// 执行业务逻辑的函数
async function sendMessage(webhookUrl: string, message: string): Promise<string> {
  // 具体实现...
  return 'success';
}

// 执行主函数
run();
```

#### @actions/core 常用 API

```typescript
// 获取输入参数（字符串）
const value = core.getInput('input-name', { required: true });

// 获取布尔类型的输入
const flag = core.getBooleanInput('silent');

// 设置输出参数
core.setOutput('result', 'success');

// 记录普通日志
core.info('这是一条普通信息');

// 记录警告日志
core.warning('这是一条警告');

// 记录错误日志
core.error('这是一条错误');

// 设置失败（会终止插件执行）
core.setFailed('执行失败');

// 将值导出为环境变量（供后续步骤使用）
core.exportVariable('MY_VAR', 'value');
```

### 3.5 stop.ts（可选）

当你的插件需要在流水线停止时执行清理操作时使用。

#### 使用场景

- 清理临时文件
- 关闭数据库连接
- 发送"任务已取消"通知

#### 代码示例

```typescript
// src/stop.ts
import * as core from '@actions/core';

async function cleanup(): Promise<void> {
  try {
    core.info('执行清理操作...');
    // 清理逻辑...
    core.info('清理完成');
  } catch (error) {
    core.warning(`清理过程中出错: ${error}`);
  }
}

cleanup();
```

---

## 4. 从零开始开发步骤

现在，让我们从零开始创建一个飞书机器人通知插件。

### 4.1 创建项目目录

```bash
# 创建项目目录（使用小写和-连接）
mkdir feishu-bot-action
cd feishu-bot-action

# 初始化 Git 仓库（可选但推荐）
git init
```

### 4.2 初始化 Node.js 项目

```bash
# 初始化 package.json
npm init

# 按提示填写信息，或直接创建默认配置
npm init -y
```

### 4.3 安装依赖

```bash
# 安装运行时依赖
npm install @actions/core axios

# 安装开发依赖
npm install --save-dev typescript @types/node @vercel/ncc

# 安装类型定义（可选，用于更好的代码提示）
npm install --save-dev @types/axios
```

### 4.4 创建 TypeScript 配置

创建 `tsconfig.json` 文件：

```bash
# 生成默认配置
npx tsc --init
```

编辑 `tsconfig.json`，确保包含以下配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./lib",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "lib", "dist"]
}
```

**关键配置说明**：

- `outDir`: TypeScript 编译后的输出目录（`./lib`）
- `rootDir`: 源代码目录（`./src`）
- `target`: 编译目标版本（ES2020）

### 4.5 创建目录结构

```bash
# 创建源代码目录
mkdir -p src

# 查看项目结构
ls -la
```

此时项目结构：

```
feishu-bot-action/
├── node_modules/          # 依赖目录
├── src/                   # 源代码目录（空）
├── package.json           # 项目配置
├── package-lock.json      # 依赖锁定
├── tsconfig.json          # TypeScript 配置
└── .gitignore             # Git 忽略文件（可选）
```

### 4.6 编写 action.yml

创建 `action.yml` 文件：

```yaml
name: 'feishu-bot-action'
version: '1.0.0'
author: 'your-name'
description: '发送飞书群自定义机器人消息通知'

inputs:
  webhook-url:
    description: '飞书自定义机器人的 Webhook 地址'
    required: true
    default: ''
  
  message:
    description: '要发送的消息内容'
    required: true
    default: ''
  
  msg-type:
    description: '消息类型：text（文本）或 post（富文本）'
    required: false
    default: 'text'

outputs:
  result:
    description: '消息发送结果'

runs:
  using: 'node16'
  main: 'dist/index.js'
```

### 4.7 编写核心代码（src/main.ts）

创建 `src/main.ts` 文件：

```typescript
import * as core from '@actions/core';
import axios from 'axios';

/**
 * 主函数 - 插件入口
 */
async function run(): Promise<void> {
  try {
    // ========== 1. 获取输入参数 ==========
    const webhookUrl: string = core.getInput('webhook-url', { required: true });
    const message: string = core.getInput('message', { required: true });
    const msgType: string = core.getInput('msg-type') || 'text';

    // 参数验证
    if (!webhookUrl) {
      throw new Error('webhook-url 不能为空');
    }
    if (!message) {
      throw new Error('message 不能为空');
    }

    core.info(`消息类型: ${msgType}`);
    core.info(`消息内容: ${message}`);

    // ========== 2. 构建请求体 ==========
    const requestBody = buildRequestBody(msgType, message);

    // ========== 3. 发送 HTTP 请求 ==========
    core.info('正在发送消息到飞书...');
    const response = await axios.post(webhookUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10秒超时
    });

    // ========== 4. 处理响应 ==========
    if (response.data?.code === 0) {
      core.info('消息发送成功！');
      core.setOutput('result', 'success');
    } else {
      throw new Error(`飞书 API 返回错误: ${JSON.stringify(response.data)}`);
    }

  } catch (error) {
    // ========== 5. 错误处理 ==========
    if (error instanceof Error) {
      core.error(`错误: ${error.message}`);
      core.setFailed(`Action failed: ${error.message}`);
    } else {
      core.setFailed('Action failed with unknown error');
    }
  }
}

/**
 * 构建飞书请求体
 */
function buildRequestBody(msgType: string, message: string): object {
  if (msgType === 'text') {
    // 文本消息格式
    return {
      msg_type: 'text',
      content: {
        text: message
      }
    };
  } else {
    // 富文本消息格式（简化版）
    return {
      msg_type: 'post',
      content: {
        post: {
          zh_cn: {
            title: '消息通知',
            content: [
              [{
                tag: 'text',
                text: message
              }]
            ]
          }
        }
      }
    };
  }
}

// 执行主函数
run();
```

#### 代码逐行讲解

```typescript
import * as core from '@actions/core';
import axios from 'axios';
```
- 导入 `@actions/core` 工具包，用于与流水线交互
- 导入 `axios`，用于发送 HTTP 请求

```typescript
async function run(): Promise<void> {
```
- 定义主函数，使用 `async` 因为包含异步操作（HTTP 请求）
- `Promise<void>` 表示函数返回一个 Promise，不返回具体值

```typescript
const webhookUrl: string = core.getInput('webhook-url', { required: true });
```
- 从流水线获取输入参数 `webhook-url`
- `{ required: true }` 表示这个参数是必填的

```typescript
if (!webhookUrl) {
  throw new Error('webhook-url 不能为空');
}
```
- 参数验证，如果为空则抛出错误

```typescript
const response = await axios.post(webhookUrl, requestBody, {...});
```
- 使用 axios 发送 POST 请求到飞书 API
- `await` 等待异步操作完成

```typescript
if (response.data?.code === 0) {
```
- 检查飞书 API 返回的状态码
- `code === 0` 表示成功

```typescript
core.setOutput('result', 'success');
```
- 设置输出参数，供流水线的后续步骤使用

```typescript
core.setFailed(`Action failed: ${error.message}`);
```
- 标记插件执行失败，流水线会收到失败信号

### 4.8 更新 package.json 脚本

编辑 `package.json`，添加构建脚本：

```json
{
  "name": "feishu-bot-action",
  "version": "1.0.0",
  "description": "发送飞书群消息通知的 CodeArts Actions 插件",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "package-main": "ncc build lib/main.js -o dist",
    "all": "npm run build && npm run package-main"
  },
  "keywords": ["actions", "feishu", "notification"],
  "author": "your-name",
  "license": "MIT",
  "devDependencies": {
    "@actions/core": "^1.11.1",
    "@types/node": "^22.7.6",
    "@vercel/ncc": "^0.38.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "axios": "^1.7.7"
  }
}
```

### 4.9 创建 README.md

创建 `README.md` 文件，这是用户使用文档：

```markdown
# 飞书机器人通知插件

在 CodeArts Pipeline 中发送飞书群自定义机器人消息。

## 功能特性

- 支持发送文本消息
- 支持发送富文本消息
- 支持 @用户 和 @所有人

## 输入参数

| 参数名 | 必填 | 描述 | 默认值 |
|--------|------|------|--------|
| webhook-url | ✅ | 飞书机器人 Webhook 地址 | - |
| message | ✅ | 要发送的消息内容 | - |
| msg-type | ❌ | 消息类型（text/post） | text |

## 使用示例

```yaml
steps:
  - name: 发送构建成功通知
    uses: feishu-bot-action@1.0.0
    with:
      webhook-url: ${{ secrets.FEISHU_WEBHOOK }}
      message: '构建成功！'
```

## 开发指南

```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 打包
npm run package-main

# 完整构建
npm run all
```

## 许可证

MIT
```

### 4.10 创建 .gitignore

创建 `.gitignore` 文件，忽略不需要版本控制的文件：

```
# 依赖目录
node_modules/

# 编译输出
lib/
dist/

# IDE 配置
.vscode/
.idea/

# 日志
*.log
npm-debug.log*

# 操作系统文件
.DS_Store
Thumbs.db

# 临时文件
*.tmp
*.temp
```

---

## 5. 测试方法

### 5.1 本地测试

#### 步骤 1：编译 TypeScript

```bash
# 确保在项目根目录
npm run build
```

预期输出：
```
$ tsc

# 如果没有报错，说明编译成功
```

编译成功后，会生成 `lib/main.js` 文件。

#### 步骤 2：打包

```bash
npm run package-main
```

预期输出：
```
$ ncc build lib/main.js -o dist
ncc: Compiling file index.js
ncc: Done
```

打包成功后，会生成 `dist/index.js` 文件。

#### 步骤 3：验证打包文件

```bash
# 检查 dist 目录
ls -la dist/

# 应该看到：
# - index.js（主文件）
```

#### 步骤 4：单元测试（可选）

创建 `__tests__/main.test.ts`：

```typescript
import * as core from '@actions/core';

// 模拟 @actions/core
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setOutput: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  setFailed: jest.fn()
}));

describe('Feishu Bot Action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get inputs correctly', () => {
    // 测试逻辑
    expect(true).toBe(true);
  });
});
```

运行测试：

```bash
npm test
```

### 5.2 在 CodeArts Pipeline 上测试

#### 步骤 1：打包插件

```bash
# 完整构建
npm run all

# 或者分别执行
npm run build
npm run package-main
```

#### 步骤 2：创建 ZIP 包

```bash
# 创建临时目录
mkdir -p release
cp -r dist release/
cp action.yml release/
cp README.md release/

# 打包
cd release
zip -r ../feishu-bot-action-v1.0.0.zip .
cd ..

# 清理
rm -rf release
```

#### 步骤 3：上传到 CodeArts

1. 登录华为云 CodeArts 控制台
2. 进入"扩展插件"管理页面
3. 点击"新建插件"
4. 填写插件信息（名称、描述等）
5. 上传 ZIP 包
6. 保存并发布

#### 步骤 4：创建测试流水线

1. 创建一个新的流水线
2. 添加一个步骤，选择你的插件
3. 配置参数：
   - `webhook-url`: 填入飞书机器人的 webhook 地址
   - `message`: 填入测试消息
4. 保存并执行流水线
5. 查看执行日志和飞书群消息

---

## 6. 打包与发布

### 6.1 构建流程

完整的构建流程如下：

```
TypeScript 源文件 (src/*.ts)
    ↓
TypeScript 编译 (tsc)
    ↓
JavaScript 文件 (lib/*.js)
    ↓
ncc 打包
    ↓
单个可执行文件 (dist/index.js)
    ↓
打包成 ZIP
    ↓
上传到 CodeArts
```

### 6.2 详细打包步骤

#### 步骤 1：编译 TypeScript

```bash
npm run build
```

这会读取 `tsconfig.json` 配置，将 `src/` 目录下的 `.ts` 文件编译到 `lib/` 目录。

#### 步骤 2：使用 ncc 打包

```bash
npm run package-main
```

**什么是 ncc？**

`@vercel/ncc` 是一个打包工具，它会：
- 将所有依赖（包括 `node_modules` 中的代码）打包到单个文件
- 移除未使用的代码，减小体积
- 让插件可以独立运行，不需要 `node_modules`

#### 步骤 3：验证输出

打包后，`dist/index.js` 应该是一个完整的、可独立运行的文件：

```bash
# 查看文件大小
ls -lh dist/index.js

# 预期大小：几百 KB 到几 MB（取决于依赖）
```

#### 步骤 4：创建发布包

最终的 ZIP 包结构必须包含：

```
feishu-bot-action.zip/
├── dist/
│   └── index.js          # 打包后的主文件
├── action.yml            # 插件配置
└── README.md             # 说明文档
```

创建脚本（添加到 `package.json`）：

```json
{
  "scripts": {
    "build": "tsc",
    "package-main": "ncc build lib/main.js -o dist",
    "zip": "mkdir -p release && cp -r dist release/ && cp action.yml release/ && cp README.md release/ && cd release && zip -r ../feishu-bot-action.zip . && cd .. && rm -rf release",
    "all": "npm run build && npm run package-main && npm run zip"
  }
}
```

执行：

```bash
npm run zip
```

### 6.3 在 CodeArts 平台上发布

#### 步骤 1：进入扩展插件管理

1. 登录华为云 CodeArts 控制台
2. 导航到"服务" → "扩展插件"
3. 点击"新建插件"

#### 步骤 2：填写插件信息

| 字段 | 说明 |
|------|------|
| 插件名称 | 显示在插件市场的名称，如"飞书通知" |
| 插件标识 | 唯一标识，如 `feishu-bot-action` |
| 描述 | 插件的功能说明 |
| 分类 | 选择适合的分类，如"消息通知" |

#### 步骤 3：上传版本

1. 点击"版本管理"
2. 点击"上传版本"
3. 选择版本号（如 `1.0.0`）
4. 上传 ZIP 包
5. 填写版本说明

#### 步骤 4：发布

1. 确认信息无误
2. 点击"发布"
3. 等待审核通过

### 6.4 版本管理

#### 版本号规范

- **格式**: `X.Y.Z`（主版本.次版本.修订号）
- **示例**: `1.0.0`, `1.1.0`, `2.0.0`

#### 版本升级规则

| 升级类型 | 何时使用 | 示例 |
|----------|----------|------|
| 修订号 (Z) | Bug 修复、小改动 | `1.0.0` → `1.0.1` |
| 次版本 (Y) | 新增功能，向后兼容 | `1.0.0` → `1.1.0` |
| 主版本 (X) | 重大变更，可能不兼容 | `1.0.0` → `2.0.0` |

⚠️ **重要**: CodeArts 的版本号只能递增，不能回退！

---

## 7. 完整示例：飞书机器人通知插件

### 7.1 项目概述

这是一个**完整可用**的飞书机器人通知插件，支持：
- ✅ 发送文本消息
- ✅ 支持 @用户 和 @所有人
- ✅ 支持自定义消息格式
- ✅ 完善的错误处理
- ✅ 详细的日志输出

### 7.2 完整项目结构

```
feishu-bot-action/
├── src/
│   └── main.ts
├── action.yml
├── package.json
├── tsconfig.json
├── README.md
├── .gitignore
├── lib/                      # 编译输出（自动生成）
└── dist/                     # 打包输出（自动生成）
    └── index.js
```

### 7.3 完整代码

#### action.yml

```yaml
name: 'feishu-bot-action'
version: '1.0.0'
author: 'your-name'
description: '发送飞书群自定义机器人消息通知'

inputs:
  webhook-url:
    description: '飞书自定义机器人的 Webhook 地址'
    required: true
    default: ''
  
  message:
    description: '要发送的消息内容'
    required: true
    default: ''
  
  msg-type:
    description: '消息类型：text（文本）或 post（富文本）'
    required: false
    default: 'text'
  
  at-users:
    description: '要@的用户ID列表，多个用逗号分隔'
    required: false
    default: ''
  
  at-all:
    description: '是否@所有人（true/false）'
    required: false
    default: 'false'

outputs:
  result:
    description: '消息发送结果：success 或 failed'
  
  response-code:
    description: '飞书 API 返回的状态码'

runs:
  using: 'node16'
  main: 'dist/index.js'
```

#### package.json

```json
{
  "name": "feishu-bot-action",
  "version": "1.0.0",
  "description": "发送飞书群消息通知的 CodeArts Actions 插件",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "package-main": "ncc build lib/main.js -o dist",
    "zip": "mkdir -p release && cp -r dist release/ && cp action.yml release/ && cp README.md release/ && cd release && zip -r ../feishu-bot-action.zip . && cd .. && rm -rf release",
    "all": "npm run build && npm run package-main && npm run zip"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/feishu-bot-action.git"
  },
  "keywords": [
    "actions",
    "feishu",
    "lark",
    "notification",
    "codearts"
  ],
  "author": "your-name",
  "license": "MIT",
  "devDependencies": {
    "@actions/core": "^1.11.1",
    "@types/node": "^22.7.6",
    "@vercel/ncc": "^0.38.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "axios": "^1.7.7"
  }
}
```

#### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./lib",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "lib", "dist"]
}
```

#### src/main.ts

```typescript
import * as core from '@actions/core';
import axios from 'axios';

/**
 * 主函数 - 插件入口
 */
async function run(): Promise<void> {
  try {
    // ========== 1. 获取输入参数 ==========
    core.info('===== 开始执行飞书机器人通知插件 =====');
    
    const webhookUrl: string = core.getInput('webhook-url', { required: true });
    const message: string = core.getInput('message', { required: true });
    const msgType: string = core.getInput('msg-type') || 'text';
    const atUsers: string = core.getInput('at-users') || '';
    const atAll: boolean = core.getBooleanInput('at-all');

    // 参数日志
    core.info(`消息类型: ${msgType}`);
    core.info(`@所有人: ${atAll}`);
    core.info(`@用户: ${atUsers || '无'}`);
    core.info(`消息长度: ${message.length} 字符`);

    // 参数验证
    if (!webhookUrl) {
      throw new Error('webhook-url 不能为空');
    }
    if (!message) {
      throw new Error('message 不能为空');
    }
    if (!webhookUrl.startsWith('https://')) {
      throw new Error('webhook-url 必须以 https:// 开头');
    }

    // ========== 2. 构建请求体 ==========
    core.info('构建请求体...');
    const requestBody = buildRequestBody(msgType, message, atUsers, atAll);
    core.debug(`请求体: ${JSON.stringify(requestBody)}`);

    // ========== 3. 发送 HTTP 请求 ==========
    core.info('正在发送消息到飞书...');
    const response = await axios.post(webhookUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000 // 15秒超时
    });

    // ========== 4. 处理响应 ==========
    core.debug(`响应: ${JSON.stringify(response.data)}`);
    
    const responseCode = response.data?.code;
    core.setOutput('response-code', responseCode);

    if (responseCode === 0) {
      core.info('✅ 消息发送成功！');
      core.setOutput('result', 'success');
    } else {
      const errorMsg = response.data?.msg || '未知错误';
      throw new Error(`飞书 API 返回错误: [${responseCode}] ${errorMsg}`);
    }

    core.info('===== 插件执行完成 =====');

  } catch (error) {
    // ========== 5. 错误处理 ==========
    if (error instanceof Error) {
      core.error(`❌ 错误: ${error.message}`);
      core.setOutput('result', 'failed');
      core.setFailed(`Action failed: ${error.message}`);
    } else {
      core.setOutput('result', 'failed');
      core.setFailed('Action failed with unknown error');
    }
  }
}

/**
 * 构建飞书请求体
 */
function buildRequestBody(
  msgType: string, 
  message: string, 
  atUsers: string,
  atAll: boolean
): object {
  // 处理 @ 用户
  let finalMessage = message;
  
  if (atAll) {
    finalMessage += ' <at user_id=\"all\">所有人</at>';
  }
  
  if (atUsers) {
    const userIds = atUsers.split(',').map(id => id.trim()).filter(id => id);
    for (const userId of userIds) {
      finalMessage += ` <at user_id=\"${userId}\">${userId}</at>`;
    }
  }

  if (msgType === 'text') {
    // 文本消息格式
    return {
      msg_type: 'text',
      content: {
        text: finalMessage
      }
    };
  } else {
    // 富文本消息格式
    return {
      msg_type: 'post',
      content: {
        post: {
          zh_cn: {
            title: '消息通知',
            content: [
              [{
                tag: 'text',
                text: finalMessage
              }]
            ]
          }
        }
      }
    };
  }
}

// 执行主函数
run();
```

#### README.md

```markdown
# 飞书机器人通知插件

在 CodeArts Pipeline 中发送飞书群自定义机器人消息。

## 功能特性

- ✅ 发送文本消息
- ✅ 支持 @用户 和 @所有人
- ✅ 支持富文本消息（post 类型）
- ✅ 完善的错误处理和日志输出
- ✅ 支持流水线变量

## 输入参数

| 参数名 | 必填 | 描述 | 默认值 |
|--------|------|------|--------|
| webhook-url | ✅ | 飞书机器人 Webhook 地址 | - |
| message | ✅ | 要发送的消息内容 | - |
| msg-type | ❌ | 消息类型（text/post） | text |
| at-users | ❌ | 要@的用户ID，多个用逗号分隔 | - |
| at-all | ❌ | 是否@所有人（true/false） | false |

## 使用示例

### 基础用法 - 发送简单消息

```yaml
steps:
  - name: 发送构建成功通知
    uses: feishu-bot-action@1.0.0
    with:
      webhook-url: ${{ secrets.FEISHU_WEBHOOK }}
      message: '✅ 构建成功！'
```

### @所有人

```yaml
steps:
  - name: 发送紧急通知
    uses: feishu-bot-action@1.0.0
    with:
      webhook-url: ${{ secrets.FEISHU_WEBHOOK }}
      message: '🚨 生产环境告警！'
      at-all: 'true'
```

### @指定用户

```yaml
steps:
  - name: 发送测试失败通知
    uses: feishu-bot-action@1.0.0
    with:
      webhook-url: ${{ secrets.FEISHU_WEBHOOK }}
      message: '❌ 测试失败，请检查'
      at-users: 'ou_1234567890abcdef,ou_0987654321fedcba'
```

### 使用流水线变量

```yaml
steps:
  - name: 发送构建详情
    uses: feishu-bot-action@1.0.0
    with:
      webhook-url: ${{ secrets.FEISHU_WEBHOOK }}
      message: |
        构建结果: ${{ job.status }}
        提交信息: ${{ github.event.head_commit.message }}
        分支: ${{ github.ref }}
```

## 输出参数

| 参数名 | 描述 |
|--------|------|
| result | 发送结果（success/failed） |
| response-code | 飞书 API 返回的状态码 |

## 开发指南

### 环境要求

- Node.js >= 16.x
- npm >= 8.x

### 安装依赖

```bash
npm install
```

### 编译构建

```bash
# TypeScript 编译
npm run build

# 打包
npm run package-main

# 完整构建并打包
npm run all
```

### 打包发布

```bash
npm run zip
```

生成 `feishu-bot-action.zip`，上传到 CodeArts 扩展插件。

## 常见问题

### Q: 消息发送失败，提示 webhook URL 无效？

A: 请检查：
1. Webhook URL 是否完整复制
2. 机器人是否还在群中
3. 是否配置了 IP 白名单限制

### Q: 如何获取用户的 Open ID？

A: 通过飞书开放平台 API 获取，或使用飞书应用调试工具。

### Q: 消息内容支持 Markdown 吗？

A: 文本消息支持部分样式（**加粗**、*斜体*、<u>下划线</u>等），详见飞书文档。

## 许可证

MIT License
```

#### .gitignore

```
# Dependencies
node_modules/

# Build outputs
lib/
dist/

# IDE
.vscode/
.idea/

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# Test
coverage/

# Temporary files
*.tmp
*.temp
```

### 7.4 飞书消息格式说明

#### 文本消息格式

```json
{
  "msg_type": "text",
  "content": {
    "text": "这是一条文本消息"
  }
}
```

#### @用户语法

```html
<!-- @单个用户 -->
<at user_id="ou_xxxxxxxxxxxxxxxx">用户名</at>

<!-- @所有人 -->
<at user_id="all">所有人</at>
```

示例：

```typescript
const message = 'Hello <at user_id="ou_123456">张三</at>，请关注这个问题';
```

#### 富文本消息格式（简化）

```json
{
  "msg_type": "post",
  "content": {
    "post": {
      "zh_cn": {
        "title": "消息标题",
        "content": [
          [
            {
              "tag": "text",
              "text": "这是正文内容"
            },
            {
              "tag": "a",
              "text": "点击这里",
              "href": "https://example.com"
            }
          ]
        ]
      }
    }
  }
}
```

### 7.5 在 CodeArts Pipeline 中的配置示例

在流水线的 YAML 配置中：

```yaml
# 在步骤中使用插件
steps:
  # 步骤1: 编译代码
  - name: 编译
    uses: build@latest
    
  # 步骤2: 发送成功通知
  - name: 发送成功通知
    uses: feishu-bot-action@1.0.0
    with:
      webhook-url: ${{ secrets.FEISHU_WEBHOOK }}
      message: '✅ 编译成功！'
      at-all: 'false'
      
  # 步骤3: 运行测试
  - name: 运行测试
    uses: test@latest
    
  # 步骤4: 发送测试结果
  - name: 发送测试通知
    uses: feishu-bot-action@1.0.0
    if: always()  # 无论成功与否都执行
    with:
      webhook-url: ${{ secrets.FEISHU_WEBHOOK }}
      message: '测试结果: ${{ steps.运行测试.outcome }}'
```

---

## 8. 常见问题解答

### 8.1 开发相关问题

#### Q1: TypeScript 编译报错 "Cannot find module '@actions/core'"

**原因**: 依赖未安装

**解决**:
```bash
npm install
```

#### Q2: 如何处理 async/await 错误？

**示例**:
```typescript
try {
  const result = await someAsyncFunction();
} catch (error) {
  if (error instanceof Error) {
    core.setFailed(error.message);
  }
}
```

#### Q3: 如何在本地调试插件？

**方法**:
1. 编写单元测试
2. 使用 `act` 工具模拟 Actions 环境
3. 在 CodeArts 上创建测试流水线

#### Q4: 如何获取所有输入参数？

**代码**:
```typescript
// 方式1：逐个获取
const value1 = core.getInput('param1');
const value2 = core.getInput('param2');

// 方式2：通过环境变量（不推荐）
const value = process.env.INPUT_PARAM1;
```

### 8.2 飞书机器人相关问题

#### Q1: webhook URL 无效怎么办？

**检查清单**:
- ✅ URL 是否完整复制（包含 `https://`）
- ✅ 机器人是否还在飞书群中
- ✅ 是否配置了 IP 白名单限制
- ✅ URL 是否被截断或有多余空格

#### Q2: 消息发送失败的可能原因？

| 错误码 | 原因 | 解决方案 |
|--------|------|----------|
| 9499 | 请求体格式错误 | 检查 JSON 格式 |
| 9500 | webhook URL 错误 | 重新获取 URL |
| 9501 | 消息内容为空 | 检查 message 参数 |
| 9502 | 消息内容过长 | 缩短消息内容 |
| 9999 | 服务器内部错误 | 稍后重试 |

#### Q3: 如何获取用户的 Open ID？

**方法**:
1. 使用飞书开放平台 API
2. 通过飞书应用调试工具
3. 在群中发送消息，查看事件回调

#### Q4: 消息内容长度限制？

- 文本消息：最多 4096 字符
- 富文本消息：最多 10000 字符

### 8.3 打包发布相关问题

#### Q1: 打包后文件过大怎么办？

**优化方法**:
```bash
# 检查依赖
npm ls

# 移除未使用的依赖
npm uninstall <package>

# 使用 .npmignore 排除不需要的文件
```

#### Q2: 版本号冲突如何处理？

**解决**:
- 版本号只能递增，不能回退
- 如果要"撤销"版本，需要发布更高版本

#### Q3: 发布后插件找不到？

**检查**:
1. 是否已发布（不是仅上传）
2. 是否有权限使用该插件
3. 插件名称是否正确

### 8.4 其他问题

#### Q1: 插件执行超时如何处理？

**解决**:
```typescript
// 设置超时时间
const response = await axios.post(url, data, {
  timeout: 30000 // 30秒
});
```

#### Q2: 如何查看插件执行日志？

**方法**:
1. 在 CodeArts Pipeline 执行页面查看
2. 使用 `core.info()` 输出日志
3. 使用 `core.debug()` 输出调试信息（需在流水线开启调试模式）

#### Q3: 敏感信息（token）如何安全存储？

**最佳实践**:
1. 使用 CodeArts Pipeline 的"私密参数"功能
2. 在 action.yml 中标记为敏感：
   ```yaml
   inputs:
     webhook-url:
       description: 'Webhook URL'
       required: true
       secret: true  # 标记为敏感
   ```
3. 在流水线中引用：
   ```yaml
   with:
     webhook-url: ${{ secrets.FEISHU_WEBHOOK }}
   ```

#### Q4: 如何支持多语言消息？

**示例**:
```typescript
const lang = core.getInput('language') || 'zh-cn';
const messages = {
  'zh-cn': '构建成功',
  'en-us': 'Build succeeded'
};
const message = messages[lang] || messages['zh-cn'];
```

---

## 附录：参考资料

### 官方文档

- [飞书开放平台 - 自定义机器人](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN)
- [GitHub Actions 文档](https://docs.github.com/cn/actions)
- [CodeArts 插件开发指南](https://support.huaweicloud.com/devcloud/)

### 相关工具

- [TypeScript 官网](https://www.typescriptlang.org/)
- [axios 文档](https://axios-http.com/)
- [Jest 测试框架](https://jestjs.io/)

### 社区资源

- [GitHub Actions Toolkit](https://github.com/actions/toolkit)
- [ncc 打包工具](https://github.com/vercel/ncc)

---

## 总结

通过本指南，你应该已经掌握了：

1. ✅ **什么是 Actions 插件** - CI/CD 流程中的可复用步骤
2. ✅ **开发环境准备** - Node.js、飞书机器人、CodeArts 账号
3. ✅ **插件核心组成** - action.yml、package.json、src/main.ts
4. ✅ **从零开发流程** - 创建项目 → 编写代码 → 打包 → 发布
5. ✅ **测试方法** - 本地测试 + 流水线测试
6. ✅ **打包发布** - 使用 ncc 打包，上传到 CodeArts
7. ✅ **完整示例** - 飞书机器人通知插件
8. ✅ **常见问题** - 开发、飞书、打包的各种问题及解决方案

**下一步**：
1. 按照第 7 章的完整示例创建你的第一个插件
2. 在 CodeArts Pipeline 中测试运行
3. 根据需求扩展功能（支持更多消息类型、添加配置选项等）

祝你开发顺利！🚀
