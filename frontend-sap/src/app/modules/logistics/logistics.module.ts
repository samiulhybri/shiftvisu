import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogisticsRoutingModule } from '@app/modules/logistics/logistics-routing.module';
import { LogisticsComponent } from "@app/modules/logistics/logistics.component";
import { ForkliftComponent } from "@app/modules/logistics/forklift/forklift.component";
import { SharedModule } from '@app/shared/shared.module';
import { FormsModule } from '@angular/forms';


@NgModule({
	declarations: [LogisticsComponent, ForkliftComponent],
	imports: [CommonModule, LogisticsRoutingModule, SharedModule, FormsModule],
})
export class LogisticsModule {}
