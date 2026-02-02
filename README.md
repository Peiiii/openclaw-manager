# OpenClaw Manager

[![npm version](https://img.shields.io/npm/v/openclaw-manager.svg)](https://www.npmjs.com/package/openclaw-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> OpenClaw (formerly Clawdbot) installation and configuration tool. Complete installation, configuration, and pairing locally in one place.

> OpenClaw（原 Clawdbot）安装与配置工具，本地一站式完成安装、配置与配对。

![OpenClaw Manager Screenshot](images/screenshots/openclaw-manager.png)

---

## Quick Start / 快速开始

### NPM (Recommended / 推荐)

```bash
npm i -g openclaw-manager
openclaw-manager start
```

Common commands / 常用命令：

- `openclaw-manager stop` - Stop the service / 停止服务
- `openclaw-manager stop-all` - Stop all instances / 停止所有实例
- `openclaw-manager reset` - Reset configuration / 重置配置

Specify admin credentials on first start / 首次启动可显式指定账号密码：

```bash
openclaw-manager start --user admin --pass pass
```

### Script Installation / 脚本安装

**Mac / Linux**

```bash
curl -fsSL https://openclaw-manager.com/install.sh | bash
```

The installation process will prompt you to set an admin username and password / 安装过程中会提示设置管理员用户名和密码。

**Windows** (Not yet verified, use with caution / 暂未验证，请谨慎使用)

```powershell
irm https://openclaw-manager.com/install.ps1 | iex
```

**Docker**

```bash
curl -fsSL https://openclaw-manager.com/docker.sh | bash
```

For more Docker parameters and instructions / 更多 Docker 参数与说明见：
- [docs/get-started-docker.md](docs/get-started-docker.md)
- [docs/docker.md](docs/docker.md)

---

## Usage / 使用方法

1. Run the installation command → Manager service starts automatically / 运行安装命令 → Manager 服务自动启动
2. Open browser and visit `http://localhost:17321` / 浏览器访问 `http://localhost:17321`
3. Log in with the username and password set during installation / 使用安装时设置的用户名和密码登录管理面板
4. Follow the guide to install OpenClaw CLI (npm package `clawdbot`) / 按引导安装 OpenClaw CLI（npm 包名 `clawdbot`）
5. Configure Discord Bot Token / 配置 Discord Bot Token
6. Configure AI model (API Key) / 配置 AI 模型（API Key）
7. Pair with your Bot / 与 Bot 配对
8. Done! Start using / 完成，即可开始使用

---

## Features / 特性

- 🚀 **One-click deployment / 一键部署** - Get your AI assistant running in minutes / 几分钟内让 AI 助手运行起来
- 🖥️ **Web UI / 图形化界面** - Intuitive configuration interface / 直观的配置界面
- 🔒 **Local-first / 本地优先** - Your data stays on your device / 数据保留在你的设备上
- 🤖 **Multi-platform / 多平台** - Discord, WhatsApp, Telegram support / 支持 Discord、WhatsApp、Telegram
- 🧠 **AI models / AI 模型** - OpenAI, Claude, and more / 支持 OpenAI、Claude 等多种模型

---

## Documentation / 文档

- [Getting Started Guide / 入门指南](docs/getting-started.md)
- [Docker Deployment / Docker 部署](docs/docker.md)
- [Configuration Reference / 配置参考](docs/configuration.md)

---

## Community / 社区

- GitHub: [https://github.com/Peiiii/openclaw-manager](https://github.com/Peiiii/openclaw-manager)
- Issues: [Report bugs or request features / 报告问题或请求功能](https://github.com/Peiiii/openclaw-manager/issues)

---

## License / 许可证

MIT License - see [LICENSE](LICENSE) file for details / 详见 [LICENSE](LICENSE) 文件。

---

## Related Projects / 相关项目

- [OpenClaw](https://github.com/Peiiii/openclaw) - The AI assistant framework / AI 助手框架
