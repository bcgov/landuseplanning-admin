import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, flatMap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';

import { ApiService } from './api';
import { DocumentService } from './document.service';
import { Decision } from 'app/models/decision';

interface IGetParameters {
  getDocuments?: boolean;
}

@Injectable()
export class DecisionService {
  constructor(private api: ApiService, private documentService: DocumentService) {}

  // get decision for the specified application id
  getByApplicationId(appId: string, params: IGetParameters = null): Observable<Decision> {
    // first get the decision data
    return this.api.getDecisionsByAppId(appId).pipe(
      flatMap(res => {
        if (res && res.length > 0) {
          // return the first (only) decision
          const decision = new Decision(res[0]);

          // now get the documents for this decision
          if (params && params.getDocuments) {
            return this.documentService.getAllByDecisionId(decision._id).pipe(
              map(documents => {
                decision.documents = documents;
                return decision;
              })
            );
          }

          return of(decision);
        }
        return of(null as Decision);
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  // get a specific decision by its id
  getById(decisionId, params: IGetParameters = null): Observable<Decision> {
    // first get the decision data
    return this.api.getDecision(decisionId).pipe(
      flatMap(res => {
        if (res && res.length > 0) {
          // return the first (only) decision
          const decision = new Decision(res[0]);

          // now get the documents for this decision
          if (params && params.getDocuments) {
            return this.documentService.getAllByDecisionId(decision._id).pipe(
              map(documents => {
                decision.documents = documents;
                return decision;
              })
            );
          }

          return of(decision);
        }
        return of(null as Decision);
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  add(orig: Decision): Observable<Decision> {
    // make a (deep) copy of the passed-in decision so we don't change it
    const decision = _.cloneDeep(orig);

    // ID must not exist on POST
    delete decision._id;

    // don't send documents
    delete decision.documents;

    return this.api.addDecision(decision).pipe(catchError(error => this.api.handleError(error)));
  }

  save(orig: Decision): Observable<Decision> {
    // make a (deep) copy of the passed-in decision so we don't change it
    const decision = _.cloneDeep(orig);

    // don't send documents
    delete decision.documents;

    return this.api.saveDecision(decision).pipe(catchError(error => this.api.handleError(error)));
  }

  delete(decision: Decision): Observable<Decision> {
    return this.api.deleteDecision(decision).pipe(catchError(error => this.api.handleError(error)));
  }

  publish(decision: Decision): Observable<Decision> {
    return this.api.publishDecision(decision).pipe(catchError(error => this.api.handleError(error)));
  }

  unPublish(decision: Decision): Observable<Decision> {
    return this.api.unPublishDecision(decision).pipe(catchError(error => this.api.handleError(error)));
  }
}
