import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { UserService } from 'app/services/user.service';

import { AddEditOrganizationComponent } from './add-edit-organization.component';

describe('AddEditOrganizationComponent', () => {
  let component: AddEditOrganizationComponent;
  let fixture: ComponentFixture<AddEditOrganizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditOrganizationComponent],
      imports: [FormsModule],
      providers: [
        { provide: UserService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
