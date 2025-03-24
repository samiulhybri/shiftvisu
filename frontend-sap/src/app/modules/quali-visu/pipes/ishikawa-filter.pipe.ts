import { Pipe, PipeTransform } from "@angular/core";
import { EightDReportIshikawa } from "@app/shared/models/eight-d-report-ishikawa.model";
import { EightDReportIshikawaCategory } from "@app/shared/enums/EightDReportIshikawaCategory";

@Pipe({
	name: "ishikawaFilter",
})
export class IshikawaFilterPipe implements PipeTransform {
	transform(data: EightDReportIshikawa[], category: EightDReportIshikawaCategory): unknown {
		return data.filter(d => d.category == category);
	}
}
