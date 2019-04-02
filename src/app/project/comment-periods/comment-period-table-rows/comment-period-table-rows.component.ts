import { Component, Input, OnInit } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

@Component({
    selector: 'tbody[app-comment-period-table-rows]',
    templateUrl: './comment-period-table-rows.component.html',
    styleUrls: ['./comment-period-table-rows.component.scss']
})

export class CommentPeriodTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;

    public commentPeriods: any;
    public paginationData: any;

    constructor(
        private router: Router
    ) { }

    ngOnInit() {
        this.commentPeriods = this.data.data;
        this.paginationData = this.data.paginationData;
    }

    goToItem(item) {
        console.log(`p/${item.project}/cp/${item._id}`);
        this.router.navigate([`p/${item.project}/cp/${item._id}`]);
    }
}
