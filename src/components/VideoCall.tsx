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
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [currentCallId, setCurrentCallId] = useState<string | null>(
    callId || null
  );
  const [status, setStatus] = useState("Connecting...");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSwapped, setIsSwapped] = useState(false);
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const unsubSignal = useRef<() => void>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

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
        // console.log("Got local stream", stream);
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

  // 2. Setup Peer and Firestore signaling
  useEffect(() => {
    if (!localStream) return;

    let peer: SimplePeer.Instance;
    let callDocRef: any = null;

    const setupPeer = async () => {
      if (isCaller) {
        // Create call doc
        const callDoc = await addDoc(collection(db, "calls"), {
          createdAt: Date.now(),
          callerId: userId,
          status: "waiting",
        });
        setCurrentCallId(callDoc.id);
        callDocRef = callDoc;

        peer = new SimplePeer({
          initiator: true,
          trickle: false,
          stream: localStream,
          config: { iceServers: ICE_SERVERS },
        });

        // Listen for signal to send offer
        peer.on("signal", async (data) => {
          await setDoc(
            doc(db, "calls", callDoc.id),
            {
              offer: JSON.stringify(data),
              callerId: userId,
              status: "waiting",
              createdAt: Date.now(),
            },
            { merge: true }
          );
        });

        // Listen for answer from callee
        unsubSignal.current = onSnapshot(
          doc(db, "calls", callDoc.id),
          (snap) => {
            const d = snap.data();
            if (d?.answer && !peer.destroyed) {
              peer.signal(JSON.parse(d.answer));
              setStatus("Connected");
            }
          }
        );
      } else {
        // Joiner: Wait for offer, then send answer
        if (!currentCallId) {
          setStatus("No call ID");
          return;
        }
        callDocRef = doc(db, "calls", currentCallId);

        const callSnap = await getDoc(callDocRef);
        const callData = callSnap.data();
        if (!callData?.offer) {
          setStatus("Waiting for offer...");
          return;
        }

        peer = new SimplePeer({
          initiator: false,
          trickle: false,
          stream: localStream,
          config: { iceServers: ICE_SERVERS },
        });

        // Listen for signal to send answer
        peer.on("signal", async (data) => {
          await updateDoc(callDocRef, {
            answer: JSON.stringify(data),
            calleeId: userId,
            status: "connected",
          });
        });

        // Signal with offer from Firestore
        peer.signal(JSON.parse(callData.offer));
        setStatus("Connected");
      }

      // Handle remote stream
      peer.on("stream", (stream) => {
        setRemoteStream(stream);
      });

      // Handle close
      peer.on("close", () => {
        setStatus("Call ended");
        cleanup();
      });

      peer.on("error", (err) => {
        setStatus("Error: " + err.message);
        cleanup();
      });

      peerRef.current = peer;
    };

    setupPeer();

    // Cleanup
    function cleanup() {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      if (unsubSignal.current) {
        unsubSignal.current();
        unsubSignal.current = undefined;
      }
      setRemoteStream(null);
      setLocalStream((stream) => {
        stream?.getTracks().forEach((t) => t.stop());
        return null;
      });
      if (onEnd) onEnd();
    }

    return () => {
      cleanup();
      // Optionally delete call doc if caller
      if (isCaller && callDocRef && callDocRef.id) {
        deleteDoc(doc(db, "calls", callDocRef.id));
      }
    };
    // eslint-disable-next-line
  }, [localStream]);

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

  // 4. End call
  const handleEndCall = async () => {
    if (peerRef.current) peerRef.current.destroy();
    if (currentCallId) await deleteDoc(doc(db, "calls", currentCallId));
    setStatus("Call ended");
    if (onEnd) onEnd();
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
