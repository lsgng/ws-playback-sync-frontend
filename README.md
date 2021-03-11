# WebSocket audio playback synchronization - Client

This repository contains the front-end code for a very basic WebSocket based audio playback snychronization prototype. See the [back-end repository](https://github.com/lsgng/ws-playback-sync-frontend) for further information.

A simple user interface providing playback controls (start, stop, fast-forward, crossfade) for two separate audio tracks. All playback control events are sent to the server via WebSocket and are from there broadcast to all other connected clients. Play and fast-forward events are synchronized by a very simple timestamp-based latency compensation mechanism.

## Usage

Build and run:

```
npm start
```

Build:

```
npm run build
```

The WebSocket endpoint can be specified via the `WS_ENDPOINT` env variable. It defaults to `ws://localhost:8000`.
