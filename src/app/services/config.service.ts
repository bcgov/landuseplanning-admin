import { Injectable, OnDestroy } from '@angular/core';
import { ApiService } from './api';
import { Subject } from 'rxjs/Subject';

//
// This service/class provides a centralized place to persist config values
// (eg, to share values between multiple components).
//

@Injectable()
export class ConfigService implements OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // defaults
  private _baseLayerName = 'World Topographic'; // NB: must match a valid base layer name
  private _lists = [];

  constructor(private api: ApiService) {
    this.api.getFullDataSet('List')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        // Store here for later use across the application.
        this._lists = res[0].searchResults;
      });
  }

  // called by app constructor
  public init() {
  }

  // called by app constructor
  public destroy() {
    // FUTURE: save settings to window.localStorage?
  }

  // getters/setters
  get lists(): any[] { return this._lists; }
  get baseLayerName(): string { return this._baseLayerName; }
  set baseLayerName(val: string) { this._baseLayerName = val; }

  /**
   * Terminate subscriptions when component is unmounted.
   *
   * @return {void}
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
