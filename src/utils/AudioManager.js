// src/utils/AudioManager.js

// -------------------
// PUBLIC ASSET HELPER
// Use Vite base path so /public/sounds works under deployed sub-paths.
// -------------------
const PUBLIC_BASE = import.meta.env.BASE_URL || '/';
const getPublicAssetPath = (path) => {
  const normalizedBase = PUBLIC_BASE.endsWith('/') ? PUBLIC_BASE : `${PUBLIC_BASE}/`;
  return `${normalizedBase}${path}`;
};

const SOUND_MAP = {
  hollowPurple:          getPublicAssetPath('sounds/unlimited-void.mp3'),
  infiniteVoid:          getPublicAssetPath('sounds/unlimited-void.mp3'),
  red:                   getPublicAssetPath('sounds/unlimited-void.mp3'),
  idleTransfiguration:   getPublicAssetPath('sounds/idle-transfiguration.mp3'),
  malevolentShrine:      getPublicAssetPath('sounds/cursed-energy.mp3'),
  blackFlash:            getPublicAssetPath('sounds/cursed-energy.mp3'),
  boogieWoogie:          getPublicAssetPath('sounds/cursed-energy.mp3'),
  tenShadows:            getPublicAssetPath('sounds/cursed-energy.mp3'),
  disasterFlames:        getPublicAssetPath('sounds/cursed-energy.mp3'),
  cursedSpeech:          getPublicAssetPath('sounds/cursed-energy.mp3'),
  construction:          getPublicAssetPath('sounds/cursed-energy.mp3'),
  comedy:                getPublicAssetPath('sounds/cursed-energy.mp3'),
  bloodManipulation:     getPublicAssetPath('sounds/cursed-energy.mp3'),
  ratioTechnique:        getPublicAssetPath('sounds/cursed-energy.mp3'),
  jackpot:               getPublicAssetPath('sounds/cursed-energy.mp3'),
  skyManipulation:       getPublicAssetPath('sounds/cursed-energy.mp3'),
};

// -------------------
// CURRENT PLAYING
// -------------------
let currentAudio = null;
let isMuted = false;

// -------------------
// STOP ALL
// -------------------
const stop = () => {
  if (!currentAudio) return;
  const audio = currentAudio;
  currentAudio = null;
  let vol = audio.volume;
  const fade = setInterval(() => {
    vol = Math.max(vol - 0.08, 0);
    audio.volume = vol;
    if (vol <= 0) {
      clearInterval(fade);
      audio.pause();
      audio.currentTime = 0;
    }
  }, 50);
};

// -------------------
// PLAY TECHNIQUE SOUND
// -------------------
const play = (techId) => {
  stop();
  if (isMuted) return;
  const src = SOUND_MAP[techId];
  if (!src) {
    console.log('No sound mapped for:', techId);
    return;
  }
  const audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0;
  audio.play().catch(err => console.log('Play blocked:', err));
  // Fade in
  let vol = 0;
  const fade = setInterval(() => {
    vol = Math.min(vol + 0.05, 0.7);
    audio.volume = vol;
    if (vol >= 0.7) clearInterval(fade);
  }, 80);
  currentAudio = audio;
};

// -------------------
// THEME MUSIC
// Only plays if you have /sounds/theme.mp3
// If you don't have it, startThemeMusic just does nothing safely
// -------------------
let themeAudio = null;

const startThemeMusic = () => {
  if (isMuted) return;
  // Don't crash if file doesn't exist
  try {
    if (!themeAudio) {
      themeAudio = new Audio(getPublicAssetPath('sounds/theme.mp3'));
      themeAudio.loop = true;
      themeAudio.volume = 0.35;
    }
    if (themeAudio.paused) {
      themeAudio.play().catch(() => {
        // Silently ignore — theme.mp3 may not exist
      });
    }
  } catch(e) {}
};

const stopThemeMusic = () => {
  if (themeAudio) {
    themeAudio.pause();
  }
};

// -------------------
// MUTE TOGGLE
// -------------------
const toggleMute = () => {
  isMuted = !isMuted;
  if (isMuted) {
    stop();
    stopThemeMusic();
  }
  return isMuted;
};

// -------------------
// GET / SET MUTE
// -------------------
const setMuted = (val) => {
  isMuted = !!val;
  if (isMuted) {
    stop();
    stopThemeMusic();
  }
  return isMuted;
};

const getMuted = () => isMuted;

// -------------------
// EXPORT
// -------------------
const AudioManager = {
  play,
  stop,
  toggleMute,
  setMuted,
  getMuted,
  startThemeMusic,
  stopThemeMusic,
};

export default AudioManager;