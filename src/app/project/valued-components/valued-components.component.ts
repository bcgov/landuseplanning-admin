import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ValuedComponent } from 'app/models/valuedComponent';
import { ValuedComponentService } from 'app/services/valued-component.service';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { ValuedComponentTableRowsComponent } from './valued-component-table-rows/valued-component-table-rows.component';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';

@Component({
  selector: 'app-valued-components',
  templateUrl: './valued-components.component.html',
  styleUrls: ['./valued-components.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValuedComponentsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public valuedComponents: ValuedComponent[] = null;
  public loading = true;

  public valuedComponentTableData: TableObject;
  public valuedComponentTableColumns: any[] = [
    {
      name: 'Type',
      value: 'type',
      width: 'col-3'
    },
    {
      name: 'Title',
      value: 'title',
      width: 'col-5'
    },
    {
      name: 'Pillar',
      value: 'pillar',
      width: 'col-2'
    },
    {
      name: 'Parent',
      value: 'parent',
      width: 'col-2'
    }
  ];

  public tableParams: TableParamsObject = new TableParamsObject();

  public currentProjectId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private valuedComponentService: ValuedComponentService,
    private _changeDetectionRef: ChangeDetectorRef,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
    });

    this.route.parent.paramMap
    .takeUntil(this.ngUnsubscribe)
    .subscribe(paramMap => {
      this.currentProjectId = paramMap.get('projId');
    });

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          this.tableParams.totalListItems = res.valuedComponents.totalCount;
          if (this.tableParams.totalListItems > 0) {
            this.valuedComponents = res.valuedComponents.data;
            this.setVCRowData();
          }
        } else {
          alert('Uh-oh, couldn\'t load valued components');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
        this.loading = false;
        this._changeDetectionRef.detectChanges();
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

  setVCRowData() {
    let vcList = [];
    this.valuedComponents.forEach(valuedComponent => {
      vcList.push(
        {
          type: valuedComponent.type,
          title: valuedComponent.title,
          pillar: valuedComponent.pillar,
          parent: valuedComponent.parent == null ? 'None' : valuedComponent.parent
        }
      );
    });
    this.valuedComponentTableData = new TableObject(
      ValuedComponentTableRowsComponent,
      vcList,
      this.tableParams
    );
  }

  setColumnSort(column) {
    this.tableParams.sortBy = column;
    this.tableParams.sortDirection = this.tableParams.sortDirection > 0 ? -1 : 1;
    this.getPaginatedVCs(this.tableParams.currentPage, this.tableParams.sortBy, this.tableParams.sortDirection);
  }

  getPaginatedVCs(pageNumber, newSortBy, newSortDirection) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, newSortBy, newSortDirection);

    this.valuedComponentService.getAllByProjectId(this.currentProjectId, pageNumber, this.tableParams.pageSize, this.tableParams.sortString)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res.totalCount;
        this.valuedComponents = res.data;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortString, this.tableParams.currentPage, this.tableParams.pageSize);
        this.setVCRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
