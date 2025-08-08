/* playwright.config.js
npx playwright test
npx playwright test --reporter=html
npx playwright show-rep ort
page.pause(): Agrega await page.pause() justo antes de la línea que da el error. 
Esto detendrá la ejecución de la prueba y abrirá el Inspector de Playwright, 
permitiéndote interactuar con el navegador y ver el estado de la página en ese momento.

const HOST = '143.198.232.196';
// Usa la combined URL http://(ip)/(nginx_tag)/(url_tag)

*/
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  workers: 18, // 35 total users // 18 (50%) = quality gate
  // Solo Chromium
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
  ],
  // Configuración global de entorno
  use: {
    viewport: { width: 1280, height: 720 },
  },
};

module.exports = config;