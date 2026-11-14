// Validates that the current TEST_ENV is supported and has usable credentials.
// Runs before the test suite (locally or in CI) to fail fast with a clear message.

import type { Environment } from './variables';

const supportedEnvironments: Environment[] = ['local', 'staging'];
const testEnv = process.env.TEST_ENV || 'staging';

// Check TEST_ENV before importing variables.ts: an unknown environment crashes that module on load
if (!supportedEnvironments.includes(testEnv as Environment)) {
  console.error(`[env:check] TEST_ENV="${testEnv}" is not supported. Use one of: ${supportedEnvironments.join(', ')}.`);
  process.exit(1);
}

const { config, env } = await import('./variables');
const errors: string[] = [];

{
  const prefix = env.current.toUpperCase();
  if (!config.testUser.email) errors.push(`${prefix}_USER_EMAIL is missing.`);
  if (!config.testUser.password) errors.push(`${prefix}_USER_PASSWORD is missing.`);
  if (!config.baseUrl) errors.push(`No base URL configured for TEST_ENV="${env.current}".`);
}

if (errors.length > 0) {
  console.error('[env:check] Invalid test environment:');
  errors.forEach(error => console.error(`  - ${error}`));
  process.exit(1);
}

console.log(`[env:check] OK - TEST_ENV=${env.current}, baseUrl=${config.baseUrl}, user=${config.testUser.email}`);
