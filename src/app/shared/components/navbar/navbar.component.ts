import { Component, OnInit, Input } from '@angular/core';
import { Project } from 'app/models/project';
import { NavBarButton, PageBreadcrumb } from './types';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
  @Input() currentProject?: Project;
  @Input() currentPageTitle?: string;
  @Input() navBarButtons?: NavBarButton[];
  @Input() pageBreadcrumbs?: PageBreadcrumb[];

  constructor() {}

  ngOnInit(): void {}
}
