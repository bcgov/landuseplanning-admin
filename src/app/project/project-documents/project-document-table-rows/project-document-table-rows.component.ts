import { Component, Input, OnInit } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';

@Component({
    selector: 'tbody[app-document-table-rows]',
    templateUrl: './project-document-table-rows.component.html'
})

export class DocumentTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;

    public documents: any;
    public paginationData: any;

    ngOnInit() {
        this.documents = this.data.data;
        this.paginationData = this.data.paginationData;
    }
}
