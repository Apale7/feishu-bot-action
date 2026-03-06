# Feishu Bot Action

华为云 CodeArts Pipeline 飞书机器人通知插件

## 功能

支持两种飞书机器人类型发送消息通知：

1. **自定义机器人**：通过 webhook URL 发送消息到指定群聊
2. **自建应用机器人**：通过 App ID 和 App Secret 发送消息，支持群聊和私聊

## 输入参数

### 通用参数

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `bot-type` | 是 | `custom` | 机器人类型：`custom`（自定义机器人）或 `app`（自建应用） |
| `msg-type` | 是 | `text` | 消息类型：`text`、`post`、`interactive` 等 |
| `message` | 是 | - | 消息内容（文本或 JSON 字符串） |

### 自定义机器人参数（bot-type=custom）

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `webhook-url` | 是 | `${{ webhook_url }}` | 自定义机器人 webhook URL（通过隐私变量注入） |

### 自建应用机器人参数（bot-type=app）

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `app-id` | 是 | - | 飞书应用 ID |
| `app-secret` | 是 | `${{ app_secret }}` | 飞书应用 Secret（通过隐私变量注入） |
| `receive-type` | 否 | `chat_id` | 接收者 ID 类型：`chat_id`、`open_id`、`user_id`、`union_id` |
| `receive-id` | 是 | - | 接收者 ID（群聊 ID 或用户 ID） |

## 输出参数

- `ok`: 消息是否发送成功（布尔类型）

## 隐私变量配置

在 CodeArts Pipeline 中，敏感信息应通过隐私变量注入：

1. **自定义机器人**：在流水线参数中配置 `webhook_url`
2. **自建应用机器人**：在流水线参数中配置 `app_secret`

## 使用示例

### 自定义机器人 - 发送文本消息

```yaml
steps:
  - name: Send notification
    uses: feishu-bot-action@1.0.0
    with:
      bot-type: custom
      webhook-url: ${{ webhook_url }}
      message: 'Pipeline completed successfully!'
```

### 自建应用 - 发送群聊消息

```yaml
steps:
  - name: Send group notification
    uses: feishu-bot-action@1.0.0
    with:
      bot-type: app
      app-id: 'cli_xxxxxxxxxx'
      app-secret: ${{ app_secret }}
      receive-type: chat_id
      receive-id: 'oc_xxxxxxxxxx'
      message: 'Pipeline completed!'
```

### 自建应用 - 发送私聊消息

```yaml
steps:
  - name: Send private notification
    uses: feishu-bot-action@1.0.0
    with:
      bot-type: app
      app-id: 'cli_xxxxxxxxxx'
      app-secret: ${{ app_secret }}
      receive-type: open_id
      receive-id: 'ou_xxxxxxxxxx'
      message: 'Your task is complete!'
```

### 发送富文本消息

```yaml
steps:
  - name: Send rich text notification
    uses: feishu-bot-action@1.0.0
    with:
      bot-type: custom
      webhook-url: ${{ webhook_url }}
      msg-type: post
      message: |
        {
          "post": {
            "zh_cn": {
              "title": "构建通知",
              "content": [[{"tag": "text", "text": "构建状态: "}, {"tag": "text", "text": "成功"}]]
            }
          }
        }
```

更多示例见 `examples/` 目录

## 开发

```bash
# 安装依赖
npm install

# 运行单元测试
npm test

# 真实测试（需要配置 .env 文件）
cp .env.example .env
# 编辑 .env 文件填入相关配置
npm run test:real

# 打包
npm run package
npm run zip
```

## 消息格式

### 文本消息（msg-type=text）

```json
{
  "msg_type": "text",
  "content": {
    "text": "消息内容"
  }
}
```

### 富文本消息（msg-type=post）

```json
{
  "msg_type": "post",
  "content": {
    "post": {
      "zh_cn": {
        "title": "标题",
        "content": [[{"tag": "text", "text": "内容"}]]
      }
    }
  }
}
```