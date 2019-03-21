import { Pipe, PipeTransform } from '@angular/core';
import { Application } from 'app/models/application';

@Pipe({
  name: 'objectFilter'
})
export class ObjectFilterPipe implements PipeTransform {
  transform(value: Application[], q: string) {
    if (!q || q === '') {
      return value;
    }
    return value.filter(item => -1 < item.name.toLowerCase().indexOf(q.toLowerCase()));
  }
}
