import { Pipe, PipeTransform } from '@angular/core';

//
// Filter to handle JSON->HTML newlines.
//
@Pipe({
  name: 'newlines'
})

export class NewlinesPipe implements PipeTransform {
  transform(value: any): any {
    const input = value || '';
    return input.replace(/\\n/g, '<br />');
  }
}
