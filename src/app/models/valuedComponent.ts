export class ValuedComponent {
    _id: string;
    _schemaName: String;
    code: String;
    description: String;
    name: String;
    parent: String;
    pillar: String;
    project: String;
    stage: String;
    title: String;
    type: String;
    topic: String;

    // Permissions
    read: Array<String> = [];
    write: Array<String> = [];
    delete: Array<String> = [];

    constructor(obj?: any) {
        this._id         = obj && obj._id         || null;
        this.topic         = obj && obj.topic         || null;
        this._schemaName = obj && obj._schemaName || null;
        this.code        = obj && obj.code        || null;
        this.description = obj && obj.description || null;
        this.name        = obj && obj.name        || null;
        this.parent      = obj && obj.parent      || null;
        this.pillar      = obj && obj.pillar      || null;
        this.project     = obj && obj.project     || null;
        this.stage       = obj && obj.stage       || null;
        this.title       = obj && obj.title       || null;
        this.type        = obj && obj.type        || null;

        this.read        = obj && obj.read        || null;
        this.write       = obj && obj.write       || null;
        this.delete      = obj && obj.delete      || null;
    }
}
