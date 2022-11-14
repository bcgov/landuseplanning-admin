//
// inspired by http://www.advancesharp.com/blog/1218/angular-4-upload-files-with-data-and-web-api-by-drag-drop
//
import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})

export class FileUploadComponent {
  public dragDropClass = 'dragarea';
  @Input() fileExt = 'jpg, jpeg, gif, png, bmp, doc, docx, xls, xlsx, ppt, pptx, pdf, txt, zip';
  @Input() maxFiles = 50;
  @Input() maxSize = 300; // in MB
  @Input() files: Array<File> = [];
  @Input() showInfo = true;
  @Input() showList = true;
  @Output() filesChange = new EventEmitter();
  public errors: Array<string> = [];

  constructor() { }

  /**
   * Drag event handler to apply styles when items are dragged over the file upload area.
   * This gives the user feedback when dragging items in the file picker UI.
   *
   * @param {DragEvent} event A drag over event.
   * @return {void}
   */
  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent): void {
    this.dragDropClass = 'droparea';
    event.preventDefault();
  }

  /**
   * Drag event handler to apply styles when items are dragged into the file upload area.
   * This gives the user feedback when dragging items in the file picker UI.
   *
   * @param {DragEvent} event A drag over event.
   * @return {void}
   */
  @HostListener('dragenter', ['$event']) onDragEnter(event: DragEvent): void {
    this.dragDropClass = 'droparea';
    event.preventDefault();
  }

  /**
   * Drag event handler to apply styles when and item stops being dragged. This
   * gives the user feedback when dragging items in the file picker UI.
   *
   * @param {DragEvent} event A drag over event.
   * @return {void}
   */
  @HostListener('dragend', ['$event']) onDragEnd(event: DragEvent): void {
    this.dragDropClass = 'dragarea';
    event.preventDefault();
  }

  /**
   * Drag event handler to apply styles when items are dragged. This gives
   * the user feedback when dragging items out of the file picker UI.
   *
   * @param {DragEvent} event A drag over event.
   * @return {void}
   */
  @HostListener('dragleave', ['$event']) onDragLeave(event: DragEvent): void {
    this.dragDropClass = 'dragarea';
    event.preventDefault();
  }

  /**
   * Drop event handler to apply styles when items are dragged. This gives
   * the user feedback when dropping items in the file picker UI.
   *
   * Also add to selected files when they are dropped in the drop area.
   *
   * @param {DragEvent} event A drag over event.
   * @return {void}
   */
  @HostListener('drop', ['$event']) onDrop(event: DragEvent): void {
    this.dragDropClass = 'dragarea';
    event.preventDefault();
    event.stopPropagation();
    this.addFiles(event.dataTransfer.files);
  }

  /**
   * File change handler. Updates selected files.
   *
   * @param {Event} event File selection event.
   * @return {void}
   */
  onFileChange(event): void {
    const files = event.target.files;
    this.addFiles(files);
  }

  /**
   * Clears error associated with file selection. Validates files and then add them to selected files.
   *
   * @param {FileList} files List of files.
   * @return {void}
   */
  addFiles(files: FileList): void {
    this.errors = []; // clear previous errors

    if (this.isValidFiles(files)) {
      for (let i = 0; i < files.length; i++) {
        this.files.push(files[i]);
      }
      this.filesChange.emit(this.files);
    }
  }

  /**
   * Clears error associated with file selection.
   * Remove a file from the selected files list if it's already a member of it.
   *
   * @param {File} file File to remove.
   * @return {void}
   */
  removeFile(file: File): void {
    this.errors = []; // clear previous errors

    const index = this.files.indexOf(file);
    if (index !== -1) {
      this.files.splice(index, 1);
    }
    this.filesChange.emit(this.files);
  }

  /**
   * Validate files by checking against the maximum selected files, correct file extensions, maximum size.
   *
   * @param {FileList} files Files to validate.
   * @returns {boolean}
   */
  private isValidFiles(files: FileList): boolean {
    if (this.maxFiles > 0) { this.validateMaxFiles(files); }
    if (this.fileExt.length > 0) { this.validateFileExtensions(files); }
    if (this.maxSize > 0) { this.validateFileSizes(files); }
    return (this.errors.length === 0);
  }

  /**
   * Validate that the correct amount of files have been selected(not too many).
   *
   * @param {FileList} files The files to validate.
   * @returns {boolean}
   */
  private validateMaxFiles(files: FileList): boolean {
    if ((files.length + this.files.length) > this.maxFiles) {
      this.errors.push('Too many files');
      setTimeout(() => this.errors = [], 5000);
      return false;
    }
    return true;
  }

  /**
   * Validate files are the correct extension.
   *
   * @param {FileList} files The files to validate.
   * @returns {boolean}
   */
  private validateFileExtensions(files: FileList): boolean {
    let ret = true;
    const extensions = this.fileExt.split(',').map(function (x) { return x.toUpperCase().trim(); });
    for (let i = 0; i < files.length; i++) {
      const ext = files[i].name.toUpperCase().split('.').pop() || files[i].name;
      if (!extensions.includes(ext)) {
        this.errors.push('Invalid extension: ' + files[i].name);
        setTimeout(() => this.errors = [], 5000);
        ret = false;
      }
    }
    return ret;
  }

  /**
   * Validate that files are not too large.
   *
   * @param {FileList} files The files to validate.
   * @returns {boolean}
   */
  private validateFileSizes(files: FileList): boolean {
    let ret = true;
    for (let i = 0; i < files.length; i++) {
      const fileSizeinMB = files[i].size / 1024 / 1024; // in MB
      const size = Math.round(fileSizeinMB * 100) / 100; // convert up to 2 decimal places
      if (size > this.maxSize) {
        this.errors.push('File too large: ' + files[i].name);
        setTimeout(() => this.errors = [], 5000);
        ret = false;
      }
    }
    return ret;
  }
}
