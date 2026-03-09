import { MessageType } from './custom-bot';
export declare const BOT_TYPE_CUSTOM = "custom";
export declare const BOT_TYPE_APP = "app";
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
export declare function sendMessage(config: SendMessageConfig): Promise<boolean>;
//# sourceMappingURL=index.d.ts.map