import { TestBed, inject } from '@angular/core/testing';

import { DecisionService } from './decision.service';

describe('DecisionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DecisionService]
    });
  });

  it('should be created', inject([DecisionService], (service: DecisionService) => {
    expect(service).toBeTruthy();
  }));
});
