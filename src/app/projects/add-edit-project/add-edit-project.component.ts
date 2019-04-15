import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-add-edit-project',
  templateUrl: './add-edit-project.component.html',
  styleUrls: ['./add-edit-project.component.scss']
})

export class AddEditProjectComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public projectName;
  public projectId;

  public isEditing = false;

  public loading = true;

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    // Check if we're editing
    this.route.url.subscribe(segments => {
      segments.forEach(segment => {
        if (segment.path === 'edit') {
          this.isEditing = true;
        }
      });
    });

    // Get data related to current project
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(data => {
        this.loading = false;
      });
  }
}
