const core = require('@actions/core');
const https = require('https');

async function sendFeishuMessage(webhookUrl, message) {
  return new Promise((resolve, reject) => {
    if (!webhookUrl || !message) {
      reject(new Error('webhook-url and message are required'));
      return;
    }

    const url = new URL(webhookUrl);
    
    const postData = JSON.stringify({
      msg_type: 'text',
      content: {
        text: message
      }
    });

    console.log('Request body:', postData);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('Request options:', JSON.stringify(options, null, 2));

    const req = https.request(options, (res) => {
      let data = '';

      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Response body:', data);
        try {
          const response = JSON.parse(data);
          if (response.code === 0 || response.StatusCode === 0 || response.status === 'success') {
            resolve(true);
          } else {
            reject(new Error(`Feishu API error: ${response.msg || response.message || JSON.stringify(response)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  try {
    const webhookUrl = core.getInput('webhook-url', { required: true });
    const message = core.getInput('message', { required: true });

    console.log('Starting Feishu bot notification...');
    console.log('Webhook URL:', webhookUrl ? 'configured' : 'missing');
    console.log('Message:', message);
    
    const ok = await sendFeishuMessage(webhookUrl, message);
    
    core.setOutput('ok', ok);
    console.log('Message sent successfully!');
  } catch (error) {
    console.error('Error details:', error);
    core.setOutput('ok', false);
    core.setFailed(error.message);
  }
}

module.exports = { sendFeishuMessage, run };

if (require.main === module) {
  run();
}