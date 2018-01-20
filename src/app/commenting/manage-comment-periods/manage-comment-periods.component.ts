import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs/Subscription';
import { NgbModal, ModalDismissReasons, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { Application } from '../../models/application';
import { ApplicationService } from '../../services/application.service';
import { CommentPeriod } from '../../models/commentperiod';
import { CommentPeriodService } from '../../services/commentperiod.service';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-manage-comment-periods',
  templateUrl: './manage-comment-periods.component.html',
  styleUrls: ['./manage-comment-periods.component.scss'],
  animations: [
    trigger('visibility', [
      transition(':enter', [   // :enter is alias to 'void => *'
        animate('0.2s 0s', style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('0.2s 0.75s', style({ opacity: 0 }))
      ])
    ])
  ]
})

export class ManageCommentPeriodsComponent implements OnInit, OnDestroy {
  public loading: boolean;
  public appId: string;
  public application: Application;
  public commentPeriods: Array<CommentPeriod>;
  public alerts: Array<string>;
  public closeResult: string;

  private subAppl: Subscription;
  private subPeriod: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private commentPeriodService: CommentPeriodService,
    private api: ApiService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    // If we're not logged in, redirect.
    if (!this.api.ensureLoggedIn()) {
      return false;
    }

    this.loading = true;
    this.appId = '0';
    this.commentPeriods = [];
    this.alerts = [];

    this.route.params.subscribe(
      (params: Params) => { this.appId = params.application || '0'; }
    );

    // get application
    this.subAppl = this.applicationService.getById(this.appId)
      .subscribe(
      data => {
        this.application = data;
      },
      error => {
        // If 403, redir to /login.
        if (error.startsWith('403')) {
          this.router.navigate(['/login']);
        }
        this.alerts.push('Error loading application');
        // console.log(error); // already displayed by handleError()
      });

    // get comment periods
    this.subPeriod = this.commentPeriodService.getAll(this.appId)
      // .finally(() => this.loading = false) // TODO: make this work
      .subscribe(
      data => {
        this.loading = false;
        this.commentPeriods = data;
        // TODO: calculate and store status for easier UI
      },
      error => {
        this.loading = false;
        // If 403, redir to /login.
        if (error.startsWith('403')) {
          this.router.navigate(['/login']);
        }
        this.alerts.push('Error loading comment periods');
        // console.log(error); // already displayed by handleError()
      });
  }

  ngOnDestroy(): void {
    this.subAppl.unsubscribe();
    this.subPeriod.unsubscribe();
  }

  open(content) {
    const options: NgbModalOptions = { backdrop: 'static', size: 'lg' };

    this.modalService.open(content, options).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  private getStatus(item: CommentPeriod) {
    const today = new Date();

    if (!item.startDate || !item.endDate) {
      return 'unknown';
    } else if (today < item.startDate) {
      return 'FUTURE';
    } else if (today > item.endDate) {
      return 'PAST';
    } else {
      return 'CURRENT';
    }
  }

}
