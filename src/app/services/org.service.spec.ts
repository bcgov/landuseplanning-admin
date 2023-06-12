import { TestBed } from '@angular/core/testing';

import { OrgService } from './org.service';

describe('OrgService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrgService = TestBed.inject(OrgService);
    expect(service).toBeTruthy();
  });
});
