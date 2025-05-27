import React, { useEffect, useRef, useState } from "react";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import SimplePeer from "simple-peer";
import { useNavigate } from "react-router-dom";

// Import SVG assets
import MicrophoneIcon from "../assets/Microphone.svg";
import MuteIcon from "../assets/Mute.svg";
import VideoCallIcon from "../assets/VideoCall.svg";
import NoVideoIcon from "../assets/NoVideo.svg";
import LeaveIcon from "../assets/Leavesvg.svg";
import NoVideoLightIcon from "../assets/NoVideoLight.svg";

interface VideoCallProps {
  callId?: string; // If joining an existing call
  isCaller: boolean; // true if initiator, false if joiner
  onEnd?: () => void;
}

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  // Add TURN servers here if needed
];

const VideoCall: React.FC<VideoCallProps> = ({ callId, isCaller, onEnd }) => {
  // Add new state for appointment info
  const [appointmentInfo, setAppointmentInfo] = useState<{
    endTime?: string;
    date?: string;
  } | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [currentCallId, setCurrentCallId] = useState<string | null>(
    callId || null
  );
  const [status, setStatus] = useState("Connecting...");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSwapped, setIsSwapped] = useState(false);
  const [countdown, setCountdown] = useState<string>("--:--:--");
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const unsubSignal = useRef<() => void>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // Get user info
  const userId = localStorage.getItem("documentId");
  const userType = localStorage.getItem("userType");

  // 1. Get user media
  useEffect(() => {
    let isMounted = true;
    let triedOnce = false;

    async function getMediaWithRetry() {
      try {
        console.log("Requesting local media...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("Got local stream", stream);
        if (isMounted) {
          setLocalStream(stream);
        }
      } catch (err) {
        console.log("Failed to get local media", err);
        // If failed, try again after a short delay (sometimes needed for some browsers)
        if (!triedOnce) {
          triedOnce = true;
          setTimeout(getMediaWithRetry, 500);
        } else {
          setStatus("Failed to access camera/mic");
        }
      }
    }

    getMediaWithRetry();

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Setup Peer and Firestore signaling
  useEffect(() => {
    if (!localStream) return;

    let mounted = true;
    let peer: SimplePeer.Instance | null = null;
    let callDocRef: any = null;

    const setupPeer = async () => {
      if (!mounted) return;

      try {
        console.log(
          "Setting up peer as",
          isCaller ? "caller" : "joiner",
          "with callId:",
          callId
        );

        // Only create new call if we're the caller and don't have a callId
        if (isCaller && !callId) {
          // Create call doc first
          const callDoc = await addDoc(collection(db, "calls"), {
            createdAt: Date.now(),
            callerId: userId,
            status: "waiting",
          });

          if (!mounted) {
            await deleteDoc(doc(db, "calls", callDoc.id));
            return;
          }

          callDocRef = doc(db, "calls", callDoc.id);
          setCurrentCallId(callDoc.id);
        } else if (callId) {
          // We're joining an existing call
          callDocRef = doc(db, "calls", callId);
        }

        // Create the peer instance
        peer = new SimplePeer({
          initiator: isCaller,
          trickle: false,
          stream: localStream,
          config: { iceServers: ICE_SERVERS },
        });

        // Common error handler
        peer.on("error", (err) => {
          console.error("Peer connection error:", err);
          if (mounted) cleanup();
        });

        if (isCaller) {
          // Caller: Send offer when ready
          peer.on("signal", async (data) => {
            if (!mounted || !callDocRef) return;
            console.log("Caller sending offer");
            await setDoc(
              callDocRef,
              {
                offer: JSON.stringify(data),
                status: "waiting",
              },
              { merge: true }
            );
          });

          // Listen for answer
          if (callDocRef) {
            unsubSignal.current = onSnapshot(callDocRef, (snap) => {
              const data = snap.data();
              if (data?.answer && peer && !peer.destroyed) {
                console.log("Caller received answer");
                peer.signal(JSON.parse(data.answer));
              }
            });
          }
        } else {
          // Joiner: Get the offer and send answer
          if (callDocRef) {
            const callSnap = await getDoc(callDocRef);
            if (callSnap.exists()) {
              const callData = callSnap.data();
              if (callData?.offer) {
                console.log("Joiner processing offer");
                peer.signal(JSON.parse(callData.offer));
              }
            }

            peer.on("signal", async (data) => {
              if (!mounted || !callDocRef) return;
              console.log("Joiner sending answer");
              await updateDoc(callDocRef, {
                answer: JSON.stringify(data),
                status: "connected",
              });
            });
          }
        }

        // Handle remote stream
        peer.on("stream", (stream) => {
          if (!mounted) return;
          console.log("Received remote stream");
          setRemoteStream(stream);
          setStatus("Connected");
        });

        peerRef.current = peer;
      } catch (error) {
        console.error("Error in setupPeer:", error);
        if (mounted) cleanup();
      }
    };

    setupPeer();

    // Cleanup function
    function cleanup() {
      mounted = false;

      // Stop local stream tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      // Destroy peer connection
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }

      // Remove Firestore listener
      if (unsubSignal.current) {
        unsubSignal.current();
        unsubSignal.current = undefined;
      }

      // Only delete call document if session has ended
      if (currentCallId && hasSessionEnded()) {
        deleteDoc(doc(db, "calls", currentCallId));
      }

      setLocalStream(null);
      setRemoteStream(null);
    }

    return cleanup;
  }, [localStream, isCaller, userId, callId]);

  // 3. Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Add function to check if session has ended
  const hasSessionEnded = () => {
    if (!appointmentInfo?.endTime || !appointmentInfo?.date) return false;

    const now = new Date();
    const [endHour, endMinute] = appointmentInfo.endTime.split(".").map(Number);
    const sessionDate = new Date(appointmentInfo.date);
    sessionDate.setHours(endHour, endMinute, 0);

    return now >= sessionDate;
  };

  // Add effect to fetch appointment info
  useEffect(() => {
    const fetchAppointmentInfo = async () => {
      if (!callId) return;

      try {
        const callDoc = await getDoc(doc(db, "calls", callId));
        if (!callDoc.exists()) return;

        const appointmentId = callDoc.data().appointmentId;
        const appointmentDoc = await getDoc(
          doc(db, "appointments", appointmentId)
        );

        if (appointmentDoc.exists()) {
          const data = appointmentDoc.data();
          const [, endTime] = data.time.split(" - "); // Get end time from "HH.MM - HH.MM" format
          setAppointmentInfo({
            endTime,
            date: data.date,
          });
        }
      } catch (error) {
        console.error("Error fetching appointment info:", error);
      }
    };

    fetchAppointmentInfo();
  }, [callId]);

  // 4. End call
  const handleEndCall = async () => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }

    // Only mark as "Selesai" if session has ended
    if (currentCallId && hasSessionEnded()) {
      try {
        const callDoc = await getDoc(doc(db, "calls", currentCallId));
        if (callDoc.exists()) {
          const appointmentId = callDoc.data().appointmentId;
          await updateDoc(doc(db, "appointments", appointmentId), {
            status: "Selesai",
          });
          await deleteDoc(doc(db, "calls", currentCallId));
        }
      } catch (error) {
        console.error("Error ending call:", error);
      }
    }

    // Navigate based on user role
    const userType = localStorage.getItem("userType");
    if (onEnd) {
      if (userType === "psychiatrist") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }
  };

  // Toggle video track
  const handleToggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled((prev) => !prev);
    }
  };

  // Toggle audio track
  const handleToggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled((prev) => !prev);
    }
  };

  // Swap video function
  const handleSwapVideo = () => {
    setIsSwapped((prev) => !prev);
  };

  // 5. Share call link (for caller)
  const callLink = currentCallId
    ? `${window.location.origin}/video-call/${currentCallId}`
    : "";

  // Add effect for countdown timer
  useEffect(() => {
    if (!appointmentInfo?.endTime || !appointmentInfo?.date) return;

    const timer = setInterval(() => {
      const now = new Date();
      const [endHour, endMinute] = appointmentInfo.endTime
        .split(".")
        .map(Number);
      const endDate = new Date(appointmentInfo.date);
      endDate.setHours(endHour, endMinute, 0);

      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown("00:00:00");
        handleEndCall();
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [appointmentInfo]);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#E4DCCC] flex items-center justify-center z-50">
      {/* Main video */}
      <div className="absolute inset-0">
        <video
          ref={isSwapped ? localVideoRef : remoteVideoRef}
          autoPlay
          playsInline
          muted={isSwapped}
          className="absolute inset-0 w-full h-full object-cover bg-black"
          style={{
            zIndex: 1,
            background: isSwapped
              ? localStream
              : remoteStream
              ? "#000"
              : "#222",
          }}
        />
        {isSwapped
          ? !videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-[2]">
                <img
                  src={NoVideoLightIcon}
                  alt="Video Off"
                  className="w-32 h-32"
                />
              </div>
            )
          : remoteStream &&
            !remoteStream.getVideoTracks()[0]?.enabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-[2]">
                <img
                  src={NoVideoLightIcon}
                  alt="Video Off"
                  className="w-32 h-32"
                />
              </div>
            )}
      </div>

      {/* PiP video */}
      <div
        className="absolute top-6 right-8 w-56 h-40 z-[2] cursor-pointer"
        onClick={handleSwapVideo}
      >
        <video
          ref={isSwapped ? remoteVideoRef : localVideoRef}
          autoPlay
          muted={!isSwapped}
          playsInline
          className="w-full h-full bg-black rounded-lg object-cover shadow-lg"
          style={{
            zIndex: 2,
            background: isSwapped
              ? remoteStream
              : localStream
              ? "#000"
              : "#222",
          }}
        />
        {isSwapped
          ? remoteStream &&
            !remoteStream.getVideoTracks()[0]?.enabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-lg">
                <img
                  src={NoVideoLightIcon}
                  alt="Video Off"
                  className="w-12 h-12"
                />
              </div>
            )
          : !videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-lg">
                <img
                  src={NoVideoLightIcon}
                  alt="Video Off"
                  className="w-12 h-12"
                />
              </div>
            )}
      </div>

      {/* Overlay for waiting for remote video */}
      {!remoteStream && (
        <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none select-none z-10">
          <span className="text-gray-600 bg-white/80 px-4 py-2 rounded">
            Menunggu video dari lawan bicara...
          </span>
        </div>
      )}
      {/* Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-row items-center gap-6 z-20">
        <button
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white text-xl font-bold shadow-lg hover:bg-red-600 transition"
          title="End Call"
        >
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
            <rect x="5" y="11" width="14" height="2" rx="1" fill="white" />
          </svg>
        </button>
        {/* You can add more controls here if needed */}
      </div>
      {/* Status and call link */}
      <div className="absolute top-6 left-8 z-20 flex flex-col items-start">
        <div className="mb-2 text-lg font-semibold bg-white/80 px-4 py-2 rounded">
          {status}
        </div>
        {isCaller && callLink && (
          <div className="mb-2">
            <span className="text-sm bg-white/80 px-2 py-1 rounded">
              Share this link to join:
            </span>
            <div className="bg-white text-black px-2 py-1 rounded break-all mt-1">
              {callLink}
            </div>
          </div>
        )}
      </div>
      {/* Countdown timer */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 bg-black/40 px-4 py-1 rounded-full">
        <p className="text-white font-['Josefin_Sans'] text-lg">
          Sesi berakhir dalam: {countdown}
        </p>
      </div>
      {/* Bottom bar with video/mic/leave controls */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="flex flex-row items-center justify-center gap-8 px-6 py-2 bg-[#F9F6EC] rounded-full border border-[#e6e1d6]">
          <button
            onClick={handleToggleVideo}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-[#BACBD8] hover:bg-[#35648a] transition"
            title={videoEnabled ? "Matikan Video" : "Nyalakan Video"}
          >
            <img
              src={videoEnabled ? VideoCallIcon : NoVideoIcon}
              alt={videoEnabled ? "Video On" : "Video Off"}
              className="w-8 h-8"
            />
          </button>
          <button
            onClick={handleToggleAudio}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-[#BACBD8] hover:bg-[#35648a] transition"
            title={audioEnabled ? "Matikan Mic" : "Nyalakan Mic"}
          >
            <img
              src={audioEnabled ? MicrophoneIcon : MuteIcon}
              alt={audioEnabled ? "Mic On" : "Mic Off"}
              className="w-8 h-8"
            />
          </button>
          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-[#BACBD8] hover:bg-[#35648a] transition"
            title="Keluar"
          >
            <img src={LeaveIcon} alt="Leave" className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
