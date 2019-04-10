import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';

import { CommentPeriod } from 'app/models/commentPeriod';
import { StorageService } from 'app/services/storage.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Subject } from 'rxjs/Subject';
import { MatSnackBar } from '@angular/material';

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

  public isEditing = false;

  public infoForCommentPreview = '%information for comment%';
  public descriptionPreview = '%description%';

  public openHouses = [{
    'eventDate': {},
    'description': ''
  }];
  public openHouseDate: Date;
  public openHouseDescription;

  public publishedState = 'unpublished';
  public commentPeriodForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private commentPeriodService: CommentPeriodService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.route.url.subscribe(segments => {
      segments.forEach(segment => {
        if (segment.path === 'edit') {
          this.isEditing = true;
        }
      });
    });
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(data => {
        if (data.project) {
          this.projectId = data.project._id;
          this.projectName = data.project.name;
        } else {
          alert('Uh-oh, couldn\'t load project');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      });

    this.commentPeriodForm = new FormGroup({
      'startDate': new FormControl(),
      'endDate': new FormControl(),
      'publishedStateSel': new FormControl(),
      'infoForCommentText': new FormControl(),
      'descriptionText': new FormControl(),
      openHouses: this.formBuilder.array([])
    });
    if (this.isEditing) {
      this.initForEditing();
    } else {
      this.addOpenHouseRow();
    }
  }

  initForEditing() {
    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: any) => {
          if (data.commentPeriod) {
            this.commentPeriod = data.commentPeriod;
          } else {
            alert('Uh-oh, couldn\'t load comment periods');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        }
      );

    this.commentPeriodForm.controls.startDate.setValue(this.convertJSDateToNGBDate(this.commentPeriod.dateStarted));
    this.commentPeriodForm.controls.endDate.setValue(this.convertJSDateToNGBDate(this.commentPeriod.dateCompleted));

    this.commentPeriodForm.controls.publishedStateSel.setValue(this.commentPeriod.isPublished ? 'published' : 'unpublished');

    let firstSentance = this.commentPeriod.instructions.split('.')[0] + '. ';
    this.commentPeriodForm.controls.infoForCommentText.setValue(firstSentance.split(' for')[0].replace('Comment Period on the ', ''));
    this.updateInfoForCommentPreview();
    this.commentPeriodForm.controls.descriptionText.setValue(this.commentPeriod.instructions.replace(firstSentance, ''));
    this.updateDescriptionPreview();

    if (this.commentPeriod.openHouses.length > 0) {
      this.commentPeriod.openHouses.forEach(openHouse => {
        this.addOpenHouseRowWithFields(
          this.formBuilder.group({
            eventDate: this.convertJSDateToNGBDate(new Date(openHouse['eventDate'])),
            description: openHouse['description']
          })
        );
      });
    } else {
      this.addOpenHouseRow();
    }
  }

  initOpenHouseRow(): FormGroup {
    return this.formBuilder.group({
      eventDate: null,
      description: null
    });
  }

  addOpenHouseRow(): void {
    const openHouseArray = <FormArray>this.commentPeriodForm.controls['openHouses'];
    openHouseArray.push(this.initOpenHouseRow());
  }

  addOpenHouseRowWithFields(openHouse): void {
    const openHouseArray = <FormArray>this.commentPeriodForm.controls['openHouses'];
    openHouseArray.push(openHouse);
  }

  removeOpenHouseRow(rowIndex: number): void {
    const openHousesArray = <FormArray>this.commentPeriodForm.controls['openHouses'];
    if (openHousesArray.length > 1) {
      openHousesArray.removeAt(rowIndex);
    } else {
      alert('You cannot delete the last row.');
    }
  }

  convertJSDateToNGBDate(jSDate: Date) {
    return {
      'year': jSDate.getFullYear(),
      'month': jSDate.getMonth() + 1,
      'day': jSDate.getDate()
    };
  }

  convertFormGroupNGBDateToJSDate(nGBDate) {
    return new Date(
      nGBDate.year,
      nGBDate.month - 1,
      nGBDate.day
    );
  }

  public onSubmit() {
    // TODO: Calulator integration.
    // TODO: Custom validation for start and end date.

    // Check start and end date
    this.commentPeriod.dateStarted = this.convertFormGroupNGBDateToJSDate(this.commentPeriodForm.get('startDate').value);
    this.commentPeriod.dateCompleted = this.convertFormGroupNGBDateToJSDate(this.commentPeriodForm.get('endDate').value);

    // Check published state
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

    // Check milestones
    // TODO: need to configure picklist for milestones

    // Check open house date
    this.commentPeriod.openHouses = [];
    this.commentPeriodForm.get('openHouses').value.forEach(openHouse => {
      if (openHouse.description !== null && openHouse.eventDate !== null) {
        this.commentPeriod.openHouses.push({
          description: openHouse.description,
          eventDate: this.convertFormGroupNGBDateToJSDate(openHouse.eventDate)
        });
      } else if (openHouse.description !== null || openHouse.eventDate !== null) {
        // TODO: We should use form errors.
        this.openSnackBar('Error: Both description and event date must not be empty.', 'Close');
        return;
      }
    });

    this.commentPeriod.project = this.projectId;

    // Submit
    if (this.isEditing) {
      this.commentPeriodService.save(this.commentPeriod)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            console.log('error =', error);
            alert('Uh-oh, couldn\'t edit comment period');
          },
          () => { // onCompleted
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
            this.openSnackBar('This comment period was created successfuly.', 'Close');
            this.router.navigate(['p', this.projectId, 'comment-periods']);
          }
        );
    }
  }
  public updateInfoForCommentPreview() {
    this.infoForCommentPreview = this.commentPeriodForm.get('infoForCommentText').value;
  }

  public updateDescriptionPreview() {
    this.descriptionPreview = this.commentPeriodForm.get('descriptionText').value;
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
