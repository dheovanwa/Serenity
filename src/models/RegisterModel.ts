import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";

export interface RegisterFormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  emailPromo: boolean;
}

export interface RegisterErrors {
  [key: string]: string;
}

export class RegisterModel {
  validateForm(data: RegisterFormData): RegisterErrors {
    const errors: RegisterErrors = {};

    if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = "Invalid email address";
    }

    if (!data.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (data.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!data.termsAccepted) {
      errors.termsAccepted = "You must accept the terms";
    }

    return errors;
  }

  async handleRegistration(formData: RegisterFormData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const userDocRef = await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        email: formData.email,
        firstName: null,
        lastName: null,
        termsAccepted: formData.termsAccepted,
        profilePicture: null,
        address: null,
        birthOfDate: null,
        sex: null,
        phoneNumber: null,
        isUser: true,
        dailySurveyCompleted: false,
      });

      // Create history_stress subcollection
      const historyCollectionRef = collection(userDocRef, "history_stress");
      await addDoc(historyCollectionRef, {});

      return { success: true, docId: userDocRef.id };
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === "auth/email-already-in-use") {
        throw new Error("Email sudah terdaftar");
      }
      throw error;
    }
  }
}
