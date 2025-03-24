import { Injectable, Optional, isDevMode } from "@angular/core";
import { environment } from "@app/environments/environment";
import PusherJS, { Channel, ChannelAuthorizationCallback } from "pusher-js";

@Injectable({
	providedIn: "root",
})
export class PusherService {
	private client!: PusherJS;

	constructor() {
		this.client = new PusherJS(environment.soketiAppKey, {
			wsHost: environment.soketiHost,
			cluster: "",
			wsPort: environment.soketiPort,
			wsPath: environment.soketiPath,
			forceTLS: false,
			disableStats: true,
			enabledTransports: ["ws", "wss"],
		});
	}

	subscribe(channelName: string): Channel {
		return this.client.subscribe(channelName);
	}
}
