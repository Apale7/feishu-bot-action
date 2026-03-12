# AGENTS.md

## 交互要求
- Thinking 思考过程可以隐藏或用中文表述
- Reply 回答也要用中文回复

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
## 飞书消息结构
# 发送消息内容结构

本文介绍[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)、[回复消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/reply)、[编辑消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/update)接口中各消息类型（`msg_type`）对应的消息内容（`content`）应如何构造。

## 注意事项

- 本文提供的示例代码中所有的 `receive_id`（消息接收者 ID）、`user_id`（用户的 user_id）、`image_key`（上传图片后获取到的图片标识 key）、`file_key`（上传文件后获取到的文件标识 Key） 等参数值均为示例数据。你在实际开发过程中，需要替换为真实可用的数据。
- 本文提供的内容构造示例，仅适用于[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)、[回复消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/reply)、[编辑消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/update)接口，不适用于[批量发送消息](https://open.feishu.cn/document/ukTMukTMukTM/ucDO1EjL3gTNx4yN4UTM)接口和消息的各历史版本接口。
- 本文不适用于自定义机器人，自定义机器人使用方式需参考[自定义机器人使用指南](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN)。

## 消息内容介绍

在 **发送消息**、**回复消息**、**编辑消息** 接口中，均需要传入消息内容（`content`），不同的消息类型对应的 `content` 也不相同。以文本类型的消息为例，请求体示例如下：

```json
{
    "receive_id": "ou_7d8a6e6df7621556ce0d21922b676706ccs",
    "content": "{\"text\":\" test content\"}",
    "msg_type": "text"
}
```
**注意**：`content` 字段为 string 类型，JSON 结构需要先进行转义再传值。在调用接口时，你可以先构造一个结构体，然后使用 JSON 序列化转换为 string 类型，或者通过第三方的 JSON 转换工具进行转义。

## 各类型的消息内容 JSON 结构

消息类型包括文本、富文本、卡片、名片、音频、视频以及文件等多种类型，本章节将介绍各类型消息对应的内容如何构造。

### 文本 text

**内容示例**

```json 
{
    "text": "test content"
}
``` 

**参数说明**

名称 | 类型 | 是否必填 | 描述
---|---|---|---
text | string | 是 | 文本内容。<br>**示例值**：test content

**[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)请求体示例**

```json 
{
    "receive_id": "ou_7d8a6e6df7621556ce0d21922b67670xxxx",
    "content": "{\"text\":\"test content\"}",
    "msg_type": "text"
}
``` 

#### 支持换行符

如果需要在文本中换行，可使用 `\n` 换行符。请求体示例如下（注意内容需要转义）：

```json 
{
    "receive_id": "oc_xxx",
    "content": "{\"text\":\"firstline \\n secondline \"}",
    "msg_type": "text"
}
``` 

#### 支持 @ 用户、@ 所有人

```json 
// @ 单个用户
<at user_id="ou_xxxxxxx">用户名（可不填）</at>
// @ 所有人
<at user_id="all"></at>
``` 

- @ 单个用户时，`user_id` 字段必须填入用户的 open_id，union_id 或 user_id 来 @ 指定人。请确保 ID 为有效值，ID 获取方式参考[如何获取 User ID、Open ID 和 Union ID？](https://open.feishu.cn/document/home/user-identity-introduction/open-id)。
- @ 所有人时，`user_id` 取值为 `all`，并且需要注意所在群必须开启了 @ 所有人功能。
- 此处的语法与卡片消息（[消息卡片 Markdown](https://open.feishu.cn/document/ukTMukTMukTM/uADOwUjLwgDM14CM4ATN#abc9b025)、[飞书卡片 Markdown](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/rich-text)） @ 指定人的语法不同，请注意区分。

文本消息 @ 用法示例：

```json 
{
    "receive_id": "oc_xxx",
    "content": "{\"text\":\"<at user_id=\\\"ou_xxxxxxx\\\">Tom</at> text content\"}",
    "msg_type": "text"
} 
```

消息发送后的效果如下图：

![未标题-1.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/d0067a61fadc30a09d987e43af20b930_zFF2OgzaOZ.png?height=448&lazyload=true&maxWidth=400&width=652)

#### 支持部分样式标签

支持加粗、斜体、下划线、删除线四种样式（可嵌套使用）：
- **加粗**：`**文本示例**`       
- *斜体*：`<i>文本示例</i>`
- _下划线_：`<u>文本示例</u>`
- ~~删除线~~：`<s>文本示例</s>`warning
**注意**：
- 请保证首尾标签对应、嵌套正确，如有首尾标签缺失、嵌套层级错误等情况，会以原始内容发送消息。
- 标签信息会大幅增加消息体的大小，请酌情使用。
- 该能力暂不支持[自定义机器人](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN)和[批量发送消息](https://open.feishu.cn/document/ukTMukTMukTM/ucDO1EjL3gTNx4yN4UTM)接口。

样式标签使用示例：
```json 
{
    "receive_id": "oc_xxx",
    "content": "{\"text\":\"**bold content<i>, bold and italic content</i>**\"}",
    "msg_type": "text"
}
``` 

消息发送后效果如下图：

![image.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/11f5004aaaaf02ee90b625311df6d824_JV9jdvPcsy.png?height=126&lazyload=true&maxWidth=400&width=896)

#### 支持超链接

超链接的使用格式为 `[文本](链接)`， 如 `[Feishu Open Platform](https://open.feishu.cn)` 。warning
**注意**：
- `[文本]` 中不支持 `[]` 多层嵌套使用，此外，若文本中含有其他 `[` 或 `]` 字符，请确保前后符号匹配，否则可能导致超链接识别异常。
- 请确保链接是合法的，否则会以原始内容发送消息。
- 该能力暂不支持[自定义机器人](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN)和[批量发送消息](https://open.feishu.cn/document/ukTMukTMukTM/ucDO1EjL3gTNx4yN4UTM)接口。

超链接使用示例：
```json 
{
    "receive_id": "oc_xxx",
    "content": "{\"text\":\"[Feishu Open Platform](https://open.feishu.cn)\"}",
    "msg_type": "text"
}
``` 

消息发送后效果如下图：

![image.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/b2e2f8e6a7f2169ca88ec2434e2c255f_TNCcXir3DK.png?height=218&lazyload=true&maxWidth=400&width=936)

### 富文本 post

在一条富文本消息中，支持添加文字、图片、视频、@、超链接等元素。如下 JSON 格式的内容是一个富文本示例，其中：

- 一个富文本可分多个段落（由多个 `[]` 组成），每个段落可由多个元素组成，每个元素由 tag 和相应的描述组成。
- 图片、视频元素必须是独立的一个段落。
- `style` 字段暂不支持[自定义机器人](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN)和[批量发送消息](https://open.feishu.cn/document/ukTMukTMukTM/ucDO1EjL3gTNx4yN4UTM)接口。
- 实际发送消息时，需要将 JSON 格式的内容压缩为一行、并进行转义。
- 如需参考该 JSON 示例构建富文本消息内容，则需要把其中的 user_id、image_key、file_key 等示例值替换为真实值。

```json 
{
	"zh_cn": {
		"title": "我是一个标题",
		"content": [
			[
				{
					"tag": "text",
					"text": "第一行:",
					"style": ["bold", "underline"]

},
				{
					"tag": "a",
					"href": "http://www.feishu.cn",
					"text": "超链接",
					"style": ["bold", "italic"]
				},
				{
					"tag": "at",
					"user_id": "ou_1avnmsbv3k45jnk34j5",
					"style": ["lineThrough"]
				}
			],
          	[{
				"tag": "img",
				"image_key": "img_7ea74629-9191-4176-998c-2e603c9c5e8g"
			}],
			[	
				{
					"tag": "text",
					"text": "第二行:",
					"style": ["bold", "underline"]
				},
				{
					"tag": "text",
					"text": "文本测试"
				}
			],
          	[{
				"tag": "img",
				"image_key": "img_7ea74629-9191-4176-998c-2e603c9c5e8g"
			}],
          	[{
				"tag": "media",
				"file_key": "file_v2_0dcdd7d9-fib0-4432-a519-41d25aca542j",
				"image_key": "img_7ea74629-9191-4176-998c-2e603c9c5e8g"
			}],
          	[{
				"tag": "emotion",
				"emoji_type": "SMILE"
			}],
			[{
				"tag": "hr"
			}],
			[{
				"tag": "code_block",
				"language": "GO",
				"text": "func main() int64 {\n    return 0\n}"
			}],
			[{
				"tag": "md",
				"text": "**mention user:**<at user_id=\"ou_xxxxxx\">Tom</at>\n**href:**[Open Platform](https://open.feishu.cn)\n**code block:**\n```GO\nfunc main() int64 {\n    return 0\n}\n```\n**text styles:** **bold**, *italic*, ***bold and italic***, ~underline~,~~lineThrough~~\n> quote content\n\n1. item1\n    1. item1.1\n    2. item2.2\n2. item2\n --- \n- item1\n    - item1.1\n    - item2.2\n- item2"
			}]
		]
	},
	"en_us": {
		...
	}
}
``` 

**参数说明**

名称 | 类型 | 是否必填 | 描述
---|---|---|---
zh_cn, en_us | object | 是 | 多语言配置字段。如果不需要配置多语言，则仅配置一种语言即可。<br>- `zh_cn` 为富文本的中文内容<br>- `en_us` 为富文本的英文内容<br>**注意**：该字段无默认值，至少要设置一种语言。<br>**示例值**：zh_cn
∟ title | string | 否 | 富文本消息的标题。<br>**默认值**：空<br>**示例值**：title
∟ content | string | 是 | 富文本消息内容。由多个段落组成（段落由`[]`分隔），每个段落为一个 node 列表，所支持的 node 标签类型以及对应的参数说明，参见下文的 **富文本支持的标签和参数说明** 章节。<br>**注意**：如 **示例值** 所示，各类型通过 tag 参数设置。例如文本（text）设置为 `"tag": "text"`。<br>**示例值**：[[{"tag": "text","text": "text content"}]]

#### **富文本支持的标签和参数说明**

- **text：文本标签**

名称 | 类型 | 是否必填 | 描述
---|---|---|---
text | string | 是 | 文本内容。<br>**示例值**：test content
un_escape | boolean | 否 | 是否 unescape 解码。默认为 false，无需使用可不传值。<br>**示例值**：false
style | []string | 否 | 文本内容样式，支持的样式有：<br>- bold：加粗<br>- underline：下划线<br>- lineThrough：删除线<br>- italic：斜体<br>**注意**：<br>- 默认值为空，表示无样式。<br>- 传入的值如果不是以上可选值，则被忽略。<br>**示例值**：["bold", "underline"]

-  **a：超链接标签**

名称 | 类型 | 是否必填 | 描述
---|---|---|---
text | string | 是 | 超链接的文本内容。<br>**示例值**：超链接
href | string | 是 | 超链接地址。<br>**注意**：请确保链接地址的合法性，否则消息会发送失败。<br>**示例值**：https://open.feishu.cn
style | []string | 否 | 超链接文本内容样式，支持的样式有：<br>- bold：加粗<br>- underline：下划线<br>- lineThrough：删除线<br>- italic：斜体<br>**注意**：<br>- 默认值为空，表示无样式。<br>- 传入的值如果不是以上可选值，则被忽略。<br>**示例值**：["bold", "italic"]

- **at：@标签**

名称 | 类型 | 是否必填 | 描述
---|---|---|---
user_id | string | 是 | 用户 ID，用来指定被 @ 的用户。传入的值可以是用户的 user_id、open_id、union_id。各类 ID 获取方式参见[如何获取 User ID、Open ID 和 Union ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id)。<br>**注意**：<br>- @ 单个用户时，该字段必须传入实际用户的真实 ID。<br>- 如需 @ 所有人，则该参数需要传入 `all`。
style | []string | 否 | at 文本内容样式，支持的样式有：<br>- bold：加粗<br>- underline：下划线<br>- lineThrough：删除线<br>- italic：斜体<br>**注意**：<br>- 默认值为空，表示无样式。<br>- 传入的值如果不是以上可选值，则被忽略。<br>**示例值**：["lineThrough"]

- **img：图片标签**

名称 | 类型 | 是否必填 | 描述
---|---|---|---
image_key | string | 是 | 图片 Key。通过[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口可以获取到图片 Key（image_key）。<br>**示例值**：d640eeea-4d2f-4cb3-88d8-c964fab53987

- **media：视频标签**

名称 | 类型 | 是否必填 | 描述
---|---|---|---
file_key | string | 是 | 视频文件的 Key。通过[上传文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/file/create)接口上传视频（mp4 格式）后，可以获取到视频文件 Key（file_key）。<br>**示例值**：file_v2_0dcdd7d9-fib0-4432-a519-41d25aca542j
image_key | string | 否 | 视频封面图片的 Key。通过[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口可以获取到图片 Key（image_key）。<br>**默认值**：空，表示无视频封面。<br>**示例值**：img_7ea74629-9191-4176-998c-2e603c9c5e8g

- **emotion：表情标签**

名称 | 类型 | 是否必填 | 描述
---|---|---|---
emoji_type | string | 是 | 表情文案类型。可选值参见[表情文案说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)。<br>**示例值**：SMILE

- **code_block：代码块标签**

名称 | 类型 | 是否必填 | 描述
---|---|---|---
language | string | 否 | 代码块的语言类型。可选值有 PYTHON、C、CPP、GO、JAVA、KOTLIN、SWIFT、PHP、RUBY、RUST、JAVASCRIPT、TYPESCRIPT、BASH、SHELL、SQL、JSON、XML、YAML、HTML、THRIFT 等。<br>**注意**：<br>- 取值不区分大小写。<br>- 不传值则默认为文本类型。<br>**示例值**：GO
text | string | 是 | 代码块内容。<br>**示例值**：func main() int64 {\n return 0\n}

- **hr：分割线标签**

富文本支持 `tag` 取值为 `hr`，表示一条分割线，该标签内无其他参数。

- **md：Markdown 标签**warning
**注意**：
- `md` 标签会独占一个或多个段落，不能与其他标签在同一行。
- `md` 标签仅支持发送，[获取消息内容](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/get)时将不再包含此标签，会根据 `md` 中的内容转换为其他相匹配的标签。
- 引用、有序、无序列表在获取消息内容时，会简化为文本标签（text）进行输出。

`md` 标签内通过 `text` 参数设置 Markdown 内容。

名称 | 类型 | 是否必填 | 描述
---|---|---|---
text | string | 是 | Markdown 内容。支持的内容参见下表。<br>**示例值**：1. item1\n2. item2

在 `text` 参数内支持的语法如下表所示。

语法 | 示例 | 说明
---|---|---
@ 用户 | `<at user_id="ou_xxxxx">User</at>` | 支持 @ 单个用户或所有人。<br>- @ 单个用户时，需要在 user_id 内传入实际用户的真实 ID。传入的值可以是用户的 user_id、open_id、union_id。各类 ID 获取方式参见[如何获取 User ID、Open ID 和 Union ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id)。<br>- 如需 @ 所有人，需要将 user_id 取值为 `all`。
超链接 | `[Feishu Open Platform](https://open.feishu.cn)` | 在 Markdown 语法内，`[]` 用来设置超链接的文本内容、`()` 用来设置超链接的地址。  <br>**注意**：请确保链接地址的合法性，否则只发送文本内容部分。
有序列表 | `1. item1\n2. item2` | Markdown 配置说明：<br>- 每个编号的 `.` 符与后续内容之间要有一个空格。<br>- 每一列独立一行。如示例所示，可使用 `\n` 换行符换行。<br>- 支持嵌套多层级。<br>- 每个层级缩进 4 个空格，且编号均从 `1.` 开始。<br>- 可以与无序列表混合使用。
无序列表 | `- item1\n- item2` | Markdown 配置说明：<br>- 每列的 `-` 符与后续内容之间要有一个空格。<br>- 每一列独立一行。如示例所示，可使用 `\n` 换行符换行。<br>- 支持嵌套多层级。<br>- 每个层级缩进 4 个空格。<br>- 可以与有序列表混合使用，有序列表以 `1.` 开始编号。
代码块 | \`\`\`GO\nfunc main(){\n return\n}\n\`\`\` | 代码块内容首尾需要使用 \`\`\` 符号包裹，首部 \`\`\` 后紧跟代码语言类型。支持的语言类型有 PYTHON、C、CPP、GO、JAVA、KOTLIN、SWIFT、PHP、RUBY、RUST、JAVASCRIPT、TYPESCRIPT、BASH、SHELL、SQL、JSON、XML、YAML、HTML、THRIFT 等（不区分大小写）。
引用 | `> demo` | 引用内容。`>` 符与后续内容之间要有一个空格。
分割线 | `\n --- \n` | 如示例所示，前后需要各有一个 `\n` 换行符。
加粗 | `**加粗文本**` | 配置说明：<br>- `**` 符与加粗文本之间不能有空格。<br>- 加粗可以与斜体合用。例如 `***加粗+斜体***`。<br>- 加粗的文本不支持再解析其他组件。例如文本为超链接则不会被解析。
斜体 | `*斜体文本*` | 配置说明：<br>- `*` 符与加粗文本之间不能有空格。<br>- 斜体可以与加粗合用。例如 `***加粗+斜体***`。<br>- 斜体的文本不支持再解析其他组件。例如文本为超链接则不会被解析。
下划线 | `~下划线文本~` | 配置说明：<br>- `~` 符与下划线文本之间不能有空格。<br>- 下划线的文本不支持再解析其他组件。例如文本为超链接则不会被解析。<br>- 不支持与加粗、斜体、删除线合用。
删除线 | `~~删除线~~` | 配置说明：<br>- `~~` 符与下划线文本之间不能有空格。<br>- 删除线的文本不支持再解析其他组件。例如文本为超链接则不会被解析。<br>- 不支持与加粗、斜体、下划线合用。

[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)时的请求体示例：

```json 
{
	"receive_id": "oc_820faa21d7ed275b53d1727a0feaa917",
	"content": "{\"zh_cn\":{\"title\":\"我是一个标题\",\"content\":[[{\"tag\":\"text\",\"text\":\"第一行 :\"},{\"tag\":\"a\",\"href\":\"http://www.feishu.cn\",\"text\":\"超链接\"},{\"tag\":\"at\",\"user_id\":\"ou_1avnmsbv3k45jnk34j5\",\"user_name\":\"tom\"}],[{\"tag\":\"img\",\"image_key\":\"img_7ea74629-9191-4176-998c-2e603c9c5e8g\"}],[{\"tag\":\"text\",\"text\":\"第二行:\"},{\"tag\":\"text\",\"text\":\"文本测试\"}],[{\"tag\":\"img\",\"image_key\":\"img_7ea74629-9191-4176-998c-2e603c9c5e8g\"}]]}}",
	"msg_type": "post"
}
``` 

发送后的效果图：

![未标题-2.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/e774788f106baf2eb5d3227a545b3246_Lq95B5zSFw.png?height=902&lazyload=true&maxWidth=300&width=672)

### 图片 image

**内容示例**

```json 
{
    "image_key": "img_7ea74629-9191-4176-998c-2e603c9c5e8g"
}
``` 
**参数说明** 

名称 | 类型 | 是否必填 | 描述
---|---|---|---
image_key | string | 是 | 图片 Key，通过[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口可获取到图片 Key（image_key）。<br>**示例值**：img_7ea74629-9191-4176-998c-2e603c9c5e8g

**[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)请求体示例**

```json 
{
	"receive_id": "oc_xxx",
	"content": "{\"image_key\": \"img_v2_xxx\"}",
	"msg_type": "image"
} 
``` 

消息发送后的效果如下图：

![未标题-3.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/a8db03920c6434899e9e8dca6e9ab47d_HazoJPFumr.png?height=250&lazyload=true&maxWidth=300&width=628)

***

### 卡片 interactive

飞书卡片是一种可以灵活构建图文内容的消息类型，你可以通过[可视化搭建工具](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/feishu-cardkit-overview)或者 [卡片 JSON](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure)定义样式精美、可交互的卡片内容。

如果你使用的是历史版本的 ==发送消息卡片==(`/open-apis/message/v4/send/`) 接口，请求体中的 `content` 参数需要换成 `card`。如果使用[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)接口，消息请求体的内容参数已统一为 `content`。

**[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)请求体示例**

以下提供了卡片的多种发送方式，详细说明可参见[发送卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/send-feishu-card)。

- **方式一：使用卡片实体 ID 发送**

通过卡片实体 ID 发送卡片适用于需要局部更新卡片或实现流式更新卡片的场景。详情参考[流式更新 OpenAPI 调用指南](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/streaming-updates-openapi-overview)。
   卡片实体 ID 是卡片实体的唯一标识，需通过调用[创建卡片实体](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/create)接口获取。
   示例请求体如下所示：
  ```json
  {
      "receive_id": "ou_449b53ad6aee526f7ed311b216aabcef",
      "msg_type": "interactive",
      "content": "{\"type\":\"card\",\"data\":{\"card_id\":\"7371713483664506900\"}}"
  }
  ```

- **方式二：使用卡片模板 `template_id` 发送**

通过[卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_tool_overview)搭建好卡片后，通过卡片的 `template_id` 发送卡片。
  使用模板 `template_id` 发送卡片的方式支持使用卡片变量，动态控制卡片内容。
  示例请求体如下所示：
  ```json
  {
    "receive_id": "ou_449b53ad6aee526f7ed311b216aabcef",
    "msg_type": "interactive",
    "content": "{\"type\":\"template\",\"data\":{\"template_id\":\"xxxxxxxxxxxx\",\"template_version_name\":\"1.0.0\",\"template_variable\":{\"key1\":\"value1\",\"key2\":\"value2\"}}}"
  }
  ```

其中，`content` 包含的参数配置说明如下表所示。

参数 | 类型 | 必填 | 说明
---|---|---|---
type | string | 否 | 卡片类型。要发送由搭建工具搭建的卡片（也称卡片模板），固定取值为 `template`。
data | object | 否 | 卡片模板的数据，要发送由搭建工具搭建的卡片，此处需传入卡片模板 ID、卡片版本号等。
└ template_id | string | 是 | 搭建工具中创建的卡片（也称卡片模板）的 ID，如 `AAqigYkzabcef`。可在搭建工具中通过复制卡片模板 ID 获取。 <br>![image.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/8bf97ff2bceed633b28f5ce2d2ec0270_A9kv4I1t3s.png?height=329&lazyload=true&maxWidth=500&width=1574)
└ template_version_name | string | 否 | 搭建平台中创建的卡片的版本号，如 `1.0.0`。卡片发布后，将生成版本号。可在搭建工具 **版本管理** 处获取。<br>![image.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/b3e96c8ca7c5c029bdbce6c0ca1ba413_IR0ZCAj7uz.png?height=384&lazyload=true&maxWidth=500&width=1459)<br>**注意**：<br>若不填此字段，将默认使用该卡片的最新版本。
└ template_variable | object | 否 | 若卡片绑定了变量，你需在该字段中传入实际变量数据的值。<br>**示例**：如果变量名称在搭建工具中被定义为 `open_id`，此处需要对 `open_id` 变量传入值：<br>```json<br>{<br>"open_id": "ou_d506829e8b6a17607e56bcd6b1aabcef"<br>}<br>```

<br>
- **方式三：使用卡片 JSON 发送**

通过[卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_tool_overview)搭建好卡片后，复制卡片源代码获取卡片 JSON，然后将卡片源代码进行压缩并转义，再传入 `content` 参数中发送卡片。
  使用 JSON 发送卡片的方式不支持传入卡片变量。

![b9d86d57c25f51570909a23ebc43026a_h4kayeS9dl.gif](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/b9d86d57c25f51570909a23ebc43026a_QEwsOFPWe5.gif?height=872&lazyload=true&width=1914)

示例请求体如下所示：
    ```json 
    {
      "receive_id": "ou_449b53ad6aee526f7ed311b216aabcef",
      "msg_type": "interactive",
      "content": "{\"schema\":\"2.0\",\"config\":{\"update_multi\":true,\"style\":{\"text_size\":{\"normal_v2\":{\"default\":\"normal\",\"pc\":\"normal\",\"mobile\":\"heading\"}}}},\"body\":{\"direction\":\"vertical\",\"padding\":\"12px 12px 12px 12px\",\"elements\":[{\"tag\":\"markdown\",\"content\":\"西湖，位于中国浙江省杭州市西湖区龙井路1号，杭州市区西部，汇水面积为21.22平方千米，湖面面积为6.38平方千米。\",\"text_align\":\"left\",\"text_size\":\"normal_v2\",\"margin\":\"0px 0px 0px 0px\"},{\"tag\":\"button\",\"text\":{\"tag\":\"plain_text\",\"content\":\"🌞更多景点介绍\"},\"type\":\"default\",\"width\":\"default\",\"size\":\"medium\",\"behaviors\":[{\"type\":\"open_url\",\"default_url\":\"https://baike.baidu.com/item/%E8%A5%BF%E6%B9%96/4668821\",\"pc_url\":\"\",\"ios_url\":\"\",\"android_url\":\"\"}],\"margin\":\"0px 0px 0px 0px\"}]},\"header\":{\"title\":{\"tag\":\"plain_text\",\"content\":\"今日旅游推荐\"},\"subtitle\":{\"tag\":\"plain_text\",\"content\":\"\"},\"template\":\"blue\",\"padding\":\"12px 12px 12px 12px\"}}"
    } 
    ``` 

消息发送后的效果如下图：

![image.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/42498546edb8dd2feb32ac2027a8507a_iNml1LSHNG.png?height=283&lazyload=true&maxWidth=500&width=766)

### 分享群名片 share_chat

**内容示例**

```json 
{
    "chat_id": "oc_0dd200d32fda15216d2c2ef1ddb32f76"
}
``` 

**参数说明** 

名称 | 类型 | 是否必填 | 描述
---|---|---|---
chat_id | string | 是 | 群 ID。获取方式参见[群ID 说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-id-description)。<br>**示例值**：oc_0dd200d32fda15216d2c2ef1ddb32f76

**[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)请求体示例**

```json 
 {
	"receive_id": "oc_xxx",
	"content": "{\"chat_id\":\"oc_xxx\"}",
	"msg_type": "share_chat"
}
``` 
机器人必须在群名片所在的群内，才可以成功发送群名片。

消息发送后的效果如下图：

![未标题-5.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/738bf1ab64b76ddf94498d0fddd84c77_pEcY3LGk3g.png?height=306&lazyload=true&maxWidth=300&width=676)

### 分享个人名片 share_user

**内容示例**

```json 
{
    "user_id": "ou_0dd200d32fda15216d2c2ef1ddb32f76"
} 
``` 
- `user_id` 只支持设置用户的 open_id，且该用户需要在机器人的可用范围内，详情参见[配置应用可用范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability)。
- 暂不支持分享机器人的名片。

**参数说明** 

名称 | 类型 | 是否必填 | 描述
---|---|---|---
user_id | string | 是 | 用户的 open_id，获取方式参见[如何获取 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)。<br>**示例值**：ou_0dd200d32fda15216d2c2ef1ddb32f76

**[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)请求体示例**

```json 
{
	"receive_id": "oc_820faa21d7ed275b53d1727a0feaa917",
	"content": "{\"user_id\":\"ou_xxx\"}",
	"msg_type": "share_user"
} 
``` 

消息发送后的效果如下图：

![未标题-6.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/41b0fc85c2725851da3a5e3d17a7b92a_hFxAjwKxCn.png?height=282&lazyload=true&maxWidth=300&width=584)

***

### 语音 audio

**内容示例**

```json 
{
    "file_key": "75235e0c-4f92-430a-a99b-8446610223cg"
}
``` 

**参数说明** 

名称 | 类型 | 是否必填 | 描述
---|---|---|---
file_key | string | 是 | 语音文件的 Key，通过[上传文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/file/create)接口可获取文件的 Key（file_key）。<br>**示例值**：75235e0c-4f92-430a-a99b-8446610223cg

**[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)请求体示例**

```json 
{
	"receive_id": "oc_xxx",
	"content": "{\"file_key\":\"file_v2_xxx\"}",
	"msg_type": "audio"
} 
``` 

消息发送后的效果如下图：

![未标题-7.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/35b8e3ab3c86e4c36756564ecf2d32c4_hcwZsC3Sdo.png?height=228&lazyload=true&maxWidth=300&width=592)

### 视频 media

**内容示例**

```json 
{
    "file_key": "75235e0c-4f92-430a-a99b-8446610223cg",
    "image_key": "img_xxxxxx"
}
``` 
**参数说明** 

名称 | 类型 | 是否必填 | 描述
---|---|---|---
file_key | string | 是 | 视频文件的 Key，通过[上传文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/file/create)接口获取视频文件的 Key（file_key）。<br>**示例值**：75235e0c-4f92-430a-a99b-8446610223cg
image_key | string | 否 | 视频的封面图片，可选择配置，不配置则无封面。取值为图片的 Key，通过[上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)接口获取图片的 Key（image_key）。

**[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)请求体示例**

```json 
{
    "receive_id": "oc_xxx",
    "content": "{\"file_key\":\"file_v2_xxx\",\"image_key\":\"img_v2_xxx\"}",
    "msg_type": "media"
} 
``` 

消息发送后的效果如下图：

![未标题-8.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/2e9199825f13a97cf0746792bebc4c2f_2KysKba7r4.png?height=808&lazyload=true&maxWidth=350&width=672)

### 文件 file

**内容示例**

```json 
{
    "file_key": "75235e0c-4f92-430a-a99b-8446610223cg"
}
``` 
**参数说明** 

名称 | 类型 | 是否必填 | 描述
---|---|---|---
file_key | string | 是 | 文件的 Key，通过[上传文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/file/create)接口获取文件的 Key（file_key）。<br>**示例值**：75235e0c-4f92-430a-a99b-8446610223cg

**[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)请求体示例**
```json 
{
	"receive_id": "oc_820faa21d7ed275b53d1727a0feaa917",
	"content": "{\"file_key\":\"file_v2_xxx\"}",
	"msg_type": "file"
} 
``` 

消息发送后的效果如下图：

![未标题-9.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/7bd82e789e4385de6175928164aaa399_JtSebSp7Ej.png?height=240&lazyload=true&maxWidth=400&width=918)

### 表情包 sticker

**内容示例**

```json 
{
    "file_key": "75235e0c-4f92-430a-a99b-8446610223cg"
}
``` 
**参数说明** 

名称 | 类型 | 是否必填 | 描述
---|---|---|---
file_key | string | 是 | 表情包文件的 Key，目前仅支持发送机器人收到的表情包，可通过[接收消息事件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/receive)的推送获取表情包的 Key（file_key）。<br>**示例值**：75235e0c-4f92-430a-a99b-8446610223cg

**发消息请求体示例**

```json 
{
	"receive_id": "oc_xxx",
	"content": "{\"file_key\":\"file_v2_xxx\"}",
	"msg_type": "sticker"
} 
``` 
消息发送后的效果如下图：

![未标题-10.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/5617a52223f44877799f2de8c4639ed9_BBrI1lCAff.png?height=610&lazyload=true&maxWidth=300&width=632)

### 系统消息 systemwarning
**注意：**
- 仅支持使用 `tenant_access_token` 调用[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)接口，发送特定模板的系统消息，除接口必须权限外，还需要拥有 ==发送特定模板系统消息 (im:message:send_sys_msg)== 权限。
- 飞书客户端版本需要在 V7.20 及以上，才能正常显示分割线系统消息，低于此版本将仅展示文本内容。

**内容示例**

```json 
{
    "type": "divider", 
    "params": {
        "divider_text": {
            "text": "新会话",
            "i18n_text": {
                "zh_CN": "新会话",
                "en_US": "New Session"
            }
        }

},
    "options": {
        "need_rollup": true
    }
}
``` 

**参数说明**

名称 | 类型 | 是否必填 | 描述
---|---|---|---
type | string | 是 | 系统消息类型。仅支持取值 `divider`，表示分割线。**目前该类型仅支持在机器人与用户的单聊（p2p）中生效。**<br>**示例值**：divider
params | object | 是 | 系统消息参数。
∟ divider_text | object | 否 | 分割线系统消息的内容。当 `type` 为 `divider` 时该参数必填。<br>**示例值**："divider_text": { "text": "新话题", "i18n_text": { "zh_CN": "新会话", "en_US": "New Session" } }
∟∟ text | string | 是 | 默认文本。<br>**注意**：<br>- 该参数为必填参数，不能传空值。<br>- 文本长度不能超过 20 个字符或 10 个汉字。<br>**示例值**：新会话
∟∟ i18n_text | map | 否 | 国际化文本，多语言环境下，优先使用该值。格式为 `{key:value}` 形式。支持的语种字段有：<br>- en_US（英文）<br>- zh_CN（简体中文）<br>- zh_HK（繁体中文-香港）<br>- zh_TW（繁体中文-台湾）<br>- ja_JP（日语）<br>- id_ID（印尼语）<br>- vi_VN（越南语）<br>- th_TH（泰语）<br>- pt_BR（葡萄牙语）<br>- es_ES（西班牙语）<br>- ko_KR（韩语）<br>- de_DE（德语）<br>- fr_FR（法语）<br>- it_IT（意大利语）<br>- ru_RU（俄语）<br>- ms_MY（马来语）<br>**注意**：<br>- 语言类型大小写敏感，传值时请保持与上述枚举值完全一致。<br>- 每种语言下（若有）文本则不能为空。<br>- 文本长度不能超过 20 个字符或 10 个汉字。<br>**示例值**：{ "zh_CN": "新会话", "en_US": "New Session" }
options | map | 否 | 可选配置项，格式为 `{key:value}` 形式，`key` 为枚举值，`value` 为枚举值的取值。支持的枚举值有：<br>- need_rollup：是否需要滚动清屏，boolean 类型参数，默认取值 false，表示不需要。<br>**示例值**：{ "need_rollup": true }

**[发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)请求体示例**

```json 
{
        "receive_id": "oc_xxx",
        "content": "{\"type\":\"divider\",\"params\":{\"divider_text\":{\"text\":\"新会话\",\"i18n_text\":{\"zh_CN\":\"新会话\",\"en_US\":\"New Session\"}}},\"options\":{\"need_rollup\":true}}",
        "msg_type": "system"
} 
``` 

效果示例如下图：

![image.png](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/792f2064dabe161aa6e858514edf82b8_7008qWcmA1.png?height=248&lazyload=true&maxWidth=600&width=1824)