interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreed: boolean;
}

interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  agreed?: string;
}

export const validateRegistration = (
  data: RegistrationData
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Full Name
  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'’\- ]+$/.test(data.fullName)) {
    errors.fullName =
      "Name must contain only letters, spaces, apostrophes, or hyphens.";
  } else if (data.fullName.trim().split(" ").length < 2) {
    errors.fullName = "Please enter at least a first and last name.";
  } else if (data.fullName.length < 4) {
    errors.fullName = "Name is too short.";
  }

  // Email
  if (!data.email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Email is invalid.";
  }

  // Phone
  if (!data.phone) {
    errors.phone = "Phone number is required.";
  } else if (!/^(\+?\d{1,3}[- ]?)?\d{10,15}$/.test(data.phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  // Password
  const hasUpper = /[A-Z]/.test(data.password);
  const hasLower = /[a-z]/.test(data.password);
  const hasDigit = /[0-9]/.test(data.password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(data.password);

  if (!data.password) {
    errors.password = "Password is required.";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
    errors.password =
      "Password must include uppercase, lowercase, number, and special character.";
  }

  // Confirm Password
  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (data.confirmPassword !== data.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  // Terms Agreement
  if (!data.agreed) {
    errors.agreed = "You must agree to the terms and conditions.";
  }

  return errors;
};
