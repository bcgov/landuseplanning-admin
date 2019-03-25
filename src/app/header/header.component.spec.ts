import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from 'app/services/api';
import { KeycloakService } from 'app/services/keycloak.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const mockKeycloakService = {
    isValidForSite: () => {
      return true;
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ApiService }, { provide: KeycloakService, useValue: mockKeycloakService }],
      declarations: [HeaderComponent],
      imports: [RouterTestingModule, BrowserAnimationsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
