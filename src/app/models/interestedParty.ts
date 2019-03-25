export class InterestedParty {
  divisionBranch: string;
  interestedPartyType: string;
  legalName: string;
  firstName: string;
  lastName: string;

  constructor(obj?: any) {
    this.divisionBranch = (obj && obj.divisionBranch) || null;
    this.interestedPartyType = (obj && obj.interestedPartyType) || null;
    this.legalName = (obj && obj.legalName) || null;
    this.firstName = (obj && obj.firstName) || null;
    this.lastName = (obj && obj.lastName) || null;
  }
}
