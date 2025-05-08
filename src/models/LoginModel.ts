import { auth, db } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  query,
  where,
  getDocs,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginErrors {
  email?: string;
  password?: string;
}

export class LoginModel {
  async authenticate(credentials: LoginCredentials) {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    return userCredential.user.uid;
  }

  async getUserData(userId: string) {
    const userQuery = query(
      collection(db, "users"),
      where("uid", "==", userId)
    );
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        docId: userDoc.id,
        data: userDoc.data(),
      };
    }
    return null;
  }

  validateInputs(credentials: LoginCredentials): LoginErrors {
    const errors: LoginErrors = {};

    if (!credentials.email.trim()) {
      errors.email = "Email is required";
    }
    if (!credentials.password.trim()) {
      errors.password = "Password is required";
    }

    return errors;
  }

  async updateDailySurveyStatus(docId: string, status: boolean) {
    const userDocRef = doc(db, "users", docId);
    await updateDoc(userDocRef, {
      dailySurveyCompleted: status,
    });
  }
}
