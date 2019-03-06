import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicsComponent } from './topics.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DialogService } from 'ng2-bootstrap-modal';
import { TopicService } from 'app/services/topic.service';
import { Topic } from 'app/models/topic';
import { of } from 'rxjs';

describe('TopicsComponent', () => {
  let component: TopicsComponent;
  let fixture: ComponentFixture<TopicsComponent>;

  const mockTopicService = jasmine.createSpyObj('TopicService', [
    'getAll'
  ]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopicsComponent ],
      imports: [ NgbModule ],
      providers: [
        { provide: DialogService },
        { provide: TopicService, useValue: mockTopicService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicsComponent);
    component = fixture.componentInstance;
    mockTopicService.getAll.and.returnValue(
      of([
        new Topic()
      ])
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
