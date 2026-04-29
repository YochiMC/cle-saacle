import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './utils';

test.describe('Functional Validation Suite', () => {
    // Increase timeout for functional flows
    test.setTimeout(90000);

    test('Admin happy path: Create a new group', async ({ page }) => {
        await loginAsAdmin(page);

        await page.goto('/groups');
        await expect(page.getByRole('heading', { name: 'Catálogo de Grupos' })).toBeVisible();

        await page.getByRole('button', { name: 'Crear Grupo' }).click();
        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();

        const selectOption = async (label, optionText) => {
            await modal.getByLabel(label).click();
            const option = page.getByRole('option', { name: optionText, exact: true });
            await option.waitFor({ state: 'visible', timeout: 10000 });
            await option.click({ force: true });
            await expect(option).not.toBeVisible();
        };

        await selectOption('Modalidad', 'Presencial');
        await selectOption('Tipo', 'Regular');
        await modal.getByLabel('Capacidad (estudiantes)').fill('25');
        await selectOption('Estado', 'En Espera');
        await modal.getByLabel('Horario').fill('Lunes y Miercoles 16:00 - 18:00');
        await modal.getByLabel('Aula').fill('Aula E2E-101');

        // Select first available options for the rest
        const selects = ['Periodo', 'Nivel', 'Docente'];
        for (const label of selects) {
            await modal.getByLabel(label).click();
            await page.getByRole('option').first().click();
        }

        await modal.getByRole('button', { name: 'Guardar' }).click();
        await expect(page.getByText('Grupo creado exitosamente.')).toBeVisible();
    });

    test('Admin happy path: Create a new exam', async ({ page }) => {
        await loginAsAdmin(page);

        await page.goto('/exams');
        await expect(page.getByRole('heading', { name: 'Gestión de Exámenes' })).toBeVisible();

        await page.getByRole('button', { name: 'Crear Examen' }).click();
        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();

        const selectOption = async (label, optionText) => {
            await modal.getByLabel(label).click();
            const option = page.getByRole('option', { name: optionText, exact: true });
            await option.waitFor({ state: 'visible', timeout: 10000 });
            await option.click({ force: true });
            await expect(option).not.toBeVisible();
        };

        await selectOption('Tipo de Examen', 'Ubicación');
        await selectOption('Modalidad', 'Presencial');
        await selectOption('Estado del Examen', 'En Espera');

        await modal.getByLabel('Fecha de Inicio').fill('2026-12-01');
        await modal.getByLabel('Fecha de Fin').fill('2026-12-02');

        const selects = ['Periodo Escolar', 'Docente a cargo'];
        for (const label of selects) {
            await modal.getByLabel(label).click();
            await page.getByRole('option').first().click();
        }

        await modal.getByLabel('Cupo (Plazas)').fill('30');
        await modal.getByLabel('Aula / Link').fill('Aula E2E-EXAM');

        await modal.getByRole('button', { name: 'Guardar' }).click();
        await expect(page.getByText('Examen agregado correctamente.')).toBeVisible();
    });
});
