import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newlines'
})
export class NewlinesPipe implements PipeTransform {

  /**
   * Filter to change newlines to HTML linebreaks.
   * 
   * @param {any} value Value to change.
   * @returns {any} 
   */
  transform(value: any): any {
    const input = value || '';
    return input.replace(/\n/g, '<br />');
  }
}
