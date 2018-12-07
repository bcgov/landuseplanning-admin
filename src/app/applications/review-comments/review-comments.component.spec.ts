import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { ReviewCommentsComponent } from './review-comments.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { CommentDetailComponent } from './comment-detail/comment-detail.component';
import { CommentService } from 'app/services/comment.service';
import { ExcelService } from 'app/services/excel.service';
import { ApiService } from 'app/services/api';

@Component({selector: 'app-comment-detail', template: ''})
class CommentDetailStubComponent { 
  @Input() comment: Comment;
}


xdescribe('ReviewCommentsComponent', () => {
  let component: ReviewCommentsComponent;
  let fixture: ComponentFixture<ReviewCommentsComponent>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule, RouterTestingModule, FormsModule],
      declarations: [ReviewCommentsComponent, NewlinesPipe, CommentDetailStubComponent],
      providers: [
        { provide: CommentService },
        { provide: ExcelService },
        { provide: ApiService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
