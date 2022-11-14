import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'published'
})
export class PublishedPipe implements PipeTransform {

  /**
   * Filter to return only published items from an array.
   * 
   * @param {array} items Items to check for isPublished values.
   * @returns {any} 
   */
  transform(items: any[]): any {
    if (!items) {
      return items;
    }
    return items.filter(item => item.isPublished);
  }
}
