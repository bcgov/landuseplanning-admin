import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { Document } from 'app/models/document';
import { Project } from 'app/models/project';
import { ApiService } from 'app/services/api';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DocumentDetailComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public document: Document = null;
  public project: Project = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public api: ApiService,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.route.parent.data
    .takeUntil(this.ngUnsubscribe)
    .subscribe((data: any) => {
      this.project = data.project;
      this._changeDetectionRef.detectChanges();

      this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.document = res.document;
        this._changeDetectionRef.detectChanges();
      });
    });
  }

  onEdit() {
    this.storageService.state.selectedDocs = [this.document];
    this.storageService.state.labels = this.document.labels;
    this.storageService.state.back = { url: ['/p', this.document.project, 'project-documents', 'detail', this.document._id], label: 'View Document' };
    this.router.navigate(['p', this.document.project, 'project-documents', 'edit']);
  }
}
