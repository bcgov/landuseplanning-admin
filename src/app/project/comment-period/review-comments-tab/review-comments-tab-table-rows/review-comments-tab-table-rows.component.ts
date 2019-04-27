import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router, ActivatedRoute } from '@angular/router';

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

  ngOnInit() {
    this.projectId = this.storageService.state.currentProject.data._id;
    this.comments = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  goToItem(comment) {
    this.router.navigate([`p/${this.projectId}/cp/${comment.period}/c/${comment._id}/comment-details`]);
  }
}
