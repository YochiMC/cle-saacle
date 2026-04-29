import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './utils';

test.describe('Groups Management Functional Path', () => {
    test('admin can create a new regular group', async ({ page }) => {
        await loginAsAdmin(page);

        await page.goto('/groups');
        await expect(page.getByRole('heading', { name: 'Catálogo de Grupos' })).toBeVisible();

        await page.getByRole('button', { name: 'Crear Grupo' }).click();

        // Wait for modal
        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();
        await expect(modal.getByText('Añadir Nuevo Grupo')).toBeVisible();

        const selectOption = async (label, optionText) => {
            await modal.getByLabel(label).click();
            await page.getByRole('option', { name: optionText, exact: true }).click();
        };

        // Modalidad: Presencial
        await selectOption('Modalidad', 'Presencial');

        // Tipo: Regular
        await selectOption('Tipo', 'Regular');

        // Capacidad
        await modal.getByLabel('Capacidad (estudiantes)').fill('25');

        // Estado: En Espera
        await selectOption('Estado', 'En Espera');

        // Horario
        await modal.getByLabel('Horario').fill('Lunes y Miercoles 16:00 - 18:00');

        // Aula
        await modal.getByLabel('Aula').fill('Aula E2E-101');

        // Periodo
        await modal.getByLabel('Periodo').click();
        await page.getByRole('option').first().click();

        // Nivel
        await modal.getByLabel('Nivel').click();
        await page.getByRole('option').first().click();

        // Docente
        await modal.getByLabel('Docente').click();
        await page.getByRole('option').first().click();

        // Guardar
        await modal.getByRole('button', { name: 'Guardar' }).click();

        // Verificación
        await expect(page.getByText('Grupo creado exitosamente.')).toBeVisible();
    });
});
