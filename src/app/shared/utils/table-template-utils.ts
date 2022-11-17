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

  /**
   * When the table is sorted, updated, or changed, update the URL accordingly.
   * 
   * @param {string} sortString Type of sort happening in the table.
   * @param {number} currentPage The current page number.
   * @param {number} pageSize The page size number.
   * @param {object|null} filter Filter for the table entries.
   * @param {string} keywords Keywords that are searched for in the table entries.
   * @return {void}
   */
  public updateUrl(sortString, currentPage, pageSize, filter = null, keywords = '') {
    let currentUrl = this.router.url;
    currentUrl = (this.platformLocation as any).getBaseHrefFromDOM() + currentUrl.slice(1);
    currentUrl = currentUrl.split(';')[0];
    currentUrl += `;currentPage=${currentPage};pageSize=${pageSize}`;
    if (keywords !== '') { currentUrl += `;keywords=${keywords}`; }
    if (sortString !== '' && sortString !== null) { currentUrl += `;sortBy=${sortString}`; }
    if (filter !== null && filter !== {}) {
      Object.keys(filter).forEach(key => {
        if (filter[key] === true || filter[key] === false) {
          currentUrl += `;${key}=${filter[key]}`;
        } else {
          currentUrl += `;${key}=`;
          filter[key].split(',').forEach(item => {
            currentUrl += `${item},`;
          });
          currentUrl = currentUrl.slice(0, -1);
        }
      });
    }
    currentUrl += ';ms=' + new Date().getTime();
    window.history.replaceState({}, '', currentUrl);
  }

  /**
   * Get the params from the URL and turn them into the table state.
   * 
   * @param {object} params URL params.
   * @param {object|null} filter What the table filter should be.
   * @param {number} defaultPageSize The default page size for the table results.
   * @param {array} filterFieldList The filters the table can have.
   * @returns {TableParamsObject}
   */
  public getParamsFromUrl(params, filter = null, defaultPageSize = null, filterFieldList = []) {
    let pageSize = +Constants.tableDefaults.DEFAULT_PAGE_SIZE;
    if (defaultPageSize !== null) {
      pageSize = +defaultPageSize;
    } else if (params.pageSize) {
      pageSize = +params.pageSize;
    }
    let currentPage = params.currentPage ? +params.currentPage : +Constants.tableDefaults.DEFAULT_CURRENT_PAGE;
    let sortBy = params.sortBy ? params.sortBy : Constants.tableDefaults.DEFAULT_SORT_BY;
    let keywords = params.keywords ? params.keywords : Constants.tableDefaults.DEFAULT_KEYWORDS;
    if (filter == null) {
      filter = {};
    }
    filterFieldList.forEach(field => {
      if (params[field]) {
        filter[field] = params[field];
      }
    });

    this.updateUrl(sortBy, currentPage, pageSize, filter, keywords);

    return new TableParamsObject(
      pageSize,
      currentPage,
      0,
      sortBy,
      keywords,
      filter
    );
  }

  /**
   * Update the table params object.
   *  
   * @param {TableParamsObject} tableParams The current table params to update.
   * @param {number} pageNumber The page number to update the table with.
   * @param {string} sortBy What to sort the table by.
   * @returns {TableParamsObject}
   */
  public updateTableParams(tableParams: TableParamsObject, pageNumber: number, sortBy: string) {
    tableParams.sortBy = sortBy;
    tableParams.currentPage = pageNumber;
    return tableParams;
  }
}
