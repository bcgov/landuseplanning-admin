import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { of } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';

import * as _ from 'lodash';

import { ApiService } from './api';
import { DocumentService } from './document.service';
import { Decision } from 'app/models/decision';
import { Document } from 'app/models/document';

@Injectable()
export class DecisionService {
  private decision: Decision = null;

  constructor(
    private api: ApiService,
    private documentService: DocumentService
  ) { }

  // get decision for the specified application id
  getByApplicationId(appId: string, forceReload: boolean = true): Observable<Decision> {
    const self = this;

    // Get the decision
    return this.api.getDecisionByAppId(appId)
      .pipe(
        flatMap(res => {
          if (res && res.length > 0) {
            this.decision = new Decision(res[0]);
            // Then get the documents for this decision
            return this.documentService.getAllByDecisionId(this.decision._id)
              .pipe(
                map(documents => {
                  _.each(documents, function (d) {
                    self.decision.documents.push(new Document(d));
                  });
                  return this.decision;
                })
              );
          } else {
            return of(null);
          }
        })
      )
      .catch(error => this.api.handleError(error));
  }

  // get a specific decision by its id
  getById(decisionId, forceReload: boolean = false): Observable<Decision> {
    const self = this;
    if (this.decision && this.decision._id === decisionId && !forceReload) {
      return of(this.decision);
    }

    // Get the decision
    return this.api.getDecision(decisionId)
      .pipe(
        flatMap(res => {
          this.decision = new Decision(res[0]);
          // Then get the documents for this decision
          return this.documentService.getAllByDecisionId(this.decision._id)
            .pipe(
              map(documents => {
                _.each(documents, function (d) {
                  self.decision.documents.push(new Document(d));
                });
                return this.decision;
              })
            );
        })
      )
      .catch(error => this.api.handleError(error));
  }

  add(orig: Decision): Observable<Decision> {
    // make a (deep) copy of the passed-in decision so we don't change it
    const decision = _.cloneDeep(orig);

    // ID must not exist on POST
    delete decision._id;

    // don't send documents
    delete decision.documents;

    // replace newlines with \\n (JSON format)
    if (decision.description) {
      decision.description = decision.description.replace(/\n/g, '\\n');
    }

    return this.api.addDecision(decision)
      .catch(error => this.api.handleError(error));
  }

  save(orig: Decision): Observable<Decision> {
    // make a (deep) copy of the passed-in decision so we don't change it
    const decision = _.cloneDeep(orig);

    // don't send documents
    delete decision.documents;

    // replace newlines with \\n (JSON format)
    if (decision.description) {
      decision.description = decision.description.replace(/\n/g, '\\n');
    }

    return this.api.saveDecision(decision)
      .catch(error => this.api.handleError(error));
  }

  delete(decision: Decision): Observable<Decision> {
    return this.api.deleteDecision(decision)
      .catch(error => this.api.handleError(error));
  }

  publish(decision: Decision): Observable<Decision> {
    return this.api.publishDecision(decision)
      .catch(error => this.api.handleError(error));
  }

  unPublish(decision: Decision): Observable<Decision> {
    return this.api.unPublishDecision(decision)
      .catch(error => this.api.handleError(error));
  }
}
