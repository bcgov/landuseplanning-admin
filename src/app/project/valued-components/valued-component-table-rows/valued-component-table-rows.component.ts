import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';

@Component({
    selector: 'tbody[app-valued-component-table-rows]',
    templateUrl: './valued-component-table-rows.component.html',
    styleUrls: ['./valued-component-table-rows.component.scss']
})

export class ValuedComponentTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;
    @Output() selectedCount: EventEmitter<any> = new EventEmitter();

    public valuedComponents: any;
    public paginationData: any;

    ngOnInit() {
        this.valuedComponents = this.data.data;
        this.paginationData = this.data.paginationData;
    }

    selectItem(item) {
      item.checkbox = !item.checkbox;

      let count = 0;
      this.valuedComponents.map(row => {
        if (row.checkbox === true) {
          count++;
        }
      });
      this.selectedCount.emit(count);
    }
}
