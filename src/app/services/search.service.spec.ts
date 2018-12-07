import { TestBed, inject } from '@angular/core/testing';

import { SearchService } from './search.service';
import { ApiService } from 'app/services/api';

describe('SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SearchService,
        { provide: ApiService }
      ]
    });
  });

  it('should be created', inject([SearchService], (service: SearchService) => {
    expect(service).toBeTruthy();
  }));
});
