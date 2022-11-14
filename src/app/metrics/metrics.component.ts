import { Component } from '@angular/core';
import { ApiService } from 'app/services/api';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss']
})
export class MetricsComponent {

  public data: any[] = null;

  constructor(private api: ApiService) { }

}
