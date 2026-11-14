// shorts_timing_data.ts — MEASURED narration durations for the Alaska pilot,
// in seconds of actual speech per scene (silence-trimmed, loudness-normalised).
//
// The pilot ships PRE-GENERATED narration (src/shorts/audio/narration/*.mp3);
// this table is how the engine and the workflow time the picture and the
// captions to the real voice instead of estimating from word counts.
// Generated 2026-11-14 from ffprobe measurements of the shipped files
// (same data as audio/narration/durations.json — keep the two in sync;
// shorts_extract.mjs reads the JSON, the engine reads this table).
//
// Voice: "Spirited Canyon" (avocado_v2:qvd_00059) — adult male, American,
// deep + energetic — via the spoken-audio TTS pipeline at speed 120.
// Scene duration everywhere = voice seconds + SCENE_PAD_S (shorts_captions).

export const MEASURED_VOICE_SECONDS: Record<string, number> = {
  s001: 5.714,
  s002: 4.365,
  s003: 5.987,
  s004: 4.98,
  s005: 8.81,
  s006: 7.91,
  s007: 6.185,
  s008: 3.86,
  s009: 5.392,
  s010: 3.146,
  s011: 6.038,
  s012: 2.269,
  s013: 1.776,
};
