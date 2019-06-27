import * as _ from 'lodash';

export class Org {
  _id: String;
  description: String;
  name: String;
  code: String;
  updatedBy: String;
  dateAdded: String;
  country: String;
  postal: String;
  province: String;
  city: String;
  address1: String;
  address2: String;
  companyType: String;
  parentCompany: String;
  registeredIn: String;
  companyLegal: String;
  website: String;
  company: String;

  constructor(obj?: any) {
    Object.keys(obj).map(e => {
        console.log(`key= ${e} value = ${obj[e]}`);
        this[`${e}`] = `${obj[e]}`;
    });
  }
}
