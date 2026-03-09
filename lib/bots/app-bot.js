"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAppBotMessage = sendAppBotMessage;
const http_1 = require("../utils/http");
const token_1 = require("../auth/token");
const custom_bot_1 = require("./custom-bot");
const MESSAGE_URL = 'https://open.feishu.cn/open-apis/im/v1/messages';
async function sendAppBotMessage(appId, appSecret, receiveType, receiveId, msgType, message) {
    if (!appId) {
        throw new Error('自建应用机器人需要 app-id 参数');
    }
    if (!appSecret) {
        throw new Error('自建应用机器人需要 app-secret 参数');
    }
    if (!receiveId) {
        throw new Error('自建应用机器人需要 receive-id 参数');
    }
    if (!message) {
        throw new Error('message 参数是必需的');
    }
    console.log('获取飞书访问令牌...');
    const token = await (0, token_1.getTenantAccessToken)(appId, appSecret);
    const content = (0, custom_bot_1.buildMessageContent)(msgType, message);
    const url = `${MESSAGE_URL}?receive_id_type=${receiveType}`;
    const body = JSON.stringify({
        receive_id: receiveId,
        msg_type: msgType,
        content: JSON.stringify(content)
    });
    const options = (0, http_1.buildOptions)(url, 'POST', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }, body);
    console.log('请求飞书消息 API...');
    const response = await (0, http_1.httpRequest)(options, body);
    if (response.body.code === 0) {
        return true;
    }
    throw new Error(`飞书 API 错误: ${response.body.msg || JSON.stringify(response.body)}`);
}
//# sourceMappingURL=app-bot.js.map