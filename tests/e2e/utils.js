import { expect, test } from '@playwright/test';

export const adminEmail = 'e2e-admin@correo.com';
export const adminPassword = 'password';

export async function loginAsAdmin(page) {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('Correo').fill(adminEmail);
    await page.getByLabel('Contraseña').fill(adminPassword);
    
    await Promise.all([
        page.waitForURL(/.*dashboard/, { timeout: 15000 }),
        page.getByRole('button', { name: 'Iniciar Sesión' }).click(),
    ]);

    await expect(page.getByRole('heading', { name: 'Panel Principal' })).toBeVisible();
}
