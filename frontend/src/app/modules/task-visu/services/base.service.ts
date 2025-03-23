import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class BaseService {
  constructor() {}

  public getSidebar(): any {
    return [
      {
        id: 0,
        text: $localize`My Task`,
        path: "/task-visu/my-task",
        // icon: 'k-i-user'
      },
      {
        id: 1,
        text: $localize`Team Task`,
        path: "/task-visu/team-task",
      },
      { 
        id: 2,
        text: $localize`Assigned Task`,
        path: "/task-visu/assigned-task",
      },
      {
        id: 3,
        text: $localize`Meeting`,
        path: "/task-visu/meeting",
      },
      {
        id: 4,
        text: $localize`Project`,
        path: "/task-visu/project",
      },
      {
        id: 5,
        text: $localize`Regular Meeting`,
        path: "/task-visu/regular-meeting",
      },
    ];
  }
}
