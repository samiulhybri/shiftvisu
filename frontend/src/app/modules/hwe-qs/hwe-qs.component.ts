import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { Base } from "@app/shared/classes/base";
import { GENERAL_SETTING } from "@app/shared/setting/general-setting";
import { CldrIntlService } from "@progress/kendo-angular-intl";

@Component({
  selector: "app-hwe-qs",
  templateUrl: "./hwe-qs.component.html",
  styleUrls: ["./hwe-qs.component.scss"],
})
export class HweQsComponent extends Base {
  public sidebarMenu = this.getSidebar();

  public headerFirstTitle = "hwe";
  public headerSecondTitle = "qs";

  public setting = GENERAL_SETTING;

  constructor(protected router: Router, intlService: CldrIntlService) {
    super(intlService);
  }

  /**
   * Return route with necessary information
   * @returns
   */
  public getSidebar(): any[] {
    return [
      {
				id: 0,
				text: $localize`Sample Numbers`,
				path: '/hwe-qs/sample-numbers',
				imgPath: 'png/sample-numbers.png'
			},
			{
				id: 1,
				text: $localize`US Norms`,
				path: '/hwe-qs/us-norms',
				imgPath: 'png/sample-numbers.png'
			},
			{
				id: 2,
				text: $localize`MT Norms`,
				path: '/hwe-qs/mt-norms',
				imgPath: 'png/sample-numbers.png'
			},
			{
				id: 3,
				text: $localize`PT Norms`,
				path: '/hwe-qs/pt-norms',
				imgPath: 'png/sample-numbers.png'
			},
			{
				id: 4,
				text: $localize`VT Norms`,
				path: '/hwe-qs/vt-norms',
				imgPath: 'png/sample-numbers.png'
			},
		    {
				id: 5,
				text: $localize`Melt Analysis`,
				path: '/hwe-qs/melt-analyses',
				imgPath: 'png/sample-numbers.png'
			},
		   {
				id: 5,
				text: $localize`Hwe Certificates`,
				path: '/hwe-qs/hwe-certificates',
				imgPath: 'png/sample-numbers.png'
			}
    ];
  }
}
