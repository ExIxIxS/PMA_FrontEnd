import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Location } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MaterialModule } from './material.module';

import { RestDataService } from './services/restAPI.service';
import { LocalStorageService } from './services/localStorage.service';
import { ErrorHandlerService } from './services/errorHandler.service';
import { AppControlService } from './services/app-control.service';
import { AppFormsService } from './services/app-forms.service';
import { ConfirmationService } from './services/confirmation.service';

import { WelcomePageComponent } from './components/welcome-page/welcome-page.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { HeaderComponent } from './components/header/header.component';
import { MenuHeaderComponent } from './components/menu-header/menu-header.component';
import { SigninPageComponent } from './components/signin-page/signin-page.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component'
import { SignupPageComponent } from './components/signup-page/signup-page.component';
import { DialogPopupComponent } from './components/dialog-popup/dialog-popup.component';
import { FormNewBoardComponent } from './components/form-new-board/form-new-board.component';
import { BoardContentComponent } from './components/board-content/board-content.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { FormNewColumnComponent } from './components/form-new-column/form-new-column.component';
import { FormNewTaskComponent } from './components/form-new-task/form-new-task.component';
import { SearchPanelComponent } from './components/search-panel/search-panel.component';
import { LanquageMenuComponent } from './components/lanquage-menu/lanquage-menu.component';
import { FooterComponent } from './components/footer/footer.component';
import { ErrorPanelComponent } from './components/error-panel/error-panel.component';

export function httpTranslateLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    WelcomePageComponent,
    MainPageComponent,
    MenuHeaderComponent,
    SigninPageComponent,
    PageNotFoundComponent,
    HeaderComponent,
    SignupPageComponent,
    DialogPopupComponent,
    FormNewBoardComponent,
    BoardContentComponent,
    EditUserComponent,
    FormNewColumnComponent,
    FormNewTaskComponent,
    SearchPanelComponent,
    LanquageMenuComponent,
    FooterComponent,
    ErrorPanelComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [RestDataService, LocalStorageService, AppControlService, ErrorHandlerService, ConfirmationService, AppFormsService, Location ],
  bootstrap: [AppComponent]
})
export class AppModule { }
