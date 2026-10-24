import { test as base } from '@playwright/test';

import { DashboarPage } from '@/components/ui/DashboarInvocePage';
import { LoginPage } from '@/components/ui/LoginPage';

type UIFixtures = {
  InvocePage: DashboarPage;
  LoginPage:LoginPage

};

export const test = base.extend<UIFixtures>({

  InvocePage: async ({ page }, use) => {
        //const invoce = new DashboarInvocePage(page)
        // await use(invoce)
    await use(new DashboarPage(page));
    // 
    //
    //
    //

  },
  LoginPage: async ({ page }, use) => {
    //const invoce = new DashboarInvocePage(page)
    // await use(invoce)
     // 1 · SETUP (antes del test)
     const login = new LoginPage(page);
    //await login.goto(); esto creo que deberia ponerlo aca 

    // 2 · entregar al test
    await use(login);

    // 3 · TEARDOWN (después del test)
    await page.close();
},
});

export { expect } from '@playwright/test';