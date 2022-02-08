import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { ConfigService } from './services/config.service';
import { SideBarService } from 'app/services/sidebar.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { FileUploadModalComponent } from 'app/file-upload-modal/file-upload-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {

  @HostBinding('class.sidebarcontrol')
  isOpen = false;
  fileUploadModalOptions = {};

  constructor(
    public ngxSmartModalService: NgxSmartModalService,
    private configService: ConfigService,
    private sideBarService: SideBarService
  ) { }

  ngOnInit() {
    this.configService.init();
    this.sideBarService.change.subscribe(isOpen => {
      this.isOpen = isOpen;
    });

    this.fileUploadModalOptions = {
      customClass: 'nsm-centered nsm-large',
      closable: false,
      escapable: false,
      dismissable: false
    }

    this.ngxSmartModalService.create('confirmation-modal', ConfirmComponent, {customClass: 'nsm-centered'});
    this.ngxSmartModalService.create('file-upload-modal', FileUploadModalComponent, this.fileUploadModalOptions);
  }

  ngOnDestroy() {
    this.configService.destroy();
  }
}
