import * as dotenv from 'dotenv';
import * as path from 'path';
import { sendCustomBotMessage } from './src/bots/custom-bot';
import { sendAppBotMessage } from './src/bots/app-bot';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const PIPELINE_CARD = {
  "config": {
    "wide_screen_mode": true
  },
  "header": {
    "title": {
      "tag": "plain_text",
      "content": "流水线构建通知"
    },
    "template": "blue"
  },
  "elements": [
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "**项目名称：** CodeArts Demo\n**构建状态：** ✅ 成功\n**构建时间：** 2024-01-15 14:30:00\n**构建人：** 张三"
      }
    },
    {
      "tag": "hr"
    },
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "**构建详情**\n- 分支：main\n- 提交ID：a1b2c3d\n- 提交信息：feat: 新增飞书通知功能"
      }
    },
    {
      "tag": "action",
      "actions": [
        {
          "tag": "button",
          "text": {
            "tag": "plain_text",
            "content": "查看详情"
          },
          "type": "primary",
          "url": "https://codearts.example.com/pipeline/123"
        },
        {
          "tag": "button",
          "text": {
            "tag": "plain_text",
            "content": "查看日志"
          },
          "type": "default",
          "url": "https://codearts.example.com/pipeline/123/logs"
        }
      ]
    },
    {
      "tag": "note",
      "elements": [
        {
          "tag": "plain_text",
          "content": "此消息由 CodeArts Pipeline 自动发送"
        }
      ]
    }
  ]
};

const SIMPLE_CARD = {
  "header": {
    "title": {
      "tag": "plain_text",
      "content": "简单通知卡片"
    },
    "template": "green"
  },
  "elements": [
    {
      "tag": "div",
      "text": {
        "tag": "plain_text",
        "content": "这是一条来自飞书机器人插件的测试消息。"
      }
    }
  ]
};

const SUCCESS_CARD = {
  "header": {
    "title": {
      "tag": "plain_text",
      "content": "构建成功通知"
    },
    "template": "green"
  },
  "elements": [
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "✅ **构建成功**\n\n项目已成功构建并部署。"
      }
    },
    {
      "tag": "div",
      "fields": [
        {
          "is_short": true,
          "text": {
            "tag": "lark_md",
            "content": "**分支**\nmain"
          }
        },
        {
          "is_short": true,
          "text": {
            "tag": "lark_md",
            "content": "**耗时**\n2m 30s"
          }
        }
      ]
    }
  ]
};

const RICH_TEXT_MESSAGE = {
  "zh_cn": {
    "title": "我是一个标题",
    "content": [
      [
        {
          "tag": "text",
          "text": "第一行:",
          "style": ["bold", "underline"]

        },
        {
          "tag": "a",
          "href": "http://www.feishu.cn",
          "text": "超链接",
          "style": ["bold", "italic"]
        },
        {
          "tag": "at",
          "user_id": "ou_1avnmsbv3k45jnk34j5",
          "style": ["lineThrough"]
        }
      ],
     
      [
        {
          "tag": "text",
          "text": "第二行:",
          "style": ["bold", "underline"]
        },
        {
          "tag": "text",
          "text": "文本测试"
        }
      ],
     
     
      [{
        "tag": "emotion",
        "emoji_type": "SMILE"
      }],
      [{
        "tag": "hr"
      }],
      [{
        "tag": "code_block",
        "language": "GO",
        "text": "func main() int64 {\n    return 0\n}"
      }],
      [{
        "tag": "md",
        "text": "**mention user:**<at user_id=\"ou_xxxxxx\">Tom</at>\n**href:**[Open Platform](https://open.feishu.cn)\n**code block:**\n```GO\nfunc main() int64 {\n    return 0\n}\n```\n**text styles:** **bold**, *italic*, ***bold and italic***, ~underline~,~~lineThrough~~\n> quote content\n\n1. item1\n    1. item1.1\n    2. item2.2\n2. item2\n --- \n- item1\n    - item1.1\n    - item2.2\n- item2"
      }]
    ]
  }
};

async function testCustomBotCard() {
  const webhookUrl = process.env.FEISHU_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('❌ 请设置 FEISHU_WEBHOOK_URL 环境变量');
    return false;
  }

  console.log('\n========================================');
  console.log('📧 测试自定义机器人发送卡片消息');
  console.log('========================================\n');

  try {
    console.log('1️⃣ 发送交互式卡片（流水线通知）...');
    const cardJson = JSON.stringify(PIPELINE_CARD);
    const result1 = await sendCustomBotMessage(webhookUrl, 'interactive', cardJson);
    console.log('✅ 交互式卡片发送结果:', result1);

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n2️⃣ 发送富文本消息...');
    const richTextJson = JSON.stringify(RICH_TEXT_MESSAGE);
    const result2 = await sendCustomBotMessage(webhookUrl, 'post', richTextJson);
    console.log('✅ 富文本消息发送结果:', result2);

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n3️⃣ 发送简单卡片...');
    const simpleCardJson = JSON.stringify(SIMPLE_CARD);
    const result3 = await sendCustomBotMessage(webhookUrl, 'interactive', simpleCardJson);
    console.log('✅ 简单卡片发送结果:', result3);

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n4️⃣ 发送成功通知卡片...');
    const successCardJson = JSON.stringify(SUCCESS_CARD);
    const result4 = await sendCustomBotMessage(webhookUrl, 'interactive', successCardJson);
    console.log('✅ 成功通知卡片发送结果:', result4);

    console.log('\n✨ 所有卡片消息发送成功！');
    return true;
  } catch (error) {
    console.error('❌ 发送失败:', error);
    return false;
  }
}

async function testAppBotCard() {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  const receiveId = process.env.FEISHU_RECEIVE_ID;

  if (!appId || !appSecret || !receiveId) {
    console.error('❌ 请设置 FEISHU_APP_ID, FEISHU_APP_SECRET, FEISHU_RECEIVE_ID 环境变量');
    return false;
  }

  console.log('\n========================================');
  console.log('📧 测试自建应用机器人发送卡片消息');
  console.log('========================================\n');

  try {
    console.log('1️⃣ 发送交互式卡片（流水线通知）...');
    const cardJson = JSON.stringify(PIPELINE_CARD);
    const result1 = await sendAppBotMessage(appId, appSecret, 'open_id', receiveId, 'interactive', cardJson);
    console.log('✅ 交互式卡片发送结果:', result1);

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n2️⃣ 发送富文本消息...');
    const richTextJson = JSON.stringify(RICH_TEXT_MESSAGE);
    const result2 = await sendAppBotMessage(appId, appSecret, 'open_id', receiveId, 'post', richTextJson);
    console.log('✅ 富文本消息发送结果:', result2);

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n3️⃣ 发送成功通知卡片...');
    const successCardJson = JSON.stringify(SUCCESS_CARD);
    const result3 = await sendAppBotMessage(appId, appSecret, 'open_id', receiveId, 'interactive', successCardJson);
    console.log('✅ 成功通知卡片发送结果:', result3);

    console.log('\n✨ 所有卡片消息发送成功！');
    return true;
  } catch (error) {
    console.error('❌ 发送失败:', error);
    return false;
  }
}

function printUsage() {
  console.log('\n使用方法:');
  console.log('  npm run test:card            # 测试自定义机器人发送卡片');
  console.log('  npm run test:card app        # 测试自建应用机器人发送卡片');
  console.log('  npm run test:card all        # 测试两种机器人\n');
  console.log('环境变量配置 (.env 文件):');
  console.log('  FEISHU_WEBHOOK_URL=xxx       # 自定义机器人 Webhook URL');
  console.log('  FEISHU_APP_ID=xxx            # 自建应用 ID');
  console.log('  FEISHU_APP_SECRET=xxx        # 自建应用 Secret');
  console.log('  FEISHU_RECEIVE_ID=xxx        # 接收者 ID\n');
}

async function main() {
  const testType = process.argv[2] || 'custom';

  console.log('\n🚀 飞书机器人卡片消息测试\n');

  if (testType === '--help' || testType === '-h') {
    printUsage();
    process.exit(0);
  }

  let success = true;

  if (testType === 'custom' || testType === 'all') {
    const result = await testCustomBotCard();
    success = success && result;
  }

  if (testType === 'app' || testType === 'all') {
    const result = await testAppBotCard();
    success = success && result;
  }

  if (testType !== 'custom' && testType !== 'app' && testType !== 'all') {
    console.log('❌ 未知的测试类型:', testType);
    printUsage();
    process.exit(1);
  }

  process.exit(success ? 0 : 1);
}

main();