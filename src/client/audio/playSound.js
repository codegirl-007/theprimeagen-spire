const SOUND_POOL_SIZE = 4;
const soundPools = new Map();

function createAudioInstance(soundFile) {
  const audio = new Audio(`assets/sounds/${soundFile}`);
  audio.preload = "auto";
  return audio;
}

function getSoundPool(soundFile) {
  if (!soundPools.has(soundFile)) {
    const pool = Array.from({ length: SOUND_POOL_SIZE }, () =>
      createAudioInstance(soundFile),
    );
    soundPools.set(soundFile, pool);

    pool.forEach((audio) => {
      try {
        audio.load();
      } catch {
        // Ignore load errors in unsupported environments.
      }
    });
  }

  return soundPools.get(soundFile);
}

function getAvailableAudio(pool) {
  return pool.find((audio) => audio.paused || audio.ended) ?? pool[0];
}

export function playSound(soundFile, volume = 0.3) {
  try {
    const pool = getSoundPool(soundFile);
    const audio = getAvailableAudio(pool);

    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch {
    // Ignore audio errors in unsupported environments.
  }
}
