import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VarDirective } from './ng-var.directive';

describe('VarDirective', () => {
  let directive: VarDirective;
  let fixture: ComponentFixture<VarDirective>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VarDirective);
    directive = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(directive).toBeTruthy();
  });
});
