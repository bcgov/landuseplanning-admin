import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelToString'
})
export class CamelToStringPipe implements PipeTransform {

  transform(value: string): string {
      if (value) {
        const newString = value
        .replace(/([a-z\d])([A-Z])/g, '$1' + ' ' + '$2')
        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + ' ' + '$2')
        .toLowerCase()

        return newString.charAt(0).toUpperCase() + newString.slice(1);
      }
    }
}
