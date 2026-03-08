export function validateAuthPayload(
  { email, password, username },
  { requireUsername = false } = {}
) {
  const errors = [];

  // Email validation with length check
  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email is required.");
  } else {
    const trimmedEmail = email.trim();
    if (trimmedEmail.length > 254) {
      errors.push("Email must be 254 characters or less.");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        errors.push("Email format is invalid.");
      }
    }
  }

  // Password validation with length checks
  if (!password || typeof password !== "string" || !password.trim()) {
    errors.push("Password is required.");
  } else {
    const trimmedPassword = password.trim();
    if (trimmedPassword.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    } else if (trimmedPassword.length > 128) {
      errors.push("Password must be 128 characters or less.");
    }
  }

  // Username validation with length checks
  if (requireUsername) {
    if (!username || typeof username !== "string" || !username.trim()) {
      errors.push("Username is required.");
    } else {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 3) {
        errors.push("Username must be at least 3 characters long.");
      } else if (trimmedUsername.length > 30) {
        errors.push("Username must be 30 characters or less.");
      }
    }
  }

  return errors;
}

