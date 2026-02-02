import { ArrowRight, Check, ExternalLink, Loader2, Lock, MessageCircle, Search, Shield, Terminal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { JobLogPanel } from "@/components/job-log-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/stores/jobs-store";

// ============================================
// Auth Step
// ============================================

interface AuthStepProps {
    username: string;
    password: string;
    onUsernameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onSubmit: () => void;
    isProcessing: boolean;
    message: string | null;
}

export function AuthStep({
    username,
    password,
    onUsernameChange,
    onPasswordChange,
    onSubmit,
    isProcessing,
    message
}: AuthStepProps) {
    const { t } = useTranslation();
    
    return (
        <div className="space-y-6 p-8">
            <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                    <Lock className="h-8 w-8 text-accent" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold">{t("auth.title")}</h2>
                <p className="mt-2 text-sm text-muted">
                    {t("auth.subtitle")}
                </p>
                <p className="mt-1 text-xs text-muted">{t("auth.defaultAccount")}</p>
            </div>
            <div className="space-y-4">
                <Input
                    value={username}
                    onChange={(e) => onUsernameChange(e.target.value)}
                    placeholder={t("auth.username")}
                    autoFocus
                />
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    placeholder={t("auth.password")}
                />
                <Button
                    onClick={onSubmit}
                    disabled={!username.trim() || !password || isProcessing}
                    size="lg"
                    className="w-full"
                >
                    {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            {t("common.login")}
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
            {message && (
                <div className="rounded-2xl bg-line/30 px-4 py-2 text-xs text-muted text-center">
                    {message}
                </div>
            )}
        </div>
    );
}

// ============================================
// CLI Step
// ============================================

interface CliStepProps {
    installed: boolean;
    version: string | null;
    isChecking: boolean;
    isProcessing: boolean;
    message: string | null;
    logs: string[];
    jobStatus: JobStatus;
    jobError: string | null;
    onInstall: () => void;
}

export function CliStep({
    installed,
    version,
    isChecking,
    isProcessing,
    message,
    logs,
    jobStatus,
    jobError,
    onInstall
}: CliStepProps) {
    const { t } = useTranslation();
    
    const statusText = installed
        ? t("cli.ready")
        : isChecking
            ? t("cli.checking")
            : t("cli.notDetected");

    return (
        <div className="space-y-6 p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
                {installed ? (
                    <Check className="h-10 w-10 text-success animate-bounce-once" />
                ) : isChecking ? (
                    <Loader2 className="h-10 w-10 text-accent animate-spin" />
                ) : (
                    <Terminal className="h-10 w-10 text-accent" />
                )}
            </div>
            <div>
                <h2 className="text-2xl font-semibold">{t("cli.title")}</h2>
                <p className="mt-2 text-sm text-muted">{statusText}</p>
            </div>
            {installed ? (
                <div className="rounded-2xl bg-success/10 px-4 py-2 text-sm text-success text-center">
                    {t("cli.detected")}{version ? `（${version}）` : ""}。
                </div>
            ) : (
                <Button
                    onClick={onInstall}
                    disabled={isProcessing || isChecking}
                    size="lg"
                    className="w-full"
                >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {t("cli.installButton")}
                </Button>
            )}
            <div className="rounded-2xl bg-line/20 p-4 text-left text-xs text-muted">
                <div className="mb-2 text-[11px] uppercase tracking-widest text-muted">{t("cli.manualInstall")}</div>
                <code className="break-words">{t("cli.npmCommand")}</code>
                <div className="mt-2 text-[11px]">{t("cli.npmNote")}</div>
                <div className="mt-1 text-[11px]">{t("cli.permissionNote")}</div>
            </div>
            <JobLogPanel title={t("cli.installLogs")} logs={logs} status={jobStatus} />
            {jobStatus === "failed" ? (
                <div className="rounded-2xl bg-warning/10 px-4 py-2 text-xs text-warning text-center">
                    {t("cli.installFailed")}：{jobError ?? t("errors.unknown")}
                </div>
            ) : null}
            {message && (
                <div className="rounded-2xl bg-line/30 px-4 py-2 text-xs text-muted text-center">
                    {message}
                </div>
            )}
        </div>
    );
}

// ============================================
// Gateway Step
// ============================================

interface GatewayStepProps {
    isReady: boolean;
    autoStarted: boolean;
    message: string | null;
    isProcessing: boolean;
    logs: string[];
    jobStatus: JobStatus;
    jobError: string | null;
    onStart: () => void;
}

export function GatewayStep({
    isReady,
    autoStarted,
    message,
    isProcessing,
    logs,
    jobStatus,
    jobError,
    onStart
}: GatewayStepProps) {
    const { t } = useTranslation();
    
    const isStarting = isProcessing || jobStatus === "running";
    const title = isReady
        ? t("gateway.verified")
        : jobStatus === "failed"
            ? t("gateway.verifyFailed")
            : isStarting
                ? t("gateway.verifying")
                : t("gateway.waiting");
    const subtitle = isReady
        ? t("gateway.autoEnter")
        : jobStatus === "failed"
            ? t("gateway.retryStart")
            : isStarting
                ? t("gateway.checking")
                : t("gateway.startHint");

    return (
        <div className="space-y-6 p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
                {isReady ? (
                    <Check className="h-10 w-10 text-success animate-bounce-once" />
                ) : (
                    <Loader2 className="h-10 w-10 text-accent animate-spin" />
                )}
            </div>
            <div>
                <h2 className="text-2xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-muted">{subtitle}</p>
            </div>
            {!isReady && (
                <Button onClick={onStart} disabled={isProcessing} variant="outline">
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {autoStarted ? t("gateway.retryButton") : t("gateway.startButton")}
                </Button>
            )}
            <JobLogPanel title={t("gateway.startLogs")} logs={logs} status={jobStatus} />
            {jobStatus === "failed" ? (
                <div className="rounded-2xl bg-warning/10 px-4 py-2 text-xs text-warning">
                    {t("gateway.startFailed")}：{jobError ?? t("errors.unknown")}
                </div>
            ) : null}
            {message && (
                <div className="rounded-2xl bg-line/30 px-4 py-2 text-xs text-muted">{message}</div>
            )}
        </div>
    );
}

// ============================================
// Token Step
// ============================================

interface TokenStepProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isProcessing: boolean;
    message: string | null;
}

export function TokenStep({ value, onChange, onSubmit, isProcessing, message }: TokenStepProps) {
    const { t } = useTranslation();
    
    return (
        <div className="space-y-6 p-8">
            <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                    <Shield className="h-8 w-8 text-accent" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold">{t("token.title")}</h2>
                <p className="mt-2 text-sm text-muted">{t("token.subtitle")}</p>
            </div>
            <div className="space-y-4">
                <Input
                    type="password"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={t("token.placeholder")}
                    className="text-center"
                    autoFocus
                />
                <Button
                    onClick={onSubmit}
                    disabled={!value.trim() || isProcessing}
                    size="lg"
                    className="w-full"
                >
                    {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            {t("common.continue")}
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted">
                <a
                    href="https://discord.com/developers/applications"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-accent transition"
                >
                    {t("token.howToGet")}
                    <ExternalLink className="h-3 w-3" />
                </a>
                <span className="hidden sm:inline">{t("token.enterHint")}</span>
            </div>
            {message && (
                <div className="rounded-2xl bg-line/30 px-4 py-2 text-xs text-muted text-center">
                    {message}
                </div>
            )}
        </div>
    );
}

// ============================================
// AI Step
// ============================================

interface AiStepProps {
    provider: string;
    value: string;
    onProviderChange: (value: string) => void;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isProcessing: boolean;
    message: string | null;
    configured: boolean;
    missingProviders: string[];
    logs: string[];
    jobStatus: JobStatus;
    jobError: string | null;
    statusError: string | null;
}

const AI_PROVIDER_OPTIONS = [
    { value: "anthropic", labelKey: "ai.providers.anthropic" },
    { value: "openai", labelKey: "ai.providers.openai" },
    { value: "openrouter", labelKey: "ai.providers.openrouter" },
    { value: "minimax", labelKey: "ai.providers.minimax" },
    { value: "minimax-cn", labelKey: "ai.providers.minimax-cn" },
    { value: "gemini", labelKey: "ai.providers.gemini" },
    { value: "zai", labelKey: "ai.providers.zai" },
    { value: "moonshot", labelKey: "ai.providers.moonshot" }
];

const AI_PROVIDER_HELP: Record<string, string> = {
    anthropic: "https://console.anthropic.com/settings/keys",
    openai: "https://platform.openai.com/api-keys",
    openrouter: "https://openrouter.ai/keys"
};

export function AiStep({
    provider,
    value,
    onProviderChange,
    onChange,
    onSubmit,
    isProcessing,
    message,
    configured,
    missingProviders,
    logs,
    jobStatus,
    jobError,
    statusError
}: AiStepProps) {
    const { t } = useTranslation();
    const helpLink = AI_PROVIDER_HELP[provider];
    
    return (
        <div className="space-y-6 p-8">
            <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                    <Shield className="h-8 w-8 text-accent" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold">{t("ai.title")}</h2>
                <p className="mt-2 text-sm text-muted">
                    {t("ai.subtitle")}
                </p>
            </div>

            {missingProviders.length > 0 ? (
                <div className="rounded-2xl bg-warning/10 px-4 py-2 text-xs text-warning text-center">
                    {t("ai.missingProviders")}：{missingProviders.join(", ")}
                </div>
            ) : null}

            {configured ? (
                <div className="rounded-2xl bg-success/10 px-4 py-2 text-sm text-success text-center">
                    {t("ai.detected")}
                </div>
            ) : null}

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs text-muted">{t("ai.provider")}</label>
                    <select
                        value={provider}
                        onChange={(e) => onProviderChange(e.target.value)}
                        className="w-full rounded-xl border border-line/60 bg-white/70 px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                    >
                        {AI_PROVIDER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {t(opt.labelKey)}
                            </option>
                        ))}
                    </select>
                </div>
                <Input
                    type="password"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={t("ai.apiKeyPlaceholder")}
                    className="text-center"
                />
                <Button
                    onClick={onSubmit}
                    disabled={!value.trim() || isProcessing}
                    size="lg"
                    className="w-full"
                >
                    {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            {t("ai.saveButton")}
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>

            {helpLink ? (
                <div className="text-center text-xs text-muted">
                    {t("ai.getKey")}：
                    <a
                        href={helpLink}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-1 text-accent hover:underline"
                    >
                        {helpLink}
                    </a>
                </div>
            ) : null}

            <JobLogPanel title={t("ai.configLogs")} logs={logs} status={jobStatus} />
            {jobStatus === "failed" ? (
                <div className="rounded-2xl bg-warning/10 px-4 py-2 text-xs text-warning text-center">
                    {t("ai.configFailed")}：{jobError ?? t("errors.unknown")}
                </div>
            ) : null}
            {statusError ? (
                <div className="rounded-2xl bg-warning/10 px-4 py-2 text-xs text-warning text-center">
                    {t("ai.statusFailed")}：{statusError}
                </div>
            ) : null}
            {message && (
                <div className="rounded-2xl bg-line/30 px-4 py-2 text-xs text-muted text-center">
                    {message}
                </div>
            )}
        </div>
    );
}

// ============================================
// Pairing Step
// ============================================

interface PairingStepProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isProcessing: boolean;
    message: string | null;
    pendingPairings: number;
    logs: string[];
    jobStatus: JobStatus;
    jobError: string | null;
}

export function PairingStep({
    value,
    onChange,
    onSubmit,
    isProcessing,
    message,
    pendingPairings,
    logs,
    jobStatus,
    jobError
}: PairingStepProps) {
    const { t } = useTranslation();
    
    return (
        <div className="space-y-6 p-8">
            <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                    <MessageCircle className="h-8 w-8 text-accent" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold">{t("pairing.title")}</h2>
                <p className="mt-2 text-sm text-muted">{t("pairing.subtitle")}</p>
            </div>

            {/* Instructions */}
            <div className="space-y-3 rounded-2xl bg-line/20 p-4">
                <div className="flex items-start gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                        1
                    </span>
                    <span className="text-muted">{t("pairing.step1")}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                        2
                    </span>
                    <span className="text-muted">{t("pairing.step2")}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                        3
                    </span>
                    <span className="text-muted">{t("pairing.step3")}</span>
                </div>
            </div>

            {pendingPairings > 0 && (
                <div className="rounded-2xl bg-success/10 px-4 py-2 text-sm text-success text-center">
                    🎉 {t("pairing.pendingRequests", { count: pendingPairings })}
                </div>
            )}

            <div className="space-y-4">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                    placeholder={t("pairing.placeholder")}
                    className="text-center font-mono text-lg tracking-widest"
                    maxLength={10}
                    autoFocus
                />
                <Button
                    onClick={onSubmit}
                    disabled={!value.trim() || isProcessing}
                    size="lg"
                    className="w-full"
                >
                    {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            {t("pairing.verifyButton")}
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
            <div className="text-center text-xs text-muted">{t("token.enterHint")}</div>
            <JobLogPanel title={t("pairing.pairingLogs")} logs={logs} status={jobStatus} />
            {jobStatus === "failed" ? (
                <div className="rounded-2xl bg-warning/10 px-4 py-2 text-xs text-warning text-center">
                    {t("pairing.pairingFailed")}：{jobError ?? t("errors.unknown")}
                </div>
            ) : null}
            {message && (
                <div className="rounded-2xl bg-line/30 px-4 py-2 text-xs text-muted text-center">
                    {message}
                </div>
            )}
        </div>
    );
}

// ============================================
// Probe Step
// ============================================

interface ProbeStepProps {
    isProcessing: boolean;
    message: string | null;
    logs: string[];
    jobStatus: JobStatus;
    jobError: string | null;
    onRetry: () => void;
}

export function ProbeStep({ isProcessing, message, logs, jobStatus, jobError, onRetry }: ProbeStepProps) {
    const { t } = useTranslation();
    
    return (
        <div className="space-y-6 p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
                {isProcessing ? (
                    <Loader2 className="h-10 w-10 text-accent animate-spin" />
                ) : (
                    <Search className="h-10 w-10 text-accent" />
                )}
            </div>
            <div>
                <h2 className="text-2xl font-semibold">{t("probe.title")}</h2>
                <p className="mt-2 text-sm text-muted">
                    {t("probe.description")}
                </p>
            </div>
            <Button onClick={onRetry} disabled={isProcessing} size="lg" className="w-full">
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("probe.retryButton")}
            </Button>
            <JobLogPanel title={t("probe.probeLogs")} logs={logs} status={jobStatus} />
            {jobStatus === "failed" ? (
                <div className="rounded-2xl bg-warning/10 px-4 py-2 text-xs text-warning text-center">
                    {t("probe.probeFailed")}：{jobError ?? t("errors.unknown")}
                </div>
            ) : null}
            {message && (
                <div className="rounded-2xl bg-line/30 px-4 py-2 text-xs text-muted text-center">
                    {message}
                </div>
            )}
        </div>
    );
}

// ============================================
// Complete Step
// ============================================

interface CompleteStepProps {
    probeOk: boolean;
    onDownloadResource: () => Promise<{ ok: boolean; error?: string }>;
    resourceLogs: string[];
    resourceJobStatus: JobStatus;
    resourceMessage: string | null;
    resourceError: string | null;
}

export function CompleteStep({
    probeOk,
    onDownloadResource,
    resourceLogs,
    resourceJobStatus,
    resourceMessage,
    resourceError
}: CompleteStepProps) {
    const { t } = useTranslation();
    
    return (
        <div className="space-y-6 p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-success/10">
                <Check className="h-10 w-10 text-success" />
            </div>
            <div>
                <h2 className="text-2xl font-semibold text-success">🎉 {t("complete.title")}</h2>
                <p className="mt-2 text-sm text-muted">{t("complete.subtitle")}</p>
            </div>

            <div className="space-y-3 rounded-2xl bg-line/20 p-4 text-left">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">{t("complete.gatewayStatus")}</span>
                    <span className="font-semibold text-success">● {t("complete.online")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">{t("complete.botConnection")}</span>
                    <span className="font-semibold text-success">● {t("complete.connected")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">{t("complete.probeStatus")}</span>
                    <span className={cn("font-semibold", probeOk ? "text-success" : "text-warning")}>
                        {probeOk ? `● ${t("complete.passed")}` : `○ ${t("complete.pendingVerify")}`}
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                <Button size="lg" className="w-full">
                    {t("complete.startChat")}
                    <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="text-xs text-muted">{t("complete.chatHint")}</p>
            </div>

            <div className="space-y-3 rounded-2xl bg-line/20 p-4 text-left">
                <div className="text-sm font-semibold text-ink">{t("complete.resourceTitle")}</div>
                <p className="text-xs text-muted">
                    {t("complete.resourceDesc")}
                </p>
                <Button
                    size="sm"
                    className="w-full"
                    onClick={onDownloadResource}
                    disabled={resourceJobStatus === "running"}
                >
                    {resourceJobStatus === "running" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {t("complete.downloadButton")}
                </Button>
                <JobLogPanel title={t("complete.resourceLogs")} logs={resourceLogs} status={resourceJobStatus} />
                {resourceJobStatus === "failed" ? (
                    <div className="rounded-2xl bg-warning/10 px-4 py-2 text-xs text-warning">
                        {t("complete.downloadFailed")}：{resourceError ?? t("errors.unknown")}
                    </div>
                ) : null}
                {resourceMessage && (
                    <div className="rounded-2xl bg-line/30 px-4 py-2 text-xs text-muted">
                        {resourceMessage}
                    </div>
                )}
            </div>
        </div>
    );
}
