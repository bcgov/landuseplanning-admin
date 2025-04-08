import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import * as moment from 'moment-timezone';

import { ConfigService } from 'app/services/config.service';
import { StorageService } from 'app/services/storage.service';
import { LinkService } from 'app/services/link.service';

import { Utils } from 'app/shared/utils/utils';
import { DocumentSection } from 'app/models/documentSection';
import { Document } from 'app/models/document';
import { ExternalLink } from 'app/models/externalLink';
import { Constants } from 'app/shared/utils/constants';

@Component({
  selector: 'app-external-link',
  templateUrl: './external-link.component.html',
  styleUrls: ['./external-link.component.scss']
})
export class ExternalLinkComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public currentProject;
  public projectFiles: Array<File> = [];
  public externalLink = [];
  public documents: any[] = null;
  public documentSections: DocumentSection[] = [];
  public dateAdded = null;
  public dateUpdated = null;
  public labels: any[] = [];
  public myForm: FormGroup;
  public loading = true;
  public docNameInvalid = false;
  public externalLinkInvalid = false;
	public chosenPhases: Array<string>;

  constructor(
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService,
    private linkService: LinkService,
    private utils: Utils,
    private config: ConfigService,
    private route: ActivatedRoute
  ) { }

  /**
   * Get the current project from local storage. Set up the form for adding
   * external links (files).
   *
   * @return {void}
   */
  ngOnInit() {
    this.documents = this.storageService.state.selectedDocs;
    this.currentProject = this.storageService.state.currentProject.data;
		this.chosenPhases = this.currentProject.projectTypes?.find(type => 'Forest Landscape Planning' === type.name)?.checked ? Constants.FOREST_PHASES : Constants.DEFAULT_PHASES;
    this.route.data
    .takeUntil(this.ngUnsubscribe)
    .subscribe((res: any) => {
      if (res?.sections) {
        this.documentSections = res.sections;
      } else {
        alert('Uh oh, couldn\'t load document sections.');
        console.error('Couldn\'t load document sections.', res)
      }
    });

    this.config.lists.forEach(item => {
      switch (item.type) {
        case 'projectPhase':
          break;
      }
    });

    const today = new Date();
    const todayObj = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };

    if (this.documents?.length > 1) {
      // If multiple documents were selected, navigate back to the file list. Not supported yet.
      this.router.navigate(['p', this.currentProject._id, 'project-files']);
    } else if (this.storageService.state?.form?.values?.length > 0) {
      // If there is an existing form in the storage service, populate our form with that data.
      this.myForm = this.storageService.state.form;
			if (!this.myForm.controls.projectPhase) {
				this.myForm.addControl('projectPhase', new FormControl('', [Validators.required]));
			}
    } else if (this.documents?.length === 1) {
      // If we are being passed a single document then we are editing. Populate with document data.
      this.dateAdded = this.documents[0].dateAdded || this.documents[0].datePosted;
      this.externalLink = this.documents[0].documentFileName || this.documents[0].externalLink;
      this.myForm = new FormGroup({
        'dateAdded': new FormControl(this.utils.convertJSDateToNGBDate(new Date(this.dateAdded)), Validators.required),
        'dateUpdated': new FormControl(),
        'externalLink': new FormControl(this.externalLink, Validators.required),
        'displayName': new FormControl(this.documents[0].displayName, Validators.required),
        'description': new FormControl(this.documents[0].description),
        'projectPhase': new FormControl(this.documents[0].projectPhase, Validators.required),
        'section': new FormControl(this.documents[0].section || ''),
        'read': new FormControl(this.documents[0].read || '')
        });
    } else {
      // Create a new form.
      this.myForm = new FormGroup({
        'dateAdded': new FormControl('', [Validators.required]),
        'dateUpdated': new FormControl(),
        'externalLink': new FormControl('', [Validators.required]),
        'displayName': new FormControl('', [Validators.required]),
        'description': new FormControl(''),
        'projectPhase': new FormControl('', [Validators.required]),
        'section': new FormControl(''),
        });
      this.myForm.controls.dateAdded.setValue(todayObj);
    }
    this.myForm.controls.dateUpdated.setValue(todayObj);
    this.loading = false;
    this._changeDetectionRef.detectChanges();
  }

  /**
   * Handle a file link. Prepare the external link data then contact the external link API to save it. 
   * Once saved, navigate the user away from the "link file" view.
   *
   * @return {void}
   */
  public linkFile() {
    this.loading = true;

    // Update the form data.
    const formData = this.updateFormState();
    if (this.documents[0]?._id) {
      this.linkService.update(formData, this.documents[0]._id)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          exl => {this.storageService.state.selectedDocs = exl},
          error => {
            console.error(error);
            alert('Uh-oh, couldn\'t update the external link');
          },
          () => { // onCompleted
            this.router.navigate(['p', this.currentProject._id, 'project-files']);
            this.loading = false;
          }
        )
    } else {
      this.linkService.add(formData)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          exl => {this.storageService.state.selectedDocs = exl},
          error => {
            console.error(error);
            alert('Uh-oh, couldn\'t create the external link');
          },
          () => { // onCompleted
            this.storageService.state = { type: 'documents', data: this.storageService.state.selectedDocs };
            this.router.navigate(['p', this.currentProject._id, 'project-files']);
            this.loading = false;
          }
        );
    }
  }

  /**
   * Update storage service from current form values.
   * 
   */
  public updateFormState = () => {
    const formData = new FormData();
    formData.append('project', this.currentProject._id);
    formData.append('externalLink', this.myForm.value.externalLink)
    formData.append('displayName', this.myForm.value.displayName);
    formData.append('dateAdded', new Date(Number(moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateAdded').value)))).toISOString());
    formData.append('dateUpdated', new Date(Number(moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateUpdated').value)))).toISOString());
    formData.append('description', this.myForm.value.description);
    formData.append('projectPhase', this.myForm.value.projectPhase);
    formData.append('section', this.myForm.value.section);
    formData.append('checkbox', 'false');
    this.storageService.state = { type: 'form', data: null };
    return formData;
  }

  /**
   * Make sure the external link name doesn't include any invalid characters.
   *
   * @return {void}
   */
  public validateChars() {
    this.docNameInvalid = this.myForm.value.displayName.match(/[\/|\\:*?"<>]/g) ? true : false;
  }

  /**
   * Make sure that the external link is a valid URL to a file.
   *
   * @return {void}
   */
  public validateLink() {
    const link = this.myForm.value.externalLink;
    try {
      const url = new URL(link);
      this.externalLinkInvalid = false;
    } catch {
      this.externalLinkInvalid = true;
    }
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

  /**
   * If local storage has a previous router location, navigate the user to it,
   * otherwise, navigate the user to the "project files" view.
   *
   * @return {void}
   */
  goBack() {
    if (this.storageService.state.back?.url) {
      this.router.navigate(this.storageService.state.back.url);
    } else {
      this.router.navigate(['/p', this.currentProject._id, 'project-files']);
    }
  }
}


