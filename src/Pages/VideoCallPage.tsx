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
  const [isCaller, setIsCaller] = useState(false);

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

      // Check microphone permissions before starting call
      try {
        const permissions = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        console.log("Microphone permission:", permissions.state);

        if (permissions.state === "denied") {
          console.warn("Microphone permission denied");
          alert(
            "Microphone access is required for video calls. Please enable it in your browser settings."
          );
        }
      } catch (error) {
        console.log("Permission query not supported, proceeding anyway");
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
    return (
      <div className="min-h-screen bg-[#E4DCCC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#161F36] mx-auto mb-4"></div>
          <p className="text-[#161F36] text-lg">Memvalidasi sesi...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-[#E4DCCC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#161F36] text-lg">Sesi tidak valid</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4DCCC]">
      <VideoCall
        callId={callId}
        isCaller={isCaller}
        onEnd={() => navigate("/")}
      />
    </div>
  );
};

export default VideoCallPage;
