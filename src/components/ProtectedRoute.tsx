import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import Loading from "./Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldCompleteSignUp, setShouldCompleteSignUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);

      // Only check for user (not psychiatrist)
      if (user) {
        const documentId = localStorage.getItem("documentId");
        if (documentId) {
          // Check if user exists in 'users' collection
          try {
            const { getDoc, doc } = await import("firebase/firestore");
            const { db } = await import("../config/firebase");
            const userDocRef = doc(db, "users", documentId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (!data.birthOfDate || data.birthOfDate === "") {
                setShouldCompleteSignUp(true);
              }
            }
          } catch (e) {
            // ignore error, fallback to normal flow
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <Loading isDarkMode={false} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (shouldCompleteSignUp) {
    // Ensure the route matches your actual registration completion page
    return <Navigate to="/complete-register" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
