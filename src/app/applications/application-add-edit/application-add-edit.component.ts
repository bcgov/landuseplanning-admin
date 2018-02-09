import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from '../../services/api';
import { Application } from '../../models/application';
import { Subscription } from 'rxjs/Subscription';
import { AppComponent } from 'app/app.component';
import { Response } from '@angular/http/src/static_response';
import * as moment from 'moment-timezone';
import { ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { Document } from 'app/models/document';
import { DocumentService } from 'app/services/document.service';

@Component({
  selector: 'app-application-add-edit',
  templateUrl: './application-add-edit.component.html',
  styleUrls: ['./application-add-edit.component.scss']
})
export class ApplicationAddEditComponent implements OnInit {
  @ViewChild('fileInput') fileInput;
  public loading: boolean;
  public application: Application;
  public applicationDocuments: Document[];
  private sub: Subscription;
  readonly types = [
    'CERTIFICATE OF PURCHASE',
    'CROWN GRANT',
    'DEVELOPMENT AGREEMENT',
    'DOMINION PATENTS',
    'INCLUSION',
    'INVENTORY',
    'LEASE',
    'LICENCE',
    'OIC ECOLOGICAL RESERVE ACT',
    'PERMIT',
    'PRE-TANTALIS',
    'PROVINCIAL PARK',
    'RESERVE/NOTATION',
    'REVENUE SHARING AGREEMENT',
    'RIGHT-OF-WAY',
    'TRANSFER OF ADMINISTRATION/CONTROL'
  ];
  readonly subtypes = {
    'CERTIFICATE OF PURCHASE': [
      'DIRECT SALE',
      'FROM LEASE-PURCHASE OPTION',
      'PRE-TANTALIS CERTIFICATE OF PURCHASE',
      'TEMPORARY CODE'
    ],
    'CROWN GRANT': [
      'DIRECT SALE',
      'FREE CROWN GRANT',
      'FROM LEASE-PURCHASE OPTION',
      'HISTORIC',
      'HISTORIC CROWN GRANT',
      'LAND EXCHANGE',
      'PRE-EMPTION',
      'PRE-TANTALIS CROWN GRANT',
      'TEMPORARY CODE'
    ],
    'DEVELOPMENT AGREEMENT': [
      'ALPINE SKI DEVELOPMENT',
      'PRE-TANTALIS DEVELOPMENTAL AGREEMENT'
    ],
    'DOMINION PATENTS': ['PRE-TANTALIS DOMINION PATENTS'],
    'INCLUSION': [
      'ACCESS',
      'AGREEMENT',
      'INCLUSION',
      'LAND TITLE ACT ACCRETION',
      'LAND TITLE ACT BOUNDARY ADJUSTMENT',
      'PRE-TANTALIS INCLUSION'
    ],
    'INVENTORY': ['BCAL INVENTORY'],
    'LEASE': [
      'HEAD LEASE',
      'LEASE - PURCHASE OPTION',
      'PRE-TANTALIS LEASE',
      'STANDARD LEASE'
    ],
    'LICENCE': [
      'LICENCE OF OCCUPATION',
      'PRE-TANTALIS LICENCE'
    ],
    'OIC ECOLOGICAL RESERVE ACT': [

      'OIC ECOLOGICAL RESERVES',
      'PRE-TANTALIS OIC ECO RESERVE'
    ],
    'PERMIT': [
      'INVESTIGATIVE PERMIT',
      'PRE-TANTALIS PERMIT',
      'ROADS & BRIDGES',
      'TEMPORARY CODE',
      'TEMPORARY PERMIT'
    ],
    'PRE-TANTALIS': ['PRE-TANTALIS'],
    'PROVINCIAL PARK': [
      'PARKS',
      'PRE-TANTALIS PARKS',
      'PRE-TANTALIS PARKS (00 ON TAS/CLR)'
    ],
    'RESERVE/NOTATION': [
      'DESIGNATED USE AREA',
      'MAP RESERVE',
      'NOTATION OF INTEREST',
      'OIC RESERVE',
      'PRE-TANTALIS RESERVE/NOTATION',
      'PROHIBITED USE AREA',
      'TEMPORARY CODE'
    ],
    'REVENUE SHARING AGREEMENT': ['REVENUE SHARING AGREEMENT'],
    'RIGHT-OF-WAY': [
      'INTERIM LICENCE',
      'STATUTORY RIGHT OF WAY OR EASEMENT',
      'PRE-TANTALIS RIGHT-OF-WAY'
    ],
    'TRANSFER OF ADMINISTRATION/CONTROL': [
      'FED TRANSFER OF ADMIN, CONTROL & BEN',
      'PRE-TANTALIS TRANSFER OF ADMIN/CONT',
      'PROVINCIAL TRANSFER OF ADMIN'
    ]
  };
  readonly statuses = [
    'ACCEPTED',
    'ACTIVE',
    'ALLOWED',
    'CANCELLED',
    'COMPLETED',
    'DISALLOWED',
    'DISPOSITION IN GOOD STANDING',
    'EXPIRED',
    'HISTORIC',
    'OFFER ACCEPTED',
    'OFFER RESCINDED',
    'OFFERED',
    'PENDING',
    'PRE-TANTALIS',
    'RECEIVED',
    'REVERTED',
    'SOLD',
    'SUSPENDED',
    'WITHDRAWN'
  ];
  readonly purposes = [
    'AGRICULTURE',
    'ALL SEASONS RESORT',
    'ALPINE SKIING',
    'AQUACULTURE',
    'COMMERCIAL',
    'COMMERCIAL RECREATION',
    'COMMUNICATION',
    'COMMUNITY',
    'ENERGY PRODUCTION',
    'ENVIRONMENT, CONSERVATION, & RECREATION',
    'FIRST NATIONS',
    'INDUSTRIAL',
    'INSTITUTIONAL',
    'MISCELLANEOUS LAND USES',
    'OCEAN ENERGY',
    'QUARRYING',
    'RESIDENTIAL',
    'SOLAR POWER',
    'TRANSPORTATION',
    'UTILITY',
    'WATER POWER',
    'WIND POWER'
  ];
  readonly subpurposes = {
    'AGRICULTURE': [
      'EXTENSIVE',
      'GRAZING',
      'INTENSIVE'],
    'ALL SEASONS RESORT': [
      'MISCELLANEOUS'],
    'ALPINE SKIING': [
      'COMMERCIAL RESIDENTIAL',
      'CONTROLLED RECREATION AREA',
      'DAY SKIER FACILITY',
      'GENERAL',
      'INDEPENDENT RECREATION FACILITY',
      'LIFTS',
      'MAINTENANCE FACILITY',
      'MISCELLANEOUS',
      'PARKING FACILITY',
      'RUNS/TRAILS',
      'SUPPORT UTILITY'
      ],
    'AQUACULTURE': [
      'FIN FISH',
      'SHELL FISH'],
    'COMMERCIAL': [
      'COMMERCIAL A',
      'COMMERCIAL B',
      'COMMERCIAL RECREATION DOCK',
      'COMMERCIAL WHARF',
      'FILM PRODUCTION',
      'GENERAL',
      'GOLF COURSE',
      'HUNTING/FISHING CAMP',
      'MARINA',
      'MISCELLANEOUS',
      'PRIVATE YACHT CLUB',
      'TRAPLINE CABIN'],
    'COMMERCIAL RECREATION': [
      'CAT SKI',
      'COMMUNITY OUTDOOR RECREATION',
      'ECO TOURIST LODGE/RESORT',
      'FISH CAMPS',
      'GUIDED FRESHWATER RECREATION',
      'GUIDED MOUNTAINEERING/ROCK CLIMBING',
      'GUIDED NATURE VIEWING',
      'GUIDED SALTWATER RECREATION',
      'HELI HIKING',
      'HELI SKI',
      'HUNT CAMPS',
      'MISCELLANEOUS',
      'MULTIPLE USE',
      'NORDIC SKI (X COUNTRY SKIING)',
      'PRIVATE CAMPS',
      'SNOWMOBILING',
      'SPECIAL ACTIVITIES',
      'TIDAL SPORTS FISHING CAMPS',
      'TRAIL RIDING'],
    'COMMUNICATION': [
      'COMBINED USES',
      'COMMUNICATION SITES'],
  'COMMUNITY': [
    'COMMUNITY FACILITY',
    'MISCELLANEOUS',
    'TRAIL MAINTENANCE'],
  'ENERGY PRODUCTION': [
    'BATTERY SITE',
    'CAMPSITE',
    'COMPRESSOR SITE',
    'DEHYDRATOR SITE',
    'DRILLSITE/WELLSITE',
    'FLARESITE',
    'GAS PROCESSING PLANT',
    'GENERAL',
    'INLET SITE',
    'LAND FARMS',
    'METER SITE',
    'WATER ANALYZER'],
  'ENVIRONMENT, CONSERVATION, & RECREATION': [
    'BOAT HAVEN',
    'BUFFER ZONE',
    'ECOLOGICAL RESERVE',
    'ENVIRONMENT PROTECTION/CONSERVATION',
    'FISH AND WILDLIFE MANAGEMENT',
    'FISHERY FACILITY',
    'FLOODING RESERVE',
    'FOREST MANAGEMENT RESEARCH',
    'GREENBELT',
    'HERITAGE/ARCHEOLOGICAL SITE',
    'PROTECTED AREA STRATEGY',
    'PUBLIC ACCESS/PUBLIC TRAILS',
    'SCIENCE MEASUREMENT/RESEARCH',
    'SNOW SURVEY',
    'UREP/RECREATION RESERVE',
    'WATERSHED RESERVE'],
  'FIRST NATIONS': [
    'COMMUNITY FACILITY',
    'CULTURAL SIGNIFICANCE',
    'INDIAN CUT-OFF',
    'INTERIM MEASURES',
    'LAND CLAIM SETTLEMENT',
    'RESERVE EXPANSION',
    'SPECIFIC CLAIMS',
    'TRADITIONAL USE',
    'TREATY AREA'],
  'INDUSTRIAL': [
    'GENERAL',
    'HEAVY INDUSTRIAL',
    'INDUSTRIAL CAMPS',
    'LIGHT INDUSTRIAL',
    'LOG HANDLING/STORAGE',
    'MINERAL PRODUCTION',
    'MISCELLANEOUS'],
  'INSTITUTIONAL': [
    'CEMETERY',
    'CORRECTIONS FACILITY',
    'FIRE HALL',
    'HOSPITAL/HEALTH FACILITY',
    'INDOOR RECREATION FACILITY',
    'LOCAL/REGIONAL PARK',
    'MILITARY SITE',
    'MISCELLANEOUS',
    'PUBLIC WORKS',
    'SCHOOL/OUTDOOR EDUCATION FACILITY',
    'WASTE DISPOSAL SITE'],
  'MISCELLANEOUS LAND USES': [
    'LAND EXCHANGE',
    'LAND USE PLAN INTERIM AGREEMENT',
    'OTHER',
    'PLANNING/MARKETING/DEVELOP PROJECTS'],
  'OCEAN ENERGY': [
    'GENERAL AREA',
    'INVESTIGATIVE AND MONITORING PHASE'],
  'QUARRYING': [
    'CONSTRUCTION STONE',
    'LIMESTONE AND DOLOMITE',
    'MISCELLANEOUS',
    'PEAT AND SOIL',
    'POZZOLAN, CLAY, DIATOMACEOUS EARTH',
    'PUBLIC SAFETY - FLOOD MITIGATION',
    'RIP RAP',
    'ROCK FOR CRUSHING',
    'SAND AND GRAVEL'],
  'RESIDENTIAL': [
    'APPLICATION ONLY - PRIVATE MOORAGE',
    'FLOATING CABIN',
    'FLOATING COMMUNITY',
    'MISCELLANEOUS',
    'PRIVATE MOORAGE',
    'RECREATIONAL RESIDENTIAL',
    'REMOTE RESIDENTIAL',
    'RURAL RESIDENTIAL',
    'STRATA MOORAGE',
    'THERMAL LOOPS',
    'URBAN RESIDENTIAL'],
  'SOLAR POWER': [
    'INVESTIGATIVE PHASE'],
  'TRANSPORTATION': [
    'AIRPORT/AIRSTRIP',
    'BRIDGES',
    'FERRY TERMINAL',
    'NAVIGATION AID',
    'PUBLIC WHARF',
    'RAILWAY',
    'ROADWAY'],
  'UTILITY': [
    'CATHODIC SITE/ANODE BEDS',
    'ELECTRIC POWER LINE',
    'GAS AND OIL PIPELINE',
    'MISCELLANEOUS',
    'SEWER/EFFLUENT LINE',
    'TELECOMMUNICATION LINE',
    'WATER LINE'],
  'WATER POWER': [
    'COMMUNICATION SITE',
    'GENERAL AREA',
    'INTAKE',
    'INVESTIGATIVE PHASE',
    'NON-COMMERCIAL',
    'PENSTOCK',
    'POWERHOUSE SITE',
    'QUARRY',
    'ROAD',
    'TRANSMISSION LINE'],
  'WIND POWER': [
    'DEVELOPMENT PHASE',
    'GENERAL AREA',
    'INTENSIVE',
    'INVESTIGATIVE AND MONITORING PHASE',
    'INVESTIGATIVE PHASE',
    'OPERATING PHASE']
  };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private documentService: DocumentService
  ) {
    this.applicationDocuments = [];
  }

  typeChange(obj) {
    this.application.subtype = this.subtypes[obj][0];
  }

  purposeChange(obj) {
    this.application.subpurpose = this.subpurposes[obj][0];
  }

  onSubmit() {
    // Adjust for current tz
    this.application.projectDate = moment(this.application.projectDate).format();

    this.api.saveApplication(this.application)
    .subscribe(
      (data: any) => {
        console.log('Saved application', data);
      },
      error => {
        console.log('ERR:', error);
    });
  }

  upload() {
    const self = this;
    const fileBrowser = this.fileInput.nativeElement;
    console.log('Uploading files:', fileBrowser.files);
    _.each(fileBrowser.files, function (file) {
      if (file) {
        const formData = new FormData();
        formData.append('_application', self.application._id);
        formData.append('upfile', file);
        self.api.uploadDocument(formData)
        .subscribe(
          res => {
          // do stuff w/my uploaded file
          console.log('RES:', res.json());
          self.applicationDocuments.push(res.json());
        },
        error => {
          console.log('error:', error);
        });
      }
    });
  }

  onChange(event: any, input: any) {
    const files = [].slice.call(event.target.files);
    input.value = files.map(f => f.name).join(', ');
  }

  ngOnInit(): void {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) {
      return; // return false;
    }

    this.loading = true;

    // wait for the resolver to retrieve the application details from back-end
    this.sub = this.route.data
      // .finally(() => this.loading = false) // TODO: make this work
      .subscribe(
      (data: { application: Application }) => {
        this.loading = false;
        this.application = data.application;
        this.application.projectDate = moment(this.application.projectDate).format();
        // application not found --> navigate back to application list
        if (!this.application || !this.application._id) {
          console.log('Application not found!');
          this.gotoApplicationList();
        }

        this.applicationDocuments = this.documentService.getDocuments(this.application._id);
      },
      error => {
        this.loading = false;
        // If 403, redir to /login.
        if (error.startsWith('403')) {
          this.router.navigate(['/login']);
        }
        alert('Error loading application');
      });
  }
  private gotoApplicationList(): void {
    this.router.navigate(['/applications']);
  }
}
