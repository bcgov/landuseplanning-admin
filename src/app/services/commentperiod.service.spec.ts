import { async, TestBed } from '@angular/core/testing';
import { CommentPeriod } from 'app/models/commentperiod';
import { ApiService } from 'app/services/api';
import { of, throwError } from 'rxjs';
import { CommentPeriodService } from './commentperiod.service';

describe('CommentPeriodService', () => {
  let service: CommentPeriodService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommentPeriodService,
        {
          provide: ApiService,
          useValue: jasmine.createSpyObj('ApiService', [
            'getPeriodsByAppId',
            'getPeriod',
            'addCommentPeriod',
            'saveCommentPeriod',
            'deleteCommentPeriod',
            'publishCommentPeriod',
            'unPublishCommentPeriod',
            'handleError'
          ])
        }
      ]
    });
    service = TestBed.get(CommentPeriodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllByApplicationId', () => {
    let apiSpy;
    beforeEach(() => {
      apiSpy = TestBed.get(ApiService);
    });

    describe('when no comment periods are returned by the Api', () => {
      it('returns an empty CommentPeriod array', async(() => {
        apiSpy.getPeriodsByAppId.and.returnValue(of([] as CommentPeriod[]));

        service.getAllByApplicationId('123').subscribe(result => expect(result).toEqual([] as CommentPeriod[]));
      }));
    });

    describe('when one comment period is returned by the Api', () => {
      it('returns an array with one CommentPeriod element', async(() => {
        const today = new Date();
        const commentPeriods: CommentPeriod[] = [new CommentPeriod({ _id: '1', startDate: today, endDate: today })];
        apiSpy.getPeriodsByAppId.and.returnValue(of(commentPeriods));

        service.getAllByApplicationId('123').subscribe(result => {
          expect(result).toEqual(commentPeriods);
        });
      }));
    });

    describe('when multiple comment periods are returned by the Api', () => {
      it('returns an array with multiple CommentPeriod elements', async(() => {
        const today = new Date();
        const commentPeriods: CommentPeriod[] = [
          new CommentPeriod({ _id: '1', startDate: today, endDate: today }),
          new CommentPeriod({ _id: '2', startDate: today, endDate: today }),
          new CommentPeriod({ _id: '3', startDate: today, endDate: today })
        ];

        apiSpy.getPeriodsByAppId.and.returnValue(of(commentPeriods));

        service.getAllByApplicationId('123').subscribe(result => {
          expect(result).toEqual(commentPeriods);
        });
      }));
    });

    describe('when an exception is thrown', () => {
      it('ApiService.handleError is called and the error is re-thrown', async(() => {
        apiSpy.getPeriodsByAppId.and.returnValue(throwError(new Error('someError')));

        apiSpy.handleError.and.callFake(error => {
          expect(error).toEqual(Error('someError'));
          return throwError(Error('someRethrownError'));
        });

        service.getAllByApplicationId('123').subscribe(
          () => {
            fail('An error was expected.');
          },
          err => {
            expect(err).toEqual(Error('someRethrownError'));
          }
        );
      }));
    });
  });

  describe('getById', () => {
    let apiSpy;
    beforeEach(() => {
      apiSpy = TestBed.get(ApiService);
    });

    describe('when no comment period is returned by the Api', () => {
      it('returns an empty CommentPeriod array', async(() => {
        apiSpy.getPeriod.and.returnValue(of(null as CommentPeriod));

        service.getById('123').subscribe(result => expect(result).toEqual(null));
      }));
    });

    describe('when one comment period is returned by the Api', () => {
      it('returns the CommentPeriod', async(() => {
        const today = new Date();
        const commentPeriod: CommentPeriod = new CommentPeriod({
          _id: '1',
          startDate: today,
          endDate: today
        });
        apiSpy.getPeriod.and.returnValue(of());

        service.getById('123').subscribe(result => {
          expect(result).toEqual(commentPeriod);
        });
      }));
    });

    describe('when multiple comment periods are returned by the Api', () => {
      it('returns only the first CommentPeriod', async(() => {
        const today = new Date();
        const commentPeriod: CommentPeriod[] = [
          new CommentPeriod({ _id: '1', startDate: today, endDate: today }),
          new CommentPeriod({ _id: '2', startDate: today, endDate: today }),
          new CommentPeriod({ _id: '3', startDate: today, endDate: today })
        ];

        apiSpy.getPeriod.and.returnValue(of(commentPeriod));

        service.getById('123').subscribe(result => {
          expect(result).toEqual(commentPeriod[0]);
        });
      }));
    });

    describe('when an exception is thrown', () => {
      it('ApiService.handleError is called and the error is re-thrown', async(() => {
        apiSpy.getPeriod.and.returnValue(throwError(new Error('someError')));

        apiSpy.handleError.and.callFake(error => {
          expect(error).toEqual(Error('someError'));
          return throwError(Error('someRethrownError'));
        });

        service.getById('123').subscribe(
          () => {
            fail('An error was expected.');
          },
          err => {
            expect(err).toEqual(Error('someRethrownError'));
          }
        );
      }));
    });
  });

  describe('add', () => {
    let apiSpy;
    beforeEach(() => {
      apiSpy = TestBed.get(ApiService);
    });

    describe('when no comment period is returned by the api', () => {
      it('returns null', async(() => {
        apiSpy.addCommentPeriod.and.returnValue(of(null as CommentPeriod));

        service.add(new CommentPeriod()).subscribe(result => expect(result).toEqual(null));
      }));
    });

    describe('when an empty comment period is returned by the api', () => {
      it('returns the empty comment period', async(() => {
        const comment = new CommentPeriod();

        apiSpy.addCommentPeriod.and.returnValue(of(comment));

        service.add(comment).subscribe(result => {
          expect(result).toEqual(comment);
        });
      }));
    });

    describe('when the comment period contains all required fields', () => {
      it('calls add and returns a CommentPeriod', async(() => {
        const commentPeriod = new CommentPeriod({
          _id: '3',
          _addedBy: 'addedby',
          _application: '123',
          code: '2',
          startDate: new Date(),
          endDate: new Date(),
          internal: {
            notes: 'This is a note. With multiple sentences.\nAnd new lines.\n\nAnd symbols !@#$%^&*()_+{}:";\',.<>.',
            _addedBy: 'addedby'
          },
          description:
            'This is a period. With multiple sentences.\nAnd new lines.\n\nAnd symbols !@#$%^&*()_+{}:";\',.<>.',
          tags: ['public']
        });

        let modifiedCommentPeriod;
        // Replace ApiService.addCommentPeriod with a fake method that simply returns the arg passed to it.
        apiSpy.addCommentPeriod.and.callFake((arg: Comment) => {
          modifiedCommentPeriod = arg;
          return of(arg);
        });

        service.add(commentPeriod).subscribe(result => {
          expect(result).toEqual(jasmine.any(CommentPeriod));

          expect(modifiedCommentPeriod._id).toBeUndefined();
        });
      }));
    });

    describe('when an exception is thrown', () => {
      it('ApiService.handleError is called and the error is re-thrown', async(() => {
        apiSpy.getPeriod.and.returnValue(throwError(new Error('someError')));

        apiSpy.handleError.and.callFake(error => {
          expect(error).toEqual(Error('someError'));
          return throwError(Error('someRethrownError'));
        });

        service.getById('123').subscribe(
          () => {
            fail('An error was expected.');
          },
          err => {
            expect(err).toEqual(Error('someRethrownError'));
          }
        );
      }));
    });

    describe('when an exception is thrown', () => {
      it('ApiService.handleError is called and the error is re-thrown', async(() => {
        apiSpy.addCommentPeriod.and.returnValue(throwError(new Error('someError')));

        apiSpy.handleError.and.callFake(error => {
          expect(error).toEqual(Error('someError'));
          return throwError(Error('someRethrownError'));
        });

        service.add(new CommentPeriod()).subscribe(
          () => {
            fail('An error was expected.');
          },
          err => {
            expect(err).toEqual(Error('someRethrownError'));
          }
        );
      }));
    });
  });

  describe('save', () => {
    let apiSpy;
    beforeEach(() => {
      apiSpy = TestBed.get(ApiService);
    });

    describe('when no comment period is returned by the api', () => {
      it('returns null', async(() => {
        apiSpy.saveCommentPeriod.and.returnValue(of(null as CommentPeriod));

        service.save(new CommentPeriod()).subscribe(result => expect(result).toEqual(null));
      }));
    });

    describe('when an empty comment period is returned by the api', () => {
      it('returns the empty comment period', async(() => {
        const comment = new CommentPeriod();

        apiSpy.saveCommentPeriod.and.returnValue(of(comment));

        service.save(comment).subscribe(result => {
          expect(result).toEqual(comment);
        });
      }));
    });

    describe('when the comment period contains all required fields', () => {
      it('calls add and returns a CommentPeriod', async(() => {
        const commentPeriod = new CommentPeriod({
          _id: '3',
          _addedBy: 'addedby',
          _application: '123',
          code: '2',
          startDate: new Date(),
          endDate: new Date(),
          internal: {
            notes: 'This is a note. With multiple sentences.\nAnd new lines.\n\nAnd symbols !@#$%^&*()_+{}:";\',.<>.',
            _addedBy: 'addedby'
          },
          description:
            'This is a period. With multiple sentences.\nAnd new lines.\n\nAnd symbols !@#$%^&*()_+{}:";\',.<>.',
          tags: ['public']
        });

        let modifiedCommentPeriod;
        // Replace ApiService.addCommentPeriod with a fake method that simply returns the arg passed to it.
        apiSpy.saveCommentPeriod.and.callFake((arg: Comment) => {
          modifiedCommentPeriod = arg;
          return of(arg);
        });

        service.save(commentPeriod).subscribe(result => {
          expect(result).toEqual(jasmine.any(CommentPeriod));

          expect(modifiedCommentPeriod._id).toEqual('3');
        });
      }));
    });

    describe('when an exception is thrown', () => {
      it('ApiService.handleError is called and the error is re-thrown', async(() => {
        apiSpy.saveCommentPeriod.and.returnValue(throwError(new Error('someError')));

        apiSpy.handleError.and.callFake(error => {
          expect(error).toEqual(Error('someError'));
          return throwError(Error('someRethrownError'));
        });

        service.save(new CommentPeriod()).subscribe(
          () => {
            fail('An error was expected.');
          },
          err => {
            expect(err).toEqual(Error('someRethrownError'));
          }
        );
      }));
    });
  });

  describe('delete', () => {
    let apiSpy;
    beforeEach(() => {
      apiSpy = TestBed.get(ApiService);
    });

    describe('when no comment period is returned by the api', () => {
      it('returns null', async(() => {
        apiSpy.deleteCommentPeriod.and.returnValue(of(null as CommentPeriod));

        service.delete(new CommentPeriod()).subscribe(result => expect(result).toEqual(null));
      }));
    });

    describe('when an empty comment period is returned by the api', () => {
      it('returns the empty comment period', async(() => {
        const comment = new CommentPeriod();

        apiSpy.deleteCommentPeriod.and.returnValue(of(comment));

        service.delete(comment).subscribe(result => {
          expect(result).toEqual(comment);
        });
      }));
    });

    describe('when the comment period contains all required fields', () => {
      it('calls add and returns a CommentPeriod', async(() => {
        const commentPeriod = new CommentPeriod({
          _id: '3',
          _addedBy: 'addedby',
          _application: '123',
          code: '2',
          startDate: new Date(),
          endDate: new Date(),
          internal: {
            notes: 'This is a note. With multiple sentences.\nAnd new lines.\n\nAnd symbols !@#$%^&*()_+{}:";\',.<>.',
            _addedBy: 'addedby'
          },
          description:
            'This is a period. With multiple sentences.\nAnd new lines.\n\nAnd symbols !@#$%^&*()_+{}:";\',.<>.',
          tags: ['public']
        });

        let modifiedCommentPeriod;
        // Replace ApiService.addCommentPeriod with a fake method that simply returns the arg passed to it.
        apiSpy.deleteCommentPeriod.and.callFake((arg: Comment) => {
          modifiedCommentPeriod = arg;
          return of(arg);
        });

        service.delete(commentPeriod).subscribe(result => {
          expect(result).toEqual(jasmine.any(CommentPeriod));

          expect(modifiedCommentPeriod._id).toEqual('3');
        });
      }));
    });

    describe('when an exception is thrown', () => {
      it('ApiService.handleError is called and the error is re-thrown', async(() => {
        apiSpy.deleteCommentPeriod.and.returnValue(throwError(new Error('someError')));

        apiSpy.handleError.and.callFake(error => {
          expect(error).toEqual(Error('someError'));
          return throwError(Error('someRethrownError'));
        });

        service.delete(new CommentPeriod()).subscribe(
          () => {
            fail('An error was expected.');
          },
          err => {
            expect(err).toEqual(Error('someRethrownError'));
          }
        );
      }));
    });
  });

  describe('publish', () => {
    let apiSpy;
    beforeEach(() => {
      apiSpy = TestBed.get(ApiService);
    });

    describe('when no comment period is returned by the api', () => {
      it('returns null', async(() => {
        apiSpy.publishCommentPeriod.and.returnValue(of(null as CommentPeriod));

        service.publish(new CommentPeriod()).subscribe(result => expect(result).toEqual(null));
      }));
    });

    describe('when an empty comment period is returned by the api', () => {
      it('returns the empty comment period', async(() => {
        const comment = new CommentPeriod();

        apiSpy.publishCommentPeriod.and.returnValue(of(comment));

        service.publish(comment).subscribe(result => {
          expect(result).toEqual(comment);
        });
      }));
    });

    describe('when the comment period contains all required fields', () => {
      it('calls add and returns a CommentPeriod', async(() => {
        const commentPeriod = new CommentPeriod({
          _id: '3',
          _addedBy: 'addedby',
          _application: '123',
          code: '2',
          startDate: new Date(),
          endDate: new Date(),
          internal: {
            notes: 'This is a note. With multiple sentences.\nAnd new lines.\n\nAnd symbols !@#$%^&*()_+{}:";\',.<>.',
            _addedBy: 'addedby'
          },
          description:
            'This is a period. With multiple sentences.\nAnd new lines.\n\nAnd symbols !@#$%^&*()_+{}:";\',.<>.',
          tags: ['public']
        });

        let modifiedCommentPeriod;
        // Replace ApiService.addCommentPeriod with a fake method that simply returns the arg passed to it.
        apiSpy.publishCommentPeriod.and.callFake((arg: Comment) => {
          modifiedCommentPeriod = arg;
          return of(arg);
        });

        service.publish(commentPeriod).subscribe(result => {
          expect(result).toEqual(jasmine.any(CommentPeriod));

          expect(modifiedCommentPeriod._id).toEqual('3');
        });
      }));
    });

    describe('when an exception is thrown', () => {
      it('ApiService.handleError is called and the error is re-thrown', async(() => {
        apiSpy.publishCommentPeriod.and.returnValue(throwError(new Error('someError')));

        apiSpy.handleError.and.callFake(error => {
          expect(error).toEqual(Error('someError'));
          return throwError(Error('someRethrownError'));
        });

        service.publish(new CommentPeriod()).subscribe(
          () => {
            fail('An error was expected.');
          },
          err => {
            expect(err).toEqual(Error('someRethrownError'));
          }
        );
      }));
    });
  });

  describe('unpublish', () => {
    let apiSpy;
    beforeEach(() => {
      apiSpy = TestBed.get(ApiService);
    });

    describe('when no comment period is returned by the api', () => {
      it('returns null', async(() => {
        apiSpy.unPublishCommentPeriod.and.returnValue(of(null as CommentPeriod));

        service.unPublish(new CommentPeriod()).subscribe(result => expect(result).toEqual(null));
      }));
    });

    describe('when an empty comment period is returned by the api', () => {
      it('returns the empty comment period', async(() => {
        const comment = new CommentPeriod();

        apiSpy.unPublishCommentPeriod.and.returnValue(of(comment));

        service.unPublish(comment).subscribe(result => {
          expect(result).toEqual(comment);
        });
      }));
    });

    describe('when the comment period contains all required fields', () => {
      it('calls add and returns a CommentPeriod', async(() => {
        const commentPeriod = new CommentPeriod({
          _id: '3',
          _addedBy: 'addedby',
          _application: '123',
          code: '2',
          startDate: new Date(),
          endDate: new Date(),
          internal: {
            notes: 'This is a note. With multiple sentences.\nAnd new lines.\n\nAnd symbols !@#$%^&*()_+{}:";\',.<>.',
            _addedBy: 'addedby'
          },
          description:
            'This is a period. With multiple sentences.\nAnd new lines.\n\nAnd symbols !@#$%^&*()_+{}:";\',.<>.',
          tags: ['public']
        });

        let modifiedCommentPeriod;
        // Replace ApiService.addCommentPeriod with a fake method that simply returns the arg passed to it.
        apiSpy.unPublishCommentPeriod.and.callFake((arg: Comment) => {
          modifiedCommentPeriod = arg;
          return of(arg);
        });

        service.unPublish(commentPeriod).subscribe(result => {
          expect(result).toEqual(jasmine.any(CommentPeriod));

          expect(modifiedCommentPeriod._id).toEqual('3');
        });
      }));
    });

    describe('when an exception is thrown', () => {
      it('ApiService.handleError is called and the error is re-thrown', async(() => {
        apiSpy.unPublishCommentPeriod.and.returnValue(throwError(new Error('someError')));

        apiSpy.handleError.and.callFake(error => {
          expect(error).toEqual(Error('someError'));
          return throwError(Error('someRethrownError'));
        });

        service.unPublish(new CommentPeriod()).subscribe(
          () => {
            fail('An error was expected.');
          },
          err => {
            expect(err).toEqual(Error('someRethrownError'));
          }
        );
      }));
    });
  });

  describe('getCurrent()', () => {
    it('returns the first comment period passed', () => {
      const current = service.getCurrent([new CommentPeriod({ _id: '1' }), new CommentPeriod({ _id: '2' })]);
      expect(current._id).toBe(new CommentPeriod({ _id: '1' })._id);
    });

    it('returns null if the array is empty', () => {
      const current = service.getCurrent([]);
      expect(current).toBeNull();
    });
  });

  describe('getStatusCode()', () => {
    describe('without a comment period', () => {
      it('returns "NOT_OPEN"', () => {
        expect(service.getStatusCode(null)).toEqual(service.NOT_OPEN);
      });
    });

    describe('without a start date ', () => {
      it('returns "NOT_OPEN"', () => {
        const commentPeriod = new CommentPeriod({
          endDate: Date.now()
        });
        expect(service.getStatusCode(commentPeriod)).toEqual(service.NOT_OPEN);
      });
    });

    describe('without an end date ', () => {
      it('returns "NOT_OPEN"', () => {
        const commentPeriod = new CommentPeriod({
          startDate: Date.now()
        });
        expect(service.getStatusCode(commentPeriod)).toEqual(service.NOT_OPEN);
      });
    });

    describe('when end date is before today', () => {
      it('returns "CLOSED"', () => {
        const commentPeriod = new CommentPeriod({
          startDate: new Date('September 28, 2018 08:24:00'),
          endDate: new Date('December 1, 2018 16:24:00')
        });
        expect(service.getStatusCode(commentPeriod)).toEqual(service.CLOSED);
      });
    });

    describe('when start date is in the future', () => {
      it('returns "NOT_STARTED"', () => {
        const commentPeriod = new CommentPeriod({
          startDate: new Date('September 28, 2050 08:24:00'),
          endDate: new Date('December 1, 2050 16:24:00')
        });
        expect(service.getStatusCode(commentPeriod)).toEqual(service.NOT_STARTED);
      });
    });

    describe('when startDate is before today and end date is in the future', () => {
      it('returns "OPEN"', () => {
        const commentPeriod = new CommentPeriod({
          startDate: new Date('September 28, 2010 08:24:00'),
          endDate: new Date('December 1, 2050 16:24:00')
        });
        expect(service.getStatusCode(commentPeriod)).toEqual(service.OPEN);
      });
    });
  });

  describe('isClosed()', () => {
    it('returns "true" if the comment period status is "Closed"', () => {
      const commentPeriod = new CommentPeriod({
        startDate: new Date('September 28, 2018 08:24:00'),
        endDate: new Date('December 1, 2018 16:24:00')
      });
      const statusCode = service.getStatusCode(commentPeriod);
      expect(service.isClosed(statusCode)).toBe(true);
    });

    it('returns "false" if the comment period status is not "Closed"', () => {
      const commentPeriod = new CommentPeriod({
        startDate: new Date('September 28, 2018 08:24:00'),
        endDate: new Date('December 1, 2050 16:24:00')
      });
      const statusCode = service.getStatusCode(commentPeriod);
      expect(service.isClosed(statusCode)).toBe(false);
    });
  });

  describe('isNotOpen()', () => {
    it('returns "true" if the comment period status is null', () => {
      const statusCode = service.getStatusCode(null);
      expect(service.isNotOpen(statusCode)).toBe(true);
    });

    it('returns "true" if the comment period status has no start date', () => {
      const commentPeriod = new CommentPeriod({
        endDate: new Date('December 1, 2050 16:24:00')
      });
      const statusCode = service.getStatusCode(commentPeriod);
      expect(service.isNotOpen(statusCode)).toBe(true);
    });

    it('returns "true" if the comment period status has no end date', () => {
      const commentPeriod = new CommentPeriod({
        startDate: new Date('September 28, 2018 08:24:00')
      });
      const statusCode = service.getStatusCode(commentPeriod);
      expect(service.isNotOpen(statusCode)).toBe(true);
    });

    it('returns "false" if the comment period status is not "Not Open"', () => {
      const commentPeriod = new CommentPeriod({
        startDate: new Date('September 28, 2018 08:24:00'),
        endDate: new Date('December 1, 2050 16:24:00')
      });
      const statusCode = service.getStatusCode(commentPeriod);
      expect(service.isClosed(statusCode)).toBe(false);
    });
  });

  describe('isNotStarted()', () => {
    it('returns "true" if the comment period status is "Not Started"', () => {
      const commentPeriod = new CommentPeriod({
        startDate: new Date('December 1, 2050 8:24:00'),
        endDate: new Date('December 31, 2050 16:24:00')
      });
      const statusCode = service.getStatusCode(commentPeriod);
      expect(service.isNotStarted(statusCode)).toBe(true);
    });

    it('returns "false" if the comment period status is not "Not Started"', () => {
      const commentPeriod = new CommentPeriod({
        startDate: new Date('September 28, 2018 08:24:00'),
        endDate: new Date('December 1, 2018 16:24:00')
      });
      const statusCode = service.getStatusCode(commentPeriod);
      expect(service.isNotStarted(statusCode)).toBe(false);
    });
  });

  describe('isOpen()', () => {
    it('returns "true" if the comment period status is "Open"', () => {
      const commentPeriod = new CommentPeriod({
        startDate: new Date('September 28, 2010 08:24:00'),
        endDate: new Date('December 1, 2050 08:24:00')
      });
      const statusCode = service.getStatusCode(commentPeriod);
      expect(service.isOpen(statusCode)).toBe(true);
    });

    it('returns "false" if the comment period status is not "Open"', () => {
      const commentPeriod = new CommentPeriod({
        startDate: new Date('September 28, 2018 08:24:00'),
        endDate: new Date('December 1, 2018 16:24:00')
      });
      const statusCode = service.getStatusCode(commentPeriod);
      expect(service.isOpen(statusCode)).toBe(false);
    });
  });
});
