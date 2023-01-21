import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray, Form } from '@angular/forms';

import { SurveyQuestion } from '../models/surveyQuestion';
import { Utils } from 'app/shared/utils/utils';


@Injectable()
export class SurveyBuilderService {

  private utils = new Utils();

  constructor() {}

  /**
   * Initialize the survey editing form.
   *
   * @param {FormArray} surveyQuestionsForm The form array to add questions to.
   * @param {Array} surveyQuestionsToEdit The questions to push onto the form array,
   * @returns {FormArray}
   */
  buildEditForm(surveyQuestionsForm: FormArray, surveyQuestionsToEdit: SurveyQuestion[]): FormArray {
    surveyQuestionsToEdit.forEach(question => {
      surveyQuestionsForm.push(this.newQuestion(null, null, question))
    })
    return surveyQuestionsForm;
  }

  /**
   * When the user drags a question type over the form area, add a new form question into
   * the survey form array.
   *
   * @param {Array} previousContainer The array of possible form question types.
   * @param {number} previousIndex The specific index referring to a question type.
   * @param {SurveyQuestion} questionToEdit The existing survey question to edit(if not a new question).
   * @returns {FormGroup}
   */
  newQuestion(previousContainer?, previousIndex?, questionToEdit?: SurveyQuestion): FormGroup {
    let questionProps;

    if (questionToEdit) {
      questionProps = questionToEdit;
    } else {
      questionProps = new SurveyQuestion({
        type: previousContainer[previousIndex].type,
        answerRequired: false
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

  /**
   * Return a new "choice" form control for radio or checkbox form types.
   *
   * @returns {FormControl}
   */
  newChoice(): FormControl {
    return new FormControl(null, Validators.required)
  }

  /**
   * Return a new likert attribute in a likert type form form group.
   *
   * @returns {FormGroup}
   */
  newLikertAttribute(): FormGroup {
    return new FormGroup({
      attribute: new FormControl(null, Validators.required),
      choices: this.getChoicesArray(null, 5)
    })
  }

  /**
   * When setting up radio or checkbox form groups, get a nested form
   * array for the "choices" it contains. Existing choices can be passed
   * in if the question is being edited. Otherwise, a new empty form
   * array will be created.
   *
   * @param {Array} questionChoices The existing form choices.
   * @param {number} amount The amount of choices to set up.
   * @returns {FormArray}
   */
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

  /**
   * When a likert form is being set up, get the attributes form array.
   * Existing likert attributes can be passed in if the question is being
   * edited. Otherwise, get a new, empty array of attributes.
   *
   * @param questionAttributes
   * @returns
   */
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
}
