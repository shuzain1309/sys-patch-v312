// title_script.tsx: @@TITLE@@. ONE file per video; the dashboard commits it as src/remotion/current_script.tsx.
// Data only: narration (LINES) + visuals (SCENES). All art is drawn in code by ./kit.tsx, ./world.tsx (+ germany_pack.tsx), ./geo.tsx. Real images only via PHOTOS.
import {makeVideo, Scene, Theme, PropT, ActorT, MusicCue} from './kit';
import {registerLooks, registerFactions} from './world';
import timings from '../../public/timings.json'; // written by CI after TTS+Whisper; stub `{}` until then

export const META = {title: @@TITLEJS@@, slug: '@@SLUG@@'};

export const THEME: Theme = @@THEME@@;

// NARRATION: strict JSON between the two LINES markers (CI extracts it for TTS). One entry per scene id. [v:king] [v:banker] = male skit voices, [v:woman] = female. The tag MUST match the talking actor's gender (checked by the assembler).
export const LINES: Record<string, string> = /*LINES*/ @@LINES@@/*LINES*/;

// YOUTUBE METADATA (strict JSON). {{CHAPTERS}} and {{CREDITS}} are filled in CI.
export const SEO = /*SEO*/ @@SEO@@/*SEO*/;

// ---- helpers so SCENES stay short: A = actor standing on the ground line, P = prop ----
// G: geo scenes may carry `clash:[{lon,lat,a,b,at}]` (army clash art, MapClash in world.tsx). Cast so an older geo.tsx simply ignores it.
const G = (g: any) => g as any;
const A = (look: string, x: number | [number, number], o: Partial<ActorT> = {}): ActorT => ({look, x, y: 990, ...o} as ActorT);
const P = (k: PropT['k'], x: number, y: number, o: Partial<PropT> = {}): PropT => ({k, x, y, ...o} as PropT);

export const SCENES: Scene[] = [
@@SCENES@@
];

// one real CC0 track per chapter (strict JSON). A key with no file in music-real/ only WARNS in CI and that section plays without music.
export const MUSIC: MusicCue[] = /*MUSIC*/ @@MUSIC@@/*MUSIC*/;
// per-video characters and factions (real historical people as generic period dress; see each note)
export const BIBLE = /*BIBLE*/ @@BIBLE@@/*BIBLE*/;
registerLooks(BIBLE.looks as any);
registerFactions(BIBLE.factions as any);
// real images: Wikimedia Commons, public domain / CC0 / CC BY only. Run fetch-photos with library/photos-germany.json BEFORE the first render.
export const PHOTOS = /*PHOTOS*/ @@PHOTOS@@/*PHOTOS*/;
const {Video, total, fps} = makeVideo(SCENES, LINES, THEME, timings as any, MUSIC);
export {Video, total, fps};
