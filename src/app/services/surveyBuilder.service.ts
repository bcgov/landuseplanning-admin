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
      questionProps = new SurveyQuestion({
        type: previousContainer[previousIndex].type,
        answerRequired: true
      });
    }

    if (questionProps.type === 'smallText') {
      return new FormGroup({
        type: new FormControl(questionProps.type),
        questionText: new FormControl(questionProps.questionText, Validators.required),
        answerRequired: new FormControl(questionProps.answerRequired),
        maxChars: new FormControl(questionProps.maxChars)
      })

    } else if (questionProps.type === 'largeText') {
      return new FormGroup({
        type: new FormControl(questionProps.type),
        questionText: new FormControl(questionProps.questionText, Validators.required),
        answerRequired: new FormControl(questionProps.answerRequired),
        maxChars: new FormControl(questionProps.maxChars)
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
        questionText: new FormControl(questionProps.questionText, Validators.required),
        answerRequired: new FormControl(questionProps.answerRequired),
        attributes: this.getLikertAttributes(questionProps.attributes)
      })
    } else if (questionProps.type === 'email') {
      return new FormGroup({
        type: new FormControl(questionProps.type),
        emailText: new FormControl('Email', Validators.required),
        answerRequired: new FormControl(questionProps.answerRequired),
      })
    } else if (questionProps.type === 'phoneNumber') {
      return new FormGroup({
        type: new FormControl(questionProps.type),
        phoneNumberText: new FormControl('Phone number', Validators.required),
        answerRequired: new FormControl(questionProps.answerRequired),
      })
    }
  }

  newChoice() {
    return new FormControl(null, Validators.required)
  }

  newLikertAttribute() {
    return new FormGroup({
      attribute: new FormControl(null, Validators.required),
      choices: this.getChoicesArray(null, 5)
    })
  }

  getChoicesArray(questionChoices?: [], amount?: number): FormArray {
    const choicesArray = new FormArray([], Validators.required);
    let choiceAmount: number;
    if (questionChoices) {
      questionChoices.forEach(choice => {
        choicesArray.push(new FormControl(choice, Validators.required))
      })
    } else {
      if (amount) {
        choiceAmount = amount;
      } else {
        choiceAmount = 1;
      }
      for (let i = 0; i < choiceAmount; i++) {
        choicesArray.push(new FormControl(null, Validators.required));
      }
    }
    return choicesArray;
  }

  getLikertAttributes(questionAttributes?): FormArray {
    let attributesArray = new FormArray([], Validators.required);
    if (questionAttributes) {
      questionAttributes.forEach(attributeGroup => {
        attributesArray.push(new FormGroup({
          attribute: new FormControl(attributeGroup.attribute, Validators.required),
          choices: this.getChoicesArray(attributeGroup.choices)
        }))
      })
    } else {
      attributesArray.push(new FormGroup({
        attribute: new FormControl(null, Validators.required),
        choices: this.getChoicesArray(null, 5)
      }))
    }

    return attributesArray;
  }

  getQuestions() {
    return of(this.questions);
  }
}
