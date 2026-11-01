const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Each function returns an object of field errors; an empty object means valid.

export function validateRegister({ name, email, password } = {}) {
  const errors = {};
  if (typeof name !== "string" || !name.trim()) errors.name = "Name is required";
  else if (name.trim().length > 50) errors.name = "Name must be 50 characters or fewer";

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (typeof password !== "string" || password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (password.length > 72) {
    errors.password = "Password must be 72 characters or fewer";
  }
  return errors;
}

export function validateLogin({ email, password } = {}) {
  const errors = {};
  if (typeof email !== "string" || !email.trim()) errors.email = "Email is required";
  if (typeof password !== "string" || !password) errors.password = "Password is required";
  return errors;
}
