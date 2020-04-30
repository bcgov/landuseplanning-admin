import { Project } from './project';
import { CommentPeriod } from './commentPeriod';
import { Survey } from './survey';
import { SurveyQuestion } from './surveyQuestion';
import { SurveyQuestionAnswer } from './surveyQuestionAnswer';

export class SurveyResponse {
  _id: string;
  author: string;
  location: string;
  dateAdded: Date;
  commentPeriod: CommentPeriod;
  project: Project;
  survey: Survey;
  responses: { question: SurveyQuestion, answer: SurveyQuestionAnswer };

  // Permissions
  read: Array<String> = [];
  write: Array<String> = [];
  delete: Array<String> = [];

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.author = obj && obj.author || null;
    this.location = obj && obj.location || null;
    this.dateAdded = obj && obj.dateAdded || null;
    this.commentPeriod = obj && obj.commentPeriod || null;
    this.project = obj && obj.project || null;
    this.survey = obj && obj.survey || null;
    this.responses = obj && obj.responses || null;

    this.read = obj && obj.read || null;
    this.read = obj && obj.write || null;
    this.read = obj && obj.delete || null;
  }
}
