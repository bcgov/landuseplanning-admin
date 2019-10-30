import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

@Component({
  selector: 'tbody[app-shapefile-table-rows]',
  templateUrl: './project-shapefile-table-rows.component.html',
  styleUrls: ['./project-shapefile-table-rows.component.scss']
})

export class ShapefileTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public documents: any;
  public paginationData: any;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    this.documents = this.data.data;
    this.paginationData = this.data.paginationData;
  }

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

  goToItem(item) {
    this.router.navigate(['p', item.project._id, 'project-shapefiles', 'detail', item._id]);
  }
}
