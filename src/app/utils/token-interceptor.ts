import { Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
  HttpInterceptor
} from '@angular/common/http';

import { KeycloakService } from 'app/services/keycloak.service';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private auth: KeycloakService) {

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.auth.getToken() || '';
    // console.log('Interceptor Token:', authToken);
    request = request.clone({
      setHeaders: {
        'Authorization': 'Bearer ' + authToken
      }
    });
    return next.handle(request);
    // TODO: Handle failed requests gracefully/pop a modal/other
    // return next.handle(request).pipe(tap(
    //   (err: any) => {
    //     if (err instanceof HttpErrorResponse) {
    //       console.log(err);
    //       if (err.status === 401) {
    //         // this.router.navigate(['/login']);
    //       }
    //     }
    //   }
    // ),catchError(e => {
    //   if (e instanceof HttpErrorResponse) {
    //       console.log('Processing http error', e);
    //       if (e.status === 403) {
    //         // this.router.navigate(['/login']);
    //       }
    //     }
    //     return _throw(e);
    //   })
    // );
  }
}
