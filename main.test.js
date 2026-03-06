const core = require('@actions/core');
const https = require('https');

jest.mock('@actions/core');
jest.mock('https');

describe('Feishu Bot Action', () => {
  test('should send message', async () => {
    core.getInput
      .mockReturnValueOnce('https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_WEBHOOK_TOKEN_HERE')
      .mockReturnValueOnce('test message');

    const mockReq = {
      write: jest.fn(),
      end: jest.fn(),
      on: jest.fn()
    };

    const mockRes = {
      on: jest.fn((event, handler) => {
        if (event === 'data') handler('{"code":0}');
        if (event === 'end') handler();
      })
    };

    https.request.mockImplementation((options, callback) => {
      callback(mockRes);
      return mockReq;
    });

    const { run } = require('./src/main');
    await run();

    expect(core.setOutput).toHaveBeenCalled();
  });
});