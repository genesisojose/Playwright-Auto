/**
 * Builds an Allure 3 report into a local copy of the gh-pages branch, keeping history.
 *
 * Layout inside --pages:
 *   index.html                    -> redirects to /<suite>/
 *   <suite>/index.html            -> redirects to the latest report
 *   <suite>/<n>/                  -> report number n (per-suite counter: 1, 2, 3...)
 *   <suite>/history.jsonl         -> Allure 3 trend history
 *   <suite>/last-report-number    -> counter
 *
 * It only writes files: committing/pushing gh-pages and deploying Pages is up to the caller (CI),
 * so it can be run locally safely:
 *   bun scripts/ci/publish-allure-pages.ts --suite e2e --results allure-results --pages ./gh-pages
 *
 * In GitHub Actions it also writes the `report_number` step output and the run summary.
 */
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    suite: { type: 'string', default: 'e2e' },
    results: { type: 'string', default: 'allure-results' },
    pages: { type: 'string', default: 'gh-pages' },
    keep: { type: 'string', default: '20' },
    'tests-result': { type: 'string' }, // result of the test job (CI summary only)
  },
});

const suite = args.suite!;
const resultsDir = args.results!;
const pagesDir = args.pages!;
const keep = Number(args.keep);
const suiteDir = join(pagesDir, suite);

if (!existsSync(resultsDir) || readdirSync(resultsDir).length === 0) {
  console.error(`[publish] No Allure results found in "${resultsDir}".`);
  process.exit(1);
}
mkdirSync(suiteDir, { recursive: true });

// 1. Next report number (own counter, independent of GitHub's run_number)
const counterFile = join(suiteDir, 'last-report-number');
const last = existsSync(counterFile) ? Number(readFileSync(counterFile, 'utf8').trim()) || 0 : 0;
const reportNumber = last + 1;
const reportDir = join(suiteDir, String(reportNumber));
console.log(`[publish] Building ${suite} report #${reportNumber}`);

// 2. Generate the report with the repo's allurerc.mjs, appending to the suite's trend history
// process.execPath = the running bun binary: no shell needed, so paths with spaces are safe on every OS
const generate = spawnSync(
  process.execPath,
  ['x', 'allure', 'generate', resultsDir, '--clean', '-o', reportDir, '--name', `${suite} - Report #${reportNumber}`],
  {
    stdio: 'inherit',
    env: { ...process.env, ALLURE_HISTORY_PATH: join(suiteDir, 'history.jsonl') },
  },
);
if (generate.status !== 0) {
  console.error('[publish] allure generate failed.');
  process.exit(generate.status ?? 1);
}

// 3. Save counter, redirects and prune old reports
writeFileSync(counterFile, `${reportNumber}\n`);
rmSync(join(suiteDir, 'last-history'), { recursive: true, force: true }); // Allure 2 leftover

const redirect = (target: string, label: string) => `<!doctype html>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=./${target}/">
<title>${label}</title>
<a href="./${target}/">${label}</a>
`;
writeFileSync(join(suiteDir, 'index.html'), redirect(String(reportNumber), `Latest ${suite} report (#${reportNumber})`));
writeFileSync(join(pagesDir, 'index.html'), redirect(suite, `${suite} reports`));

const reports = readdirSync(suiteDir)
  .filter(name => /^\d+$/.test(name))
  .map(Number)
  .sort((a, b) => a - b);
for (const old of reports.slice(0, Math.max(0, reports.length - keep))) {
  rmSync(join(suiteDir, String(old)), { recursive: true, force: true });
  console.log(`[publish] Removed old report #${old}`);
}

// 4. CI outputs: step output + run summary
const { GITHUB_OUTPUT, GITHUB_STEP_SUMMARY, GITHUB_REPOSITORY, TEST_ENV } = process.env;
if (GITHUB_OUTPUT) appendFileSync(GITHUB_OUTPUT, `report_number=${reportNumber}\n`);

if (GITHUB_STEP_SUMMARY && GITHUB_REPOSITORY) {
  const [owner, repo] = GITHUB_REPOSITORY.split('/');
  const pagesUrl = `https://${owner}.github.io/${repo}/${suite}`;
  const testsResult = args['tests-result'];
  const status = testsResult === 'success' ? '✅ Passed' : `❌ ${testsResult ?? 'unknown'}`;
  appendFileSync(GITHUB_STEP_SUMMARY, [
    `## Allure Report - ${suite} #${reportNumber}`,
    '',
    '| | |',
    '|---|---|',
    `| **Tests** | ${status} |`,
    `| **Environment** | ${TEST_ENV ?? '-'} |`,
    `| **Report** | ${pagesUrl}/${reportNumber}/ |`,
    `| **Latest** | ${pagesUrl}/ |`,
    '',
  ].join('\n'));
}

console.log(`[publish] Done: ${reportDir}`);
