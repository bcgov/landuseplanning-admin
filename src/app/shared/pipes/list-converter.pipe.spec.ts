import { ListConverterPipe } from './list-converter.pipe';
import { TestBed } from '@angular/core/testing';

describe('ListConverterPipe', () => {
  it('create an instance', () => {
    const pipe: ListConverterPipe = TestBed.get(ListConverterPipe);
    expect(pipe).toBeTruthy();
  });
});
