export interface ModalData {
  projectID: string;
  title?: string;
  altRequired?: boolean;
  fileExt?: string;
  fileTypes?: string[];
  fileNum?: number;
  maxSize?: number;
  returnedFiles?: Document|unknown[];
}
