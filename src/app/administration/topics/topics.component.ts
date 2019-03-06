import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlatformLocation } from '@angular/common';
import { DialogService } from 'ng2-bootstrap-modal';

import { Topic } from 'app/models/topic';
import { TopicService } from 'app/services/topic.service';
import { AddEditTopicComponent } from 'app/administration/topics/add-edit-topic/add-edit-topic.component';
import { ModalResult } from 'app/administration/topics/add-edit-topic/add-edit-topic.component';
import { ConfirmComponent } from 'app/confirm/confirm.component';

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
  public pageSize = 15;
  public currentPage = 1;
  public totalTopics = 0;
  public sortBy = '';
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private platformLocation: PlatformLocation,
    private route: ActivatedRoute,
    private topicService: TopicService,
    private dialogService: DialogService,
    private router: Router,
    private modalService: NgbModal,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentPage = params.currentPage;
      this.pageSize = params.pageSize || 15;
      this.topicService.getAllTopics(params.currentPage, params.pageSize, '')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.topicsLoading = false;
        this.totalTopics = res.totalCount;
        this.topics = res.data;
        this._changeDetectionRef.detectChanges();
      });
    });
  }

  deleteVC(vc) {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Delete Valued Component',
        message: 'Click OK to delete this Valued Component or Cancel to return to the list.'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            // Delete the VC
            this.topicService.delete(vc)
            .subscribe(
              () => {
                this.getPaginatedTopics(this.currentPage);
              },
              error => {
                console.log('error =', error);
              });
          }
        }
      );
  }

  editVC(vc) {
    let dlg = this.modalService.open(AddEditTopicComponent, { backdrop: 'static', windowClass: 'day-calculator-modal' });
    dlg.componentInstance.model = vc;
    dlg.result.then(result => {
      switch (result) {
        case ModalResult.Save:
          this.getPaginatedTopics(this.currentPage);
        break;
      }
    });
    return;
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
    currentUrl = (this.platformLocation as any).getBaseHrefFromDOM() + currentUrl.slice(1);
    currentUrl = currentUrl.split('?')[0];
    currentUrl += `?currentPage=${this.currentPage}&pageSize=${this.pageSize}`;
    currentUrl += '&ms=' + new Date().getTime();
    window.history.replaceState({}, '', currentUrl);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
