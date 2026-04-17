import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { StateStorageService } from 'app/core/auth/state-storage.service';
import { ApplicationConfigService } from '../config/application-config.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly stateStorageService = inject(StateStorageService);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const serverApiUrl = this.applicationConfigService.getEndpointFor('');
    const token: string | null = this.stateStorageService.getAuthenticationToken();

    let shouldAttachToken = false;
    if (token) {
      if (!request.url) {
        shouldAttachToken = false; // Cannot attach token if URL is missing
      } else if (!request.url.startsWith('http')) {
        // Relative URL: Attach token if it's an API call (e.g., /api/account)
        shouldAttachToken = request.url.startsWith('/api/');
      } else {
        // Absolute URL:
        // 1. Attach token if it directly targets the backend API URL (e.g., http://localhost:8080/api/account)
        shouldAttachToken = request.url.startsWith(serverApiUrl);

        // 2. If not already decided, check if it targets the current frontend host (e.g., http://localhost:4280/api/account)
        // This covers proxied API calls made with absolute URLs during development
        if (!shouldAttachToken && request.url.startsWith(window.location.origin)) {
          shouldAttachToken = request.url.includes('/api/');
        }
      }
    }

    if (shouldAttachToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return next.handle(request);
  }
}