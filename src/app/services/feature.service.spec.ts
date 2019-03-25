import { TestBed, inject } from '@angular/core/testing';

import { FeatureService } from './feature.service';
import { ApiService } from 'app/services/api';

describe('FeatureService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FeatureService, { provide: ApiService }]
    });
  });

  it('should be created', inject([FeatureService], (service: FeatureService) => {
    expect(service).toBeTruthy();
  }));
});
