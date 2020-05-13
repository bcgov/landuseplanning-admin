import { Directive, ViewChild, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[scrollListen]'
})
export class ScrollListenDirective {
  @ViewChild('componentsPane') componentsPane;

  // @HostBinding('class.survey-components-view') surveyComponents: string;

  @HostListener('scroll', ['$event'])
  onScroll(event) {

    // console.log('the vent', event, this.componentsPane )
    // this.scrollArea
  }
}
