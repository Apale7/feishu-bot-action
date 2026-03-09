import { httpRequest, buildOptions } from '../utils/http';

const TOKEN_URL = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';

interface TokenResponse {
  code: number;
  msg?: string;
  tenant_access_token?: string;
  expire?: number;
}

let cachedToken: string | null = null;
let tokenExpireTime = 0;

export async function getTenantAccessToken(appId: string, appSecret: string): Promise<string> {
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
  const responseBody = response.body as TokenResponse;

  if (responseBody.code !== 0) {
    throw new Error(`获取 tenant_access_token 失败: ${responseBody.msg || JSON.stringify(responseBody)}`);
  }

  cachedToken = responseBody.tenant_access_token || null;
  tokenExpireTime = Date.now() + ((responseBody.expire || 7200) - 300) * 1000;

  return cachedToken as string;
}

export function clearCache(): void {
  cachedToken = null;
  tokenExpireTime = 0;
}