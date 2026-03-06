require('dotenv').config();
const { sendMessage } = require('./src/bots');

async function testReal() {
  const botType = process.env.FEISHU_BOT_TYPE || 'custom';
  const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  const receiveType = process.env.FEISHU_RECEIVE_TYPE || 'chat_id';
  const receiveId = process.env.FEISHU_RECEIVE_ID;
  const msgType = process.env.FEISHU_MSG_TYPE || 'text';
  const message = process.env.FEISHU_MESSAGE || '来自 feishu-bot-action 的测试消息';

  console.log('飞书机器人真实测试');
  console.log('================');
  console.log('机器人类型:', botType);
  console.log('消息类型:', msgType);
  console.log('消息内容:', message);

  if (botType === 'custom') {
    if (!webhookUrl) {
      console.error('\n错误: 请在 .env 文件中设置 FEISHU_WEBHOOK_URL');
      console.log('\n.env 文件示例:');
      console.log('FEISHU_BOT_TYPE=custom');
      console.log('FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxxxx');
      console.log('FEISHU_MESSAGE=测试消息');
      process.exit(1);
    }
    console.log('Webhook URL:', webhookUrl);
  } else if (botType === 'app') {
    if (!appId || !appSecret || !receiveId) {
      console.error('\n错误: 请在 .env 文件中设置 FEISHU_APP_ID、FEISHU_APP_SECRET 和 FEISHU_RECEIVE_ID');
      console.log('\n.env 文件示例:');
      console.log('FEISHU_BOT_TYPE=app');
      console.log('FEISHU_APP_ID=cli_xxxxx');
      console.log('FEISHU_APP_SECRET=xxxxx');
      console.log('FEISHU_RECEIVE_TYPE=chat_id');
      console.log('FEISHU_RECEIVE_ID=oc_xxxxx');
      console.log('FEISHU_MESSAGE=测试消息');
      process.exit(1);
    }
    console.log('App ID:', appId);
    console.log('接收者类型:', receiveType);
    console.log('接收者 ID:', receiveId);
  } else {
    console.error('\n错误: 不支持的机器人类型:', botType);
    process.exit(1);
  }

  console.log('---');

  try {
    await sendMessage({
      botType,
      webhookUrl,
      appId,
      appSecret,
      receiveType,
      receiveId,
      msgType,
      message
    });
    console.log('\n✓ 发送成功！请检查飞书群聊或私聊消息。');
  } catch (error) {
    console.error('\n✗ 发送失败:', error.message);
    console.error('\n请检查:');
    if (botType === 'custom') {
      console.error('1. Webhook URL 是否正确');
      console.error('2. 机器人是否在群聊中');
    } else {
      console.error('1. App ID 和 App Secret 是否正确');
      console.error('2. 接收者 ID 是否正确');
      console.error('3. 应用是否有发送消息权限');
    }
    console.error('4. 网络连接是否正常');
    process.exit(1);
  }
}

testReal();