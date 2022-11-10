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

    /**
     * Set up confirm actions and set modal data from smart modal service.
     * 
     * @return {void}
     */
    ngAfterViewInit(): void {
      this.confirmActions = {
        publish: {publishConfirm: true},
        delete: {deleteConfirm: true},
        unpublish: {unpublishConfirm: true},
        select: {}
      }
      this.modalData = this.ngxSmartModalService.getModalData('confirmation-modal');
    }

    /**
     * Close the confirm modal by querying the smart modal service method.
     * 
     * @return {void}
     */
    close(): void {
      this.ngxSmartModalService.close('confirmation-modal');
    }

    /**
     * Register an affirmative on the confirm modal, then close by querying the smart modal service method.
     * 
     * @return {void} 
     */
    confirm(): void {
      if (this.modalData.type === 'select') {
        this.confirmActions.select['selection'] = this.itemSelected;
      }

      this.ngxSmartModalService.setModalData(this.confirmActions[this.modalData.type], 'confirmation-modal', true);

      this.ngxSmartModalService.close('confirmation-modal');
    }
}
