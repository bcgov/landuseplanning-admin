import { Project } from './project';
import { Document } from './document';
import { CommentPeriod } from './commentPeriod';
import { Survey } from './survey';
import { SurveyQuestion } from './surveyQuestion';
import { SurveyQuestionAnswer } from './surveyQuestionAnswer';

export class SurveyResponse {
  _id: string;
  author: string;
  location: string;
  dateAdded: Date;
  period: string;
  project: string;
  survey: string;
  commentId: number;

  responses: { question: SurveyQuestion, answer: SurveyQuestionAnswer }[];
  documents: string[];

  // Used for comment review.
  documentsList: Document[];

  // Permissions
  read: Array<String> = [];
  write: Array<String> = [];
  delete: Array<String> = [];

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.author = obj && obj.author || null;
    this.location = obj && obj.location || null;
    this.dateAdded = obj && obj.dateAdded || null;
    this.period = obj && obj.period || null;
    this.project = obj && obj.project || null;
    this.survey = obj && obj.survey || null;
    this.responses = obj && obj.responses || null;
    this.commentId = obj && obj.commentId || null;
    this.documents = obj && obj.documents || null;
    this.documentsList = obj && obj.documentsList || [];

    this.read = obj && obj.read || null;
    this.read = obj && obj.write || null;
    this.read = obj && obj.delete || null;
  }
}
