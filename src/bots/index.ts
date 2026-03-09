import { sendCustomBotMessage, MessageType } from './custom-bot';
import { sendAppBotMessage } from './app-bot';

export const BOT_TYPE_CUSTOM = 'custom';
export const BOT_TYPE_APP = 'app';

export type BotType = typeof BOT_TYPE_CUSTOM | typeof BOT_TYPE_APP;

export interface SendMessageConfig {
  botType: BotType | string;
  webhookUrl?: string;
  appId?: string;
  appSecret?: string;
  receiveType?: string;
  receiveId?: string;
  msgType: MessageType;
  message: string;
}

export async function sendMessage(config: SendMessageConfig): Promise<boolean> {
  const { botType, webhookUrl, appId, appSecret, receiveType, receiveId, msgType, message } = config;

  if (botType === BOT_TYPE_CUSTOM) {
    return await sendCustomBotMessage(webhookUrl || '', msgType, message);
  }

  if (botType === BOT_TYPE_APP) {
    return await sendAppBotMessage(
      appId || '',
      appSecret || '',
      receiveType || 'chat_id',
      receiveId || '',
      msgType,
      message
    );
  }

  throw new Error(`不支持的机器人类型: ${botType}。支持的类型: custom, app`);
}