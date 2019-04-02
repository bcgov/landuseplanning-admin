import { Component, Input, OnInit } from '@angular/core';
import { CommentPeriod } from 'app/models/commentPeriod';

@Component({
  selector: 'app-comment-period-details-tab',
  templateUrl: './comment-period-details-tab.component.html',
  styleUrls: ['./comment-period-details-tab.component.scss']
})

export class CommentPeriodDetailsTabComponent implements OnInit {
  @Input() public commentPeriod: CommentPeriod;

  constructor() { }

  ngOnInit() {
  }
}
