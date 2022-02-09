import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as Editor from 'assets/ckeditor5/build/ckeditor';
import { isEmpty } from 'lodash';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { StorageService } from 'app/services/storage.service';
import { ProjectService } from 'app/services/project.service';
import { DocumentService } from 'app/services/document.service';
import { CkUploadAdapter } from 'app/shared/utils/ck-upload-adapter';
import { Project } from 'app/models/project';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';
import { ModalData } from 'app/shared/types/modal';
import { Document } from 'app/models/document';

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

  public projectName;
  public projectId;
  public project;

  public isEditing = false;

  public loading = true;
  public pathAPI: string;

  // Shape file upload
  public projectFiles: Array<File> = [];
  public shapefileDocuments: Document[] = [];

  public bannerImageDocument: Document;
  public removeBannerImage: boolean;
  public bannerImageSrc: string;

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

  ngOnInit() {
    this.route.data.subscribe((res: any) => {
      if (res) {
        if (res.documents && res.documents[0].data.meta && res.documents[0].data.meta.length > 0) {
          let returnedDocuments = res.documents[0].data.searchResults;
          this.shapefileDocuments = returnedDocuments.filter((document) => document.documentSource === 'SHAPEFILE' ? document : null )
          let bannerImageDocumentArray = returnedDocuments.filter((document) => document.documentSource === 'BANNER' ? document : null )
          this.bannerImageDocument = bannerImageDocumentArray[0];

          // The following items are loaded by a file that is only present on cluster builds.
          // Locally, this will be empty and local defaults will be used.
          const remote_api_path = window.localStorage.getItem('from_admin_server--remote_api_path');
          this.pathAPI = (isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;

          if (this.bannerImageDocument) {
            const safeName = this.bannerImageDocument.documentFileName.replace(/ /g, '_');
            this.bannerImageSrc = `${this.pathAPI}/document/${this.bannerImageDocument._id}/fetch/${safeName}`;
          }
        } else {
          this.shapefileDocuments = [];
          this.bannerImageDocument = null;
        }
      }
    });

    // Get data related to current project
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(data => {
        this.isEditing = Object.keys(data).length === 0 && data.constructor === Object ? false : true;

        if (this.storageService.state.projectLead) {
          this.projectLead = this.storageService.state.projectLead.name;
          this.projectLeadId = this.storageService.state.projectLead._id;
        } else if (this.isEditing && data.project.projectLead && data.project.projectLead._id && data.project.projectLead._id !== '') {
          this.projectLead = data.project.projectLead.displayName;
          this.projectLeadId = data.project.projectLead._id;
        }

        this.project = data.project;
        this.buildForm(data);
        this.loading = false;

        try {
          this._changeDetectorRef.detectChanges();
        } catch (e) {
          console.error('error:', e);
        }
      });

    this.back = this.storageService.state.back;
  }


  /**
   * After view init, listen for the file upload modal to close and check if it returned
   * files that can be saved in the Project.
   *
   * @todo Get returned data into project form.
   * @returns {void}
   */
  ngAfterViewInit(): void {
    this.ngxSmartModalService.getModal('file-upload-modal').onAnyCloseEventFinished.subscribe((modal: NgxSmartModalComponent) => {
      console.log('Returned data from file upload modal.', modal.getData());
    });
  }

  buildForm(resolverData) {
    if (this.storageService.state.form) {
      // TODO: Save the projectID if it was originally an edit.
      this.myForm = this.storageService.state.form;
    } else if (!(Object.keys(resolverData).length === 0 && resolverData.constructor === Object)) {
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
      this.addLinkFormGroup(this.agreements);
    }
  }

  get existingLandUsePlans() {
    return this.myForm.get('existingLandUsePlans') as FormArray;
  }

  get agreements() {
    return this.myForm.get('agreements') as FormArray;
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
      fileTypes: [ 'image/jpeg', 'image/png' ],
      projectID: this.projectId
    };

    this.ngxSmartModalService.setModalData( this.fileUploadModalData, 'file-upload-modal', true);
    this.ngxSmartModalService.open('file-upload-modal');
  }

  addLinkFormGroup(formEntry) {
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

  removeLinkFormGroup(formEntry, index) {
    formEntry.removeAt(index);
  }

  public formValueType(formValue) {
    return typeof formValue;
  }

  private setNavigation() {
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

  buildFormFromData(formData) {

    if (!formData.centroid) {
      formData.centroid = [-123.3656, 48.4284];
    }

    let existingPlansFormArray = (formData) => {
      let formArray = [];
      if (Array.isArray(formData.existingLandUsePlans)) {
        for (let i = 0; i < formData.existingLandUsePlans.length; i++ ) {
          formArray[i] = new FormGroup({
            'existingLandUsePlan': new FormControl(formData.existingLandUsePlans[i].existingLandUsePlan),
            'existingLandUsePlanURL': new FormControl(formData.existingLandUsePlans[i].existingLandUsePlanURL)
          })
        }
      } else {
        formArray.push(new FormGroup({
          'existingLandUsePlan': new FormControl(formData.existingLandUsePlans),
          'existingLandUsePlanURL': new FormControl(formData.existingLandUsePlanURLs)
        }))
      }
      return formArray;
    }

    let existingAgreementsArray = (formData) => {
      let formArray = [];
      if (Array.isArray(formData.agreements)) {
        for (let i = 0; i < formData.agreements.length; i++ ) {
          formArray[i] = new FormGroup({
            'agreementName': new FormControl(formData.agreements[i].agreementName),
            'agreementUrl': new FormControl(formData.agreements[i].agreementUrl)
          })
        }
      } else {
        formArray.push(new FormGroup({
          'agreementName': new FormControl(formData.agreements),
          'agreementUrl': new FormControl()
        }))
      }
      return formArray;
    }

    let overlappingDistrictsArray = (formData) => {
      let formArray = [];
      if (Array.isArray(formData.overlappingRegionalDistricts)) {
        formArray = formData.overlappingRegionalDistricts;
      } else {
        formArray.push(formData.overlappingRegionalDistricts);
      }
      return formArray;
    }


    let theForm = new FormGroup({
      'name': new FormControl(formData.name),
      'partner': new FormControl(formData.partner),
      'description': new FormControl(formData.description),
      'details': new FormControl(formData.details),
      'overlappingRegionalDistricts': new FormControl(overlappingDistrictsArray(formData)),
      'region': new FormControl(formData.region),
      'lat': new FormControl(formData.centroid[1]),
      'lon': new FormControl(formData.centroid[0]),
      'addFile': new FormControl(formData.addFile),
      'ea': new FormControl(formData.ea),
      'status': new FormControl(formData.status),
      'backgroundInfo': new FormControl(formData.backgroundInfo),
      'engagementLabel': new FormControl(formData.engagementLabel),
      'engagementInfo': new FormControl(formData.engagementInfo),
      'documentInfo': new FormControl(formData.documentInfo),
      'projectPhase': new FormControl(formData.projectPhase),
      'projectDirector': new FormControl(formData.projectDirector),
      'projectLead': new FormControl(formData.projectLead),
      'projectAdmin': new FormControl(formData.projectAdmin)
    });

    theForm.addControl('existingLandUsePlans', new FormArray(existingPlansFormArray(formData)));
    theForm.addControl('agreements', new FormArray(existingAgreementsArray(formData)));

    return theForm;
  }

  onCancel() {
    this.clearStorageService();
    if (this.back && this.back.url) {
      this.router.navigate(this.back.url);
    } else {
      this.router.navigate(['/projects']);
    }
  }

  convertFormToProject(form) {
    return {
      'name': form.controls.name.value,
      'partner': form.controls.partner.value,
      'agreements': this.agreementsFullFields(),
      'description': form.controls.description.value,
      'details': form.controls.details.value,
      'overlappingRegionalDistricts': form.controls.overlappingRegionalDistricts.value,
      'region': form.controls.region.value,
      'centroid': [form.get('lon').value, form.get('lat').value],
      'addFile': form.controls.addFile.value,
      'existingLandUsePlans': this.existingPlanFullFields(),
      'ea': form.controls.ea.value,
      'status': form.controls.status.value,
      'backgroundInfo': form.controls.backgroundInfo.value,
      'engagementLabel': form.controls.engagementLabel.value,
      'engagementInfo': form.controls.engagementInfo.value,
      'documentInfo': form.controls.documentInfo.value,
      'projectPhase': form.controls.projectPhase.value,
      'projectDirector': this.projectDirectorId,
      'projectLead': this.projectLeadId,
      'projectAdmin': form.controls.projectAdmin.value
    };
  }

  private clearStorageService() {
    this.storageService.state.form = null;
    this.storageService.state.selectedOrganization = null;
    this.storageService.state.projectLead = null;
    this.storageService.state.projectDirector = null;
    this.storageService.state.contactType = null;
    this.navigationStackUtils.popNavigationStack();
  }

  public linkOrganization() {
    this.storageService.state.form = this.myForm;
    this.setNavigation();
    if (!this.isEditing) {
      this.router.navigate(['/projects', 'add', 'link-org']);
    } else {
      this.router.navigate(['/p', this.project._id, 'edit', 'link-org']);
    }
  }

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

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    if (!this.isEditing) {
      // POST
      let project = new Project(
        this.convertFormToProject(this.myForm)
      );
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
          () => { // onCompleted
            this.clearStorageService();
            this.loading = false;
            // this.openSnackBar('This project was created successfuly.', 'Close');
            this.router.navigate(['/p', this.projectId, 'project-details']);
          }
        );

        if (this.bannerImageDocument && ! this.removeBannerImage) {
          const bannerImageFormData = new FormData();
          bannerImageFormData.append('upfile', this.bannerImageDocument.upfile);
          bannerImageFormData.append('project', this.project._id);
          bannerImageFormData.append('documentFileName', this.bannerImageDocument.documentFileName);
          bannerImageFormData.append('displayName',  this.bannerImageDocument.documentFileName);
          bannerImageFormData.append('documentSource', 'BANNER');

          this.documentService.add(bannerImageFormData)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            (res) => {
              // do nothing here - see onCompleted() function below
              this.documentService.publish(res._id)
              .takeUntil(this.ngUnsubscribe)
              .subscribe(
                res => res,
                error => {
                  console.error('error = ', error);
                  alert('Could not publish banner image. Please publish manually in project documents section.');
                }
                )
              },
              error => {
                console.error('error = ', error);
                alert('Uh-oh, couldn\'t save shapefile.');
                // TODO: should fully reload project here so we have latest non-deleted objects
              },
              () => { // onCompleted
                // delete succeeded --> navigate back to search
                // Clear out the document state that was stored previously.
              }
              )
        }
    } else {
      // PUT
      let project = new Project(this.convertFormToProject(this.myForm));
      project._id = this.project._id;
      let observables = [];
      this.shapefileDocuments.forEach(doc => {
        const formData = new FormData();
        formData.append('upfile', doc.upfile);
        formData.append('project', this.project._id);
        formData.append('documentFileName', doc.documentFileName);
        formData.append('displayName',  doc.documentFileName);
        formData.append('documentSource', 'SHAPEFILE');
        observables.push(this.documentService.add(formData));
        observables.push(this.documentService.publish(doc._id));
      });
      if ( this.bannerImageDocument && ! this.removeBannerImage ) {

        const bannerImageFormData = new FormData();
        bannerImageFormData.append('upfile', this.bannerImageDocument.upfile);
        bannerImageFormData.append('project', this.project._id);
        bannerImageFormData.append('documentFileName', this.bannerImageDocument.documentFileName);
        bannerImageFormData.append('displayName',  this.bannerImageDocument.documentFileName);
        bannerImageFormData.append('documentSource', 'BANNER');
        this.documentService.add(bannerImageFormData)
        // .takeUntil(this.ngUnsubscribe)
        .subscribe(
          (res) => {
            // do nothing here - see onCompleted() function below
            this.documentService.publish(res._id)
            // .takeUntil(this.ngUnsubscribe)
            .subscribe(
              res => res,
              error => {
                alert('Could not publish banner image. Please publish manually in project documents section.');
              }
              )
            },
            error => {
              alert('Uh-oh, couldn\'t save shapefile.');
            },
            () => {}
            )

      } else if (this.bannerImageDocument && this.removeBannerImage) {
        this.documentService.delete(this.bannerImageDocument)
          .subscribe(res => res,
          error => {
            alert('Could not delete banner image. Please delete manually in project documents section.');
          })
      }
      forkJoin(observables)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { // onNext
            // Do nothing here - see onCompleted() function below.
          },
          error => {
            console.error('error =', error);
            alert('Uh-oh, couldn\'t save shapefile.');
            // TODO: should fully reload project here so we have latest non-deleted objects.
          },
          () => { // onCompleted.
            // Delete succeeded --> navigate back to search.
            // Clear out the document state that was stored previously.
          }
        );
      this.projectService.save(project)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { // onCompleted.
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
  }

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

  public addBannerDocument(files) {
    if (files && files[0]) {
      this.bannerImageDocument = new Document();
      this.bannerImageDocument.upfile = files[0];
      this.bannerImageDocument.documentFileName = files[0].name;
      this.removeBannerImage = false;

      this._changeDetectorRef.detectChanges();
    }
  }

  public deleteBannerDocument(doc: Document) {
    if (doc && this.bannerImageDocument) {
      this.removeBannerImage = true;
    }
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
        }
      }
    }
    this._changeDetectorRef.detectChanges();
  }

  public deleteDocument(doc: Document) {
    if (doc && this.shapefileDocuments) { // Safety check.
      // Remove doc from current list.
      this.projectFiles = this.projectFiles.filter(item => (item.name !== doc.documentFileName));
      this.shapefileDocuments = this.shapefileDocuments.filter(item => (item.documentFileName !== doc.documentFileName));
    }
  }

  public openSnackBar(message: string, action: string) {
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

  register(myForm: FormGroup) { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
