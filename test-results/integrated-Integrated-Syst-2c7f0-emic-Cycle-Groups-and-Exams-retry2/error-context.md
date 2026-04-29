# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: integrated.spec.js >> Integrated System Lifecycle >> Full Academic Cycle: Groups and Exams
- Location: tests\e2e\integrated.spec.js:11:5

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e6]:
      - img "ITL" [ref=e7]
      - img "TECNM" [ref=e8]
      - img "SEP" [ref=e9]
  - generic [ref=e12]:
    - generic [ref=e13]:
      - generic [ref=e14]: Correo
      - textbox "Correo" [ref=e15]: e2e-admin@correo.com
    - generic [ref=e16]:
      - generic [ref=e17]: Contraseña
      - textbox "Contraseña" [ref=e18]
    - generic [ref=e20]:
      - checkbox "Recuerdame" [ref=e21]
      - generic [ref=e22]: Recuerdame
    - generic [ref=e23]:
      - link "¿Olvidaste tu contraseña?" [ref=e24] [cursor=pointer]:
        - /url: http://127.0.0.1:8000/forgot-password
      - button "Iniciar Sesión" [ref=e25] [cursor=pointer]
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | export const adminEmail = 'e2e-admin@correo.com';
  4  | export const adminPassword = 'password';
  5  | 
  6  | export async function loginAsAdmin(page) {
  7  |     await page.goto('/login');
  8  |     await page.waitForLoadState('networkidle');
  9  | 
  10 |     await page.getByLabel('Correo').fill(adminEmail);
  11 |     await page.getByLabel('Contraseña').fill(adminPassword);
  12 |     
  13 |     await Promise.all([
> 14 |         page.waitForURL(/.*dashboard/, { timeout: 15000 }),
     |              ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  15 |         page.getByRole('button', { name: 'Iniciar Sesión' }).click(),
  16 |     ]);
  17 | 
  18 |     await expect(page.getByRole('heading', { name: 'Panel Principal' })).toBeVisible();
  19 | }
  20 | 
  21 | /**
  22 |  * Robust helper to select an option from a Radix UI Select component.
  23 |  */
  24 | export async function selectRadixOption(page, label, optionText) {
  25 |     // We search within the specific container or globally if not specified
  26 |     const trigger = page.getByLabel(label);
  27 |     await trigger.click();
  28 |     
  29 |     // Radix portals the content to the body, so we search globally for the option
  30 |     const option = page.getByRole('option', { name: optionText, exact: true });
  31 |     await option.waitFor({ state: 'visible', timeout: 5000 });
  32 |     await option.click({ force: true });
  33 |     
  34 |     // Ensure the dropdown is closed
  35 |     await expect(option).not.toBeVisible();
  36 | }
  37 | 
  38 | /**
  39 |  * Helper to wait for a success or error flash message (ModalAlert or Toast).
  40 |  */
  41 | export async function waitForFlashMessage(page, text) {
  42 |     const alert = page.getByText(text);
  43 |     await expect(alert).toBeVisible({ timeout: 10000 });
  44 | }
  45 | 
```