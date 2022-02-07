export interface ModalData {
  projectID: string;
  title?: string;
  altRequired?: boolean;
  fileExt?: string;
  fileTypes?: string[];
  fileNum?: number;
  returnedFiles?: Document|unknown[];
}
