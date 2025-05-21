import { auth, db } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  query,
  where,
  getDocs,
  collection,
  doc,
  updateDoc,
  addDoc,
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

  async handleGoogleSignIn() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );
      const querySnapshot = await getDocs(userQuery);

      if (querySnapshot.empty) {
        // Create new user document if doesn't exist
        const userDocRef = await addDoc(collection(db, "users"), {
          uid: user.uid,
          email: user.email,
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          isUser: true,
          dailySurveyCompleted: false,
        });
        return { docId: userDocRef.id };
      }

      return { docId: querySnapshot.docs[0].id };
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  }
}
