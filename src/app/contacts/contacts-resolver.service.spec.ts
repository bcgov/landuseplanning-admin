import { TestBed } from '@angular/core/testing';

import { ContactsResolver } from './contacts-resolver.service';

describe('ContactsResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContactsResolver = TestBed.get(ContactsResolver);
    expect(service).toBeTruthy();
  });
});
