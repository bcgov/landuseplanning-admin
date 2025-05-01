import { DocumentSourceEnum } from "app/models/document";

export interface ModalData {
  slug?: string;
  projectID: string;
  title?: string;
  altRequired?: boolean;
  fileExt?: string;
  fileTypes?: string[];
  fileNum?: number;
  documentSource?: DocumentSourceEnum;
  maxSize?: number;
  returnedFiles?: Document|unknown[];
}
