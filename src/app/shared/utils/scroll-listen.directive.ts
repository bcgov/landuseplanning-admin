import { Directive, ViewChild } from '@angular/core';

@Directive({
  selector: '[scrollListen]'
})
export class ScrollListenDirective {
  @ViewChild('componentsPane') componentsPane;
}
