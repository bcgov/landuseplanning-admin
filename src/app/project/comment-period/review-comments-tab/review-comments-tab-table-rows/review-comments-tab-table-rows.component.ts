import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

import { Comment } from 'app/models/comment';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'tbody[app-review-comments-tab-table-rows]',
  templateUrl: './review-comments-tab-table-rows.component.html',
  styleUrls: ['./review-comments-tab-table-rows.component.scss']
})

export class ReviewCommentsTabTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public comments: Comment[];
  public paginationData: any;
  public projectId: string;

  constructor(
    private router: Router,
    private storageService: StorageService
  ) { }

  /**
   * Set the project ID from local storage, get the comments data and the
   * pagination data.
   * 
   * @return {void}
   */
  ngOnInit(): void {
    this.projectId = this.storageService.state.currentProject.data._id;
    this.comments = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  /**
   * Navigate the user to a table item when it's clicked on.
   * 
   * @param {Comment} comment The comment to navigate to.
   * @return {void}
   */
  goToItem(comment): void {
    this.router.navigate([`p/${this.projectId}/cp/${comment.period}/c/${comment._id}/comment-details`]);
  }
}
