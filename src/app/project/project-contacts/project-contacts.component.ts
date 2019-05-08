import { Component, OnInit } from '@angular/core';

import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-project-contacts',
  templateUrl: './project-contacts.component.html',
  styleUrls: ['./project-contacts.component.scss']
})
export class ProjectContactsComponent implements OnInit {
  public currentProject;

  constructor(
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
  }
}
