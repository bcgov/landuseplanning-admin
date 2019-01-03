import { async, TestBed } from '@angular/core/testing';
import { Application } from 'app/models/application';
import { ApiService } from 'app/services/api';
import { of, throwError } from 'rxjs';
import { ApplicationService } from './application.service';
import { SearchService } from './search.service';
import { SearchResults } from 'app/models/search';
import { InterestedParty } from 'app/models/interestedParty';

describe('SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SearchService,
        {
          provide: ApiService,
          useValue: jasmine.createSpyObj('ApiService', [
            'searchAppsByCLID',
            'searchAppsByDTID',
            'handleError'
          ])
        },
        {
          provide: ApplicationService,
          useValue: jasmine.createSpyObj('ApplicationService', [
            'getByCrownLandID',
            'getByTantalisID',
            'getStatusString',
            'getStatusCode',
            'getRegionCode'
          ])
        }
      ]
    });
  });

  it('should be created', () => {
    const service = TestBed.get(SearchService);
    expect(service).toBeTruthy();
  });

  describe('getAppsByClidDtid', () => {
    let service;
    let apiSpy;
    let ApplicationServiceSpy;
    beforeEach(() => {
      service = TestBed.get(SearchService);
      apiSpy = TestBed.get(ApiService);
      ApplicationServiceSpy = TestBed.get(ApplicationService);
    });

    describe('when getAppsByCLID returns results', () => {
      beforeEach(() => {
        // Only testing calls to getAppsByCLID
        spyOn(service, 'getAppByDTID').and.returnValue(of([] as Application[]));
      });

      describe('when no applications or search results are returned', () => {
        it('returns an empty array of applications', async(() => {
          ApplicationServiceSpy.getByCrownLandID.and.returnValue(
            of([] as Application[])
          );

          apiSpy.searchAppsByCLID.and.returnValue(of([] as SearchResults[]));

          service.getAppsByClidDtid(['123']).subscribe(result => {
            expect(result).toEqual([] as Application[]);
          });
        }));
      });

      describe('when application results from within PRC are returned', () => {
        let result: Array<Application[]>;
        beforeEach(async(() => {
          result = [];

          ApplicationServiceSpy.getByCrownLandID.and.returnValue(
            of([new Application({ _id: '1' }), new Application({ _id: '2' })])
          );

          apiSpy.searchAppsByCLID.and.returnValue(of([] as SearchResults[]));

          service.getAppsByClidDtid(['123']).subscribe(res => {
            result.push(res);
          });
        }));

        it('getAppsByClidDtid emits twice', async(() => {
          expect(result.length).toEqual(2);
        }));

        it('returns an array of applications', async(() => {
          expect(result[0].length).toEqual(2);
          expect(result[1].length).toEqual(0);
        }));

        describe('the array of applications returned from PRC', () => {
          let prcResult: Application[];
          beforeEach(() => {
            prcResult = result[0];
          });

          it('has an isCreated property set to true', () => {
            expect(prcResult[0]._id).toBe('1');
            expect(prcResult[0]['isCreated']).toBe(true);

            expect(prcResult[1]._id).toBe('2');
            expect(prcResult[1]['isCreated']).toBe(true);
          });
        });

        it('does not call ApplicationService getStatusString', () => {
          expect(ApplicationServiceSpy.getStatusString).not.toHaveBeenCalled();
        });

        it('does not call ApplicationService getStatusCode', () => {
          expect(ApplicationServiceSpy.getStatusCode).not.toHaveBeenCalled();
        });

        it('does not call ApplicationService getRegionCode', () => {
          expect(ApplicationServiceSpy.getRegionCode).not.toHaveBeenCalled();
        });
      });

      describe('when application results from Tantalis are returned', () => {
        let result: Array<Application[]>;
        beforeEach(async(() => {
          result = [];

          ApplicationServiceSpy.getByCrownLandID.and.returnValue(
            of([] as Application[])
          );

          apiSpy.searchAppsByCLID.and.returnValue(
            of([
              new SearchResults({
                type: 'type',
                status: 'status',
                interestedParties: [
                  new InterestedParty({
                    interestedPartyType: 'O',
                    legalName: 'legal-name-1',
                    firstName: 'first-name-1',
                    lastName: 'last-name-1'
                  }),
                  new InterestedParty({
                    interestedPartyType: 'notO',
                    legalName: 'legal-name-3',
                    firstName: 'first-name-3',
                    lastName: 'last-name-3'
                  })
                ],
                CROWN_LANDS_FILE: '11',
                DISPOSITION_TRANSACTION_SID: '33',
                RESPONSIBLE_BUSINESS_UNIT: '44',
                TENURE_PURPOSE: 'tenure-purpose-1',
                TENURE_LOCATION: 'tenure-location-1',
                TENURE_STAGE: 'tenure-stage-1',
                TENURE_STATUS: 'tenure-status-1',
                TENURE_SUBPURPOSE: 'tenure-subpurpose-1',
                TENURE_SUBTYPE: 'tenure-subtype-1',
                TENURE_TYPE: 'tenure-type-1'
              }),
              new SearchResults({
                type: 'type',
                status: 'status',
                interestedParties: [
                  new InterestedParty({
                    interestedPartyType: 'notO',
                    legalName: 'legal-name-2',
                    firstName: 'first-name-2',
                    lastName: 'last-name-2'
                  })
                ],
                CROWN_LANDS_FILE: '22',
                DISPOSITION_TRANSACTION_SID: '55',
                RESPONSIBLE_BUSINESS_UNIT: '66',
                TENURE_PURPOSE: 'tenure-purpose-2',
                TENURE_LOCATION: 'tenure-location-2',
                TENURE_STAGE: 'tenure-stage-2',
                TENURE_STATUS: 'tenure-status-2',
                TENURE_SUBPURPOSE: 'tenure-subpurpose-2',
                TENURE_SUBTYPE: 'tenure-subtype-2',
                TENURE_TYPE: 'tenure-type-2'
              })
            ])
          );

          ApplicationServiceSpy.getStatusString.and.callFake(arg => {
            return 'someStatusString';
          });
          ApplicationServiceSpy.getStatusCode.and.returnValue('someStatusCode');
          ApplicationServiceSpy.getRegionCode.and.returnValue('someRegionCode');

          service.getAppsByClidDtid(['123']).subscribe(
            res => {
              result.push(res);
            },
            error => {
              fail(error);
            }
          );
        }));

        it('getAppsByClidDtid emits twice', async(() => {
          expect(result.length).toEqual(2);
        }));

        it('returns an array of applications', async(() => {
          expect(result[0].length).toEqual(2);
          expect(result[1].length).toEqual(0);
        }));

        describe('the array of applications returned from Tantalis', () => {
          let prcResult: Application[];
          beforeEach(() => {
            prcResult = result[0];
          });

          it('sets certain values of the application', () => {
            expect(prcResult[0].purpose).toBe('tenure-purpose-1');
            expect(prcResult[0].subpurpose).toBe('tenure-subpurpose-1');
            expect(prcResult[0].type).toBe('tenure-type-1');
            expect(prcResult[0].subtype).toBe('tenure-subtype-1');
            expect(prcResult[0].status).toBe('tenure-status-1');
            expect(prcResult[0].tenureStage).toBe('tenure-stage-1');
            expect(prcResult[0].location).toBe('tenure-location-1');
            expect(prcResult[0].businessUnit).toBe('44');
            expect(prcResult[0].cl_file).toBe(11);
            expect(prcResult[0].tantalisID).toBe(33);

            expect(prcResult[1].purpose).toBe('tenure-purpose-2');
            expect(prcResult[1].subpurpose).toBe('tenure-subpurpose-2');
            expect(prcResult[1].type).toBe('tenure-type-2');
            expect(prcResult[1].subtype).toBe('tenure-subtype-2');
            expect(prcResult[1].status).toBe('tenure-status-2');
            expect(prcResult[1].tenureStage).toBe('tenure-stage-2');
            expect(prcResult[1].location).toBe('tenure-location-2');
            expect(prcResult[1].businessUnit).toBe('66');
            expect(prcResult[1].cl_file).toBe(22);
            expect(prcResult[1].tantalisID).toBe(55);
          });

          it('builds and sets a client string', () => {
            expect(prcResult[0].client).toBe(
              'legal-name-1, first-name-3 last-name-3'
            );
            expect(prcResult[1].client).toBe('first-name-2 last-name-2');
          });

          it('does not have an _id', () => {
            expect(prcResult[0]._id).toBe(null);
            expect(prcResult[1]._id).toBe(null);
          });

          it('does not add an isCreated property set to true', () => {
            expect(prcResult[0]['isCreated']).toBe(undefined);
            expect(prcResult[1]['isCreated']).toBe(undefined);
          });

          it('has a clFile property padded to 7 digits', () => {
            expect(prcResult[0]['clFile']).toBe('0000011');
            expect(prcResult[1]['clFile']).toBe('0000022');
          });

          it('has an appStatus', () => {
            expect(prcResult[0].appStatus).toBe('someStatusString');
          });

          it('has a region', () => {
            expect(prcResult[0].region).toBe('someRegionCode');
          });
        });

        it('calls ApplicationService getStatusString', () => {
          expect(ApplicationServiceSpy.getStatusString).toHaveBeenCalledWith(
            'someStatusCode'
          );
        });

        it('calls ApplicationService getStatusCode', () => {
          expect(ApplicationServiceSpy.getStatusCode).toHaveBeenCalled();
        });

        it('calls ApplicationService getRegionCode', () => {
          expect(ApplicationServiceSpy.getRegionCode).toHaveBeenCalled();
        });
      });
    });

    describe('when getAppByDTID returns results', () => {
      beforeEach(() => {
        // Only testing calls to getAppByDTID
        spyOn(service, 'getAppsByCLID').and.returnValue(
          of([] as Application[])
        );
      });

      describe('when no applications or search results are returned', () => {
        it('returns an empty array of applications', async(() => {
          ApplicationServiceSpy.getByTantalisID.and.returnValue(
            of(null as Application)
          );

          apiSpy.searchAppsByDTID.and.returnValue(of(null as SearchResults));

          service.getAppsByClidDtid(['123']).subscribe(result => {
            expect(result).toEqual([] as Application[]);
          });
        }));
      });

      describe('when application results from within PRC are returned', () => {
        let result: Array<Application[]>;
        beforeEach(async(() => {
          result = [];

          ApplicationServiceSpy.getByTantalisID.and.returnValue(
            of(new Application({ _id: '2' }))
          );

          apiSpy.searchAppsByDTID.and.returnValue(of(null as SearchResults));

          service.getAppsByClidDtid(['123']).subscribe(res => {
            result.push(res);
          });
        }));

        it('getAppsByClidDtid emits twice', async(() => {
          expect(result.length).toEqual(2);
        }));

        it('returns an array of applications', async(() => {
          expect(result[0].length).toEqual(0);
          expect(result[1].length).toEqual(1);
        }));

        describe('the applications returned from PRC', () => {
          let prcResult: Application[];
          beforeEach(() => {
            prcResult = result[1];
          });

          it('has an isCreated property set to true', () => {
            expect(prcResult[0]._id).toBe('2');
            expect(prcResult[0]['isCreated']).toBe(true);
          });
        });

        it('does not call ApplicationService getStatusString', () => {
          expect(ApplicationServiceSpy.getStatusString).not.toHaveBeenCalled();
        });

        it('does not call ApplicationService getStatusCode', () => {
          expect(ApplicationServiceSpy.getStatusCode).not.toHaveBeenCalled();
        });

        it('does not call ApplicationService getRegionCode', () => {
          expect(ApplicationServiceSpy.getRegionCode).not.toHaveBeenCalled();
        });
      });

      describe('when application results from Tantalis are returned', () => {
        let result: Array<Application[]>;
        beforeEach(async(() => {
          result = [];

          ApplicationServiceSpy.getByTantalisID.and.returnValue(
            of(null as Application)
          );

          apiSpy.searchAppsByDTID.and.returnValue(
            of(
              new SearchResults({
                type: 'type',
                status: 'status',
                interestedParties: [
                  new InterestedParty({
                    interestedPartyType: 'O',
                    legalName: 'legal-name-1',
                    firstName: 'first-name-1',
                    lastName: 'last-name-1'
                  }),
                  new InterestedParty({
                    interestedPartyType: 'notO',
                    legalName: 'legal-name-3',
                    firstName: 'first-name-3',
                    lastName: 'last-name-3'
                  })
                ],
                CROWN_LANDS_FILE: '11',
                DISPOSITION_TRANSACTION_SID: '33',
                RESPONSIBLE_BUSINESS_UNIT: '44',
                TENURE_PURPOSE: 'tenure-purpose-1',
                TENURE_LOCATION: 'tenure-location-1',
                TENURE_STAGE: 'tenure-stage-1',
                TENURE_STATUS: 'tenure-status-1',
                TENURE_SUBPURPOSE: 'tenure-subpurpose-1',
                TENURE_SUBTYPE: 'tenure-subtype-1',
                TENURE_TYPE: 'tenure-type-1'
              })
            )
          );

          ApplicationServiceSpy.getStatusString.and.callFake(arg => {
            return 'someStatusString';
          });
          ApplicationServiceSpy.getStatusCode.and.returnValue('someStatusCode');
          ApplicationServiceSpy.getRegionCode.and.returnValue('someRegionCode');

          service.getAppsByClidDtid(['123']).subscribe(
            res => {
              result.push(res);
            },
            error => {
              fail(error);
            }
          );
        }));

        it('getAppsByClidDtid emits twice', async(() => {
          expect(result.length).toEqual(2);
        }));

        it('returns an array of applications', async(() => {
          expect(result[0].length).toEqual(0);
          expect(result[1].length).toEqual(1);
        }));

        describe('the array of applications returned from PRC', () => {
          let tantalisResult: Application[];
          beforeEach(() => {
            tantalisResult = result[1];
          });

          it('sets certain values of the application', () => {
            expect(tantalisResult[0].purpose).toBe('tenure-purpose-1');
            expect(tantalisResult[0].subpurpose).toBe('tenure-subpurpose-1');
            expect(tantalisResult[0].type).toBe('tenure-type-1');
            expect(tantalisResult[0].subtype).toBe('tenure-subtype-1');
            expect(tantalisResult[0].status).toBe('tenure-status-1');
            expect(tantalisResult[0].tenureStage).toBe('tenure-stage-1');
            expect(tantalisResult[0].location).toBe('tenure-location-1');
            expect(tantalisResult[0].businessUnit).toBe('44');
            expect(tantalisResult[0].cl_file).toBe(11);
            expect(tantalisResult[0].tantalisID).toBe(33);
          });

          it('builds and sets a client string', () => {
            expect(tantalisResult[0].client).toBe(
              'legal-name-1, first-name-3 last-name-3'
            );
          });

          it('does not have an _id', () => {
            expect(tantalisResult[0]._id).toBe(null);
          });

          it('does not add an isCreated property set to true', () => {
            expect(tantalisResult[0]['isCreated']).toBe(undefined);
          });

          it('has a clFile property padded to 7 digits', () => {
            expect(tantalisResult[0]['clFile']).toBe('0000011');
          });

          it('has an appStatus', () => {
            expect(tantalisResult[0].appStatus).toBe('someStatusString');
          });

          it('has a region', () => {
            expect(tantalisResult[0].region).toBe('someRegionCode');
          });
        });

        it('calls ApplicationService getStatusString', () => {
          expect(ApplicationServiceSpy.getStatusString).toHaveBeenCalledWith(
            'someStatusCode'
          );
        });

        it('calls ApplicationService getStatusCode', () => {
          expect(ApplicationServiceSpy.getStatusCode).toHaveBeenCalled();
        });

        it('calls ApplicationService getRegionCode', () => {
          expect(ApplicationServiceSpy.getRegionCode).toHaveBeenCalled();
        });
      });
    });

    describe('when multiple applications are returned', () => {
      it('returns a merged array of applications', async(() => {
        spyOn(service, 'getAppsByCLID').and.returnValue(
          of([new Application({ _id: 1 }), new Application({ _id: 2 })])
        );

        spyOn(service, 'getAppByDTID').and.returnValue(
          of([
            new Application({ _id: 2 }),
            new Application({ _id: 3 }),
            new Application({ _id: 4 })
          ])
        );

        let resultingApplications = new Set<Application>();
        service.getAppsByClidDtid(['123', '234']).subscribe(
          result => {
            result.forEach(element => {
              resultingApplications.add(element);
            });
          },
          error => {
            fail(error);
          },
          () => {
            expect(service.getAppsByCLID).toHaveBeenCalledWith('123');
            expect(service.getAppsByCLID).toHaveBeenCalledWith('234');

            expect(service.getAppByDTID).toHaveBeenCalledWith(123);
            expect(service.getAppByDTID).toHaveBeenCalledWith(234);

            const finalResults = Array.from(resultingApplications);
            expect(finalResults).toEqual([
              new Application({ _id: 1 }),
              new Application({ _id: 2 }),
              new Application({ _id: 2 }),
              new Application({ _id: 3 }),
              new Application({ _id: 4 })
            ]);
          }
        );
      }));
    });

    describe('when an exception is thrown', () => {
      it('ApiService.handleError is called and the error is re-thrown', async(() => {
        spyOn(service, 'getAppsByCLID').and.returnValue(
          throwError(Error('someError'))
        );

        spyOn(service, 'getAppByDTID').and.returnValue(of([]));

        apiSpy.handleError.and.callFake(error => {
          expect(error).toEqual(Error('someError'));
          return throwError(Error('someRethrownError'));
        });

        service.getAppsByClidDtid(['123']).subscribe(
          () => {
            fail('An error was expected.');
          },
          error => {
            expect(error).toEqual(Error('someRethrownError'));
          }
        );
      }));
    });
  });
});
