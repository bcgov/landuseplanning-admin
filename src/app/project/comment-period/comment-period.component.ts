import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { CommentPeriod } from 'app/models/commentPeriod';
import { Survey } from 'app/models/survey';

import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-comment-period',
  templateUrl: './comment-period.component.html',
  styleUrls: ['./comment-period.component.scss']
})

export class CommentPeriodComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public commentPeriod: CommentPeriod;
  public surveys: Array<Survey>;
  public surveyCount: number;
  public loading: Boolean = true;
  public currentProject;
  public selectedTab = 0;
  public responseCount: number;
  public commentCount: number;
  public responseSurveys: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
    this.storageService.state.selectedDocumentsForCP = null;
    this.storageService.state.addEditCPForm = null;
    this.storageService.state.currentVCs = null;

    if (this.storageService.state.selectedTab !== null) {
      this.selectedTab = this.storageService.state.selectedTab;
    }

    // get data from route resolver
    if (this.storageService.state.currentCommentPeriod == null) {
      this.route.data
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          (data) => {
            if (data.cpAndSurveys.commentPeriod) {
              this.commentPeriod = data.cpAndSurveys.commentPeriod;
              this.surveys = data.cpAndSurveys.surveys.data;
              this.surveyCount = data.cpAndSurveys.surveys.totalCount;
              this.storageService.state.selectedDocumentsForCP = null;
            } else {
              alert('Uh-oh, couldn\'t load comment period ');
              // comment period not found --> navigate back to search
              this.router.navigate(['/search']);
            }
            this.loading = false;
          }
        );
    } else {
      this.commentPeriod = this.storageService.state.currentCommentPeriod.data;
      this.loading = false;
    }
  }

  loadResponseCount($event) {
    this.responseCount = $event.totalCount;
    this.filterResponseSurveys($event.data);
  }

  filterResponseSurveys(responseData) {
    let responseSurveys = responseData.map(response => response.survey)
    this.responseSurveys = Array.from(new Set(responseSurveys))
  }

  loadCommentCount($event) {
    this.commentCount = $event;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
