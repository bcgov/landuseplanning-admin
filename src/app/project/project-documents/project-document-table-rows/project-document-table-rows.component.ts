import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { Utils } from 'app/shared/utils/utils';

@Component({
  selector: 'tbody[app-document-table-rows]',
  templateUrl: './project-document-table-rows.component.html',
  styleUrls: ['./project-document-table-rows.component.scss']
})

export class DocumentTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public documents: any;
  public paginationData: any;

  constructor(
    public utils: Utils,
    private router: Router
  ) { }

  /**
   * Get the documents and pagination data from the route resolver.
   * 
   * @return {void}
   */
  ngOnInit(): void {
    this.documents = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  /**
   * 
   * @param item 
   */
  selectItem(item) {
    item.checkbox = !item.checkbox;

    let count = 0;
    this.documents.map(doc => {
      if (doc.checkbox === true) {
        count++;
      }
    });
    this.selectedCount.emit(count);
  }

  /**
   * Navigate the user to the document(file).
   * 
   * @param {Document} item The document to navigate to.
   * @return {void}
   */
  goToItem(item): void {
    this.router.navigate(['p', item.project._id, 'project-files', 'detail', item._id]);
  }
}
