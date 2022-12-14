import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { Subject, forkJoin, Observable } from 'rxjs';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as Editor from 'assets/ckeditor5/build/ckeditor';
import { isEmpty } from 'lodash';
import { StorageService } from 'app/services/storage.service';
import { ProjectService } from 'app/services/project.service';
import { DocumentService } from 'app/services/document.service';
import { CkUploadAdapter } from 'app/shared/utils/ck-upload-adapter';
import { Project } from 'app/models/project';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';
import { ModalData } from 'app/shared/types/modal';
import { Document } from 'app/models/document';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add-edit-project',
  templateUrl: './add-edit-project.component.html',
  styleUrls: ['./add-edit-project.component.scss']
})
export class AddEditProjectComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public fileUploadModalData: ModalData;
  public Editor = Editor;
  public myForm: FormGroup;
  public back: any = {};
  public REGIONS: Array<Object> = [
    'Cariboo',
    'Kootney Boundary',
    'West Coast',
    'Northeast',
    'Omineca',
    'Skeena',
    'South Coast',
    'Thompson - Okanagan'
  ]
  public sectorsSelected = [];
  public projectLead = '';
  public projectLeadId = '';
  public projectDirector = '';
  public projectDirectorId = '';

  public OVERLAPPING_REGIONAL_DISTRICTS: Array<Object> = [
    'Alberni - Clayoquot',
    'Bulkley - Nechako',
    'Capital',
    'Cariboo',
    'Central Coast',
    'Central Kootenay',
    'Central Okanagan',
    'Columbia Shuswap',
    'Comox Valley',
    'Cowichan Valley',
    'East Kootenay',
    'Fraser Valley',
    'Fraser - Fort George',
    'Islands Trust',
    'Kitimat - Stikine',
    'Kootenay - Boundary',
    'Metro Vancouver',
    'Mount Waddington',
    'Nanaimo',
    'North Okanagan',
    'West Coast',
    'Okanagan - Similkameen',
    'Peace River',
    'qathet',
    'Squamish - Lillooet',
    'Strathcona',
    'Sunshine Coast',
    'Thompson - Nicola'
  ];

  public PROJECT_PHASES: Array<Object> = [
    'Pre-Planning',
    'Plan Initiation',
    'Plan Development',
    'Plan Evaluation and Approval',
    'Plan Implementation and Monitoring'
  ];

  public projectName: string;
  public projectId: string;
  public project: Project;

  public isEditing = false;

  public loading = true;
  public pathAPI: string;

  // Shape file upload
  public projectFiles: Array<File> = [];
  public shapefileDocuments: Document[] = [];
  public shapefilesModified = false;

  public bannerImageDocument: Document | null;
  public allBannerImageDocuments: Document[] = [];
  public bannerImageModified = false;
  public removeBannerImage: boolean;

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private navigationStackUtils: NavigationStackUtils,
    private projectService: ProjectService,
    private storageService: StorageService,
    private ngxSmartModalService: NgxSmartModalService,
    private documentService: DocumentService,
  ) {
  }

  /**
   * Get project data to populate add-edit-project template with from
   * route resolver. Start to build project form with retrieved data.
   * Get attached documents(files) such as project banner and shapefiles
   * from route resolver.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    this.route.data.subscribe((res: any) => {
      if (res) {
        if (res.documents && res.documents[0].data.meta && res.documents[0].data.meta.length > 0) {
          let returnedDocuments = res.documents[0].data.searchResults;
          this.shapefileDocuments = returnedDocuments.filter((document) => document.documentSource === 'SHAPEFILE' ? document : null );
          this.allBannerImageDocuments = returnedDocuments.filter((document) => document.documentSource === 'BANNER' ? document : null );

          // The following items are loaded by a file that is only present on cluster builds.
          // Locally, this will be empty and local defaults will be used.
          const remote_api_path = window.localStorage.getItem('from_admin_server--remote_api_path');
          this.pathAPI = (isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;


              // Get data related to current project
              this.route.parent.data
              .takeUntil(this.ngUnsubscribe)
              .subscribe((data: { project: Project }) => {
                this.isEditing = Object.keys(data).length === 0 && data.constructor === Object ? false : true;

                /**
                 * When a user selects a project lead(and is taken to a new window),
                 * make sure the project lead is brought over.
                 **/
                if (this.storageService.state.projectLead) {
                  this.projectLead = this.storageService.state.projectLead.name;
                  this.projectLeadId = this.storageService.state.projectLead._id;
                } else if (this.isEditing && data.project.projectLead && data.project.projectLead._id && data.project.projectLead._id !== '') {
                  this.projectLead = data.project.projectLead.displayName;
                  this.projectLeadId = data.project.projectLead._id;
                }

                this.project = data.project;
                this.buildForm(data);
                this.bannerImageDocument = this.allBannerImageDocuments.find((doc) => doc._id === this.project.backgroundImage);
                this.loading = false;

                try {
                  this._changeDetectorRef.detectChanges();
                } catch (e) {
                  console.error('error:', e);
                }
              });
        } else {
          this.buildForm();
          this.shapefileDocuments = [];
          this.allBannerImageDocuments = null;
          this.loading = false;
        }
      }
    },
    (error) => {
      console.error('Error loading project data: ', error);
      alert("Uh oh, couldn't load project.");
      this.back = this.storageService.state.back;
    });
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
    this.ngxSmartModalService.getModal('file-upload-modal').onAnyCloseEventFinished.subscribe((modal: NgxSmartModalComponent) => {
      const modalData = modal.getData();
      if (modalData?.returnedFiles) {
        this.logos.clear();
        modalData.returnedFiles.forEach(file => {
          this.logos.push(new FormGroup({
            'document': new FormControl(file._id),
            'name': new FormControl(file.documentFileName),
            'alt': new FormControl(file.alt),
            'link': new FormControl('')
          }));
        });
      }
    });
  }

  /**
   * Build project edit form either from local storage, from route
   * resolver data, or a new empty form(if user is adding a new project).
   *
   * @param resolverData The route resolved data to build into a form.
   * @returns {void}
   */
  buildForm(resolverData?: { project: Project }): void {
    if (this.storageService.state.form) {
      // TODO: Save the projectID if it was originally an edit.
      this.myForm = this.storageService.state.form;
    } else if (resolverData && !(Object.keys(resolverData).length === 0 && resolverData.constructor === Object)) {
      // First entry on resolver
      this.projectId = resolverData.project._id;
      this.myForm = this.buildFormFromData(resolverData.project);
    } else {
      this.myForm = new FormGroup({
        'name': new FormControl(),
        'partner': new FormControl(),
        'agreements': new FormArray([]),
        'description': new FormControl(),
        'details': new FormControl(),
        'overlappingRegionalDistricts': new FormControl(),
        'region': new FormControl(),
        'lat': new FormControl([]),
        'lon': new FormControl([]),
        'addFile': new FormControl(),
        'existingLandUsePlans': new FormArray([]),
        'ea': new FormControl(),
        'capital': new FormControl(),
        'notes': new FormControl(),
        'status': new FormControl(),
        'logos': new FormArray([]),
        'backgroundInfo': new FormControl(),
        'engagementLabel': new FormControl(),
        'engagementInfo': new FormControl(),
        'documentInfo': new FormControl(),
        'projectPhase': new FormControl(),
        'projectDirector': new FormControl(),
        'projectLead': new FormControl(),
        'projectAdmin': new FormControl()
      });

      // Form always has at least one agreement field
      this.populateFormArray(this.agreements);
    }
  }

  /**
   * Getter to be able to access the existingLandUsePlans FormControl
   * as a FormArray.
   *
   * @returns {void}
   */
  get existingLandUsePlans(): FormArray {
    return this.myForm.get('existingLandUsePlans') as FormArray;
  }

  /**
   * Getter to be able to access the agreements FormControl
   * as a FormArray.
   *
   * @returns {void}
   */
  get agreements(): FormArray {
    return this.myForm.get('agreements') as FormArray;
  }

  /**
   * Getter to be able to access the logos FormControl
   * as a FormArray.
   *
   * @returns {void}
   */
  get logos(): FormArray {
    return this.myForm.get('logos') as FormArray;
  }

  /**
   * Set the modal data and launch file upload modal.
   *
   * @returns {void}
   */
  launchFilePicker(): void {
    this.fileUploadModalData = {
      title: "Select project logo(s).",
      altRequired: true,
      fileNum: 3,
      fileExt: 'jpg, jpeg, png',
      maxSize: 0.5,
      fileTypes: [ 'image/jpeg', 'image/png' ],
      projectID: this.projectId
    };

    this.ngxSmartModalService.setModalData( this.fileUploadModalData, 'file-upload-modal', true);
    this.ngxSmartModalService.open('file-upload-modal');
  }

  /**
   * Add a form group to a specific form array.
   *
   * @param formEntry Specific form array to populate with a new FormGroup.
   * @returns {void}
   */
   populateFormArray(formEntry: FormArray): void {
    if (formEntry === this.existingLandUsePlans) {
      formEntry.push(new FormGroup({
        'existingLandUsePlan': new FormControl(),
        'existingLandUsePlanURL': new FormControl()
      }));
    }
    if (formEntry === this.agreements) {
      formEntry.push(new FormGroup({
        'agreementName': new FormControl(),
        'agreementUrl': new FormControl()
      }));
    }
  }

  /**
   * Clear the selected project logos and the associated information.
   *
   * @returns {void}
   */
  handleClearLogos(): void {
    this.myForm.controls.logos = new FormArray([]);
  }

  /**
   * Remove an element from a form array.
   *
   * @param formArray The form to remove an item from.
   * @param index The index of the item to remove.
   * @returns {void}
   */
  removeItemFromFormArray(formArray: FormArray, index: number): void {
    formArray.removeAt(index);
  }

  /**
   * Return the type of the value currently filled into the form.
   *
   * @param formValue The value of the form to check the type of.
   * @returns The type of form control.
   */
  public formValueType(formValue: any): string {
    return typeof formValue;
  }

  /**
   * Update the router navigation.
   *
   * @returns {void}
   */
  private setNavigation(): void {
    if (!this.isEditing) {
      this.navigationStackUtils.pushNavigationStack(
        ['/projects', 'add'],
        [
          {
            route: ['/projects'],
            label: 'All Projects'
          },
          {
            route: ['/projects', 'add'],
            label: 'Add'
          }
        ]
      );
    } else {
      this.navigationStackUtils.pushNavigationStack(
        ['/p', this.project._id, 'edit'],
        [
          {
            route: ['/projects'],
            label: 'All Projects'
          },
          {
            route: ['/p', this.project._id],
            label: this.project.name
          },
          {
            route: ['/p', this.project._id, 'edit'],
            label: 'Edit'
          }
        ]
      );
    }
  }

  /**
   * Build an array of form groups existing land use plans from the project data.
   *
   * @param projectData The project to build the form with.
   * @returns The existing land use plans form group array.
   */
   buildExistingPlansFormArray(projectData: Project): FormGroup[] {
    let formArray = [];
    if (Array.isArray(projectData.existingLandUsePlans)) {
      for (let i = 0; i < projectData.existingLandUsePlans.length; i++ ) {
        formArray[i] = new FormGroup({
          'existingLandUsePlan': new FormControl(projectData.existingLandUsePlans[i].existingLandUsePlan),
          'existingLandUsePlanURL': new FormControl(projectData.existingLandUsePlans[i].existingLandUsePlanURL)
        })
      }
    } else {
      formArray.push(new FormGroup({
        'existingLandUsePlan': new FormControl(projectData.existingLandUsePlans),
        'existingLandUsePlanURL': new FormControl(projectData.existingLandUsePlanURLs)
      }))
    }
    return formArray;
  }

  /**
   * Build an array of form groups of existing land agreements from project data.
   *
   * @param projectData The project data to build the form with.
   * @returns The array of existing land agreements form groups.
   */
  buildExistingAgreementsFormArray(projectData: Project): FormGroup[] {
    let formArray = [];
    if (Array.isArray(projectData.agreements)) {
      for (let i = 0; i < projectData.agreements.length; i++ ) {
        formArray[i] = new FormGroup({
          'agreementName': new FormControl(projectData.agreements[i].agreementName),
          'agreementUrl': new FormControl(projectData.agreements[i].agreementUrl)
        })
      }
    } else {
      formArray.push(new FormGroup({
        'agreementName': new FormControl(projectData.agreements),
        'agreementUrl': new FormControl()
      }))
    }
    return formArray;
  }

  /**
   * Build an array of form groups of overlapping regional districts from project data.
   *
   * @param projectData The project to build the form with.
   * @returns The array of overlapping regional districts form groups.
   */
  buildOverlappingDistrictsFormArray(projectData: Project): any[] {
    let formArray = [];
    if (Array.isArray(projectData.overlappingRegionalDistricts)) {
      formArray = projectData.overlappingRegionalDistricts;
    } else {
      formArray.push(projectData.overlappingRegionalDistricts);
    }
    return formArray;
  }

  /**
   * Build a an array of form groups to add as a form array to the main
   * project form.
   *
   * @param projectData The project data to build the logos form array with.
   * @returns The array of logo form groups.
   */
  buildLogosFormArray(projectData: Project): FormGroup[] {
    let logosFormArray = [];
    if (Array.isArray(projectData.logos)) {
      logosFormArray = projectData.logos.map(logo => {
        return new FormGroup({
          'document': new FormControl(logo.document),
          'name': new FormControl(logo.name),
          'alt': new FormControl(logo.alt),
          'link': new FormControl(logo.link)
        })
      })
    }
    return logosFormArray;
  }

  /**
   * Take project data and build a form from it. Usually invoked when
   * a user is editing a project rather than creating a new one.
   *
   * @param projectData The project to convert to form.
   * @returns The form to edit the project with.
   */
  buildFormFromData(projectData: Project): FormGroup {
    if (!projectData.centroid) {
      projectData.centroid = [-123.3656, 48.4284];
    }

    return new FormGroup({
      'name': new FormControl(projectData.name),
      'partner': new FormControl(projectData.partner),
      'description': new FormControl(projectData.description),
      'details': new FormControl(projectData.details),
      'overlappingRegionalDistricts': new FormControl(this.buildOverlappingDistrictsFormArray(projectData)),
      'existingLandUsePlans': new FormArray(this.buildExistingPlansFormArray(projectData)),
      'agreements': new FormArray(this.buildExistingAgreementsFormArray(projectData)),
      'region': new FormControl(projectData.region),
      'lat': new FormControl(projectData.centroid[1]),
      'lon': new FormControl(projectData.centroid[0]),
      'logos': new FormArray(this.buildLogosFormArray(projectData)),
      'backgroundInfo': new FormControl(projectData.backgroundInfo),
      'engagementLabel': new FormControl(projectData.engagementLabel),
      'engagementInfo': new FormControl(projectData.engagementInfo),
      'documentInfo': new FormControl(projectData.documentInfo),
      'projectPhase': new FormControl(projectData.projectPhase),
      'projectDirector': new FormControl(projectData.projectDirector),
      'projectLead': new FormControl(projectData.projectLead),
    });
  }

  /**
   * Take action when the user wants to cancel adding or editing a project.
   *
   * @returns {void}
   */
  onCancel(): void {
    this.clearStorageService();
    if (this.back && this.back.url) {
      this.router.navigate(this.back.url);
    } else {
      this.router.navigate(['/projects']);
    }
  }

  /**
   * Takes current form values and builds a project object.
   *
   * @param form Form group to build project with.
   * @returns The project from the current form values.
   */
  convertFormToProject(form: FormGroup): Project {
    return new Project({
      'name': form.controls.name.value,
      'partner': form.controls.partner.value,
      'agreements': this.agreementsFullFields(),
      'description': form.controls.description.value,
      'details': form.controls.details.value,
      'overlappingRegionalDistricts': form.controls.overlappingRegionalDistricts.value,
      'region': form.controls.region.value,
      'centroid': [form.get('lon').value, form.get('lat').value],
      'existingLandUsePlans': this.existingPlanFullFields(),
      'logos': this.getLogosFormValues(),
      'backgroundInfo': form.controls.backgroundInfo.value,
      'engagementLabel': form.controls.engagementLabel.value,
      'engagementInfo': form.controls.engagementInfo.value,
      'documentInfo': form.controls.documentInfo.value,
      'projectPhase': form.controls.projectPhase.value,
      'projectDirector': this.projectDirectorId,
      'projectLead': this.projectLeadId,
    });
  }

  /**
   * Clears the local storage of project and form details.
   *
   * @returns {void}
   */
  private clearStorageService() {
    this.storageService.state.form = null;
    this.storageService.state.selectedOrganization = null;
    this.storageService.state.projectLead = null;
    this.storageService.state.projectDirector = null;
    this.storageService.state.contactType = null;
    this.navigationStackUtils.popNavigationStack();
  }

  /**
   * @todo Delete?
   */
  public linkOrganization() {
    this.storageService.state.form = this.myForm;
    this.setNavigation();
    if (!this.isEditing) {
      this.router.navigate(['/projects', 'add', 'link-org']);
    } else {
      this.router.navigate(['/p', this.project._id, 'edit', 'link-org']);
    }
  }

  /**
   * Select an existing contact for form or create a new one
   *
   * @param {string} contact The selected contact
   * @returns {void}
   */
  public contactSelect(contact: string) {
    this.storageService.state.form = this.myForm;
    this.storageService.state.contactType = contact;
    this.setNavigation();
    if (!this.isEditing) {
      this.router.navigate(['/projects', 'add', 'contact-select']);
    } else {
      this.router.navigate(['/p', this.project._id, 'edit', 'contact-select']);
    }
  }

  /**
   * Validates the form and alerts the user if any mistakes are made.
   *
   * @returns {boolean}
   */
  private validateForm() {
    if (this.myForm.controls.name.value === '' || this.myForm.controls.name.value == null) {
      alert('Name cannot be empty.');
      return false;
    } else if (this.myForm.controls.partner.value === '' || this.myForm.controls.partner.value == null) {
      alert('Partner(s) cannot be empty.');
      return false;
    } else if (this.agreementFieldsError()) {
      alert('Agreement name(s) cannot be empty.');
      return false;
    } else if (this.myForm.controls.description.value === '' || this.myForm.controls.description.value == null) {
      alert('Description cannot be empty.');
      return false;
    } else if (this.myForm.controls.lon.value === '') {
      alert('Longitude cannot be empty.');
      return false;
    } else if (this.myForm.controls.lat.value === '') {
      alert('Latitude cannot be empty.');
      return false;
    } else if (this.myForm.controls.lat.value >= 60.01 || this.myForm.controls.lat.value <= 48.20) {
      alert('Latitude must be between 48.20 and 60.01');
      return false;
    } else if (this.myForm.controls.lon.value >= -114.01 || this.myForm.controls.lon.value <= -139.06) {
      alert('Longitude must be between -114.01 and -139.06');
      return;
    } else if (this.projectLeadId === '') {
      alert('Project Lead cannot be empty.');
      return false;
    } else {
      return true;
    }
  }

  /**
   * Inspects the agreements and makes sure that they are valid. If not, a boolean error flag is returned.
   *
   * @returns {boolean}
   */
  private agreementFieldsError() {
    let agreements = this.myForm.controls.agreements;
    for (let i = 0; agreements.value.length > i; i++) {
      if (agreements.value[i].agreementName === null ||
          agreements.value[i].agreementName === '')
      {
        return true;
      }
    }
  }

  /**
   * Adds an existing plan to the completed fields if its existingLandUsePlan and existingLandUsePlanURL values are not null.
   *
   * @returns {array}
   */
  private existingPlanFullFields() {
    let completedFields = [];
    let existingPlans = this.myForm.controls.existingLandUsePlans;
    for (let i = 0; existingPlans.value.length > i; i++) {
      if (existingPlans.value[i].existingLandUsePlan !== null || existingPlans.value[i].existingLandUsePlanURL !== null) {
        completedFields.push(existingPlans.value[i]);
      }
    }
    return completedFields;
  }

  /**
   * Adds an agreement to the completed fields if its agreementName and agreementUrl values are not null.
   *
   * @returns {array}
   */
  private agreementsFullFields() {
    let completedFields = [];
    let agreements = this.myForm.controls.agreements;
    for (let i = 0; agreements.value.length > i; i++) {
      if (agreements.value[i].agreementName !== null || agreements.value[i].agreementUrl !== null) {
        completedFields.push(agreements.value[i]);
      }
    }
    return completedFields;
  }

  /**
   * Takes the project logos FormArray and gets the data from it.
   *
   * @returns Array of logos objects.
   */
  private getLogosFormValues(): Project['logos'] {
    return this.logos.controls.map((logo: FormGroup) => ({
        document: logo.controls.document.value,
        name: logo.controls.name.value,
        alt: logo.controls.alt.value,
        link: logo.controls.link.value
    }));
  }

  /**
   * Publish the selected logos.
   *
   * @returns {void}
   */
  private publishSelectedLogos() {
    const logoValues = this.getLogosFormValues();
    const documentPublishRequests = logoValues.map(logo => {
      return this.documentService.publish(logo.document);
    });
    forkJoin(documentPublishRequests)
    .subscribe(
      aggregateResponse => {
        aggregateResponse.forEach((individualResponse: Document|HttpErrorResponse) => {
          if ("status" in individualResponse) {
            // One or more of the responses is an error.
            if (500 === individualResponse.status || 400 === individualResponse.status) {
              console.error('Error publishing file', individualResponse);
              alert('There was a problem publishing one or more of the selected logos.')
              return;
            }
          }
        });
      },
      error => {
        console.error('Error publishing files', error);
        alert('There was a problem publishing one or more of the selected logos.')
        return;
      },
      () => {} // On finished.
    )
  }

  /**
   * Returns the banner image values as FormData to be used in an API call.
   *
   * @returns {FormData}
   */
  getBannerImageFormData(): FormData {
    const bannerImageFormData = new FormData();
    bannerImageFormData.append('upfile',this.bannerImageDocument.upfile);
    bannerImageFormData.append('documentFileName', this.bannerImageDocument.documentFileName);
    bannerImageFormData.append('displayName',  this.bannerImageDocument.documentFileName);
    bannerImageFormData.append('documentSource', 'BANNER');

    return bannerImageFormData;
  }


  /**
   * Save a new project to the DB.
   *
   * @param {Project} project The project data to save.
   * @return {void}
   */
  saveNewProject(project: Project): void {
    this.projectService.add(project)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data) => {
          this.projectId = data._id;
        },
        error => {
          console.error('error = ', error);
          alert('Uh-oh, couldn\'t create project');
        },
        () => {
          this.clearStorageService();
          this.loading = false;
          this.router.navigate(['/p', this.projectId, 'project-details']);
        }
      );
  }

  /**
   * Update an existing project after the user makes edits.
   *
   * @param {Project} project The project data to save.
   * @return {void}
   */
  updateExistingProject(project: Project): void {
    this.projectService.save(project)
    .takeUntil(this.ngUnsubscribe)
    .subscribe(
      () => {
        this.clearStorageService();
        this.loading = false;
        this.router.navigated = false;
        this.openSnackBar('This project was created successfully.', 'Close');
        this.router.navigate(['/p', this.project._id, 'project-details']);
      },
      error => {
        console.error('error =', error);
        alert('Uh-oh, couldn\'t edit project');
      },
    );
  }

  /**
   * Sends two API requests. One to add the document, and another to publish it. Will notify the user
   * if there is an issue anywhere along the way.
   *
   * @param {Project} project The project to save the banner image to.
   * @param bannerImageFormData The banner image form data to send as a request to the API.
   * @return {void}
   */
  addAndPublishBannerThenSaveProject(project: Project, bannerImageFormData: FormData): void {
    this.documentService.add(bannerImageFormData)
    .subscribe((addedDocument) => {
      this.documentService.publish(addedDocument._id)
        .subscribe(
          (publishedDocument) => {
            // Update the project with the saved and published background image document ID.
            project.backgroundImage = publishedDocument._id;
            this.updateExistingProject(project);
          },
          error => {
            alert('Could not publish banner image. Please publish manually in project documents section.');
          }
        )
      },
      error => {
        console.error('Error:', error);
        alert('Uh-oh, couldn\'t save banner image.');
      });
  }

  /**
   * Save the project.
   *
   * @returns {void}
   */
  onSubmit(): void {
    // If the form has validation errors, don't save or update anything.
    if (!this.validateForm()) {
      return;
    }

    // Get the project data from the form.
    const project = this.convertFormToProject(this.myForm);

    // If project is not being edited(i.e. a new project).
    if (!this.isEditing) {
      this.saveNewProject(project);

      if (this.bannerImageDocument) {
        const bannerImageFormData = this.getBannerImageFormData();

        // Add, publish, then save the published document's ID as the project's backgroundImage value.
        this.documentService.add(bannerImageFormData)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          (addedDocument) => {
            this.documentService.publish(addedDocument._id)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              (publishedDocument) => {
                project.backgroundImage = publishedDocument._id;
                this.updateExistingProject(project);
              },
              error => {
                console.error('error = ', error);
                alert('Could not publish banner image. Please publish manually in project files section.');
              });
            },
            error => {
              console.error('error = ', error);
              alert('Uh-oh, couldn\'t save banner image.');
            });
      }

      // Publish selected logo files.
      if (this.logos) {
        this.publishSelectedLogos();
      }
    } else { // If the user is editing an existing project.
      project._id = this.project._id;
      // Save shapefiles.
      let saveShapefileObservables: Observable<Document|HttpErrorResponse>[] = [];
      this.shapefileDocuments.forEach(doc => {
        // Only queue shapfiles to be saved if they haven't been saved before.
        if (doc.upfile) {
          const formData = new FormData();
          formData.append('upfile', doc.upfile);
          formData.append('project', this.project._id);
          formData.append('documentFileName', doc.documentFileName);
          formData.append('displayName',  doc.documentFileName);
          formData.append('documentSource', 'SHAPEFILE');
          saveShapefileObservables.push(this.documentService.add(formData));
        }
      });

      if (this.bannerImageDocument &&
          this.project.backgroundImage &&
          this.bannerImageDocument._id !== this.project.backgroundImage) {
        /**
         * If the current banner image doesn't match the originally-loaded one,
         * delete the original, then save the new one.
         */
        const bannerImageToDelete = new Document();
        const bannerImageFormData = this.getBannerImageFormData();

        bannerImageToDelete._id = this.project.backgroundImage;
        bannerImageFormData.append('project', this.project._id);

        this.documentService.delete(bannerImageToDelete)
          .subscribe(
            () => {
              this.addAndPublishBannerThenSaveProject(project, bannerImageFormData);
            },
            (error) => {
              // Still add and publish the new banner image. We just need the user to delete it in this case.
              alert('Could not delete banner image. Please delete manually in project documents section.');
              this.addAndPublishBannerThenSaveProject(project, bannerImageFormData);
            });
      } else if (this.bannerImageDocument && !this.project.backgroundImage) {
        // If the banner image document is being selected by the user for the first time.
        const bannerImageFormData = this.getBannerImageFormData();
        bannerImageFormData.append('project', this.project._id);

        this.addAndPublishBannerThenSaveProject(project, bannerImageFormData);
      } else if (!this.bannerImageDocument) {
        // Remove the banner image entirely.
        const bannerImageToDelete = new Document();
        bannerImageToDelete._id = this.project.backgroundImage;
        this.documentService.delete(bannerImageToDelete)
          .subscribe(
            (res) => {
              // Remove the background image value now that it's been deleted.
              project.backgroundImage = null;
              this.updateExistingProject(project);
            },
            (error) => {
              alert('Could not delete banner image. Please delete manually in project documents section.');
            });
      }

      // Publish selected logo files.
      if (this.logos.dirty) {
        this.publishSelectedLogos();
      }

      // Only save shapefiles if they are modified.
      if (this.shapefilesModified && saveShapefileObservables.length > 0) {
        // Make all shapefile saves(POST requests) at once.
        forkJoin(saveShapefileObservables)
          .subscribe({
            next: (res) => {
              const publishShapefileObservables = res.map((doc: Document) => this.documentService.publish(doc._id));
              forkJoin(publishShapefileObservables)
                .subscribe({
                  next: () => {
                  },
                  error: (error) => {
                    console.error('Error publishing shapefiles', error);
                    alert('Error publishing shapefiles. Please go into the project files section and publish shapfiles manually.');
                  },
                  complete: () => {}
                });
            },
            error: (error) => {
              console.error('Error saving shapefiles', error);
              alert('Error saving shapefiles.');
            },
            complete: () => {}
          });
      }
    }
  }

  /**
   * Removes the currently selected contact's information if they are a project director or project lead.
   *
   * @param {string} contact The selected contact
   * @returns {void}
   */
  public removeSelectedContact(contact: string) {
    if (contact === 'projectDirector') {
      this.storageService.state.projectDirector = null;
      this.projectDirector = '';
      this.projectDirectorId = '';
      this.myForm.controls.projectDirector.setValue('');
    } else if (contact === 'projectLead') {
      this.storageService.state.projectLead = null;
      this.projectLead = '';
      this.projectLeadId = '';
      this.myForm.controls.projectLead.setValue('');
    }
  }

  /**
   * Add/replace a banner image for the project.
   *
   * @param {File[]} files An array of File objects.
   * @return {void}
   */
  public updateBannerDocument(files: File[]): void {
    if (files && files[0]) {
      this.bannerImageDocument = new Document();
      this.bannerImageDocument._id = '';
      this.bannerImageDocument.upfile = files[0];
      this.bannerImageDocument.documentFileName = files[0].name;
      this.removeBannerImage = false;
      this.bannerImageModified = true;

      this._changeDetectorRef.detectChanges();
    }
  }

  /**
   * Delete the banner image by "unassigning" it from bannerImageDocument.
   *
   * @return {void}
   */
  public deleteBannerDocument() {
    this.bannerImageDocument = null;
  }

  public addDocuments(files: FileList) {
    if (files) { // safety check
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          // ensure file is not already in the list

          if (this.shapefileDocuments.find(x => x.documentFileName === files[i].name)) {
            // this.snackBarRef = this.snackBar.open('Can\'t add duplicate file', null, { duration: 2000 });
            continue;
          }

          this.projectFiles.push(files[i]);

          const document = new Document();
          document.upfile = files[i];
          document.documentFileName = files[i].name;

          // save document for upload to db when project is added or saved
          this.shapefileDocuments.push(document);
          this.shapefilesModified = true;
        }
      }
    }
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Makes a call to the delete document endpoint, then removes the document from the view.
   *
   * @param {Document} doc The document to delete.
   * @returns {void}
   */
  public deleteDocument(doc: Document): void {
    if (doc && this.shapefileDocuments) {
      this.documentService.delete(doc)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
            res => {
              // Remove doc from current list.
              this.projectFiles = this.projectFiles.filter(item => (item.name !== doc.documentFileName));
              this.shapefileDocuments = this.shapefileDocuments.filter(item => (item.documentFileName !== doc.documentFileName));
              this.shapefilesModified = true;
            },
            error => {
              console.error(error);
              alert('Uh-oh, couldn\'t delete shapefile.');
            }
        );
    }
  }

  /**
   * Opens a new snack bar notification message with a duration of 2 seconds, and executes an action
   *
   * @param {string} message A snack bar notification message.
   * @param {string} action A snack bar notification action.
   * @returns {void}
   */
  public openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  /**
   * Uses the CK Editor (ready) to link a file upload handler to the
   * CK Editor instance.
   *
   * @param eventData Object type added and used by CK Editor
   * @returns {Promise}
   */
  public editorOnReady(eventData): void {
    // We need to grab our vars explicitely and pass them through to the CK Editor function.
    const projectId = this.projectId;
    const documentService = this.documentService;
    const pathAPI = this.pathAPI;
    eventData.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new CkUploadAdapter(loader, projectId, documentService, pathAPI);
    };
  }

  /**
   * Unsubscribe from observables
   *
   * @returns {null}
   */
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
