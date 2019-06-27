import { TestBed } from '@angular/core/testing';

import { ContactsResolverService } from './contacts-resolver.service';

describe('ContactsResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContactsResolverService = TestBed.get(ContactsResolverService);
    expect(service).toBeTruthy();
  });
});
