import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';

import { Topic } from 'app/models/topic';
import { TopicService } from 'app/services/topic.service';
// import { AddEditUserComponent } from 'app/administration/users/add-edit-user/add-edit-user.component';

@Component({
  selector: 'app-users',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TopicsComponent implements OnInit, OnDestroy {
  public topics: Array<Topic>;
  public topicsLoading = true;
  public pageNum = 1;
  public pageSize = 10;
  public currentPage = 1;
  public totalTopics = 0;
  public sortBy = '';
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private topicService: TopicService,
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.topicService.getAllTopics(1, 10, '')
    .takeUntil(this.ngUnsubscribe)
    .subscribe((res: any) => {
      this.topicsLoading = false;
      this.totalTopics = res.totalCount;
      this.topics = res.data;
      this._changeDetectionRef.detectChanges();
    });
  }

  getPaginatedTopics(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);

    this.topicsLoading = true;
    this.topicService.getAllTopics(pageNumber, this.pageSize)
    .takeUntil(this.ngUnsubscribe)
    .subscribe((res: any) => {
      this.currentPage = pageNumber;
      this.updateUrl();
      this.totalTopics = res.totalCount;
      this.topics = res.data;
      this.topicsLoading = false;
      this._changeDetectionRef.detectChanges();
    });
  }

  updateUrl() {
    let currentUrl = this.router.url;
    currentUrl = currentUrl.split('?')[0];
    currentUrl += `?currentPage=${this.currentPage}&pageSize=${this.pageSize}`;
    window.history.replaceState({}, '', currentUrl);
  }

  // addUser() {
  //   this.dialogService.addDialog(AddEditUserComponent,
  //     {
  //       title: 'Create User',
  //       message: 'Add',
  //       model: null
  //     }, {
  //       // index: 0,
  //       // autoCloseTimeout: 10000,
  //       // closeByClickingOutside: true,
  //       backdropColor: 'rgba(0, 0, 0, 0.5)'
  //     })
  //     .takeUntil(this.ngUnsubscribe)
  //     .subscribe(
  //       isConfirmed => {
  //         // we get dialog result
  //         if (isConfirmed) {
  //           // console.log('saved');
  //           this.refreshUsersUI();
  //         } else {
  //           // console.log('canceled');
  //         }
  //       }
  //     );
  // }

  // selectUser(user) {
  //   this.dialogService.addDialog(AddEditUserComponent,
  //     {
  //       title: 'Edit User',
  //       message: 'Save',
  //       model: user
  //     }, {
  //       // index: 0,
  //       // autoCloseTimeout: 10000,
  //       // closeByClickingOutside: true,
  //       backdropColor: 'rgba(0, 0, 0, 0.5)'
  //     })
  //     .takeUntil(this.ngUnsubscribe)
  //     .subscribe((isConfirmed) => {
  //       // we get dialog result
  //       if (isConfirmed) {
  //         // console.log('saved');
  //         this.refreshUsersUI();
  //       } else {
  //         // console.log('canceled');
  //       }
  //     });
  // }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
