/**
 * Generates a cryptographically secure random float in the range [0, 1).
 */
export function secureRandom(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
}
