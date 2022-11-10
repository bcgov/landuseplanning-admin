import { Component, OnInit, OnDestroy } from '@angular/core';
import { Topic } from 'app/models/topic';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
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
  public phonePattern;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationStackUtils: NavigationStackUtils,
    private storageService: StorageService,
    private userService: UserService
  ) { }

  /**
   * Get the data for the contact and populate form if editing existing contact.
   * 
   * @return {void}
   */
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

  /**
   * When the contact view is loaded, preserve and existing and amend to the breadcrumbs.
   * Also, update the navigation stack with the add contact link.
   * 
   * @return {void}
   */
  private setBreadcrumbs(): void {
    if (!this.isEditing) {
      if (this.navigationObject) {
        // We're coming from a different component so we have to preserve our nav stack.
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

  /**
   * Take User data and populate a form with it.
   * 
   * @param {User} data The user data to populate into the contact form.
   * @return {void}
   */
  private buildForm(data): void {
    this.contactForm = new FormGroup({
      'firstName': new FormControl(data.firstName),
      'lastName': new FormControl(data.lastName),
      'email': new FormControl(data.email),
      'phoneNumber': new FormControl(data.phoneNumber)
    });
  }

  /**
   * Clear storage service of contact data.
   * 
   * @return {void}
   */
  private clearStorageService(): void {
    this.storageService.state.contactForm = null;
  }

  /**
   * Handle the form submission by validating certain aspects of the form,
   * preparing the data, then posting it to the API.
   * 
   * @returns {void}
   */
  public onSubmit(): void {
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
          this.router.navigate(['/contacts']);
        });
    }
  }

  /**
   * When the user hits "cancel" exit this view and return the user to the contacts overview
   * page or to their previous position in the navigation stack.
   * 
   * @return {void}
   */
  public onCancel(): void {
    this.clearStorageService();
    let backUrl = this.navigationStackUtils.getLastBackUrl();
    if (backUrl === null) {
      this.router.navigate(['/contacts']);
    } else {
      this.navigationStackUtils.popNavigationStack();
      this.router.navigate(backUrl);
    }
  }

  /**
   * Getter for the phoneNumber form entry.
   * 
   * @return {AbstractControl}
   */
  get phoneNumber(): AbstractControl {
    return this.contactForm.get('phoneNumber');
  }

  /**
   * Terminate subscriptions when component is unmounted.
   * 
   * @return {void}
   */
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
