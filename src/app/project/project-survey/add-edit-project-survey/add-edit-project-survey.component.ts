import { Component, OnInit, OnDestroy, Input, Renderer2, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { CdkDragDrop, moveItemInArray, copyArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as ClassicEditor from 'assets/ckeditor5/build/ckeditor';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';

import { SurveyBuilderService } from 'app/services/surveyBuilder.service';
import { SurveyQuestion }    from 'app/models/surveyQuestion';
import { Survey }    from 'app/models/survey';

import { StorageService } from 'app/services/storage.service';
import { SurveyService } from 'app/services/survey.service';
import { first } from 'rxjs/operators';
import { values } from 'lodash';
import { ModalData } from 'app/shared/types/modal';

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
  public Editor = ClassicEditor;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public editorConfig: any;

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

  /**
   * Reset the local storage of documents, comment period data, then set up
   * the survey editor's default values. Get the current project from local
   * storage. Set up a scroll listener, then set up the survey builder form.
   * Get any existing survey and load it into the form if the user
   * is editing a survey. Finally, set up the modal service to display a warning
   * for when the user exits without saving.
   *
   * @return {void}
   */
  ngOnInit() {
    this.storageService.state.selectedDocumentsForCP = null;
    this.storageService.state.addEditCPForm = null;
    this.storageService.state.currentCommentPeriod = null;
    this.editorConfig = {
      intialData: '',
      link: {
        addTargetToExternalLinks: true
      },
      heading: {
          options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading2', view: 'h2', title: 'Heading', class: 'ck-heading_heading2' },
          { model: 'heading3', view: 'h3', title: 'Subheading', class: 'ck-heading_heading3' }
        ]
      }
    }

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

  /**
   * Initialize the survey form depending on whether the user is adding a new
   * survey or editing an existing one. Set up a listener for survey form changes
   * to keep track of doc picker components.
   *
   * @param {Survey} surveyToEdit The survey to edit and plug into the form.
   * @return {void}
   */
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

  /**
   * Form getter method - necessary to be able to access Angular FormArrays.
   *
   * @return {FormArray}
   */
  get currentQuestionsForm() { return this.surveyQuestionsForm as FormArray }

  /**
   * Check the survey form group for the existence of a doc picker component
   * to ensure there is only ever one of them in the survey.
   *
   * @param {FormGroup} form The survey form group to check.
   * @return {void}
   */
  checkForDocPicker(form) {
    this.docPickerInstance = form.questions.filter(question => question.type === 'docPicker')
    this.docPickerAvailable = !this.docPickerInstance.length;
  }

  /**
   * Set up the available survey builder components.
   */
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

  /**
   * Listen for when a component is dropped into the survey builder area.
   * Update the survey form with the newly-added component.
   *
   * @param {CdkDragDrop} event A drag/drop event to watch for.
   * @return {void}
   */
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

  /**
   * When the user has dragged a question to a different position in the survey
   * form, update its position in the survey FormArray.
   *
   * @param {FormArray} questionForm The survey form.
   * @param {number} firstIndex The position the question was at before it was dragged.
   * @param {number} secondIndex The position to move the question to.
   * @return {void}
   */
  moveQuestion(questionForm: FormArray, firstIndex: number, secondIndex: number) {
    const question = questionForm.at(firstIndex)

    questionForm.removeAt(firstIndex)
    questionForm.insert(secondIndex, question)
  }

  /**
   * On question delete, display a modal prompt to confirm, then initiate
   * the deletion.
   *
   * @param {number} index The form question to delete.
   * @return {void}
   */
  deleteQuestion(index: number) {
    this.ngxSmartModalService.setModalData({
      type: 'delete',
      title: 'Confirm Deletion',
      message: 'Do you really want to delete this component from your survey?'
    }, 'confirmation-modal', true);

    this.currentComponentIndex = index;
    this.ngxSmartModalService.open('confirmation-modal');
  }

  /**
   * If the user confirms the survey question can be deleted(via modal prompt),
   * Remove the control from the FormArray.
   *
   * @param {ModalData} modalResponse The modal data to check.
   * @return {void}
   */
  private internalDeleteQuestion(modalResponse) {
     if (modalResponse.deleteConfirm === true) {
      this.surveyQuestionsForm.removeAt(this.currentComponentIndex)
    }
  }

  /**
   * A callback that returns false to indicate a component can't be dropped
   * (for more than one doc picker component, for example).
   *
   * @returns {false}
   */
  public noDrop(): false {
    return false;
  }

  /**
   * Check if a value is undefined.
   *
   * @param {any} value Value of various types to check.
   * @returns {boolean}
   */
  public isUndefined(value) {
    if (typeof value === 'undefined') {
      return true
    } else {

    }
  }

  /**
   * If the CK Editor can't be retrieved, throw an error in the console.
   *
   * @param {ChangeEvent} editor The change event containing the CK Editor.
   * @return {void}
   */
  public onCKEditorChange( { editor }: ChangeEvent ) {
    const data = editor.getData();

    if (data.length === 0) {
      console.error('error!', this.surveyQuestionsForm);
    }
  }

  /**
   * Get the likert choice position text to make it easier for the user
   * to edit.
   *
   * @param {number} position The position of the likert choice.
   * @returns {string}
   */
  public likertChoiceText(position: number): string {
    const positionText = [
      'Left',
      'Centre-left',
      'Centre',
      'Centre-right',
      'Right'
    ]
    return positionText[position];
  }

  /**
   * Add a single or multiple choice option to a question.
   *
   * @param {FormControl} question Single or multiple choice question.
   * @return {void}
   */
  public addChoice(question) {
    question.controls.choices.push(this.surveyBuilderService.newChoice());
  }

  /**
   * Delete a single or multiple choice option from a question.
   *
   * @param {FormControl} question Single or multiple choice question.
   * @return {void}
   */
  public deleteChoice(question, choiceIndex: number) {
    question.controls.choices.removeAt(choiceIndex);
  }

  /**
   * Add an "other" field to a multiple choice question so the
   * user filling out the survey can add a choice that's not available
   * in the multiple choice.
   *
   * @param {FormControl} question Multiple choice form control.
   * @return {void}
   */
  public addOther(question) {
    question.controls.other.setValue(true)
  }
  /**
   * Remove the "other" field to a multiple choice question so the
   * user filling out the survey has to choose from the available
   * multiple choice options.
   *
   * @param {FormControl} question Multiple choice form control.
   * @return {void}
   */
  public removeOther(question) {
    question.controls.other.setValue(false)
  }

  /**
   * Add a likert component attribute.
   *
   * @param {number} attribute Particular attribute index to add to the form control.
   * @return {void}
   */
  public addAttribute(attribute) {
    attribute.controls.attributes.push(this.surveyBuilderService.newLikertAttribute());
  }

  /**
   * Delete a likert component attribute.
   *
   * @param {FormControl} question Likert component question form control.
   * @param {number} attributeIndex Particular attribute index to delete.
   * @return {void}
   */
  public deleteAttribute(question, attributeIndex: number) {
    question.controls.attributes.removeAt(attributeIndex);
  }

  /**
   * When the user saves their work, first check if the survey is valid. If so,
   * initiate a save with the API, otherwise notify the user of the invalid
   * parts of the survey to correct.
   *
   * @returns {void}
   */
  public onSubmit() {
    if (this.surveyForm.valid) {
      this.submitForm();
    } else {
      this.surveyForm.markAllAsTouched();
      alert('Your survey is missing one or more required fields. Please review it for missing text, choices, or attributes.');
      return;
    }
  }

  /**
   * On Required Choice Change to ensure it doesn't go below 0 or by max count.
   *
   * @param   {[type]}  event  The event.
   * @param   {[type]}  question  The Question object.
   *
   * @return  {void}
   */
  public onRequiredChoiceChange(event, question) {
      const formControl = question.controls.choose;
      const min = event.target.getAttribute('min') ?? 0;
      const max = event.target.getAttribute('max') ?? 100;
      const valueConstraint = Math.min(max, Math.max(min, formControl.value ))
      formControl.setValue(valueConstraint);
  }

  /**
   * When the user saves the survey, prepare the survey data, then save or
   * update the survey by contacting the survey API.
   *
   * @return {void}
   */
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
            console.error(error);
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
      this.surveyService.add(this.survey)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          error => {
            console.error(error);
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

  /**
   * When the user hits "cancel," exit this view and return the user to the
   * existing survey details view, or to the project surveys overview page.
   *
   * @return {void}
   */
  public onCancel() {
      if (this.isEditing) {
        this.router.navigate(['/p', this.currentProject._id, 's', this.survey._id]);
      } else {
        this.router.navigate(['/p', this.currentProject._id, 'project-surveys']);
      }
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
   * Tear down processes that consume memory when the component is un-mounted,
   * including the scroll listener and any ongoing subscriptions(mainly HTTP calls).
   *
   * @return {void}
   */
  ngOnDestroy() {
    // Remove scroll listener
    if (this.scrollListener) {
      this.scrollListener();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
