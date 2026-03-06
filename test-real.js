require('dotenv').config();
const { sendFeishuMessage } = require('./src/main');

async function testReal() {
  const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
  const message = process.env.FEISHU_MESSAGE || 'Test message from feishu-bot-action';

  if (!webhookUrl) {
    console.error('Error: Please set FEISHU_WEBHOOK_URL in .env file or environment variable');
    console.log('\nExample .env file:');
    console.log('FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxxxx');
    console.log('FEISHU_MESSAGE=Your test message here');
    process.exit(1);
  }

  try {
    console.log('Testing with real webhook...');
    console.log('Webhook URL:', webhookUrl);
    console.log('Message:', message);
    console.log('---');
    
    await sendFeishuMessage(webhookUrl, message);
    console.log('\n✓ Success! Check your Feishu group for the message.');
  } catch (error) {
    console.error('\n✗ Failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. Webhook URL is correct');
    console.error('2. Bot is in the group');
    console.error('3. Network connection is available');
    process.exit(1);
  }
}

testReal();