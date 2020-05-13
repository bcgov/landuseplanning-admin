import { Project } from './project';
import { CommentPeriod } from './commentPeriod';
import { SurveyQuestion } from './surveyQuestion';

export class Survey {
  _id: string;
  name: string;
  dateAdded: Date;
  lastSaved: Date;
  commentPeriod: string;
  project: string;
  questions: SurveyQuestion[];

  // Permissions
  read: Array<string> = [];
  write: Array<string> = [];
  delete: Array<string> = [];

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.name = obj && obj.name || null;
    this.dateAdded = obj.dateAdded || null;
    this.lastSaved = obj.lastSaved || null;
    this.commentPeriod = obj.period || null;
    this.project = obj.project || null;
    this.questions = obj.questions || null;

    this.read = obj && obj.read || null;
    this.read = obj && obj.write || null;
    this.read = obj && obj.delete || null;
  }
}
