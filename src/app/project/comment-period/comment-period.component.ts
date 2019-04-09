import { Component, OnInit } from '@angular/core';
import { CommentPeriod } from 'app/models/commentPeriod';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-comment-period',
  templateUrl: './comment-period.component.html',
  styleUrls: ['./comment-period.component.scss']
})

export class CommentPeriodComponent implements OnInit {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public projectId: string;
  commentPeriod: CommentPeriod;
  loading: Boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      this.projectId = params.projId;
    });

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data) => {
          if (data.commentPeriod) {
            this.commentPeriod = data.commentPeriod;
            this.storageService.state = { type: 'currentCommentPeriod', data: this.commentPeriod };
          } else {
            alert('Uh-oh, couldn\'t load comment period ');
            // comment period not found --> navigate back to search
            this.router.navigate(['/search']);
          }
          this.loading = false;
        }
      );
  }
}
