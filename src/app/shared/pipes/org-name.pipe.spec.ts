import { OrgNamePipe } from './org-name.pipe';
import { TestBed } from '@angular/core/testing';

describe('OrgNamePipe', () => {
  it('create an instance', () => {
    const pipe: OrgNamePipe = TestBed.get(OrgNamePipe);
    expect(pipe).toBeTruthy();
  });
});
