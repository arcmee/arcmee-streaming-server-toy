# Next Steps

## Current Snapshot
- Ingest/Playback: RTMP ingest `live/<streamKey>`, HTTP-FLV playback works (`:8000/live/<streamKey>.flv`). HLS output not yet generated (NMS v4 trans not firing).
- APIs: `/api/streams` and `/api/users/:id/channel` include `streamKey`. Webhook logs print incoming `streamKey` and event; non-publish events are ignored with 200.
- Media server: ffmpeg included (custom Dockerfile), ports 1935/8000 exposed, webhook notify -> `http://app:3000/api/streams/webhooks`. HLS trans config exists but no output yet.

## 1) Chat Stabilization
- Keep socket payload validation for `userId/streamId/text`; enforce same on frontend.
- Future: derive `userId` from auth token server-side and inject.
- Improve logging/monitoring of connect/join/error; add reconnection handling and duplicate join/message guards as needed.

## 2) HLS Migration
- Recommended approach: skip uncertain NMS v4 trans; add dedicated ffmpeg pipeline to produce HLS (`index.m3u8` + `.ts`) to a mounted volume (e.g., `./media-live/hls/<streamKey>`).
- Serve HLS via `http://<host>:8000/live/<streamKey>/index.m3u8` (or front a simple static server/Nginx). Update clients to use HLS URLs.
- Player: web use `hls.js` (LL-HLS-capable version); RN use `react-native-video` with HLS enabled. Consider LL-HLS tuning (short segments/parts, no-cache headers) if low latency is desired.

## 3) RN Mobile Support
- Playback: HLS via `react-native-video`; configure streaming/WS URLs via env/config.
- Chat: reuse socket events (`joinRoom`, `sendMessage`, `newMessage`); inject `userId` from token.
- Mobile UX: reconnection for unstable networks, buffering indicators, low bitrate option.
- Build/Release: manage .env for server/WS URLs; review platform network/permission settings.

## 4) Media Server Swap (likely consideration)
- Higher-priority options:
  - **SRS** (C++, Apache 2.0): RTMP/HTTP-FLV/HLS/LL-HLS/WebRTC 지원, Docker 이미지 제공, 설정 단순.
  - **OvenMediaEngine**: WebRTC/LL-HLS/LL-DASH 초저지연 지향. 설정은 더 복잡하지만 WebRTC까지 필요하면 유력.
- Simpler pipeline: **nginx-rtmp + ffmpeg** (RTMP ingest → HLS/LL-HLS 생성).
- Migration idea: keep RTMP ingest unchanged; configure HLS/LL-HLS/WebRTC outputs and a webhook-equivalent to preserve `/api/streams` live-state updates.
