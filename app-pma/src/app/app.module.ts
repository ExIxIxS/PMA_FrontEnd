import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Location } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { RestDataService } from './restAPI.service';
import { LocalStorageService } from './localStorage.service';
import { ErrorHandlerService } from './errorHandler.service';
import { AppControlService } from './app-control.service';
import { AppFormsService } from './app-forms.service';
import { ConfirmationService } from './confirmation.service';

import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { MainPageComponent } from './main-page/main-page.component';
import { HeaderComponent } from './header/header.component';
import { MenuHeaderComponent } from './menu-header/menu-header.component';
import { ContentWelcomeComponent } from './content-welcome/content-welcome.component';
import { SigninPageComponent } from './signin-page/signin-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component'
import { SignupPageComponent } from './signup-page/signup-page.component';
import { DialogPopupComponent } from './dialog-popup/dialog-popup.component';
import { FormNewBoardComponent } from './form-new-board/form-new-board.component';
import { BoardContentComponent } from './board-content/board-content.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { FormNewColumnComponent } from './form-new-column/form-new-column.component';
import { FormNewTaskComponent } from './form-new-task/form-new-task.component';
import { SearchPanelComponent } from './search-panel/search-panel.component';
import { LanquageMenuComponent } from './lanquage-menu/lanquage-menu.component';

export function httpTranslateLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    WelcomePageComponent,
    MainPageComponent,
    MenuHeaderComponent,
    ContentWelcomeComponent,
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
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatStepperModule,
    MatRadioModule,
    MatCardModule,
    MatDialogModule,
    MatChipsModule,
    ReactiveFormsModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    DragDropModule,
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
