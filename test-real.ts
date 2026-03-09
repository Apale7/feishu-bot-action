import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

import { sendCustomBotMessage } from './src/bots/custom-bot';
import { sendAppBotMessage } from './src/bots/app-bot';

async function testCustomBot() {
  const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error('请设置 FEISHU_WEBHOOK_URL 环境变量');
    return;
  }

  console.log('测试自定义机器人发送文本消息...');
  const result = await sendCustomBotMessage(webhookUrl, 'text', '这是一条测试消息 - 来自飞书机器人插件');
  console.log('发送结果:', result);
}

async function testAppBot() {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  const receiveId = process.env.FEISHU_RECEIVE_ID;
  
  if (!appId || !appSecret || !receiveId) {
    console.error('请设置 FEISHU_APP_ID, FEISHU_APP_SECRET, FEISHU_RECEIVE_ID 环境变量');
    return;
  }

  console.log('测试自建应用机器人发送文本消息...');
  const result = await sendAppBotMessage(appId, appSecret, 'chat_id', receiveId, 'text', '这是一条测试消息 - 来自飞书机器人插件（自建应用）');
  console.log('发送结果:', result);
}

async function main() {
  const testType = process.argv[2] || 'custom';
  
  try {
    if (testType === 'custom') {
      await testCustomBot();
    } else if (testType === 'app') {
      await testAppBot();
    } else {
      console.log('用法: npm run test:real [custom|app]');
    }
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

main();