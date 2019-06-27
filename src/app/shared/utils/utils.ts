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
}
