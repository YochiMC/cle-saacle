import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './utils';

test.describe('Exams Management Functional Path', () => {
    test('admin can create a new location exam', async ({ page }) => {
        await loginAsAdmin(page);

        await page.goto('/exams');
        await expect(page.getByRole('heading', { name: 'Gestión de Exámenes' })).toBeVisible();

        await page.getByRole('button', { name: 'Crear Examen' }).click();

        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();

        // Refined interaction for Radix UI Selects
        const selectOption = async (label, optionText) => {
            // Click the trigger by label
            await modal.getByLabel(label).click();
            // Wait for any option to appear in the portal
            const option = page.getByRole('option', { name: optionText, exact: true });
            await option.waitFor({ state: 'visible', timeout: 5000 });
            await option.click({ force: true });
            // Wait for it to close
            await expect(option).not.toBeVisible();
        };

        await selectOption('Tipo de Examen', 'Ubicación');
        await selectOption('Modalidad', 'Presencial');
        await selectOption('Estado del Examen', 'En Espera');

        await modal.getByLabel('Fecha de Inicio').fill('2026-12-01');
        await modal.getByLabel('Fecha de Fin').fill('2026-12-02');

        await modal.getByLabel('Periodo Escolar').click();
        await page.getByRole('option').first().click();

        await modal.getByLabel('Cupo (Plazas)').fill('30');
        await modal.getByLabel('Aula / Link').fill('Aula E2E-EXAM');

        await modal.getByLabel('Docente a cargo').click();
        await page.getByRole('option').first().click();

        await modal.getByRole('button', { name: 'Guardar' }).click();

        await expect(page.getByText('Examen agregado correctamente.')).toBeVisible();
    });
});
