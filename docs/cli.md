# CLI 快速验证指南

目标：用命令行快速跑通每个步骤，便于迭代与回归验证。

## 基础

默认 API 地址：`http://127.0.0.1:17321`  
如需自定义：
- `MANAGER_API_URL=http://127.0.0.1:17331`
- 或 `--api http://127.0.0.1:17331`

如需鉴权：
- `MANAGER_AUTH_USER=admin`
- `MANAGER_AUTH_PASS=pass`

非交互模式：
- `MANAGER_NON_INTERACTIVE=1`

默认配置文件（所有命令都会读取）：
- `manager.toml`（可用 `--config` 或 `MANAGER_CONFIG` 指定）
- 建议将该文件加入 `.gitignore`
命令在配置缺失时会提示输入（`MANAGER_NON_INTERACTIVE=1` 则直接报错）。

## 步骤命令

查看状态：
```bash
pnpm manager:status
```

一键应用配置（TOML）：
```bash
pnpm manager:apply -- --config ./manager.toml
```

启动网关（快速启动）：
```bash
pnpm manager:quickstart
```

执行通道探测：
```bash
pnpm manager:probe
```

保存 Discord Token：
```bash
pnpm manager:discord-token -- --token "YOUR_DISCORD_BOT_TOKEN"
```

配置 AI Provider：
```bash
pnpm manager:ai-auth -- --provider minimax-cn --key "YOUR_API_KEY"
```

批准配对码：
```bash
pnpm manager:pairing-approve -- --code "ABCDE123"
```

交互式输入配对码：
```bash
pnpm manager:pairing-prompt
```

交互式输入并完成探测：
```bash
pnpm manager:pairing-prompt -- --continue
```

拿到配对码后继续完成探测：
```bash
pnpm manager:pairing-approve -- --code "ABCDE123" --continue
```

非交互模式（不弹出输入）：
```bash
pnpm manager:apply -- --config ./manager.toml --non-interactive
```

等待配对请求并自动批准：
```bash
pnpm manager:pairing-wait -- --timeout 180000 --poll 3000 --notify
```
提示：配对请求需要由用户向机器人发送一条 DM 触发，命令会自动等待并批准。
提示：所有命令都支持 `--config /path/to/manager.toml` 指定配置。

## 常见问题

- `unauthorized`：设置 `MANAGER_AUTH_USER/MANAGER_AUTH_PASS`
- `request failed: 404/500`：确认 API 正在运行，且 `--api` 指向正确端口

## 配置样例（TOML）

`manager.toml`：
```toml
[api]
base = "http://127.0.0.1:17331"

[admin]
user = "admin"
pass = "pass"

[install]
cli = true

[discord]
token = "YOUR_DISCORD_BOT_TOKEN"

[ai]
provider = "minimax-cn"
key = "YOUR_API_KEY"

[gateway]
start = true
probe = true
host = "127.0.0.1"
port = 18789

[pairing]
# 三选一：prompt/wait/codes（优先级：prompt > wait > codes）
prompt = true
# wait = true
# timeoutMs = 180000
# pollMs = 3000
# notify = true
# codes = ["ABCDE123"]
```
