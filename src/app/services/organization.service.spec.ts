import { TestBed, inject } from '@angular/core/testing';
import { OrganizationService } from './organization.service';
import { ApiService } from 'app/services/api';

describe('OrganizationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrganizationService,
        { provide: ApiService }
      ]
    });
  });

  it('should be created', inject([OrganizationService], (service: OrganizationService) => {
    expect(service).toBeTruthy();
  }));
});
