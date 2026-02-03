import { stopAll } from "./stop-all.js";
import { listSandboxDirs } from "../lib/sandbox.js";
import { resetEnvironmentShared } from "../lib/reset-shared.js";
export function resetManager(flags) {
    return resetEnvironmentShared({
        flags: {
            dryRun: flags.dryRun,
            noStop: flags.noStop,
            force: flags.force,
            configDir: flags.configDir,
            configPath: flags.configPath,
            installDir: flags.installDir
        },
        stopAll: () => stopAll(flags),
        sandboxDirs: listSandboxDirs()
    });
}
