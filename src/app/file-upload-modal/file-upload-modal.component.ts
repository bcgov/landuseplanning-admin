import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SearchService } from 'app/services/search.service';
import { DocumentService } from 'app/services/document.service';
import { Document } from 'app/models/document';
import { Utils } from 'app/shared/utils/utils';
import { uniqBy, truncate } from 'lodash';
import { DocumentForm } from './types';
import { ModalData } from 'app/shared/types/modal';
import { Subject, forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-file-upload-modal',
  templateUrl: './file-upload-modal.component.html',
  styleUrls: ['./file-upload-modal.component.scss']
})
export class FileUploadModalComponent implements OnInit {
  loading: boolean;
  closeDialog: boolean;
  errorDialog: boolean;
  errorMessage: string;
  modalData: ModalData;
  queuedFiles: File[];
  fileList: DocumentForm[];
  fileExt: string;
  selectedFiles: DocumentForm[];
  showDeselectButton: boolean;
  projectID: string;
  showHelp: boolean;
  truncate = truncate;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  @ViewChild("fileBrowser") fileBrowser: ElementRef;
  @ViewChild("fileInfoForm") fileInfoForm: ElementRef;

  constructor(
    public utils: Utils,
    private ngxSmartModalService: NgxSmartModalService,
    private searchService: SearchService,
    private documentService: DocumentService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.loading = false;
    this.closeDialog = false;
    this.errorDialog = false;
    this.showDeselectButton = false;
    this.errorMessage = '';
    this.selectedFiles = [];
    this.fileList = [];
    this.queuedFiles = [];
    this.modalData = this.ngxSmartModalService.getModalData('file-upload-modal');
    this.projectID = this.modalData.projectID;
    if (this.modalData.fileExt) {
      this.fileExt = this.modalData.fileExt;
    } else {
      this.fileExt = 'jpg, jpeg, gif, png, bmp, doc, docx, xls, xlsx, ppt, pptx, pdf, txt, zip';
    }
    this.loadFileList();
  }

  /**
   * If there are uploaded files, or files with updated info, show the close
   * dialog to confirm the user wants to close. Otherwise, close modal.
   *
   * @returns {void}
   */
  handleClose(): void {
    if (this.isSaveRequired()) {
      this.closeDialog = true;
    } else {
      this.closeModal();
    }
  }

  /**
   * Close modal and maybe update the modal data.
   *
   * @param dataToCloseWith Optionally pass data to modal when closing.
   * @returns {void}
   */
  closeModal(dataToCloseWith: ModalData|{} = {}): void {
    this.ngxSmartModalService.setModalData(dataToCloseWith, 'file-upload-modal', true);
    this.ngxSmartModalService.close('file-upload-modal');
  }

  /**
   * Stop showing the close dialog.
   *
   * @returns {void}
   */
  handleCancelClose(): void {
    this.closeDialog = false;
  }

  /**
   * Stop showing the save error dialog.
   *
   * @returns {void}
   */
  handleConfirmError(): void {
    this.errorDialog = false;
  }

  /**
   * Toggle the help dialog.
   *
   * @returns {void}
   */
  toggleHelp(): void {
    this.showHelp = this.showHelp ? false : true;
  }

  /**
   * Load files from the DB of the same file extension passed in with modalData.fileExt.
   *
   * @returns {void}
   */
  loadFileList(): void {
    this.loading = true;
    const fileExtensionsToLoad = this.fileExt.replace(/\s+/g, '');
    this.searchService.getSearchResults(
      '',
      'Document',
      [{ 'name': 'project', 'value': this.projectID }],
      1,
      10,
      '-datePosted',
      { internalExt: fileExtensionsToLoad, documentSource: 'PROJECT' },
      true
    ).subscribe(res => {
      this.loading = false;
      if (res[0]?.data?.searchResults) {
        this.fileList = res[0]?.data?.searchResults.map((document: Document) => {
          let documentForm = new DocumentForm();
          documentForm._id = document._id;
          documentForm.alt = new FormControl(document.alt);
          documentForm.mimeType = document.mimeType;
          documentForm.internalSize = document.internalSize;
          documentForm.documentFileName = document.documentFileName;
          documentForm.queuedForUpload = false;

          return documentForm;
        })
      }
    })
  }

  /**
   * Adds a pseudo-random ID and alt tag fields to files queued for upload.
   * Then puts the new files at the beginning of the fileList.
   *
   * @param queuedFiles The files queued for upload.
   * @returns {void}
   */
  queueFilesForUpload( queuedFiles: FileList ): void {
    Array.from(queuedFiles).forEach((file: File) => {
      let documentForm = new DocumentForm();
      // Create a temporary pseudo-random string ID to help with sorting.
      documentForm._id = Math.random().toString(36).slice(2);
      documentForm.alt = new FormControl();
      documentForm.upfile = file;
      documentForm.internalSize = file.size;
      documentForm.mimeType = file.type;
      documentForm.documentFileName = file.name;
      documentForm.documentSource = 'PROJECT';
      documentForm.queuedForUpload = true;
      documentForm.deselectHovered = false;

      this.fileList.unshift(documentForm);
    });

    this._changeDetectorRef.detectChanges();
  }

  /**
   * Add file to selected files list.
   * Checks that the number of files in the list does not exceed fileNum.
   * Makes sure the same file doesn't enter the array twice.
   *
   * @param file A file that the user wants to select.
   * @returns {void}
   */
  handleSelect( file: DocumentForm ): void {
    file.deselectHovered = false;
    this.selectedFiles.unshift(file);
    this.selectedFiles = uniqBy(this.selectedFiles, '_id');

    if (this.selectedFiles.length > this.modalData.fileNum) {
      this.selectedFiles.splice(this.modalData.fileNum);
    }
  }

  /**
   * Deselects a file by removing it from the selected files array.
   *
   * @param event Click event to deselect the file.
   * @param file The file to deselect.
   * @returns {void}
   */
  handleDeselect(event: MouseEvent, file: DocumentForm): void {
    const fileIndex = this.selectedFiles.indexOf(file);
    this.selectedFiles.splice(fileIndex, 1);
    // Prevent event from being triggered by element's parent.
    event.stopPropagation();
  }

  /**
   * Listens for the enter key on a file and selects it if it's heard.
   *
   * @param event The keyboard event.
   * @param file The file the keyboard-using user wants to select.
   * @returns {void}
   */
  keyPress(event: KeyboardEvent, file: DocumentForm): void {
    if ("Enter" === event.code) {
      this.handleSelect(file);
    }
  }

  /**
   * Handle escape key to get out of modal.
   * Handle other keypresses to navigate the component.
   *
   * @todo Use this handler to make it easier for keyboard users to navigate file browser.
   * @param event The keyboard event.
   * @returns {void}
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if ("Escape" === event.code) {
      this.handleClose();
    }
  }

  /**
   * Check if a file is selected(exists in the selectedFiles array).
   *
   * @param file The file to check.
   * @returns Whether or not a file is already selected.
   */
  isSelected( file: DocumentForm ): boolean {
    return this.selectedFiles.includes(file);
  }

  /**
   * Returns position a file is in the selected file array.
   *
   * @param file The file to check.
   * @returns The position the file is in.
   */
  selectedCount( file: DocumentForm ): number {
    const count = this.selectedFiles.indexOf(file);
    if (count >= 0) {
      return count + 1;
    }
  }

  /**
   * When a user hovers over the selected file count, switch it to an X to indicate
   * it can be deselected.
   *
   * @param event The hover on or off event.
   * @param file The file that the user is hovering over, and that now shows a deselect icon.
   * @param eventType Whether the mouse is entering or leaving the file element area.
   * @returns {void}
   */
  handleFileHover(event: MouseEvent, file: DocumentForm, eventType: string): void {
    if ('mouseenter' === eventType) {
      file.deselectHovered = true;
    } else if ('mouseleave' === eventType) {
      file.deselectHovered = false;
    }
    // Prevent event from being triggered by element's parent.
    event.stopPropagation();
  }

  /**
   * Checks if the user has selected files to upload, or made
   * changes to the information tied to files.
   *
   * @returns If a save is required.
   */
  isSaveRequired(): boolean {
    const filesQueuedForUpload = this.fileList.filter(file => file.queuedForUpload);
    const altTagsUpdated = this.selectedFiles.filter(file => file.alt.dirty);
    return filesQueuedForUpload.length > 0 || altTagsUpdated.length > 0;
  }

  /**
   * Maps the file type to the corresponding icon and aria label.
   * File can be image, doc, or shapefile.
   *
   * @param file The file to get icon info for.
   * @returns The icon to use and its aria label.
   */
  getIconInfoFromType( file: DocumentForm ): { aria: string, icon: string } {
    const defaultIconInfo = {
      aria: 'File',
      icon: 'description'
    }
    const typeIconMap = {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {aria: 'Document', icon: 'description'},
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {aria: 'Document', icon: 'description'},
      "application/pdf": {aria: 'Document', icon: 'description'},
      "image/png": {aria: 'Image', icon: 'image'},
      "image/jpeg": {aria: 'Image', icon: 'image'},
      "application/zip": {aria: 'Shapefile', icon: 'public'}
    }
    return typeIconMap[file.mimeType] ?? defaultIconInfo;
  }

  /**
   * Validate that the alt fields are filled out if required.
   * Validate that selected files aren't too big.
   * Then begin the process of saving.
   *
   * @returns {void}
   */
  handleSave(): void {
    // Alt tag validation.
    if (this.modalData.altRequired) {
      const filesWithEmptyAlt = this.selectedFiles.filter(file => !file.alt.value);

      if (filesWithEmptyAlt.length > 0) {
        // Abort save and show message.
        this.errorDialog = true;
        this.errorMessage = "One or more of the selected files do not have an alt tag.";
        return;
      }
    }

    // Max file size validation.
    if (this.modalData.maxSize) {
      const filesTooLarge = this.selectedFiles.filter(file => {
        const fileSizeinMB = file.internalSize / 1024 / 1024; // in KB
        const size = Math.round(fileSizeinMB * 100) / 100; // convert up to 2 decimal places
        return size > this.modalData.maxSize;
      });

      if (filesTooLarge.length > 0) {
        // Abort save and show message.
        this.errorDialog = true;
        this.errorMessage = `One or more of the selected files is too large. The maximum file size is ${this.modalData.maxSize}MB`;
        return;
      }
    }

    this.prepareDataForSave(this.selectedFiles)
  }

  /**
   * Create the form data that needs to be sent to the API in order
   * to save.
   *
   * @param filesToSave Selected files to prepare for saving.
   * @returns {void}
   */
  prepareDataForSave(filesToSave: DocumentForm[]): void {
    // Create an array of observables that will be called in parallel later.
    const saveDocumentRequests = filesToSave.map((file: DocumentForm) => {
      let observableThatReturnsDocument;
      const fileFormData = new FormData();

      if (file.queuedForUpload) {
        // If a file needs to be uploaded, add all these fields and POST document.
        fileFormData.append('project', this.projectID);
        fileFormData.append('documentFileName', file.documentFileName);
        fileFormData.append('displayName',  file.documentFileName);
        fileFormData.append('upfile', file.upfile);
        fileFormData.append('documentSource', file.documentSource);
        fileFormData.append('alt', file.alt.value);

        observableThatReturnsDocument = this.documentService.add(fileFormData).pipe(catchError(error => of(error)));
      } else {
        /**
         * If file upload is not needed(the file has been saved previously),
         * just update the alt tag. Only update if the alt tag has changed.
         * Else, just return the file wrapped in an observable.
         * */
        if (file.alt.dirty) {
          fileFormData.append('alt', file.alt.value);
          observableThatReturnsDocument = this.documentService.update(fileFormData, file._id).pipe(catchError(error => of(error)));
        } else {
          const fileData = {
            ...file,
            alt: file.alt.value
          };

          observableThatReturnsDocument = of(new Document(fileData));
        }
      }
      return observableThatReturnsDocument;
    });

    this.saveFile(saveDocumentRequests);
  }

  /**
   * For every file selected, make a call to the API to upload file or update document.
   * Check that not one of the calls fail. If so, trigger the error dialog.
   * If all calls succeed, return the documents and close the modal.
   *
   * @param observables Either a document is succesfully returned or an HTTP error.
   * @returns {void}
   */
  saveFile(observables: Observable<Document|HttpErrorResponse>[]): void {
    forkJoin(observables)
      .subscribe(
        aggregateResponse => {
          aggregateResponse.forEach(individualResponse => {
            if ("status" in individualResponse) {
              // One or more of the responses is an error.
              if (500 === individualResponse.status || 400 === individualResponse.status) {
                console.error(individualResponse);
                this.errorDialog = true;
                this.errorMessage = "There was a problem saving the selected files."
                return;
              }
            }
          });

          this.closeModal({ returnedFiles: aggregateResponse });
        },
        error => {
          console.error('Error returning files', error);
          this.errorDialog = true;
          this.errorMessage = "There was a problem saving the selected files."
          return;
        },
        () => {} // On finished.
      )
  }
}
