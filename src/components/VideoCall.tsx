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
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (isMounted) setLocalStream(stream);
      })
      .catch(() => setStatus("Failed to access camera/mic"));
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

  // 5. Share call link (for caller)
  const callLink = currentCallId
    ? `${window.location.origin}/video-call/${currentCallId}`
    : "";

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#E4DCCC] rounded-lg p-4">
      <div className="flex gap-4 mb-4">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-48 h-36 bg-black rounded"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-48 h-36 bg-black rounded"
        />
      </div>
      <div className="mb-2 text-lg font-semibold">{status}</div>
      {isCaller && callLink && (
        <div className="mb-2">
          <span className="text-sm">Share this link to join:</span>
          <div className="bg-white text-black px-2 py-1 rounded break-all">
            {callLink}
          </div>
        </div>
      )}
      <button
        onClick={handleEndCall}
        className="bg-red-500 text-white px-4 py-2 rounded mt-2"
      >
        End Call
      </button>
    </div>
  );
};

export default VideoCall;
