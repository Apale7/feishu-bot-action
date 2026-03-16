import * as core from '@actions/core';

export async function run(): Promise<void> {
  const now = new Date();
  const timeStr = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  core.info(`插件执行完成，当前时间: ${timeStr}`);
}

if (require.main === module) {
  run();
}