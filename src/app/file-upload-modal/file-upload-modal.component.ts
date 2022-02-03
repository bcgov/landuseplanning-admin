import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Utils } from 'app/shared/utils/utils';
import { uniqBy } from 'lodash';
import { UploadedFile } from './types';
import { ModalData } from 'app/shared/types/modal';


@Component({
  selector: 'app-file-upload-modal',
  templateUrl: './file-upload-modal.component.html',
  styleUrls: ['./file-upload-modal.component.scss']
})
export class FileUploadModalComponent implements OnInit {
  closeDialog: boolean;
  modalData: ModalData;
  uploadedFiles: UploadedFile[];
  file: UploadedFile;
  fileList: UploadedFile[];
  fileExt: string;
  selectedFiles: UploadedFile[];
  @ViewChild("fileBrowser") fileBrowser: ElementRef;
  @ViewChild("fileInfoForm") fileInfoForm: ElementRef;

  constructor(
    public utils: Utils,
    private ngxSmartModalService: NgxSmartModalService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.closeDialog = false;
    this.selectedFiles = [];
    this.fileList = [];
    this.uploadedFiles = [];
    this.modalData = this.ngxSmartModalService.getModalData('file-upload-modal');

    if (this.modalData.fileExt) {
      this.fileExt = this.modalData.fileExt;
    } else {
      this.fileExt = 'jpg, jpeg, gif, png, bmp, doc, docx, xls, xlsx, ppt, pptx, pdf, txt, zip';
    }
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
      this.ngxSmartModalService.close('file-upload-modal');
    }
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
   * Adds a pseudo-random ID and alt tag fields to uploaded files.
   * Then puts the new files at the beginning of the fileList.
   *
   * @param uploadedFiles The files uploaded by the file-upload component.
   * @returns {void}
   */
  uploadFiles( uploadedFiles: UploadedFile[] ): void {
    this.uploadedFiles = uploadedFiles.map(file => {
      // Create a temporary pseudo-random ID to help with sorting.
      file.id = Math.floor(Math.random() * 1000000000000);
      file.alt = new FormControl('');
      return file;
    })

    this.uploadedFiles.forEach(file => {
      this.fileList.unshift(file);
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
  selectFile( file: UploadedFile ): void {
    this.selectedFiles.unshift(file);
    this.selectedFiles = uniqBy(this.selectedFiles, 'id');

    if (this.selectedFiles.length > this.modalData.fileNum) {
      this.selectedFiles.splice(this.modalData.fileNum);
    }
  }

  /**
   * Listens for the enter key on a file and selects it if it's heard.
   *
   * @param event The keyboard event.
   * @param file The file the keyboard-using user wants to select.
   * @returns {void}
   */
  keyPress(event: KeyboardEvent, file: UploadedFile): void {
    if ("Enter" === event.code) {
      this.selectFile(file);
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
  @HostListener('document:keypress', ['$event'])
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
  isSelected( file: UploadedFile ): boolean {
    return this.selectedFiles.includes(file);
  }

  /**
   * Returns position a file is in the selected file array.
   *
   * @param file The file to check.
   * @returns The position the file is in.
   */
  selectedCount( file: UploadedFile ): number {
    const count = this.selectedFiles.indexOf(file);
    if (count >= 0) {
      return count + 1;
    }
  }

  /**
   * Checks if the user has selected files to upload, or made
   * changes to the information tied to files.
   *
   * @returns If a save is required.
   */
  isSaveRequired(): boolean {
    return this.uploadedFiles.length > 0 || false;
  }

  /**
   * Maps the file type to the corresponding icon and aria label.
   * File can be image, doc, or shapefile.
   *
   * @param file The file
   * @returns The icon to use and its aria label.
   */
  getIconInfoFromType( file: UploadedFile ): { aria: string, icon: string } {
    const iconInfo = {
      aria: 'File',
      icon: 'description'
    }
    const docTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/pdf"
    ];
    const imageTypes = [
      "image/png",
      "image/jpeg"
    ];
    const shapefileTypes = [
      "application/zip"
    ];

    if (docTypes.includes(file.type)) {
      iconInfo.aria = 'Document';
      iconInfo.icon = 'description';
    } else if (imageTypes.includes(file.type)) {
      iconInfo.aria = 'Image';
      iconInfo.icon = 'image';
    } else if (shapefileTypes.includes(file.type)) {
      iconInfo.aria = 'Shapefile';
      iconInfo.icon = 'public';
    }

    return iconInfo;
  }

  /**
   * Beginnings of handleSave method.
   *
   * @todo Complete function.
   */
  handleSave() {
    // Validation.
    if (this.modalData.altRequired) {
      const filesWithEmptyAlt = this.selectedFiles.filter(file => "" === file.alt.value);

      if (filesWithEmptyAlt.length > 0) {
        // Abort save and show message.
      }
    }

    // Save.
  }
}
