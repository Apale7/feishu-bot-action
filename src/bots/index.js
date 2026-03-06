const { sendCustomBotMessage } = require('./custom-bot');
const { sendAppBotMessage } = require('./app-bot');

const BOT_TYPE_CUSTOM = 'custom';
const BOT_TYPE_APP = 'app';

async function sendMessage(config) {
  const { botType, webhookUrl, appId, appSecret, receiveType, receiveId, msgType, message } = config;

  if (botType === BOT_TYPE_CUSTOM) {
    return await sendCustomBotMessage(webhookUrl, msgType, message);
  }

  if (botType === BOT_TYPE_APP) {
    return await sendAppBotMessage(appId, appSecret, receiveType, receiveId, msgType, message);
  }

  throw new Error(`不支持的机器人类型: ${botType}。支持的类型: custom, app`);
}

module.exports = {
  sendMessage,
  BOT_TYPE_CUSTOM,
  BOT_TYPE_APP
};