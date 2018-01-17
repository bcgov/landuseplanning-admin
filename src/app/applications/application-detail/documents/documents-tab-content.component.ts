import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Application } from '../../../models/application';
import { CollectionsArray } from '../../../models/collection';

@Component({
  selector: 'app-documents-tab-content',
  templateUrl: './documents-tab-content.component.html',
  styleUrls: ['./documents-tab-content.component.scss']
})

export class DocumentsTabContentComponent implements OnInit, OnDestroy {
  public loading: boolean;
  public application: Application;
  public collections: CollectionsArray;

  private sub: Subscription;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loading = true;

    this.sub = this.route.parent.data.subscribe(
      (data: { application: Application }) => {
        if (data.application && data.application.collections) {
          this.application = data.application;
          this.collections = data.application.collections.documents;
          this.collections.sort();
        }
      },
      error => {
        console.log(error);
      },
      () => {
        this.loading = false;
      }
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
