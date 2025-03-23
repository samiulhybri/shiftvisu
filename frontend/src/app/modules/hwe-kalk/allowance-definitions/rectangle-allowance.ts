export class RectangleAllowance {
	private rowRanges: number[][] = [
		[0, 3500],
		[3501, 6000],
		[6001, Infinity],
	];

	private columnRanges: [number, number][] = [
		[40, 62],
		[63, 79],
		[80, 99],
		[100, 124],
		[125, 159],
		[160, 199],
		[200, 249],
		[250, 314],
		[315, 399],
		[400, 499],
		[500, 629],
		[630, 799],
		[800, 999],
		[1000, 1199],
		[1200, 1399],
		[1400, 1599],
		[1600, 1800],
	];

	private grid: { crossSection: number; length: number, crossSectionTolerance: any, lengthTolerance: number }[][] = [
		[
			{ crossSection: 8, length: 12, crossSectionTolerance: 1.7, lengthTolerance: 3 },
			{ crossSection: 8, length: 14, crossSectionTolerance: 1.7, lengthTolerance: 3 },
			{ crossSection: 8, length: 15, crossSectionTolerance: 1.7, lengthTolerance: 4 },
			{ crossSection: 10, length: 16, crossSectionTolerance: 2, lengthTolerance: 3 },
			{ crossSection: 12, length: 18, crossSectionTolerance: 2.3, lengthTolerance: 3 },
			{ crossSection: 14, length: 20, crossSectionTolerance: 2.8, lengthTolerance: 0 },
			{ crossSection: 17, length: 23, crossSectionTolerance: 3.4, lengthTolerance: 0 },
			{ crossSection: 21, length: 26, crossSectionTolerance: 4.2, lengthTolerance: 0 },
			{ crossSection: 26, length: 30, crossSectionTolerance: 5.1, lengthTolerance: 0 },
			{ crossSection: 32, length: 36, crossSectionTolerance: 6.3, lengthTolerance: 0 },
			{ crossSection: 39, length: 42, crossSectionTolerance: 7.8, lengthTolerance: 0 },
			{ crossSection: 49, length: 52, crossSectionTolerance: 9.8, lengthTolerance: 0 },
			{ crossSection: 61, length: 63, crossSectionTolerance: 12.1, lengthTolerance: 0 },
			{ crossSection: 74, length: 80, crossSectionTolerance: 15, lengthTolerance: 0 },
			{ crossSection: 85, length: 95, crossSectionTolerance: 17, lengthTolerance: 0 },
			{ crossSection: 98, length: 110, crossSectionTolerance: 20, lengthTolerance: 0 },
			{ crossSection: 110, length: 130, crossSectionTolerance: 22, lengthTolerance: 0 },
		],
		[
			{ crossSection: 0, length: 0, crossSectionTolerance: 0, lengthTolerance: 0 },
			{ crossSection: 0, length: 0, crossSectionTolerance: 0, lengthTolerance: 0 },
			{ crossSection: 12, length: 20, crossSectionTolerance: 3.6, lengthTolerance: 6 },
			{ crossSection: 13, length: 21, crossSectionTolerance: 4, lengthTolerance: 6 },
			{ crossSection: 15, length: 22, crossSectionTolerance: 4.6, lengthTolerance: 7 },
			{ crossSection: 18, length: 25, crossSectionTolerance: 5.2, lengthTolerance: 8 },
			{ crossSection: 21, length: 27, crossSectionTolerance: 6, lengthTolerance: 8 },
			{ crossSection: 24, length: 30, crossSectionTolerance: 7, lengthTolerance: 9 },
			{ crossSection: 29, length: 35, crossSectionTolerance: 8.4, lengthTolerance: 11 },
			{ crossSection: 35, length: 40, crossSectionTolerance: 10, lengthTolerance: 11 },
			{ crossSection: 42, length: 47, crossSectionTolerance: 12, lengthTolerance: 14 },
			{ crossSection: 52, length: 55, crossSectionTolerance: 14.9, lengthTolerance: 16 },
			{ crossSection: 64, length: 66, crossSectionTolerance: 18.1, lengthTolerance: 19 },
			{ crossSection: 85, length: 95, crossSectionTolerance: 17, lengthTolerance: 0 },
			{ crossSection: 100, length: 115, crossSectionTolerance: 20, lengthTolerance: 0 },
			{ crossSection: 114, length: 130, crossSectionTolerance: 23, lengthTolerance: 0 },
			{ crossSection: 128, length: 150, crossSectionTolerance: 26, lengthTolerance: 0 },
		],
		[
			{ crossSection: 0, length: 0, crossSectionTolerance: 0, lengthTolerance: 0 },
			{ crossSection: 0, length: 0, crossSectionTolerance: 0, lengthTolerance: 0 },
			{ crossSection: 0, length: 0, crossSectionTolerance: 0, lengthTolerance: 0 },
			{ crossSection: 0, length: 0, crossSectionTolerance: 0, lengthTolerance: 0 },
			{ crossSection: 19, length: 24, crossSectionTolerance: 5.4, lengthTolerance: 8 },
			{ crossSection: 21, length: 26, crossSectionTolerance: 6.3, lengthTolerance: 7 },
			{ crossSection: 24, length: 29, crossSectionTolerance: 7.2, lengthTolerance: 9 },
			{ crossSection: 28, length: 32, crossSectionTolerance: 8.4, lengthTolerance: 10 },
			{ crossSection: 33, length: 36, crossSectionTolerance: 10, lengthTolerance: 11 },
			{ crossSection: 40, length: 42, crossSectionTolerance: 11.9, lengthTolerance: 13 },
			{ crossSection: 48, length: 49, crossSectionTolerance: 14.3, lengthTolerance: 17 },
			{ crossSection: 58, length: 58, crossSectionTolerance: 17.4, lengthTolerance: 17 },
			{ crossSection: 0, length: 0, crossSectionTolerance: 0, lengthTolerance: 0 },
			{ crossSection: 0, length: 0, crossSectionTolerance: 0, lengthTolerance: 0 },
			{ crossSection: 0, length: 0, crossSectionTolerance: 0, lengthTolerance: 0 },
			{ crossSection: 0, length: 0, crossSectionTolerance: 0, lengthTolerance: 0 },
			{ crossSection: 0, length: 0, crossSectionTolerance: 0, lengthTolerance: 0 },
		]
	];

	findValue(rowValue: number, columnValue: number) {
		const rowIndex = this.findRowIndex(rowValue);
		const columnIndex = this.findColumnIndex(columnValue);

		if (rowIndex === undefined || columnIndex === undefined) {
			return undefined;
		}

		if (
			rowIndex >= 0 &&
			rowIndex < this.grid.length &&
			columnIndex >= 0 &&
			columnIndex < this.grid[rowIndex].length
		) {
			const gridValue = this.grid[rowIndex][columnIndex];
			return gridValue;
		}

		return undefined;
	}

	private findRowIndex(rowValue: number) {
		for (let i = 0; i < this.rowRanges.length; i++) {
			const [min, max] = this.rowRanges[i];
			if (rowValue >= min && rowValue <= max) {
				return i;
			}
		}

		return undefined;
	}

	private findColumnIndex(columnValue: number) {
		for (let i = 0; i < this.columnRanges.length; i++) {
			const [min, max] = this.columnRanges[i];
			if (columnValue >= min && columnValue <= max) {
				return i;
			}
		}

		return undefined;
	}
}
