export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getAuthErrorMessage(error, isSignup = false) {
  if (error?.code === "NETWORK") {
    return "Check your connection and try again.";
  }
  if (error?.status === 409) {
    return "That email is already in use. Try another one.";
  }
  if (error?.status === 401) {
    return "Those sign-in details don’t match. Check your email and password.";
  }
  if (error?.status === 429) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (error?.status === 400) {
    return isSignup
      ? "Please check your details and try again."
      : "Enter your email and password to continue.";
  }
  return "We couldn’t complete that just now. Please try again.";
}


