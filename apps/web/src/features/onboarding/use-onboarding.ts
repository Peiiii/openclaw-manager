import { useCallback, useEffect, useState } from "react";

import type { WizardStep } from "@/components/wizard-sidebar";
import type { JobState, QuickstartResult } from "@/store/jobs-store";
import { useConfigStore } from "@/store/config-store";
import { useJobsStore } from "@/store/jobs-store";
import { useStatusStore } from "@/store/status-store";

type OnboardingInputs = {
  tokenInput: string;
  aiProvider: string;
  aiKeyInput: string;
  pairingInput: string;
  authUser: string;
  authPass: string;
};

type OnboardingMessages = {
  authMessage: string | null;
  message: string | null;
  aiMessage: string | null;
  cliMessage: string | null;
  probeMessage: string | null;
  resourceMessage: string | null;
};

type OnboardingDerived = {
  cliInstalled: boolean;
  cliVersion: string | null;
  gatewayOk: boolean;
  tokenConfigured: boolean;
  aiConfigured: boolean;
  aiMissingProviders: string[];
  aiStatusError: string | null;
  allowFromConfigured: boolean;
  probeOk: boolean;
  pendingPairings: number;
  cliChecking: boolean;
};

type OnboardingJobs = {
  cli: JobState<{ version?: string | null }>;
  quickstart: JobState<QuickstartResult>;
  pairing: JobState<{ code?: string }>;
  resource: JobState<{ path?: string }>;
  aiAuth: JobState<{ provider?: string }>;
};

export type OnboardingViewModel = {
  state: {
    currentStep: WizardStep;
    isConnected: boolean;
    error: string | null;
    authRequired: boolean;
    authConfigured: boolean;
    inputs: OnboardingInputs;
    messages: OnboardingMessages;
    derived: OnboardingDerived;
    jobs: OnboardingJobs;
    isProcessing: boolean;
    autoStarted: boolean;
  };
  actions: {
    setInputs: {
      setTokenInput: (value: string) => void;
      setAiProvider: (value: string) => void;
      setAiKeyInput: (value: string) => void;
      setPairingInput: (value: string) => void;
      setAuthUser: (value: string) => void;
      setAuthPass: (value: string) => void;
    };
    handleAuthSubmit: () => Promise<void>;
    handleCliInstall: () => Promise<void>;
    handleTokenSubmit: () => Promise<void>;
    handleAiSubmit: () => Promise<void>;
    handlePairingSubmit: () => Promise<void>;
    handleRetry: () => Promise<void>;
    handleProbe: () => Promise<void>;
    handleResourceDownload: () => Promise<{ ok: boolean; error?: string }>;
  };
};

const stepOrder: WizardStep[] = [
  "auth",
  "cli",
  "gateway",
  "token",
  "ai",
  "pairing",
  "probe",
  "complete"
];

const stepIndex = (step: WizardStep) => stepOrder.indexOf(step);

export function useOnboarding(): OnboardingViewModel {
  const { status, error, loading, refresh, setDiscordToken } = useStatusStore();
  const { checkAuth, login, authRequired, authConfigured, authHeader } = useConfigStore();
  const {
    cli,
    quickstart,
    pairing,
    resource,
    aiAuth,
    startCliInstallJob,
    startQuickstartJob,
    startPairingJob,
    startResourceDownloadJob,
    startAiAuthJob
  } = useJobsStore();

  const [currentStep, setCurrentStep] = useState<WizardStep>("auth");
  const [tokenInput, setTokenInput] = useState("");
  const [aiProvider, setAiProvider] = useState("anthropic");
  const [aiKeyInput, setAiKeyInput] = useState("");
  const [pairingInput, setPairingInput] = useState("");
  const [authUser, setAuthUser] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [cliMessage, setCliMessage] = useState<string | null>(null);
  const [probeMessage, setProbeMessage] = useState<string | null>(null);
  const [resourceMessage, setResourceMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);

  const cliInstalled = Boolean(status?.cli.installed);
  const cliVersion = status?.cli.version ?? null;
  const gatewayOk = Boolean(status?.gateway.ok);
  const tokenConfigured = Boolean(status?.onboarding?.discord.tokenConfigured);
  const aiConfigured = Boolean(status?.onboarding?.ai?.configured);
  const aiMissingProviders = status?.onboarding?.ai?.missingProviders ?? [];
  const aiStatusError = status?.onboarding?.ai?.error ?? null;
  const allowFromConfigured = Boolean(status?.onboarding?.discord.allowFromConfigured);
  const probeOk = status?.onboarding?.probe?.ok === true;
  const pendingPairings = status?.onboarding?.discord.pendingPairings ?? 0;
  const cliChecking = !status && loading;

  const jobsRunning =
    cli.status === "running" ||
    quickstart.status === "running" ||
    pairing.status === "running" ||
    resource.status === "running" ||
    aiAuth.status === "running";

  useEffect(() => {
    refresh();
    if (jobsRunning) return;
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [refresh, jobsRunning]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (
      autoStarted ||
      !status ||
      !cliInstalled ||
      (authRequired && !authHeader) ||
      quickstart.status === "running"
    ) {
      return;
    }
    if (gatewayOk) {
      setAutoStarted(true);
      return;
    }
    const run = async () => {
      setMessage("正在自动启动网关...");
      const result = await startQuickstartJob({ startGateway: true, runProbe: false });
      if (!result.ok) {
        setMessage(`启动失败: ${result.error}`);
      } else if (result.result?.gatewayReady) {
        setMessage("网关已就绪。");
      } else {
        setMessage("网关正在启动中...");
      }
      setAutoStarted(true);
    };
    void run();
  }, [
    autoStarted,
    status,
    gatewayOk,
    authRequired,
    authHeader,
    cliInstalled,
    quickstart.status,
    startQuickstartJob
  ]);

  useEffect(() => {
    if (!status) return;
    if (authRequired && !authHeader) {
      setCurrentStep("auth");
      return;
    }
    if (!cliInstalled) {
      setCurrentStep("cli");
      return;
    }

    let target: WizardStep;
    if (probeOk) {
      target = "complete";
    } else if (gatewayOk && tokenConfigured && !aiConfigured) {
      target = "ai";
    } else if (gatewayOk && tokenConfigured && aiConfigured && allowFromConfigured) {
      target = "probe";
    } else if (gatewayOk && tokenConfigured && aiConfigured) {
      target = "pairing";
    } else if (gatewayOk) {
      target = "token";
    } else {
      target = "gateway";
    }

    setCurrentStep((prev) => {
      if (prev === target) return prev;
      return stepIndex(target) > stepIndex(prev) ? target : prev;
    });
  }, [
    status,
    authRequired,
    authHeader,
    cliInstalled,
    gatewayOk,
    tokenConfigured,
    aiConfigured,
    allowFromConfigured,
    probeOk
  ]);

  const handleAuthSubmit = useCallback(async () => {
    if (!authUser.trim() || !authPass.trim()) return;
    setIsProcessing(true);
    setAuthMessage(null);
    const result = await login(authUser, authPass);
    if (result.ok) {
      setAuthMessage("登录成功，正在加载配置...");
      setAuthPass("");
      await refresh();
    } else {
      setAuthMessage(`登录失败: ${result.error}`);
    }
    setIsProcessing(false);
  }, [authUser, authPass, login, refresh]);

  const handleCliInstall = useCallback(async () => {
    setIsProcessing(true);
    setCliMessage("正在启动安装任务...");
    const result = await startCliInstallJob();
    if (!result.ok) {
      setCliMessage(`安装失败: ${result.error}`);
    } else {
      setCliMessage("安装完成，正在刷新状态...");
    }
    setIsProcessing(false);
  }, [startCliInstallJob]);

  const handleTokenSubmit = useCallback(async () => {
    if (!tokenInput.trim()) return;
    setIsProcessing(true);
    setMessage(null);
    const result = await setDiscordToken(tokenInput);
    if (result.ok) {
      setTokenInput("");
      setMessage("Token 已保存！");
    } else {
      setMessage(`保存失败: ${result.error}`);
    }
    setIsProcessing(false);
  }, [tokenInput, setDiscordToken]);

  const handleAiSubmit = useCallback(async () => {
    if (!aiKeyInput.trim()) return;
    setIsProcessing(true);
    setAiMessage(null);
    const result = await startAiAuthJob(aiProvider, aiKeyInput.trim());
    if (result.ok) {
      setAiKeyInput("");
      setAiMessage("AI 凭证已保存。");
    } else {
      setAiMessage(`配置失败: ${result.error}`);
    }
    setIsProcessing(false);
  }, [aiKeyInput, aiProvider, startAiAuthJob]);

  const handlePairingSubmit = useCallback(async () => {
    if (!pairingInput.trim()) return;
    setIsProcessing(true);
    setMessage(null);
    setProbeMessage(null);
    const result = await startPairingJob(pairingInput);
    if (result.ok) {
      setPairingInput("");
      setMessage("配对成功！正在验证通道...");
      const probe = await startQuickstartJob({ runProbe: true, startGateway: true });
      if (probe.ok && probe.result?.probeOk) {
        setProbeMessage("通道探测通过。");
      } else if (probe.ok) {
        setProbeMessage("通道探测未通过，请重试。");
      } else {
        setProbeMessage(`通道探测失败: ${probe.error ?? "unknown"}`);
      }
    } else {
      setMessage(`配对失败: ${result.error}`);
    }
    setIsProcessing(false);
  }, [pairingInput, startPairingJob, startQuickstartJob]);

  const handleRetry = useCallback(async () => {
    setIsProcessing(true);
    setMessage("正在重启网关...");
    const result = await startQuickstartJob({ startGateway: true, runProbe: false });
    if (!result.ok) {
      setMessage(`启动失败: ${result.error}`);
    } else if (result.result?.gatewayReady) {
      setMessage("网关已就绪。");
    } else {
      setMessage("网关正在启动中...");
    }
    setIsProcessing(false);
  }, [startQuickstartJob]);

  const handleProbe = useCallback(async () => {
    setIsProcessing(true);
    setProbeMessage("正在探测通道...");
    const probe = await startQuickstartJob({ runProbe: true, startGateway: true });
    if (probe.ok && probe.result?.probeOk) {
      setProbeMessage("通道探测通过。");
    } else if (probe.ok) {
      setProbeMessage("通道探测未通过，请重试。");
    } else {
      setProbeMessage(`通道探测失败: ${probe.error ?? "unknown"}`);
    }
    setIsProcessing(false);
  }, [startQuickstartJob]);

  const handleResourceDownload = useCallback(async () => {
    setResourceMessage("正在下载资源...");
    const result = await startResourceDownloadJob();
    if (result.ok) {
      setResourceMessage("资源下载完成。");
    } else {
      setResourceMessage(`下载失败: ${result.error}`);
    }
    return result;
  }, [startResourceDownloadJob]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !isProcessing) {
        if (currentStep === "auth" && authRequired && !authHeader) {
          handleAuthSubmit();
        } else if (currentStep === "cli" && !cliInstalled) {
          handleCliInstall();
        } else if (currentStep === "token" && tokenInput.trim()) {
          handleTokenSubmit();
        } else if (currentStep === "ai" && aiKeyInput.trim()) {
          handleAiSubmit();
        } else if (currentStep === "pairing" && pairingInput.trim()) {
          handlePairingSubmit();
        } else if (currentStep === "probe") {
          handleProbe();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentStep,
    authRequired,
    authHeader,
    cliInstalled,
    tokenInput,
    aiKeyInput,
    pairingInput,
    isProcessing,
    handleAuthSubmit,
    handleCliInstall,
    handleTokenSubmit,
    handleAiSubmit,
    handlePairingSubmit,
    handleProbe
  ]);

  return {
    state: {
      currentStep,
      isConnected: Boolean(status),
      error,
      authRequired,
      authConfigured,
      inputs: {
        tokenInput,
        aiProvider,
        aiKeyInput,
        pairingInput,
        authUser,
        authPass
      },
      messages: {
        authMessage,
        message,
        aiMessage,
        cliMessage,
        probeMessage,
        resourceMessage
      },
      derived: {
        cliInstalled,
        cliVersion,
        gatewayOk,
        tokenConfigured,
        aiConfigured,
        aiMissingProviders,
        aiStatusError,
        allowFromConfigured,
        probeOk,
        pendingPairings,
        cliChecking
      },
      jobs: {
        cli,
        quickstart,
        pairing,
        resource,
        aiAuth
      },
      isProcessing,
      autoStarted
    },
    actions: {
      setInputs: {
        setTokenInput,
        setAiProvider,
        setAiKeyInput,
        setPairingInput,
        setAuthUser,
        setAuthPass
      },
      handleAuthSubmit,
      handleCliInstall,
      handleTokenSubmit,
      handleAiSubmit,
      handlePairingSubmit,
      handleRetry,
      handleProbe,
      handleResourceDownload
    }
  };
}
