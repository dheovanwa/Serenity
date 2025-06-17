import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
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
  const [userRole, setUserRole] = useState<"user" | "psychiatrist" | null>(
    null
  );
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);

      if (user) {
        const documentId = localStorage.getItem("documentId");
        if (documentId) {
          try {
            const { getDoc, doc } = await import("firebase/firestore");
            const { db } = await import("../config/firebase");
            // Check user role
            const userDocRef = doc(db, "users", documentId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUserRole("user");
              const data = userDoc.data();
              if (!data.birthOfDate || data.birthOfDate === "") {
                setShouldCompleteSignUp(true);
              }
              return;
            }
            // If not user, check psychiatrist
            const psyDocRef = doc(db, "psychiatrists", documentId);
            const psyDoc = await getDoc(psyDocRef);
            if (psyDoc.exists()) {
              setUserRole("psychiatrist");
              return;
            }
            setUserRole(null);
          } catch (e) {
            setUserRole(null);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Route protection logic
  const path = location.pathname;

  // User cannot access these routes
  const userBlockedRoutes = [
    "/dashboard",
    "/psy-manage-appointment",
    "/doctor-profile",
  ];
  // Psychiatrist cannot access these routes
  const psychiatristBlockedRoutes = [
    "/home",
    "/Search-psi",
    "/manage-appointment",
    "/profile",
  ];

  if (isLoading) {
    return <Loading isDarkMode={false} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (shouldCompleteSignUp && userRole === "user") {
    return <Navigate to="/complete-register" replace />;
  }

  // User: block access to certain routes
  if (userRole === "user" && userBlockedRoutes.includes(path)) {
    return <Navigate to="/home" replace />;
  }

  // Psychiatrist: block access to certain routes
  if (userRole === "psychiatrist" && psychiatristBlockedRoutes.includes(path)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
