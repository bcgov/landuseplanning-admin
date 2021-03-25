import { Component, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { SideBarService } from 'app/services/sidebar.service';
import { KeycloakService } from 'app/services/keycloak.service'
import { filter } from 'rxjs/operators';
import { StorageService } from 'app/services/storage.service';
import { Subject } from 'rxjs/Subject';
import { JwtUtil } from 'app/jwt-util';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public isNavMenuOpen = false;
  public routerSnapshot = null;
  public showProjectDetails = false;
  public showProjectDetailsSubItems = false;
  public currentProjectId = '';
  public currentMenu = '';
  public canUserCreateProjects: boolean;

  @HostBinding('class.is-toggled')
  isOpen = false;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private sideBarService: SideBarService,
    private keycloakService: KeycloakService
    ) {

    router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .takeUntil(this.ngUnsubscribe)
      .subscribe(event => {
        this.routerSnapshot = event;
        this.SetActiveSidebarItem();
      });

      router.events
        .takeUntil(this.ngUnsubscribe)
        .subscribe(val => {
          const token = this.keycloakService.getToken();
          if (token) {
            const jwt = new JwtUtil().decodeToken(token);
            this.canUserCreateProjects = jwt.realm_access.roles.includes('create-projects')
          }
        });
  }

  ngOnInit() {
    this.sideBarService.change
      .takeUntil(this.ngUnsubscribe)
      .subscribe(isOpen => {
        this.isOpen = isOpen;
      });
  }

  SetActiveSidebarItem() {
    let urlArray = this.routerSnapshot.url.split('/');
    // urlArray[0] will be empty so we use shift to get rid of it.
    urlArray.shift();
    if (urlArray[0] === 'p') {
      /* Useless switch
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
        case 'project-groups': {
          break;
        }
        case 'project-pins': {
          break;
        }
        case 'project-documents': {
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
      }*/
      this.currentProjectId = urlArray[1];
      try {
        this.currentMenu = urlArray[2];
        this.currentMenu = urlArray[2].split(';')[0];
      } catch (e) {
        // When coming from search, it's blank.
      }
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

  goToDocuments(currentProjectId) {
    this.storageService.state.projectDocumentTableParams = null;
    this.router.navigate(['p', currentProjectId, 'project-documents']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
