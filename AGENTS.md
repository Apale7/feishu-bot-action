# AGENTS.md

这个项目的目的是开发一个华为云codearts pipeline上的自定义插件，支持在pipeline中调用飞书群自定义机器人发送文本通知

# CodeArts Actions类型插件开发文档
流水线插件语法规范
简介
开发一个 CodeArts Actions 插件需要遵循一系列的规范和最佳实践，并兼容github action类型插件的语法与规范，并且能够在不同的环境中稳定运行。以下是一个详细的指南，涵盖了插件开发的规范、步骤和注意事项。
使用对象
本指南的读者为CodeArts Actions类型插件的开发人员。
插件代码开发标准
1.语言
插件代码语言推荐为ts（typescript）
2.CodeArts Actions 插件结构
基础文件目录说明
action-repo/
├── src/
│   └── main.js              # 插件的核心代码
│   └── stop.js              # 可选 插件停止后处理代码
├── action.yml               # 插件的元数据文件
├── package.json             # 插件的构建配置文件（js）
└── README.md                # 插件的说明文档

action.yml : 元数据文件，定义插件输入参数、输出结果、执行文件的重要文件。
package.json：插件的构建配置文件（js）
src：程序核心代码所在目录。
README.md ：插件的详细介绍
其他：js项目的开发代码，目录结构无强制规定。
 
脚手架工程demo：
https://github.com/WooSharing/action-demo.git
3.action.yml配置文件
action.yml 是插件的核心文件，包含插件的元数据、输入输出、运行环境等配置信息。CodeArtsPipeline 使用 action.yml 来识别插件，确保插件能够正确运行。
action.yml样例
# action.yml
name: 'cloudbuild'
version: 1.0.1
author: 'XXXX'
description: 'Trigger CloudBuild task and wait for the results.'

# 插件的输入参数定义
inputs:
  mode:
    description: "Use 'run' to execute an existing project, 'create/update+run' to create or update a project and then execute it, and 'delete' to remove an existing project" 
    required: true
    default: 'run'
  token:
    description: "Token to access CloudBuild and Pipeline"
    required: true
    default: ${{ cloud_dragon_token }}
  project:
    description: "project name for build, delete or create operations"
    required: true
  build-type:
    description: "Use 'build' to build project,'rebuild' to rebuild project"
    required: true
    default: 'build'
  deltaId:
    description: "deltaId for rebuild"
    required: true
    default: 'undefiend'
  tag:
    description: "tag for build"
    required: false
    default: 'undefiend'
  revision:
    description: "revision for build"
    required: false
    default: 'undefiend' 

# 插件的输出参数定义
outputs:
  record-id:
    description: "recordId"
  compile-error:
    description: "编译错误数"
    type: metrics
    properties:
      catalog_cn: "编译报告"
      catalog_en: "Compile Report"
      name_cn: "编译错误数"
      name_en: "Number of Compilation Errors"
  compile-warning:
    description: "编译告警数"
    type: metrics
    properties:
      catalog_cn: "编译报告"
      catalog_en: "Compile Report"
      name_cn: "编译告警数"
      name_en: "Number of Compilation Warnings"

# 插件的运行方式（Node.js 运行环境）
runs:
  using: 'node16'
  main: 'src/main.js'
  post: 'src/stop.js'

1>格式
【强制】yml格式
【强制】标准命名为action.yml，大小写敏感，目前命名仅限为action.yml，暂不支持action.yaml等。
2>命名规范
【强制】属性key命名全部用小写，且不能以数字开头，名称由字母、数字、-组成，总字符不超过16个。例如：branch-name，禁止：Branch_name、BranchName等
【强制】插件名（name的值）、代码仓命名全部使用小写英文，中间用'-'隔开，例如:git-mm。不允许使用驼峰型或者下划线：如GitMm、git_mm等；
【推荐】单个单词：name、on、job、step等
【强制】命名格式：前缀+领域+类型+子领域\功能描述（可选），属性命名应体现具体业务含义，减少无意义的拼音、魔法值等应用，正向应用：ssh-token；反向应用：ssh-pingzheng、ut-ceshi-02;\
3>版本号规范：
a. 版本号以X.Y.Z的贵方形式存在，例如：1.0.0
b. 版本号只能新增，不能回退；
c. 出现重大变更之后应在增加X，比如说1.0.0 -> 2.0.0
4>元数据关键字以及定义
关 键 字 名 称	是否必填	说明
name	是	插件名称，例：codecheck
version	是	插件版本号。（1.0.1）
author	是	员工工号，比如XXX
description	是	描述操作action的功能用途。
inputs	是	输入参数。
inputs.<input_id>	是	参数的标识符。必须以字母或_开头，并且只能包含字母、数字字符、-或_。
inputs.<input_id>.description	是	输入参数的说明。
inputs.<input_id>.required	否	是否作为必填参数。
inputs.<input_id>.default	否	输入参数的默认值。
outputs	是	输出参数
outputs.<output_id>	是	输出参数的标识符。必须以字母或_开头，并且只能包含字母、数字字符、-或下划线。
outputs.<output_id>.type	是	输出参数的类型，一般为metrics
outputs.<output_id>.properties	否	key\val形式，由用户自己定义，方便拓展
outputs.<output_id>.description	是	输出参数的说明。
outputs.<output_id>.value	是	输出参数的值。可以引用steps上下文里的变量值。
runs	是	指定当前action使用javacript代码/组合方式/容器服务等。
runs.using	是	action执行方式，有3种：1.Nodejs对应版本2.组合模式，可以复用其他steps、脚本或者action。3.容器服务。
runs.main	是	action执行时对应的javascript代码的入口文件。
runs.post	是	action终止时对应的javascript代码的入口文件。
 
readme
1.readme应当遵守markdown格式规范；
2.readme内容应当介绍插件的名称、版本、作用，以及相关的使用方法和注意事项
 

4.插件的开发步骤
4.1 编写插件的核心代码
插件的核心逻辑可以使用 JavaScript、TypeScript、Python 编写。最常见的做法是使用 Node.js 和 JavaScript/TypeScript 开发插件。
开发建议：
快速迭代: 先实现最核心的功能，确保插件能够基本运行。然后逐步迭代，增加更多功能和完善细节。
 
示例：使用 Node.js 开发插件
在 src/main.js 文件中编写插件的核心代码。
const core = require('@actions/core');

try {
  const myInput = core.getInput('myInput');  // 获取输入
  const result = `Hello, ${myInput}!`;      // 插件的核心逻辑

  core.setOutput('result', result);  // 设置输出
} catch (error) {
  core.setFailed(`Action failed with error: ${error.message}`);
}

在上面的代码中：
core.getInput() 用于获取输入参数。
core.setOutput() 用于设置输出参数。
core.setFailed() 用于在发生错误时标记插件失败，并显示错误消息。
 
利用现有库和模块: 
充分利用你选择的语言的生态系统，使用现有的库和模块来简化开发。例如，Node.js 的 axios 用于 HTTP 请求。
三方工具包
以下是开发过程中推荐使用的三方工具包，为github-action开源工具包，具体功能如下图所示，可以对插件的代码开发起到辅助的作用。
https://github.com/actions/toolkit


 
4.2 插件日志输出
在代码中添加适当的日志输出，方便调试和监控 Action 的运行情况。可以使用 GitHub Actions 提供的 core 库 (Node.js)来输出日志。
示例：日志记录
const core = require('@actions/core'); 

core.info('Starting action...'); 
core.warning('This is a warning message'); 
core.error('This is an error message');

core.info()：普通的日志信息。
core.warning()：警告信息。
core.error()：错误信息。
 
4.3 插件执行状态反馈
考虑各种错误情况，并进行适当的错误处理，例如输入参数校验、异常捕获等。
正常执行完成，任务process返回0
出现异常或错误情况，可以通过core.setFailed() 修改进程返回，调度框架捕获到非0返回则判定任务失败
 
4.4 插件的结果输出和收集
插件任务可以通过多种方式进行结果输出，当前调度框架定义了系统变量 $GITHUB_OUTPUT 来定义插件运行时output收集文件路径，凡是在任务执行时输出至该文件的内容都会被系统回收，回报至流水线step、job、pipeline级output结果归档
方式一：执行echo直接输出至文件
echo "test-world" >> "$GITHUB_OUTPUT"

方式二：封装output写入方法
export async function writeOutputContext(data: string) {
  // 获取output路径
  const filePath = core.getInputForEnv("GITHUB_OUTPUT");
  log.info("outputFilePath  is " + filePath);
  if (!filePath) {
    log.error(ErrorCode.INVALID_PARAM, {
      cause: `Failed to get the upload report path: GITHUB_OUTPUT`,
      causeZh: `获取输出路径失败: GITHUB_OUTPUT`,
    });
    return;
  }
  fs.appendFile(filePath, data, async (err) => {
    if (err) {
      log.error(ErrorCode.LOCAL_ERROR, {
        cause: `Failed to write the report file.`,
        causeZh: `写入output上报文件失败`,
      });
      return;
    } else {
      log.info("File written successfully!");
    }
  });
}

 
4.5 插件执行后处理
如果需要在插件停止/异常时进行后处理操作，需要额外定义stop.js文件
stop.js使用常见场景：
1.根据插件自身业务逻辑，清理代码运行后现场（自定义执行环境）。
2.程序出现异常退出时，做好善后处理，通知上下游依赖服务进行相关状态/结果处理。
插件停止/异常时无需显式调用stop.js，由流水线框架统一实现。
 
5.插件测试方式
确保插件的稳定性和功能非常重要。CodeArts Actions 插件的测试包括两部分：本地单元测试和在 CodeArtsPipeline上自动化测试。
5.1 本地测试插件
本地测试 :  
可以使用act工具在本地模拟Actions 的运行环境进行测试；act可以快速验证Action的基本功能，但不支持完全模拟所有Actions的环境。
单元测试：
可以使用 Jest 或其他测试框架对插件的核心代码进行单元测试。在 src/ 目录中创建一个 test 文件夹并编写测试。
示例：使用 Jest 编写测试
首先，安装 Jest：
npm install --save-dev jest

创建一个 test/main.test.js 文件，编写测试用例：
const { exec } = require('child_process');
const core = require('@actions/core');

jest.mock('@actions/core');

describe('My Custom Action', () => {
  it('should set output result correctly', async () => {
    core.getInput.mockReturnValue('CodeArts');
    core.setOutput.mockImplementation(() => {});

    // 模拟执行插件逻辑
    require('../src/main');

    // 验证输出是否正确
    expect(core.setOutput).toHaveBeenCalledWith('result', 'Hello, CodeArts!');
  });

  it('should handle errors gracefully', () => {
    core.getInput.mockReturnValue('');
    core.setFailed.mockImplementation(() => {});

    // 模拟插件抛出错误
    require('../src/main');

    expect(core.setFailed).toHaveBeenCalledWith('Action failed with error: Error: Input "myInput" is required');
  });
});

 
5.2 在CodeArtsPipeline上调测插件（待功能完善后补齐）
CodeArtsPipeline上Actions插件编排功能支持中，当前可以通过创建一个简单的 GitHub Actions workflow 来在GitHub 上执行插件并验证其输出。可以在仓库的 .github/workflows/ 目录下创建一个简单的测试文件。
name: Test My Custom Action

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Run my custom action
        uses: ./  # 使用当前仓库中的插件
        with:
          myInput: 'GitHub Actions'

 
6.插件打包
CodeArts Actions插件需要用户执行构建命令打出ZIP包，方便后续版本发布和管理，通过配置package.json进行构建编排
实例：ts工程构建
{
  "name": "codearts-actions-plugin-demo",
  "version": "1.0.11",
  "description": "demo插件",
  "main": "main.js",
  "scripts": {
    "build": "tsc",
    "package-main": "ncc build lib/main.js",
    "package-stop": "ncc build lib/stop.js -o dist/stop && move dist\\stop\\main.js dist\\stop.js && rmdir /S /Q dist\\stop",
    "test": "jest",
    "all": "npm run build && npm run package-main && npm run package-stop",
    "dev": "npm run build && npm run package"
  },
  "repository": {
    "type": "git",
    "url": "XXXXX"
  },
  "author": "XXXX",
  "license": "ISC",
  "devDependencies": {
    "@actions/core": "^1.11.1",
    "@types/node": "^22.7.6"
  },
  "dependencies": {
    "axios": "^1.7.7"
  }
}

在本地使用webstorm等编辑器的情况下，安装命令插件可以直接在文档上点击运行指令进行构建；
也可以在项目根目录下运行“npm build”进行便以构建，然后运行“npm package-main”和“npm package-stop”进行打包；
打包好的文件在根目录下的dist文件夹中，包含index.js和stop.js两个文件。
最后，将代码项目中的dist文件、action.yml、readme文件进行打包，当前指定的打包格式为zip，整体包结构目录如下：
plugin-demo.zip/
├── dist/
│   └── main.js              # 插件的核心代码
│   └── stop.js              # 可选 插件停止后处理代码
├── action.yml               # 插件的元数据文件）
└── README.md                # 插件的说明文档

7. 插件发布和版本管理
1.版本控制：确保插件使用语义化版本控制，例如 v1.0.0、v1.1.0、v2.0.0 等。
2.创建 Git 标签：当插件准备好发布时，创建版本标签并推送到 CodeArts Repo仓库： 
3. 选择CodeArts主页面->服务  标签 上，导航到 扩展插件。


4.选择 + 基础插件，填写插件基础信息。




5. 选择版本列表 上传插件ZIP包。



## 飞书自定义机器人发送消息操作手册
post 自定义机器人的webhookurl即可发送消息, webhookurl应当作为私密参数在平台上注入，通过${webhook_url}引入。
post请求的消息体格式为：
1. 发送文本消息
```json
{
    "msg_type": "text",
    "content": {
        "text": "新更新提醒"
    }
}
```
文本消息的 @ 用法
// @ 单个用户
<at user_id="ou_xxx">名字</at>
// @ 所有人
<at user_id="all">所有人</at>
文本消息 @ 用法示例
```json
{
    "msg_type": "text",
    "content": {
        "text": "<at user_id=\"ou_xxx\">Tom</at> 新更新提醒"
    }
}
```
2. 发送富文本消息
富文本消息是指包含文本、超链接、图标等多种文本样式的复合文本信息。

请求消息体示例
```json
{
    "msg_type": "post",
    "content": {
        "post": {
            "zh_cn": {
                "title": "项目更新通知",
                "content": [
                    [{
                        "tag": "text",
                        "text": "项目有更新: "
                    }, {
                        "tag": "a",
                        "text": "请查看",
                        "href": "http://www.example.com/"
                    }, {
                        "tag": "at",
                        "user_id": "ou_18eac8********17ad4f02e8bbbb"
                    }]
                ]
            }
        }
    }
}
```
参数说明
参数 msg_type 值为对应消息类型的映射关系，富文本消息的 msg_type 对应值为 post。

参数 content 包含消息内容，文本消息的消息内容参数说明如下表所示。

字段	类型	是否必填	示例值	描述
post	object	是	none	富文本消息。
∟ zh_cn	object	是	none	zh_cn、en_us 分别是富文本的中、英文配置，富文本消息中至少需要包含一种语言的配置。包含的参数说明，参见下文的《zh_cn、en_us 字段说明表》。
∟ en_us	object	是	none	zh_cn、en_us 分别是富文本的中、英文配置，富文本消息中至少需要包含一种语言的配置。包含的参数说明，参见下文的《zh_cn、en_us 字段说明表》。
zh_cn、en_us 字段说明表。

字段	类型	是否必填	示例值	描述
title	string	否	Test title	富文本消息的标题。
content	[]paragraph	是	[[{"tag": "text","text": "text content"}]]	富文本消息内容。由多个段落组成，每个段落为一个[]节点，其中包含若干个节点。
富文本支持的标签和参数说明
文本标签：text

字段	类型	是否必填	示例值	描述
text	string	是	Text content	文本内容。
un_escape	boolean	否	false	表示是否 unescape 解码。默认值为 false，未用到 unescape 时可以不填。
超链接标签：a

字段	类型	是否必填	示例值	描述
text	string	是	测试地址	超链接的文本内容。
href	string	是	https://open.feishu.cn	默认的链接地址，你需要确保链接地址的合法性，否则消息会发送失败。
@ 标签：at

字段	类型	是否必填	示例值	描述
user_id	string	是	ou_18eac85d35a26****02e8bbbb	用户的 Open ID 或 User ID。
- @ 单个用户时，user_id字段必须是有效值（仅支持 @ 自定义机器人所在群的群成员）。
- @ 所有人时，填 all。
user_name	string	否	Jian Li	用户名称。
图片标签：img

字段	类型	是否必填	示例值	描述
image_key	string	是	d640eeea-4d2f-4cb3-88d8-c96fa5****	图片的唯一标识。可通过 上传图片 接口获取 image_key。