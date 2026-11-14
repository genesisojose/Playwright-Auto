

import { defineConfig, devices } from '@playwright/test';
import{config} from '@variables'

/* No todo va dentro de use.
Las opciones que controlan cómo se ejecutan los tests van directamente en defineConfig().
Las opciones que configuran el contexto/navegador y las acciones del test van dentro de use.

La regla mental

defineConfig → cómo corre el Test Runner.

use → cómo se comporta/configura el navegador y el contexto durante el test.

*/


export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.test\.ts/,
  // Exclude example files - they are reference templates, not functional tests
  testIgnore: ['**/module-example/**'],

  fullyParallel: false,
  retries: 0, // intentos de ejecucion d eun test si falla 

  // Single worker for now - increase when tests are stable and parallelizable
  workers: 1, //Controla cuántos procesos worker puede utilizar Playwright para ejecutar tests en paralelo.

  timeout: 60000, // Es el timeout máximo de cada test.
  expect: {  // Cada expect puede esperar hasta 10 segundos para que la condición esperada se cumpla
    timeout: 10000, 
  },

  reporter: [ //reporter es una propiedad de configuración de Playwright que permite definir cómo quieres que se muestren y registren los resultados de tus pruebas
    ['list'], //Muestra en la terminal los tests que se están ejecutando y su resultado.
    ['html', {//Genera el reporte HTML nativo de Playwright. //indica que quieres generar un reporte HTML.
      outputFolder: 'playwright-report', // indica en qué carpeta quieres guardar ese reporte. Si no existe, Playwright la crea.
      open: 'never', // evita que Playwright abra automáticamente el reporte en el navegador.
    }],
    ['allure-playwright', { resultsDir: 'allure-results' }], // 'allure-playwright' Le estás indicando a Playwright que utilice el reporter de Allure

    //1. html: quiero que Playwright genere su propio reporte HTML al finalizar la ejecución de los tests.
    //2. outputFolder: quiero que guarde ese reporte en una carpeta llamada playwright-report. Si no existe, Playwright la crea.
    //3. open: 'never': no quiero que Playwright abra automáticamente el reporte en el navegador cuando termine la ejecución.
    //4. allure-playwright: quiero que Playwright genere un reporte Allure al finalizar la ejecución de los tests.
    //5. resultsDir: quiero que guarde ese reporte en una carpeta llamada allure-results. Si no existe, Playwright la crea.


  ],
    // GitHub Reporter (optional): Generates annotations in GitHub Actions UI
    // Uncomment to enable inline error annotations in PR file views
    // Note: Not recommended with matrix strategies (errors multiply in UI)
    // See: https://playwright.dev/docs/test-reporters#github-actions-annotations
    // ...(env.isCI ? [['github'] as const] : []),
  

  use: {
    baseURL: config.baseUrl,
    screenshot: 'only-on-failure', //Toma una captura cuando falla el test.
    video: config.recordVideo ? 'on' : 'retain-on-failure',
    trace: 'retain-on-failure', //Conserva la traza si el test falla.
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
   
   
  },

  projects: [  //Permite ejecutar los tests bajo diferentes configuraciones.
    
    {
      name: 'Login',
      testMatch: /Login\.test\.ts/,
    },

    {
      name: 'ui-setup', // Proyecto que crea la sesión
      testMatch: /ui-auth\.setup\.ts/,
      testDir: './tests/setup'
    },

    {
      name: 'e2e',
      testDir: './tests/e2e',
      testMatch: /.*\.test\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: config.auth.storageStatePath,
      },
      dependencies: ['ui-setup'],
    },

  ],

  // Artifacts directory (add to .gitignore)
  // Contains: screenshots, videos, traces, test results
  outputDir: 'test-results',
});
