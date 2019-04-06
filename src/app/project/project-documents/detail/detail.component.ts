import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { Document } from 'app/models/document';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DocumentDetailComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public document: Document = null;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.data
    .takeUntil(this.ngUnsubscribe)
    .subscribe((res: any) => {
      this.document = res.project.data;
    });
  }

}
