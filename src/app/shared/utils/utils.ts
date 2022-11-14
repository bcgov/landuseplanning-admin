import { Injectable } from '@angular/core';

@Injectable()
export class Utils {
  constructor() { }

  /**
   * Convert a Javascript date to a ng Bootstrap date.
   * 
   * @param {Date} jSDate Javascript date object to convert.
   * @returns {object}
   */
  public convertJSDateToNGBDate(jSDate: Date): object {
    return {
      'year': jSDate.getFullYear(),
      'month': jSDate.getMonth() + 1,
      'day': jSDate.getDate()
    };
  }

  /**
   * Convert ng Bootstrap date object to Javascript date object.
   * 
   * @param {object} nGBDate The ng Bootstrap date object.
   * @param {object} nGBTime The ng Bootstrap time object.
   * @returns {Date}
   */
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

  /**
   * Format a number of bytes into a human-readable string with units.
   *
   * @param bytes The number of bytes.
   * @param decimals The number of decimal places to use.
   * @returns The human readable string.
   */
  public formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes == null) { return '-'; }
    if (bytes === 0) { return '0 Bytes'; }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Returns ID made up of UNIX timestamp + random number converted to alphanumeric string. 
   * 
   * @returns {Date}
   */
  public getRandomID() {
    return new Date().getTime() + '-' + Math.random().toString(32).substr(2,9);
  }
}
