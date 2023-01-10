import { Component, OnInit } from '@angular/core';

import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.scss']
})
export class ComplianceComponent implements OnInit {
  public currentProjectId = '';
  public currentProject;

  constructor(
    private storageService: StorageService
  ) { }

  /**
   * Get the current project from local storage.
   * 
   * @return {void}
   */
  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
  }

}
