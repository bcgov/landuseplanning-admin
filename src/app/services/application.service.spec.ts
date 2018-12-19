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
      const application = new Application({ _id: id, status: 'ACCEPTED' });
      return of([application]);
    },

    getApplications() {
      const firstApplication = new Application({ _id: 'BBBB', status: 'ACCEPTED' });
      const secondApplication = new Application({ _id: 'CCCC', status: 'ABANDONED' });
      return of([firstApplication, secondApplication]);
    },

    handleError(error: any) {
      fail(error);
    }
  };


  const featureServiceStub = {
    getByApplicationId(applicationId: string) {
      const features = [
        new Feature({ id: 'FFFFF', properties: { TENURE_AREA_IN_HECTARES: 12 } }),
        new Feature({ id: 'GGGGG', properties: { TENURE_AREA_IN_HECTARES: 13 } })
      ];
      return of(features);
    }
  };

  const documentServiceStub = {
    getAllByApplicationId(applicationId: string) {
      const documents = [
        new Document({ _id: 'DDDDD' }),
        new Document({ _id: 'EEEEE' })
      ];
      return of(documents);
    }
  };

  const commentPeriodServiceStub = {
    getAllByApplicationId(applicationId: string) {
      const commentPeriods = [
        new CommentPeriod({ _id: 'DDDDD', startDate: new Date(2018, 10, 1), endDate: new Date(2018, 11, 10) }),
        new CommentPeriod({ _id: 'EEEEE', startDate: new Date(2018, 10, 1), endDate: new Date(2018, 11, 10) })
      ];
      return of(commentPeriods);
    },

    getCurrent(periods: CommentPeriod[]): CommentPeriod {
      return (periods.length > 0) ? periods[0] : null;
    },

    getStatusCode(period: CommentPeriod): string {
      return service.OPEN;
    },

    getStatusString(statusCode: string): string {
      return 'Commenting Open';
    },

    isOpen(period: CommentPeriod): boolean {
      return true;
    }
  };

  const decisionServiceStub = {
    getByApplicationId(applicationId: string) {
      return of(new Decision({ _id: 'IIIII' }));
    }
  };

  const commentServiceStub = {
    getCountByPeriodId(periodId: string): Observable<number> {
      return of(42);
    }
  };

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

  it('should be created', inject([ApplicationService], (appService: ApplicationService) => {
    expect(appService).toBeTruthy();
  }));

  describe('getAll()', () => {
    it('retrieves the applications from the api service', () => {
      service.getAll().subscribe(applications => {
        expect(applications[0]._id).toBe('BBBB');
        expect(applications[1]._id).toBe('CCCC');
      });
    });

    describe('application properties', () => {
      let existingApplication = new Application({
        _id: 'AAAA'
      });

      let apiService;
      beforeEach(() => {
        apiService = TestBed.get(ApiService);

        spyOn(apiService, 'getApplications').and.returnValue(of([existingApplication]));
      });

      it('sets the appStatus property', () => {
        existingApplication.status = 'ACCEPTED';
        service.getAll().subscribe(applications => {
          let application = applications[0];
          expect(application.appStatus).toBe('Application Under Review');
        });
      });

      it('clFile property is padded to be seven digits', () => {
        existingApplication.cl_file = 7777;
        service.getAll().subscribe(applications => {
          let application = applications[0];
          expect(application.clFile).toBe('0007777');
        });
      });

      it('clFile property is null if there is no cl_file property', () => {
        existingApplication.cl_file = null;
        service.getAll().subscribe(applications => {
          let application = applications[0];
          expect(application.clFile).toBeUndefined();
        });
      });

      it('sets the region property', () => {
        existingApplication.businessUnit = 'SK - LAND MGMNT - SKEENA FIELD OFFICE';
        service.getAll().subscribe(applications => {
          let application = applications[0];
          expect(application.region).toBeDefined();
          expect(application.region).toEqual(service.SKEENA);
        });
      });
    });

    // The getCurrentPeriod parameter is currently the only one passed to this function
    // in the codebase, so that's why this is the only one tested. getFeatures, getDocuments,
    // etc aren't actually used with this function at the moment.

    describe('with the getCurrentPeriod Parameter', () => {
      // let commentPeriodService;
      const firstAppCommentPeriod = new CommentPeriod({ _id: 'CP_FOR_FIRST_APP', startDate: new Date(2018, 10, 1), endDate: new Date(2018, 11, 10) });
      const secondAppCommentPeriod = new CommentPeriod({ _id: 'CP_FOR_SECOND_APP', startDate: new Date(2018, 10, 1), endDate: new Date(2018, 11, 10) });

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
        service.getAll({ getCurrentPeriod: true }).subscribe(applications => {
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

      it('sets the cpStatus to the commentPeriodService.getStatusString result', () => {
        service.getAll({ getCurrentPeriod: true }).subscribe(applications => {
          let firstApplication = applications[0];
          expect(firstApplication.cpStatus).toBe('Commenting Open');
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
          firstAppCommentPeriod.startDate = new Date(2018, 10, 1);
          firstAppCommentPeriod.endDate = new Date(2018, 11, 10);

          service.getAll({ getCurrentPeriod: true }).subscribe(applications => {
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
          service.getAll({ getCurrentPeriod: true }).subscribe(applications => {
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
          service.getAll({ getCurrentPeriod: true }).subscribe(applications => {
            expect(applications[0].numComments).toEqual(42);
            expect(applications[1].numComments).toEqual(42);
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
      service.getById('AAAA').subscribe(application => {
        expect(application._id).toBe('AAAA');
      });
    });

    describe('application properties', () => {
      let existingApplication = new Application({
        _id: 'AAAA'
      });

      let apiService;
      beforeEach(() => {
        apiService = TestBed.get(ApiService);

        spyOn(apiService, 'getApplication').and.returnValue(of([existingApplication]));
      });

      it('sets the appStatus property', () => {
        existingApplication.status = 'ACCEPTED';
        service.getById('AAAA').subscribe(application => {
          expect(application.appStatus).toBe('Application Under Review');
        });
      });

      it('clFile property is padded to be seven digits', () => {
        existingApplication.cl_file = 7777;
        service.getById('AAAA').subscribe(application => {
          expect(application.clFile).toBe('0007777');
        });
      });

      it('clFile property is null if there is no cl_file property', () => {
        existingApplication.cl_file = null;
        service.getById('AAAA').subscribe(application => {
          expect(application.clFile).toBeUndefined();
        });
      });

      it('sets the region property', () => {
        existingApplication.businessUnit = 'SK - LAND MGMNT - SKEENA FIELD OFFICE';
        service.getById('AAAA').subscribe(application => {
          expect(application.region).toBeDefined();
          expect(application.region).toEqual(service.SKEENA);
        });
      });
    });

    describe('with the getFeatures Parameter', () => {
      it('makes a call to featureService.getByApplicationId and attaches the resulting features', () => {
        service.getById('AAAA', { getFeatures: true }).subscribe(application => {
          expect(application.features).toBeDefined();
          expect(application.features).not.toBeNull();
          expect(application.features[0].id).toBe('FFFFF');
          expect(application.features[1].id).toBe('GGGGG');
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
          expect(application.features).toBeDefined();
          expect(application.features).toEqual([]);
        });
      });
    });

    describe('with the getDocuments Parameter', () => {
      it('makes a call to documentService.getAllByApplicationId and attaches the resulting documents', () => {
        service.getById('AAAA', { getDocuments: true }).subscribe(application => {
          expect(application.documents).toBeDefined();
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
          expect(application.documents).toBeDefined();
          expect(application.documents).toEqual([]);
        });
      });
    });

    describe('with the getCurrentPeriod Parameter', () => {
      it('makes a call to commentPeriodService.getAllByApplicationId and attaches the first resulting comment period', () => {
        service.getById('AAAA', { getCurrentPeriod: true }).subscribe(application => {
          expect(application.currentPeriod).toBeDefined();
          expect(application.currentPeriod).not.toBeNull();
          expect(application.currentPeriod._id).toBe('DDDDD');
        });
      });

      it('sets the cpStatus to the commentPeriodService.getStatusString result', () => {
        service.getById('AAAA', { getCurrentPeriod: true }).subscribe(application => {
          expect(application.cpStatus).toBe('Commenting Open');
        });
      });

      describe('if the comment period is open', () => {
        let periodExpiringOnTheTenth = new CommentPeriod({
          _id: 'CCCC',
          startDate: new Date(2018, 10, 1),
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
          service.getById('AAAA', { getCurrentPeriod: true }).subscribe(application => {
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
          service.getById('AAAA', { getCurrentPeriod: true }).subscribe(application => {
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
          service.getById('AAAA', { getCurrentPeriod: true }).subscribe(application => {
            expect(application.numComments).toEqual(42);
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
        service.getById('AAAA', { getDecision: true }).subscribe(application => {
          expect(application.decision).toBeDefined();
          expect(application.decision).not.toBeNull();
          expect(application.decision._id).toBe('IIIII');
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
          expect(application.decision).toBeDefined();
          expect(application.decision).toBeNull();
        });
      });
    });
  });

  describe('getStatusCode()', () => {
    it('with "ABANDONED" status it returns "AB" code', () => {
      expect(service.getStatusCode('ABANDONED')).toEqual(service.ABANDONED);
    });

    it('with "CANCELLED" status it returns "AB" code', () => {
      expect(service.getStatusCode('CANCELLED')).toEqual(service.ABANDONED);
    });

    it('with "OFFER NOT ACCEPTED" status it returns "AB" code', () => {
      expect(service.getStatusCode('OFFER NOT ACCEPTED')).toEqual(service.ABANDONED);
    });

    it('with "OFFER RESCINDED" status it returns "AB" code', () => {
      expect(service.getStatusCode('OFFER RESCINDED')).toEqual(service.ABANDONED);
    });

    it('with "RETURNED" status it returns "AB" code', () => {
      expect(service.getStatusCode('RETURNED')).toEqual(service.ABANDONED);
    });

    it('with "REVERTED" status it returns "AB" code', () => {
      expect(service.getStatusCode('REVERTED')).toEqual(service.ABANDONED);
    });

    it('with "SOLD" status it returns "AB" code', () => {
      expect(service.getStatusCode('SOLD')).toEqual(service.ABANDONED);
    });

    it('with "SUSPENDED" status it returns "AB" code', () => {
      expect(service.getStatusCode('SUSPENDED')).toEqual(service.ABANDONED);
    });

    it('with "WITHDRAWN" status it returns "AB" code', () => {
      expect(service.getStatusCode('WITHDRAWN')).toEqual(service.ABANDONED);
    });

    it('with "ACCEPTED" status it returns "AUR" code', () => {
      expect(service.getStatusCode('ACCEPTED')).toEqual(service.APPLICATION_UNDER_REVIEW);
    });

    it('with "ALLOWED" status it returns "AUR" code', () => {
      expect(service.getStatusCode('ALLOWED')).toEqual(service.APPLICATION_UNDER_REVIEW);
    });

    it('with "PENDING" status it returns "AUR" code', () => {
      expect(service.getStatusCode('PENDING')).toEqual(service.APPLICATION_UNDER_REVIEW);
    });

    it('with "RECEIVED" status it returns "AUR" code', () => {
      expect(service.getStatusCode('RECEIVED')).toEqual(service.APPLICATION_UNDER_REVIEW);
    });

    it('with "OFFER ACCEPTED" status it returns "ARC" code', () => {
      expect(service.getStatusCode('OFFER ACCEPTED')).toEqual(service.APPLICATION_REVIEW_COMPLETE);
    });

    it('with "OFFERED" status it returns "ARC" code', () => {
      expect(service.getStatusCode('OFFERED')).toEqual(service.APPLICATION_REVIEW_COMPLETE);
    });

    it('with "ACTIVE" status it returns "DA" code', () => {
      expect(service.getStatusCode('ACTIVE')).toEqual(service.DECISION_APPROVED);
    });

    it('with "COMPLETED" status it returns "DA" code', () => {
      expect(service.getStatusCode('COMPLETED')).toEqual(service.DECISION_APPROVED);
    });

    it('with "DISPOSITION IN GOOD STANDING" status it returns "DA" code', () => {
      expect(service.getStatusCode('DISPOSITION IN GOOD STANDING')).toEqual(service.DECISION_APPROVED);
    });

    it('with "EXPIRED" status it returns "DA" code', () => {
      expect(service.getStatusCode('EXPIRED')).toEqual(service.DECISION_APPROVED);
    });

    it('with "HISTORIC" status it returns "DA" code', () => {
      expect(service.getStatusCode('HISTORIC')).toEqual(service.DECISION_APPROVED);
    });

    it('with "DISALLOWED" status it returns "DNA" code', () => {
      expect(service.getStatusCode('DISALLOWED')).toEqual(service.DECISION_NOT_APPROVED);
    });

    it('with "NOT USED" status it returns "UN" code', () => {
      expect(service.getStatusCode('NOT USED')).toEqual(service.UNKNOWN);
    });

    it('with "PRE-TANTALIS" status it returns "UN" code', () => {
      expect(service.getStatusCode('PRE-TANTALIS')).toEqual(service.UNKNOWN);
    });

    it('returns "UN" if status is empty', () => {
      expect(service.getStatusCode('')).toEqual(service.UNKNOWN);
    });

    it('returns "UN" if status is undefined', () => {
      expect(service.getStatusCode(undefined)).toEqual(service.UNKNOWN);
    });

    it('returns "UN" if status is null', () => {
      expect(service.getStatusCode(null)).toEqual(service.UNKNOWN);
    });
  });

  describe('getTantalisStatus()', () => {
    it('with "AB" status it returns Abandoned codes', () => {
      expect(service.getTantalisStatus(service.ABANDONED)).toEqual(
        ['ABANDONED', 'CANCELLED', 'OFFER NOT ACCEPTED', 'OFFER RESCINDED', 'RETURNED', 'REVERTED', 'SOLD', 'SUSPENDED', 'WITHDRAWN']
      );
    });

    it('with "AUR" status it returns Application Under Review codes', () => {
      expect(service.getTantalisStatus(service.APPLICATION_UNDER_REVIEW)).toEqual(
        ['ACCEPTED', 'ALLOWED', 'PENDING', 'RECEIVED']
      );
    });

    it('with "ARC" status it returns Application Review Complete codes', () => {
      expect(service.getTantalisStatus(service.APPLICATION_REVIEW_COMPLETE)).toEqual(
        ['OFFER ACCEPTED', 'OFFERED']
      );
    });

    it('with "DA" status it returns Decision Approved codes', () => {
      expect(service.getTantalisStatus(service.DECISION_APPROVED)).toEqual(
        ['ACTIVE', 'COMPLETED', 'DISPOSITION IN GOOD STANDING', 'EXPIRED', 'HISTORIC']
      );
    });

    it('with "DNA" status it returns Decision Not Approved codes', () => {
      expect(service.getTantalisStatus(service.DECISION_NOT_APPROVED)).toEqual(
        ['DISALLOWED']
      );
    });
  });

  describe('getShortStatusString()', () => {
    it('with "AB" code it returns "Abandoned" string', () => {
      expect(service.getShortStatusString(service.ABANDONED)).toBe('Abandoned');
    });

    it('with "AUR" code it returns "Under Review" string', () => {
      expect(service.getShortStatusString(service.APPLICATION_UNDER_REVIEW)).toBe('Under Review');
    });

    it('with "ARC" code it returns "Decision Pending" string', () => {
      expect(service.getShortStatusString(service.APPLICATION_REVIEW_COMPLETE)).toBe('Decision Pending');
    });

    it('with "DA" code it returns "Approved" string', () => {
      expect(service.getShortStatusString(service.DECISION_APPROVED)).toBe('Approved');
    });

    it('with "DNA" code it returns "Not Approved" string', () => {
      expect(service.getShortStatusString(service.DECISION_NOT_APPROVED)).toBe('Not Approved');
    });

    it('with "UN" code it returns "Unknown" string', () => {
      expect(service.getShortStatusString(service.UNKNOWN)).toBe('Unknown');
    });
  });

  describe('getLongStatusString()', () => {
    it('with "AB" code it returns "Abandoned" string', () => {
      expect(service.getLongStatusString(service.ABANDONED)).toBe('Abandoned');
    });

    it('with "AUR" code it returns "Application Under Review" string', () => {
      expect(service.getLongStatusString(service.APPLICATION_UNDER_REVIEW)).toBe('Application Under Review');
    });

    it('with "ARC" code it returns "Application Review Complete - Decision Pending" string', () => {
      expect(service.getLongStatusString(service.APPLICATION_REVIEW_COMPLETE)).toBe('Application Review Complete - Decision Pending');
    });

    it('with "DA" code it returns "Decision: Approved - Tenure Issued" string', () => {
      expect(service.getLongStatusString(service.DECISION_APPROVED)).toBe('Decision: Approved - Tenure Issued');
    });

    it('with "DNA" code it returns "Decision: Not Approved" string', () => {
      expect(service.getLongStatusString(service.DECISION_NOT_APPROVED)).toBe('Decision: Not Approved');
    });

    it('with "UN" code it returns "Unknown status" string', () => {
      expect(service.getLongStatusString(service.UNKNOWN)).toBe('Unknown Status');
    });
  });

  describe('isAbandoned()', () => {
    it('with "AB" code it returns true', () => {
      expect(service.isAbandoned(service.ABANDONED)).toBe(true);
    });

    it('with "xx" code it returns false', () => {
      expect(service.isAbandoned('xx')).toBe(false);
    });

    it('with null code it returns false', () => {
      expect(service.isAbandoned(null)).toBe(false);
    });
  });

  describe('isApplicationUnderReview()', () => {
    it('with "AUR" code it returns true', () => {
      expect(service.isApplicationUnderReview(service.APPLICATION_UNDER_REVIEW)).toBe(true);
    });

    it('with "xx" code it returns false', () => {
      expect(service.isApplicationUnderReview('xx')).toBe(false);
    });

    it('with null code it returns false', () => {
      expect(service.isApplicationUnderReview(null)).toBe(false);
    });
  });

  describe('isApplicationReviewComplete()', () => {
    it('with "ARC" code it returns true', () => {
      expect(service.isApplicationReviewComplete(service.APPLICATION_REVIEW_COMPLETE)).toBe(true);
    });

    it('with "xx" code it returns false', () => {
      expect(service.isApplicationReviewComplete('xx')).toBe(false);
    });

    it('with null code it returns false', () => {
      expect(service.isApplicationReviewComplete(null)).toBe(false);
    });
  });

  describe('isDecisionApproved()', () => {
    it('with "DA" code it returns true', () => {
      expect(service.isDecisionApproved(service.DECISION_APPROVED)).toBe(true);
    });

    it('with "xx" code it returns false', () => {
      expect(service.isDecisionApproved('xx')).toBe(false);
    });

    it('with null code it returns false', () => {
      expect(service.isDecisionApproved(null)).toBe(false);
    });
  });

  describe('isDecisionNotApproved()', () => {
    it('with "DNA" code it returns true', () => {
      expect(service.isDecisionNotApproved(service.DECISION_NOT_APPROVED)).toBe(true);
    });

    it('with "xx" code it returns false', () => {
      expect(service.isDecisionNotApproved('xx')).toBe(false);
    });

    it('with null code it returns false', () => {
      expect(service.isDecisionNotApproved(null)).toBe(false);
    });
  });

  describe('isUnknown()', () => {
    it('with "UN" code it returns true', () => {
      expect(service.isUnknown(service.UNKNOWN)).toBe(true);
    });

    it('with "xx" code it returns false', () => {
      expect(service.isUnknown('xx')).toBe(false);
    });

    it('with null code it returns false', () => {
      expect(service.isUnknown(null)).toBe(false);
    });
  });

  describe('getRegionCode()', () => {
    it('with "CA - LAND MGMNT - CARIBOO FIELD OFFICE" it returns "CA" code', () => {
      expect(service.getRegionCode('CA - LAND MGMNT - CARIBOO FIELD OFFICE')).toEqual(service.CARIBOO);
    });

    it('with "KO - LAND MGMNT - KOOTENAY FIELD OFFICE" it returns "KO" code', () => {
      expect(service.getRegionCode('KO - LAND MGMNT - KOOTENAY FIELD OFFICE')).toEqual(service.KOOTENAY);
    });

    it('with "LM - LAND MGMNT - LOWER MAINLAND SERVICE REGION" it returns "LM" code', () => {
      expect(service.getRegionCode('LM - LAND MGMNT - LOWER MAINLAND SERVICE REGION')).toEqual(service.LOWER_MAINLAND);
    });

    it('with "OM - LAND MGMNT - NORTHERN SERVICE REGION" it returns "OM" code', () => {
      expect(service.getRegionCode('OM - LAND MGMNT - NORTHERN SERVICE REGION')).toEqual(service.OMENICA);
    });

    it('with "PE - LAND MGMNT - PEACE FIELD OFFICE" it returns "PE" code', () => {
      expect(service.getRegionCode('PE - LAND MGMNT - PEACE FIELD OFFICE')).toEqual(service.PEACE);
    });

    it('with "SK - LAND MGMNT - SKEENA FIELD OFFICE" it returns "SK" code', () => {
      expect(service.getRegionCode('SK - LAND MGMNT - SKEENA FIELD OFFICE')).toEqual(service.SKEENA);
    });

    it('with "SI - LAND MGMNT - SOUTHERN SERVICE REGION" it returns "SI" code', () => {
      expect(service.getRegionCode('SI - LAND MGMNT - SOUTHERN SERVICE REGION')).toEqual(service.SOUTHERN_INTERIOR);
    });

    it('with "VI - LAND MGMNT - VANCOUVER ISLAND SERVICE REGION" it returns "VI" code', () => {
      expect(service.getRegionCode('VI - LAND MGMNT - VANCOUVER ISLAND SERVICE REGION')).toEqual(service.VANCOUVER_ISLAND);
    });

    it('returns Falsy if Business Unit is empty', () => {
      expect(service.getRegionCode('')).toBeFalsy();
    });

    it('returns Falsy if Business Unit is undefined', () => {
      expect(service.getRegionCode(undefined)).toBeFalsy();
    });
    it('returns Falsy if Business Unit is null', () => {
      expect(service.getRegionCode(null)).toBeFalsy();
    });
  });

  describe('getRegionString()', () => {
    it('with "CA" code it returns "Cariboo, Williams Lake"', () => {
      expect(service.getRegionString(service.CARIBOO)).toBe('Cariboo, Williams Lake');
    });

    it('with "KO" code it returns "Kootenay, Cranbrook"', () => {
      expect(service.getRegionString(service.KOOTENAY)).toBe('Kootenay, Cranbrook');
    });

    it('with "LM" code it returns "Lower Mainland, Surrey"', () => {
      expect(service.getRegionString(service.LOWER_MAINLAND)).toBe('Lower Mainland, Surrey');
    });

    it('with "OM" code it returns "Omenica/Peace, Prince George"', () => {
      expect(service.getRegionString(service.OMENICA)).toBe('Omenica/Peace, Prince George');
    });

    it('with "PE" code it returns "Peace, Ft. St. John"', () => {
      expect(service.getRegionString(service.PEACE)).toBe('Peace, Ft. St. John');
    });

    it('with "SK" code it returns "Skeena, Smithers"', () => {
      expect(service.getRegionString(service.SKEENA)).toBe('Skeena, Smithers');
    });

    it('with "SI" code it returns "Thompson Okanagan, Kamloops"', () => {
      expect(service.getRegionString(service.SOUTHERN_INTERIOR)).toBe('Thompson Okanagan, Kamloops');
    });

    it('with "VI" code it returns "West Coast, Nanaimo"', () => {
      expect(service.getRegionString(service.VANCOUVER_ISLAND)).toBe('West Coast, Nanaimo');
    });

    it('returns Falsy if code is not recognized', () => {
      expect(service.getRegionString('WTF')).toBeFalsy();
    });

    it('returns Falsy if code is empty', () => {
      expect(service.getRegionString('')).toBeFalsy();
    });

    it('returns Falsy if code is undefined', () => {
      expect(service.getRegionString(undefined)).toBeFalsy();
    });

    it('returns Falsy if code is null', () => {
      expect(service.getRegionString(null)).toBeFalsy();
    });
  });
});
