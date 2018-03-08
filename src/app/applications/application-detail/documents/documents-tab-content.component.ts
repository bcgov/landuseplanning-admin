import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Application } from '../../../models/application';
import { CollectionsArray } from '../../../models/collection';

@Component({
  selector: 'app-documents-tab-content',
  templateUrl: './documents-tab-content.component.html',
  styleUrls: ['./documents-tab-content.component.scss']
})

export class DocumentsTabContentComponent implements OnInit, OnDestroy {
  public loading = true;
  public application: Application;
  public collections: CollectionsArray;

  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {

    // wait for resolver to retrieve applications
    this.sub = this.route.parent.data.subscribe(
      (data: { application: Application }) => {
        if (data.application && data.application.collections) {
          this.loading = false;
          this.application = data.application;
          this.collections = data.application.collections.documents;
          this.collections.sort();
        }
      },
      error => {
        this.loading = false;
        console.log(error);
      }
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
