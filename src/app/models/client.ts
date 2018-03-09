export class Client {
    ORGANIZATIONS_LEGAL_NAME: string;
    INDIVIDUALS_FIRST_NAME: string;
    INDIVIDUALS_LAST_NAME: string;
    CITY: string;
    PROVINCE_ABBREVIATION: string;
    STATE_ABBREVIATION: string;
    COUNTRY: string;
    DISPOSITION_TRANSACTION_SID: number;
    INTERESTED_PARTY_SID: number;

    constructor(obj?: any) {
        this.ORGANIZATIONS_LEGAL_NAME       = obj && obj.ORGANIZATIONS_LEGAL_NAME       || null;
        this.INDIVIDUALS_FIRST_NAME         = obj && obj.INDIVIDUALS_FIRST_NAME         || null;
        this.INDIVIDUALS_LAST_NAME          = obj && obj.INDIVIDUALS_LAST_NAME          || null;
        this.CITY                           = obj && obj.CITY                           || null;
        this.PROVINCE_ABBREVIATION          = obj && obj.PROVINCE_ABBREVIATION          || null;
        this.STATE_ABBREVIATION             = obj && obj.STATE_ABBREVIATION             || null;
        this.COUNTRY                        = obj && obj.COUNTRY                        || null;
        this.DISPOSITION_TRANSACTION_SID    = obj && obj.DISPOSITION_TRANSACTION_SID    || null;
        this.INTERESTED_PARTY_SID           = obj && obj.INTERESTED_PARTY_SID           || null;
    }
}
