import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';

@Component({
  selector: 'tbody[app-contact-select-table-rows]',
  templateUrl: './contact-select-table-rows.component.html',
  styleUrls: ['./contact-select-table-rows.component.scss']
})

export class ContactSelectTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public users: any;
  public paginationData: any;

  constructor(
    private router: Router,
    private navigationStackUtils: NavigationStackUtils,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.users = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  selectItem(item) {
    if (this.storageService.state.contactType === 'projectLead') {
      this.storageService.state.projectLead = item;
    } else if (this.storageService.state.contactType === 'projectDirector') {
      this.storageService.state.projectDirector = item;
    }
    
    let url = this.navigationStackUtils.getLastBackUrl();
    this.navigationStackUtils.popNavigationStack();
    this.router.navigate(url);
  }
}
