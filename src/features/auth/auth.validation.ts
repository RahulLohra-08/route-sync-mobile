export function normalizePhoneNumber(value: string): string {
  return value.replace(/\D/g, "");
}

export function validatePhoneNumber(value: string): string | undefined {
  const phone = normalizePhoneNumber(value);

  if (!phone) {
    return "Phone number is required.";
  }

  if (phone.length !== 10) {
    return "Enter a valid 10-digit phone number.";
  }

  return undefined;
}

export function validateOtp(value: string): string | undefined {
  const otp = value.replace(/\D/g, "");

  if (!otp) {
    return "OTP is required.";
  }

  if (otp.length !== 6) {
    return "Enter the 6-digit OTP.";
  }

  return undefined;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): string | undefined {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return "Email address is required.";
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    return "Please enter a valid email address.";
  }

  return undefined;
}
