import { TestBed } from '@angular/core/testing';

import { OrganizationsResolver } from './organizations-resolver.service';

describe('ContactsResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrganizationsResolver = TestBed.inject(OrganizationsResolver);
    expect(service).toBeTruthy();
  });
});
