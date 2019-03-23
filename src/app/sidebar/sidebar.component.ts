import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { container } from '@angular/core/src/render3/instructions';

import { SideBarService } from 'app/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements OnInit {
  public isNavMenuOpen = false;
  public routerSnapshot = null;
  public showProjectDetails = false;
  public showProjectDetailsSubItems = false;
  public currentProjectId = '';
  public currentMenu = '';

  @HostBinding('class.is-open')
  isOpen = false;

  constructor(router: Router,
              private sideBarService: SideBarService) {
    router.events.filter((event: any) => event instanceof NavigationEnd)
    .subscribe(event => {
        this.routerSnapshot = event;
        this.SetActiveSidebarItem();
    });
  }

  ngOnInit() {
    this.sideBarService.change.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }

  SetActiveSidebarItem() {
    let urlArray =  this.routerSnapshot.url.split('/');
    // urlArray[0] will be empty so we use shift to get rid of it.
    urlArray.shift();
    if (urlArray[0] === 'p') {
      switch (urlArray[2]) {
        case 'compliance': {
          break;
        }
        case 'valued-components': {
          break;
        }
        case 'project-updates': {
          break;
        }
        case 'project-contracts': {
          break;
        }
        case 'comment-periods': {
          break;
        }
        case 'milestones': {
          break;
        }
        default: {
          break;
        }
      }
      this.currentProjectId = urlArray[1];
      this.currentMenu = urlArray[2];
      this.showProjectDetails = true;
    } else {
      this.currentProjectId = urlArray[0];
      this.showProjectDetails = false;
    }
  }

  toggleDropdown() {
    this.showProjectDetailsSubItems = !this.showProjectDetailsSubItems;
  }

  toggleNav() {
    this.isNavMenuOpen = !this.isNavMenuOpen;
  }

  closeNav() {
    this.isNavMenuOpen = false;
  }
}
