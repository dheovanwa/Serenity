import React, { useState } from "react";
import InputField from "../components/Login/InputField";
import Button from "../components/Login/Button";
import AuthLayout from "../components/BackgroundLayout";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { query, where, getDocs, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      // Query Firestore to find the document with the matching uid
      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", userId)
      );
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]; // Get the first matching document
        const userData = userDoc.data();

        localStorage.setItem("documentId", userDoc.id); // Store Firestore document ID

        if (userData.dailySurveyCompleted === false) {
          navigate("/user-survey");
        } else {
          alert("Login successful!");
        }
      } else {
        console.error("User document not found");
      }
    } catch (error: any) {
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setErrors({ email: "Invalid email or password" });
      } else {
        console.error("Login error:", error);
      }
    }
  };

  return (
    <AuthLayout>
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-[400px] sm:max-w-[450px] md:max-w-[500px] px-6 sm:px-8">
        <h2 className="text-4xl font-bold text-white mb-5 text-center">
          Welcome to Serenity
        </h2>
        <form className="space-y-4 w-full" onSubmit={handleLogin}>
          <div>
            <label className="block font-bold text-white text-[20px] mb-1 text-left">
              Email
            </label>
            <InputField
              type="email"
              placeholder="examplemail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {}
          <div className="mt-0">
            <label className="block font-bold text-white text-[20px] mb-1 text-left">
              Password
            </label>
            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          <div className="text-right text-sm">
            <a
              href="/forgot-password"
              className="font-bold underline text-white"
            >
              Forgot Password?
            </a>
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        <p className="mt-4 font-bold text-white text-[20px] text-center">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="underline font-bold cursor-pointer hover:underline"
          >
            Sign Up!
          </a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
