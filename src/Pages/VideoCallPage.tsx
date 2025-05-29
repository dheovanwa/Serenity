import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import VideoCall from "../components/VideoCall";

const VideoCallPage: React.FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const [isValidSession, setIsValidSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCaller, setIsCaller] = useState(false); // Add this state

  useEffect(() => {
    const validateSession = async () => {
      const userId = localStorage.getItem("documentId");
      const userType = localStorage.getItem("userType");

      console.log("user type:", userType);
      console.log("user id:", userId);

      if (!userId || !userType) {
        navigate("/");
        return;
      }

      try {
        if (callId) {
          // Joining an existing call
          const callDoc = await getDoc(doc(db, "calls", callId));
          if (!callDoc.exists()) {
            throw new Error("Call not found");
          }

          const callData = callDoc.data();
          const appointmentDoc = await getDoc(
            doc(db, "appointments", callData.appointmentId)
          );

          if (!appointmentDoc.exists()) {
            throw new Error("Appointment not found");
          }

          const appointmentData = appointmentDoc.data();

          // Check if user is authorized to join this call
          const isAuthorized =
            userType === "psychiatrist"
              ? appointmentData.psychiatristId === userId
              : appointmentData.patientId === userId;

          if (!isAuthorized) {
            throw new Error("Unauthorized");
          }

          // Set isCaller based on userType and callerId
          setIsCaller(
            userType === "psychiatrist" && callData.callerId === userId
          );
          setIsValidSession(true);
        } else {
          // Only psychiatrists can create calls
          if (userType !== "psychiatrist") {
            throw new Error("Only psychiatrists can create calls");
          }
          setIsCaller(true); // Psychiatrist creating new call is always the caller
          setIsValidSession(true);
        }
      } catch (error) {
        console.error("Session validation error:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [callId, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isValidSession && callId) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2EDE2]">
      <VideoCall
        callId={callId}
        isCaller={isCaller} // Pass the determined isCaller state
        onEnd={() => navigate("/")}
      />
    </div>
  );
};

export default VideoCallPage;
