# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/invoces/dashboarInvoce.test.ts >> Dashboard Invoce >> SQ-X00: TC1: Search Invoce by invoce number successfully
- Location: tests/e2e/invoces/dashboarInvoce.test.ts:13:7

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 1
Received length: 0
Received array:  []
```

# Test source

```ts
  1   | import { test, expect } from '@/fixture/ui-fixture';
  2   | import {DashboarPage, Status, statuses} from '@ui/DashboarInvocePage';
  3   | 
  4   | 
  5   | 
  6   | test.describe('Dashboard Invoce', { tag: '@regression' }, () => {
  7   |   
  8   |     test.beforeEach(async ({ page }) => {
  9   |     await page.goto('/invoices');
  10  |   });
  11  | 
  12  | 
  13  |   test('SQ-X00: TC1: Search Invoce by invoce number successfully', async ({ InvocePage, page, LoginPage}) => {
  14  | 
  15  |     const invoiceNumber = "INV-2026-20378341444";
  16  | 
  17  |     await InvocePage.searchExistingInvoce(invoiceNumber);
  18  |     const records = await InvocePage.getInvoceRows()
  19  | 
  20  |     //  La factura es única, debe devolver un solo registro
> 21  |     expect(records).toHaveLength(1);
      |                     ^ Error: expect(received).toHaveLength(expected)
  22  | 
  23  |      // Validar que ese registro corresponde a la factura buscada
  24  |     expect(records[0].Numero).toBe(invoiceNumber);
  25  | 
  26  |   });
  27  | 
  28  | 
  29  | 
  30  |   test('SQ-X00: TC2: Search Invoce by invoce number successfully', async ({ InvocePage }) => {
  31  | 
  32  |     const name = "Arka_Testing";
  33  | 
  34  |     await InvocePage.searchExistingInvoce(name);
  35  |     const records = await InvocePage.getInvoceRows()
  36  | 
  37  |     expect(records.length).toBeGreaterThan(0);
  38  | 
  39  |      // Validar que ese registro corresponde a la factura buscada
  40  |     for ( const invoce of records) {
  41  |     expect(invoce.clientE).toContain(name);
  42  |   }
  43  |   
  44  | });
  45  | 
  46  | 
  47  |   statuses.forEach(async (status) => {
  48  |   //for (const status of statuses) {
  49  |     test(`SQ-X00: TC2: filter invoce by status "${status}"`,  async ({ InvocePage }) => {
  50  | 
  51  |       await InvocePage.filterByStatus(status);
  52  |       const records = await InvocePage.getInvoceRows()
  53  |       // recorre todos los elementos del array y verifica si cumple, devuelve
  54  |       //array.every(elemento => condicion), every () Su función es comprobar si todos los elementos de un array cumplen una condición.
  55  |       expect(
  56  |         records.every(row => row.Estado === status)
  57  |       ).toBe(true);
  58  | 
  59  |   })
  60  | 
  61  | 
  62  | 
  63  | })
  64  | 
  65  | });
  66  | 
  67  | 
  68  | /*No es regla explícita de este repo (no encontré nada en eslint.config.js sobre esto), es una regla de JS que aplica siempre.
  69  | 
  70  | El problema real: forEach NO respeta await de callbacks async. Si el callback es async y hace await adentro, forEach dispara todas las iteraciones de una sola vez, sin esperar que termine la anterior. Puede generar race conditions o promesas sin manejar.
  71  | 
  72  | // PELIGROSO si el callback hiciera algo async antes de test()
  73  | statuses.forEach(async (status) => {
  74  |   await algoAsync(); // forEach NO espera esto, sigue a la próxima iteración YA
  75  |   test(`...`, async ({ ui }) => { ... });
  76  | });
  77  | 
  78  | // CORRECTO — for...of sí respeta await si hiciera falta
  79  | for (const status of statuses) {
  80  |   await algoAsync(); // esto SÍ bloquea la próxima vuelta
  81  |   test(`...`, async ({ ui }) => { ... });
  82  | }
  83  | 
  84  | En tu caso puntual no hay await en el cuerpo del loop (solo llamás test(), que es síncrono, registra el caso), entonces ahí mismo no rompería nada con forEach. Pero:
  85  | 
  86  | - for...of es el default seguro y universal, no importa si HOY el loop tiene await o no, evita el error si mañana agregás uno.
  87  | - for...of soporta break/continue si necesitás cortar el loop. forEach no.
  88  | 
  89  | Por eso, en un archivo de tests donde el patrón se repite en cientos de loops, conviene fijar for...of como estándar y no pensar caso por caso si hace falta o no. */
  90  | 
  91  | /* const statuses = [
  92  |   'Borrado',
  93  |   'Enviado',
  94  |   'Pagada',
  95  |   'Vencidad',
  96  | ] as const ;
  97  | 
  98  | test.describe('Invoices', () => {
  99  | 
  100 |   test('crear invoice', async ({ page }) => {
  101 |     // ...
  102 |   });
  103 | 
  104 |   test('editar invoice', async ({ page }) => {
  105 |     // ...
  106 |   });
  107 | 
  108 |   statuses.forEach((status) => {
  109 | 
  110 |     test(`filtrar invoice por ${status}`, async ({ page }) => {
  111 |       // ...
  112 |     });
  113 | 
  114 |   });
  115 | 
  116 |   test('eliminar invoice', async ({ page }) => {
  117 |     // ...
  118 |   });
  119 | 
  120 | }); */
```