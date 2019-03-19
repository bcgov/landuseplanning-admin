import { Component, Input, OnInit, ComponentFactoryResolver, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';

import { TableDirective } from './table.directive';
import { TableObject } from './table-object';
import { TableComponent } from './table.component';

@Component({
  selector: 'app-table-template',
  templateUrl: './table-template.component.html',
  styleUrls: ['./table-template.component.scss']
})
export class TableTemplateComponent implements OnInit, OnDestroy {
  @Input() data: TableObject;
  @Input() columns: String[];
  @ViewChild(TableDirective) tableHost: TableDirective;

  @Output() onPageNumUpdate: EventEmitter<any> = new EventEmitter();

  interval: any;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  loadComponent() {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.data.component);

    let viewContainerRef = this.tableHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<TableComponent>componentRef.instance).data = this.data;
  }

  updatePageNumber(pageNum) {
    this.onPageNumUpdate.emit(pageNum);
  }
}
