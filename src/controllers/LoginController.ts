import {
  LoginModel,
  LoginCredentials,
  LoginErrors,
} from "../models/LoginModel";

export class LoginController {
  private model: LoginModel;

  constructor() {
    this.model = new LoginModel();
  }

  async handleLogin(credentials: LoginCredentials): Promise<{
    success: boolean;
    errors?: LoginErrors;
    redirectTo?: string;
  }> {
    try {
      // Validate inputs
      const validationErrors = this.model.validateInputs(credentials);
      if (Object.keys(validationErrors).length > 0) {
        return { success: false, errors: validationErrors };
      }

      // Authenticate
      const userId = await this.model.authenticate(credentials);

      // Get user data
      const userData = await this.model.getUserData(userId);

      if (!userData) {
        return {
          success: false,
          errors: { email: "User data not found" },
        };
      }

      // Store document ID
      localStorage.setItem("documentId", userData.docId);

      // Check last survey timestamp
      const lastSurveyTimestamp = userData.data.lastSurveyTimestamp;
      let shouldTakeSurvey = !userData.data.dailySurveyCompleted;

      if (lastSurveyTimestamp) {
        const lastSurveyDate = new Date(lastSurveyTimestamp).toDateString();
        const todayDate = new Date().toDateString();

        if (lastSurveyDate !== todayDate) {
          // Update dailySurveyCompleted to false if last survey was not today
          await this.model.updateDailySurveyStatus(userData.docId, false);
          shouldTakeSurvey = true;
        }
      }

      // Determine redirect path based on survey status
      const redirectTo = shouldTakeSurvey ? "/user-survey" : "/";

      return { success: true, redirectTo };
    } catch (error: any) {
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        return {
          success: false,
          errors: { email: "Invalid email or password" },
        };
      }
      console.error("Login error:", error);
      return {
        success: false,
        errors: { email: "An unexpected error occurred" },
      };
    }
  }
}
