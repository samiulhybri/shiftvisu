import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
@Injectable({
	providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {
	constructor() { }
	intercept(
		request: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		if (request.headers.get("skip")) {
			request = request.clone({
				headers: request.headers.delete('skip')
			});
			return next.handle(request);
		}
		
		const laravelToken = new URLSearchParams(window.location.search).get('LaravelToken');
		if (laravelToken) {
			localStorage.setItem('LaravelToken', laravelToken);
			window.history.replaceState({}, document.title, window.location.pathname);
		}

		const token = localStorage.getItem('LaravelToken');
		if (token) {
			request = request.clone({
				setHeaders: {
					Authorization: `Bearer ${token}`,
				},
			});
		}
		return next.handle(request).pipe(
			catchError((err) => {
				if (err.status === 401) {

				}
				const error = err.error.message || err.statusText;
				return throwError(error);
			})
		);
	}
}
