import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './utils';

test.describe('Integrated System Lifecycle', () => {
    test.setTimeout(180000);

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('Full Academic Cycle: Groups and Exams', async ({ page }) => {
        // 1. Create Group
        await page.goto('/groups');
        await page.getByRole('button', { name: 'Crear Grupo' }).click();
        
        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();

        const selectByLabel = async (label, value) => {
            const trigger = modal.getByLabel(label);
            await trigger.click({ force: true });
            const option = page.getByRole('option', { name: value, exact: true });
            await option.waitFor({ state: 'visible' });
            await option.click({ force: true });
        };

        const selectById = async (id) => {
            const trigger = modal.locator(`#${id}`);
            await trigger.click({ force: true });
            const option = page.getByRole('option').first();
            await option.waitFor({ state: 'visible' });
            await option.click({ force: true });
        };

        await selectByLabel('Modalidad', 'Presencial');
        await selectByLabel('Tipo', 'Regular');
        await modal.getByLabel('Capacidad (estudiantes)').fill('15');
        await selectByLabel('Estado', 'En Espera');
        await modal.getByLabel('Horario').fill('Mon-Fri 8-10');
        await modal.getByLabel('Aula').fill('Room 101');
        
        await selectById('period_id');
        await selectById('level_id');
        await selectById('teacher_id');

        await modal.getByRole('button', { name: 'Guardar' }).click();
        await expect(page.getByText('Grupo creado exitosamente.')).toBeVisible();

        // 2. Enroll Student in Group
        const groupCard = page.locator('div').filter({ hasText: 'Room 101' }).first();
        await groupCard.getByRole('button', { name: 'Ver Detalles' }).click();
        await page.getByRole('button', { name: 'Registrar Nuevo' }).click();
        
        const enrollModal = page.getByRole('dialog').filter({ hasText: 'Inscribir Alumnos' });
        await enrollModal.getByPlaceholder('Buscar por nombre o matrícula...').fill('E2E Student');
        await enrollModal.getByLabel('E2E Student').click();
        await enrollModal.getByRole('button', { name: 'Inscribir Seleccionados' }).click();
        await expect(page.getByText('Inscripción exitosa')).toBeVisible();

        // 3. Create Exam
        await page.goto('/exams');
        await page.getByRole('button', { name: 'Crear Examen' }).click();
        
        const examModal = page.getByRole('dialog');
        const selectExamByLabel = async (label, value) => {
            await examModal.getByLabel(label).click({ force: true });
            const option = page.getByRole('option', { name: value, exact: true });
            await option.waitFor({ state: 'visible' });
            await option.click({ force: true });
        };

        await selectExamByLabel('Tipo de Examen', 'Ubicación');
        await selectExamByLabel('Modalidad', 'Presencial');
        await selectExamByLabel('Estado del Examen', 'En Espera');
        await examModal.getByLabel('Fecha de Inicio').fill('2026-12-15');
        await examModal.getByLabel('Fecha de Fin').fill('2026-12-16');
        
        await examModal.locator('#period_id').click({ force: true });
        await page.getByRole('option').first().click();
        
        await examModal.getByLabel('Cupo (Plazas)').fill('15');
        await examModal.getByLabel('Aula / Link').fill('Exam Room 202');
        
        await examModal.locator('#teacher_id').click({ force: true });
        await page.getByRole('option').first().click();

        await examModal.getByRole('button', { name: 'Guardar' }).click();
        await expect(page.getByText('Examen agregado correctamente.')).toBeVisible();

        // 4. Enroll Student in Exam
        const examCard = page.locator('div').filter({ hasText: 'Exam Room 202' }).first();
        await examCard.getByRole('button', { name: 'Ver Detalles' }).click();
        await page.getByRole('button', { name: 'Registrar Nuevo' }).click();
        await page.getByPlaceholder('Buscar por nombre o matrícula...').fill('E2E Student');
        await page.getByLabel('E2E Student').click();
        await page.getByRole('button', { name: 'Inscribir Seleccionados' }).click();
        await expect(page.getByText('Alumnos inscritos al examen.')).toBeVisible();
    });
});
