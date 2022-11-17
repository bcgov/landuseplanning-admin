import { Component, OnInit } from '@angular/core';
import { SideBarService } from 'app/services/sidebar.service';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss']
})

export class ToggleButtonComponent {

  public loading = true;
  public classApplied = false;

  constructor(
    private sidebarService: SideBarService
  ) { }

  /**
   * Toggle the side nav menu's visibility.
   * 
   * @return {void}
   */
  toggleSideNav(): void {
    this.sidebarService.toggle();
    this.classApplied = !this.classApplied;
  }

}
