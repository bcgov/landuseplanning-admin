import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DialogService } from 'ng2-bootstrap-modal';
import { UserService } from 'app/services/user.service';

import { AddEditTopicComponent } from './add-edit-topic.component';

describe('AddEditTopicComponent', () => {
  let component: AddEditTopicComponent;
  let fixture: ComponentFixture<AddEditTopicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditTopicComponent],
      imports: [FormsModule],
      providers: [{ provide: DialogService }, { provide: UserService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
