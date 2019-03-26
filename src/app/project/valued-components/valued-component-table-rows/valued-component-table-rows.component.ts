import { Component, Input, OnInit } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';

@Component({
    selector: 'tbody[app-valued-component-table-rows]',
    templateUrl: './valued-component-table-rows.component.html',
    styleUrls: ['./valued-component-table-rows.component.scss']
})

export class ValuedComponentTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;

    public valuedComponents: any;
    public paginationData: any;

    ngOnInit() {
        this.valuedComponents = this.data.data;
        this.paginationData = this.data.paginationData;
    }
}
