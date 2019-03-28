import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/services/api';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss']
})
export class MetricsComponent implements OnInit {

  public data: any[] = null;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getMetrics(0, 25, null)
    .subscribe(res => {
      this.data = res;
    });
  }
}
