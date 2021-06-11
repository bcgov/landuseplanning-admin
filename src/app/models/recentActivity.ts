export class RecentActivity {
    _id: string;
    project: any;
    dateAdded: string;
    active: string;
    headline: string;
    content: string;
    documentUrl: string;
    documentUrlText: string;
    contentUrl: string;
    pinned: boolean;

    constructor(obj?: any) {
        this._id = obj && obj._id || null;
        this.project = obj && obj.project || null;
        this.dateAdded = obj && obj.dateAdded || null;
        this.content = obj && obj.content || null;
        this.documentUrl = obj && obj.documentUrl || null;
        this.documentUrlText = obj && obj.documentUrlText || null;
        this.contentUrl = obj && obj.contentUrl || null;
        this.headline = obj && obj.headline || null;
        this.active = obj && obj.active || null;
        this.pinned = obj && obj.pinned || null;
    }
}
