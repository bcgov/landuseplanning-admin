import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from 'app/services/config.service';

@Pipe({
  name: 'listConverter'
})
export class ListConverterPipe implements PipeTransform {
  private configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

  /**
   * Translate an ID for a piece of config into its underlying value. Helps to
   * access values in the ConfigService.
   * 
   * @see ConfigService
   * 
   * @param {any} objectid The object ID to pass to the config service.
   * @returns {any}
   */
  transform(objectid: any): any {
    if (!objectid) {
      return '-';
    }
    // Grab the item from the constant lists, returning the name field of the object.
    let item = this.configService.lists.filter(listItem => listItem._id === objectid);
    if (item.length !== 0) {
      return item[0].name;
    } else {
      return '-';
    }
  }
}
