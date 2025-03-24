/*
  Example Usage:
  * Author: Mr. Omer Arafat
  To retrieve Ring values for a given daFr value (e.g., 27),
  use the following code:
  
  const daFrValue = 27;
  const result = new RingAllowance().findValue(daFrValue);
  
  If a matching range is found, 'result' will contain the Ring object.
  Otherwise, it will be null.
*/

class Ring {
	constructor(
		public minDa: number,
		public maxDa: number,
		public da: number,
		public di: number,
		public h: number
	) { }
}

export class RingAllowance {
	private rangeValuesList: Ring[] = [
		new Ring(260, 320, 12, 12, 12),
		new Ring(320, 390, 12, 12, 12),
		new Ring(390, 470, 12, 12, 12),
		new Ring(470, 570, 12, 12, 12),
		new Ring(570, 670, 13, 13, 12),
		new Ring(670, 860, 13, 13, 13),
		new Ring(860, 1040, 14, 14, 13),
		new Ring(1040, 1210, 15, 15, 14),
		new Ring(1210, 1370, 16, 16, 15),
		new Ring(1370, 1520, 16, 16, 16),
		new Ring(1520, 1660, 17, 17, 17),
		new Ring(1660, 1790, 18, 18, 18),
		new Ring(1790, 1910, 19, 19, 18),
		new Ring(1910, 2020, 20, 20, 19),
		new Ring(2020, 2120, 20, 20, 20),
		new Ring(2120, 2210, 21, 21, 19),
		new Ring(2210, 2290, 22, 22, 20),
		new Ring(2290, 2370, 23, 23, 21),
		new Ring(2370, 2450, 23, 23, 21),
		new Ring(2450, 2530, 24, 24, 22),
		new Ring(2530, 2610, 25, 25, 23),
		new Ring(2610, 2690, 26, 26, 24),
		new Ring(2690, 2770, 27, 27, 25),
		new Ring(2770, 2850, 28, 28, 26),
		new Ring(2850, 2930, 29, 29, 27),
	];

	findValue(daFr: number): Ring | null {
		for (const rangeValues of this.rangeValuesList) {
			if (daFr >= rangeValues.minDa && daFr < rangeValues.maxDa) {
				return rangeValues;
			}
		}

		return null; // Return null if no matching range is found
	}
}