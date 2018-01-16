import { Component, OnInit } from '@angular/core';
import { CollectionsArray } from '../../models/collection';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-comment-detail',
  templateUrl: './comment-detail.component.html',
  styleUrls: ['./comment-detail.component.scss']
})

export class CommentDetailComponent implements OnInit {

  public loading: boolean;
  public collections: CollectionsArray;
  private sub: Subscription;

  constructor() { }

  ngOnInit() {
    // this.loading = true;

    // this.collections = [new Collection(this.documentService.getDocuments())];

    // see application-detail.components.ts
  }

}
