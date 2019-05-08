import { Component, OnInit } from '@angular/core';

import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-project-updates',
  templateUrl: './project-updates.component.html',
  styleUrls: ['./project-updates.component.scss']
})
export class ProjectUpdatesComponent implements OnInit {
  public currentProject;

  constructor(
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
  }

}
