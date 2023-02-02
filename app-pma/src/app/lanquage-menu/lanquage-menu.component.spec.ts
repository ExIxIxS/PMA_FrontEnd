import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanquageMenuComponent } from './lanquage-menu.component';

describe('LanquageMenuComponent', () => {
  let component: LanquageMenuComponent;
  let fixture: ComponentFixture<LanquageMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LanquageMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanquageMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
