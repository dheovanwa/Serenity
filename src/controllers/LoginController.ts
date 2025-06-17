import {
  LoginModel,
  LoginCredentials,
  LoginErrors,
} from "../models/LoginModel";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

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
      const userData = await this.getUserData(userId);

      console.log("User data:", userId);
      if (!userData) {
        return {
          success: false,
          errors: { email: "Data user tidak ditemukan" },
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
          errors: { email: "Email atau kata sandi salah" },
        };
      }
      console.error("Login error:", error);
      return {
        success: false,
        errors: { email: "Email atau kata sandi salah" },
      };
    }
  }

  async handleGoogleLogin() {
    try {
      const result = await this.model.handleGoogleLogin();
      if (result.docId) {
        localStorage.setItem("documentId", result.docId);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Google login error:", error);
      return { success: false };
    }
  }

  async getUserData(userId: string) {
    try {
      // Check psychiatrists collection first
      const psychiatristQuery = query(
        collection(db, "psychiatrists"),
        where("uid", "==", userId)
      );
      const psychiatristDocs = await getDocs(psychiatristQuery);

      if (!psychiatristDocs.empty) {
        const docId = psychiatristDocs.docs[0].id;
        localStorage.setItem("userType", "psychiatrist");
        return { docId, data: psychiatristDocs.docs[0].data() };
      }

      // If not found in psychiatrists, check users collection
      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", userId)
      );
      const userDocs = await getDocs(userQuery);

      if (!userDocs.empty) {
        const docId = userDocs.docs[0].id;
        localStorage.setItem("userType", "user");
        return { docId, data: userDocs.docs[0].data() };
      }

      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  async getUserDocData(docId: string) {
    try {
      const docRef = doc(db, "users", docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error("Error getting user doc data:", error);
      return null;
    }
  }
}
