import { TestBed, inject } from '@angular/core/testing';

import { DocumentService } from './document.service';
import { ApiService } from 'app/services/api';

describe('DocumentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DocumentService, { provide: ApiService }]
    });
  });

  it('should be created', inject([DocumentService], (service: DocumentService) => {
    expect(service).toBeTruthy();
  }));
});
