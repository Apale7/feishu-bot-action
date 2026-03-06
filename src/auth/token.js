const { httpRequest, buildOptions } = require('../utils/http');

const TOKEN_URL = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';

let cachedToken = null;
let tokenExpireTime = 0;

async function getTenantAccessToken(appId, appSecret) {
  if (cachedToken && Date.now() < tokenExpireTime) {
    return cachedToken;
  }

  const body = JSON.stringify({
    app_id: appId,
    app_secret: appSecret
  });

  const options = buildOptions(TOKEN_URL, 'POST', {
    'Content-Type': 'application/json'
  }, body);

  const response = await httpRequest(options, body);

  if (response.body.code !== 0) {
    throw new Error(`获取 tenant_access_token 失败: ${response.body.msg || JSON.stringify(response.body)}`);
  }

  cachedToken = response.body.tenant_access_token;
  tokenExpireTime = Date.now() + (response.body.expire - 300) * 1000;

  return cachedToken;
}

function clearCache() {
  cachedToken = null;
  tokenExpireTime = 0;
}

module.exports = {
  getTenantAccessToken,
  clearCache
};