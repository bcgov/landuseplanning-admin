import { FormControl } from "@angular/forms";

export interface UploadedFile extends File {
  id?: number | string;
  alt?: FormControl;
}
