import { RouterLink } from "@angular/router";

export interface NavBarButton {
  label: string;
  materialIcon?: string;
  action(): void;
}

export interface PageBreadcrumb {
  pageTitle: string;
  routerLink: any[];
}
