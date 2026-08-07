# CRITICAL RULE: CODE LOCK PROTOCOL

> [!IMPORTANT]
> DO NOT CHANGE, EDIT, OR REWRITE THE POSITIONING COORDINATES OR STREAMING IMPLEMENTATION IN THE FOLLOWING FILES. THE CURRENT COORDINATE SCHEME AND MULTIMEDIA STEAM ENGINE ARE LOBBY-TESTED AND DECLARED PERFECT BY THE CLIENT.

## Locked Components

### 1. Camera Pod Coordinates & Layout
- **File**: src/components/camera/LuxuryLiveCamera.tsx
- **Desktops/PC**: Local Pod (201, 358), Opponent Pod (-2, 153)
- **Smartphones/Mobile**: Local Pod (213, 428), Opponent Pod (8, 223)
- **Rule**: Do not adjust the coordinates, scaling container alignments, or responsive triggers. Keep the absolute placement inside the centered container intact.

### 2. Audio/Video Socket PCM Stream Engine
- **File**: src/components/camera/LuxuryLiveCamera.tsx
- **Rule**: Do not touch the raw PCM 16kHz base64 capture loop, the 12.0x digital audio gain multiplier, or the custom window event signaling handlers. Any attempt to introduce WebRTC or standard WebM compression will break iOS Safari compatibility.

### 3. Board Visual Animations & Trails
- **File**: src/game/renderer/BoardCanvasRenderer.ts
- **Rule**: Do not touch the fire trail particle system, breadcrumb glowing path step rendering, or the final rotation sparkle highlights.

---
Any future agent or compiler MUST preserve this logic exactly as written. Any attempt to modify these will result in client rejection.
