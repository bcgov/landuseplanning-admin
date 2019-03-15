import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationDetailComponent } from './application-detail.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ApplicationAsideComponent } from 'app/applications/application-aside/application-aside.component';
import { MatSnackBar } from '@angular/material';
import { DialogService } from 'ng2-bootstrap-modal';
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { DecisionService } from 'app/services/decision.service';
import { DocumentService } from 'app/services/document.service';
import { FeatureService } from 'app/services/feature.service';
import { Application } from 'app/models/application';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from 'app/spec/helpers';

describe('ApplicationDetailComponent', () => {
  let component: ApplicationDetailComponent;
  let fixture: ComponentFixture<ApplicationDetailComponent>;
  const existingApplication = new Application();
  const validRouteData = { application: existingApplication };

  const activatedRouteStub = new ActivatedRouteStub(validRouteData);
  const routerSpy = {
    navigate: jasmine.createSpy('navigate')
  };

  const applicationServiceStub = {
    getRegionString() {
      return 'Skeena, Smithers';
    },

    getRegionCode() {
      return 'SK';
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationDetailComponent, NewlinesPipe, ApplicationAsideComponent],
      imports: [RouterTestingModule, NgbModule],
      providers: [
        { provide: MatSnackBar },
        { provide: ApiService },
        { provide: DialogService },
        { provide: ApplicationService, useValue: applicationServiceStub },
        { provide: CommentPeriodService },
        { provide: DecisionService },
        { provide: DocumentService },
        { provide: FeatureService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
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
      activatedRouteStub.setData({ something: 'went wrong' });
    });

    it('redirects to /search', () => {
      component.ngOnInit();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/search']);
    });
  });
});
