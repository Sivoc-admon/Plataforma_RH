// playwright.config.js
// npx playwright test --workers=18
// npx playwright test --reporter=html
// npx playwright show-report
// recuerda correr un solo worker con la camara on y headless false para debuggear
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  // Solo Chromium
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        headless: true
      },
    },
  ],

  // Configuración global de entorno
  use: {
    viewport: { width: 1280, height: 720 },
  },
};

module.exports = config;
