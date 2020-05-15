import { Project } from './project';

export class EmailSubscribe {
  _id: string;
  email: string;
  project: any;
  confirmed: boolean;
  dateSubscribed: Date;
  dateConfirmed: Date;

  // Permissions
  read: Array<String> = [];
  write: Array<String> = [];
  delete: Array<String> = [];

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.email = obj && obj.email || null;
    this.project = obj && obj.project || null;
    this.confirmed = obj && obj.confirmed || null;
    this.dateSubscribed = obj && obj.dateSubscribed || null;
    this.dateConfirmed = obj && obj.dateConfirmed || null;
    this.read = obj && obj.read || null;
    this.write = obj && obj.write || null;
    this.delete = obj && obj.delete || null;

    if (obj && obj.dateSubscribed) {
      this.dateSubscribed = new Date(obj.dateSubscribed);
    }

    if (obj && obj.dateConfirmed) {
      this.dateConfirmed = new Date(obj.dateConfirmed);
    }
  }
}
