import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';

import { CommentPeriod } from 'app/models/commentPeriod';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Subject } from 'rxjs/Subject';
import { MatSnackBar } from '@angular/material';
import { ConfigService } from 'app/services/config.service';
import { Utils } from 'app/shared/utils/utils';
import { StorageService } from 'app/services/storage.service';
import { DocumentService } from 'app/services/document.service';

@Component({
  selector: 'app-add-edit-comment-period',
  templateUrl: './add-edit-comment-period.component.html',
  styleUrls: ['./add-edit-comment-period.component.scss']
})

export class AddEditCommentPeriodComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public projectName;
  public projectId;
  public commentPeriod = new CommentPeriod;
  public milestones: any[] = [];

  public isEditing = false;

  public infoForCommentPreview = '%information for comment%';
  public descriptionPreview = '%description%';

  public publishedState = 'unpublished';
  public commentPeriodForm: FormGroup;

  public loading = true;

  constructor(
    private route: ActivatedRoute,
    private commentPeriodService: CommentPeriodService,
    private config: ConfigService,
    private documentService: DocumentService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    public storageService: StorageService,
    private utils: Utils
  ) { }

  ngOnInit() {
    // BUG: Go to add docs. refresh. it will redirect and have errors.

    // Check if we're editing
    this.route.url.subscribe(segments => {
      segments.forEach(segment => {
        if (segment.path === 'edit') {
          this.isEditing = true;
          // get data from route resolver
          this.route.data
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              (data: any) => {
                if (data.commentPeriod) {
                  this.commentPeriod = data.commentPeriod;
                  this.storageService.state.currentCommentPeriod = { type: 'currentCommentPeriod', data: this.commentPeriod };

                  this.initSelectedDocs();
                } else {
                  alert('Uh-oh, couldn\'t load comment periods');
                  // project not found --> navigate back to search
                  this.router.navigate(['/search']);
                }
              }
            );
        }
      });
    });

    // Get data related to current project
    this.projectId = this.storageService.state.currentProject.data._id;
    this.projectName = this.storageService.state.currentProject.data.name;

    this.config.lists.map(item => {
      switch (item.type) {
        case 'doctype':
          break;
        case 'author':
          break;
        case 'label':
          this.milestones.push(Object.assign({}, item));
          break;
      }
    });

    if (this.storageService.state.addEditCPForm == null) {
      // Prep comment period form.
      this.commentPeriodForm = new FormGroup({
        'startDate': new FormControl(),
        'endDate': new FormControl(),
        'publishedStateSel': new FormControl(),
        'infoForCommentText': new FormControl(),
        'descriptionText': new FormControl(),
        'milestoneSel': new FormControl(),
        openHouses: this.formBuilder.array([])
      });
      if (this.isEditing) {
        this.initForEditing();
      } else {
        this.addOpenHouseRow();
        if (this.storageService.state.selectedDocumentsForCP == null) {
          this.storageService.state.selectedDocumentsForCP = { type: 'selectedDocumentsForCP', data: [] };
        }
      }
    } else {
      this.commentPeriodForm = this.storageService.state.addEditCPForm.data;
    }

    this.loading = false;
  }

  private initForEditing() {
    // Date started and completed
    this.commentPeriodForm.controls.startDate.setValue(this.utils.convertJSDateToNGBDate(this.commentPeriod.dateStarted));
    this.commentPeriodForm.controls.endDate.setValue(this.utils.convertJSDateToNGBDate(this.commentPeriod.dateCompleted));

    // Publish state
    this.commentPeriodForm.controls.publishedStateSel.setValue(this.commentPeriod.isPublished ? 'published' : 'unpublished');

    // Instructions
    this.extractVarsFromInstructions(this.commentPeriod.instructions, this.commentPeriodForm);

    // Milestone
    this.commentPeriodForm.controls.milestoneSel.setValue(this.commentPeriod.milestone);

    // Open houses
    if (this.commentPeriod.openHouses.length > 0) {
      this.commentPeriod.openHouses.forEach(openHouse => {
        this.addOpenHouseRowWithFields(
          this.formBuilder.group({
            eventDate: this.utils.convertJSDateToNGBDate(new Date(openHouse['eventDate'])),
            description: openHouse['description']
          })
        );
      });
    } else {
      this.addOpenHouseRow();
    }
  }

  private initSelectedDocs() {
    if (this.storageService.state.selectedDocumentsForCP == null) {
      if (this.commentPeriod.relatedDocuments) {
        this.documentService.getByMultiId(this.commentPeriod.relatedDocuments)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            data => {
              this.storageService.state.selectedDocumentsForCP = { type: 'selectedDocumentsForCP', data: data };
            }
          );
      } else {
        this.storageService.state.selectedDocumentsForCP = { type: 'selectedDocumentsForCP', data: this.commentPeriod.relatedDocuments };
      }
    }
  }

  public onSubmit() {
    this.loading = true;
    // TODO: Calulator integration.
    // TODO: Custom validation for start and end date.

    // Check start and end date
    this.commentPeriod.dateStarted = this.utils.convertFormGroupNGBDateToJSDate(this.commentPeriodForm.get('startDate').value);
    this.commentPeriod.dateCompleted = this.utils.convertFormGroupNGBDateToJSDate(this.commentPeriodForm.get('endDate').value);

    // Check published state
    // TODO: This should only be in the API.
    this.commentPeriod.read = ['staff', 'sysadmin'];
    this.commentPeriod.write = ['staff', 'sysadmin'];
    this.commentPeriod.delete = ['staff', 'sysadmin'];
    if (this.commentPeriodForm.get('publishedStateSel').value === 'published') {
      this.commentPeriod.read.push('public');
    }

    // Check info for comment
    // Check description
    this.commentPeriod.instructions = `Comment Period on the ${this.commentPeriodForm.get('infoForCommentText').value}`;
    this.commentPeriod.instructions += ` for ${this.projectName} Project. `;
    this.commentPeriod.instructions += this.commentPeriodForm.get('descriptionText').value;

    let docIdArray = [];
    this.storageService.state.selectedDocumentsForCP.data.forEach(element => {
      docIdArray.push(element._id);
    });
    this.commentPeriod.relatedDocuments = docIdArray;

    // Check milestones
    this.commentPeriod.milestone = this.commentPeriodForm.get('milestoneSel').value;

    // Check open house date
    this.commentPeriod.openHouses = [];
    this.commentPeriodForm.get('openHouses').value.forEach(openHouse => {
      if (openHouse.description !== null && openHouse.eventDate !== null) {
        this.commentPeriod.openHouses.push({
          description: openHouse.description,
          eventDate: this.utils.convertFormGroupNGBDateToJSDate(openHouse.eventDate)
        });
      } else if (openHouse.description !== null || openHouse.eventDate !== null) {
        // TODO: We should use form errors.
        this.openSnackBar('Error: Both description and event date must not be empty.', 'Close');
        return;
      }
    });

    // Submit
    if (this.isEditing) {
      this.commentPeriod.project = this.projectId;
      this.commentPeriodService.save(this.commentPeriod)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            console.log('error =', error);
            alert('Uh-oh, couldn\'t edit comment period');
          },
          () => { // onCompleted
            this.loading = false;
            this.openSnackBar('This comment period was created successfuly.', 'Close');
            this.router.navigate(['/p', this.projectId, 'cp', this.commentPeriod._id]);
          }
        );
    } else {
      console.log('Attenpting to add comment period:', this.commentPeriod);
      this.commentPeriodService.add(this.commentPeriod)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            console.log('error =', error);
            alert('Uh-oh, couldn\'t add new comment period');
          },
          () => { // onCompleted
            this.loading = false;
            this.openSnackBar('This comment period was created successfuly.', 'Close');
            this.router.navigate(['p', this.projectId, 'comment-periods']);
          }
        );
    }
    this.storageService.state.selectedDocumentsForCP = null;
  }

  public onCancel() {
    if (confirm(`Are you sure you want to discard all changes?`)) {
      this.storageService.state.selectedDocumentsForCP = null;
      if (this.isEditing) {
        this.router.navigate(['/p', this.projectId, 'cp', this.commentPeriod._id]);
      } else {
        this.router.navigate(['/p', this.projectId, 'comment-periods']);
      }
    }
  }

  public addDocuments() {
    this.storageService.state.addEditCPForm = { type: 'addEditCPForm', data: this.commentPeriodForm };
    if (this.isEditing) {
      this.router.navigate(['/p', this.commentPeriod.project, 'cp', this.commentPeriod._id, 'edit', 'add-documents']);
    } else {
      this.router.navigate(['/p', this.projectId, 'comment-periods', 'add', 'add-documents']);
    }
  }

  public register() {
    console.log('Successful registration');
    console.log(this.commentPeriodForm);
  }

  private extractVarsFromInstructions(instructionString: String, form: FormGroup) {
    let firstSentance = instructionString.split('.')[0] + '. ';
    form.controls.infoForCommentText.setValue(firstSentance.split(' for')[0].replace('Comment Period on the ', ''));
    this.updateInfoForCommentPreview();
    form.controls.descriptionText.setValue(instructionString.replace(firstSentance, ''));
    this.updateDescriptionPreview();
  }

  private initOpenHouseRow(): FormGroup {
    return this.formBuilder.group({
      eventDate: null,
      description: null
    });
  }

  public addOpenHouseRow(): void {
    const openHouseArray = <FormArray>this.commentPeriodForm.controls['openHouses'];
    openHouseArray.push(this.initOpenHouseRow());
  }

  public addOpenHouseRowWithFields(openHouse): void {
    const openHouseArray = <FormArray>this.commentPeriodForm.controls['openHouses'];
    openHouseArray.push(openHouse);
  }

  public removeOpenHouseRow(rowIndex: number): void {
    const openHousesArray = <FormArray>this.commentPeriodForm.controls['openHouses'];
    if (openHousesArray.length > 1) {
      openHousesArray.removeAt(rowIndex);
    } else {
      alert('You cannot delete the last row.');
    }
  }

  public updateInfoForCommentPreview() {
    this.infoForCommentPreview = this.commentPeriodForm.get('infoForCommentText').value;
  }

  public updateDescriptionPreview() {
    this.descriptionPreview = this.commentPeriodForm.get('descriptionText').value;
  }

  public removeSelectedDoc(doc) {
    this.storageService.state.selectedDocumentsForCP.data = this.storageService.state.selectedDocumentsForCP.data.filter(obj => obj._id !== doc._id);
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
