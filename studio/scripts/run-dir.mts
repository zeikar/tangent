// A temp directory of this run's own, removed when the process exits (on
// Ctrl-C too), so runs in parallel never share intermediates.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const runDir = (prefix: string) => {
  const dir = mkdtempSync(join(tmpdir(), `${prefix}-`));
  process.on("exit", () => rmSync(dir, { recursive: true, force: true }));
  process.once("SIGINT", () => process.exit(130));
  return dir;
};
