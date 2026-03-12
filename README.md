# Feishu Bot Action

<div align="center">

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-org/feishu-bot-action)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![CodeArts](https://img.shields.io/badge/CodeArts-Pipeline-orange.svg)](https://www.huaweicloud.com/product/codearts.html)

**华为云 CodeArts Pipeline 飞书机器人通知插件**

[English](#english) | 简体中文

</div>

---

## 📋 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [架构设计](#架构设计)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [使用示例](#使用示例)
- [API 文档](#api-文档)
- [开发指南](#开发指南)
- [测试说明](#测试说明)
- [部署说明](#部署说明)
- [故障排查](#故障排查)
- [常见问题](#常见问题)
- [更新日志](#更新日志)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 项目简介

**Feishu Bot Action** 是专为华为云 CodeArts Pipeline 设计的飞书机器人通知插件。它允许开发团队在 CI/CD 流水线中轻松集成飞书消息通知功能，实现构建状态、部署结果、测试报告等信息的实时推送。

### 为什么选择这个插件？

- 🚀 **零门槛集成**：无需编写复杂代码，简单配置即可使用
- 🔐 **安全可靠**：支持隐私变量注入，敏感信息不泄露
- 🎨 **灵活强大**：支持多种消息类型和机器人类型
- 📊 **完整测试**：单元测试覆盖率高，质量有保障
- 📚 **文档完善**：详细的使用文档和示例代码

### 适用场景

- ✅ 构建成功/失败通知
- ✅ 部署状态提醒
- ✅ 测试报告推送
- ✅ 代码审查通知
- ✅ 定时任务提醒
- ✅ 异常告警通知

---

## 功能特性

### 核心功能

#### 1. 双机器人类型支持

| 机器人类型 | 适用场景 | 优势 | 限制 |
|----------|---------|------|------|
| **自定义机器人** | 群聊通知 | 配置简单，无需审批 | 仅限群聊，功能受限 |
| **自建应用机器人** | 群聊 + 私聊 | 功能完整，支持私聊 | 需要申请应用，审批流程 |

#### 2. 多种消息类型支持

- ✅ **文本消息 (text)**：简单文本通知
- ✅ **富文本消息 (post)**：支持格式化文本、链接、@ 等多种样式
- ✅ **卡片消息 (interactive)**：交互式卡片，支持按钮、表单等复杂交互
- ✅ **图片消息 (image)**：发送图片
- ✅ **文件消息 (file)**：发送文件
- ✅ **语音消息 (audio)**：发送语音
- ✅ **视频消息 (media)**：发送视频

#### 3. 企业级特性

- ✅ **Token 缓存机制**：自动缓存 tenant_access_token，减少 API 调用
- ✅ **完善的参数验证**：前置参数检查，快速失败
- ✅ **详细的错误处理**：清晰的错误信息，便于调试
- ✅ **隐私变量支持**：敏感信息通过流水线变量注入
- ✅ **日志输出**：完整的执行日志，便于追踪

### 技术亮点

#### 🔹 TypeScript 开发
- 类型安全，代码可维护性强
- 完善的类型定义，开发体验好

#### 🔹 模块化架构
- 清晰的模块划分
- 高内聚低耦合
- 易于扩展和维护

#### 🔹 测试驱动开发
- Jest 单元测试覆盖
- Mock 隔离外部依赖
- 真实 API 集成测试

#### 🔹 零依赖 HTTP 客户端
- 使用 Node.js 原生 https 模块
- 无需额外依赖，减少安全风险
- 更轻量，打包体积小

---

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        CodeArts Pipeline                     │
│                     (流水线调度框架)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 调用
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Feishu Bot Action                        │
│                      (插件入口)                               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │              src/main.ts (主流程控制)                  │   │
│  │  - 参数获取与验证                                       │   │
│  │  - 流程编排                                            │   │
│  │  - 结果输出                                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          src/bots/index.ts (消息发送工厂)              │   │
│  │  - 机器人类型路由                                       │   │
│  │  - 统一消息发送接口                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                    │                    │                    │
│          ┌─────────┘                    └─────────┐          │
│          ▼                                        ▼          │
│  ┌───────────────────┐                ┌─────────────────┐   │
│  │   Custom Bot      │                │    App Bot      │   │
│  │  (自定义机器人)     │                │  (自建应用)      │   │
│  └───────────────────┘                └─────────────────┘   │
│          │                                        │          │
│          │                                        ▼          │
│          │                              ┌─────────────────┐   │
│          │                              │  Auth Module    │   │
│          │                              │  (Token 获取)    │   │
│          │                              └─────────────────┘   │
│          │                                        │          │
│          └────────────────┬─────────────────────┘          │
│                           ▼                                 │
│                 ┌───────────────────┐                      │
│                 │   HTTP Utility    │                      │
│                 │   (HTTP 工具类)    │                      │
│                 └───────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS 请求
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Feishu Open API                           │
│                  (飞书开放平台接口)                            │
└─────────────────────────────────────────────────────────────┘
```

### 模块说明

#### 📁 项目结构

```
feishu-bot-action/
├── src/                      # 源代码目录
│   ├── main.ts              # 主入口：参数验证、流程控制
│   ├── bots/                # 机器人模块
│   │   ├── index.ts         # 消息发送工厂
│   │   ├── custom-bot.ts    # 自定义机器人实现
│   │   └── app-bot.ts       # 自建应用机器人实现
│   ├── auth/                # 认证模块
│   │   └── token.ts         # Token 获取和缓存
│   └── utils/               # 工具模块
│       └── http.ts          # HTTP 请求工具类
├── lib/                     # 编译输出目录（TypeScript → JavaScript）
├── dist/                    # 打包输出目录（最终可执行文件）
├── examples/                # 使用示例
│   ├── pipeline-demo.yml    # 基础示例
│   ├── advanced-demo.yml    # 高级示例
│   └── card-demo.yml        # 卡片消息示例
├── action.yml               # 插件元数据定义
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
├── jest.config.js           # Jest 测试配置
└── README.md                # 本文档
```

#### 🔧 核心模块详解

##### 1. src/main.ts - 主流程控制

**职责**：
- 从 CodeArts 环境获取输入参数
- 执行参数验证逻辑
- 调用消息发送模块
- 处理执行结果和错误
- 输出执行结果

**关键函数**：
```typescript
// 参数验证
export function validateInputs(
  botType: string,
  webhookUrl: string,
  appId: string,
  appSecret: string,
  receiveId: string
): void

// 主流程
export async function run(): Promise<void>
```

**错误处理策略**：
- 参数缺失：立即抛出错误，提供清晰的错误提示
- API 调用失败：捕获异常，输出错误详情
- 所有错误：设置 `ok` 输出为 `false`，标记任务失败

##### 2. src/bots/index.ts - 消息发送工厂

**职责**：
- 定义统一的 `SendMessageConfig` 接口
- 根据机器人类型路由到对应的实现
- 提供统一的 `sendMessage()` 接口

**设计模式**：工厂模式

```typescript
export async function sendMessage(config: SendMessageConfig): Promise<boolean> {
  if (botType === 'custom') {
    return await sendCustomBotMessage(...);
  }
  if (botType === 'app') {
    return await sendAppBotMessage(...);
  }
  throw new Error(`不支持的机器人类型: ${botType}`);
}
```

##### 3. src/bots/custom-bot.ts - 自定义机器人

**职责**：
- 构建消息内容（文本或 JSON）
- 发送 webhook 请求
- 处理响应结果

**关键特性**：
- 支持 `text` 类型消息直接发送文本
- 其他类型消息需要传入 JSON 格式
- 卡片消息使用 `card` 字段，其他消息使用 `content` 字段

**API 端点**：`POST {webhook_url}`

##### 4. src/bots/app-bot.ts - 自建应用机器人

**职责**：
- 获取 tenant_access_token
- 构建消息请求
- 发送消息到指定接收者

**关键特性**：
- 自动获取和缓存 token
- 支持 4 种接收者 ID 类型（chat_id, open_id, user_id, union_id）
- 支持群聊和私聊

**API 端点**：
- Token: `POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal`
- 消息: `POST https://open.feishu.cn/open-apis/im/v1/messages`

##### 5. src/auth/token.ts - Token 管理

**职责**：
- 获取 tenant_access_token
- 缓存 token 避免重复请求
- 管理 token 过期时间

**缓存策略**：
- 缓存 token 在内存中
- 提前 5 分钟刷新（expire - 300秒）
- 避免频繁调用 token API

```typescript
let cachedToken: string | null = null;
let tokenExpireTime = 0;

// 缓存逻辑
if (cachedToken && Date.now() < tokenExpireTime) {
  return cachedToken;
}
```

##### 6. src/utils/http.ts - HTTP 工具类

**职责**：
- 封装 HTTPS 请求
- 构建请求参数
- 解析响应结果

**关键特性**：
- 使用 Node.js 原生 `https` 模块，零依赖
- Promise 化的异步请求
- 自动解析 JSON 响应
- 统一的错误处理

### 数据流

#### 自定义机器人消息发送流程

```
用户配置 (action.yml)
    │
    ├─ bot-type: custom
    ├─ webhook-url: ${{ webhook_url }}
    ├─ msg-type: text
    └─ message: "Hello"
    │
    ▼
main.ts (参数获取与验证)
    │
    ▼
bots/index.ts (路由到 custom bot)
    │
    ▼
custom-bot.ts
    │
    ├─ 构建消息体
    │   {
    │     "msg_type": "text",
    │     "content": { "text": "Hello" }
    │   }
    │
    ├─ 构建 HTTP 请求
    │
    └─ 发送 POST 请求到 webhook URL
        │
        ▼
    飞书 API 响应
        │
        ├─ 成功: { "code": 0 }
        └─ 失败: { "code": 1001, "msg": "错误信息" }
```

#### 自建应用机器人消息发送流程

```
用户配置 (action.yml)
    │
    ├─ bot-type: app
    ├─ app-id: cli_xxx
    ├─ app-secret: ${{ app_secret }}
    ├─ receive-type: chat_id
    ├─ receive-id: oc_xxx
    ├─ msg-type: text
    └─ message: "Hello"
    │
    ▼
main.ts (参数获取与验证)
    │
    ▼
bots/index.ts (路由到 app bot)
    │
    ▼
app-bot.ts
    │
    ├─ 调用 token.ts 获取 access_token
    │   │
    │   ├─ 检查缓存
    │   ├─ 缓存有效 → 返回 token
    │   └─ 缓存失效 → 请求新 token
    │       │
    │       POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal
    │       │
    │       └─ 返回: { "code": 0, "tenant_access_token": "xxx", "expire": 7200 }
    │
    ├─ 构建消息体
    │   {
    │     "receive_id": "oc_xxx",
    │     "msg_type": "text",
    │     "content": "{\"text\":\"Hello\"}"
    │   }
    │
    ├─ 构建 HTTP 请求 (携带 Authorization header)
    │
    └─ 发送 POST 请求到消息 API
        │
        POST https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id
        │
        ▼
    飞书 API 响应
        │
        ├─ 成功: { "code": 0 }
        └─ 失败: { "code": 1001, "msg": "错误信息" }
```

---

## 快速开始

### 前置条件

1. **华为云 CodeArts 账号**：已开通 CodeArts Pipeline 服务
2. **飞书账号**：
   - 自定义机器人：群聊管理权限
   - 自建应用：飞书开放平台开发者权限

### 5 分钟快速上手

#### 步骤 1：创建自定义机器人（推荐新手）

1. 在飞书群聊中，点击右上角 `设置` → `群机器人` → `添加机器人` → `自定义机器人`
2. 输入机器人名称和描述
3. 复制生成的 **Webhook URL**
4. （可选）配置安全设置（IP 白名单或签名校验）

#### 步骤 2：配置流水线隐私变量

在 CodeArts Pipeline 中配置隐私变量：

1. 进入流水线编辑页面
2. 点击 `参数配置` → `隐私参数`
3. 添加参数：
   - 参数名：`webhook_url`
   - 参数值：粘贴步骤 1 复制的 Webhook URL

#### 步骤 3：在流水线中使用插件

在流水线 YAML 中添加步骤：

```yaml
steps:
  - name: Send Feishu Notification
    uses: feishu-bot@1.0.0
    with:
      bot-type: custom
      webhook-url: ${{ webhook_url }}
      message: '🎉 Pipeline completed successfully!'
```

#### 步骤 4：运行流水线测试

运行流水线，查看飞书群聊是否收到消息通知。

✅ **恭喜！** 你已经成功集成飞书机器人通知功能。

---

## 配置说明

### action.yml 元数据

```yaml
name: 'feishu-bot'
version: '1.0.0'
author: 'feishu-bot'
description: 'Send notifications to Feishu bot from CodeArts pipeline'

inputs:
  bot-type:
    description: '机器人类型: custom (自定义机器人) 或 app (自建应用)'
    required: true
    default: 'custom'
  
  webhook-url:
    description: '自定义机器人 Webhook URL (bot-type=custom 时需要，通过隐私变量注入)'
    required: false
  
  app-id:
    description: '飞书应用 ID (bot-type=app 时需要)'
    required: false
  app-secret:
    description: '飞书应用 Secret (bot-type=app 时需要，通过隐私变量注入)'
    required: false
  receive-type:
    description: '接收者 ID 类型: chat_id, open_id, user_id, union_id (bot-type=app 时需要)'
    required: false
    default: 'chat_id'
  receive-id:
    description: '接收者 ID，群聊 ID 或用户 ID (bot-type=app 时需要)'
    required: false
  
  msg-type:
    description: '消息类型: text, post, interactive, image 等'
    required: true
    default: 'text'
  message:
    description: '消息内容，文本或 JSON 字符串'
    required: true

outputs:
  ok:
    description: '消息是否发送成功'

runs:
  using: 'node16'
  main: 'dist/index.js'
```

### 输入参数详解

#### 通用参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `bot-type` | string | ✅ | `custom` | 机器人类型：<br>• `custom`：自定义机器人<br>• `app`：自建应用机器人 |
| `msg-type` | string | ✅ | `text` | 消息类型：<br>• `text`：文本消息<br>• `post`：富文本消息<br>• `interactive`：卡片消息<br>• `image`：图片消息<br>• 其他类型见飞书文档 |
| `message` | string | ✅ | - | 消息内容：<br>• `text` 类型：直接传入文本<br>• 其他类型：传入 JSON 字符串 |

#### 自定义机器人参数（bot-type=custom）

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `webhook-url` | string | ✅ | 自定义机器人 Webhook URL，**必须通过隐私变量注入** | `${{ webhook_url }}` |

#### 自建应用机器人参数（bot-type=app）

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `app-id` | string | ✅ | - | 飞书应用 ID，在飞书开放平台创建应用后获取 |
| `app-secret` | string | ✅ | - | 飞书应用 Secret，**必须通过隐私变量注入** |
| `receive-type` | string | ❌ | `chat_id` | 接收者 ID 类型：<br>• `chat_id`：群聊 ID<br>• `open_id`：用户的 Open ID<br>• `user_id`：用户的 User ID<br>• `union_id`：用户的 Union ID |
| `receive-id` | string | ✅ | - | 接收者 ID，根据 `receive-type` 填入对应的 ID |

### 输出参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `ok` | boolean | 消息是否发送成功：<br>• `true`：发送成功<br>• `false`：发送失败 |

### 隐私变量配置

**⚠️ 重要**：敏感信息必须通过隐私变量注入，避免明文写入配置文件。

#### 配置方式

在 CodeArts Pipeline 中：

1. 进入流水线编辑页面
2. 点击 `参数配置` → `隐私参数`
3. 点击 `添加参数`
4. 填写参数信息：
   - **参数名**：变量名称（如 `webhook_url`、`app_secret`）
   - **参数值**：实际的敏感值
5. 保存配置

#### 使用方式

在流水线 YAML 中引用：

```yaml
# 自定义机器人
webhook-url: ${{ webhook_url }}

# 自建应用机器人
app-secret: ${{ app_secret }}
```

---

## 使用示例

### 示例 1：自定义机器人 - 简单文本通知

```yaml
steps:
  - name: Send notification
    uses: feishu-bot@1.0.0
    with:
      bot-type: custom
      webhook-url: ${{ webhook_url }}
      message: '✅ 构建成功！'
```

### 示例 2：自定义机器人 - 富文本消息

```yaml
steps:
  - name: Send rich text
    uses: feishu-bot@1.0.0
    with:
      bot-type: custom
      webhook-url: ${{ webhook_url }}
      msg-type: post
      message: |
        {
          "post": {
            "zh_cn": {
              "title": "构建通知",
              "content": [
                [
                  {"tag": "text", "text": "项目: "},
                  {"tag": "text", "text": "MyApp"}
                ],
                [
                  {"tag": "text", "text": "状态: "},
                  {"tag": "text", "text": "✅ 成功"}
                ]
              ]
            }
          }
        }
```

### 示例 3：自定义机器人 - 卡片消息

```yaml
steps:
  - name: Send card message
    uses: feishu-bot@1.0.0
    with:
      bot-type: custom
      webhook-url: ${{ webhook_url }}
      msg-type: interactive
      message: |
        {
          "header": {
            "title": {
              "tag": "plain_text",
              "content": "构建成功"
            },
            "template": "green"
          },
          "elements": [
            {
              "tag": "div",
              "text": {
                "tag": "plain_text",
                "content": "项目构建成功！"
              }
            }
          ]
        }
```

### 示例 4：自建应用 - 群聊通知

```yaml
steps:
  - name: Send group notification
    uses: feishu-bot@1.0.0
    with:
      bot-type: app
      app-id: 'cli_xxxxxxxxxx'
      app-secret: ${{ app_secret }}
      receive-type: chat_id
      receive-id: 'oc_xxxxxxxxxx'
      message: '🚀 部署成功！'
```

### 示例 5：自建应用 - 私聊通知

```yaml
steps:
  - name: Send private notification
    uses: feishu-bot@1.0.0
    with:
      bot-type: app
      app-id: 'cli_xxxxxxxxxx'
      app-secret: ${{ app_secret }}
      receive-type: open_id
      receive-id: 'ou_xxxxxxxxxx'
      message: '您的任务已完成！'
```

### 示例 6：结合流水线上下文变量

```yaml
steps:
  - name: Build project
    id: build
    run: |
      npm run build
      echo "build_status=success" >> $GITHUB_OUTPUT
  
  - name: Send build notification
    uses: feishu-bot@1.0.0
    with:
      bot-type: custom
      webhook-url: ${{ webhook_url }}
      message: |
        📋 构建报告
        项目: ${{ github.repository }}
        分支: ${{ github.ref_name }}
        状态: ${{ steps.build.outputs.build_status == 'success' && '✅ 成功' || '❌ 失败' }}
        触发者: ${{ github.actor }}
```

### 示例 7：完整 CI/CD 流水线

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run tests
        run: npm test
      
      - name: Notify test result
        uses: feishu-bot@1.0.0
        with:
          bot-type: custom
          webhook-url: ${{ webhook_url }}
          message: '✅ 测试通过'
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build
        run: npm run build
      
      - name: Notify build success
        uses: feishu-bot@1.0.0
        with:
          bot-type: app
          app-id: ${{ app_id }}
          app-secret: ${{ app_secret }}
          receive-type: chat_id
          receive-id: ${{ chat_id }}
          msg-type: interactive
          message: |
            {
              "header": {
                "title": {"tag": "plain_text", "content": "构建成功"},
                "template": "green"
              },
              "elements": [
                {
                  "tag": "div",
                  "text": {
                    "tag": "lark_md",
                    "content": "**项目**: ${{ github.repository }}\n**分支**: ${{ github.ref_name }}"
                  }
                }
              ]
            }
```

更多示例请查看 [`examples/`](./examples/) 目录。

---

## API 文档

### 飞书 API 端点

#### 自定义机器人

| 操作 | 端点 | 方法 | 说明 |
|------|------|------|------|
| 发送消息 | `{webhook_url}` | POST | 自定义机器人 Webhook 地址 |

**请求体格式**：

```json
{
  "msg_type": "text",
  "content": {
    "text": "消息内容"
  }
}
```

**响应格式**：

```json
{
  "code": 0,
  "msg": "success"
}
```

#### 自建应用机器人

| 操作 | 端点 | 方法 | 说明 |
|------|------|------|------|
| 获取 Token | `https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal` | POST | 获取 tenant_access_token |
| 发送消息 | `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type={type}` | POST | 发送消息到指定接收者 |

**Token 请求体**：

```json
{
  "app_id": "cli_xxx",
  "app_secret": "xxx"
}
```

**Token 响应**：

```json
{
  "code": 0,
  "msg": "ok",
  "tenant_access_token": "t-xxx",
  "expire": 7200
}
```

**消息请求头**：

```
Authorization: Bearer {tenant_access_token}
Content-Type: application/json
```

**消息请求体**：

```json
{
  "receive_id": "oc_xxx",
  "msg_type": "text",
  "content": "{\"text\":\"消息内容\"}"
}
```

**消息响应**：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "message_id": "om_xxx"
  }
}
```

### 消息类型说明

#### 文本消息 (text)

```json
{
  "msg_type": "text",
  "content": {
    "text": "文本内容"
  }
}
```

**支持功能**：
- 换行符 `\n`
- @ 用户：`<at user_id="ou_xxx">名字</at>`
- @ 所有人：`<at user_id="all">所有人</at>`

#### 富文本消息 (post)

```json
{
  "msg_type": "post",
  "content": {
    "post": {
      "zh_cn": {
        "title": "标题",
        "content": [
          [
            {"tag": "text", "text": "文本"},
            {"tag": "a", "text": "链接", "href": "http://example.com"},
            {"tag": "at", "user_id": "ou_xxx"}
          ]
        ]
      }
    }
  }
}
```

**支持的标签**：
- `text`：文本
- `a`：超链接
- `at`：@ 用户
- `img`：图片
- `media`：视频
- `emotion`：表情
- `hr`：分割线
- `code_block`：代码块
- `md`：Markdown

#### 卡片消息 (interactive)

卡片消息是功能最强大的消息类型，支持丰富的交互组件。

**基本结构**：

```json
{
  "config": {
    "wide_screen_mode": true
  },
  "header": {
    "title": {
      "tag": "plain_text",
      "content": "卡片标题"
    },
    "template": "blue"
  },
  "elements": [
    {
      "tag": "div",
      "text": {
        "tag": "plain_text",
        "content": "文本内容"
      }
    },
    {
      "tag": "action",
      "actions": [
        {
          "tag": "button",
          "text": {
            "tag": "plain_text",
            "content": "按钮"
          },
          "type": "primary",
          "url": "http://example.com"
        }
      ]
    }
  ]
}
```

**支持的元素**：
- `div`：文本块
- `markdown`：Markdown 内容
- `note`：备注信息
- `hr`：分割线
- `action`：交互按钮
- `form`：表单
- `img`：图片
- `chart`：图表

**Header 颜色主题**：
- `blue`：蓝色
- `green`：绿色
- `red`：红色
- `orange`：橙色
- `purple`：紫色
- `grey`：灰色

**详细文档**：[飞书卡片搭建工具](https://open.feishu.cn/cardkit)

---

## 开发指南

### 环境要求

- **Node.js**: v16.0.0 或更高版本
- **npm**: v7.0.0 或更高版本
- **TypeScript**: v5.0.0 或更高版本

### 本地开发

#### 1. 克隆项目

```bash
git clone https://github.com/your-org/feishu-bot-action.git
cd feishu-bot-action
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 开发模式

```bash
# 编译 TypeScript
npm run build

# 监听文件变化自动编译
npm run build -- --watch
```

#### 4. 运行测试

```bash
# 运行单元测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

#### 5. 真实 API 测试

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入真实配置：

```env
# 自定义机器人测试
WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx

# 自建应用测试
APP_ID=cli_xxx
APP_SECRET=xxx
RECEIVE_ID=oc_xxx
RECEIVE_TYPE=chat_id
```

运行真实测试：

```bash
# 测试自定义机器人
npm run test:real

# 测试卡片消息
npm run test:card
```

### 构建和打包

```bash
# 完整构建流程
npm run all

# 分步执行
npm run build          # 编译 TypeScript
npm run package        # 打包到 dist/
npm run zip            # 创建发布 ZIP 包
```

### 代码规范

#### TypeScript 规范

- 使用严格模式：`strict: true`
- 所有变量和函数必须有类型注解
- 避免使用 `any` 类型
- 使用接口定义数据结构

#### 命名规范

- **文件名**：小写字母，单词间用 `-` 连接（如 `custom-bot.ts`）
- **类名**：大驼峰（如 `HttpRequest`）
- **函数名**：小驼峰（如 `sendMessage`）
- **常量**：全大写，下划线分隔（如 `TOKEN_URL`）
- **接口**：大驼峰，以 `I` 开头（如 `SendMessageConfig`）

#### 注释规范

```typescript
/**
 * 发送飞书消息
 * @param config 消息配置
 * @returns 发送是否成功
 * @throws 当参数验证失败或 API 调用失败时抛出错误
 */
export async function sendMessage(config: SendMessageConfig): Promise<boolean> {
  // 实现...
}
```

### 调试技巧

#### 1. 使用 console.log 输出调试信息

```typescript
console.log('请求飞书 API...');
console.log('响应:', JSON.stringify(response, null, 2));
```

#### 2. 使用 act 本地测试

安装 [act](https://github.com/nektos/act) 工具：

```bash
# 本地运行 GitHub Actions
act -j test
```

#### 3. 断点调试

在 VS Code 中创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Main",
      "runtimeExecutable": "node",
      "runtimeArgs": ["--nolazy", "-r", "ts-node/register", "src/main.ts"],
      "envFile": "${workspaceFolder}/.env"
    }
  ]
}
```

---

## 测试说明

### 测试策略

项目采用多层次测试策略：

```
┌─────────────────────────────────────────┐
│           E2E 测试（真实 API）            │
│        test-real.ts / test-card.ts       │
└─────────────────────────────────────────┘
                    ▲
                    │
┌─────────────────────────────────────────┐
│          集成测试（Mock API）             │
│            main.test.ts                  │
│   - 参数验证测试                          │
│   - 消息构建测试                          │
│   - 发送流程测试                          │
└─────────────────────────────────────────┘
                    ▲
                    │
┌─────────────────────────────────────────┐
│          单元测试（工具函数）              │
│        buildMessageContent() 等          │
└─────────────────────────────────────────┘
```

### 单元测试

#### 测试框架

- **Jest**: 主测试框架
- **ts-jest**: TypeScript 支持
- **Mock**: 隔离外部依赖

#### 测试覆盖

```bash
# 运行测试并生成覆盖率报告
npm run test:coverage
```

**测试覆盖率目标**：
- 语句覆盖率：≥ 90%
- 分支覆盖率：≥ 80%
- 函数覆盖率：≥ 90%
- 行覆盖率：≥ 90%

#### 测试用例

**参数验证测试**：

```typescript
describe('参数校验', () => {
  test('自定义机器人有 webhook-url 时通过', () => {
    expect(() => validateInputs('custom', 'https://example.com', '', '', '')).not.toThrow();
  });

  test('自定义机器人没有 webhook-url 时失败', () => {
    expect(() => validateInputs('custom', '', '', '', '')).toThrow('webhook-url 是必需的');
  });
});
```

**消息构建测试**：

```typescript
describe('消息内容构建', () => {
  test('文本类型消息构建正确', () => {
    const result = buildMessageContent('text', 'hello world');
    expect(result).toEqual({ text: 'hello world' });
  });

  test('无效 JSON 时抛出错误', () => {
    expect(() => buildMessageContent('post', 'invalid json')).toThrow('解析消息 JSON 失败');
  });
});
```

**发送流程测试**：

```typescript
describe('自定义机器人发送', () => {
  test('发送消息成功', async () => {
    (httpRequest as jest.Mock).mockResolvedValue({
      statusCode: 200,
      body: { code: 0, msg: 'success' }
    });

    const result = await sendCustomBotMessage('https://example.com/hook/xxx', 'text', 'test');
    expect(result).toBe(true);
  });
});
```

### 集成测试

#### Mock 策略

使用 Jest Mock 隔离外部依赖：

```typescript
jest.mock('@actions/core');
jest.mock('./src/utils/http', () => ({
  httpRequest: jest.fn(),
  buildOptions: jest.fn()
}));
```

#### 测试场景

1. **成功场景**：Mock API 返回成功响应
2. **失败场景**：Mock API 返回错误响应
3. **异常场景**：Mock 抛出异常

### 真实 API 测试

#### 配置要求

创建 `.env` 文件：

```env
WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx
APP_ID=cli_xxx
APP_SECRET=xxx
RECEIVE_ID=oc_xxx
```

#### 运行测试

```bash
# 测试自定义机器人
npm run test:real

# 测试卡片消息
npm run test:card
```

#### 注意事项

- ⚠️ 真实测试会发送消息到飞书群聊
- ⚠️ 不要提交 `.env` 文件到代码仓库
- ⚠️ 测试前确认接收者 ID 正确

---

## 部署说明

### 打包流程

#### 1. 构建

```bash
npm run build
```

**输出**：
- `lib/` 目录：编译后的 JavaScript 文件
- `lib/**/*.d.ts`：TypeScript 类型定义文件

#### 2. 打包

```bash
npm run package
```

**输出**：
- `dist/index.js`：打包后的单一可执行文件
- 包含所有依赖（除 Node.js 内置模块）
- 使用 `@vercel/ncc` 工具打包

#### 3. 压缩

```bash
npm run zip
```

**输出**：
- `feishu-bot.zip`：发布包

**包含文件**：
```
feishu-bot.zip/
├── dist/
│   └── index.js
├── action.yml
└── README.md
```

### 发布到 CodeArts

#### 步骤 1：创建插件

1. 登录华为云 CodeArts
2. 进入 `扩展插件` → `基础插件`
3. 点击 `+ 新建插件`
4. 填写插件基本信息：
   - 插件名称：`feishu-bot`
   - 插件描述：`飞书机器人通知插件`
   - 插件类型：`Actions`

#### 步骤 2：上传插件包

1. 在插件详情页，点击 `版本列表`
2. 点击 `上传版本`
3. 选择 `feishu-bot.zip` 文件
4. 填写版本信息：
   - 版本号：`1.0.0`
   - 版本说明：`初始版本`

#### 步骤 3：发布插件

1. 上传成功后，点击 `发布`
2. 等待审核通过
3. 发布成功后，插件可在流水线中使用

### 版本管理

#### 版本号规范

遵循语义化版本规范：`MAJOR.MINOR.PATCH`

- **MAJOR**：重大变更（不兼容的 API 修改）
- **MINOR**：功能新增（向后兼容）
- **PATCH**：Bug 修复（向后兼容）

#### 版本发布流程

```bash
# 1. 更新版本号
npm version patch  # 或 minor / major

# 2. 构建
npm run all

# 3. 测试
npm test

# 4. 上传到 CodeArts
# 在 CodeArts 平台上传新版本

# 5. 发布
# 在 CodeArts 平台发布新版本
```

---

## 故障排查

### 常见错误

#### 1. 参数验证失败

**错误信息**：
```
当 bot-type 为 "custom" 时，webhook-url 是必需的
```

**原因**：缺少必需参数

**解决方案**：
- 检查 `action.yml` 中的参数配置
- 确认隐私变量是否正确配置
- 验证变量引用格式：`${{ variable_name }}`

#### 2. Webhook URL 无效

**错误信息**：
```
飞书 API 错误: invalid webhook url
```

**原因**：
- Webhook URL 格式错误
- Webhook 已失效或被删除

**解决方案**：
- 检查 Webhook URL 是否完整复制
- 在飞书群聊中重新获取 Webhook URL
- 确认机器人未被移除

#### 3. Token 获取失败

**错误信息**：
```
获取 tenant_access_token 失败: invalid app_id or app_secret
```

**原因**：
- App ID 或 App Secret 错误
- 应用未启用或被禁用

**解决方案**：
- 检查 App ID 和 App Secret 是否正确
- 确认应用已在飞书开放平台创建并启用
- 验证应用权限配置

#### 4. 消息发送失败

**错误信息**：
```
飞书 API 错误: invalid receive_id
```

**原因**：
- 接收者 ID 不存在
- 接收者 ID 类型不匹配
- 机器人不在群聊中

**解决方案**：
- 确认接收者 ID 正确
- 检查 `receive-type` 是否与 `receive-id` 匹配
- 确保机器人已加入目标群聊

#### 5. JSON 解析失败

**错误信息**：
```
解析消息 JSON 失败 (msg_type="post"): Unexpected token
```

**原因**：
- 消息 JSON 格式错误
- 引号未正确转义

**解决方案**：
- 验证 JSON 格式是否正确
- 使用 JSON 格式化工具检查
- 注意 YAML 多行字符串的格式

### 调试方法

#### 1. 查看流水线日志

在 CodeArts Pipeline 执行日志中查看详细错误信息：

```
开始发送飞书机器人通知...
机器人类型: custom
消息类型: text
请求飞书 API...
错误详情: ...
```

#### 2. 本地调试

使用 `.env` 文件本地测试：

```bash
npm run test:real
```

查看控制台输出，定位问题。

#### 3. API 响应分析

使用 Postman 或 curl 测试飞书 API：

```bash
# 测试自定义机器人
curl -X POST \
  https://open.feishu.cn/open-apis/bot/v2/hook/xxx \
  -H 'Content-Type: application/json' \
  -d '{
    "msg_type": "text",
    "content": {"text": "test"}
  }'
```

#### 4. 检查网络连接

确认 CodeArts 执行环境可以访问飞书 API：

- `https://open.feishu.cn`
- 端口：443

### 日志分析

#### 正常执行日志

```
开始发送飞书机器人通知...
机器人类型: custom
消息类型: text
请求飞书 API...
消息发送成功！
```

#### 失败执行日志

```
开始发送飞书机器人通知...
机器人类型: custom
消息类型: text
错误详情: Error: 飞书 API 错误: invalid webhook url
    at sendCustomBotMessage (dist/index.js:123:45)
    ...
```

**分析步骤**：
1. 定位错误类型
2. 查看错误详情
3. 根据错误信息对照解决方案

---

## 常见问题

### Q1: 自定义机器人和自建应用机器人如何选择？

**A**: 根据使用场景选择：

| 场景 | 推荐类型 | 原因 |
|------|---------|------|
| 仅需群聊通知 | 自定义机器人 | 配置简单，无需审批 |
| 需要私聊通知 | 自建应用机器人 | 支持私聊功能 |
| 需要更丰富的功能 | 自建应用机器人 | 功能更完整 |
| 快速原型验证 | 自定义机器人 | 快速上手 |

### Q2: 如何获取飞书群聊 ID？

**A**: 有两种方法：

1. **通过飞书开放平台**：
   - 创建自建应用并配置权限
   - 使用 API `GET /open-apis/im/v1/chats` 获取群聊列表
   - 返回结果中包含 `chat_id`

2. **通过群聊设置**：
   - 在群聊中添加自建应用机器人
   - 机器人接收到的消息事件中包含 `chat_id`

### Q3: 如何获取用户的 Open ID？

**A**: 有以下方法：

1. **通过飞书管理后台**：
   - 进入 `通讯录` → `成员管理`
   - 点击用户详情，查看 `Open ID`

2. **通过 API**：
   - 使用 `GET /open-apis/user/v1/users/:user_id` 接口
   - 返回结果中包含 `open_id`

3. **通过机器人消息事件**：
   - 用户与机器人对话时，消息事件中包含 `open_id`

### Q4: Token 缓存机制是如何工作的？

**A**: 插件实现了 Token 缓存：

```typescript
// 缓存策略
- 首次调用：请求新 token，缓存到内存
- 后续调用：
  - 检查缓存是否存在
  - 检查是否过期（提前 5 分钟刷新）
  - 缓存有效：直接返回
  - 缓存失效：重新请求
```

**优势**：
- 减少 API 调用次数
- 提升执行速度
- 避免频繁调用导致的限流

### Q5: 如何发送带 @ 的消息？

**A**: 根据消息类型：

**文本消息**：
```json
{
  "msg_type": "text",
  "content": {
    "text": "<at user_id=\"ou_xxx\">张三</at> 请查看"
  }
}
```

**富文本消息**：
```json
{
  "msg_type": "post",
  "content": {
    "post": {
      "zh_cn": {
        "content": [
          [
            {"tag": "at", "user_id": "ou_xxx"}
          ]
        ]
      }
    }
  }
}
```

**@ 所有人**：
```json
{
  "text": "<at user_id=\"all\">所有人</at>"
}
```

### Q6: 支持发送图片和文件吗？

**A**: 支持，但有限制：

**自定义机器人**：
- ❌ 不支持发送图片和文件
- ✅ 仅支持文本、富文本、卡片消息

**自建应用机器人**：
- ✅ 支持图片消息（需先上传获取 `image_key`）
- ✅ 支持文件消息（需先上传获取 `file_key`）
- ✅ 支持语音、视频消息

**上传流程**：
1. 调用飞书上传接口获取 `image_key` 或 `file_key`
2. 在消息中使用该 key

### Q7: 如何处理流水线失败时的通知？

**A**: 使用 `continue-on-error` 和条件判断：

```yaml
steps:
  - name: Build
    id: build
    run: npm run build
    continue-on-error: true
  
  - name: Notify on failure
    if: failure()
    uses: feishu-bot@1.0.0
    with:
      bot-type: custom
      webhook-url: ${{ webhook_url }}
      message: '❌ 构建失败'
  
  - name: Notify on success
    if: success()
    uses: feishu-bot@1.0.0
    with:
      bot-type: custom
      webhook-url: ${{ webhook_url }}
      message: '✅ 构建成功'
```

### Q8: 如何在消息中包含动态内容？

**A**: 使用流水线上下文变量：

```yaml
steps:
  - name: Send notification
    uses: feishu-bot@1.0.0
    with:
      bot-type: custom
      webhook-url: ${{ webhook_url }}
      message: |
        📋 构建报告
        项目: ${{ github.repository }}
        分支: ${{ github.ref_name }}
        提交: ${{ github.sha }}
        作者: ${{ github.actor }}
        状态: ${{ job.status }}
```

### Q9: 插件执行时间限制是多少？

**A**: 取决于 CodeArts Pipeline 配置：

- **默认超时**：60 分钟
- **可配置**：在流水线中设置 `timeout-minutes`
- **建议**：飞书 API 调用通常在 5 秒内完成

### Q10: 如何确保消息安全？

**A**: 采取以下安全措施：

1. **使用隐私变量**：
   - Webhook URL
   - App Secret
   - 其他敏感信息

2. **IP 白名单**（可选）：
   - 在飞书机器人配置中设置 IP 白名单
   - 仅允许 CodeArts 的 IP 地址

3. **签名校验**（可选）：
   - 在飞书机器人配置中启用签名校验
   - 在插件中实现签名逻辑（需修改源码）

---

## 更新日志

### [1.0.0] - 2024-03-01

#### 新增
- ✨ 支持自定义机器人发送消息
- ✨ 支持自建应用机器人发送消息
- ✨ 支持文本、富文本、卡片等多种消息类型
- ✨ Token 缓存机制
- ✨ 完善的参数验证
- ✨ 详细的错误处理
- ✨ 单元测试覆盖
- ✨ 完整的使用文档

#### 功能
- 🚀 支持群聊和私聊消息
- 🚀 支持隐私变量注入
- 🚀 支持流水线上下文变量

#### 文档
- 📚 详细的使用示例
- 📚 完整的 API 文档
- 📚 故障排查指南
- 📚 常见问题解答

---

## 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式

1. **报告 Bug**：提交 Issue 描述问题
2. **建议功能**：提交 Issue 描述需求
3. **提交代码**：Fork → 修改 → Pull Request
4. **完善文档**：改进文档内容

### 开发流程

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

### 代码规范

- 遵循 TypeScript 编码规范
- 添加必要的单元测试
- 更新相关文档
- 保持代码简洁清晰

### Commit 规范

使用约定式提交：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具相关

示例：
```
feat: support sending image messages
fix: fix token cache expire time calculation
docs: update API documentation
```

---

## 许可证

本项目采用 [MIT 许可证](LICENSE)。

```
MIT License

Copyright (c) 2024 Feishu Bot Action Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 联系方式

- **问题反馈**：提交 [Issue](https://github.com/your-org/feishu-bot-action/issues)
- **功能建议**：提交 [Issue](https://github.com/your-org/feishu-bot-action/issues)
- **安全漏洞**：请通过邮件私聊联系维护者

---

## 致谢

感谢以下项目和技术的支持：

- [华为云 CodeArts](https://www.huaweicloud.com/product/codearts.html)
- [飞书开放平台](https://open.feishu.cn/)
- [GitHub Actions Toolkit](https://github.com/actions/toolkit)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/)

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star 支持一下！**

Made with ❤️ by Feishu Bot Action Contributors

</div>