import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectListComponent } from './project-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { OrderByPipe } from 'app/shared/pipes/order-by.pipe';
import { NewlinesPipe } from 'app/shared/pipes/newlines.pipe';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Project } from 'app/models/project';
import { of } from 'rxjs';
import { throwError } from 'rxjs';

describe('ProjectListComponent', () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;

  const projectServiceStub = {
    getAll() {
      return of([]);
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectListComponent, OrderByPipe, NewlinesPipe],
      imports: [RouterTestingModule, MatSlideToggleModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceStub },
        { provide: CommentPeriodService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('when projects are returned from the service', () => {
    const existingProjects = [
      new Project(),
      new Project()
    ];

    beforeEach(() => {
      let projectService = TestBed.get(ProjectService);
      spyOn(projectService, 'getAll').and.returnValue(of(existingProjects));
    });

    it('sets the component project to the one from the route', () => {
      component.ngOnInit();
      expect(component.projects).toEqual(existingProjects);
    });
  });

  describe('when the project service throws an error', () => {
    beforeEach(() => {
      let projectService = TestBed.get(ProjectService);
      spyOn(projectService, 'getAll').and.returnValue(throwError('Beep boop server error'));
    });

    it('redirects to root', () => {
      let navigateSpy = spyOn((<any>component).router, 'navigate');

      component.ngOnInit();

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });
});
