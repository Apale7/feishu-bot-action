# Feishu Bot Action

华为云 CodeArts Pipeline 飞书机器人通知插件

## 功能

在 CodeArts Pipeline 中调用飞书群自定义机器人发送文本通知

## 输入参数

- `webhook-url`: 飞书机器人的 webhook URL（必填，私密参数，通过 `${webhook_url}` 引入）
- `message`: 要发送的消息内容（必填）

## 输出参数

- `ok`: 消息是否发送成功（布尔类型）

## 使用示例

### 基础用法

```yaml
steps:
  - name: Send notification
    uses: feishu-bot-action@1.0.0
    with:
      webhook-url: ${{ webhook_url }}
      message: 'Pipeline completed successfully!'
```

### 完整 Pipeline 示例

```yaml
name: Build Pipeline

jobs:
  build:
    steps:
      - name: Build project
        run: npm run build

      - name: Send success notification
        uses: feishu-bot-action@1.0.0
        with:
          webhook-url: ${{ webhook_url }}
          message: |
            ✅ 构建成功！
            项目: ${{ github.repository }}
            分支: ${{ github.ref_name }}

      - name: Check notification result
        run: |
          if [ "${{ steps.send.outputs.ok }}" == "true" ]; then
            echo "Notification sent successfully"
          fi
```

更多示例见 `examples/` 目录

## 开发

```bash
# 安装依赖
npm install

# 运行单元测试（使用mock，不会真正发送消息）
npm test

# 真实测试（会发送真实消息到飞书）
# 1. 创建 .env 文件
cp .env.example .env

# 2. 编辑 .env 文件，填入你的飞书机器人 webhook URL
# FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/your-token
# FEISHU_MESSAGE=测试消息

# 3. 运行真实测试
npm run test:real

# 打包
npm run package
npm run zip
```

## 消息格式

插件发送文本消息格式：

```json
{
  "msg_type": "text",
  "content": {
    "text": "消息内容"
  }
}
```