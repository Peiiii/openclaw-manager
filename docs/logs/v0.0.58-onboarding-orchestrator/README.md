# v0.0.58 Onboarding MVP Orchestrator Split

## 设计方案

目标：严格按 MVP 规范拆分 Onboarding，做到视图/逻辑解耦、业务编排层清晰、动作统一走 manager。

- 业务编排层：`OnboardingOrchestrator` 仅负责 effect 与流程推进。
- 业务容器层：每个 step 一个 container，负责状态订阅与动作绑定。
- 视图层：`components/wizard-steps.tsx` 继续作为纯 UI 组件，仅接收 props。
- 动作入口：全部通过 `presenter.onboarding.*`，组件不直接操作 store。

## 实现说明

- 新增 `features/onboarding/containers/`：
  - `onboarding-orchestrator.tsx`
  - `onboarding-step-renderer.tsx`
- 新增 `features/onboarding/steps/*-step.container.tsx`：
  - auth/cli/gateway/token/ai/pairing/probe/complete
- `OnboardingPage` 仅保留布局与渲染容器，不再包含业务逻辑。

## 使用方式

- 业务容器使用：
  - `usePresenter()` 获取 actions
  - `useOnboardingStore/useStatusStore/useJobsStore` 订阅状态
  - UI 组件仅接收必要 props

## 验证方式

- `pnpm build`
- `pnpm lint`
- `pnpm -r --if-present tsc`
- 冒烟：`pnpm dev:web` 启动后访问 `http://127.0.0.1:5179` 确认页面可加载

## 发布/部署方式

- `pnpm deploy:pages`
- 线上冒烟：访问 `https://openclaw-manager.com`
