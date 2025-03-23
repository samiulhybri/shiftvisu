export class ShaftAllowance {
	private rowRanges: number[][] = [
		[0, 3000],
		[3001, 4500],
		[4501, 6000],
	];

	private columnRanges: number[][] = [
		[0, 120],
		[121, 135],
		[136, 160],
		[161, 175],
		[176, 190],
		[191, 210],
		[211, 230],
		[231, 245],
		[246, 260],
		[261, 280],
		[281, 300],
		[301, 320],
		[321, 340],
		[341, 360],
		[361, 400],
		[401, 420],
		[421, 440],
		[441, 460],
		[461, 480],
		[481, 500],
		[501, 525],
		[526, 550],
		[551, 575],
		[576, 600],
		[601, 625],
		[626, 650],
		[651, 680],
		[681, 710],
		[711, 740],
		[741, 770],
		[771, 800],
		[801, 825],
		[826, 850],
		[851, 875],
		[876, 900],
		[901, 925],
		[926, 950],
		[951, 975],
		[976, 1000],
		[1001, 1025],
		[1026, 1050],
		[1051, 1075],
		[1076, 1100],
		[1101, 1125],
		[1126, 1150],
		[1151, 1175],
		[1176, 1200],
	];

	// Tolarence values can be adjusted with a tolerance of (+) or (-)
	private grid: { diameter: number; length: number, diameterTolerance: number, lengthTolerance: number}[][] = [
		[
			{ diameter: 0, length: 0, diameterTolerance: 0, lengthTolerance: 0 },
			{ diameter: 20, length: 23, diameterTolerance: 4, lengthTolerance: 6 },
			{ diameter: 21, length: 24, diameterTolerance: 4, lengthTolerance: 6 },
			{ diameter: 22, length: 25, diameterTolerance: 4, lengthTolerance: 6 },
			{ diameter: 23, length: 26, diameterTolerance: 5, lengthTolerance: 7 },
			{ diameter: 24, length: 27, diameterTolerance: 5, lengthTolerance: 7 },
			{ diameter: 25, length: 28, diameterTolerance: 5, lengthTolerance: 7 },
			{ diameter: 26, length: 29, diameterTolerance: 5, lengthTolerance: 7 },
			{ diameter: 27, length: 30, diameterTolerance: 5, lengthTolerance: 8 },
			{ diameter: 28, length: 31, diameterTolerance: 6, lengthTolerance: 8 },
			{ diameter: 29, length: 32, diameterTolerance: 6, lengthTolerance: 8 },
			{ diameter: 30, length: 33, diameterTolerance: 6, lengthTolerance: 8 },
			{ diameter: 31, length: 34, diameterTolerance: 6, lengthTolerance: 9 },
			{ diameter: 32, length: 35, diameterTolerance: 6, lengthTolerance: 9 },
			{ diameter: 33, length: 36, diameterTolerance: 7, lengthTolerance: 9 },
			{ diameter: 34, length: 37, diameterTolerance: 7, lengthTolerance: 9 },
			{ diameter: 35, length: 39, diameterTolerance: 7, lengthTolerance: 10 },
			{ diameter: 36, length: 41, diameterTolerance: 7, lengthTolerance: 10 },
			{ diameter: 37, length: 43, diameterTolerance: 7, lengthTolerance: 11 },
			{ diameter: 38, length: 45, diameterTolerance: 8, lengthTolerance: 11 },
			{ diameter: 39, length: 46, diameterTolerance: 8, lengthTolerance: 12 },
			{ diameter: 40, length: 47, diameterTolerance: 8, lengthTolerance: 12 },
			{ diameter: 41, length: 48, diameterTolerance: 8, lengthTolerance: 12 },
			{ diameter: 42, length: 49, diameterTolerance: 8, lengthTolerance: 12 },
			{ diameter: 43, length: 50, diameterTolerance: 9, lengthTolerance: 13 },
			{ diameter: 44, length: 51, diameterTolerance: 9, lengthTolerance: 13 },
			{ diameter: 45, length: 52, diameterTolerance: 9, lengthTolerance: 13 },
			{ diameter: 46, length: 53, diameterTolerance: 9, lengthTolerance: 13 },
			{ diameter: 47, length: 54, diameterTolerance: 9, lengthTolerance: 14 },
			{ diameter: 48, length: 55, diameterTolerance: 10, lengthTolerance: 14 },
			{ diameter: 49, length: 56, diameterTolerance: 10, lengthTolerance: 14 },
			{ diameter: 50, length: 57, diameterTolerance: 10, lengthTolerance: 14 },
			{ diameter: 51, length: 59, diameterTolerance: 10, lengthTolerance: 15 },
			{ diameter: 52, length: 61, diameterTolerance: 10, lengthTolerance: 15 },
			{ diameter: 53, length: 63, diameterTolerance: 11, lengthTolerance: 16 },
			{ diameter: 54, length: 65, diameterTolerance: 11, lengthTolerance: 16 },
			{ diameter: 55, length: 67, diameterTolerance: 11, lengthTolerance: 17 },
			{ diameter: 56, length: 69, diameterTolerance: 11, lengthTolerance: 17 },
			{ diameter: 57, length: 71, diameterTolerance: 11, lengthTolerance: 18 },
			{ diameter: 58, length: 72, diameterTolerance: 12, lengthTolerance: 18 },
			{ diameter: 59, length: 74, diameterTolerance: 12, lengthTolerance: 19 },
			{ diameter: 60, length: 76, diameterTolerance: 12, lengthTolerance: 19 },
			{ diameter: 61, length: 78, diameterTolerance: 12, lengthTolerance: 20 },
			{ diameter: 62, length: 80, diameterTolerance: 12, lengthTolerance: 20 },
			{ diameter: 63, length: 82, diameterTolerance: 13, lengthTolerance: 21 },
			{ diameter: 64, length: 84, diameterTolerance: 13, lengthTolerance: 21 },
			{ diameter: 65, length: 86, diameterTolerance: 13, lengthTolerance: 22 }
		],		
		[
			{ diameter: 0, length: 0, diameterTolerance: 0, lengthTolerance: 0 },
			{ diameter: 25, length: 25, diameterTolerance: 5, lengthTolerance: 6 },
			{ diameter: 26, length: 26, diameterTolerance: 5, lengthTolerance: 7 },
			{ diameter: 27, length: 27, diameterTolerance: 5, lengthTolerance: 7 },
			{ diameter: 28, length: 28, diameterTolerance: 6, lengthTolerance: 7 },
			{ diameter: 29, length: 29, diameterTolerance: 6, lengthTolerance: 7 },
			{ diameter: 30, length: 30, diameterTolerance: 6, lengthTolerance: 8 },
			{ diameter: 31, length: 31, diameterTolerance: 6, lengthTolerance: 8 },
			{ diameter: 32, length: 32, diameterTolerance: 6, lengthTolerance: 8 },
			{ diameter: 33, length: 33, diameterTolerance: 7, lengthTolerance: 8 },
			{ diameter: 34, length: 34, diameterTolerance: 7, lengthTolerance: 9 },
			{ diameter: 35, length: 35, diameterTolerance: 7, lengthTolerance: 9 },
			{ diameter: 36, length: 36, diameterTolerance: 7, lengthTolerance: 9 },
			{ diameter: 37, length: 37, diameterTolerance: 7, lengthTolerance: 9 },
			{ diameter: 38, length: 38, diameterTolerance: 8, lengthTolerance: 10 },
			{ diameter: 39, length: 39, diameterTolerance: 8, lengthTolerance: 10 },
			{ diameter: 40, length: 41, diameterTolerance: 8, lengthTolerance: 10 },
			{ diameter: 41, length: 43, diameterTolerance: 8, lengthTolerance: 11 },
			{ diameter: 42, length: 45, diameterTolerance: 8, lengthTolerance: 11 },
			{ diameter: 43, length: 47, diameterTolerance: 9, lengthTolerance: 12 },
			{ diameter: 44, length: 48, diameterTolerance: 9, lengthTolerance: 12 },
			{ diameter: 45, length: 49, diameterTolerance: 9, lengthTolerance: 12 },
			{ diameter: 46, length: 50, diameterTolerance: 9, lengthTolerance: 13 },
			{ diameter: 47, length: 51, diameterTolerance: 9, lengthTolerance: 13 },
			{ diameter: 48, length: 52, diameterTolerance: 10, lengthTolerance: 13 },
			{ diameter: 49, length: 53, diameterTolerance: 10, lengthTolerance: 13 },
			{ diameter: 50, length: 54, diameterTolerance: 10, lengthTolerance: 14 },
			{ diameter: 51, length: 55, diameterTolerance: 10, lengthTolerance: 14 },
			{ diameter: 52, length: 56, diameterTolerance: 10, lengthTolerance: 14 },
			{ diameter: 53, length: 57, diameterTolerance: 11, lengthTolerance: 14 },
			{ diameter: 54, length: 58, diameterTolerance: 11, lengthTolerance: 15 },
			{ diameter: 55, length: 59, diameterTolerance: 11, lengthTolerance: 15 },
			{ diameter: 56, length: 61, diameterTolerance: 11, lengthTolerance: 15 },
			{ diameter: 57, length: 63, diameterTolerance: 11, lengthTolerance: 16 },
			{ diameter: 58, length: 65, diameterTolerance: 12, lengthTolerance: 16 },
			{ diameter: 59, length: 67, diameterTolerance: 12, lengthTolerance: 17 },
			{ diameter: 60, length: 69, diameterTolerance: 12, lengthTolerance: 17 },
			{ diameter: 61, length: 71, diameterTolerance: 12, lengthTolerance: 18 },
			{ diameter: 62, length: 73, diameterTolerance: 12, lengthTolerance: 18 },
			{ diameter: 63, length: 74, diameterTolerance: 13, lengthTolerance: 19 },
			{ diameter: 64, length: 76, diameterTolerance: 13, lengthTolerance: 19 },
			{ diameter: 65, length: 78, diameterTolerance: 13, lengthTolerance: 20 },
			{ diameter: 66, length: 80, diameterTolerance: 13, lengthTolerance: 20 },
			{ diameter: 67, length: 82, diameterTolerance: 13, lengthTolerance: 21 },
			{ diameter: 68, length: 84, diameterTolerance: 14, lengthTolerance: 21 },
			{ diameter: 69, length: 86, diameterTolerance: 14, lengthTolerance: 22 },
			{ diameter: 70, length: 88, diameterTolerance: 14, lengthTolerance: 22 }
		],		
		[
			{ diameter: 0, length: 0, diameterTolerance: 0, lengthTolerance: 0 },
			{ diameter: 28, length: 28, diameterTolerance: 6, lengthTolerance: 7 },
			{ diameter: 29, length: 29, diameterTolerance: 6, lengthTolerance: 7 },
			{ diameter: 30, length: 30, diameterTolerance: 6, lengthTolerance: 8 },
			{ diameter: 31, length: 31, diameterTolerance: 6, lengthTolerance: 8 },
			{ diameter: 32, length: 32, diameterTolerance: 6, lengthTolerance: 8 },
			{ diameter: 33, length: 33, diameterTolerance: 7, lengthTolerance: 8 },
			{ diameter: 34, length: 34, diameterTolerance: 7, lengthTolerance: 9 },
			{ diameter: 35, length: 35, diameterTolerance: 7, lengthTolerance: 9 },
			{ diameter: 36, length: 36, diameterTolerance: 7, lengthTolerance: 9 },
			{ diameter: 37, length: 37, diameterTolerance: 7, lengthTolerance: 9 },
			{ diameter: 38, length: 38, diameterTolerance: 8, lengthTolerance: 10 },
			{ diameter: 39, length: 39, diameterTolerance: 8, lengthTolerance: 10 },
			{ diameter: 40, length: 40, diameterTolerance: 8, lengthTolerance: 10 },
			{ diameter: 41, length: 41, diameterTolerance: 8, lengthTolerance: 10 },
			{ diameter: 42, length: 42, diameterTolerance: 8, lengthTolerance: 11 },
			{ diameter: 43, length: 44, diameterTolerance: 9, lengthTolerance: 11 },
			{ diameter: 44, length: 46, diameterTolerance: 9, lengthTolerance: 12 },
			{ diameter: 45, length: 48, diameterTolerance: 9, lengthTolerance: 12 },
			{ diameter: 46, length: 50, diameterTolerance: 9, lengthTolerance: 13 },
			{ diameter: 47, length: 51, diameterTolerance: 9, lengthTolerance: 13 },
			{ diameter: 48, length: 52, diameterTolerance: 10, lengthTolerance: 13 },
			{ diameter: 49, length: 53, diameterTolerance: 10, lengthTolerance: 13 },
			{ diameter: 50, length: 54, diameterTolerance: 10, lengthTolerance: 14 },
			{ diameter: 51, length: 55, diameterTolerance: 10, lengthTolerance: 14 },
			{ diameter: 52, length: 56, diameterTolerance: 10, lengthTolerance: 14 },
			{ diameter: 53, length: 57, diameterTolerance: 11, lengthTolerance: 14 },
			{ diameter: 54, length: 58, diameterTolerance: 11, lengthTolerance: 15 },
			{ diameter: 55, length: 59, diameterTolerance: 11, lengthTolerance: 15 },
			{ diameter: 56, length: 60, diameterTolerance: 11, lengthTolerance: 15 },
			{ diameter: 57, length: 61, diameterTolerance: 11, lengthTolerance: 15 },
			{ diameter: 58, length: 62, diameterTolerance: 12, lengthTolerance: 16 },
			{ diameter: 59, length: 64, diameterTolerance: 12, lengthTolerance: 16 },
			{ diameter: 60, length: 66, diameterTolerance: 12, lengthTolerance: 17 },
			{ diameter: 61, length: 68, diameterTolerance: 12, lengthTolerance: 17 },
			{ diameter: 62, length: 70, diameterTolerance: 12, lengthTolerance: 18 },
			{ diameter: 63, length: 72, diameterTolerance: 13, lengthTolerance: 18 },
			{ diameter: 64, length: 74, diameterTolerance: 13, lengthTolerance: 19 },
			{ diameter: 65, length: 76, diameterTolerance: 13, lengthTolerance: 19 },
			{ diameter: 66, length: 77, diameterTolerance: 13, lengthTolerance: 19 },
			{ diameter: 67, length: 79, diameterTolerance: 13, lengthTolerance: 20 },
			{ diameter: 68, length: 81, diameterTolerance: 14, lengthTolerance: 20 },
			{ diameter: 69, length: 83, diameterTolerance: 14, lengthTolerance: 21 },
			{ diameter: 70, length: 85, diameterTolerance: 14, lengthTolerance: 21 },
			{ diameter: 71, length: 87, diameterTolerance: 14, lengthTolerance: 22 },
			{ diameter: 72, length: 89, diameterTolerance: 14, lengthTolerance: 22 },
			{ diameter: 73, length: 91, diameterTolerance: 15, lengthTolerance: 23 },
		]		
	];

	public findValue(rowValue: number, columnValue: number) {
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