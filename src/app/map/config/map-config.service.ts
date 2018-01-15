import { Injectable } from '@angular/core';

import { ApiService } from '../../services/api';
import { MapConfig } from './map-config.interface';

const webmaps = {
  dev: 'b8ea19982bd74db3bd968d3c7f038e43',
  test: 'b8ea19982bd74db3bd968d3c7f038e43',
  prod: 'b8ea19982bd74db3bd968d3c7f038e43'
};

@Injectable()
export class MapConfigService {

  constructor(private api: ApiService) { }

  public get(): MapConfig {
    const webmapId = this.webmapForEnv(this.api.env);
    return {
      mainMap: {
        webmap: {
          portalItem: { id: webmapId }
        },
        mapView: {
          constraints: {
            minZoom: 4,  // MEM-514 prevent user from zooming too far out
            rotationEnabled: false  // MEM-534 disable map rotation
          },
          ui: {
            components: ['attribution']
          }
        },
        popup: this.defaultPopupTemplate
      }
    };
  }

  get defaultPopupTemplate(): __esri.PopupTemplateProperties {
    return {
      title: '{name}',
      content: `<div class="map-popup-content">
                  <ul class="map-popup-meta">
                    <li>
                      <span class="meta-name">Purpose/Sub-purpose:</span>
                      <span class="meta-value">{purpose}{subpurpose}</span>
                    </li>
                  </ul>
                  <div class="map-popup-desc">{description}</div>
                  <div class="map-popup-btns">
                    <a class="btn btn-sm slide-r-btn" title="View additional information about {name}"
                      href="${this.applicationUrl('{code}')}">
                      <span>Go to Application Details</span><i class="material-icons">arrow_forward</i>
                    </a>
                  <div>
                </div>`
    };
  }

  // generates link to application details page; e.g. "http://<host>/a/<code>"
  private applicationUrl(code: string): string {
    const { protocol, host } = window.location;
    return `${protocol}//${host}/a/${code}`;
  }

  private webmapForEnv(env: 'local' | 'dev' | 'test' | 'prod'): string {
    switch (env) {
      // local
      case 'local':
        return webmaps.dev;

      // dev
      case 'dev':
        return webmaps.dev;

      // test
      case 'test':
        return webmaps.test;

      // prod
      case 'prod':
      default:
        return webmaps.prod;
    }
  }
}
