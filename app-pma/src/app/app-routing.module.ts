import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { MainPageComponent } from './main-page/main-page.component';
import { SigninPageComponent } from './signin-page/signin-page.component';
import { SignupPageComponent } from './signup-page/signup-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  { path: "main", component: MainPageComponent },
  { path: "signin", component: SigninPageComponent, title: 'Login' },
  { path: "signup", component: SignupPageComponent, title: 'Sign Up' },
  { path: "", pathMatch: 'full', component: WelcomePageComponent },
  { path: '**', component: PageNotFoundComponent, title: '404 Page Not Found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
