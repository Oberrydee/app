import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(private readonly authenticationService: AuthenticationService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authenticationService.getToken();
    const isApiRequest = request.url.startsWith(environment.apiBaseUrl);

    if (!token || !isApiRequest) {
      return next.handle(request);
    }

    return next.handle(
      request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    );
  }
}
