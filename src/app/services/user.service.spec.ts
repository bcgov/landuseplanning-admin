import { TestBed, inject } from '@angular/core/testing';

import { UserService } from './user.service';
import { ApiService } from 'app/services/api';

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: ApiService }
      ]
    });
  });

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));
});
