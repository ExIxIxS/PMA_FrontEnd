import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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

import { TestDragAndDropComponent } from './test-drag-and-drop/test-drag-and-drop.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { MainPageComponent } from './main-page/main-page.component';
import { HeaderComponent } from './header/header.component';
import { MenuHeaderComponent } from './menu-header/menu-header.component';
import { ContentWelcomeComponent } from './content-welcome/content-welcome.component';
import { SigninPageComponent } from './signin-page/signin-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component'

import { RestDataService } from './restAPI.service';
import { LocalStorageService } from './localStorage.service';
import { ErrorHandlerService } from './errorHandler.service';
import { AppControlService } from './app-control.service';
import { SignupPageComponent } from './signup-page/signup-page.component';
import { DialogPopupComponent } from './dialog-popup/dialog-popup.component';
import { ConfirmationService } from './confirmation.service';
import { FormNewBoardComponent } from './form-new-board/form-new-board.component';

@NgModule({
  declarations: [
    AppComponent,
    TestDragAndDropComponent,
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
  ],
  providers: [RestDataService, LocalStorageService, AppControlService, ErrorHandlerService, ConfirmationService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
