import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-project-contacts',
  templateUrl: './project-contacts.component.html',
  styleUrls: ['./project-contacts.component.scss']
})
export class ProjectContactsComponent implements OnInit {
  public currentProjectId = '';
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.parent.paramMap
    .takeUntil(this.ngUnsubscribe)
    .subscribe(paramMap => {
      this.currentProjectId = paramMap.get('projId');
    });
  }
}
