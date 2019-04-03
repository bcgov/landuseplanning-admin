import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { TableParamsObject } from '../components/table-template/table-params-object';
import { Constants } from 'app/shared/utils/constants';

@Injectable()
export class TableTemplateUtils {
  constructor(
    private platformLocation: PlatformLocation,
    private router: Router
  ) { }

  public updateUrl(sortString, currentPage, pageSize) {
    let currentUrl = this.router.url;
    currentUrl = (this.platformLocation as any).getBaseHrefFromDOM() + currentUrl.slice(1);
    currentUrl = currentUrl.split(';')[0];
    currentUrl += `;currentPage=${currentPage};pageSize=${pageSize}`;
    if (sortString !== null) {
      currentUrl += `;sortBy=${sortString}`;
    }
    currentUrl += ';ms=' + new Date().getTime();
    window.history.replaceState({}, '', currentUrl);
  }

  public getParamsFromUrl(params) {
    let pageSize = params.pageSize || Constants.tableDefaults.DEFAULT_PAGE_SIZE;
    let currentPage = params.currentPage ? params.currentPage : Constants.tableDefaults.DEFAULT_CURRENT_PAGE;

    let sortBy = '';
    let sortDirection = null;
    let sortString = params.sortBy === 'null' || !params.sortBy ? null : params.sortBy;

    if (sortString !== '' && sortString !== null) {
      sortDirection = sortString.charAt(0) === '+' ? 1 : -1;
      sortBy = sortString.substring(1);
    }

    this.updateUrl(sortString, currentPage, pageSize);

    return new TableParamsObject(
      pageSize,
      currentPage,
      0,
      sortBy,
      sortDirection,
      sortString
    );
  }

  public updateTableParams(tableParams: TableParamsObject, pageNumber: number, newSortBy: string, newSortDirection: number) {
    if (newSortBy) {
      tableParams.sortString = (newSortDirection > 0 ? '+' : '-') + newSortBy;
      tableParams.sortBy = newSortBy;
      tableParams.sortDirection = newSortDirection;
    }
    tableParams.currentPage = pageNumber;
    return tableParams;
  }
}
