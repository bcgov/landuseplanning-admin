import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationAsideComponent } from './application-aside.component';

describe('ApplicationAsideComponent', () => {
  let component: ApplicationAsideComponent;
  let fixture: ComponentFixture<ApplicationAsideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationAsideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationAsideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
