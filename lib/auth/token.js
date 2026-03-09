"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantAccessToken = getTenantAccessToken;
exports.clearCache = clearCache;
const http_1 = require("../utils/http");
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
    const options = (0, http_1.buildOptions)(TOKEN_URL, 'POST', {
        'Content-Type': 'application/json'
    }, body);
    const response = await (0, http_1.httpRequest)(options, body);
    const responseBody = response.body;
    if (responseBody.code !== 0) {
        throw new Error(`获取 tenant_access_token 失败: ${responseBody.msg || JSON.stringify(responseBody)}`);
    }
    cachedToken = responseBody.tenant_access_token || null;
    tokenExpireTime = Date.now() + ((responseBody.expire || 7200) - 300) * 1000;
    return cachedToken;
}
function clearCache() {
    cachedToken = null;
    tokenExpireTime = 0;
}
//# sourceMappingURL=token.js.map