import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'; // https://material.angular.io/guide/getting-started#step-5-gesture-support

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import 'rxjs/add/operator/filter';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
