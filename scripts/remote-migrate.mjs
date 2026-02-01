const target = process.env.MANAGER_MIGRATION_URL ?? process.env.ONBOARDING_MIGRATION_URL;

if (!target) {
  console.log("[remote-migrate] No migration endpoint configured. Skipping.");
  process.exit(0);
}

const res = await fetch(target, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ reason: "release", at: new Date().toISOString() })
});

if (!res.ok) {
  const text = await res.text().catch(() => "");
  console.error(`[remote-migrate] Failed: ${res.status} ${text}`.trim());
  process.exit(1);
}

const payload = await res.text().catch(() => "");
console.log(`[remote-migrate] Success${payload ? `: ${payload}` : ""}`);
