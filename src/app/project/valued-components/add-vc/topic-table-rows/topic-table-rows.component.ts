import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';

@Component({
    selector: 'tbody[app-topic-table-rows]',
    templateUrl: './topic-table-rows.component.html',
    styleUrls: ['./topic-table-rows.component.scss']
})

export class TopicTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;
    @Output() selectedCount: EventEmitter<any> = new EventEmitter();

    public topics: any;
    public paginationData: any;

    ngOnInit() {
        this.topics = this.data.data;
        this.paginationData = this.data.paginationData;
    }

    selectItem(item) {
      item.checkbox = !item.checkbox;

      let count = 0;
      this.topics.map(row => {
        if (row.checkbox === true) {
          count++;
        }
      });
      this.selectedCount.emit(count);
    }
}
