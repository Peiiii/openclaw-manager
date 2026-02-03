import { REQUIRED_NODE_MAJOR } from "./constants.js";

export async function getSystemStatus() {
  const major = parseMajor(process.version);
  return {
    node: {
      current: process.version,
      required: `>=${REQUIRED_NODE_MAJOR}`,
      ok: major >= REQUIRED_NODE_MAJOR
    },
    platform: process.platform,
    arch: process.arch
  };
}

function parseMajor(version: string): number {
  const cleaned = version.replace(/^v/, "");
  const [major] = cleaned.split(".");
  return Number(major);
}
