import { TestBed, inject } from '@angular/core/testing';

import { DecisionService } from './decision.service';
import { ApiService } from 'app/services/api';
import { DocumentService } from 'app/services/document.service';

describe('DecisionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DecisionService, { provide: ApiService }, { provide: DocumentService }]
    });
  });

  it('should be created', inject([DecisionService], (service: DecisionService) => {
    expect(service).toBeTruthy();
  }));
});
