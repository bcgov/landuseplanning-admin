import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

import { CommentPeriod } from 'app/models/commentPeriod';
import { StorageService } from 'app/services/storage.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-create-comment-period',
    templateUrl: './create-comment-period.component.html',
    styleUrls: ['./create-comment-period.component.scss']
})

export class CreateCommentPeriodComponent implements OnInit {
    private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

    public projectName;
    public projectId;
    public infoForCommentPreview = '%information for comment%';
    public descriptionPreview = '%description%';
    public commentPeriod: CommentPeriod;
    public openHouseDate;
    public openHouseDescription;
    public publishedState = 'unpublished';
    public createCPForm: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private commentPeriodService: CommentPeriodService,
        private router: Router,
        private stoarageService: StorageService
    ) { }

    ngOnInit() {
        this.route.parent.params.subscribe(params => {
            this.projectId = params.projId;
        });

        this.createCPForm = new FormGroup({
            'startDate': new FormControl(),
            'endDate': new FormControl(),
            'publishedStateSel': new FormControl(),
            'infoForCommentText': new FormControl(),
            'descriptionText': new FormControl(),
            'openHouseDate': new FormControl(),
            'oHDescriptionText': new FormControl()
        });

        this.commentPeriod = new CommentPeriod;

        // TODO: get project if its not in storage for some reason.
        if (this.stoarageService.state.currentProjectName) {
            this.projectName = this.stoarageService.state.currentProjectName;
        }
    }

    public onSubmit() {
        // TODO: Calulator integration.
        // TODO: Custom validation for start and end date.

        // Check start and end date
        this.commentPeriod.dateStarted = new Date(
            this.createCPForm.get('startDate').value.year,
            this.createCPForm.get('startDate').value.month,
            this.createCPForm.get('startDate').value.day
        );
        this.commentPeriod.dateCompleted = new Date(
            this.createCPForm.get('endDate').value.year,
            this.createCPForm.get('endDate').value.month,
            this.createCPForm.get('endDate').value.day
        );

        // Check published state
        this.commentPeriod.read = ['staff', 'sysadmin'];
        this.commentPeriod.write = ['staff', 'sysadmin'];
        this.commentPeriod.delete = ['staff', 'sysadmin'];
        if (this.createCPForm.get('publishedStateSel').value === 'published') {
            this.commentPeriod.read.push('public');
        }

        // Check info for comment
        // Check description
        this.commentPeriod.instructions = `Comment Period on the ${this.createCPForm.get('infoForCommentText').value}`;
        this.commentPeriod.instructions += ` for ${this.projectName} Project. `;
        this.commentPeriod.instructions += this.createCPForm.get('descriptionText').value;

        // Check milestones
        // TODO: need to configure picklist for milestones

        // Check open house date
        if (this.createCPForm.get('oHDescriptionText').value && this.createCPForm.get('oHDescriptionText').value) {
            this.commentPeriod.openHouses = [
                {
                    description: this.createCPForm.get('oHDescriptionText').value,
                    eventDate: new Date(
                        this.createCPForm.get('openHouseDate').value.year,
                        this.createCPForm.get('openHouseDate').value.month,
                        this.createCPForm.get('openHouseDate').value.day
                    )
                }
            ];
        }

        this.commentPeriod.project = this.projectId;

        // Submit
        console.log('Attenpting to create comment period:', this.commentPeriod);
        this.commentPeriodService.add(this.commentPeriod)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
                () => { // onNext
                    // do nothing here - see onCompleted() function below
                },
                error => {
                    console.log('error =', error);
                    alert('Uh-oh, couldn\'t create new comment period');
                    // TODO: should fully reload project here so we have latest non-deleted objects
                },
                () => { // onCompleted
                    // delete succeeded --> navigate back to search
                    // Clear out the document state that was stored previously.
                    this.router.navigate(['p', this.projectId, 'comment-periods']);
                }
            );
    }
    public updateInfoForCommentPreview() {
        this.infoForCommentPreview = this.createCPForm.get('infoForCommentText').value;
    }

    public updateDescriptionPreview() {
        this.descriptionPreview = this.createCPForm.get('descriptionText').value;
    }
}
