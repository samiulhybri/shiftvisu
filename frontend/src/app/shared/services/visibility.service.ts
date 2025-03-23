import { Injectable } from '@angular/core';
import { distinctUntilChanged, fromEvent, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VisibilityService {
  /// Emits true when the page is visible, false otherwise.
  visibilityChange = fromEvent(document, 'visibilitychange').pipe(
    map(() => document.visibilityState === 'visible'),
    distinctUntilChanged()
  );
}
