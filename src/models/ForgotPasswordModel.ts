import { auth } from "../config/firebase";
import { sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";

export interface ResetPasswordCredentials {
  email?: string;
  password?: string;
  confirmPassword?: string;
  oobCode?: string;
}

export interface ResetPasswordErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export class ForgotPasswordModel {
  validateEmail(email: string): ResetPasswordErrors {
    const errors: ResetPasswordErrors = {};

    if (!email) {
      errors.email = "Email is required";
    } else if (!/@\w+\.\w+/.test(email)) {
      errors.email = "Email must be in the correct format";
    }

    return errors;
  }

  validateNewPassword(
    credentials: ResetPasswordCredentials
  ): ResetPasswordErrors {
    const errors: ResetPasswordErrors = {};

    if (!credentials.password) {
      errors.password = "Password is required";
    } else if (credentials.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!credentials.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (credentials.password !== credentials.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  }

  async sendResetEmail(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async resetPassword(oobCode: string, newPassword: string) {
    await confirmPasswordReset(auth, oobCode, newPassword);
  }
}
