import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, Optional, isDevMode } from "@angular/core";
import { Messaging, getToken } from "@angular/fire/messaging";
import {
  BehaviorSubject,
  catchError,
  startWith,
  Subject,
  throwError,
} from "rxjs";
import { environment } from "src/environments/environment";
import PusherJS, { Channel, ChannelAuthorizationCallback } from "pusher-js";
import { ChannelAuthorizationData } from "pusher-js/types/src/core/auth/options";
import { VisibilityService } from "./visibility.service";
import { AuthService } from "@app/services/auth.service";

@Injectable({
  providedIn: "root",
})
export class PusherService {
  private client!: PusherJS;

  userChannel = new BehaviorSubject<Channel | null>(null);

  constructor(
    http: HttpClient,
    @Optional()
    messaging: Messaging | null,
    authService: AuthService,
    visibilityService: VisibilityService
  ) {
    const user = authService.user;
    if (!user) {
      return;
    }
    if (messaging) {
      getToken(messaging, {
        vapidKey: environment.vapidKey,
      }).then((token) =>
        http
          .post(`${environment.apiPrefix}/chat/register_fcm_token`, {
            token,
          })
          .subscribe()
      );
    }
    const authorizer = (channel: Channel) => {
      return {
        authorize: (
          socketId: string,
          callback: ChannelAuthorizationCallback
        ) => {
          const body = new URLSearchParams();
          body.set("channel_name", channel.name);
          body.set("socket_id", socketId);

          http
            .post<ChannelAuthorizationData>(
              `${environment.apiPrefix}/broadcasting/auth`,
              body.toString(),
              {
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              }
            )
            .pipe(
              catchError((error: HttpErrorResponse) => {
                callback(
                  new Error(`Error authenticating with server: ${error}`),
                  {
                    auth: "",
                  }
                );
                return throwError(
                  () => new Error("Error authenticating channel")
                );
              })
            )
            .subscribe((response) => {
              callback(null, response);
            });
        },
      };
    };

    this.client = new PusherJS(environment.soketiAppKey, {
      wsHost: environment.soketiHost,
      cluster: "",
      wsPort: environment.soketiPort,
      wsPath: environment.soketiPath,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ["ws", "wss"],
      authorizer,
    });

    this.userChannel.next(this.client.subscribe(`presence-user.${user.id}`));

    visibilityService.visibilityChange
      .pipe(startWith(true))
      .subscribe((visible) => {
        if (visible) {
          this.client.connect();
        } else {
          this.client.disconnect();
        }
      });
  }

  subscribe(channelName: string): Channel {
    return this.client.subscribe(channelName);
  }
}
