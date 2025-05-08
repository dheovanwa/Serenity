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

  async registerUser(formData: RegisterFormData) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );

    const userDocRef = doc(db, "users", userCredential.user.uid);

    await setDoc(userDocRef, {
      uid: userCredential.user.uid,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      emailPromo: formData.emailPromo,
      isUser: true,
      age: 0,
      dailySurveyCompleted: false,
      sex: "",
      address: "",
      phoneNumber: "",
      country: "",
      city: "",
      educationLevel: "",
    });

    const historyCollectionRef = collection(userDocRef, "history_stress");
    await addDoc(historyCollectionRef, {});

    return userCredential.user;
  }
}
