import { Component, OnInit, OnDestroy, Input, Renderer2, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { CdkDragDrop, moveItemInArray, copyArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { SurveyBuilderService } from 'app/services/surveyBuilder.service';
import { SurveyQuestion }    from 'app/models/surveyQuestion';
import { Survey }    from 'app/models/survey';

import { StorageService } from 'app/services/storage.service';
import { SurveyService } from 'app/services/survey.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-add-edit-project-survey',
  templateUrl: './add-edit-project-survey.component.html',
  styleUrls: ['./add-edit-project-survey.component.scss'],
  providers:  [SurveyBuilderService, SurveyService]
})
export class AddEditProjectSurveyComponent implements OnInit, OnDestroy {
  @ViewChild('componentsPane') componentsPane;

  public currentProject;
  public availOptions;
  public currentComponentIndex;
  public loading = false ;
  public isEditing = false;
  public addEditPlaceholder: string;
  public survey = {} as Survey;
  public surveyForm: FormGroup;
  public surveyQuestionsForm: FormArray;
  public surveyPosition: number;
  public surveyChanged: boolean;
  public changesSaved: boolean;
  public docPickerAvailable: boolean;
  public docPickerInstance: any[];
  public scrollListener: () => void;
  public payLoad = '';
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public surveyBuilderService: SurveyBuilderService,
    private surveyService: SurveyService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private ngxSmartModalService: NgxSmartModalService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.storageService.state.selectedDocumentsForCP = null;
    this.storageService.state.addEditCPForm = null;
    this.storageService.state.currentCommentPeriod = null;

    this.scrollListener = this.renderer.listen(document.getElementById('scrollTop'), 'scroll', (event) => {
      this.surveyPosition = event.srcElement.scrollTop;
    })

    this.currentProject = this.storageService.state.currentProject.data;

    this.surveyForm = new FormGroup({
      name: new FormControl('', Validators.required),
      questions: new FormArray([], Validators.required)
    })

    this.surveyQuestionsForm = this.surveyForm.get('questions') as FormArray;

    // Check if we're editing
    this.route.url.subscribe(segments => {
      segments.map(segment => {
        if (segment.path === 'edit') {
          this.isEditing = true;
          this.isEditing ? this.addEditPlaceholder = 'Edit Survey' : this.addEditPlaceholder = 'New Survey';

          this.checkForDocPicker(this.surveyForm.value)
          // get data from route resolver
          this.route.data
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              (data: any) => {
                if (data.survey) {
                  this.survey = data.survey;
                  this.storageService.state.currentSurvey = { type: 'currentSurvey', data: this.survey };
                  this.initForm(this.survey);

                  this.loading = false;
                  // this._changeDetectionRef.detectChanges();
                } else {
                  alert('Uh-oh, couldn\'t load survey');
                  // project not found --> navigate back to search
                  this.router.navigate(['/search']);
                }
                this.loading = false;
                // this._changeDetectionRef.detectChanges();
              })
        } else {
          this.initForm();
          this.loading = false;
          this.isEditing ? this.addEditPlaceholder = 'Edit Survey' : this.addEditPlaceholder = 'New Survey';
          // this._changeDetectionRef.detectChanges();
        }
      });
    });

    this.ngxSmartModalService.getModal('confirmation-modal').onAnyCloseEventFinished
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        const data = this.ngxSmartModalService.getModalData('confirmation-modal');
        this.internalDeleteQuestion(data);
      })

  }

  private initForm(surveyToEdit?) {
    if (surveyToEdit) {
      this.surveyForm = new FormGroup({
        name: new FormControl(surveyToEdit.name, Validators.required),
        questions: new FormArray([], Validators.required)
      })
      this.surveyQuestionsForm = this.surveyForm.get('questions') as FormArray;
      this.surveyBuilderService.buildEditForm(this.surveyQuestionsForm, this.survey.questions)
    }

    // Listen for survey changes
    this.surveyForm.valueChanges
      .takeUntil(this.ngUnsubscribe)
      .subscribe(form => {
        this.checkForDocPicker(form);
        this.surveyChanged = true;
      })

      this.checkForDocPicker(this.surveyForm.value)
  }

  get currentQuestionsForm() { return this.surveyQuestionsForm as FormArray }


  checkForDocPicker(form) {
    this.docPickerInstance = form.questions.filter(question => question.type === 'docPicker')
    this.docPickerAvailable = !this.docPickerInstance.length;
  }

  components = [
    { name: 'Small Text Field', type: 'smallText'},
    { name: 'Large Text Field', type: 'largeText'},
    { name: 'Single Choice', type: 'singleChoice'},
    { name: 'Multiple Choice', type: 'multiChoice'},
    { name: 'Document Picker', type: 'docPicker' },
    { name: 'Likert Scale', type: 'likert' },
    { name: 'Info Text', type: 'info' },
    { name: 'Email', type: 'email' },
    { name: 'Phone Number', type: 'phoneNumber' }
  ];

  dropComponent(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      this.moveQuestion(this.surveyQuestionsForm, event.previousIndex, event.currentIndex);
    } else {
      this.surveyQuestionsForm.insert(
        event.currentIndex,
        this.surveyBuilderService.newQuestion(
          event.previousContainer.data,
          event.previousIndex
          )
        )
    }
  }

  moveQuestion(questionForm: FormArray, firstIndex: number, secondIndex: number) {
    const question = questionForm.at(firstIndex)

    questionForm.removeAt(firstIndex)
    questionForm.insert(secondIndex, question)
  }

  deleteQuestion(index: number) {
    this.ngxSmartModalService.setModalData({
      type: 'delete',
      title: 'Confirm Deletion',
      message: 'Do you really want to delete this component from your survey?'
    }, 'confirmation-modal', true);

    this.currentComponentIndex = index;
    this.ngxSmartModalService.open('confirmation-modal');
  }

  private internalDeleteQuestion(modalResponse) {
     if (modalResponse.deleteConfirm === true) {
      this.surveyQuestionsForm.removeAt(this.currentComponentIndex)
    }
  }

  noDrop(): false {
    return false;
  }

  isUndefined(value) {
    if (typeof value === 'undefined') {
      return true
    } else {

    }
  }

  likertChoiceText(position: number): string {
    const positionText = [
      'Left',
      'Centre-left',
      'Centre',
      'Centre-right',
      'Right'
    ]
    return positionText[position];
  }

  public addChoice(question) {
    question.controls.choices.push(this.surveyBuilderService.newChoice());
  }

  public deleteChoice(question, choiceIndex: number) {
    question.controls.choices.removeAt(choiceIndex);
  }

  public addOther(question) {
    question.controls.other.setValue(true)
  }

  public removeOther(question) {
    question.controls.other.setValue(false)
  }

  public addAttribute(attribute) {
    attribute.controls.attributes.push(this.surveyBuilderService.newLikertAttribute());
  }

  public deleteAttribute(question, attributeIndex: number) {
    question.controls.attributes.removeAt(attributeIndex);
  }

  public onSubmit() {
    if (this.surveyForm.valid) {
      this.submitForm();
    } else {
      this.surveyForm.markAllAsTouched();
      alert('Your survey is missing one or more required fields. Please review it for missing text, choices, or attributes.');
      return;
    }
  }

  private submitForm() {

    this.loading = true;

    // Survey date created - only save if not editing
    if (!this.isEditing) {
      this.survey.dateAdded = new Date();
    }

    //Survey save date
    this.survey.lastSaved = new Date();

    // Survey Name, Project, Questions
    this.survey.name = this.surveyForm.get('name').value;
    this.survey.project = this.currentProject._id;
    this.survey.questions = this.surveyForm.get('questions').value;

    this.loading = false;


    // Submit
    if (this.isEditing) {
      this.surveyService.save(this.survey)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            console.log('error =', error);
            alert('Uh-oh, couldn\'t save survey');
          },
          () => { // onCompleted
            this.changesSaved = true;
            this.loading = false;
            this.openSnackBar('This survey was saved successfuly.', 'Close');
            this.router.navigate(['/p', this.survey.project, 's', this.survey._id]);
          }
        );
    } else {
      console.log('Attempting to add new survey:', this.survey);
      this.surveyService.add(this.survey)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            console.log('error =', error);
            alert('Uh-oh, couldn\'t add new survey');
            this.loading = false;
          },
          () => { // onCompleted
            this.loading = false;
            this.openSnackBar('This survey was created successfuly.', 'Close');
            this.router.navigate(['/p', this.currentProject._id, 'project-surveys']);
          }
        );
    }
  }

  public onCancel() {
      if (this.isEditing) {
        this.router.navigate(['/p', this.currentProject._id, 's', this.survey._id]);
      } else {
        this.router.navigate(['/p', this.currentProject._id, 'project-surveys']);
      }
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnDestroy() {
    // Remove scroll listener
    if (this.scrollListener) {
      this.scrollListener();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
