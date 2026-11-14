import  {Page, Locator, expect} from "@playwright/test"


// ============================================
// Types
// ============================================


export interface InvoiceRow {

    Numero: string;
    clientE: string;
    Estado: string;
    Total: string;
    Fecha: string;
    Vencimiento: string;
}

export const statuses = ['Borrado', 'Enviado', 'Pagada', 'Vencida'] as const;
export type Status = (typeof statuses)[number];

// ============================================
// Implementation
// ============================================

export class DashboarPage {


  // mapping interno, nadie de afuera lo necesita → NO se exporta
    private readonly statusMap: Record<Status, string> = {
      Borrado: 'deleted',
      Enviado: 'sent',
      Pagada: 'paid',
      Vencida: 'expired',
    };

    readonly page: Page  
   
    noFoundClients:Locator
    rows:Locator
    tableInput:Locator



    constructor(page:Page) {
        this.page= page
        
        //private readonly  this.tableInput = () => this.page.getByRole('table');  // declaración + valor, todo junto
        this.tableInput =  this.page.getByRole('table');
        this.noFoundClients = this.page.getByText('No se encontraron clientes');
        this.rows= this.tableInput.locator('tbody').getByRole("row")
      
  }

  /* Buena duda, aclaro. Sí están declaradas — solo que en UNA línea en vez de dos, porque cambia la forma.

Tu patrón original (2 pasos, tipo Locator fijo):

class DashboarPage {
  tableInput: Locator;              // PASO 1: declarás el tipo, vacío

  constructor(page: Page) {
    this.tableInput = this.page.getByRole('table');  // PASO 2: lo asignás después
  }
}

Patrón KATA (1 paso, es una función, no un Locator fijo):

class DashboardPage extends UiBase {
  private readonly table = () => this.page.getByRole('table');  // declaración + valor, todo junto
}

Esa línea sola YA declara la propiedad table Y le da su valor. No hace falta un segundo paso en el constructor porque en TypeScript, cuando escribís propiedad = valor directo en el cuerpo de la clase (sin estar dentro de un método), eso se ejecuta automático apenas se crea el objeto — es sintaxis de class field, no necesitás repetirlo en constructor.

Por qué no le puse : Locator como tipo explícito: porque table no ES un Locator, es una FUNCIÓN que cuando la LLAMÁS (this.table()) te devuelve un Locator. TypeScript infiere solo el tipo (() => Locator) a partir del valor que le diste, no hace falta escribirlo a mano.

Por qué función y no Locator directo (tu forma original):

// Tu forma: guarda el Locator ya resuelto UNA vez
tableInput: Locator;
this.tableInput = this.page.getByRole('table');
// uso: this.tableInput

// KATA: guarda una función que resuelve el Locator CADA VEZ que la llamás
private readonly table = () => this.page.getByRole('table');
// uso: this.table()   ← con paréntesis, porque es una función

Diferencia práctica: con la función, cada this.table() vuelve a buscar el elemento fresco en la página en ese momento. Con el Locator guardado fijo, se resuelve una sola vez al construir la clase — funciona igual en la mayoría de los casos porque Playwright re-resuelve solo, pero KATA fija la convención de función flecha para todos los locators compartidos, así es consistente en todo el código.

Resumen: no falta declaración, es que declaración + valor van en la MISMA línea, y el tipo se infiere solo porque ahora es una función, no un Locator.
 */


  //La razón principal es separación de responsabilidades. En un diseño mantenible de automatización, el Page Object (POM) o Component Object Model (COM) representa cómo interactúas con la aplicación, mientras que el test representa qué quieres comprobar.

//No es que esté "prohibido" poner validaciones dentro del POM/COM, pero normalmente se evita porque genera problemas de mantenimiento.

  async searchInvoce(searchValue:string) {

    const searchBarInput =  this.page.getByTestId('invoice-search-input');
    //const interceptionEndpoint = await  this.page.waitForResponse(response  => response.url().includes("api/invoices"))
    //Playwright, quédate escuchando todas las respuestas HTTP. Cuando llegue una respuesta cuya URL contenga /api/invoices y además tenga estado 200, guárdala para que yo pueda obtenerla más adelante con await responsePromise.
    //Empieza a escuchar la respuesta antes de realizar la acción
    // Match only the search request: other calls also contain '/api/invoices'
    // (initial load, '/api/invoices/dashboard') and would resolve this wait too early
    const responsePromise = this.page.waitForResponse(response =>
      response.url().includes('/api/invoices?search=')
      && response.url().includes(encodeURIComponent(searchValue))
      && response.status() === 200);
    // Esta acción dispara la petición al backend
    await searchBarInput.fill(searchValue)
    // Espera a que la promesa responsePromise termine.
    // await dice Quédate aquí hasta que esa promesa se resuelva.
    const response = await responsePromise;
    const body = await response.json();
    const invoces= body.data as [];
    return invoces
  }


  async searchExistingInvoce(searchValue: string) {
    const invoces = await this.searchInvoce(searchValue);
    // Wait until the table re-renders with the search result before anyone reads the rows
    await expect(this.rows.first()).toContainText(searchValue);
    return invoces;
  }


  // Con estopy indicando qué tipo de dato va a devolver esa función cuando termine
  async getInvoceRows() : Promise<InvoiceRow[]> {
      const rowCount = await this.rows.count()
       //Esto declara una lista (array) vacía que va a guardar objetos de tipo Invoice.
      const invoces: InvoiceRow[] = []

      for (let index=0; index<rowCount; index++) {

        const cells= this.rows.nth(index).getByRole("cell");

        const invoce:InvoiceRow = {
          Numero: await this.getCellText(cells, 0),
          clientE: await this.getCellText(cells, 1),
          Estado: await this.getCellText(cells, 2),
          Total: await this.getCellText(cells, 3),
          Fecha: await this.getCellText(cells, 4),
          Vencimiento: await this.getCellText(cells, 5)
        }

        invoces.push(invoce)

        }

      return invoces

    }


  async getCellText(cells: Locator, index: number): Promise<string> {

    return (await cells.nth(index).innerText()).trim();

  }


  async filterByStatus(estado: Status ): Promise<void> {
    const statusApi = this.statusMap[estado];
    const responsePromise =  this.page.waitForResponse(resp => resp.url().includes(`/invoices?status=${statusApi}`) && resp.status() === 200);
    await this.page.getByRole('button', { name: estado}).click()
    //No continúes hasta que llegue esa respuesta.
    await responsePromise
  }


  /* await Promise.all([
  this.page.waitForResponse(
    resp =>
      resp.url().includes('/users') &&
      resp.status() === 200
  ),

  this.page.getByTestId('search-button').click(),
]);

Esperá hasta que todas estas Promises terminen."

"Esperá simultáneamente la respuesta y el click; el Promise.all termina cuando ambos terminaron."

Promise.all() sirve para esperar varias Promises al mismo tiempo.

await Promise.all([
  promise1,
  promise2,
  promise3
]);



*/




  /* export class InvoicesTablePage extends UiBase {
  constructor(options: TestContextOptions) { super(options); }

  @atc('TICKET-ID')
  async filterByStatus(status: 'deleted' | 'sent' | 'paid'): Promise<void> {
    await this.page.locator(`[data-testid="filter-btn-${status}"]`).click();
    await this.page.waitForResponse(resp => resp.url().includes('/invoices') && resp.status() === 200);
  }

  async getAllRowStatuses(): Promise<string[]> {
    return this.page.locator('[data-testid="row-status"]').allTextContents();
  }
}

Test, mismo loop:

const statuses = ['deleted', 'sent', 'paid'] as const;

test.describe('TICKET-ID: Filter invoices table by status button', () => {
  for (const status of statuses) {
    test(`TICKET-ID: should show only "${status}" rows when clicking ${status} filter button`, async ({ ui }) => {
      await ui.invoicesTable.filterByStatus(status);
      const rowStatuses = await ui.invoicesTable.getAllRowStatuses();
      expect(rowStatuses.every(s => s === status)).toBe(true);
    });
  }
}); */

}
