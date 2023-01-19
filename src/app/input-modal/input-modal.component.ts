import { Component, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-input-modal',
  templateUrl: './input-modal.component.html',
  styleUrls: ['./input-modal.component.scss']
})
export class InputModalComponent {
  groupName = '';

  constructor(
    public activeModal: NgbActiveModal, // also used in template
  ) { }

  /**
   * Close the bootstrap modal when user hits cancel.
   *
   * @return {void}
   */
  public cancel(): void {
    this.activeModal.close(null);
  }

  public reset() {
    this.groupName = '';
  }

  /**
   * Close the input modal after the user has hit "save."
   *
   * @return {void}
   */
  save(): void {
    this.activeModal.close(this.groupName);
  }

  /**
   * Handle the escape keypress to cancel the bootstrap modal.
   *
   * @param {KeyboardEvent} event Keyboard event to handle.
   * @return {void}
   */
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent): void {
    this.cancel();
  }
}
