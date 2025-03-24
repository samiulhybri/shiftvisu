export function secondsToHms(d:number) {
	d = Number(d);
	var h = Math.abs(Math.floor(d / 3600));
	var m = Math.abs(Math.floor((d % 3600) / 60));
	var s = Math.abs(Math.floor((d % 3600) % 60));

	return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
		.toString()
		.padStart(2, "0")}`;
}
