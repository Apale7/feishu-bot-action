"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInputs = validateInputs;
exports.run = run;
const core = __importStar(require("@actions/core"));
const bots_1 = require("./bots");
function validateInputs(botType, webhookUrl, appId, appSecret, receiveId) {
    if (botType === bots_1.BOT_TYPE_CUSTOM) {
        if (!webhookUrl) {
            throw new Error('当 bot-type 为 "custom" 时，webhook-url 是必需的');
        }
        return;
    }
    if (botType === bots_1.BOT_TYPE_APP) {
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
        const ok = await (0, bots_1.sendMessage)({
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
    }
    catch (error) {
        console.error('错误详情:', error);
        core.setOutput('ok', false);
        core.setFailed(error.message);
    }
}
if (require.main === module) {
    run();
}
//# sourceMappingURL=main.js.map