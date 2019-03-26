import { Component, Input, OnInit } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';

@Component({
    selector: 'tbody[app-comment-period-table-rows]',
    templateUrl: './comment-period-table-rows.component.html',
    styleUrls: ['./comment-period-table-rows.component.scss']
})

export class CommentPeriodTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;

    public commentPeriods: any;
    public paginationData: any;

    ngOnInit() {
        this.commentPeriods = this.data.data;
        this.paginationData = this.data.paginationData;
    }
}
