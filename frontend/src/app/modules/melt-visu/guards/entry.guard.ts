import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { MeltVisuService } from '../service/melt-visu.service';

// This guard helps to ensure that only valid id values are passed to the EntryComponent route and prevents the user from accessing the route with invalid id values.

@Injectable({
  providedIn: 'root'
})
export class EntryGuard implements CanActivate {
  constructor(private router: Router, private meltVisuService: MeltVisuService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const id: string = route.params['id'];
      const isOnlyDigit: boolean = (/^\d+$/.test(id)); // check if id string contains only digits

      if (id && isOnlyDigit) {
        return true;
      } else {
        this.router.navigate([this.meltVisuService.overviewNavigationPath]);
        return false;
      }
  }
}
