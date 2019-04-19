import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { ActivatedRoute, Router } from '@angular/router';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { Subject } from 'rxjs';
import { RecentActivity } from 'app/models/recentActivity';
import { SearchService } from 'app/services/search.service';
import { ActivityTableRowsComponent } from './activity-table-rows/activity-table-rows.component';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public loading = true;
  public totalCount = 0;

  public pageNum = 0;
  public sortBy = '';
  public sortDirection = 0;
  public pageSize = 10;
  public keywords = '';

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public entries: RecentActivity[] = null;
  public tableColumns: any[] = [
    {
      name: 'Headline',
      value: 'headline',
      width: 'col-4'
    },
    {
      name: 'Project',
      value: 'project',
      width: 'col-2'
    },
    {
      name: 'Type',
      value: 'type',
      width: 'col-2'
    },
    {
      name: 'Date Added',
      value: 'dateAdded',
      width: 'col-2'
    },
    {
      name: 'Priority',
      value: 'priority',
      width: 'col-1'
    },
    {
      name: 'Status',
      value: 'active',
      width: 'col-1'
    }
  ];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private _changeDetectionRef: ChangeDetectorRef,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          if (res.activities[0].data.meta && res.activities[0].data.meta.length > 0) {
            this.totalCount = res.activities[0].data.meta[0].searchResultsTotal;
            this.entries = res.activities[0].data.searchResults;
          } else {
            this.totalCount = 0;
            this.entries = [];
          }
          this.loading = false;
          this.setRowData();
        } else {
          alert('Uh-oh, couldn\'t load valued components');
          // project not found --> navigate back to search
          // this.router.navigate(['/search']);
          this.loading = false;
        }
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      }
    );
  });

  }

  setRowData() {
    let list = [];
    if (this.entries && this.entries.length > 0) {
      this.entries.forEach(item => {
        list.push(
          {
            _id: item._id,
            project: item.project,
            headline: item.headline,
            type: item.type,
            dateAdded: item.dateAdded,
            priority: item.priority,
            active: item.active
          }
        );
      });
      this.tableData = new TableObject(
        ActivityTableRowsComponent,
        list,
        {
          pageSize: this.pageSize,
          currentPage: this.tableParams.currentPage,
          totalListItems: this.totalCount,
          sortBy: this.sortBy,
          sortDirection: this.sortDirection
        }
      );
    }
  }

  setColumnSort(column) {
    this.tableParams.sortBy = column;
    this.tableParams.sortDirection = this.tableParams.sortDirection > 0 ? -1 : 1;
    this.getPaginated(this.tableParams.currentPage, this.tableParams.sortBy, this.tableParams.sortDirection);
  }

  getPaginated(pageNumber, newSortBy, newSortDirection) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    let sorting = null;
    if (newSortBy) {
      sorting = (newSortDirection > 0 ? '+' : '-') + newSortBy;
    }

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, newSortBy, newSortDirection);

    this.searchService.getSearchResults('',
                                        'RecentActivity',
                                        null,
                                        pageNumber,
                                        this.tableParams.pageSize,
                                        sorting,
                                        null)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res[0].data.meta && res[0].data.meta.length > 0) {
          this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
          this.entries = res[0].data.searchResults;
        }
        this.tableTemplateUtils.updateUrl(this.tableParams.sortString, this.tableParams.currentPage, this.tableParams.pageSize);
        this.setRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

}
