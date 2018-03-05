import { TestBed, inject } from '@angular/core/testing';

import { ApplicationListResolver, ApplicationDetailResolver } from './application-resolver.service';

describe('ApplicationListResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationListResolver]
    });
  });

  it('should be created', inject([ApplicationListResolver], (service: ApplicationListResolver) => {
    expect(service).toBeTruthy();
  }));
});

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
