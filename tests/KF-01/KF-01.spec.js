const { test, expect } = require('@playwright/test');
const credentials = require('./credentials.json');

const BASE_URL = 'http://localhost:7613/modulorrhh';

test.describe.configure({ mode: 'parallel' });

test.describe('tests', () => {

  for (const USER of credentials) { // Generamos N tests por usuario

    // Crear un describe anidado para cada usuario con modo serial
    test.describe(`Usuario ${USER.email}`, () => {
      test.describe.configure({ mode: 'serial' });

      test(`Login de ${USER.email}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', USER.email);
        await page.fill('input[name="password"]', USER.password);
        await page.check('input[name="remember"]');
        await page.click('button[type="submit"]');

        const bodyText = await page.textContent('body');
        const errorDetected = bodyText?.includes('[System Error]');
        if (errorDetected) {
          throw new Error('Error de sistema detectado en la página');
        }

        await page.waitForURL(`${BASE_URL}/inicio`);
        await page.waitForTimeout(2000);
      });

      test(`Login into Tabla de usuarios de ${USER.email}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', USER.email);
        await page.fill('input[name="password"]', USER.password);
        await page.check('input[name="remember"]');
        await page.click('button[type="submit"]');
        await page.waitForURL(`${BASE_URL}/inicio`);

        // Selector del enlace al módulo usuarios después de dar clic en la sidebar
        const menuIconSelector = 'svg[onclick="toggleSidebar()"]';
        await page.waitForSelector(menuIconSelector, { state: 'visible' });
        await page.click(menuIconSelector);
        const usuariosLinkSelector = 'a[href="/modulorrhh/usuarios"]';

        // Intentamos encontrar el enlace y acceder con diferentes roles de usuario
        await page.waitForTimeout(1000); // esperar máximo 1seg en lo que carga la sidebar
        const linkVisible = await page.isVisible(usuariosLinkSelector);
        if (linkVisible) {
          await page.click(usuariosLinkSelector);
          await page.waitForURL(`${BASE_URL}/usuarios`);
        } else {
          console.warn(`(!) El enlace al módulo usuarios no está visible para ${USER.email}`);
        }

        // Error messages check
        const bodyText = await page.textContent('body');
        const errorDetected = bodyText?.includes('[System Error]');
        if (errorDetected) {
          throw new Error('Error de sistema detectado en la página');
        }
        await page.waitForTimeout(2000);
      });

      test(`Login into Logout de ${USER.email}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', USER.email);
        await page.fill('input[name="password"]', USER.password);
        await page.check('input[name="remember"]');
        await page.click('button[type="submit"]');
        await page.waitForURL(`${BASE_URL}/inicio`);

        // Selector del enlace de logout después de dar clic en la sidebar
        const menuIconSelector = 'svg[onclick="toggleSidebar()"]';
        await page.waitForSelector(menuIconSelector, { state: 'visible' });
        await page.click(menuIconSelector);
        const logoutLinkSelector = 'a[href="/modulorrhh/logout"]';

        // Intentamos hacer logout accediendo al botón de cerrar sesión
        await page.waitForSelector(logoutLinkSelector, { state: 'visible' });
        await page.click(logoutLinkSelector);

        // Ahora intentamos ingresar a una vista protegida y debería darnos http 401
        const response = await page.goto(`${BASE_URL}/inicio`);
        if (response?.status() !== 401) {
          throw new Error(`Esperado HTTP 401, pero se recibió ${response?.status()}`);
        }

        // Error messages check
        const bodyText = await page.textContent('body');
        const errorDetected = bodyText?.includes('[System Error]');
        if (errorDetected) {
          throw new Error('Error de sistema detectado en la página');
        }
        await page.waitForTimeout(2000);
      });

    });
  }
});