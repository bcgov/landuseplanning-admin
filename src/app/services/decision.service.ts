import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';

import { ApiService } from './api';
import { DocumentService } from './document.service';
import { Decision } from 'app/models/decision';

@Injectable()
export class DecisionService {
  private decision: Decision = null;

  constructor(
    private api: ApiService,
    private documentService: DocumentService
  ) { }

  // get decision for the specified application id
  getByApplicationId(appId: string, forceReload: boolean = false): Observable<Decision> {
    if (this.decision && this.decision._application === appId && !forceReload) {
      return Observable.of(this.decision);
    }

    // first get the decision data
    return this.api.getDecisionByAppId(appId)
      .map(res => {
        const decisions = res.text() ? res.json() : [];
        // return the first (only) decision
        return decisions.length > 0 ? new Decision(decisions[0]) : null;
      })
      .mergeMap(decision => {
        if (!decision) { return Observable.of(null as Decision); }

        // replace \\n (JSON format) with newlines
        if (decision.description) {
          decision.description = decision.description.replace(/\\n/g, '\n');
        }

        // now get the decision documents
        const promise = this.documentService.getAllByDecisionId(decision._id)
          .toPromise()
          .then(documents => decision.documents = documents);

        return Promise.resolve(promise).then(() => {
          this.decision = decision;
          return decision;
        });
      });
  }

  // get a specific decision by its id
  getById(decisionId, forceReload: boolean = false): Observable<Decision> {
    if (this.decision && this.decision._id === decisionId && !forceReload) {
      return Observable.of(this.decision);
    }

    // first get the decision data
    return this.api.getDecision(decisionId)
      .map(res => {
        const decisions = res.text() ? res.json() : [];
        // return the first (only) decision
        return decisions.length > 0 ? new Decision(decisions[0]) : null;
      })
      .mergeMap(decision => {
        if (!decision) { return Observable.of(null as Decision); }

        // replace \\n (JSON format) with newlines
        if (decision.description) {
          decision.description = decision.description.replace(/\\n/g, '\n');
        }

        // now get the decision documents
        const promise = this.documentService.getAllByDecisionId(decision._id)
          .toPromise()
          .then(documents => decision.documents = documents);

        return Promise.resolve(promise).then(() => {
          this.decision = decision;
          return decision;
        });
      })
      .catch(this.api.handleError);
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
      .map(res => {
        const c = res.text() ? res.json() : null;
        return c ? new Decision(c) : null;
      })
      .catch(this.api.handleError);
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
      .map(res => {
        const c = res.text() ? res.json() : null;
        return c ? new Decision(c) : null;
      })
      .catch(this.api.handleError);
  }

  delete(decision: Decision): Observable<any> {
    return this.api.deleteDecision(decision)
      .map(res => { return res; })
      .catch(this.api.handleError);
  }

  publish(decision: Decision): Subscription {
    return this.api.publishDecision(decision)
      .subscribe(
        () => decision.isPublished = true,
        error => console.log('publish error =', error)
      );
  }

  unPublish(decision: Decision): Subscription {
    return this.api.unPublishDecision(decision)
      .subscribe(
        () => decision.isPublished = false,
        error => console.log('unpublish error =', error)
      );
  }
}
