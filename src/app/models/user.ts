import * as _ from 'lodash';

export class User {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  displayName: string;
  email: string;
  org: string;
  title: string;
  phoneNumber: string;
  salutation: string;
  department: string;
  faxNumber: string;
  cellPhoneNumber: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  notes: string;

  constructor(obj?: any) {
    Object.keys(obj).map(e => {
        console.log(`key= ${e} value = ${obj[e]}`);
        this[`${e}`] = `${obj[e]}`;
    });
  }
}
