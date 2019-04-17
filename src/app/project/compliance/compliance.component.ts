import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.scss']
})
export class ComplianceComponent implements OnInit {
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
