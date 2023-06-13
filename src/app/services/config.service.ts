import { Injectable, OnDestroy } from '@angular/core';
import { ApiService } from './api';
import { Subject } from 'rxjs';

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

  /**
   * Getter for the current lists value.
   *
   * @return {Array}
   */
  get lists(): any[] { return this._lists; }

  /**
   * Getter for the current baseLayerName value.
   *
   * @return {string}
   */
  get baseLayerName(): string { return this._baseLayerName; }

  /**
   * Setter for the baseLayerName.
   *
   * @return {void}
   */
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
