

import { test, expect } from '@playwright/test';
import DataFactory from "@DataFactory"
import {CreateUser} from "@/tests/components/ui/CreateUserPage"




test.describe ('OTFX-001: Create Client', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://staging-upexsoloq.vercel.app/login');
  });

    test('TC1 Login exitoso', async ({ page }) => {

      //preparacion de datos
      const userCredential =DataFactory.createCredentials

      //acciones



      



        
       
        });

});

