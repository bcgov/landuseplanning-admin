import { Component, AfterViewInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';

interface SmartModalData {
  selectData?: any;
  selectLabel?: string;
  type?: string;
  title?: string;
  message?: string;
}

@Component({
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements AfterViewInit {
  modalData: SmartModalData;
  itemSelected: any;
  selectDataObjectHandler = Object.keys;
  confirmActions: {
    publish: {},
    delete: {},
    unpublish: {},
    select: {}
  };

  constructor(
    public ngxSmartModalService: NgxSmartModalService,
    ) {}

  ngAfterViewInit() {
    this.confirmActions = {
      publish: {publishConfirm: true},
      delete: {deleteConfirm: true},
      unpublish: {unpublishConfirm: true},
      select: {}
    }
    this.modalData = this.ngxSmartModalService.getModalData('confirmation-modal');
  }

  close() {
    this.ngxSmartModalService.close('confirmation-modal');
  }

  confirm() {
    if (this.modalData.type === 'select') {
      this.confirmActions.select['selection'] = this.itemSelected;
    }

    this.ngxSmartModalService.setModalData(this.confirmActions[this.modalData.type], 'confirmation-modal', true);

    this.ngxSmartModalService.close('confirmation-modal');
  }
}
