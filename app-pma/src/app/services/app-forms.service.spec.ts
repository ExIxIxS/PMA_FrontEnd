import { TestBed } from '@angular/core/testing';

import { AppFormsService } from './app-forms.service';

describe('AppFormsService', () => {
  let service: AppFormsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppFormsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
