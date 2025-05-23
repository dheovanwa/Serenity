import {
  RegisterModel,
  RegisterFormData,
  RegisterErrors,
} from "../models/RegisterModel";

export class RegisterController {
  private model: RegisterModel;

  constructor() {
    this.model = new RegisterModel();
  }

  async handleRegistration(formData: RegisterFormData): Promise<{
    success: boolean;
    errors?: RegisterErrors;
  }> {
    try {
      // Validate form
      const validationErrors = this.model.validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        return { success: false, errors: validationErrors };
      }

      // Register user
      await this.model.registerUser(formData);
      return { success: true };
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        return {
          success: false,
          errors: { email: "This email is already registered" },
        };
      }
      console.error("Registration error:", error);
      return {
        success: false,
        errors: { email: "An unexpected error occurred" },
      };
    }
  }
}
