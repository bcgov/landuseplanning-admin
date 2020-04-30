import { Injectable } from '@angular/core';

@Injectable()
export class Utils {
  constructor() { }

  public convertJSDateToNGBDate(jSDate: Date) {
    return {
      'year': jSDate.getFullYear(),
      'month': jSDate.getMonth() + 1,
      'day': jSDate.getDate()
    };
  }

  public convertFormGroupNGBDateToJSDate(nGBDate, nGBTime = null) {
    if (nGBTime === null) {
      return new Date(
        nGBDate.year,
        nGBDate.month - 1,
        nGBDate.day
      );
    } else {
      return new Date(
        nGBDate.year,
        nGBDate.month - 1,
        nGBDate.day,
        nGBTime.hour,
        nGBTime.minute,
      );
    }
  }

  public formatBytes(bytes, decimals = 2) {
    if (bytes == null) { return '-'; }
    if (bytes === 0) { return '0 Bytes'; }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Returns ID made up of UNIX timestamp + random number converted to alphanumeric string
  public getRandomID() {
    return new Date().getTime() + '-' + Math.random().toString(32).substr(2,9);
  }
}
