import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { LogiVisuRoutingModule } from "@app/modules/logi-visu/logi-visu-routing.module";
import { LogiVisuComponent } from "@app/modules/logi-visu/logi-visu.component";
import { ForkliftComponent } from "@app/modules/logi-visu/forklift/forklift.component";
import { SharedModule } from "@app/shared/shared.module";
import { InputComponent } from "@ui5/webcomponents-ngx/main/input";

import { FormsModule } from "@angular/forms";
import { MultiInputComponent } from "@ui5/webcomponents-ngx";

@NgModule({
	declarations: [LogiVisuComponent, ForkliftComponent],
	imports: [CommonModule, LogiVisuRoutingModule, SharedModule, InputComponent, FormsModule, MultiInputComponent],
})
export class LogiVisuModule {}
