import { TestBed, async } from '@angular/core/testing';
import { EmailSubscribe } from 'app/models/emailSubscribe';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { ApiService } from './api';
import { EmailSubscribeService } from './emailSubscribe.service';

describe('EmailSubscribeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApiService,
          useValue: jasmine.createSpyObj('ApiService', [
            'getPeriodsByProjId',
            'getPeriod',
            'getCommentsByPeriodId',
            'getComment',
            'addComment',
            'handleError'
          ])
        },
        EmailSubscribeService
      ]
    });
  });

  it('should be created', () => {
    const service = TestBed.get(EmailSubscribeService);
    expect(service).toBeTruthy();
  });

  describe('getAllByProjectId', () => {
    let service: EmailSubscribeService;
    let apiSpy;
    beforeEach(() => {
      service = TestBed.get(EmailSubscribeService);
      apiSpy = TestBed.get(ApiService);
    });
  });

  describe('add', () => {
    let service: EmailSubscribeService;
    let apiSpy;
    beforeEach(() => {
      service = TestBed.get(EmailSubscribeService);
      apiSpy = TestBed.get(ApiService);
    });
/*
    describe('when no comment is returned by the api', () => {
      it('returns null', async(() => {
        apiSpy.addComment.and.returnValue(Observable.of({ text: () => { } }));

        service
          .add(new Comment())
          .subscribe(result => expect(result).toEqual(null as Comment));
      }));
    });

    describe('when an empty comment is returned by the api', () => {
      it('returns the empty comment', async(() => {
        const comment = new Comment();

        apiSpy.addComment.and.returnValue(
          Observable.of({
            text: () => 'notNull',
            json: () => comment
          })
        );

        service.add(emailSubscribe).subscribe(result => {
          expect(result).toEqual(emailSubscribe);
        });
      }));
    });*/
/*
    describe('when the comment contains all required fields', () => {
      it('calls addComment and returns a Comment', async(() => {
        const comment = new Comment({
          _id: '3',
          _addedBy: 'addedby',
          _commentPeriod: '123',
          commentNumber: '2',
          comment:
            'This is a comment. With multiple sentences.\nAnd new lines.\n\nAnd symbols !@#$%^&*()_+{}:";\',.<>.',
          commentAuthor: { _userId: '88' },
          review: {
            _reviewerId: '99',
            reviewerNotes: 'This is a reviewer note\nWith 2 lines.'
          },
          dateAdded: new Date(),
          commentStatus: 'status',
          documents: [new Document({ _id: '77' })]
        });

        let modifiedComment;
        // Replace ApiService.addComment with a fake method that simply returns the arg passed to it.
        apiSpy.addComment.and.callFake((arg: Comment) => {
          modifiedComment = arg;
          return Observable.of({
            text: () => 'notNull',
            json: () => arg
          });
        });

        service.add(comment).subscribe(result => {
          expect(result).toEqual(jasmine.any(Comment));

          expect(modifiedComment._id).toBeUndefined();
          expect(modifiedComment.documents).toBeUndefined();

          // expect(modifiedComment.comment).toEqual(
          //   comment.comment.replace(/\n/g, '\\n')
          // );
          // expect(modifiedComment.review.reviewerNotes).toEqual(
          //   comment.review.reviewerNotes.replace(/\n/g, '\\n')
          // );
        });
      }));
    });*/
  });
});
