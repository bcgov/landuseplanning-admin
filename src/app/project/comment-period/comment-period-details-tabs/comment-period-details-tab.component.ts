import { Component, Input, OnInit } from '@angular/core';
import { CommentPeriod } from 'app/models/commentPeriod';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Subject } from 'rxjs/Subject';
import { MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-comment-period-details-tab',
  templateUrl: './comment-period-details-tab.component.html',
  styleUrls: ['./comment-period-details-tab.component.scss']
})

export class CommentPeriodDetailsTabComponent implements OnInit {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  @Input() public commentPeriod: CommentPeriod;

  public commentPeriodPublishedStatus: string;
  public publishAction: string;
  public projectId: string;
  public loading = true;

  constructor(
    private commentPeriodService: CommentPeriodService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.setPublishStatus();

    this.route.parent.params.subscribe(params => {
      this.projectId = params.projId;
      this.loading = false;
    });

  }

  setPublishStatus() {
    this.commentPeriodPublishedStatus = this.commentPeriod.isPublished ? 'Published' : 'Not Published';
    this.publishAction = this.commentPeriod.isPublished ? 'Un-Publish' : 'Publish';
  }

  public togglePublishState() {
    if (confirm(`Are you sure you want to ${this.publishAction} this comment period?`)) {
      this.loading = true;
      if (this.commentPeriod.isPublished) {
        this.commentPeriodService.unPublish(this.commentPeriod)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            (res => {
              this.commentPeriod.isPublished = false;
              this.setPublishStatus();
              this.openSnackBar('This comment period has been un-published.', 'Close');
              this.loading = false;
            })
          );
      } else {
        this.commentPeriodService.publish(this.commentPeriod)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            (res => {
              this.commentPeriod.isPublished = true;
              this.setPublishStatus();
              this.openSnackBar('This comment period has been published.', 'Close');
              this.loading = false;
            })
          );
      }
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  editCommentPeriod() {
    this.router.navigateByUrl(`/p/${this.projectId}/cp/${this.commentPeriod._id}/edit`);
  }

  deleteCommentPeriod() {
    if (confirm(`Are you sure you want to delete this comment period?`)) {
      this.loading = true;
      this.commentPeriodService.delete(this.commentPeriod)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            console.log('error =', error);
            alert('Uh-oh, couldn\'t delete comment period');
          },
          () => { // onCompleted
            // delete succeeded --> navigate back to search
            // Clear out the document state that was stored previously.
            this.loading = false;
            this.openSnackBar('This comment period has been deleted', 'Close');
            this.router.navigate(['p', this.projectId, 'comment-periods']);
          }
        );
    }
  }
}
