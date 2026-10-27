// src/features/profile/profile.logic.ts
// Pure rules (unit-tested). Mirror backend UpdateUserRequest validation:
//   fullName 2-100 chars | email valid, <= 150 | phoneNumber ^[+]?[0-9]{10,15}$
// Phone is intentionally NOT editable in the app: it is the OTP login identity
// and the backend would change it without re-verifying the new number.

export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
}

export interface ProfileErrors {
  fullName?: string;
  email?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProfile(
  form: { fullName: string; email: string },
  current: { fullName: string; email: string | null },
): { errors: ProfileErrors; payload: UpdateProfilePayload | null } {
  const errors: ProfileErrors = {};
  const fullName = form.fullName.trim();
  const email = form.email.trim();

  if (fullName.length < 2 || fullName.length > 100) {
    errors.fullName = "Name must be 2 to 100 characters.";
  }
  if (email.length === 0) {
    // The API has no way to clear an email (null = "leave unchanged").
    if (current.email) errors.email = "Email can't be removed once added.";
  } else if (email.length > 150 || !EMAIL.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (errors.fullName || errors.email) return { errors, payload: null };

  // Send only what changed (backend treats missing fields as "unchanged").
  const payload: UpdateProfilePayload = {};
  if (fullName !== current.fullName) payload.fullName = fullName;
  if (email && email !== (current.email ?? "")) payload.email = email;
  return { errors, payload: Object.keys(payload).length ? payload : null };
}

export type LicenseState = "ok" | "soon" | "expired" | "unknown";

/** `expiry` is the backend LocalDate "YYYY-MM-DD". Warns from 30 days before. */
export function licenseState(
  expiry: string | null | undefined,
  now: Date,
): { state: LicenseState; daysLeft: number | null } {
  const m = expiry?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return { state: "unknown", daysLeft: null };
  const end = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysLeft = Math.round((end.getTime() - today.getTime()) / 86_400_000);
  return { state: daysLeft < 0 ? "expired" : daysLeft <= 30 ? "soon" : "ok", daysLeft };
}
