import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { Subject, forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as Editor from 'assets/ckeditor5/build/ckeditor';
import { isEmpty } from 'lodash';
import { StorageService } from 'app/services/storage.service';
import { ProjectService } from 'app/services/project.service';
import { DocumentService } from 'app/services/document.service';
import { CkUploadAdapter } from 'app/shared/utils/ck-upload-adapter';
import { Project, ProjectType, ProjectShapefileOrDocument } from 'app/models/project';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';
import { ModalData } from 'app/shared/types/modal';
import { Document, DocumentSourceEnum } from 'app/models/document';
import { HttpErrorResponse } from '@angular/common/http';
import { Constants } from 'app/shared/utils/constants';

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


	public chosenPhases: Array<string>;
  public projectTypes: Array<ProjectType> = [
    {name: 'Land Use Planning', checked: false},
    {name: 'Forest Landscape Planning', checked: false},
    {name: 'Water Planning and Governance', checked: false}
  ];

  public projectName: string;
  public projectId: string;
  public project: Project;

  public isEditing = false;

  public loading = true;
  public pathAPI: string;

  // Options
  public activitiesAndUpdatesEnabled = false;

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
    // Get data related to current project
    this.route.parent.data
    .takeUntil(this.ngUnsubscribe)
    .subscribe((data: { project: Project }) => {
      if (data.project) {
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

        // Look for shapefiles and banner images.
        this.route.data.subscribe((res: any) => {
          if (res && res.documents && res.documents[0].data.meta && res.documents[0].data.meta.length > 0) {
            const returnedDocuments = res.documents[0].data.searchResults;
            this.shapefileDocuments = returnedDocuments.filter((document) => document.documentSource === 'SHAPEFILE' ? document : null );
            this.allBannerImageDocuments = returnedDocuments.filter((document) => document.documentSource === 'BANNER' ? document : null );
            this.bannerImageDocument = this.allBannerImageDocuments.find((doc) => doc._id === this.project.backgroundImage);

            // The following items are loaded by a file that is only present on cluster builds.
            // Locally, this will be empty and local defaults will be used.
            const remote_api_path = window.localStorage.getItem('from_admin_server--remote_api_path');
            this.pathAPI = (isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;

            this.loading = false;
          } else {
            this.loading = false;
          }
        });

        this.buildForm(data);

        // After all data is fetched and form is built, check for changes and refresh view.
        try {
          this._changeDetectorRef.detectChanges();
        } catch (e) {
          console.error('Error checking for latest data:', e);
        }
      } else {
        this.buildForm();
        this.shapefileDocuments = [];
        this.allBannerImageDocuments = null;

        /**
         * When a user selects a project lead(and is taken to a new window),
         * make sure the project lead is brought over.
         **/
        if (this.storageService.state.projectLead) {
          this.projectLead = this.storageService.state.projectLead.name;
          this.projectLeadId = this.storageService.state.projectLead._id;
        }

        this.loading = false;
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
   * project logos or to the shapefile documents.
   *
   * @returns {void}
   */
  ngAfterViewInit(): void {
    this.ngxSmartModalService.getModal('file-upload-modal').onAnyCloseEventFinished.subscribe((modal: NgxSmartModalComponent) => {
      const modalData = modal.getData();
      if (modalData?.returnedFiles) {
        if (modalData?.slug === 'logos') {
          this.logos.clear();
          modalData.returnedFiles.forEach(file => {
            this.logos.push(new FormGroup({
              'document': new FormControl(file._id),
              'name': new FormControl(file.documentFileName),
              'alt': new FormControl(file.alt),
              'link': new FormControl('')
            }));
          });
        } else if (modalData?.slug === 'shapefiles') {
          modalData.returnedFiles.forEach(file => {
            this.shapefiles.push(new FormGroup({
              'document': new FormControl(file._id),
              'documentFileName': new FormControl(file.documentFileName),
              'title': new FormControl(''),
              'showOnMapPage': new FormControl(false),
              'order': new FormControl(''),
              'colour': new FormControl('#2e86e4'),
            }));
          });
        }
      }
    });

  }

  /**
   * Build project edit form either from local storage, from route
   * resolver data, or a new empty form (if user is adding a new project).
   *
   * @param {object} resolverData The route resolved data to build into a form.
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
        'shapeFileColour': new FormControl('#2e86e4'),
        'existingLandUsePlans': new FormArray([]),
        'ea': new FormControl(),
        'capital': new FormControl(),
        'notes': new FormControl(),
        'status': new FormControl(),
        'logos': new FormArray([]),
        'shapefiles': new FormArray([]),
        'backgroundInfo': new FormControl(),
        'engagementLabel': new FormControl(),
        'engagementInfo': new FormControl(),
        'documentInfo': new FormControl(),
        'projectPhase': new FormControl(),
        'projectTypes': new FormControl(this.projectTypes),
        'projectDirector': new FormControl(),
        'projectLead': new FormControl(),
        'projectAdmin': new FormControl(),
        'activitiesAndUpdatesEnabled': new FormControl(),
        'contactFormEnabled': new FormControl(),
        'contactFormFilesEnabled': new FormControl(),
        'contactFormEmails': new FormArray([new FormControl()]),
        'collectionNotice': new FormControl(),
      });
      // set a default colour
      this.myForm.controls.shapeFileColour.setValue('#2e86e4');
      // set default values
			this.chosenPhases = Constants.DEFAULT_PHASES;
    }
  }

  /**
   * Getter to be able to access the existingLandUsePlans FormControl
   * as a FormArray.
   *
   * @returns {FormArray}
   */
  get existingLandUsePlans(): FormArray {
    return this.myForm.get('existingLandUsePlans') as FormArray;
  }

  /**
   * Getter to be able to access the agreements FormControl
   * as a FormArray.
   *
   * @returns {FormArray}
   */
  get agreements(): FormArray {
    return this.myForm.get('agreements') as FormArray;
  }

  /**
   * Getter to be able to access the logos FormControl
   * as a FormArray.
   *
   * @returns {FormArray}
   */
  get logos(): FormArray {
    return this.myForm.get('logos') as FormArray;
  }

  /**
   * Getter to be able to access the shapefiles FormControl
   * as a FormArray.
   *
   * @returns {FormArray}
   */
  get shapefiles(): FormArray {
    return this.myForm.get('shapefiles') as FormArray;
  }

  /**
   * Getter to be able to access the contactFormEmails FormControl
   * as a FormArray.
   *
   * @returns {FormArray}
   */
  get contactFormEmails(): FormArray {
    return this.myForm.get('contactFormEmails') as FormArray;
  }

  /**
   * Set the modal data and launch file upload modal.
   * 
   * @param slug The slug title for the modal dialog
   * @param title The title for the modal dialog
   * @param altRequired Is alt text required, true or false
   * @param fileExt Accepted file extension
   * @param fileTypes Accepted file types
   * @param fileNum Maximum file count
   * @param documentSource Where you're opening the file upload from
   *
   * @returns {void}
   */
  launchFilePicker(slug: string, title: string, altRequired: boolean, fileExt: string, fileTypes: string[], fileNum: number, documentSource: string): void {
    this.fileUploadModalData = {
      slug: slug,
      title: title,
      altRequired: altRequired,
      fileNum: fileNum,
      fileExt: fileExt,
      documentSource: DocumentSourceEnum[documentSource],
      maxSize: 0.5,
      fileTypes: fileTypes,
      projectID: this.projectId
    };

    this.ngxSmartModalService.setModalData( this.fileUploadModalData, 'file-upload-modal', true);
    this.ngxSmartModalService.open('file-upload-modal');
  }

  /**
   * Add a form group to a specific form array.
   *
   * @param {FormArray} formEntry Specific form array to populate with a new FormGroup.
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
    if (formEntry === this.contactFormEmails) {
      formEntry.push(new FormControl(''))
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
   * Clear the selected shapefiles and the associated information.
   * 
   * @param formArrayIndex The index of the shapefile that you wish to remove
   *
   * @returns {void}
   */
  handleRemoveShapefile(formArrayIndex: number): void {
    this.shapefiles.removeAt(formArrayIndex);
  }

  /**
   * Remove an element from a form array.
   *
   * @param {FormArray} formArray The form to remove an item from.
   * @param {number} index The index of the item to remove.
   * @returns {void}
   */
  removeItemFromFormArray(formArray: FormArray, index: number): void {
    formArray.removeAt(index);
  }

  /**
   * Return the type of the value currently filled into the form.
   *
   * @param {any} formValue The value of the form to check the type of.
   * @returns {string} The type of form control.
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
   * @param {Project} projectData The project to build the form with.
   * @returns {FormGroup[]} The existing land use plans form group array.
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
   * @param {Project} projectData The project data to build the form with.
   * @returns {FormGroup[]} The array of existing land agreements form groups.
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
    }
    return formArray;
  }

  /**
   * Build an array of form groups of overlapping regional districts from project data.
   *
   * @param {Project} projectData The project to build the form with.
   * @returns {Array} The array of overlapping regional districts form groups.
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
   * @param {Project} projectData The project data to build the logos form array with.
   * @returns {FormGroup[]} The array of logo form groups.
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
   * Build a an array of form groups to add as a form array to the main
   * project form.
   *
   * @param {Project} projectData The project data to build the shapfile form array with.
   * @returns {FormGroup[]} The array of shapefile form groups.
   */
    buildShapefilesFormArray(projectData: Project): FormGroup[] {
      let shapefilesToFillFormWith = this.shapefileDocuments as unknown as ProjectShapefileOrDocument[];
      
      if (Array.isArray(projectData.shapefiles) && projectData.shapefiles.length > 0) {
        shapefilesToFillFormWith = projectData.shapefiles;
      }

      return shapefilesToFillFormWith.map(shapefile => {
        return new FormGroup({
          'document': new FormControl(shapefile?.document || shapefile?._id),
          'documentFileName': new FormControl(shapefile.documentFileName),
          'title': new FormControl(shapefile?.title || ''),
          'showOnMapPage': new FormControl(shapefile?.showOnMapPage || false),
          'colour': new FormControl(shapefile?.colour || projectData?.shapeFileColour || '#2e86e4'),
          'order': new FormControl(shapefile?.order || '')
        })
      })
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
    
		// Choose which project phase list is shown: regular phases or forest phases.
    if (projectData.projectTypes) {
      this.projectTypes = projectData.projectTypes || this.projectTypes;
      this.chosenPhases = projectData.projectTypes?.find((type) => 'Forest Landscape Planning' === type.name)?.checked ? Constants.FOREST_PHASES : Constants.DEFAULT_PHASES;
    } else {
      this.chosenPhases = Constants.DEFAULT_PHASES;
    }

    // Remove the project phase value from the project if it doesn't exist in the chosen list of phases
    projectData.projectPhase = this.chosenPhases.includes(projectData.projectPhase?.toString()) ? projectData.projectPhase : '';

    const contactformEmailControls = Array.isArray(projectData.contactFormEmails) ? projectData.contactFormEmails.map(email => new FormControl(email)) : [];
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
      'shapeFileColour': new FormControl(projectData.shapeFileColour),
      'logos': new FormArray(this.buildLogosFormArray(projectData)),
      'shapefiles' : new FormArray(this.buildShapefilesFormArray(projectData)),
      'backgroundInfo': new FormControl(projectData.backgroundInfo),
      'engagementLabel': new FormControl(projectData.engagementLabel),
      'engagementInfo': new FormControl(projectData.engagementInfo),
      'documentInfo': new FormControl(projectData.documentInfo),
      'projectPhase': new FormControl(projectData.projectPhase || ''),
      'projectTypes': new FormControl(projectData.projectTypes || this.projectTypes),
      'projectDirector': new FormControl(projectData.projectDirector),
      'projectLead': new FormControl(projectData.projectLead),
      'activitiesAndUpdatesEnabled': new FormControl(projectData.activitiesAndUpdatesEnabled),
      'contactFormEnabled': new FormControl(projectData.contactFormEnabled),
      'contactFormFilesEnabled': new FormControl(projectData.contactFormFilesEnabled),
      'contactFormEmails': new FormArray(contactformEmailControls),
      'collectionNotice': new FormControl(projectData.collectionNotice),
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
   * @param {FormGroup} form Form group to build project with.
   * @returns {Project} The project from the current form values.
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
      'shapeFileColour': form.controls.shapeFileColour.value,
      'centroid': [form.get('lon').value, form.get('lat').value],
      'existingLandUsePlans': this.existingPlanFullFields(),
      'logos': this.getLogosFormValues(),
      'shapefiles': this.getShapefilesFormValues(),
      'backgroundInfo': form.controls.backgroundInfo.value,
      'engagementLabel': form.controls.engagementLabel.value,
      'engagementInfo': form.controls.engagementInfo.value,
      'documentInfo': form.controls.documentInfo.value,
      'projectPhase': form.controls.projectPhase.value,
      'projectTypes': this.getTypesFormValues(),
      'projectDirector': this.projectDirectorId,
      'projectLead': this.projectLeadId,
      'activitiesAndUpdatesEnabled': form.controls.activitiesAndUpdatesEnabled.value,
      'contactFormEnabled': form.controls.contactFormEnabled.value,
      'contactFormFilesEnabled': form.controls.contactFormFilesEnabled.value || false,
      'contactFormEmails': this.getContactFormEmailsFormValues(),
      'collectionNotice': form.controls.collectionNotice.value,
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
   * @param {string} contact The selected contact.
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
   * @returns {Array}
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
   * @returns {Array}
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
   * @returns {Array} Array of logos objects.
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
   * Takes the project shapefiles FormArray and gets the data from it.
   *
   * @returns {Array} Array of shapefiles objects.
   */
    private getShapefilesFormValues(): Project['shapefiles'] {
      return this.shapefiles.controls.map((shapefile: FormGroup) => ({
          document: shapefile.controls.document.value,
          documentFileName: shapefile.controls.documentFileName.value,
          title: shapefile.controls.title.value,
          showOnMapPage: shapefile.controls.showOnMapPage.value,
          colour: shapefile.controls.colour.value,
          order: shapefile.controls.order.value
      }));
    }

  /**
   * Takes the project type form values and retrieves the data.
   *
   * @returns {Array} Array of project type strings.
   */
  private getTypesFormValues(): ProjectType[] {
    return this.myForm.value.projectTypes.map((projectType: ProjectType) => {
      return {
        name: projectType.name,
        checked: projectType.checked,
      }
    })
  }

  /**
   * Takes the project contactFormEmails FormArray and gets the data from it.
   *
   * @returns {Array} Array of emails.
   */
  private getContactFormEmailsFormValues(): Project['contactFormEmails'] {
    return this.contactFormEmails.controls.map((email: FormControl) => email.value);
  }

  /**
   * Handle the selected logos or shapefiles. 
   * Newly added files will be published.
   * Newly removed files will be deleted.
   * 
   * @param source Shapefiles or logos
   *
   * @returns {Promise<void>}
   */
  private async handleImageFileChanges(source: string): Promise<void> {

    const originalFiles: { document: string }[] = 'shapefiles' === source ? this.project.shapefiles : this.project.logos;
    let newFiles: string[] = [];

    if ('logos' === source) {
      const logoValues = this.getLogosFormValues();
      newFiles = logoValues.map(logo => logo.document);
    } else if ('shapefiles' === source) {
      const shapefileValues = this.getShapefilesFormValues();
      newFiles = shapefileValues.map(shapefile => shapefile.document);
    }

    // Remove files from Minio that have been removed from the project
    if (originalFiles?.some(file => !newFiles.includes(file.document))) {
      try {
        const removedFiles = originalFiles.filter(ogf => !newFiles.includes(ogf.document));
        removedFiles.forEach(rf => {
          this.documentService.delete(rf.document).subscribe({
            next: () => {}, // No action on success
            error: err => {
              console.error('Failed to delete:', rf.document, err);
            }
          });
        });
      } catch (e) {
        console.error('Unable to delete files', e);
      }
    }

    // Publish only new files
    const newFileIds = newFiles.filter(
      fileId => !originalFiles.some(ogf => ogf.document === fileId)
    );

    if (newFileIds.length > 0) {
      const publishRequests = newFileIds.map(id =>
        this.documentService.publish(id).pipe(
          catchError(err => of(err)) // catch individual errors and emit them
        )
      );

      forkJoin(publishRequests).subscribe({
        next: responses => {
          const failed = responses.filter(
            res => res instanceof HttpErrorResponse && (res.status === 400 || res.status === 500)
          );
          if (failed.length) {
            console.error('One or more publish requests failed:', failed);
            alert('There was a problem publishing one or more of the selected logos/shapefiles.');
          }
        },
        error: err => {
          console.error('Error during publishing:', err);
          alert('There was a problem publishing files.');
        }
      });
    }
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
   * @param {FormData} bannerImageFormData The banner image form data to send as a request to the API.
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

      // Handle changes to logo files (publish or delete).
      this.handleImageFileChanges('logos');

      // Handle changes to shape files (publish or delete).
      this.handleImageFileChanges('shapefiles');

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
        const bannerImageFormData = this.getBannerImageFormData();
        bannerImageFormData.append('project', this.project._id);

        this.documentService.delete(this.project.backgroundImage)
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
        if (this.project.backgroundImage) {
          this.documentService.delete(this.project.backgroundImage)
            .subscribe(
              (res) => {
                // Remove the background image value now that it's been deleted.
                project.backgroundImage = null;
                this.updateExistingProject(project);
              },
              (error) => {
                alert('Could not delete banner image. Please delete manually in project documents section.');
              });
        } else {
          this.updateExistingProject(project);
        }
      } else {
        this.updateExistingProject(project);
      }

      // Handle changes to logo files (publish or delete).
      this.handleImageFileChanges('logos');
      
      // Handle changes to shape files (publish or delete).
      this.handleImageFileChanges('shapefiles');

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

  /**
   * Loop through the added documents(files) and convert them to Document
   * objects.
   *
   * @param {FileList} files
   * @return {void}
   */
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
   * @param docId The document to delete by ID.
   * @param fileType The type of file to delete. Appears to the user once the delete call completes.
   * @param formArrayIndex If the document is a part of a FormArray, the location to remove it at.
   */
  public deleteDocument(docId: string, fileType: string, formArrayIndex?: number): void {
    this.documentService.delete(docId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
          res => {
            this.shapefiles.removeAt(formArrayIndex);
            this.shapefilesModified = true;
            this.openSnackBar(`The ${fileType} was deleted.`, 'Close');
          },
          error => {
            console.error(`Error deleting ${fileType}`, error);
            alert(`Uh-oh, couldn't delete ${fileType}. Please delete manually in Files.`);
          }
      );
  }

  /**
   * Opens a new snack bar notification message with a duration of 2 seconds, and executes an action.
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
   * @param {CKEDITOR} eventData Object type added and used by CK Editor.
   * @returns {Promise}
   */
  public editorOnReady(eventData) {
    // We need to grab our vars explicitely and pass them through to the CK Editor function.
    const projectId = this.projectId;
    const documentService = this.documentService;
    const pathAPI = this.pathAPI;
    eventData.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new CkUploadAdapter(loader, projectId, documentService, pathAPI);
    };
  }

  public handleProjectTypesChange(eventData, index) {
    this.myForm.value.projectTypes[index].checked = eventData.checked;

		// If the form's project types have 'Forest Landscape Planning' checked, make sure we display forest project phases.
		// Select value will be changed to first in new list but form value will be blank, so we need to manually update the form value.
		const forestTypeIsChecked = this.myForm.value.projectTypes?.[1]?.checked ? true : false;
		if (forestTypeIsChecked && this.chosenPhases !== Constants.FOREST_PHASES) {
			this.chosenPhases = Constants.FOREST_PHASES;
			this.myForm.controls.projectPhase.setValue("");
		} else if (!forestTypeIsChecked && this.chosenPhases !== Constants.DEFAULT_PHASES) { // Show default project phases.
			this.chosenPhases = Constants.DEFAULT_PHASES;
			this.myForm.controls.projectPhase.setValue("");
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
}
