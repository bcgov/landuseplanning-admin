import { Component, OnInit, Input } from '@angular/core';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableComponent } from 'app/shared/components/table-template/table.component';

@Component({
  selector: 'tbody[app-email-subscribe-table-rows]',
  templateUrl: './email-subscribe-table-rows.component.html',
  styleUrls: ['./email-subscribe-table-rows.component.scss']
})
export class EmailSubscribeTableRowsComponent implements OnInit, TableComponent {

  @Input() data: TableObject;

  public entries: any;

  constructor() { }

  async ngOnInit() {
    //console.log('This.data', this.data);
    this.entries = this.data.data;
  }

}
