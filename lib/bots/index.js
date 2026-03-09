"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOT_TYPE_APP = exports.BOT_TYPE_CUSTOM = void 0;
exports.sendMessage = sendMessage;
const custom_bot_1 = require("./custom-bot");
const app_bot_1 = require("./app-bot");
exports.BOT_TYPE_CUSTOM = 'custom';
exports.BOT_TYPE_APP = 'app';
async function sendMessage(config) {
    const { botType, webhookUrl, appId, appSecret, receiveType, receiveId, msgType, message } = config;
    if (botType === exports.BOT_TYPE_CUSTOM) {
        return await (0, custom_bot_1.sendCustomBotMessage)(webhookUrl || '', msgType, message);
    }
    if (botType === exports.BOT_TYPE_APP) {
        return await (0, app_bot_1.sendAppBotMessage)(appId || '', appSecret || '', receiveType || 'chat_id', receiveId || '', msgType, message);
    }
    throw new Error(`不支持的机器人类型: ${botType}。支持的类型: custom, app`);
}
//# sourceMappingURL=index.js.map