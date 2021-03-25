import { Component, OnInit, Input } from '@angular/core';
import { Project } from 'app/models/project';
import { NavBarButton } from 'app/models/navBarButton';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})


export class NavbarComponent implements OnInit {
  @Input() currentProject: Project;
  @Input() pageTitle: string;
  @Input() navBarButtons?: NavBarButton[];

  constructor() { }

  ngOnInit(): void {
  }

}
