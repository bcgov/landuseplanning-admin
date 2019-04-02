import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

@Component({
  selector: 'tbody[app-review-comments-tab-table-rows]',
  templateUrl: './review-comments-tab-table-rows.component.html',
  styleUrls: ['./review-comments-tab-table-rows.component.scss']
})

export class ReviewCommentsTabTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public comments: any;
  public paginationData: any;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    this.comments = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  selectItem(item) {
    item.checkbox = !item.checkbox;

    let count = 0;
    this.comments.map(c => {
      if (c.checkbox === true) {
        count++;
      }
    });
    this.selectedCount.emit(count);
  }

  goToItem(item) {
    // this.router.navigate([`p/${item.project}/project-documents/${item._id}`]);
  }
}
