import { TestBed, inject } from '@angular/core/testing';

import { ApplicationService } from './application.service';
import { ApiService } from 'app/services/api';
import { DocumentService } from 'app/services/document.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentService } from 'app/services/comment.service';
import { DecisionService } from 'app/services/decision.service';
import { FeatureService } from 'app/services/feature.service';

describe('ApplicationService', () => {
  let service;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApplicationService,
        { provide: ApiService },
        { provide: DocumentService },
        { provide: CommentPeriodService },
        { provide: CommentService },
        { provide: DecisionService },
        { provide: FeatureService },
      ]
    });

    service = TestBed.get(ApplicationService);
  });

  it('should be created', inject([ApplicationService], (service: ApplicationService) => {
    expect(service).toBeTruthy();
  }));

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
