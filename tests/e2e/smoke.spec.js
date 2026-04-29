import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './utils';

test('admin can log in and see the dashboard', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByRole('heading', { name: 'Panel Principal' })).toBeVisible();
    await expect(page.getByText('Estadísticas Generales')).toBeVisible();
});

test('admin can open a group from the catalog', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/groups');
    await expect(page.getByRole('heading', { name: 'Catálogo de Grupos' })).toBeVisible();

    await page.getByRole('link', { name: 'Abrir Grupo' }).first().click();
    await expect(page.getByRole('heading', { name: /Gestión de Grupo/ })).toBeVisible();
});

test('admin can open an exam from the catalog', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/exams');
    await expect(page.getByRole('heading', { name: 'Gestión de Exámenes' })).toBeVisible();

    await page.getByRole('link', { name: 'Abrir Examen' }).first().click();
    await expect(page.getByRole('heading', { name: /Gestión de Examen/ })).toBeVisible();
});
