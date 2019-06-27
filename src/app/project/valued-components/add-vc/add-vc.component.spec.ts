import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVcComponent } from './add-vc.component';

describe('AddVcComponent', () => {
  let component: AddVcComponent;
  let fixture: ComponentFixture<AddVcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddVcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
