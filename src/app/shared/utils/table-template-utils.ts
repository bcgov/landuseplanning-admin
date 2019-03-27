import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';

@Injectable()
export class TableTemplateUtils {
    constructor(
        private platformLocation: PlatformLocation,
        private router: Router
      ) { }

    public updateUrl(sorting, currentPage, pageSize) {
        let currentUrl = this.router.url;
        currentUrl = (this.platformLocation as any).getBaseHrefFromDOM() + currentUrl.slice(1);
        currentUrl = currentUrl.split('?')[0];
        currentUrl += `?currentPage=${currentPage}&pageSize=${pageSize}`;
        currentUrl += `&sortBy=${sorting}`;
        currentUrl += '&ms=' + new Date().getTime();
        window.history.replaceState({}, '', currentUrl);
    }
}
