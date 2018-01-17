import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { CookieService } from 'ngx-cookie-service';
import { TagInputModule } from 'ngx-chips';

import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';

// components
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ObjectFilterPipe } from './object-filter.pipe';
import { SearchComponent } from './search/search.component';
import { LoginComponent } from './login/login.component';

// services
import { SearchService } from './services/search.service';
import { ProponentService } from './services/proponent.service';
import { AuthenticationService } from './services/authentication.service';
import { ApplicationService } from './services/application.service';
import { CommentPeriodService } from './services/commentperiod.service';
import { CommentService } from './services/comment.service';

// feature modules
import { ApplicationsModule } from './applications/applications.module';
import { CommentingModule } from './commenting/commenting.module';
import { MapModule } from './map/map.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ObjectFilterPipe,
    SearchComponent,
    LoginComponent
  ],
  imports: [
    TagInputModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    SharedModule,
    ApplicationsModule, // <-- module import order matters - https://angular.io/guide/router#module-import-order-matters
    CommentingModule,
    AppRoutingModule,
    NgbModule.forRoot(),
    NgxPaginationModule,
    Ng2PageScrollModule.forRoot(),
    MapModule
  ],
  providers: [
    CookieService,
    SearchService,
    ProponentService,
    AuthenticationService,
    ApplicationService,
    CommentPeriodService,
    CommentService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
