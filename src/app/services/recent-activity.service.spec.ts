import { TestBed, inject } from '@angular/core/testing';

import { RecentActivityService } from './recent-activity';
import { ApiService } from 'app/services/api';


describe('RecentActivityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RecentActivityService,
        { provide: ApiService }
      ]
    });
  });

  it('should be created', inject([RecentActivityService], (service: RecentActivityService) => {
    expect(service).toBeTruthy();
  }));
});
