import { Component } from '@angular/core';
import { Localization } from "@app/shared/utils/common-localize";
@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrl: './general-settings.component.css'
})
export class GeneralSettingsComponent {
	localization = Localization;
}
