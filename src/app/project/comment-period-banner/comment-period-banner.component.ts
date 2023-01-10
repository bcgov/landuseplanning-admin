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

  /**
   * Get the comment period from local storage, if it exists therein.
   * 
   * @return {void}
   */
  ngOnInit() {
    this.projectId = this.storageService.state.currentProject.data._id;
    if (this.storageService.state.currentProject.data.commentPeriodForBanner) {
      this.commentPeriod = this.storageService.state.currentProject.data.commentPeriodForBanner;
    } else {
      this.commentPeriod = null;
    }
  }

  /**
   * Navigate the user to the project comments page.
   * 
   * @return {void}
   */
  goToViewComments() {
    this.router.navigate(['/p', this.projectId, 'cp', this.commentPeriod._id, 'comment-period-details']);
  }

  /**
   * Navigate the user to the "Add Comment" page.
   * 
   * @return {void}
   */
  goToAddComment() {
    this.router.navigate(['/p', this.projectId, 'cp', this.commentPeriod._id, 'add-comment']);
  }
}
