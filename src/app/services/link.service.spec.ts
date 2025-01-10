import { TestBed, inject } from '@angular/core/testing';

import { LinkService } from './link.service';
import { ApiService } from 'app/services/api';

describe('LinkService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LinkService, { provide: ApiService }]
    });
  });

  it('should be created', inject([LinkService], (service: LinkService) => {
    expect(service).toBeTruthy();
  }));
});
