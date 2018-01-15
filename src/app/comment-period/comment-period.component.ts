import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { CommentPeriod } from '../models/commentperiod';
// import { CommentPeriodService } from '../services/commentperiod.service';
// import { CommentService } from '../services/comment.service';
// import { ApiService } from '../services/api';

@Component({
  selector: 'app-comment-period',
  templateUrl: './comment-period.component.html',
  styleUrls: ['./comment-period.component.scss']
})

export class CommentPeriodComponent implements OnInit, OnDestroy {
  // public properties
  public loading: boolean;
  public commentperiod: CommentPeriod;
  public numComments: Number;


  // private fields
  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    // private commentPeriodService: CommentPeriodService,
    // private api: ApiService,
  ) { }

  ngOnInit() {
    this.loading = true;

    // this.commentService.getAll().subscribe(
    //   data => { this.numComments = data ? data.length : 0; },
    //   error => {
    //     // If 403, redir to /login.
    //     this.router.navigate(['/login']);
    //     console.log(error);
    //   }
    // );

    // wait for the resolver to retrieve the commentperiod details from back-end
    this.sub = this.route.data.subscribe(
      (data: { commentperiod: CommentPeriod }) => {
        this.loading = false;
        this.commentperiod = data.commentperiod;

        // TODO: display anyway; prompt to create new comment period
        // comment period not found --> navigate back to application list
        // if (!this.application || !this.application._id) {
        //   console.log('Application not found!');
        //   this.gotoApplicationList();
        // }
      },
      error => console.log(error)
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
