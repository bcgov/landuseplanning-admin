import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DialogService } from 'ng2-bootstrap-modal';
import { UserService } from 'app/services/user.service';

import { AddEditUserComponent } from './add-edit-user.component';

describe('AddEditUserComponent', () => {
  let component: AddEditUserComponent;
  let fixture: ComponentFixture<AddEditUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditUserComponent],
      imports: [FormsModule],
      providers: [{ provide: DialogService }, { provide: UserService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
