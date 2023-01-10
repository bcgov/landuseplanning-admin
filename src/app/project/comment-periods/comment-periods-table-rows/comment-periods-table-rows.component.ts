import { Component, Input, OnInit } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

@Component({
    selector: 'tbody[app-comment-periods-table-rows]',
    templateUrl: './comment-periods-table-rows.component.html',
    styleUrls: ['./comment-periods-table-rows.component.scss']
})

export class CommentPeriodsTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;

    public commentPeriods: any;
    public paginationData: any;

    constructor(
        private router: Router
    ) { }

    /**
     * Get the comment periods and pagination data from the route resolver.
     * 
     * @return {void}
     */
    ngOnInit(): void {
        this.commentPeriods = this.data.data;
        this.paginationData = this.data.paginationData;
    }

    /**
     * Navigate the user to the comment period.
     * 
     * @param {CommentPeriod} commentPeriod The comment period to navigate to.
     * @return {void}
     */
    goToItem(commentPeriod): void {
        this.router.navigate([`p/${commentPeriod.project}/cp/${commentPeriod._id}/comment-period-details`]);
    }
}
