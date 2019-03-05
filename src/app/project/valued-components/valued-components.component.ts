import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ValuedComponent } from 'app/models/valuedComponent';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogService } from 'ng2-bootstrap-modal';
import { ValuedComponentService } from 'app/services/valued-component.service';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-valued-components',
  templateUrl: './valued-components.component.html',
  styleUrls: ['./valued-components.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValuedComponentsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public valuedComponents: ValuedComponent[] = null;
  public vcsLoading = true;
  public pageNum = 0;
  public pageSize = 10;
  public currentPage = 1;
  public totalVcs = 0;
  public sortBy = '';
  private currentProjectId = '';

  constructor(
    private route: ActivatedRoute,
    private platformLocation: PlatformLocation,
    private router: Router,
    private valuedComponentService: ValuedComponentService,
    private modalService: NgbModal,
    private dialogService: DialogService,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          this.vcsLoading = false;
          this.totalVcs = res.valuedComponents.totalCount;
          this.valuedComponents = res.valuedComponents.data;
          this.currentProjectId = res.valuedComponents.projectId;
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load valued components');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
          this.vcsLoading = false;
        }
      }
      );
  }

  // TODO: Add VC
  // addVC(vc) {
  //   let dlg = this.modalService.open(AddAddVComponent, { backdrop: 'static', windowClass: 'day-calculator-modal' });
  //   dlg.componentInstance.model = vc;
  //   dlg.result.then(result => {
  //     switch (result) {
  //       case ModalResult.Save:
  //         this.getPaginatedVcs(this.currentPage);
  //       break;
  //     }
  //   });
  //   return;
  // }

  getPaginatedVcs(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);

    this.vcsLoading = true;
    this.valuedComponentService.getAllByProjectId(this.currentProjectId, pageNumber, this.pageSize)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.currentPage = pageNumber;
        this.updateUrl();
        this.totalVcs = res.totalCount;
        this.valuedComponents = res.data;
        this.vcsLoading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  updateUrl() {
    let currentUrl = this.router.url;
    currentUrl = (this.platformLocation as any).getBaseHrefFromDOM() + currentUrl.slice(1);
    currentUrl = currentUrl.split('?')[0];
    currentUrl += `?currentPage=${this.currentPage}&pageSize=${this.pageSize}`;
    currentUrl += '&ms=' + new Date().getTime();
    window.history.replaceState({}, '', currentUrl);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
