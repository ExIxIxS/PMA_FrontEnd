import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentWelcomeComponent } from './content-welcome.component';

describe('AppContentWelcomeComponent', () => {
  let component: ContentWelcomeComponent;
  let fixture: ComponentFixture<ContentWelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentWelcomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentWelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
