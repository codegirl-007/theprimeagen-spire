export function playSound(soundFile, volume = 0.3) {
    try {
        const audio = new Audio(`assets/sounds/${soundFile}`);
        audio.volume = volume;
        audio.play().catch(() => {});
    } catch {
        // Ignore audio errors in unsupported environments.
    }
}
