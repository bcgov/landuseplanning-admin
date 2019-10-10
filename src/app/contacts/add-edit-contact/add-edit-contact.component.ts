import { Component, OnInit, OnDestroy } from '@angular/core';

import { Topic } from 'app/models/topic';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { User } from 'app/models/user';
import { UserService } from 'app/services/user.service';
import { StorageService } from 'app/services/storage.service';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';

export interface DataModel {
  title: string;
  message: string;
  model: Topic;
}

@Component({
  templateUrl: './add-edit-contact.component.html',
  styleUrls: ['./add-edit-contact.component.scss']
})

// NOTE: dialog components must not implement OnDestroy
//       otherwise they don't return a result
export class AddEditContactComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private navigationObject;

  public currentProject;
  public contactForm: FormGroup;
  public isEditing = false;
  public loading = false;
  public contactId = '';
  public contact = null;
  public tinyMceSettings = {
    skin: false,
    browser_spellcheck: true,
    height: 240
  };
  public phonePattern;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationStackUtils: NavigationStackUtils,
    private storageService: StorageService,
    private userService: UserService
  ) { }

  ngOnInit() {
    if (this.navigationStackUtils.getNavigationStack()) {
      this.navigationObject = this.navigationStackUtils.getLastNavigationObject();
    }

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(res => {
        this.isEditing = Object.keys(res).length === 0 && res.constructor === Object ? false : true;
        this.contactId = this.isEditing ? res.contact.data._id : '';

        if (this.storageService.state.contactForm == null) {
          if (!this.isEditing) {
            this.buildForm({
              'firstName': '',
              'lastName': '',
              'email': '',
              'phoneNumber': ''
            });
          } else {
            this.buildForm(res.contact.data);
          }
        } else {
          this.contactForm = this.storageService.state.contactForm;
        }
        this.loading = false;
      });
  }

  private setBreadcrumbs() {
    if (!this.isEditing) {
      if (this.navigationObject) {
        // We're coming from a different component so we have to preserve our nav stack.
        console.log('nav object', this.navigationObject);
        let nextBreadcrumbs = [...this.navigationObject.breadcrumbs];
        nextBreadcrumbs.push(
          {
            route: ['/contacts', 'add'],
            label: 'Add Contact'
          }
        );
        this.navigationStackUtils.pushNavigationStack(
          ['/contacts', 'add'],
          nextBreadcrumbs
        );
      } else {
        this.navigationStackUtils.pushNavigationStack(
          ['/contacts', 'add'],
          [
            {
              route: ['/contacts'],
              label: 'Contacts'
            },
            {
              route: ['/contacts', 'add'],
              label: 'Add'
            }
          ]
        );
      }
    } else {
      this.navigationStackUtils.pushNavigationStack(
        ['/c', this.contactId, 'edit'],
        [
          {
            route: ['/contacts'],
            label: 'Contacts'
          },
          {
            route: ['/c', this.contactId, 'edit'],
            label: 'Edit'
          }
        ]
      );
    }
  }

  private buildForm(data) {
    this.contactForm = new FormGroup({
      'firstName': new FormControl(data.firstName),
      'lastName': new FormControl(data.lastName),
      'email': new FormControl(data.email),
      'phoneNumber': new FormControl(data.phoneNumber)
    });
  }

  private clearStorageService() {
    this.storageService.state.contactForm = null;
  }

  public onSubmit() {
    // Validating form
    // TODO: cover all validation cases.
    if (this.contactForm.controls.firstName.value === '') {
      alert('First name cannot be empty.');
      return;
    } else if (this.contactForm.controls.lastName.value === '') {
      alert('Last name cannot be empty.');
      return;
    } else if (this.contactForm.controls.email.value === '') {
      alert('Email cannot be empty.');
      return;
    } else if (this.contactForm.controls.phoneNumber.value === '') {
      alert('Phone number cannot be empty.');
      return;
    }

    let user = new User({
      firstName: this.contactForm.controls.firstName.value,
      lastName: this.contactForm.controls.lastName.value,
      displayName: `${this.contactForm.controls.firstName.value} ${this.contactForm.controls.lastName.value}`,
      email: this.contactForm.controls.email.value,
      phoneNumber: this.contactForm.controls.phoneNumber.value,
    });

    this.clearStorageService();

    if (!this.isEditing) {
      this.userService.add(user)
        .subscribe(item => {
          console.log('item', item);
          if (this.navigationStackUtils.getLastBackUrl()) {
            this.router.navigate(this.navigationStackUtils.popNavigationStack().backUrl);
          } else {
            this.router.navigate(['/contacts']);
          }
        });
    } else {
      user._id = this.contactId;
      this.userService.save(user)
        .subscribe(item => {
          console.log('item', item);
          this.router.navigate(['/contacts']);
        });
    }
  }

  public onCancel() {
    this.clearStorageService();
    let backUrl = this.navigationStackUtils.getLastBackUrl();
    if (backUrl === null) {
      this.router.navigate(['/contacts']);
    } else {
      this.navigationStackUtils.popNavigationStack();
      this.router.navigate(backUrl);
    }
  }

  get phoneNumber() {
    return this.contactForm.get('phoneNumber');
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
