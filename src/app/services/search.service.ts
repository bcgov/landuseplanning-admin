import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { Search } from '../models/search';

@Injectable()
export class SearchService {

  constructor(private api: ApiService) { }

  getByCLFile(clfile: string): Observable<Search> {
    return this.api.getBCGWCrownLandsById(clfile)
    .map((res: Response) => {
        return res.text() ? new Search(res.json()) : null;
    });
  }
}
