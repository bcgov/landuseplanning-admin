import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Document } from 'app/models/document';
import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { StorageService } from 'app/services/storage.service';
import { DocumentSectionService } from 'app/services/documentSection.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentSection } from 'app/models/documentSection';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { Utils } from 'app/shared/utils/utils';
import { isEmpty, partition } from 'lodash';
import { NavBarButton, PageBreadcrumb } from 'app/shared/components/navbar/types';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-files-section',
  templateUrl: './project-files-section.component.html',
  styleUrls: ['./project-files-section.component.scss'],
})
export class ProjectFilesSectionComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public document: Document = null;
  public currentProject: Project = null;
  public publishText: string;
  public humanReadableSize: string;
  public pathAPI: string;
  public documentUrl: string;
  public navBarButtons: NavBarButton[];
  public pageBreadcrumbs: PageBreadcrumb[];
  public loading = true;
  public orderChangeLoading = false;
  public documentSections: DocumentSection[];

  constructor(
    public utils: Utils,
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService,
    private snackBar: MatSnackBar,
    private storageService: StorageService,
    private documentSectionService: DocumentSectionService,
    private ngxSmartModalService: NgxSmartModalService,

  ) {
    // The following items are loaded by a file that is only present on cluster builds.
    // Locally, this will be empty and local defaults will be used.
    const remote_api_path = window.localStorage.getItem('from_admin_server--remote_api_path');
    this.pathAPI = (isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;
  }

  /**
   * Get the current project from local storage. Then, get the file sections
   * associated with this project.
   *
   * @return {void}
   */
  ngOnInit(): void {
    this.route.data
    .takeUntil(this.ngUnsubscribe)
    .subscribe((res: any) => {
      if (res && res?.sections?.length > 0) {
        this.loading = false;
        this.documentSections = this.sortSectionsByOrder(res.sections);
      } else {
        alert('Uh-oh, couldn\'t load project file sections.');
        // Sections not found --> navigate back to search
        this.router.navigate(['/search']);
      }
    });

    this.currentProject = this.storageService.state.currentProject.data;
    this.pageBreadcrumbs = [
      { pageTitle: this.currentProject.name, routerLink: [ '/p', this.currentProject._id ] },
      { pageTitle: "Files" , routerLink: [ '/p', this.currentProject._id, 'project-files' ]}
    ];
    this.navBarButtons = [
      {
        label: 'Add File Section',
        action: () => this.ngxSmartModalService.open('add-files-section-modal')
      }
    ];
  }

  /**
   * After view init, listen for the file upload modal to close and check if it returned
   * files that can be saved in the Project. If files are returned, add their IDs to
   * project logos.
   *
   * @todo Get returned data into project form.
   * @returns {void}
   */
  ngAfterViewInit(): void {
    this.ngxSmartModalService.getModal('add-files-section-modal').onAnyCloseEventFinished.subscribe((modal: NgxSmartModalComponent) => {
      if ('save' ===  modal.getData()) {
        this.orderChangeLoading = true;
        this.documentSectionService.getAll(this.currentProject._id)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            res => {
              this.documentSections = res;
              this.openSnackBar('New section added successfully.', 'Close');
            },
            err => {
              alert('Failed to add new section.');
              console.error('Failed to add new section.', err)
            },
            () => {
              this.orderChangeLoading = false;
            }
          )
      }
    })
  }

  /**
   * Split the document sections into those that have an explicit "order"
   * property declared, and those that don't. Of those that do, sort those by
   * numerical order value. Finally, concatenate those with "null" as their order
   * to the bottom of the list of document sections.
   *
   * @param documentSections An array of document sections to sort.
   * @returns The sorted array of sections.
   */
  sortSectionsByOrder(documentSections: DocumentSection[]): DocumentSection[]  {
    const [populatedEntries, nullEntires] = partition(
      documentSections,
      (section) => Number.isInteger(section.order)
    );
    if (populatedEntries.length > 0) {
      // Sort by the order property.
      populatedEntries.sort((a, b) => a.order - b.order);
    }
    return populatedEntries.concat(nullEntires);
  }

  /**
   * Listen for when a document section is dropped after being moved in the list.
   * Update the order of the section if necessary.
   *
   * @param {CdkDragDrop} event A drag/drop event to watch for.
   * @return {void}
  */
  dropSection(event: CdkDragDrop<string[]>): void {
    if (event.previousContainer === event.container) {
      const movedDocumentSection = this.documentSections[event.previousIndex];
      this.documentSections.splice(event.previousIndex, 1);
      this.documentSections.splice(event.currentIndex, 0, movedDocumentSection);
      this.reorderSections();
    }
  }

  /**
   * Reorder the document sections by taking the current positions of each
   * section in the list and set the "order" property of each one based on
   * that position. Then, send this array of sections to the API to save the
   * new "order" values in the DB.
   */
  reorderSections(): void {
    this.orderChangeLoading = true;

    // Manually set the order value based on how the user sorted the array of sections.
    this.documentSections = this.documentSections.map((section, i) => {
      section.order = i + 1;
      return section;
    });

    // Send the updated ordering of the sections to the API.
    this.documentSectionService.reorder(this.documentSections, this.currentProject._id)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        res => {
          this.documentSections = res;
          this.openSnackBar('Sections successfully reordered.', 'Close');
        },
        err => {
          alert('Failed to reorder file sections');
          console.error('Failed to reorder file sections.', err);
        },
        () => {
          this.orderChangeLoading = false;
        }
      )
  }

  /**
   * Opens a new snack bar notification message with a duration of 2 seconds, and executes an action.
   *
   * @param {string} message A snack bar notification message.
   * @param {string} action A snack bar notification action.
   * @returns {void}
   */
  openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  /**
   * Terminate subscriptions when component is unmounted.
   *
   * @return {void}
   */
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
