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

  /**
   * Get the current project from local storage. If local storage doesn't contain
   * comment period data, then get comment period and survey data from the
   * route resolver(or notify the user if this fails).
   * 
   * @return {void}
   */
  ngOnInit(): void {
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

  /**
   * Handle a table action to update the response count, then filter the responses.
   * 
   * @param {MouseEvent} $event Mouse event associated with the table.
   * @return {void}
   */
  loadResponseCount($event) {
    this.responseCount = $event.totalCount;
    this.filterResponseSurveys($event.data);
  }

  /**
   * Compile the surveys attached to each response in an array. Then, create a Set
   * from the array.
   * 
   * @param {Array} responseData The survey response data.
   * @return {void}
   */
  filterResponseSurveys(responseData) {
    let responseSurveys = responseData.map(response => response.survey)
    this.responseSurveys = Array.from(new Set(responseSurveys))
  }

  /**
   * Update the comment count.
   * 
   * @param {MouseEvent} $event Click event.
   * @return {void}
   */
  loadCommentCount($event) {
    this.commentCount = $event;
  }

  /**
   * Terminate subscriptions when component is unmounted.
   *
   * @return {void}
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
