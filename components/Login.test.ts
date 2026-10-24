

import { test, expect }  from '@/fixture/ui-fixture';
import testData from "@/data/testData.json"
import{config} from '@variables'




test.describe ('OTFX-001: Login', () => {



    test('TC1 Successful login with invalid credentials', async ({ LoginPage , page}) => {

      //preparacion de datos
      const Credential =testData.usuarioValido
      
      //acciones
      

      await page.goto('')

      await LoginPage.loginSuccessfully(config.testUser)

      //await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });

      //await expect(page).not.toHaveURL(/.*\/login.*/)
      //Esperá hasta que la URL contenga /dashboard

      //validaciones 
      await expect(page).toHaveURL(/.*\/dashboard.*/) //la carpeta donde Playwright guarda los archivos que genera mientras ejecuta los tests.
 


    });

});

