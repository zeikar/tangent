// Checks that need no episode media, so they run on a fresh clone and in CI:
// every Python script parses, and for every episode that has them, verify.py
// passes, storyboard.json validates, and cues.json matches the storyboard and
// the approved take. `npm run verify` runs this after lint and the tests.
//
//   node scripts/verify.mts
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { assertCuesFresh } from "./cues-fresh.mts";

const scripts = import.meta.dirname;
const episodes = join(scripts, "../../episodes");
const python = (args: string[], cwd?: string) => execFileSync("python3", args, { cwd, stdio: "pipe" });

const checks: [string, () => unknown][] = [
  [
    "python scripts parse",
    () => {
      const files = readdirSync(scripts, { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".py"));
      python(["-c", "import ast, sys\nfor f in sys.argv[1:]: ast.parse(open(f, encoding='utf-8').read(), f)", ...files], scripts);
    },
  ],
];
for (const slug of readdirSync(episodes, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
  const ep = join(episodes, slug);
  if (existsSync(join(ep, "verify.py"))) checks.push([`${slug} verify.py`, () => python(["verify.py"], ep)]);
  if (existsSync(join(ep, "storyboard.json"))) {
    checks.push([`${slug} storyboard`, () => python([join(scripts, "validate-storyboard.py"), ep])]);
  }
  if (existsSync(join(ep, "cues.json"))) checks.push([`${slug} cues`, () => assertCuesFresh(ep)]);
}

let failed = 0;
for (const [name, run] of checks) {
  try {
    run();
    console.log(`ok    ${name}`);
  } catch (e) {
    failed++;
    const out = (e as { stdout?: Buffer; stderr?: Buffer }).stdout?.toString() ?? "";
    const err = (e as { stderr?: Buffer }).stderr?.toString() ?? (e as Error).message;
    console.log(`FAIL  ${name}\n${`${out}${err}`.trim().replace(/^/gm, "      ")}`);
  }
}
process.exitCode = failed ? 1 : 0;
