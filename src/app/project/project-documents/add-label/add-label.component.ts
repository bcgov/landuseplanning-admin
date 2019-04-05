import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DocumentService } from 'app/services/document.service';

@Component({
  selector: 'app-add-label',
  templateUrl: './add-label.component.html',
  styleUrls: ['./add-label.component.scss']
})
export class AddLabelComponent implements OnInit {
  public currentProjectId: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private documentService: DocumentService
  ) { }

  ngOnInit() {
    this.route.parent.paramMap.subscribe(params => {
      this.currentProjectId = params.get('projId');
    });
  }

  saveLabels() {
    // TODO
    this.documentService.setState({type: 'return', picklist: 'alwayspicked'});
    this.router.navigate(['p', this.currentProjectId, 'project-documents', 'upload']);
  }

  cancel() {
    this.router.navigate(['p', this.currentProjectId, 'project-documents', 'upload']);
  }
}
