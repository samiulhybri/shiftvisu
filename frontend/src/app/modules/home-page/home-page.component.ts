import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  public languageList: any = ['en', 'it', 'de'];
  public selectedLanguage: any = 'en';
  modules: any[] = [
    {
      routerLink: ['/hwe-kalk'],
      firstName: 'hwe',
      secondName: 'kalk'
    },
    {
      routerLink: ['/hwe-qs'],
      firstName: 'hwe',
      secondName: 'qs'
    },
    {
      routerLink: ['/plan-visu'],
      firstName: 'plan',
      secondName: 'visu'
    },
    {
      routerLink: ['/mp-offers'],
      firstName: 'mp',
      secondName: 'offers'
    },
    {
      routerLink: ['/melt-visu'],
      firstName: 'melt',
      secondName: 'visu'
    },
    {
      routerLink: ['/ener-visu'],
      firstName: 'ener',
      secondName: 'visu'
    },
    {
      routerLink: ['/task-visu'],
      firstName: 'task',
      secondName: 'visu'
    },
    {
      routerLink: ['/chat'],
      firstName: 'news',
      secondName: 'board'
    }
  ];



}
