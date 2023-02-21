import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormNewBoardComponent } from './form-new-board.component';

describe('FormNewBoardComponent', () => {
  let component: FormNewBoardComponent;
  let fixture: ComponentFixture<FormNewBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormNewBoardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormNewBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
