export class Document {
  _id: string;
  keywords: string[];
  displayName: string;
  directoryID: number;
  application: string;
  description: string;
  dateReceived: string;
  documentDate: string;
  datePosted: string;
  dateUploaded: string;
  dateUpdated: string;
  dateAdded: string;

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.keywords = obj && obj.keywords || [];
    this.displayName = obj && obj.displayName || null;
    this.directoryID = obj && obj.directoryID || null;
    this.application = obj && obj.application || null;
    this.dateReceived = obj && obj.dateReceived || null;
    this.documentDate = obj && obj.documentDate || null;
    this.datePosted = obj && obj.datePosted || null;
    this.dateUploaded = obj && obj.dateUploaded || null;
    this.dateUpdated = obj && obj.dateUpdated || null;
    this.dateAdded = obj && obj.dateAdded || null;
    this.description = obj && obj.description || null;
  }
}
