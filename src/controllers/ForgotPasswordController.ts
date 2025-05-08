import {
  ForgotPasswordModel,
  ResetPasswordCredentials,
  ResetPasswordErrors,
} from "../models/ForgotPasswordModel";

export class ForgotPasswordController {
  private model: ForgotPasswordModel;

  constructor() {
    this.model = new ForgotPasswordModel();
  }

  async handleSendResetEmail(email: string): Promise<{
    success: boolean;
    errors?: ResetPasswordErrors;
  }> {
    try {
      const errors = this.model.validateEmail(email);
      if (Object.keys(errors).length > 0) {
        return { success: false, errors };
      }

      await this.model.sendResetEmail(email);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        errors: { email: "Email not found. Please sign up." },
      };
    }
  }

  async handleResetPassword(credentials: ResetPasswordCredentials): Promise<{
    success: boolean;
    errors?: ResetPasswordErrors;
  }> {
    try {
      const errors = this.model.validateNewPassword(credentials);
      if (Object.keys(errors).length > 0) {
        return { success: false, errors };
      }

      if (!credentials.oobCode) {
        return {
          success: false,
          errors: { password: "Invalid reset link. Please request a new one." },
        };
      }

      await this.model.resetPassword(
        credentials.oobCode,
        credentials.password!
      );
      return { success: true };
    } catch (error) {
      return {
        success: false,
        errors: { password: "Invalid reset link. Please request a new one." },
      };
    }
  }
}
