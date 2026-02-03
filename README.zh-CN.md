# OpenClaw Manager

[![npm version](https://img.shields.io/npm/v/openclaw-manager.svg)](https://www.npmjs.com/package/openclaw-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> OpenClaw 安装与配置工具，本地一站式完成安装、配置与配对。

![OpenClaw Manager 截图](images/screenshots/openclaw-manager.png)

[English Documentation](README.md)

---

## 快速开始

### NPM（推荐）

```bash
npm i -g openclaw-manager
openclaw-manager start
```

常用命令：

- `openclaw-manager stop` - 停止服务
- `openclaw-manager stop-all` - 停止所有实例
- `openclaw-manager reset` - 重置配置

首次启动可显式指定账号密码：

```bash
openclaw-manager start --user admin --pass pass
```

### 脚本安装

**Mac / Linux**

```bash
curl -fsSL https://openclaw-manager.com/install.sh | bash
```

安装过程中会提示设置管理员用户名和密码。

**Windows**（暂未验证，请谨慎使用）

```powershell
irm https://openclaw-manager.com/install.ps1 | iex
```

**Docker**

```bash
curl -fsSL https://openclaw-manager.com/docker.sh | bash
```

更多 Docker 参数与说明见：
- [docs/get-started-docker.md](docs/get-started-docker.md)
- [docs/docker.md](docs/docker.md)

---

## 使用方法

1. 运行安装命令 → Manager 服务自动启动
2. 浏览器访问 `http://localhost:17321`
3. 使用安装时设置的用户名和密码登录管理面板
4. 按引导安装 OpenClaw CLI（npm 包名 `openclaw`）
5. 配置 Discord Bot Token
6. 配置 AI 模型（API Key）
7. 与 Bot 配对
8. 完成，即可开始使用

---

## 特性

- 🚀 **一键部署** - 几分钟内让 AI 助手运行起来
- 🖥️ **图形化界面** - 直观的配置界面
- 🔒 **本地优先** - 数据保留在你的设备上
- 🤖 **多平台** - 支持 Discord、WhatsApp、Telegram
- 🧠 **AI 模型** - 支持 OpenAI、Claude 等多种模型

---

## 文档

- [入门指南](docs/getting-started.md)
- [Docker 部署](docs/docker.md)
- [配置参考](docs/configuration.md)

---

## 社区

- GitHub: [https://github.com/Peiiii/openclaw-manager](https://github.com/Peiiii/openclaw-manager)
- Issues: [报告问题或请求功能](https://github.com/Peiiii/openclaw-manager/issues)

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

---

## 相关项目

- [OpenClaw](https://github.com/Peiiii/openclaw) - AI 助手框架
