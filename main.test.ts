import * as core from '@actions/core';
import { httpRequest, buildOptions } from './src/utils/http';
import { sendCustomBotMessage, buildMessageContent } from './src/bots/custom-bot';
import { sendAppBotMessage } from './src/bots/app-bot';
import { sendMessage } from './src/bots/index';
import { validateInputs } from './src/main';

jest.mock('@actions/core');
jest.mock('./src/utils/http', () => ({
  httpRequest: jest.fn(),
  buildOptions: jest.fn((url: string, method: string, headers?: Record<string, string | number>, body?: string) => ({
    hostname: new URL(url).hostname,
    port: 443,
    path: new URL(url).pathname + new URL(url).search,
    method,
    headers: headers || {}
  }))
}));

describe('飞书机器人插件', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('参数校验', () => {
    test('自定义机器人有 webhook-url 时通过', () => {
      expect(() => validateInputs('custom', 'https://example.com', '', '', '')).not.toThrow();
    });

    test('自定义机器人没有 webhook-url 时失败', () => {
      expect(() => validateInputs('custom', '', '', '', '')).toThrow('webhook-url 是必需的');
    });

    test('自建应用有全部必需参数时通过', () => {
      expect(() => validateInputs('app', '', 'app-id', 'app-secret', 'receive-id')).not.toThrow();
    });

    test('自建应用没有 app-id 时失败', () => {
      expect(() => validateInputs('app', '', '', 'app-secret', 'receive-id')).toThrow('app-id 是必需的');
    });

    test('自建应用没有 app-secret 时失败', () => {
      expect(() => validateInputs('app', '', 'app-id', '', 'receive-id')).toThrow('app-secret 是必需的');
    });

    test('自建应用没有 receive-id 时失败', () => {
      expect(() => validateInputs('app', '', 'app-id', 'app-secret', '')).toThrow('receive-id 是必需的');
    });

    test('不支持的机器人类型时失败', () => {
      expect(() => validateInputs('unknown', '', '', '', '')).toThrow('不支持的机器人类型');
    });
  });

  describe('消息内容构建', () => {
    test('文本类型消息构建正确', () => {
      const result = buildMessageContent('text', 'hello world');
      expect(result).toEqual({ text: 'hello world' });
    });

    test('非文本类型消息解析 JSON', () => {
      const jsonContent = '{"post":{"zh_cn":{"title":"test"}}}';
      const result = buildMessageContent('post', jsonContent);
      expect(result).toEqual({ post: { zh_cn: { title: 'test' } } });
    });

    test('无效 JSON 时抛出错误', () => {
      expect(() => buildMessageContent('post', 'invalid json')).toThrow('解析消息 JSON 失败');
    });
  });

  describe('自定义机器人发送', () => {
    test('发送消息成功', async () => {
      (httpRequest as jest.Mock).mockResolvedValue({
        statusCode: 200,
        body: { code: 0, msg: 'success' }
      });

      const result = await sendCustomBotMessage('https://open.feishu.cn/hook/xxx', 'text', 'test message');
      expect(result).toBe(true);
    });

    test('缺少 webhook-url 时抛出错误', async () => {
      await expect(sendCustomBotMessage('', 'text', 'test')).rejects.toThrow('需要 webhook-url 参数');
    });

    test('缺少 message 时抛出错误', async () => {
      await expect(sendCustomBotMessage('https://example.com', 'text', '')).rejects.toThrow('message 参数是必需的');
    });
  });

  describe('自建应用机器人发送', () => {
    test('发送消息成功', async () => {
      (httpRequest as jest.Mock)
        .mockResolvedValueOnce({
          statusCode: 200,
          body: { code: 0, tenant_access_token: 'test-token', expire: 7200 }
        })
        .mockResolvedValueOnce({
          statusCode: 200,
          body: { code: 0, msg: 'success' }
        });

      const result = await sendAppBotMessage('app-id', 'app-secret', 'chat_id', 'chat-123', 'text', 'test message');
      expect(result).toBe(true);
    });

    test('缺少 app-id 时抛出错误', async () => {
      await expect(sendAppBotMessage('', 'secret', 'chat_id', 'chat-123', 'text', 'test')).rejects.toThrow('需要 app-id 参数');
    });

    test('缺少 app-secret 时抛出错误', async () => {
      await expect(sendAppBotMessage('app-id', '', 'chat_id', 'chat-123', 'text', 'test')).rejects.toThrow('需要 app-secret 参数');
    });

    test('缺少 receive-id 时抛出错误', async () => {
      await expect(sendAppBotMessage('app-id', 'secret', 'chat_id', '', 'text', 'test')).rejects.toThrow('需要 receive-id 参数');
    });
  });

  describe('消息发送工厂', () => {
    test('bot-type=custom 时调用自定义机器人', async () => {
      (httpRequest as jest.Mock).mockResolvedValue({
        statusCode: 200,
        body: { code: 0 }
      });

      await sendMessage({
        botType: 'custom',
        webhookUrl: 'https://example.com/hook/xxx',
        msgType: 'text',
        message: 'test'
      });

      expect(httpRequest).toHaveBeenCalled();
    });

    test('不支持的机器人类型时抛出错误', async () => {
      await expect(sendMessage({
        botType: 'unknown',
        msgType: 'text',
        message: 'test'
      })).rejects.toThrow('不支持的机器人类型');
    });
  });
});