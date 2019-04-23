import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { CommentPeriod } from 'app/models/commentPeriod';

import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-comment-period',
  templateUrl: './comment-period.component.html',
  styleUrls: ['./comment-period.component.scss']
})

export class CommentPeriodComponent implements OnInit {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public commentPeriod: CommentPeriod;
  public loading: Boolean = true;
  public projectId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.projectId = this.storageService.state.currentProject._id;

    // get data from route resolver
    if (this.storageService.state.currentCommentPeriod == null) {
      this.route.data
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          (data) => {
            if (data.commentPeriod) {
              this.commentPeriod = data.commentPeriod;
              this.storageService.state.currentCommentPeriod = { type: 'currentCommentPeriod', data: this.commentPeriod };
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
}
