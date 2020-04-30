import { Injectable }   from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';

import { SurveyQuestion }     from '../models/surveyQuestion';
import { of } from 'rxjs';
import { Utils } from 'app/shared/utils/utils';


@Injectable()
export class SurveyBuilderService {

  private utils = new Utils();
  public questions: any;

  constructor() {

    this.questions = []
  }

  // toFormGroup(questions: SurveyQuestion<string>[] ) {
  //   let group: any = {};

  //   questions.forEach(question => {
  //     group[question.key] = question.required ? new FormControl(question.value || '', Validators.required)
  //                                             : new FormControl(question.value || '');
  //   });
  //   console.log('this is the group', group);
  //   return new FormGroup(group);
  // }


  currentForm() {}

  // genForm() {
  //   this.toFormGroup(this.questions)
  // }

  buildEditForm(surveyQuestionsForm: FormArray, surveyQuestionsToEdit: SurveyQuestion[]): FormArray {
    surveyQuestionsToEdit.forEach(question => {
      surveyQuestionsForm.push(this.newQuestion(null, null, question))
    })
    console.log(surveyQuestionsForm);
    return surveyQuestionsForm;
  }

  newQuestion(previousContainer?, previousIndex?, questionToEdit?: SurveyQuestion): FormGroup {
    let questionProps;

    if (questionToEdit) {
      questionProps = questionToEdit;
    } else {
      questionProps = new SurveyQuestion({ type: previousContainer[previousIndex].type});
    }

    if (questionProps.type === 'smallText') {
      return new FormGroup({
        type: new FormControl(questionProps.type),
        questionText: new FormControl(questionProps.questionText, Validators.required),
        answerRequired: new FormControl(),
        maxChars: new FormControl(null, Validators.pattern('/^\d+$/'))
      })

    } else if (questionProps.type === 'largeText') {
      return new FormGroup({
        type: new FormControl(questionProps.type),
        questionText: new FormControl(questionProps.questionText, Validators.required),
        answerRequired: new FormControl(),
        maxChars: new FormControl(null, Validators.pattern('/^\d+$/'))
      })

    } else if (questionProps.type === 'singleChoice') {
        return new FormGroup({
          type: new FormControl(questionProps.type),
          questionText: new FormControl(questionProps.questionText, Validators.required),
          answerRequired: new FormControl(questionProps.answerRequired),
          other: new FormControl(questionProps.other),
          choices: this.getChoicesArray(questionProps.choices)
        })
    } else if (questionProps.type === 'multiChoice') {
      return new FormGroup({
        type: new FormControl(questionProps.type),
        questionText: new FormControl(questionProps.questionText, Validators.required),
        answerRequired: new FormControl(questionProps.answerRequired),
        other: new FormControl(questionProps.other),
        choices: this.getChoicesArray(questionProps.choices),
        choose: new FormControl(questionProps.choose)
      })
    } else if (questionProps.type === 'docPicker') {
      return new FormGroup({
        type: new FormControl(questionProps.type),
        docPickerText: new FormControl(questionProps.docPickerText, Validators.required),
      })
    } else if (questionProps.type === 'info') {
      return new FormGroup({
        type: new FormControl(questionProps.type),
        infoText: new FormControl(questionProps.infoText, Validators.required),
      })
    } else if (questionProps.type === 'likert') {
      return new FormGroup({
        type: new FormControl(questionProps.type),
        questionText: new FormControl(null, Validators.required),
        answerRequired: new FormControl(questionProps.answerRequired),
        attributes: new FormControl(),
        choices: new FormArray([])
      })
    } else if (questionProps.type === 'email') {
      return new FormGroup({
        type: new FormControl(questionProps.type),
        answerRequired: new FormControl(questionProps.answerRequired),
      })
    } else if (questionProps.type === 'phoneNumber') {
      return new FormGroup({
        type: new FormControl(questionProps.type),
        answerRequired: new FormControl(questionProps.answerRequired),
      })
    }
  }

  getChoicesArray(questionChoices: []): FormArray {
    const choicesArray = new FormArray([]);
    questionChoices.forEach(choice => {
      choicesArray.push(new FormControl(choice))
    })
    return choicesArray;
  }

  getQuestions() {
    return of(this.questions);
  }
}
