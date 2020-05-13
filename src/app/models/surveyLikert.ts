export class SurveyLikert {
  _id: string;
  attribute: string;
  choices: string[];

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.attribute = obj && obj.attribute || null;
    this.choices = obj && obj.choices || null;
  }
}
