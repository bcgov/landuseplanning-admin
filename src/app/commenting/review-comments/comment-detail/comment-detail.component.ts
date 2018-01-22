import { Component, OnInit } from '@angular/core';

import { Comment } from '../../../models/comment';
import { CommentService } from '../../../services/comment.service';

@Component({
  selector: 'app-comment-detail',
  templateUrl: './comment-detail.component.html',
  styleUrls: ['./comment-detail.component.scss']
})

export class CommentDetailComponent implements OnInit {
  public comment: Comment;

  constructor() { }

  ngOnInit() {
    this.comment = new Comment();
    this.comment.comment = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore 
    magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
    irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non 
    proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab 
    illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur 
    aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui 
    dolorem  ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore 
    magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut 
    aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae 
    consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?`;
    this.comment.commentAuthor = {
      _userId: null,
      orgName: 'Organization Name',
      contactName: 'Contact Name',
      location: 'Location',
      requestedAnonymous: true,
      internal: {
        email: 'john.doe@email.com',
        phone: '604-123-4567'
      }
    };
    // ref: https://momentjs.com/
    // this.comment.dateAdded = moment('2017-12-31T03:45:00Z').tz('America/Vancouver');
    this.comment.dateAdded = new Date('2017-12-31T03:45:00Z');
  }

  getStatus(comment: Comment) {
    if (comment && comment.commentStatus === 'Accepted') {
      return 'badge-success';
    } else if (comment && comment.commentStatus === 'Rejected') {
      return 'badge-danger';
    } else {
      return 'badge-secondary';
    }
  }

  accept(comment: Comment) {
  }

  reject(comment: Comment) {
  }

  save(comment: Comment) {
  }

  reset(comment: Comment) {
  }

}
