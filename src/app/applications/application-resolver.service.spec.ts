import { TestBed, inject } from '@angular/core/testing';

import { ApplicationDetailResolver } from './application-resolver.service';

describe('ApplicationDetailResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationDetailResolver]
    });
  });

  it('should be created', inject([ApplicationDetailResolver], (service: ApplicationDetailResolver) => {
    expect(service).toBeTruthy();
  }));
});
