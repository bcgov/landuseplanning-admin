import { TestBed } from '@angular/core/testing';

import { SideBarService } from './sidebar.service';

describe('SideBarService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SideBarService = TestBed.inject(SideBarService);
    expect(service).toBeTruthy();
  });
});
