import { Component, OnInit } from '@angular/core';
import { StorageService } from 'app/services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comment-period-banner',
  templateUrl: './comment-period-banner.component.html',
  styleUrls: ['./comment-period-banner.component.scss']
})

export class CommentPeriodBannerComponent implements OnInit {

  public commentPeriod;
  public projectId;

  constructor(
    private router: Router,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.projectId = this.storageService.state.currentProject.data._id;
    if (this.storageService.state.currentProject.data.upcomingCommentPeriod) {
      this.commentPeriod = this.storageService.state.currentProject.data.upcomingCommentPeriod;
    } else {
      this.commentPeriod = null;
    }
  }

  goToViewComments() {
    this.router.navigate(['/p', this.projectId, 'cp', this.commentPeriod._id, 'comment-period-details']);
  }

  goToAddComment() {
    this.router.navigate(['/p', this.projectId, 'cp', this.commentPeriod._id, 'add-comment']);
  }
}
