import { TestBed, inject } from '@angular/core/testing';
import { CkUploadAdapter } from "./ck-upload-adapter";
import { DocumentService } from 'app/services/document.service';

describe('CKUploadAdapter', () => {
  describe('test upload()', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          DocumentService
        ]
      });
    });
    it('should return a promise', inject([DocumentService], (docService: DocumentService) => {
      // Return our fake file wrapped in a Promise.
      let fakeFile = new Promise(function(resolve, reject) {
        resolve('some_url');
      });
      let myInstance = new CkUploadAdapter(fakeFile, '12345', docService, 'http://localhost');
      // Super simple test just to verify that the class got created.
      // Will expand the tests once we get the testing framework even running on our local machines.
      expect(myInstance).toBeTruthy();
    }));
  });
});
