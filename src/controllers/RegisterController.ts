import {
  RegisterModel,
  RegisterFormData,
  RegisterErrors,
} from "../models/RegisterModel";
import { LoginModel } from "../models/LoginModel";

export class RegisterController {
  private model: RegisterModel;
  private loginModel: LoginModel;

  constructor() {
    this.model = new RegisterModel();
    this.loginModel = new LoginModel();
  }

  async handleRegistration(formData: RegisterFormData): Promise<{
    success: boolean;
    errors?: RegisterErrors;
    docId?: string;
  }> {
    try {
      console.log("Starting registration process...");
      const result = await this.model.handleRegistration(formData);
      console.log("Registration result:", result);

      if (result.docId) {
        return { success: true, docId: result.docId };
      }
      return { success: true };
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.message === "Email sudah terdaftar") {
        return {
          success: false,
          errors: { email: "Email sudah terdaftar" },
        };
      }
      return {
        success: false,
        errors: { email: "Registrasi gagal. Silakan coba lagi." },
      };
    }
  }

  async handleGoogleLogin() {
    try {
      return await this.loginModel.handleGoogleLogin();
    } catch (error) {
      console.error("Google registration error:", error);
      return { success: false };
    }
  }
}
