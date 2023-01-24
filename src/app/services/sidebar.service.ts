import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SideBarService {
  @Output() change: EventEmitter<boolean> = new EventEmitter();

  isOpen = false;

  constructor() { }

  /**
   * Toggle the sidebar open or closed.
   *
   * @return {void}
   */
  toggle() {
    this.isOpen = !this.isOpen;
    this.change.emit(this.isOpen);
  }
}
