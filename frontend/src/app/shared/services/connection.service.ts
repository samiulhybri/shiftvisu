import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ConnectionService {
    private connectionMonitor: Observable<boolean>;

    constructor() {
        this.connectionMonitor = new Observable((observer) => {
            window.addEventListener('offline', (e) => {
                observer.next(false);
            });
            window.addEventListener('online', (e) => {
                observer.next(true);
            });
            observer.next(navigator.onLine);
        });
    }

    public monitor(): Observable<boolean> {
        return this.connectionMonitor;
    }
}

// Usage

// this.connection.monitor().pipe(
//     takeUntil(this.destroyed),
//   ).subscribe(connected => {
//     this.isConnected = connected;
// });
