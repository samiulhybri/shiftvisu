# Broadcasting via Soketi/Pusher

Soketi is an open-source implementation of a Pusher Websocket Server, implementing the Pusher API.
Soketi could always be exchanged in favor of another implementation (e.g. the official Pusher Service).

## Installation
See https://docs.soketi.app/getting-started/installation/cli-installation.

## Configuration
Soketi can be configured via environment variables that are also read from a `.env` file in the directory soketi was started in.
Launch Soketi from the root of `shopfloorsuite_backend` for it to read the configuration in the `.env` file there.
See also: https://docs.soketi.app/getting-started/environment-variables.

For production use set up SSL: https://docs.soketi.app/getting-started/ssl-configuration or use nginx as a proxy.
