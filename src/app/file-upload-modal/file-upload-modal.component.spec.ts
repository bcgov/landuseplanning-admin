import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FileUploadModalComponent } from './file-upload-modal.component';

describe('FileUploadModalComponent', () => {
  let component: FileUploadModalComponent;
  let fixture: ComponentFixture<FileUploadModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileUploadModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Basic smoke test.
  it('Should render the component.', () => {
    expect(component).toBeTruthy();
  });

  it('The select file handler should be called when a ', fakeAsync(() => {
    spyOn(component, 'handleSelect');

    let button = fixture.debugElement.nativeElement.querySelector('.file');
    button.click();
    tick();
    expect(component.handleSelect).toHaveBeenCalled();

  }));
});
