import { useJobsStore } from "@/stores/jobs-store";

export function useJobsRunning() {
  const cli = useJobsStore((state) => state.cli.status);
  const quickstart = useJobsStore((state) => state.quickstart.status);
  const pairing = useJobsStore((state) => state.pairing.status);
  const resource = useJobsStore((state) => state.resource.status);
  const aiAuth = useJobsStore((state) => state.aiAuth.status);

  return (
    cli === "running" ||
    quickstart === "running" ||
    pairing === "running" ||
    resource === "running" ||
    aiAuth === "running"
  );
}
