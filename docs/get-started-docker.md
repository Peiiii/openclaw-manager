# Docker 快速开始

适用场景：希望用 Docker 快速启动并体验 Clawdbot Manager。

## 1) 一键启动

```bash
curl -fsSL https://clawdbot-manager.pages.dev/docker.sh | bash
```

带账号密码：

```bash
MANAGER_ADMIN_USER=admin MANAGER_ADMIN_PASS=pass curl -fsSL https://clawdbot-manager.pages.dev/docker.sh | bash
```

手动指定公网地址（用于打印可访问链接）：

```bash
MANAGER_PUBLIC_HOST=<your-public-ip-or-domain> curl -fsSL https://clawdbot-manager.pages.dev/docker.sh | bash
```

脚本会自动拉起容器并输出访问地址与登录信息。

## 2) 打开控制台

- 本机访问：`http://127.0.0.1:17321/`
- 远程访问：`http://<your-host>:17321/`

如果是 VPS，请确保防火墙与安全组放行 `17321` 端口。  
如需仅本机访问，可设置 `MANAGER_API_HOST=127.0.0.1`。  
脚本会尝试探测公网 IP 并打印可访问链接，无法探测时可用 `MANAGER_PUBLIC_HOST` 指定。

## 3) 登录并完成向导

使用脚本输出的管理员账号登录，然后按向导完成：

1) CLI 安装  
2) 启动网关  
3) Discord Token  
4) AI Provider  
5) 配对  
6) 探测

## 4) 快速验证（可选）

```bash
curl -fsS http://<your-host>:17321/health
curl -fsS -u admin:pass http://<your-host>:17321/api/status
```

## 常用环境变量

- `MANAGER_DOCKER_NAME`：容器名称
- `MANAGER_CONFIG_VOLUME`：配置卷名称
- `MANAGER_API_PORT`：对外端口（默认 `17321`）
- `MANAGER_ADMIN_USER` / `MANAGER_ADMIN_PASS`：管理员账号
- `MANAGER_PUBLIC_HOST`：公网地址（用于打印可访问链接）
