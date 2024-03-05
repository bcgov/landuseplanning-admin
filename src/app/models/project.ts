import { CommentPeriod } from './commentPeriod';
import * as moment from 'moment';

export class Project {
  // The following are retrieved from the API.
  _id: string;
  existingLandUsePlans: {existingLandUsePlan: string, existingLandUsePlanURL: string}[];
  centroid: any[] = [];
  description: String;
  details: String;
  engagementStatus: String;
  logos: ProjectLogo[];
  backgroundInfo: String;
  backgroundImage: string;
  engagementLabel: String;
  engagementInfo: String;
  documentInfo: String;
  overlappingRegionalDistricts: String[];
  name: string;
  partner: String;
  region: String;
  agreements: { agreementName: string, agreementUrl: string }[];

  // Everything else.
  addedBy: String;
  existingLandUsePlanURLs: String;
  code: String;
  commodity: String;
  commentPeriods: CommentPeriod[];
  currentPhaseName: string;
  dateAdded: String;
  dateUpdated: String;
  duration: String;
  // TODO: directoryStructure.
  eaoMember: String;
  epicProjectID: Number;
  fedElecDist: String;
  isTermsAgreed: Boolean;
  overallProgress: Number;
  primaryContact: String;
  proMember: String;
  provElecDist: String;
  shortName: String;
  projectPhase: String;
  substitution: Boolean;
  updatedBy: String;
  isPublished: boolean;

  eaDecision: any;

  // Project contacts.
  projectLead: any;
  projectDirector: any;

  // Options
  activitiesAndUpdatesEnabled: Boolean;
  contactFormEnabled: Boolean;
  contactFormEmails: string[];

  // Permissions.
  read: Array<String> = [];
  write: Array<String> = [];
  delete: Array<String> = [];

  pins: any[] = [];
  currentPeriods: CommentPeriod[];
  commentPeriodForBanner: any;

  isMatches = true;
  isVisible = true;
  isLoaded = false;

  constructor(obj?: any) {
    this._id                 = obj && obj._id                 || null;
    this.existingLandUsePlans = obj && obj.existingLandUsePlans     || undefined;
    this.commentPeriodForBanner         = obj && obj.commentPeriodForBanner         || undefined;
    this.description         = obj && obj.description         || undefined;
    this.details         = obj && obj.details         || undefined;
    this.engagementStatus = obj && obj.engagementStatus || undefined;
    this.logos            = obj && obj.logos || undefined;
    this.backgroundInfo = obj && obj.backgroundInfo || undefined;
    this.backgroundImage = obj && obj.backgroundImage || undefined;
    this.engagementLabel = obj && obj.engagementLabel || undefined;
    this.engagementInfo = obj && obj.engagementInfo || undefined;
    this.documentInfo = obj && obj.documentInfo || undefined;
    this.overlappingRegionalDistricts = obj && obj.overlappingRegionalDistricts            || undefined;
    this.name                = obj && obj.name                || undefined;
    this.partner = obj && obj.partner || undefined;
    this.region              = obj && obj.region              || undefined;
    this.agreements       = obj && obj.agreements                || undefined;
    this.addedBy             = obj && obj.addedBy             || undefined;

    this.eaDecision           = obj && obj.eaDecision               || undefined;

    this.existingLandUsePlanURLs     = obj && obj.existingLandUsePlanURLs     || undefined;
    this.code                        = obj && obj.code                        || undefined;
    this.commodity                   = obj && obj.commodity                   || undefined;
    this.currentPhaseName            = obj && obj.currentPhaseName            || undefined;
    this.dateAdded                   = obj && obj.dateAdded                   || undefined;
    this.dateUpdated                 = obj && obj.dateUpdated                 || undefined;
    this.duration                    = obj && obj.duration                    || undefined;
    this.eaoMember                   = obj && obj.eaoMember                   || undefined;
    this.epicProjectID               = obj && obj.epicProjectID               || undefined;
    this.fedElecDist                 = obj && obj.fedElecDist                 || undefined;
    this.isTermsAgreed               = obj && obj.isTermsAgreed               || undefined;
    this.overallProgress             = obj && obj.overallProgress             || undefined;
    this.primaryContact              = obj && obj.primaryContact              || undefined;
    this.proMember                   = obj && obj.proMember                   || undefined;
    this.provElecDist                = obj && obj.provElecDist                || undefined;
    this.shortName                   = obj && obj.shortName                   || undefined;
    this.projectPhase                = obj && obj.projectPhase                || undefined;
    this.substitution                = obj && obj.substitution                || undefined;
    this.updatedBy                   = obj && obj.updatedBy                   || undefined;
    this.read                        = obj && obj.read                        || undefined;
    this.write                       = obj && obj.write                       || undefined;
    this.delete                      = obj && obj.delete                      || undefined;

    this.projectLead                 = obj && obj.projectLead                 || undefined;
    this.projectDirector             = obj && obj.projectDirector             || undefined;

    this.activitiesAndUpdatesEnabled = obj && obj.activitiesAndUpdatesEnabled || undefined;
    this.contactFormEnabled = obj && obj.contactFormEnabled || undefined;
    this.contactFormEmails = obj && obj.contactFormEmails || undefined;

    // copy pins
    if (obj && obj.pins) {
      obj.pins.forEach(pin => {
        this.pins.push(pin);
      });
    }

    if (obj && obj.read) {
      this.isPublished = obj.read.includes('public');
    }

    // copy centroid
    if (obj && obj.centroid) {
      obj.centroid.forEach(num => {
        this.centroid.push(num);
      });
    }

    if (obj && obj.currentPeriods) {
      this.commentPeriods.push(obj.currentPeriods);

      let now = moment('YYYY-MM-DD');

      this.commentPeriods.forEach(period => {
        // TODO: Update comment period model. Should actually be period.dateEnded or something.
        if (moment(period.dateCompleted) > now) {
          this.currentPeriods.push(obj.currentPeriods);
        }
      });
    }
  }
}

export interface ProjectLogo {
  document: string;
  name: string;
  alt: string;
  link: string;
}
