import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormNewColumnComponent } from './form-new-column.component';

describe('FormNewColumnComponent', () => {
  let component: FormNewColumnComponent;
  let fixture: ComponentFixture<FormNewColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormNewColumnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormNewColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
