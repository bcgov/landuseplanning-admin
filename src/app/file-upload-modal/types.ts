import { FormControl } from "@angular/forms";
import { Document } from "app/models/document";

/**
 * Omit the alt property when extending the Document class
 * so we can use the FormControl type for the alt property.
 **/
const _Document: new () => Omit<Document, "alt"> = Document;

export class DocumentForm extends _Document {
  alt: FormControl;
  queuedForUpload: boolean;
  deselectHovered: boolean;
}
