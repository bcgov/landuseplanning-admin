import { SurveyLikert } from './surveyLikert'

export class SurveyQuestion {
  _id: string;
  type: string;
  questionText: string;
  answerRequired: boolean;
  maxChars?: number;
  choices?: string[];
  choose?: number;
  other?: boolean;
  attributes?: SurveyLikert[];
  infoText?: string;
  docPickerText?: string;
  emailText?: string;
  phoneNumberText?: string;

  // Permissions
  read: Array<string> = [];
  write: Array<string> = [];
  delete: Array<string> = [];

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.type = obj && obj.type || null;
    this.questionText = obj && obj.questionText || null;
    this.answerRequired = obj && obj.answerRequired || null;
    this.maxChars = obj && obj.maxChars || null;
    this.choices = obj && obj.choices || null;
    this.attributes = obj && obj.attributes || null;
    this.other = obj && obj.other || null;
    this.infoText = obj && obj.infoText || null;
    this.docPickerText = obj && obj.docPickerText || null;
  }
}
