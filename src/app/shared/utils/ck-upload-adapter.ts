import { DocumentService } from 'app/services/document.service';

// This utility function is a template directly from CK,
// modified to use our existing DocumentService.
// https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/upload-adapter.html

export class CkUploadAdapter {
  private imageURL: string;
  private imageUploadData: FormData;

  constructor(
    private loader,
    private projectId: string,
    private documentService: DocumentService,
    private pathAPI: string
  ) {
    this.imageUploadData = new FormData();
  }

  /**
   * Required function for the CKUploadAdapter.
   * Uploads the file using the DocumentService,
   * Then returns the image URL wrapped in a Promise.
   *
   * @returns {Promise}
   */
  upload(): Promise<any> {
    // The Object used by CK Editor is wrapped in a promise,
    // so need to combine the promise with the Document Service Observable.
    return this.loader.file
      .then(file => new Promise((resolve, reject) => {
        // Add the meta data for each uploaded image.
        this.imageUploadData.append('upfile', file);
        this.imageUploadData.append('project', this.projectId);
        this.imageUploadData.append('documentFileName', file.name);
        this.imageUploadData.append('displayName', file.name);
        this.imageUploadData.append('documentSource', 'CKEDITOR');

        // Use the DocumentService to upload the image through the API.
        this.documentService.add(this.imageUploadData)
          .subscribe(
            (res) => {
              // Once the image is uploaded, it needs to be published as well.
              this.documentService.publish(res._id)
                .subscribe(
                  res => {
                    const safeName = res.documentFileName.replace(/ /g, '_');
                    this.imageURL = this.pathAPI + '/document/' + res._id + '/fetch/' + safeName;
                    // Return in a format that CK is expecting.
                    resolve({
                      default: this.imageURL
                    });
                  },
                  error => {
                    // Leaving this console.log for now until we have tested and verified on the server.
                    console.error('CK publish error =', error);
                    reject(error);
                  }
                )
            },
            error => {
              // Leaving this console.log for now until we have tested and verified on the server.
              console.log('CK upload error =', error);
              reject(error);
            },
            () => {
              // Do nothing.
            }
          );

      }));
  }

  /**
  * Required function for the CKUploadAdapter.
  * Does nothing right now, but is still expected.
  * 
  * @returns {void}
  */
  abort(): void {
    // Do nothing since our DocumentService doesn't offer abort functionality.
  }
}
