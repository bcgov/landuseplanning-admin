import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOrganizationComponent } from './select-organization.component';

import { NgxPaginationModule } from 'ngx-pagination';
import { DialogService } from 'ng2-bootstrap-modal';
import { SearchService } from 'app/services/search.service';
import { ApiService } from 'app/services/api';
import { of } from 'rxjs';
import { Client } from 'app/models/client';

describe('SelectOrganizationComponent', () => {
  let component: SelectOrganizationComponent;
  let fixture: ComponentFixture<SelectOrganizationComponent>;

  const mockSearchService = jasmine.createSpyObj('SearchService', [
    'getClientsByDTID'
  ]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectOrganizationComponent],
      imports: [ NgxPaginationModule ],
      providers: [
        DialogService,
        { provide: SearchService, useValue: mockSearchService },
        { provide: ApiService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectOrganizationComponent);
    component = fixture.componentInstance;

    mockSearchService.getClientsByDTID.and.returnValue(
      of([
        new Client()
      ])
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
