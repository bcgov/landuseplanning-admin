import 'zone.js';
import 'zone.js/dist/async-test.js';
import 'zone.js/dist/proxy.js';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/jasmine-patch';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
  } from '@angular/platform-browser-dynamic/testing';
  TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

import { DayCalculatorResult } from './day-calculator-modal.component';
import { DayCalculatorModalComponent } from './day-calculator-modal.component';

describe('DayCalculatorModalComponent', () => {
  let component: DayCalculatorModalComponent;
  let fixture: ComponentFixture<DayCalculatorModalComponent>;

  let calculated: DayCalculatorResult;

  // calculator inputs
  let regular = true;
  let suspended = false;
  let numDays = 0;
  let startDate = new Date (2019, 5, 1);
  let endDate = new Date (2019, 5, 1);
  let suspendDate = null;
  let resumeDate = null;

  beforeEach(async(() => {}));

  beforeEach(() => {

    component = new DayCalculatorModalComponent(new NgbActiveModal);

    // Reset output
    calculated =  new DayCalculatorResult();

    // Reset inputs
    regular = true;
    suspended = false;
    numDays = 0;
    startDate = new Date (2019, 5, 1);
    endDate = new Date (2019, 5, 10);
    suspendDate = null;
    resumeDate = null;
  });

  it('tests the 10 day calendar difference', () => {
    const expected = new DayCalculatorResult();
    expected.startDate = new Date (2019, 5, 1);
    expected.endDate = new Date (2019, 5, 10);
    expected.numDays = 10;

    calculated = component.calculateStartDate(regular, suspended, numDays, startDate, endDate, suspendDate, resumeDate);

    expect(calculated.numDays).toBe(expected.numDays);
  });
});
