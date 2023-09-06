import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { StorageService } from 'app/services/storage.service';
import { ModalData } from 'app/shared/types/modal';
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
  public currentProject: Project;
  public modalData: ModalData;
  public sectionName = '';
  public errorMessage = '';

  constructor(
    private ngxSmartModalService: NgxSmartModalService,
    private documentSectionService: DocumentSectionService,
    private storageService: StorageService
  ) { }

  /**
   * Get the current project from local storage which will be used to save the new
   * document section.
   *
   * @return {void}
   */
  ngOnInit(): void {
    this.currentProject = this.storageService.state.currentProject.data;
  }

  /**
   * Handle closing the modal window. If a save is successfully completed, set the modal
   * data to indicate this so that the component that opened the modal knows what operation
   * took place.
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
   * Update the section name when the value in the input changes.
   *
   * @param {string} value The value to update the section name with.
   * @param {void}
   */
  updateName(value: string): void {
    this.sectionName = value;
  }

  /**
   * When a save is triggered then prepare the data and hit the project update API
   * to save it. Then, if a save is made successfully, close the modal.
   *
   * If the section name is empty, abort the save.
   *
   * @return {void}
   */
  handleSave(): void {
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
