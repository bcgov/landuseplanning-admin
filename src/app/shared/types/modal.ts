export interface ModalData {
  slug?: string;
  projectID: string;
  title?: string;
  altRequired?: boolean;
  fileExt?: string;
  fileTypes?: string[];
  fileNum?: number;
  documentSource?: string;
  maxSize?: number;
  returnedFiles?: Document|unknown[];
}
