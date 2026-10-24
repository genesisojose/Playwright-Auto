import type { Page } from '@playwright/test';
import {TestCredentials} from '@/data/types'


export class LoginPage {
  
  readonly page:Page

  constructor(page:Page) {
    this.page= page
  }

 
  async loginSuccessfully(credenciales: TestCredentials) : Promise<void>{
    await this.page.getByTestId("login-email-input").fill(credenciales.email);
    await this.page.getByTestId("login-password-input").fill(credenciales.password);
    await this.page.getByRole("button", { name: "Iniciar Sesión" }).click();
  }

/* 
  async gotoUrl(url:string) {
    await this.page.goto(url)
  
  } */


}
