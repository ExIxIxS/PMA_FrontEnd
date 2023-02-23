import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainPageComponent } from './main-page.component';

import { SearchPanelComponent } from '../search-panel/search-panel.component';

import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Location } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { httpTranslateLoaderFactory } from 'src/app/app.module';

import { AppRoutingModule } from 'src/app/app-routing.module';

import { MaterialModule } from 'src/app/material.module';

import { RestDataService } from 'src/app/services/restAPI.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { ErrorHandlerService } from 'src/app/services/errorHandler.service';
import { AppControlService } from 'src/app/services/app-control.service';
import { AppFormsService } from 'src/app/services/app-forms.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';

describe('AppMainPageComponent', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainPageComponent, SearchPanelComponent ],
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
      providers: [RestDataService, LocalStorageService, AppControlService, ErrorHandlerService, ConfirmationService, AppFormsService, Location, ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
