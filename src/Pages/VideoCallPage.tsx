import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoCall from "../components/VideoCall";

const VideoCallPage: React.FC = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();

  // Determine if user is caller or joiner
  // If callId is present in URL, user is joiner
  // If not, user is caller (will create new call)
  const isCaller = !callId;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2EDE2]">
      <h1 className="text-3xl font-bold mb-6">Video Call</h1>
      <VideoCall
        callId={callId}
        isCaller={isCaller}
        onEnd={() => navigate("/")}
      />
    </div>
  );
};

export default VideoCallPage;
