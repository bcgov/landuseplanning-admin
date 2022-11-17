import { Component } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-env-banner',
  templateUrl: './env-banner.component.html',
  styleUrls: ['./env-banner.component.scss']
})
export class EnvBannerComponent {

  public env: string;  // Could be anything per Openshift settings but generally is one of 'local' | 'dev' | 'test' | 'prod' | 'demo'
  public showBanner: boolean;

  constructor() {
    const deployment_env = window.localStorage.getItem('from_admin_server--deployment_env');

    this.env = (_.isEmpty(deployment_env)) ? 'local' : deployment_env;
    if (this.env.toUpperCase() == 'PROD') {
      this.showBanner = false;
    } else {
      this.showBanner = true;
    }
   }
}
