//Tomar la información de .env y convertirla en una configuración organizada que pueda utilizar Playwright y el resto del framework.



//Lee el archivo .env y carga sus variables.


try {
    process.loadEnvFile();
  }
  catch {
    // .env file doesn't exist (expected in CI environments)
  }

  // ============================================
  // Environment Type Definitions
  // ============================================
  
export type Environment = 'local' | 'staging'; // Add more when needed (e.g., 'production')
  
  // ============================================
  // Destructure Environment Variables (Single Access)
  // ============================================
  

  /* Esto es desestructuración de objeto de JS/TS. En vez de escribir process.env.TEST_ENV cada vez, saca todas las variables que necesita de una sola vez y les crea una constante con el mismo nombre.
   */

  const {
    // === Environment Detection ===
    TEST_ENV = 'staging', // Used: env.current, selects URLs and credentials
    CI, // Used: env.isCI (global.setup, KataReporter)
    BUILD_ID, // Used: env.buildId (jiraSync)
  
    // === Test User Credentials (only current TEST_ENV required) ===
    LOCAL_USER_EMAIL, // Required if TEST_ENV=local
    LOCAL_USER_PASSWORD, // Required if TEST_ENV=local
    STAGING_USER_EMAIL, // Required if TEST_ENV=staging
    STAGING_USER_PASSWORD, // Required if TEST_ENV=staging


    // === Browser Configuration ===
    HEADLESS = 'true', // Used: config.browser.headless (playwright.config)
    DEFAULT_TIMEOUT = '30000', // Used: config.browser.defaultTimeout (playwright.config, ApiBase)
    VIDEO = 'false', // Used: config.recordVideo (playwright.config). 'true' records every test
  
  } = process.env;
  
  // ============================================
  // Environment Detection
  // ============================================
  
  export const env = {
    current: TEST_ENV as Environment,
    isLocal: TEST_ENV === 'local' || TEST_ENV === undefined,
    isStaging: TEST_ENV === 'staging',
    isCI: CI === 'true',
    buildId: BUILD_ID ?? 'local',
  } as const;


// ============================================
// Test-User Credentials Mapping (variables from .env)
// After validation, current environment credentials are guaranteed to exist
// ============================================

const userCredentialsMap: Record<Environment, { email: string, password: string }> = {
  local: {
    email: LOCAL_USER_EMAIL ?? '',
    password: LOCAL_USER_PASSWORD ?? '',
  },
  // `||` instead of `??`: an unset GitHub secret arrives as an empty string, not undefined
  staging: {
    email: STAGING_USER_EMAIL || 'demo@soloq.app',
    password: STAGING_USER_PASSWORD || 'Demo123!',
  },
};

// ============================================
// ENV DATA Mapping (hardcoded - not secrets because these are not sensitive data like credentials)
// ============================================

const envDataMap: Record<
  Environment,
  { base: string, api: string, user: { email: string, password: string } }
> = {
  local: {
    base: 'http://localhost:3000',
    api: 'http://localhost:3000/api',
    user: userCredentialsMap.local,
  },
  staging: {
    base: 'https://staging-upexsoloq.vercel.app/',
    api: '',
    user: userCredentialsMap.staging,
  },
};
const envData = envDataMap[env.current];

// ============================================
// Main Configuration Object
// ============================================

export const config = {
  // URLs - selected by TEST_ENV from urlMap
  baseUrl: envData.base,
  apiUrl: envData.api,

  // Record video for every test (CI input `video_record`), otherwise only on failure
  recordVideo: VIDEO === 'true',

  // Authentication config
  auth: {
    //loginEndpoint: '/auth/login',
    tokenEndpoint: '/v1/token?grant_type=password', // Endpoint to intercept for token (used by page.waitForResponse)
    // Storage paths for authenticated sessions
    storageStatePath: 'playwright/.auth/user-state.json',
    apiStatePath: 'playwright/.auth/api-state.json',
  },

    // Test User (configure in .env)
  testUser: envData.user
}