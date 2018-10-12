import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {

  constructor(
    private configService: ConfigService
  ) { }

  ngOnInit() {
    this.configService.init();
  }

  ngOnDestroy() {
    this.configService.destroy();
  }

}
