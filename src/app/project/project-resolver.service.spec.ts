import { TestBed, inject } from '@angular/core/testing';

import { ProjectResolver } from './project-resolver.service';
import { ProjectService } from 'app/services/project.service';

describe('ProjectDetailResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProjectResolver,
        { provide: ProjectService }
      ]
    });
  });

  it('should be created', inject([ProjectResolver], (service: ProjectResolver) => {
    expect(service).toBeTruthy();
  }));
});
