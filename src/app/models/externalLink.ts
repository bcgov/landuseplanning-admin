import * as _ from 'lodash';

export class ExternalLink {
  _id: string;
  project: string;
  displayName: string;
	externalLink: string;
  section: string;
  dateAdded: Date;
  dateUpdated: Date;
  description: string;
  projectPhase: string;
  checkbox: boolean;
  isPublished: boolean;

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.project = obj && obj.project || null;
    this.displayName = obj && obj.displayName || null;
    this.externalLink = obj && obj.externalLink || null;
    this.section = obj && obj.section || null;
    this.dateAdded = obj && obj.dateAdded || null;
    this.dateUpdated = obj && obj.dateUpdated || null;
    this.description = obj && obj.description || null;
    this.projectPhase = obj && obj.projectPhase || null;
		this.checkbox = false || null;
		this.isPublished = false || null;
  }
}
