import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Do not log cookies or sensitive data
    const cloned = req.clone();
    return next.handle(cloned).pipe(
      catchError((err: HttpErrorResponse) => {
        // Centralized error handling: refresh user state on 401
        if (err.status === 401) {
          this.auth.loadMe();
        }
        return throwError(() => err);
      })
    );
  }
}
