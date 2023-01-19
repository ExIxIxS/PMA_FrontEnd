import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormNewTaskComponent } from './form-new-task.component';

describe('FormNewTaskComponent', () => {
  let component: FormNewTaskComponent;
  let fixture: ComponentFixture<FormNewTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormNewTaskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormNewTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
