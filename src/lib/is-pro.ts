/**
 * Returns true if the user has an active Pro subscription OR is the admin.
 * Pass the session email as the second argument so the admin bypass works
 * without an extra DB round-trip.
 */
export function checkIsPro(
  user: { plan?: string | null; planExpiresAt?: Date | null } | null | undefined,
  email?: string | null
): boolean {
  // Admin always has Pro access
  if (email && process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL) {
    return true;
  }
  if (!user) return false;
  return (
    user.plan === "pro" &&
    (user.planExpiresAt == null || user.planExpiresAt > new Date())
  );
}
