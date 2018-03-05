import { Routes } from '@angular/router';

// import { OverviewTabContentComponent } from './overview/overview-tab-content.component';
// import { AuthorizationsTabContentComponent } from './authorizations/authorizations-tab-content.component';
// import { ComplianceTabContentComponent } from './compliance/compliance-tab-content.component';
import { DocumentsTabContentComponent } from './documents/documents-tab-content.component';

export const TAB_NAV_ROUTES: Routes = [
    // {
    //     path: '',
    //     redirectTo: 'overview',
    //     pathMatch: 'full'
    // },
    // {
    //     path: 'overview',
    //     component: OverviewTabContentComponent
    // },
    // {
    //     path: 'authorizations',
    //     component: AuthorizationsTabContentComponent
    // },
    // {
    //     path: 'compliance',
    //     component: ComplianceTabContentComponent
    // },
    {
        path: 'docs',
        component: DocumentsTabContentComponent
    }
];
