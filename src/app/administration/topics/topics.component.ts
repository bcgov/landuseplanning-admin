import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import { PlatformLocation } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { TopicService } from 'app/services/topic.service';

import { TopicTableRowsComponent } from './topic-table-rows/topic-table-rows.component';
import { AddEditTopicComponent } from './add-edit-topic/add-edit-topic.component';

import { Topic } from 'app/models/topic';
import { TableObject } from 'app/shared/components/table-template/table-object';

import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Component({
  selector: 'app-users',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TopicsComponent implements OnInit, OnDestroy {
  public topics: Array<Topic>;
  public loading = true;

  public topicTableData: TableObject;
  public topicTableColumns: any[] = [
    {
      name: 'Name',
      value: 'name',
      width: 'col-4'
    },
    {
      name: 'Description',
      value: 'description',
      width: 'col-4'
    },
    {
      name: 'Type',
      value: 'type',
      width: 'col-1'
    },
    {
      name: 'Pillar',
      value: 'pillar',
      width: 'col-2'
    },
    {
      name: 'Action',
      value: 'null',
      width: 'col-1'
    }
  ];

  public pageNum = 1;
  public pageSize = 10;
  public currentPage = 1;
  public totalListItems = 0;
  public sortBy = '';
  public sortDirection = 0;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private topicService: TopicService,
    private router: Router,
    private modalService: NgbModal,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentPage = params.currentPage ? params.currentPage : 1;
      this.pageSize = params.pageSize || 10;
      this.topicService.getAllTopics(params.currentPage, params.pageSize)
        .takeUntil(this.ngUnsubscribe)
        .subscribe((res: any) => {
          if (res) {
            this.totalListItems = res.totalCount;
            if (this.totalListItems > 0) {
              this.topics = res.data;
              this.setTopicRowData();
            }
          } else {
            alert('Uh-oh, couldn\'t load topics');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        });
    });
  }

  setTopicRowData() {
    let topicList = [];
    this.topics.forEach(topic => {
      topicList.push(
        {
          name: topic.name,
          description: topic.description,
          type: topic.type,
          pillar: topic.pillar,
          _id: topic._id
        }
      );
    });
    this.topicTableData = new TableObject(
      TopicTableRowsComponent,
      topicList,
      {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        totalListItems: this.totalListItems,
        sortBy: this.sortBy,
        sortDirection: this.sortDirection
      }
    );
  }

  setColumnSort(column) {
    this.sortBy = column;
    this.sortDirection = this.sortDirection > 0 ? -1 : 1;
    this.getPaginatedTopics(this.currentPage, this.sortBy, this.sortDirection);
  }

  getPaginatedTopics(pageNumber, sortBy, sortDirection) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    if (sortBy == null) {
      sortBy = this.sortBy;
      sortDirection = this.sortDirection;
    }

    // This accounts for when there is no defined column sort and the user clicks a pagination button.
    // API needs sorting to be null for it to not blow up.
    let sorting = null;
    if (sortBy !== '') {
      sorting = (sortDirection > 0 ? '+' : '-') + sortBy;
    }

    this.topicService.getAllTopics(pageNumber, this.pageSize, sorting)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.currentPage = pageNumber;
        this.sortBy = sortBy;
        this.sortDirection = this.sortDirection;
        this.tableTemplateUtils.updateUrl(sorting, this.currentPage, this.pageSize);
        this.totalListItems = res.totalCount;
        this.topics = res.data;
        this.setTopicRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  addTopic() {
    let dlg = this.modalService.open(AddEditTopicComponent, { backdrop: 'static', windowClass: 'day-calculator-modal' });
    dlg.result.then(result => {
      if (result.isSaved) {
        this.getPaginatedTopics(this.pageNum, this.sortBy, this.sortDirection);
      }
    });
  }
}
