import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsTableRowsComponent } from './permissions-table-rows.component';

describe('PermissionsTableRowsComponent', () => {
  let component: PermissionsTableRowsComponent;
  let fixture: ComponentFixture<PermissionsTableRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermissionsTableRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionsTableRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
