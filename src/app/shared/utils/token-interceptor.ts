import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { KeycloakService } from 'app/services/keycloak.service';
import { Observable, Subject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

/**
 * Intercepts all http requests and allows for the request and/or response to be manipulated.
 *
 * @export
 * @class TokenInterceptor
 * @implements {HttpInterceptor}
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private refreshTokenInProgress: Boolean = false;

  private tokenRefreshedSource = new Subject();
  private tokenRefreshed$ = this.tokenRefreshedSource.asObservable();

  constructor(private auth: KeycloakService) {}

  /**
   * Main request intercept handler to automatically add the bearer auth token to every request.
   * If the auth token expires mid-request, the requests 403 response will be caught, the auth token will be refreshed, and the request will be re-tried.
   *
   * @param {HttpRequest<any>} request
   * @param {HttpHandler} next
   * @returns {Observable<HttpEvent<any>>}
   * @memberof TokenInterceptor
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.addAuthHeader(request);

    return next.handle(request).catch(error => {
      console.log('request error status', error.status)
      if (error.status === 403) {
        return this.refreshToken().pipe(
          switchMap(() => {
            request = this.addAuthHeader(request);
            return next.handle(request);
          }),
          catchError((err) => {
            console.log('error starting local refreshToken method')
            return Observable.throw(err);
          })
        );
      }
      return Observable.throw(error);
    });
  }

  /**
   * Fetches and adds the bearer auth token to the request.
   *
   * @private
   * @param {HttpRequest<any>} request to modify
   * @returns {HttpRequest<any>}
   * @memberof TokenInterceptor
   */
  private addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const authToken: string = this.auth.getToken() || '';

    request = request.clone({
      setHeaders: { Authorization: 'Bearer ' + authToken }
    });

    return request;
  }

  /**
   * Attempts to refresh the auth token.
   *
   * @private
   * @returns {Observable<any>}
   * @memberof TokenInterceptor
   */
  private refreshToken(): Observable<any> {
    console.log('attempting to refresh token in interceptor')
    if (this.refreshTokenInProgress) {
      console.log('refresh in progress')
      return new Observable(observer => {
        this.tokenRefreshed$.subscribe(() => {
          observer.next();
          observer.complete();
        });
      });
    } else {
      this.refreshTokenInProgress = true;
      console.log('beginning token refresh', this.auth.allTokens());

      return this.auth.refreshToken().pipe(
        tap(() => {
          this.refreshTokenInProgress = false;
          this.tokenRefreshedSource.next();
        })
      );
    }
  }
}
