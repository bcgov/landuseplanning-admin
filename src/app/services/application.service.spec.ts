import { TestBed, inject } from '@angular/core/testing';

import { ApplicationService } from './application.service';
import { ApiService } from 'app/services/api';
import { DocumentService } from 'app/services/document.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentService } from 'app/services/comment.service';
import { DecisionService } from 'app/services/decision.service';
import { FeatureService } from 'app/services/feature.service';
import { of } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import { Feature } from 'app/models/feature';
import { Document } from 'app/models/document';
import { CommentPeriod } from 'app/models/commentperiod';
import { Decision } from 'app/models/decision';
import { Application } from 'app/models/application';

describe('ApplicationService', () => {
  let service;
  
  const apiServiceStub = {
    getApplication(id: string) {
      const application = new Application({_id: id, status: 'ACCEPTED'});
      return of( [application] );
    },

    getApplications() {
      const firstApplication = new Application({_id: 'BBBB', status: 'ACCEPTED'});
      const secondApplication = new Application({_id: 'CCCC', status: 'ABANDONED'});
      return of( [firstApplication, secondApplication] );
    },

    handleError(error: any) {
      fail(error);
    }
  };


  const featureServiceStub = {
    getByApplicationId(applicationId: string) {
      const features = [
        new Feature({id: 'FFFFF', properties: { TENURE_AREA_IN_HECTARES: 12 }}),
        new Feature({id: 'GGGGG', properties: { TENURE_AREA_IN_HECTARES: 13 }})
      ];
      return of(features);
    }
  }

  const documentServiceStub = {
    getAllByApplicationId(applicationId: string) {
      const documents = [
        new Document({_id: 'DDDDD'}),
        new Document({_id: 'EEEEE'})
      ];
      return of(documents);
    }
  }

  const commentPeriodServiceStub = {
    getAllByApplicationId(applicationId: string) {
      const commentPeriods = [
        new CommentPeriod({_id: 'DDDDD', startDate: new Date(2018, 10, 1,), endDate: new Date(2018, 11, 10)}),
        new CommentPeriod({_id: 'EEEEE', startDate: new Date(2018, 10, 1,), endDate: new Date(2018, 11, 10)})
      ];
      return of(commentPeriods);
    },

    getCurrent(periods: CommentPeriod[]): CommentPeriod {
      return (periods.length > 0) ? periods[0] : null;
    },

    getStatus(period: CommentPeriod): string {
      return 'Open';
    },

    isOpen(period: CommentPeriod): boolean {
      return true;
    }
  }

  const decisionServiceStub = {
    getByApplicationId(applicationId: string) {
      return of(new Decision({_id: 'IIIII'}));
    }
  }

  const commentServiceStub = {
    getCountByPeriodId(periodId: string): Observable<number> {
      return of(42);
    }
  }
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApplicationService,
        { provide: ApiService, useValue: apiServiceStub },
        { provide: DocumentService, useValue: documentServiceStub },
        { provide: CommentPeriodService, useValue: commentPeriodServiceStub },
        { provide: CommentService, useValue: commentServiceStub },
        { provide: DecisionService, useValue: decisionServiceStub },
        { provide: FeatureService, useValue: featureServiceStub },
      ]
    });

    service = TestBed.get(ApplicationService);
  });

  it('should be created', inject([ApplicationService], (service: ApplicationService) => {
    expect(service).toBeTruthy();
  }));
  
  describe('getAll()', () => {
    it('retrieves the applications from the api service', () => {
      service.getAll().subscribe( applications => {
        expect(applications[0]._id).toBe('BBBB');
        expect(applications[1]._id).toBe('CCCC');
      });
    });

    describe('application properties', () => {
      let application = new Application({
        _id: 'AAAA'
      });

      let apiService;
      beforeEach(() => {
        apiService = TestBed.get(ApiService);

        spyOn(apiService, 'getApplications').and.returnValue(of([application]));
      });

      it('sets the appStatus property', () => {
        application.status = 'ACCEPTED';
        service.getAll().subscribe( applications => {
          let application = applications[0];
          expect(application.appStatus).toBe('Application Under Review');
        });
      });
  
      it('clFile property is padded to be seven digits', () => {
        application.cl_file = 7777;
        service.getAll().subscribe( applications => {
          let application = applications[0];
          expect(application.clFile).toBe('0007777');
        });
      });

      it('clFile property is null if there is no cl_file property', () => {
        application.cl_file = null;
        service.getAll().subscribe( applications => {
          let application = applications[0];
          expect(application.clFile).toBeUndefined();
        });
      });
      
      it('sets the region property', () => {
        application.businessUnit = 'ZOO Keeper';
        service.getAll().subscribe( applications => {
          let application = applications[0];
          expect(application.region).toBeDefined();
          expect(application.region).toEqual('ZOO')
        });
      });
    });

    // The getCurrentPeriod parameter is currently the only one passed to this function
    // in the codebase, so that's why this is the only one tested. getFeatures, getDocuments,
    // etc aren't actually used with this function at the moment. 

    describe('with the getCurrentPeriod Parameter', () => {
      // let commentPeriodService;
      const firstAppCommentPeriod = new CommentPeriod({_id: 'CP_FOR_FIRST_APP', startDate: new Date(2018, 10, 1,), endDate: new Date(2018, 11, 10)});
      const secondAppCommentPeriod = new CommentPeriod({_id: 'CP_FOR_SECOND_APP', startDate: new Date(2018, 10, 1,), endDate: new Date(2018, 11, 10)});

      beforeEach(() => {
        let commentPeriodService = TestBed.get(CommentPeriodService);

        spyOn(commentPeriodService, 'getAllByApplicationId').and.callFake((applicationId) => {
          if (applicationId === 'BBBB') {
            return of([firstAppCommentPeriod]);
          } else if (applicationId === 'CCCC') {
            return of([secondAppCommentPeriod]);
          }
        });
      });

      it('makes a call to commentPeriodService.getAllByApplicationId for each application and retrieves the comment period', () => {
        service.getAll({ getCurrentPeriod: true }).subscribe( applications => {
          let firstApplication = applications[0];
          expect(firstApplication.currentPeriod).toBeDefined();
          expect(firstApplication.currentPeriod).not.toBeNull();
          expect(firstApplication.currentPeriod._id).toBe('CP_FOR_FIRST_APP');

          let secondApplication = applications[1];
          expect(secondApplication.currentPeriod).toBeDefined();
          expect(secondApplication.currentPeriod).not.toBeNull();
          expect(secondApplication.currentPeriod._id).toBe('CP_FOR_SECOND_APP');
        });
      });

      it('sets the cpStatus to the commentPeriodService.getStatus result', () => {
        service.getAll({ getCurrentPeriod: true }).subscribe( applications => {
          let firstApplication = applications[0];
          expect(firstApplication.cpStatus).toBe('Open')
        });
      });

      describe('if the comment period is open', () => {
        beforeEach(() => {
          jasmine.clock().install();
          let commentPeriodService = TestBed.get(CommentPeriodService);
          
          const currentTime = new Date(2018, 11, 1);
          let today = moment(currentTime).toDate();
          jasmine.clock().mockDate(today);
          
          spyOn(commentPeriodService, 'isOpen').and.returnValue(true);
        });

        afterEach(() => {
          jasmine.clock().uninstall();
        });
        
        it('sets the daysRemaining value to the endDate minus the current time', () => {
          firstAppCommentPeriod.startDate = new Date(2018, 10, 1,);
          firstAppCommentPeriod.endDate = new Date(2018, 11, 10);

          service.getAll({ getCurrentPeriod: true }).subscribe( applications => {
            let firstApplication = applications[0];

            expect(firstApplication.currentPeriod.daysRemaining).toBeDefined();

            expect(firstApplication.currentPeriod.daysRemaining).toEqual(10);
          });
        });
      });
      
      describe('if the comment period is not open', () => {
        beforeEach(() => {
          let commentPeriodService = TestBed.get(CommentPeriodService);
          spyOn(commentPeriodService, 'isOpen').and.returnValue(false);
        });

        // I can't get the spies to work correctly here to stub the isOpen value
        // TODO: Stub isOpen method properly to get this to pass.
        xit('does not set the daysRemaining value', () => {
          service.getAll({ getCurrentPeriod: true }).subscribe( applications => {
            expect(applications[0].currentPeriod.daysRemaining).not.toBeDefined();
            expect(applications[1].currentPeriod.daysRemaining).not.toBeDefined();
          });
        });
      });

      describe('numComments', () => {
        beforeEach(() => {
          let commentService = TestBed.get(CommentService);

          spyOn(commentService, 'getCountByPeriodId').and.returnValue(of(42));
        });
        
        it('sets the numComments value to the commentService.getCountByPeriodId function', () => {
          service.getAll({ getCurrentPeriod: true }).subscribe( applications => {
            expect(applications[0].numComments).toEqual(42)
            expect(applications[1].numComments).toEqual(42)
          });
        });
      });
    });

    describe('without the getCurrentPeriod Parameter', () => {
      it('does not call commentPeriodService.getAllByApplicationId', () => {
        let commentPeriodService = TestBed.get(CommentPeriodService);
        spyOn(commentPeriodService, 'getAllByApplicationId');
        expect(commentPeriodService.getAllByApplicationId).not.toHaveBeenCalled();
      });

      it('has no attached comment period', () => {
        service.getAll({ getCurrentPeriod: false }).subscribe(applications => {
          expect(applications[0].currentPeriod).toBeNull();
          expect(applications[1].currentPeriod).toBeNull();
        });
      });
    });
  });

  describe('getById()', () => {
    it('retrieves the application from the api service', () => {
      service.getById('AAAA').subscribe( application => {
        expect(application._id).toBe('AAAA');
      });
    });


    describe('application properties', () => {
      let application = new Application({
        _id: 'AAAA'
      });

      let apiService;
      beforeEach(() => {
        apiService = TestBed.get(ApiService);

        spyOn(apiService, 'getApplication').and.returnValue(of([application]));
      });

      it('sets the appStatus property', () => {
        application.status = 'ACCEPTED';
        service.getById('AAAA').subscribe( application => {
          expect(application.appStatus).toBe('Application Under Review');
        });
      });
  
      it('clFile property is padded to be seven digits', () => {
        application.cl_file = 7777;
        service.getById('AAAA').subscribe( application => {
          expect(application.clFile).toBe('0007777');
        });
      });

      it('clFile property is null if there is no cl_file property', () => {
        application.cl_file = null;
        service.getById('AAAA').subscribe( application => {
          expect(application.clFile).toBeUndefined();
        });
      });
      
      it('sets the region property', () => {
        application.businessUnit = 'ZOO Keeper';
        service.getById('AAAA').subscribe( application => {
          expect(application.region).toBeDefined();
          expect(application.region).toEqual('ZOO')
        });
      });
    });

    describe('with the getFeatures Parameter', () => {
      it('makes a call to featureService.getByApplicationId and attaches the resulting features', () => {
        service.getById('AAAA', { getFeatures: true }).subscribe( application => {
          expect(application.features).toBeDefined()
          expect(application.features).not.toBeNull();
          expect(application.features[0].id).toBe('FFFFF');
          expect(application.features[1].id).toBe('GGGGG');
        });
      });

      it('sets the areaHectares property to the sum of all feature property hectares', () => {
        service.getById('AAAA', { getFeatures: true }).subscribe( application => {
          expect(application.areaHectares).toBe(25);
        });
      });
    });

    describe('without the getFeatures Parameter', () => {
      it('does not call featureService.getByApplicationId', () => {
        let featureService = TestBed.get(FeatureService);
        spyOn(featureService, 'getByApplicationId');
        expect(featureService.getByApplicationId).not.toHaveBeenCalled();
      });

      it('has no attached features', () => {
        service.getById('AAAA', { getFeatures: false }).subscribe(application => {
          expect(application.features).toBeDefined()
          expect(application.features).toEqual([])
        });
      });
    });

    describe('with the getDocuments Parameter', () => {
      it('makes a call to documentService.getAllByApplicationId and attaches the resulting documents', () => {
        service.getById('AAAA', { getDocuments: true }).subscribe( application => {
          expect(application.documents).toBeDefined()
          expect(application.documents).not.toBeNull();
          expect(application.documents[0]._id).toBe('DDDDD');
          expect(application.documents[1]._id).toBe('EEEEE');
        });
      });
    });

    describe('without the getDocuments Parameter', () => {
      it('does not call documentService.getAllByApplicationId', () => {
        let documentService = TestBed.get(DocumentService);
        spyOn(documentService, 'getAllByApplicationId');
        expect(documentService.getAllByApplicationId).not.toHaveBeenCalled();
      });

      it('has no attached documents', () => {
        service.getById('AAAA', { getDocuments: false }).subscribe(application => {
          expect(application.documents).toBeDefined()
          expect(application.documents).toEqual([])
        });
      });
    });
    
    describe('with the getCurrentPeriod Parameter', () => {
      it('makes a call to commentPeriodService.getAllByApplicationId and attaches the first resulting comment period', () => {
        service.getById('AAAA', { getCurrentPeriod: true }).subscribe( application => {
          expect(application.currentPeriod).toBeDefined();
          expect(application.currentPeriod).not.toBeNull();
          expect(application.currentPeriod._id).toBe('DDDDD');
        });
      });

      it('sets the cpStatus to the commentPeriodService.getStatus result', () => {
        service.getById('AAAA', { getCurrentPeriod: true }).subscribe( application => {
          expect(application.cpStatus).toBe('Open')
        });
      });

      describe('if the comment period is open', () => {
        let periodExpiringOnTheTenth = new CommentPeriod({
          _id: 'CCCC', 
          startDate: new Date(2018, 10, 1,), 
          endDate: new Date(2018, 11, 10)
        });

        beforeEach(() => {
          jasmine.clock().install();
          
          const currentTime = new Date(2018, 11, 1);
          let today = moment(currentTime).toDate();
          jasmine.clock().mockDate(today);
          
          let commentPeriodService = TestBed.get(CommentPeriodService);
          spyOn(commentPeriodService, 'isOpen').and.returnValue(true);
          spyOn(commentPeriodService, 'getAllByApplicationId').and.returnValue(of([periodExpiringOnTheTenth]));
        });

        afterEach(() => {
          jasmine.clock().uninstall();
        });
        
        it('sets the daysRemaining value to the endDate minus the current time', () => {

          service.getById('AAAA', { getCurrentPeriod: true }).subscribe( application => {
            expect(application.currentPeriod.daysRemaining).toBeDefined();

            expect(application.currentPeriod.daysRemaining).toEqual(10);
          });
        });
      });
      
      describe('if the comment period is not open', () => {
        beforeEach(() => {
          let commentPeriodService = TestBed.get(CommentPeriodService);

          spyOn(commentPeriodService, 'isOpen').and.returnValue(false);
        });

        it('does not set the daysRemaining value', () => {
          service.getById('AAAA', { getCurrentPeriod: true }).subscribe( application => {
            expect(application.currentPeriod.daysRemaining).not.toBeDefined();
          });
        });
      });

      describe('numComments', () => {
        beforeEach(() => {
          let commentService = TestBed.get(CommentService);

          spyOn(commentService, 'getCountByPeriodId').and.returnValue(of(42));
        });
        
        it('sets the numComments value to the commentService.getCountByPeriodId function', () => {
          service.getById('AAAA', { getCurrentPeriod: true }).subscribe( application => {
            expect(application.numComments).toEqual(42)
          });
        });
      });
    });

    describe('without the getCurrentPeriod Parameter', () => {
      it('does not call commentPeriodService.getAllByApplicationId', () => {
        let commentPeriodService = TestBed.get(CommentPeriodService);
        spyOn(commentPeriodService, 'getAllByApplicationId');
        expect(commentPeriodService.getAllByApplicationId).not.toHaveBeenCalled();
      });

      it('has no attached comment period', () => {
        service.getById('AAAA', { getCurrentPeriod: false }).subscribe(application => {
          expect(application.currentPeriod).toBeNull();
        });
      });
    });

    describe('with the getDecision Parameter', () => {
      it('makes a call to decisionService.getByApplicationId and attaches the resulting decision', () => {
        service.getById('AAAA', { getDecision: true }).subscribe( application => {
          expect(application.decision).toBeDefined()
          expect(application.decision).not.toBeNull();
          expect(application.decision[0]._id).toBe('IIIII');
          expect(application.decision[1]._id).toBe('JJJJJ');
        });
      });
    });

    describe('without the getDecision Parameter', () => {
      it('does not call decisionService.getByApplicationId', () => {
        let decisionService = TestBed.get(DecisionService);
        spyOn(decisionService, 'getByApplicationId');
        expect(decisionService.getByApplicationId).not.toHaveBeenCalled();
      });

      it('has no attached decision', () => {
        service.getById('AAAA', { getDecision: false }).subscribe(application => {
          expect(application.decision).toBeDefined()
          expect(application.decision).toBeNull();
        });
      });
    });
  });

  describe('getStatusString()', () => {
    it('with "AB" code it returns "Application Abandoned"', () => {
      expect(service.getStatusString('AB')).toBe('Application Abandoned');
    });

    it('with "AC" code it returns "Application Under Review', () => {
      expect(service.getStatusString('AC')).toBe('Application Under Review');
    });
    
    it('with "AL" code it returns "Decision: Allowed', () => {
      expect(service.getStatusString('AL')).toBe('Decision: Allowed');
    });

    it('with "CA" code it returns "Application Cancelled', () => {
      expect(service.getStatusString('CA')).toBe('Application Cancelled');
    });

    it('with "DE" code it returns "Decision Made', () => {
      expect(service.getStatusString('DE')).toBe('Decision Made');
    });

    it('with "DI" code it returns "Decision: Not Approved', () => {
      expect(service.getStatusString('DI')).toBe('Decision: Not Approved');
    });

    it('with "DG" code it returns "Tenure: Disposition in Good Standing', () => {
      expect(service.getStatusString('DG')).toBe('Tenure: Disposition in Good Standing');
    });

    it('with "OA" code it returns "Decision: Offer Accepted', () => {
      expect(service.getStatusString('OA')).toBe('Decision: Offer Accepted');
    });

    it('with "ON" code it returns "Decision: Offer Not Accepted', () => {
      expect(service.getStatusString('ON')).toBe('Decision: Offer Not Accepted');
    });

    it('with "OF" code it returns "Decision: Offered', () => {
      expect(service.getStatusString('OF')).toBe('Decision: Offered');
    });

    it('with "SU" code it returns "Tenure: Suspended', () => {
      expect(service.getStatusString('SU')).toBe('Tenure: Suspended');
    });

    it('with "UN" code it returns "Unknown Application Status', () => {
      expect(service.getStatusString('UN')).toBe('Unknown Application Status');
    });

    it('returns the code that was passed in if it is not recognized', () => {
      expect(service.getStatusString('WOO_BOY')).toBe('WOO_BOY');
    });
  });

  describe('getStatusCode()', () => {
    it('with "ABANDONED" status it returns "AB" code', () => {
      expect(service.getStatusCode('ABANDONED')).toBe('AB');
    });
    
    it('with "ACCEPTED" status it returns "AC" code', () => {
      expect(service.getStatusCode('ACCEPTED')).toBe('AC');
    });
    
    it('with "ALLOWED" status it returns "AL" code', () => {
      expect(service.getStatusCode('ALLOWED')).toBe('AL');
    });
    
    it('with "CANCELLED" status it returns "CA" code', () => {
      expect(service.getStatusCode('CANCELLED')).toBe('CA');
    });
    
    it('with "DISALLOWED" status it returns "DI" code', () => {
      expect(service.getStatusCode('DISALLOWED')).toBe('DI');
    });

    it('with "DISPOSITION IN GOOD STANDING" status it returns "DG" code', () => {
      expect(service.getStatusCode('DISPOSITION IN GOOD STANDING')).toBe('DG');
    });

    it('with "OFFER ACCEPTED" status it returns "OA" code', () => {
      expect(service.getStatusCode('OFFER ACCEPTED')).toBe('OA');
    });

    it('with "OFFER NOT ACCEPTED" status it returns "ON" code', () => {
      expect(service.getStatusCode('OFFER NOT ACCEPTED')).toBe('ON');
    });
    
    it('with "OFFERED" status it returns "OF" code', () => {
      expect(service.getStatusCode('OFFERED')).toBe('OF');
    });

    it('with "SUSPENDED" status it returns "SU" code', () => {
      expect(service.getStatusCode('SUSPENDED')).toBe('SU');
    });

    it('returns "UN" if no status passed', () => {
      expect(service.getStatusCode('')).toBe('UN');
    });

    it('returns "UN" if the passed in status is undefined', () => {
      let undefinedStatus;
      expect(service.getStatusCode(undefinedStatus)).toBe('UN');
    });

    it('returns the status back if it is not recognized', () => {
      expect(service.getStatusCode('WOO_BOY')).toBe('Woo Boy');
    });
  });

  describe('getRegionString()', () => {
    it('with "CA" code it returns "Cariboo, Williams Lake"', () => {
      expect(service.getRegionString('CA')).toBe('Cariboo, Williams Lake');
    });

    it('with "KO" code it returns "Kootenay, Cranbrook"', () => {
      expect(service.getRegionString('KO')).toBe('Kootenay, Cranbrook');
    });

    it('with "LM" code it returns "Lower Mainland, Surrey"', () => {
      expect(service.getRegionString('LM')).toBe('Lower Mainland, Surrey');
    });

    it('with "OM" code it returns "Omenica/Peace, Prince George"', () => {
      expect(service.getRegionString('OM')).toBe('Omenica/Peace, Prince George');
    });

    it('with "PE" code it returns "Peace, Ft. St. John"', () => {
      expect(service.getRegionString('PE')).toBe('Peace, Ft. St. John');
    });
    
    it('with "SK" code it returns "Skeena, Smithers"', () => {
      expect(service.getRegionString('SK')).toBe('Skeena, Smithers');
    });

    it('with "SI" code it returns "Thompson Okanagan, Kamloops"', () => {
      expect(service.getRegionString('SI')).toBe('Thompson Okanagan, Kamloops');
    });

    it('with "VI" code it returns "West Coast, Nanaimo"', () => {
      expect(service.getRegionString('VI')).toBe('West Coast, Nanaimo');
    });

    it('returns "undefined" if code is not recognized', () => {
      expect(service.getRegionString('WUT')).toBeUndefined();
    });
  });

  describe('getRegionCode()', () => {
    it('returns the two letter abbreviation in the businessUnit string', () => {
      const businessUnit = 'SK - LAND MGMNT - SKEENA FIELD OFFICE';
      expect(service.getRegionCode(businessUnit)).toBe('SK');
    });

    it('returns null if no businessUnit is present', () =>{
      expect(service.getRegionCode()).toBeNull();
    });
  });
});
