import ms from "ms";

/**
 * Converts JWT `expiresIn` style string (e.g. 15m, 1h) to whole minutes for API responses.
 */
export function jwtExpiresInToMinutes(expiresIn: string): number {
  const value = ms(expiresIn);
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Invalid JWT_EXPIRES_IN: ${expiresIn}`);
  }
  return Math.max(1, Math.round(value / 60000));
}
