import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayCalculatorModalComponent } from './day-calculator-modal.component';

describe('DayCalculatorModalComponent', () => {
  let component: DayCalculatorModalComponent;
  let fixture: ComponentFixture<DayCalculatorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayCalculatorModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayCalculatorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
