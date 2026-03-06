const { httpRequest, buildOptions } = require('../utils/http');

function buildMessageContent(msgType, message) {
  if (msgType === 'text') {
    return {
      text: message
    };
  }
  
  try {
    return JSON.parse(message);
  } catch (e) {
    throw new Error(`解析消息 JSON 失败 (msg_type="${msgType}"): ${e.message}`);
  }
}

async function sendCustomBotMessage(webhookUrl, msgType, message) {
  if (!webhookUrl) {
    throw new Error('自定义机器人需要 webhook-url 参数');
  }

  if (!message) {
    throw new Error('message 参数是必需的');
  }

  const content = buildMessageContent(msgType, message);

  const body = JSON.stringify({
    msg_type: msgType,
    content: content
  });

  const options = buildOptions(webhookUrl, 'POST', {
    'Content-Type': 'application/json'
  }, body);

  console.log('请求飞书 API...');

  const response = await httpRequest(options, body);

  if (response.body.code === 0 || response.body.StatusCode === 0 || response.body.status === 'success') {
    return true;
  }

  throw new Error(`飞书 API 错误: ${response.body.msg || response.body.message || JSON.stringify(response.body)}`);
}

module.exports = {
  sendCustomBotMessage,
  buildMessageContent
};