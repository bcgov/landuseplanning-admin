import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationListComponent } from './application-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSlideToggleModule } from '@angular/material';
import { OrderByPipe } from 'app/pipes/order-by.pipe';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Application } from 'app/models/application';
import { of } from 'rxjs';


xdescribe('ApplicationListComponent', () => {
  let component: ApplicationListComponent;
  let fixture: ComponentFixture<ApplicationListComponent>;

  const mockApplicationService = jasmine.createSpyObj('ApplicationService', [
    'getAll'
  ]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationListComponent, OrderByPipe, NewlinesPipe],
      imports: [RouterTestingModule, MatSlideToggleModule],
      providers: [
        { provide: ApplicationService, useValue: mockApplicationService },
        { provide: CommentPeriodService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationListComponent);
    component = fixture.componentInstance;
    mockApplicationService.getAll.and.returnValue(
      of([
        new Application()
      ])
    );
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
