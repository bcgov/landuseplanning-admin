import { Component, AfterViewInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';

interface SmartModalData {
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

  constructor(
    public ngxSmartModalService: NgxSmartModalService,
    ) {}

  ngAfterViewInit() {
    this.modalData = this.ngxSmartModalService.getModalData('confirmation-modal');
  }

  close() {
    this.ngxSmartModalService.close('confirmation-modal');
  }

  confirm() {
    if (this.modalData.type === 'publish') {
      this.ngxSmartModalService.setModalData({publishConfirm: true}, 'confirmation-modal', true);
    } else if (this.modalData.type === 'delete') {
      this.ngxSmartModalService.setModalData({deleteConfirm: true}, 'confirmation-modal', true);
    } else if (this.modalData.type === 'unpublish') {
      this.ngxSmartModalService.setModalData({unpublishConfirm: true}, 'confirmation-modal', true);
    }
    this.ngxSmartModalService.close('confirmation-modal');
  }
}
