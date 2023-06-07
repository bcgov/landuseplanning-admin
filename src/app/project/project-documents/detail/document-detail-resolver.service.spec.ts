import { TestBed } from '@angular/core/testing';

import { DocumentDetailResolver } from './document-detail-resolver.service';

describe('DocumentDetailResolver', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DocumentDetailResolver = TestBed.inject(DocumentDetailResolver);
    expect(service).toBeTruthy();
  });
});
