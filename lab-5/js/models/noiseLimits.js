// Єдине бізнес-правило класифікації шуму (dB). Змінювати межі — лише тут.
export const NOISE_LIMITS = Object.freeze({
  normalMax: 55,    // до 55 включно — normal
  warningMax: 70,   // понад 55 і до 70 включно — warning; понад 70 — critical
});
