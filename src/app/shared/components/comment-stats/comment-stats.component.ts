import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ApiService } from 'app/services/api';

@Component({
    selector: 'app-comment-stats',
    templateUrl: './comment-stats.component.html',
    styleUrls: ['./comment-stats.component.scss']
})

export class CommentStatsComponent implements OnInit {
  @Input() period: any;
  public summary: any;

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
    this.api.getPeriodSummary(this.period._id).subscribe(summary => {
      this.summary = summary;
    });
  }
}
