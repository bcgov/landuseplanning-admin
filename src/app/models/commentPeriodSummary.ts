export class CommentPeriodSummary {
  Pending: Number;
  Deferred: Number;
  Published: Number;
  Rejected: Number;

  constructor(obj?: any) {
    this.Pending = obj && obj.Pending || null;
    this.Deferred = obj && obj.Deferred || null;
    this.Published = obj && obj.Published || null;
    this.Rejected = obj && obj.Rejected || null;
  }
}
