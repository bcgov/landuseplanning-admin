export class DocumentSection {
  _id: string;
  project: string;
  name: string;
  order: number;

  // Permissions
  read: Array<String> = [];
  write: Array<String> = [];
  delete: Array<String> = [];

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.project = obj && obj.project || null;
    this.name = obj && obj.name || null;
    this.order = obj && obj.order || null;
    this.read = obj && obj.read || null;
    this.write = obj && obj.write || null;
    this.delete = obj && obj.delete || null;
  }
}
