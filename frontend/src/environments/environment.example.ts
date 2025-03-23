export const environment = {
  production: true,
  apiPrefix: "/api",
  lodataPrefix: "/odata",
  homeLink: "",
  clientName: "",  // Scherer, Lockweiler, Mouldplast
  mpSrvLink: "",
  soketiHost: "",
  soketiPort: 80,
  soketiPath: "/websockets",
  soketiAppKey: "app-key", // Keep in sync with the key in the backend config
  firebase: { // Keep in sync with the configuration in firebase-messaging-sw.js
    projectId: "",
    appId: "",
    storageBucket: "",
    apiKey: "",
    authDomain: "",
    messagingSenderId: "",
  },
  vapidKey: "", // Keep in sync with manifest.json
};
