export class RecentActivity {
    id: string;
    _id: string;
    project: any;
    type: string;
    dateAdded: string;
    priority: string;
    active: string;
    headline: string;

    constructor(obj?: any) {
        this.id             = obj && obj.id             || null;
        this.type           = obj && obj.type           || null;
        this.project           = obj && obj.project           || null;
        this.dateAdded           = obj && obj.dateAdded           || null;
        this.priority           = obj && obj.priority           || null;
        this.headline           = obj && obj.headline           || null;
        this.active           = obj && obj.active           || null;
    }
}
