import { auth, db } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
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
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      return userCredential.user.uid;
    } catch (error: any) {
      if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email format");
      } else if (error.code === "auth/user-not-found") {
        throw new Error("No account found with this email");
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Incorrect password");
      }
      throw error;
    }
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

    // Email validation
    if (!credentials.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!credentials.password) {
      errors.password = "Password is required";
    } else if (credentials.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    return errors;
  }

  async updateDailySurveyStatus(docId: string, status: boolean) {
    const userDocRef = doc(db, "users", docId);
    await updateDoc(userDocRef, {
      dailySurveyCompleted: status,
    });
  }

  async handleGoogleLogin() {
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
      throw error;
    }
  }

  async handleFacebookLogin() {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );
      const querySnapshot = await getDocs(userQuery);

      if (querySnapshot.empty) {
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
      throw error;
    }
  }
}
