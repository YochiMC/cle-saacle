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

/**
 * Robust helper to select an option from a Radix UI Select component.
 */
export async function selectRadixOption(page, label, optionText) {
    // We search within the specific container or globally if not specified
    const trigger = page.getByLabel(label);
    await trigger.click();
    
    // Radix portals the content to the body, so we search globally for the option
    const option = page.getByRole('option', { name: optionText, exact: true });
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click({ force: true });
    
    // Ensure the dropdown is closed
    await expect(option).not.toBeVisible();
}

/**
 * Helper to wait for a success or error flash message (ModalAlert or Toast).
 */
export async function waitForFlashMessage(page, text) {
    const alert = page.getByText(text);
    await expect(alert).toBeVisible({ timeout: 10000 });
}
