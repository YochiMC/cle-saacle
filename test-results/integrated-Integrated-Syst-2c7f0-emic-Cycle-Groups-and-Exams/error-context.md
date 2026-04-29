# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: integrated.spec.js >> Integrated System Lifecycle >> Full Academic Cycle: Groups and Exams
- Location: tests\e2e\integrated.spec.js:11:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Grupo creado exitosamente.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Grupo creado exitosamente.')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - navigation [ref=e4]:
      - generic [ref=e6]:
        - link [ref=e9] [cursor=pointer]:
          - /url: /
          - img [ref=e10]
        - generic [ref=e12]:
          - link "Dashboard" [ref=e13] [cursor=pointer]:
            - /url: http://127.0.0.1:8000/dashboard
          - link "Usuarios" [ref=e14] [cursor=pointer]:
            - /url: http://127.0.0.1:8000/users
          - link "Grupos" [ref=e15] [cursor=pointer]:
            - /url: http://127.0.0.1:8000/groups
          - link "Reportes" [ref=e16] [cursor=pointer]:
            - /url: http://127.0.0.1:8000/reports
          - link "Acreditaciones" [ref=e17] [cursor=pointer]:
            - /url: http://127.0.0.1:8000/acreditaciones
          - link "Exámenes" [ref=e18] [cursor=pointer]:
            - /url: http://127.0.0.1:8000/exams
          - link "Configuraciones" [ref=e19] [cursor=pointer]:
            - /url: http://127.0.0.1:8000/settings
          - link "Catálogos" [ref=e20] [cursor=pointer]:
            - /url: http://127.0.0.1:8000/settings/catalogs
          - link "Pagos" [ref=e21] [cursor=pointer]:
            - /url: http://127.0.0.1:8000/pagos
        - button "E2E Admin" [ref=e27] [cursor=pointer]:
          - text: E2E Admin
          - img [ref=e28]
    - banner [ref=e30]:
      - heading "Catálogo de Grupos" [level=2] [ref=e32]
    - main [ref=e33]:
      - generic [ref=e35]:
        - button "Crear Grupo" [ref=e37] [cursor=pointer]:
          - img
          - text: Crear Grupo
        - generic [ref=e38]:
          - generic [ref=e40]:
            - generic:
              - img
            - textbox "Buscar grupo, docente, horario o alumno..." [ref=e41]
          - generic [ref=e42]:
            - generic [ref=e43]:
              - img
              - combobox "Filtrar por estado" [ref=e44] [cursor=pointer]:
                - option "Todos los estados" [selected]
                - option "Inscripciones Abiertas"
                - option "En Espera"
                - option "Activo"
                - option "En Evaluación"
                - option "Completado"
              - img
            - generic [ref=e45]:
              - img
              - combobox "Filtrar por nivel" [ref=e46] [cursor=pointer]:
                - option "Todos los niveles" [selected]
                - option "Básico 1-test-1"
              - img
            - generic [ref=e47]:
              - img
              - combobox "Ordenar por disponibilidad" [ref=e48] [cursor=pointer]:
                - 'option "Orden: Por defecto" [selected]'
                - 'option "Disponibilidad: Alta a Baja"'
                - 'option "Disponibilidad: Baja a Alta"'
              - img
          - generic [ref=e49]: 4 Grupos encontrados
        - generic [ref=e51]:
          - generic [ref=e52]:
            - generic [ref=e54]:
              - generic [ref=e55]:
                - checkbox [ref=e57] [cursor=pointer]
                - generic "Básico 1-test-1" [ref=e58]: B1
              - generic [ref=e59]: Activo
            - generic [ref=e60]:
              - heading "GRP-2753" [level=3] [ref=e62]
              - generic [ref=e64]:
                - generic [ref=e65]:
                  - generic [ref=e66]:
                    - img [ref=e67]
                    - generic [ref=e71]: "Docente:"
                  - generic [ref=e72]: Cory Feest Konopelski
                - generic [ref=e73]:
                  - generic [ref=e74]: "Horario:"
                  - generic [ref=e75]: Viernes 14:00 - 18:00
                - generic [ref=e76]:
                  - generic [ref=e77]: "Modalidad:"
                  - generic [ref=e78]: Virtual
                - generic [ref=e79]:
                  - generic [ref=e80]:
                    - img [ref=e81]
                    - generic [ref=e86]: Cupo
                  - generic [ref=e88]:
                    - text: "0"
                    - generic [ref=e89]: / 22
              - generic [ref=e91]:
                - button "Editar" [ref=e92] [cursor=pointer]
                - link "Abrir Grupo" [ref=e93] [cursor=pointer]:
                  - /url: http://127.0.0.1:8000/groups/1/detalles
                  - img [ref=e94]
                  - text: Abrir Grupo
                - button "Ver Detalles" [ref=e98] [cursor=pointer]
          - generic [ref=e99]:
            - generic [ref=e101]:
              - generic [ref=e102]:
                - checkbox [ref=e104] [cursor=pointer]
                - generic "Básico 1-test-1" [ref=e105]: B1
              - generic [ref=e106]: En Espera
            - generic [ref=e107]:
              - heading "RB100IAGO26P" [level=3] [ref=e109]
              - generic [ref=e111]:
                - generic [ref=e112]:
                  - generic [ref=e113]:
                    - img [ref=e114]
                    - generic [ref=e118]: "Docente:"
                  - generic [ref=e119]: Docente por asignar
                - generic [ref=e120]:
                  - generic [ref=e121]: "Horario:"
                  - generic [ref=e122]: Lunes y Miercoles 16:00 - 18:00
                - generic [ref=e123]:
                  - generic [ref=e124]: "Modalidad:"
                  - generic [ref=e125]: Presencial
                - generic [ref=e126]:
                  - generic [ref=e127]:
                    - img [ref=e128]
                    - generic [ref=e133]: Cupo
                  - generic [ref=e135]:
                    - text: "0"
                    - generic [ref=e136]: / 25
              - generic [ref=e138]:
                - button "Editar" [ref=e139] [cursor=pointer]
                - link "Abrir Grupo" [ref=e140] [cursor=pointer]:
                  - /url: http://127.0.0.1:8000/groups/2/detalles
                  - img [ref=e141]
                  - text: Abrir Grupo
                - button "Ver Detalles" [ref=e145] [cursor=pointer]
          - generic [ref=e146]:
            - generic [ref=e148]:
              - generic [ref=e149]:
                - checkbox [ref=e151] [cursor=pointer]
                - generic "Básico 1-test-1" [ref=e152]: B1
              - generic [ref=e153]: En Espera
            - generic [ref=e154]:
              - heading "RB100IAGO26P" [level=3] [ref=e156]
              - generic [ref=e158]:
                - generic [ref=e159]:
                  - generic [ref=e160]:
                    - img [ref=e161]
                    - generic [ref=e165]: "Docente:"
                  - generic [ref=e166]: Docente por asignar
                - generic [ref=e167]:
                  - generic [ref=e168]: "Horario:"
                  - generic [ref=e169]: Lunes y Miercoles 16:00 - 18:00
                - generic [ref=e170]:
                  - generic [ref=e171]: "Modalidad:"
                  - generic [ref=e172]: Presencial
                - generic [ref=e173]:
                  - generic [ref=e174]:
                    - img [ref=e175]
                    - generic [ref=e180]: Cupo
                  - generic [ref=e182]:
                    - text: "0"
                    - generic [ref=e183]: / 25
              - generic [ref=e185]:
                - button "Editar" [ref=e186] [cursor=pointer]
                - link "Abrir Grupo" [ref=e187] [cursor=pointer]:
                  - /url: http://127.0.0.1:8000/groups/3/detalles
                  - img [ref=e188]
                  - text: Abrir Grupo
                - button "Ver Detalles" [ref=e192] [cursor=pointer]
          - generic [ref=e193]:
            - generic [ref=e195]:
              - generic [ref=e196]:
                - checkbox [ref=e198] [cursor=pointer]
                - generic "Básico 1-test-1" [ref=e199]: B1
              - generic [ref=e200]: En Espera
            - generic [ref=e201]:
              - heading "RB100ZAGO26P" [level=3] [ref=e203]
              - generic [ref=e205]:
                - generic [ref=e206]:
                  - generic [ref=e207]:
                    - img [ref=e208]
                    - generic [ref=e212]: "Docente:"
                  - generic [ref=e213]: Docente por asignar
                - generic [ref=e214]:
                  - generic [ref=e215]: "Horario:"
                  - generic [ref=e216]: Mon-Fri 8-10
                - generic [ref=e217]:
                  - generic [ref=e218]: "Modalidad:"
                  - generic [ref=e219]: Presencial
                - generic [ref=e220]:
                  - generic [ref=e221]:
                    - img [ref=e222]
                    - generic [ref=e227]: Cupo
                  - generic [ref=e229]:
                    - text: "0"
                    - generic [ref=e230]: / 15
              - generic [ref=e232]:
                - button "Editar" [ref=e233] [cursor=pointer]
                - link "Abrir Grupo" [ref=e234] [cursor=pointer]:
                  - /url: http://127.0.0.1:8000/groups/4/detalles
                  - img [ref=e235]
                  - text: Abrir Grupo
                - button "Ver Detalles" [ref=e239] [cursor=pointer]
  - dialog [active] [ref=e240]:
    - generic [ref=e243]:
      - heading "¡Operación exitosa!" [level=3] [ref=e244]
      - generic [ref=e245]: ✓
      - paragraph [ref=e246]: Grupo creado exitosamente.
      - button "OK" [ref=e247] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { loginAsAdmin } from './utils';
  3   | 
  4   | test.describe('Integrated System Lifecycle', () => {
  5   |     test.setTimeout(180000);
  6   | 
  7   |     test.beforeEach(async ({ page }) => {
  8   |         await loginAsAdmin(page);
  9   |     });
  10  | 
  11  |     test('Full Academic Cycle: Groups and Exams', async ({ page }) => {
  12  |         // 1. Create Group
  13  |         await page.goto('/groups');
  14  |         await page.getByRole('button', { name: 'Crear Grupo' }).click();
  15  |         
  16  |         const modal = page.getByRole('dialog');
  17  |         await expect(modal).toBeVisible();
  18  | 
  19  |         const selectByLabel = async (label, value) => {
  20  |             const trigger = modal.getByLabel(label);
  21  |             await trigger.click({ force: true });
  22  |             const option = page.getByRole('option', { name: value, exact: true });
  23  |             await option.waitFor({ state: 'visible' });
  24  |             await option.click({ force: true });
  25  |         };
  26  | 
  27  |         const selectById = async (id) => {
  28  |             const trigger = modal.locator(`#${id}`);
  29  |             await trigger.click({ force: true });
  30  |             const option = page.getByRole('option').first();
  31  |             await option.waitFor({ state: 'visible' });
  32  |             await option.click({ force: true });
  33  |         };
  34  | 
  35  |         await selectByLabel('Modalidad', 'Presencial');
  36  |         await selectByLabel('Tipo', 'Regular');
  37  |         await modal.getByLabel('Capacidad (estudiantes)').fill('15');
  38  |         await selectByLabel('Estado', 'En Espera');
  39  |         await modal.getByLabel('Horario').fill('Mon-Fri 8-10');
  40  |         await modal.getByLabel('Aula').fill('Room 101');
  41  |         
  42  |         await selectById('period_id');
  43  |         await selectById('level_id');
  44  |         await selectById('teacher_id');
  45  | 
  46  |         await modal.getByRole('button', { name: 'Guardar' }).click();
> 47  |         await expect(page.getByText('Grupo creado exitosamente.')).toBeVisible();
      |                                                                    ^ Error: expect(locator).toBeVisible() failed
  48  | 
  49  |         // 2. Enroll Student in Group
  50  |         const groupCard = page.locator('div').filter({ hasText: 'Room 101' }).first();
  51  |         await groupCard.getByRole('button', { name: 'Ver Detalles' }).click();
  52  |         await page.getByRole('button', { name: 'Registrar Nuevo' }).click();
  53  |         
  54  |         const enrollModal = page.getByRole('dialog').filter({ hasText: 'Inscribir Alumnos' });
  55  |         await enrollModal.getByPlaceholder('Buscar por nombre o matrícula...').fill('E2E Student');
  56  |         await enrollModal.getByLabel('E2E Student').click();
  57  |         await enrollModal.getByRole('button', { name: 'Inscribir Seleccionados' }).click();
  58  |         await expect(page.getByText('Inscripción exitosa')).toBeVisible();
  59  | 
  60  |         // 3. Create Exam
  61  |         await page.goto('/exams');
  62  |         await page.getByRole('button', { name: 'Crear Examen' }).click();
  63  |         
  64  |         const examModal = page.getByRole('dialog');
  65  |         const selectExamByLabel = async (label, value) => {
  66  |             await examModal.getByLabel(label).click({ force: true });
  67  |             const option = page.getByRole('option', { name: value, exact: true });
  68  |             await option.waitFor({ state: 'visible' });
  69  |             await option.click({ force: true });
  70  |         };
  71  | 
  72  |         await selectExamByLabel('Tipo de Examen', 'Ubicación');
  73  |         await selectExamByLabel('Modalidad', 'Presencial');
  74  |         await selectExamByLabel('Estado del Examen', 'En Espera');
  75  |         await examModal.getByLabel('Fecha de Inicio').fill('2026-12-15');
  76  |         await examModal.getByLabel('Fecha de Fin').fill('2026-12-16');
  77  |         
  78  |         await examModal.locator('#period_id').click({ force: true });
  79  |         await page.getByRole('option').first().click();
  80  |         
  81  |         await examModal.getByLabel('Cupo (Plazas)').fill('15');
  82  |         await examModal.getByLabel('Aula / Link').fill('Exam Room 202');
  83  |         
  84  |         await examModal.locator('#teacher_id').click({ force: true });
  85  |         await page.getByRole('option').first().click();
  86  | 
  87  |         await examModal.getByRole('button', { name: 'Guardar' }).click();
  88  |         await expect(page.getByText('Examen agregado correctamente.')).toBeVisible();
  89  | 
  90  |         // 4. Enroll Student in Exam
  91  |         const examCard = page.locator('div').filter({ hasText: 'Exam Room 202' }).first();
  92  |         await examCard.getByRole('button', { name: 'Ver Detalles' }).click();
  93  |         await page.getByRole('button', { name: 'Registrar Nuevo' }).click();
  94  |         await page.getByPlaceholder('Buscar por nombre o matrícula...').fill('E2E Student');
  95  |         await page.getByLabel('E2E Student').click();
  96  |         await page.getByRole('button', { name: 'Inscribir Seleccionados' }).click();
  97  |         await expect(page.getByText('Alumnos inscritos al examen.')).toBeVisible();
  98  |     });
  99  | });
  100 | 
```