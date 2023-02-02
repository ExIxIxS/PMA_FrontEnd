import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { MainPageComponent } from './main-page/main-page.component';
import { SigninPageComponent } from './signin-page/signin-page.component';
import { SignupPageComponent } from './signup-page/signup-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { BoardContentComponent } from './board-content/board-content.component';
import { EditUserComponent } from './edit-user/edit-user.component';

const routes: Routes = [
  { path: "main", component: MainPageComponent },
  { path: "signin", component: SigninPageComponent, title: 'Login' },
  { path: "signup", component: SignupPageComponent, title: 'Sign Up' },
  { path: "user", component: EditUserComponent, title: 'Edit User' },
  { path: "boards/:id", component: BoardContentComponent, title: 'Board`s workshop' },
  { path: "", pathMatch: 'full', component: WelcomePageComponent },
  { path: '**', component: PageNotFoundComponent, title: '404 Page Not Found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
