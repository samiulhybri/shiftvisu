import { objectsDeepEqual } from "@app/shared/utils/compare-objects-deep";

export function returnChanges(initialObject: any, updatedObject: any) {
	let result: any = {};
	Object.keys(updatedObject).forEach(c => {
		if (!objectsDeepEqual((initialObject as any)[c], (updatedObject as any)[c])) {
			result[c] = (updatedObject as any)[c];
		}
	});

	return result;
}
