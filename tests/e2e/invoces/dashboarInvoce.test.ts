import { test, expect } from '@/fixture/ui-fixture';
import {DashboarPage, Status, statuses} from '@ui/DashboarInvocePage';



test.describe('Dashboard Invoce', () => {
  
    test.beforeEach(async ({ page }) => {
    await page.goto('/invoices');
  });


  test('SQ-X00: TC1: Search Invoce by invoce number successfully', async ({ InvocePage, page, LoginPage}) => {

    const invoiceNumber = "INV-2026-20378341444";

    await InvocePage.searchExistingInvoce(invoiceNumber);
    const records = await InvocePage.getInvoceRows()

    //  La factura es única, debe devolver un solo registro
    expect(records).toHaveLength(1);

     // Validar que ese registro corresponde a la factura buscada
    expect(records[0].Numero).toBe(invoiceNumber);

  });



  test('SQ-X00: TC2: Search Invoce by invoce number successfully', async ({ InvocePage }) => {

    const name = "Arka_Testing";

    await InvocePage.searchExistingInvoce(name);
    const records = await InvocePage.getInvoceRows()

    expect(records.length).toBeGreaterThan(0);

     // Validar que ese registro corresponde a la factura buscada
    for ( const invoce of records) {
    expect(invoce.clientE).toContain(name);
  }
  
});


  statuses.forEach(async (status) => {
  //for (const status of statuses) {
    test(`SQ-X00: TC2: filter invoce by status "${status}"`,  async ({ InvocePage }) => {

      await InvocePage.filterByStatus(status);
      const records = await InvocePage.getInvoceRows()
      // recorre todos los elementos del array y verifica si cumple, devuelve
      //array.every(elemento => condicion), every () Su función es comprobar si todos los elementos de un array cumplen una condición.
      expect(
        records.every(row => row.Estado === status)
      ).toBe(true);

  })



})

});


/*No es regla explícita de este repo (no encontré nada en eslint.config.js sobre esto), es una regla de JS que aplica siempre.

El problema real: forEach NO respeta await de callbacks async. Si el callback es async y hace await adentro, forEach dispara todas las iteraciones de una sola vez, sin esperar que termine la anterior. Puede generar race conditions o promesas sin manejar.

// PELIGROSO si el callback hiciera algo async antes de test()
statuses.forEach(async (status) => {
  await algoAsync(); // forEach NO espera esto, sigue a la próxima iteración YA
  test(`...`, async ({ ui }) => { ... });
});

// CORRECTO — for...of sí respeta await si hiciera falta
for (const status of statuses) {
  await algoAsync(); // esto SÍ bloquea la próxima vuelta
  test(`...`, async ({ ui }) => { ... });
}

En tu caso puntual no hay await en el cuerpo del loop (solo llamás test(), que es síncrono, registra el caso), entonces ahí mismo no rompería nada con forEach. Pero:

- for...of es el default seguro y universal, no importa si HOY el loop tiene await o no, evita el error si mañana agregás uno.
- for...of soporta break/continue si necesitás cortar el loop. forEach no.

Por eso, en un archivo de tests donde el patrón se repite en cientos de loops, conviene fijar for...of como estándar y no pensar caso por caso si hace falta o no. */

/* const statuses = [
  'Borrado',
  'Enviado',
  'Pagada',
  'Vencidad',
] as const ;

test.describe('Invoices', () => {

  test('crear invoice', async ({ page }) => {
    // ...
  });

  test('editar invoice', async ({ page }) => {
    // ...
  });

  statuses.forEach((status) => {

    test(`filtrar invoice por ${status}`, async ({ page }) => {
      // ...
    });

  });

  test('eliminar invoice', async ({ page }) => {
    // ...
  });

}); */