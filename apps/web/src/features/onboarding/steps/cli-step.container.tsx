import { CliStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useCliStore } from "@/stores/cli-store";
import { useJobsStore } from "@/stores/jobs-store";
import { useStatusStore } from "@/stores/status-store";

export function CliStepContainer() {
  const presenter = usePresenter();
  const status = useStatusStore((state) => state.status);
  const loading = useStatusStore((state) => state.loading);
  const job = useJobsStore((state) => state.cli);
  const message = useCliStore((state) => state.message);
  const isProcessing = useCliStore((state) => state.isProcessing);

  const installed = Boolean(status?.cli.installed);
  const version = status?.cli.version ?? null;
  const isChecking = !status && loading;

  return (
    <CliStep
      installed={installed}
      version={version}
      isChecking={isChecking}
      isProcessing={isProcessing}
      message={message}
      logs={job.logs}
      jobStatus={job.status}
      jobError={job.error}
      onInstall={presenter.cli.install}
    />
  );
}
