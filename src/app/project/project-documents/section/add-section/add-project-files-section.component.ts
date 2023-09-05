import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { StorageService } from 'app/services/storage.service';
import { ModalData } from 'app/shared/types/modal';
import { Utils } from 'app/shared/utils/utils';
import { Project } from 'app/models/project';
import { DocumentSection } from 'app/models/documentSection';
import { DocumentSectionService } from 'app/services/documentSection.service';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-add-project-file-section',
  templateUrl: './add-project-files-section.html',
  styleUrls: ['./add-project-files-section.component.scss']
})
export class AddProjectFilesSectionComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public projects = [];
  public activity: any;
  public currentProject: Project;
  public modalData: ModalData;
  public addEditPageTitle: string;
  public sectionName = '';
  public errorMessage = '';
  public pageBreadcrumbs: { pageTitle: string; routerLink: Object; }[];

  constructor(
    private router: Router,
    private ngxSmartModalService: NgxSmartModalService,
    private utils: Utils,
    private documentSectionService: DocumentSectionService,
    private storageService: StorageService
  ) { }

  /**
   * Get the current project from local storage, then set up the project update
   * form dependent on whether the user is editing an update or not.
   *
   * @return {void}
   */
  ngOnInit(): void {
    this.currentProject = this.storageService.state.currentProject.data;
    this.modalData = this.ngxSmartModalService.getModalData('add-files-section-modal');
  }

  /**
   * Handle closing the modal window.
   *
   *
   * @return {void}
   */
  handleClose(action?: string ): void {
    if ('save' === action) {
      this.ngxSmartModalService.setModalData(action, 'add-files-section-modal', true);
    }
    this.ngxSmartModalService.close('add-files-section-modal');
  }

  /**
   *
   * @param event
   */
  updateName(event){
    this.sectionName = event.target.value
  }
  /**
   * When a save is triggered then prepare the data and hit the project update API
   * to save it.
   *
   * @return {void}
   */
  handleSave(): void {
    console.log(this.sectionName)
    if (0 === this.sectionName.length) {
      return;
    }

    const docSection = new DocumentSection({
      name: this.sectionName,
      project: this.currentProject._id,
    });
    this.documentSectionService.add(docSection)
      .subscribe(
        () => this.handleClose('save'),
        error => {
          this.errorMessage = "Error saving file section.";
          console.error('Error saving file section:', error);
        }
      )
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
