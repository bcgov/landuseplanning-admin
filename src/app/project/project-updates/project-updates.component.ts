import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-project-updates',
  templateUrl: './project-updates.component.html',
  styleUrls: ['./project-updates.component.scss']
})
export class ProjectUpdatesComponent implements OnInit {
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
