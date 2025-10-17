// src/sounds/globalClickSound.ts

// ✅ Load the sound file from the public folder
const clickSound = new Audio("/CLICK3.wav");

// optional: adjust volume
clickSound.volume = 0.4;

// ✅ Function to play sound safely (prevents rapid overlapping)
function playClickSound() {
  const sound = clickSound.cloneNode() as HTMLAudioElement;
  sound.play().catch(() => {});
}

// ✅ Add event listener for all "click" events
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;

  // only play sound for interactive elements
  if (
    target.tagName === "BUTTON" ||
    target.tagName === "A" ||
    target.tagName === "INPUT" ||
    target.tagName === "DIV" && target.getAttribute("role") === "button"
  ) {
    playClickSound();
  }
});
