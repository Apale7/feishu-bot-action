const core = require('@actions/core');
const { sendMessage, BOT_TYPE_CUSTOM, BOT_TYPE_APP } = require('./bots');

function validateInputs(botType, webhookUrl, appId, appSecret, receiveId) {
  if (botType === BOT_TYPE_CUSTOM) {
    if (!webhookUrl) {
      throw new Error('当 bot-type 为 "custom" 时，webhook-url 是必需的');
    }
    return;
  }

  if (botType === BOT_TYPE_APP) {
    if (!appId) {
      throw new Error('当 bot-type 为 "app" 时，app-id 是必需的');
    }
    if (!appSecret) {
      throw new Error('当 bot-type 为 "app" 时，app-secret 是必需的');
    }
    if (!receiveId) {
      throw new Error('当 bot-type 为 "app" 时，receive-id 是必需的');
    }
    return;
  }

  throw new Error(`不支持的机器人类型: ${botType}。支持的类型: custom, app`);
}

async function run() {
  try {
    const botType = core.getInput('bot-type', { required: true });
    const webhookUrl = core.getInput('webhook-url');
    const appId = core.getInput('app-id');
    const appSecret = core.getInput('app-secret');
    const receiveType = core.getInput('receive-type') || 'chat_id';
    const receiveId = core.getInput('receive-id');
    const msgType = core.getInput('msg-type') || 'text';
    const message = core.getInput('message', { required: true });

    console.log('开始发送飞书机器人通知...');
    console.log(`机器人类型: ${botType}`);
    console.log(`消息类型: ${msgType}`);

    validateInputs(botType, webhookUrl, appId, appSecret, receiveId);

    const ok = await sendMessage({
      botType,
      webhookUrl,
      appId,
      appSecret,
      receiveType,
      receiveId,
      msgType,
      message
    });

    core.setOutput('ok', ok);
    console.log('消息发送成功！');
  } catch (error) {
    console.error('错误详情:', error);
    core.setOutput('ok', false);
    core.setFailed(error.message);
  }
}

module.exports = { run, validateInputs };

if (require.main === module) {
  run();
}