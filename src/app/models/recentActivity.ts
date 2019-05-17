export class RecentActivity {
    _id: string;
    project: any;
    type: string;
    dateAdded: string;
    priority: string;
    active: string;
    headline: string;
    content: string;
    pinned: boolean;

    constructor(obj?: any) {
        this._id             = obj && obj._id             || null;
        this.type           = obj && obj.type           || null;
        this.project           = obj && obj.project           || null;
        this.dateAdded           = obj && obj.dateAdded           || null;
        this.content           = obj && obj.content           || null;
        this.priority           = obj && obj.priority           || null;
        this.headline           = obj && obj.headline           || null;
        this.active           = obj && obj.active           || null;
        this.pinned           = obj && obj.pinned           || null;
    }
}
