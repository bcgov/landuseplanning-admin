import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { DocumentService } from './document.service';
import { Decision } from 'app/models/decision';

interface GetParameters {
  getDocuments?: boolean;
}

@Injectable()
export class DecisionService {

  constructor(
    private api: ApiService,
    private documentService: DocumentService
  ) { }

  // get decision for the specified application id
  getByApplicationId(appId: string, params: GetParameters = null): Observable<Decision> {
    // first get the decision data
    return this.api.getDecisionsByAppId(appId)
      .pipe(
        flatMap(res => {
          if (res && res.length > 0) {
            // return the first (only) decision
            const decision = new Decision(res[0]);

            // now get the documents for this decision
            if (params && params.getDocuments) {
              return this.documentService.getAllByDecisionId(decision._id)
                .pipe(
                  map(documents => {
                    decision.documents = documents;
                    return decision;
                  })
                );
            }

            return of(decision);
          }
          return of(null as Decision);
        })
      )
      .catch(error => this.api.handleError(error));
  }

  // get a specific decision by its id
  getById(decisionId, params: GetParameters = null): Observable<Decision> {
    // first get the decision data
    return this.api.getDecision(decisionId)
      .pipe(
        flatMap(res => {
          if (res && res.length > 0) {
            // return the first (only) decision
            const decision = new Decision(res[0]);

            // now get the documents for this decision
            if (params && params.getDocuments) {
              return this.documentService.getAllByDecisionId(decision._id)
                .pipe(
                  map(documents => {
                    decision.documents = documents;
                    return decision;
                  })
                );
            }

            return of(decision);
          }
          return of(null as Decision);
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

    return this.api.addDecision(decision)
      .catch(error => this.api.handleError(error));
  }

  save(orig: Decision): Observable<Decision> {
    // make a (deep) copy of the passed-in decision so we don't change it
    const decision = _.cloneDeep(orig);

    // don't send documents
    delete decision.documents;

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
