export type MessageType = 'text' | 'post' | 'interactive' | 'image' | string;
export interface MessageContent {
    [key: string]: any;
}
export declare function buildMessageContent(msgType: MessageType, message: string): MessageContent;
export declare function sendCustomBotMessage(webhookUrl: string, msgType: MessageType, message: string): Promise<boolean>;
//# sourceMappingURL=custom-bot.d.ts.map