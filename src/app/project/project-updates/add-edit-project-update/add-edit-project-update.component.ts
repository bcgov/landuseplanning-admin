import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ProjectService } from 'app/services/project.service';
import { StorageService } from 'app/services/storage.service';
import { RecentActivityService } from 'app/services/recent-activity';
import { RecentActivity } from 'app/models/recentActivity';
import { Utils } from 'app/shared/utils/utils';
import * as ClassicEditor from 'assets/ckeditor5/build/ckeditor';
import { Project } from 'app/models/project';


@Component({
  selector: 'app-add-edit-project-update',
  templateUrl: './add-edit-project-update.component.html',
  styleUrls: ['./add-edit-project-update.component.scss']
})
export class AddEditProjectUpdateComponent implements OnInit, OnDestroy {
  public myForm: FormGroup;
  public isEditing = false;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public loading = true;
  public projects = [];
  public activity: any;
  public Editor = ClassicEditor;
  public currentProject: Project;
  public addEditPageTitle: string;
  public pageBreadcrumbs: { pageTitle: string; routerLink: Object; }[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private utils: Utils,
    private recentActivityService: RecentActivityService,
    private projectService: ProjectService,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        if (Object.keys(res).length === 0) {
          this.buildForm({
            'headline': '',
            'content': '',
            'dateAdded': new Date(),
            'project': this.currentProject._id,
            'active': '',
            'pinned': false,
            'contentUrl': '',
            'documentUrl': '',
            'documentUrlText': ''
          });
          this.pageBreadcrumbs = null;
          this.addEditPageTitle = 'Add';
        } else {
          this.isEditing = true;
          this.buildForm(res.activity);
          this.activity = res.activity;
          this.pageBreadcrumbs = [{
            pageTitle: 'Updates',
            routerLink: ['../../']
          }];
          this.addEditPageTitle = 'Edit';
        }
        this.loading = false;
      });

    this.projectService.getAll(1, 1000, '+name')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          this.projects = res.data;
          // TODO: Later
          // Types
          // this.types = this.configService.lists.filter(item => {
          //   return item.type === 'headlineType';
          // });
        }
      });
  }

  onCancel() {
    this.router.navigate(['p', this.currentProject._id, 'project-updates']);
  }

  onSubmit() {
    if (this.isEditing) {
      let activity = new RecentActivity({
        _id: this.activity._id,
        headline: this.myForm.controls.headline.value,
        content: this.myForm.controls.content.value,
        dateAdded: this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateAdded').value),
        project: this.currentProject._id,

        // TODO: ETL this to merge.
        contentUrl: this.myForm.controls.contentUrl.value,
        documentUrl: this.myForm.controls.documentUrl.value,
        documentUrlText: this.myForm.controls.documentUrlText.value,
        active: this.myForm.controls.active.value === 'yes' ? true : false,
        pinned: this.activity.pinned
      });
      this.recentActivityService.save(activity)
        .subscribe(item => {
          this.router.navigate(['p', this.currentProject._id, 'project-updates']);
        });
    } else {
      let activity = new RecentActivity({
        headline: this.myForm.controls.headline.value,
        content: this.myForm.controls.content.value,
        dateAdded: new Date(),
        project: this.currentProject._id,
        contentUrl: this.myForm.controls.contentUrl.value,
        documentUrl: this.myForm.controls.documentUrl.value,
        documentUrlText: this.myForm.controls.documentUrlText.value,
        pinned: false,
        active: this.myForm.controls.active.value === 'yes' ? true : false
      });
      this.recentActivityService.add(activity)
        .subscribe(item => {
          this.router.navigate(['p', this.currentProject._id, 'project-updates']);
        });
    }
  }

  register(myForm: FormGroup) {
    console.log('Successful registration');
    console.log(myForm);
  }

  buildForm(data) {
    console.log('data:', data);
    this.myForm = new FormGroup({
      'headline': new FormControl(data.headline),
      'content': new FormControl(data.content),
      'dateAdded': new FormControl(this.utils.convertJSDateToNGBDate(new Date(data.dateAdded))),
      'active': new FormControl(data.active ? 'yes' : 'no'),
      'contentUrl': new FormControl(data.contentUrl),
      'documentUrl': new FormControl(data.documentUrl),
      'documentUrlText': new FormControl(data.documentUrlText),
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
