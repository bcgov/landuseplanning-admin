import { FormControl } from '@angular/forms';
import * as _ from 'lodash';

export class Document {
  _id: string;
  project: string;
  documentFileName: string;
  internalOriginalName: string;
  internalURL: string;
  passedAVCheck: boolean;
  internalMime: string;
  internalSize: number;
  documentSource: string;
  displayName: string;
  dateUploaded: string;
  description: string;
  documentAuthor: string;
  eaoStatus: string;
  datePosted: Date;
  dateUpdated: Date;
  projectPhase: string;
  alt: string;
  checkbox: boolean;
  upfile: File;
  mimeType: string;
  labels: any[];
  isPublished = false; // depends on tags; see below

  read: Array<String> = [];

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.project = obj && obj.project || null;

    this.documentFileName = obj && obj.documentFileName || null;
    this.internalOriginalName = obj && obj.internalOriginalName || null;
    this.internalURL = obj && obj.internalURL || null;
    this.passedAVCheck = obj && obj.passedAVCheck || null;
    this.internalMime = obj && obj.internalMime || null;
    this.internalSize = obj && obj.internalSize || null;
    this.documentSource = obj && obj.documentSource || null;

    this.displayName = obj && obj.displayName || null;
    this.dateUploaded = obj && obj.dateUploaded || null;
    this.dateUpdated = obj && obj.dateUpdated || null;
    this.datePosted = obj && obj.datePosted || null;
    this.description = obj && obj.description || null;
    this.documentAuthor = obj && obj.documentAuthor || null;
    this.eaoStatus = obj && obj.eaoStatus || null;
    this.projectPhase = obj && obj.projectPhase || null;
    this.alt = obj && obj.alt || null;

    this.checkbox = obj && obj.checkbox || null;
    this.upfile = obj && obj.upfile || null;
    this.labels = obj && obj.labels || null;

    this.read = obj && obj.read || null;
  }
}
