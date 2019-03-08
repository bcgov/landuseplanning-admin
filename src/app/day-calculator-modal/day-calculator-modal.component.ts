import { Component, OnInit, SimpleChanges, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Dictionary } from 'lodash';
import * as moment from 'moment';

export enum DayCalculatorModalResult {
  Dismissed,
  Finding,
  Exploring
}

@Component({
  selector: 'app-day-calculator-modal',
  templateUrl: './day-calculator-modal.component.html',
  styleUrls: ['./day-calculator-modal.component.scss']
})
export class DayCalculatorModalComponent implements OnInit {

  startDate = null;
  endDate = null;
  numDays = 0;
  suspendDate = null;
  resumeDate = null;

  startDateAlert = '';
  endDateAlert = '';
  suspendDateAlert = '';
  resumeDateAlert = '';
  errorAlert = '';

  showRules = false;

  types: Array<Dictionary<string>> = [
    { displayName: 'Day Zero', value: 'dayZero' },
    { displayName: 'Calendar', value: 'regular' },
    { displayName: 'Suspension', value: 'suspended' }
  ];
  type = this.types[0];

  constructor(
    public activeModal: NgbActiveModal // also used in template
  ) { }

  ngOnInit() {
  }

  public dismiss() {
    this.activeModal.close(DayCalculatorModalResult.Dismissed);
  }

  isNonBCBusinessDay(date) {
    // No date is acceptible
    if (!date) { return ''; }

    // Valid date?
    date = moment(date);
    if (!date.isValid()) { return 'Invalid date'; }

    // Weekend?
    let day = date.day();
    if (day === 0) { return 'Sunday'; }
    if (day === 6) { return 'Saturday'; }

    // Holiday?
    let month = date.month() + 1;
    let monthDay = date.date();
    let isMonday = day === 1;

    // New Year's Day
    if (month === 1 && monthDay === 1) { return 'New Year\'s Day'; }

    // Family Day: Second Monday of February
    if (month === 2 && isMonday && monthDay > 7 && monthDay < 15) { return 'Family Day'; }

    // Good Friday: Hard-coded.
    let year = date.year();
    if ((year === 2017 && month === 4 && monthDay === 14) ||
      (year === 2018 && month === 3 && monthDay === 30) ||
      (year === 2019 && month === 4 && monthDay === 19) ||
      (year === 2020 && month === 4 && monthDay === 10) ||
      (year === 2021 && month === 4 && monthDay === 2) ||
      (year === 2022 && month === 4 && monthDay === 15) ||
      (year === 2023 && month === 4 && monthDay === 7) ||
      (year === 2024 && month === 3 && monthDay === 29) ||
      (year === 2025 && month === 4 && monthDay === 18) ||
      (year === 2026 && month === 4 && monthDay === 3) ||
      (year === 2027 && month === 3 && monthDay === 26)) { return 'Good Friday'; }

    // Easter Monday: Hard-coded.
    if ((year === 2017 && month === 4 && monthDay === 17) ||
      (year === 2018 && month === 4 && monthDay === 2) ||
      (year === 2019 && month === 4 && monthDay === 22) ||
      (year === 2020 && month === 4 && monthDay === 13) ||
      (year === 2021 && month === 4 && monthDay === 5) ||
      (year === 2022 && month === 4 && monthDay === 18) ||
      (year === 2023 && month === 4 && monthDay === 10) ||
      (year === 2024 && month === 4 && monthDay === 1) ||
      (year === 2025 && month === 4 && monthDay === 21) ||
      (year === 2026 && month === 4 && monthDay === 6) ||
      (year === 2027 && month === 3 && monthDay === 29)) { return 'Easter Monday'; }

    // Victoria Day: Penultimate Monday of May
    if (month === 5 && isMonday && monthDay > 17 && monthDay < 25) { return 'Victoria Day'; }

    // Canada Day: will fall on the 2nd if the 1st is a Sunday
    if ((month === 7 && monthDay === 1) || (month === 7 && monthDay === 2 && isMonday)) { return 'Canada Day'; }

    // B.C. Day: First Monday of August
    if (month === 8 && isMonday && monthDay < 8) { return 'B.C. Day'; }

    // Labour Day: First Monday of September
    if (month === 9 && isMonday && monthDay < 8) { return 'Labour Day'; }

    // Thanksgiving Day: Second Monday of October
    if (month === 10 && isMonday && monthDay > 7 && monthDay < 15) { return 'Thanksgiving Day'; }

    // Remembrance Day
    if (month === 11 && monthDay === 11) { return 'Remembrance Day'; }

    // Christmas Day
    if (month === 12 && monthDay === 25) { return 'Christmas Day'; }

    // Boxing Day
    if (month === 12 && monthDay === 26) { return 'Boxing Day'; }

    // Otherwise
    return '';
  }

  getDateAlert(date) {
    let alert = this.isNonBCBusinessDay(date);
    if (alert) {
      // TODO: Use alert text for better description.
      return 'Non-BC Business Day';
    }
    return '';
  }

  // Update alert text when a date changes

  updateStartDateAlert() {
    this.startDateAlert = this.getDateAlert(this.startDate);
  }

  updateEndDateAlert() {
    this.endDateAlert = this.getDateAlert(this.endDate);
  }

  updateSuspendDateAlert() {
    this.suspendDateAlert = this.getDateAlert(this.suspendDate);
  }

  updateResumeDateAlert() {
    this.resumeDateAlert = this.getDateAlert(this.resumeDate);
  }

  // this.ok = function() { $uibModalInstance.dismiss('cancel'); };

  reset() {
    this.startDate = null;
    this.endDate = null;
    this.numDays = 0;
    this.suspendDate = null;
    this.resumeDate = null;

    this.startDateAlert = '';
    this.endDateAlert = '';
    this.suspendDateAlert = '';
    this.resumeDateAlert = '';
    this.errorAlert = '';

    this.showRules = false;

    this.type = this.types[0];
  }

  go() {
    let regular = this.type.value === 'regular';
    let suspended = this.type.value === 'suspended';
    let numDays;

    this.errorAlert = '';

    let startDateMoment = moment(this.startDate);
    let endDateMoment = moment(this.endDate);
    let suspendDateMoment = moment(this.suspendDate);
    let resumeDateMoment = moment(this.resumeDate);

    if (suspended && this.suspendDate && this.resumeDate && suspendDateMoment >= resumeDateMoment) {
      // Show error if resume date is later than suspend date
      this.errorAlert = 'The suspension date must come before the resumption date.';
      return;
    }

    if (suspended && this.suspendDate && !this.resumeDate) {
      // show error if resume date not filled while suspend date is
      this.errorAlert = 'A resumption date is required.';
      return;
    }

    if (suspended && !this.suspendDate && this.resumeDate) {
      // show error if suspend date is not filled while resume date is
      this.errorAlert = 'A suspension date is required.';
      return;
    }

    // Given two of Start Date, End Date, and Number of Days, calculate the third field.

    if (this.startDate && this.endDate) {

      if (startDateMoment >= endDateMoment) {
        // Show error if start date is later than end date
        this.errorAlert = 'The start date must come before the end date.';
        return;
      }

      // Include the start date in the calculation.
      this.numDays = regular ? 1 : 0;

      // Count the number of days between start and end dates
      let date = startDateMoment;

      // Look at every date between
      while (date < endDateMoment) {
        date.add(1, 'd');

        // Factor in a suspension
        if (suspended && this.suspendDate && date >= suspendDateMoment) {
          // Stop if the suspension goes past the end date
          if (!this.resumeDate || endDateMoment < resumeDateMoment) { return; }

          // Don't count days in the suspension range
          if (date < resumeDateMoment) { continue; }
        }

        // If we've made it this far, count the day
        this.numDays++;
      }
    } else if (this.startDate && this.numDays) {
      // Find the end date from the start date and number of days
      endDateMoment = moment(this.startDate);

      // Include the start date in the calculation.
      numDays = regular ? 1 : 0;

      // Start counting the days
      while (numDays < this.numDays) {
        endDateMoment.add(1, 'd');

        // Factor in a suspension
        if (suspended && this.suspendDate && endDateMoment >= suspendDateMoment) {
          if (!this.resumeDate) {
            // Can't find an end date if there is no resume date
            this.endDate = '';
            return;
          }

          // Don't count days in the suspension range
          if (endDateMoment < resumeDateMoment) { continue; }
        }

        // If we've made it this far, count the day
        numDays++;
      }
      // convert moment date back to Date() object so it displays in datepicker
      this.endDate = { 'day': endDateMoment.day(), 'month': endDateMoment.month(), 'year': endDateMoment.year() };

    } else if (this.endDate && this.numDays) {
      // Find the start date from the end date and number of days
      startDateMoment = moment(this.endDate);

      // Include the start date in the calculation.
      numDays = regular ? 1 : 0;

      // Start counting back the days
      while (numDays < this.numDays) {
        startDateMoment.subtract(1, 'd');

        // Factor in a suspension
        if (suspended && this.suspendDate && startDateMoment >= suspendDateMoment) {
          if (!this.resumeDate) {
            // Can't find a start date if there is no resume date
            this.startDate = '';
            return;
          }

          // Don't count days in the suspension range
          if (startDateMoment < resumeDateMoment) { continue; }
        }

        // If we've made it this far, count the day
        numDays++;
      }
      // convert moment date back to Date() object so it displays in datepicker
      this.startDate = { 'day': startDateMoment.day(), 'month': startDateMoment.month(), 'year': startDateMoment.year() };
    }
  }

  // Handle escape key press.
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.dismiss();
  }
}
