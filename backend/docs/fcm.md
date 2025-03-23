# Firebase Cloud Messaging

We use FCM to send push messages to clients. Those then show up as notifications on the user's device. While the user is online,
messages are sent using [sockets](pusher.md).

## Server-Side config

- [Create a service account](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk) on the Firebase Console
- Download the JSON file and set `GOOGLE_APPLICATION_CREDENTIALS` in your `.env` file to its path. Do not just store it in a well-known
  directory, as no push notifications will be attempted to be sent if `GOOGLE_APPLICATION_CREDENTIALS` is not set.

Also check out the [documentation](https://firebase-php.readthedocs.io/en/stable/index.html) for the Firebase Admin SDK for PHP.


## Client-Side config (Flutter)

- Install the [Firebase CLI Tool](https://firebase.google.com/docs/cli#install_the_firebase_cli)
- Login using `firebase login`
- Install the FlutterFire CLI Tool: `dart pub global activate flutterfire_cli`
- Run `flutterfire configure`

## Client-Side config (Web)
- In the Firebase Console (Settings/General tab) select your web app and copy the configuration to `environments/environment.ts`.
- Copy the same configuration to `src/firebase-messaging-sw.js` as well.
- In the Firebase Console (Settings/Cloud Messaging tab) add a Web Push Certificate and copy the key as the `vapidKey` to the same file.
