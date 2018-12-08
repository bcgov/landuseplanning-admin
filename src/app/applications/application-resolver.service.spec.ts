import { TestBed, inject } from '@angular/core/testing';

import { ApplicationDetailResolver } from './application-resolver.service';
import { ApplicationService } from 'app/services/application.service';

describe('ApplicationDetailResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApplicationDetailResolver,
        { provide: ApplicationService }
      ]
    });
  });

  it('should be created', inject([ApplicationDetailResolver], (service: ApplicationDetailResolver) => {
    expect(service).toBeTruthy();
  }));
});
