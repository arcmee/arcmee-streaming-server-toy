# Live Thumbnail Auto-Capture Plan

## Goal
Add periodic thumbnail capture during live broadcasts and keep the latest thumbnail URL on live streams.

## Steps
1. Review current live stream lifecycle and media/storage adapters to decide where capture should run (worker vs API).
2. Add a periodic capture job that extracts a frame and uploads it, updating `Stream.thumbnailUrl`.
3. Wire start/stop of the capture job to live status changes, ensuring cleanup on stream end.
4. Expose updated `thumbnailUrl` in live stream responses and validate end-to-end behavior.
5. Add tests or fakes to cover the capture flow and repository updates.
