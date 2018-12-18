import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { ReviewCommentsComponent } from './review-comments.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { CommentService } from 'app/services/comment.service';
import { ExcelService } from 'app/services/excel.service';
import { ApiService } from 'app/services/api';
import { Application } from 'app/models/application';
import { CommentPeriod } from 'app/models/commentperiod';
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteStub } from 'app/spec/helpers';
import { of } from 'rxjs';
import { SearchComponent } from 'app/search/search.component';


@Component({selector: 'app-comment-detail', template: ''})
class CommentDetailStubComponent {
  @Input() comment: Comment;
}


describe('ReviewCommentsComponent', () => {
  let component: ReviewCommentsComponent;
  let fixture: ComponentFixture<ReviewCommentsComponent>;
  const commentPeriod = new CommentPeriod();
  const existingApplication = new Application({_id: 'WOOO', currentPeriod: commentPeriod});
  const validRouteData = {application: existingApplication};

  const activatedRouteStub = new ActivatedRouteStub(validRouteData);

  const commentServiceStub = {
    getCountByPeriodId() {
      return of(20);
    },

    getAllByApplicationId() {
      return of([]);
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        RouterTestingModule.withRoutes(
          [{path: 'search', component: SearchComponent}]
        ),
        FormsModule,
      ],
      declarations: [
        ReviewCommentsComponent,
        NewlinesPipe,
        CommentDetailStubComponent,
        SearchComponent
      ],
      providers: [
        { provide: CommentService, useValue: commentServiceStub },
        { provide: ExcelService },
        { provide: ApiService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the application is retrievable from the route', () => {
    beforeEach(() => {
      activatedRouteStub.setData(validRouteData);
    });

    it('sets the component application to the one from the route', () => {
      expect(component.application).toEqual(existingApplication);
    });
  });

  describe('when the application is not available from the route', () => {
    beforeEach(() => {
      activatedRouteStub.setData({something: 'went wrong'});
    });

    it('redirects to /search', () => {
      let navigateSpy = spyOn((<any>component).router, 'navigate');

      component.ngOnInit();

      expect(navigateSpy).toHaveBeenCalledWith(['/search']);
    });
  });
});
