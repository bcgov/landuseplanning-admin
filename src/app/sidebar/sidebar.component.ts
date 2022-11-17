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
            this.canUserCreateProjects = jwt.client_roles.includes('create-projects');
          }
        });
  }

  /**
   * Contact the sidebar service to update the state of the sidebar(open or closed).
   * 
   * @return {void}
   */
  ngOnInit(): void {
    this.sideBarService.change
      .takeUntil(this.ngUnsubscribe)
      .subscribe(isOpen => {
        this.isOpen = isOpen;
      });
  }

  /**
   * When the user navigates to a certain place in the app, update
   * the sidebar to show where the user is at, if applicable.
   * 
   * @return {void}
   */
  SetActiveSidebarItem(): void {
    let urlArray = this.routerSnapshot.url.split('/');
    // urlArray[0] will be empty so we use shift to get rid of it.
    urlArray.shift();
    if (urlArray[0] === 'p') {
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

  /**
   * Toggle the visibility of the dropdown(sub-items) in the sidebar.
   * 
   * @return {void}
   */
  toggleDropdown(): void {
    this.showProjectDetailsSubItems = !this.showProjectDetailsSubItems;
  }

  /**
   * Toggle the visibility of the nav menu.
   * 
   * @return {void}
   */
  toggleNav(): void {
    this.isNavMenuOpen = !this.isNavMenuOpen;
  }

  /**
   * Close the nav menu by updating the relevant state.
   * 
   * @return {void}
   */
  closeNav(): void {
    this.isNavMenuOpen = false;
  }

  /**
   * Navigate to the files of a selected project.
   * 
   * @param {string} currentProjectId Currently selected project.
   * @return {void}
   */
  goToDocuments(currentProjectId: string): void {
    this.storageService.state.projectDocumentTableParams = null;
    this.router.navigate(['p', currentProjectId, 'project-files']);
  }

  /**
   * Terminate subscriptions when component is unmounted.
   *
   * @return {void}
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
