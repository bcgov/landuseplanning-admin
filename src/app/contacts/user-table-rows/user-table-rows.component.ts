import { Component, Input, OnInit } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-table-rows',
  templateUrl: './user-table-rows.component.html',
  styleUrls: ['./user-table-rows.component.scss']
})
export class UserTableRowsComponent implements OnInit {
    @Input() data: TableObject;

    public contacts: any;
    public paginationData: any;

    constructor(
        private router: Router
    ) { }

    ngOnInit() {
        this.contacts = this.data.data;
        this.paginationData = this.data.paginationData;
    }

    editContact(contact) {
      console.log('edit contact:', contact);
      this.router.navigate([`contacts/${contact._id}/edit`]);
    }
}
