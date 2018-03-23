import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { SearchComponent } from './search/search.component';
import { AdministrationComponent } from './administration/administration.component';
import { UsersComponent } from './administration/users/users.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'search',
    component: SearchComponent
  },
  {
    path: 'administration',
    component: AdministrationComponent
  },
  {
    path: 'administration/users',
    component: UsersComponent
  },
  {
    // default route
    path: '',
    component: HomeComponent
  },
  {
    // wildcard route
    path: '**',
    redirectTo: '/admin/',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
