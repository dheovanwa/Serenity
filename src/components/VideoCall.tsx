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

// Static ICE servers with your credentials
const STATIC_ICE_SERVERS = [
  // STUN server
  {
    urls: "stun:stun.relay.metered.ca:80",
  },
  // TURN servers with your credentials
  {
    urls: "turn:standard.relay.metered.ca:80",
    username: "c6a760b104701bce9558c2b1",
    credential: "IJHTmqJf4Xez3BfA",
  },
  {
    urls: "turn:standard.relay.metered.ca:80?transport=tcp",
    username: "c6a760b104701bce9558c2b1",
    credential: "IJHTmqJf4Xez3BfA",
  },
  {
    urls: "turn:standard.relay.metered.ca:443",
    username: "c6a760b104701bce9558c2b1",
    credential: "IJHTmqJf4Xez3BfA",
  },
  {
    urls: "turns:standard.relay.metered.ca:443?transport=tcp",
    username: "c6a760b104701bce9558c2b1",
    credential: "IJHTmqJf4Xez3BfA",
  },
];

// Function to fetch dynamic ICE servers from API
const fetchIceServers = async () => {
  try {
    const response = await fetch(
      "https://serenity.metered.live/api/v1/turn/credentials?apiKey=eb72801161cf43e3144b81438fcfbb804c0f"
    );

    if (response.ok) {
      const iceServers = await response.json();
      console.log("Fetched dynamic ICE servers:", iceServers);
      return iceServers;
    } else {
      console.warn("Failed to fetch dynamic ICE servers, using static ones");
      return STATIC_ICE_SERVERS;
    }
  } catch (error) {
    console.error("Error fetching ICE servers:", error);
    return STATIC_ICE_SERVERS;
  }
};

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
  const [status, setStatus] = useState("Menghubungkan...");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSwapped, setIsSwapped] = useState(false);
  const [countdown, setCountdown] = useState<string>("--:--:--");
  const [iceServers, setIceServers] = useState(STATIC_ICE_SERVERS);
  const [callerActive, setCallerActive] = useState<boolean>(true);
  const [waitingForCaller, setWaitingForCaller] = useState<boolean>(false);
  const [offerReceived, setOfferReceived] = useState<boolean>(false);
  const [joinerJoined, setJoinerJoined] = useState<boolean>(false);
  const [waitingForJoiner, setWaitingForJoiner] = useState<boolean>(false);
  const [joinerActive, setJoinerActive] = useState<boolean>(false);
  const [callerVideo, setCallerVideo] = useState(true);
  const [callerMic, setCallerMic] = useState(true);
  const [joinerVideo, setJoinerVideo] = useState(true);
  const [joinerMic, setJoinerMic] = useState(true);
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const unsubSignal = useRef<() => void>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const cleanupExecutedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const isRejoiningRef = useRef(false);
  const connectionStateRef = useRef<string>("new");
  const signalProcessedRef = useRef<Set<string>>(new Set());
  const setupInProgressRef = useRef(false);
  const callerActivityListenerRef = useRef<() => void>();
  const joinerActivityListenerRef = useRef<() => void>();

  // Get user info
  const userId = localStorage.getItem("documentId");
  const userType = localStorage.getItem("userType");

  // 1. Get user media with better audio constraints
  useEffect(() => {
    let isMounted = true;
    let triedOnce = false;

    async function getMediaWithRetry() {
      // Add delay for rejoin scenarios to ensure proper cleanup
      if (isRejoiningRef.current) {
        console.log("Rejoin detected, waiting for cleanup...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      try {
        console.log("Requesting local media...");

        // Ensure any existing stream is properly stopped before requesting new one
        if (streamRef.current) {
          console.log("Stopping existing stream before requesting new one");
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
          streamRef.current = null;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        console.log("Got local stream", stream);
        streamRef.current = stream;

        // Check if audio tracks are properly enabled
        const audioTracks = stream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();

        console.log("Audio tracks:", audioTracks);
        console.log("Video tracks:", videoTracks);

        // Log camera and microphone device information
        audioTracks.forEach((track, index) => {
          console.log(`Audio Track ${index}:`);
          console.log(`  - Label: ${track.label || "Unknown Microphone"}`);
          console.log(
            `  - Device ID: ${track.getSettings().deviceId || "Unknown"}`
          );
          console.log(`  - Enabled: ${track.enabled}`);
          console.log(`  - Ready State: ${track.readyState}`);
        });

        videoTracks.forEach((track, index) => {
          console.log(`Video Track ${index}:`);
          console.log(`  - Label: ${track.label || "Unknown Camera"}`);
          console.log(
            `  - Device ID: ${track.getSettings().deviceId || "Unknown"}`
          );
          console.log(`  - Enabled: ${track.enabled}`);
          console.log(`  - Ready State: ${track.readyState}`);
          const settings = track.getSettings();
          console.log(`  - Resolution: ${settings.width}x${settings.height}`);
          console.log(`  - Frame Rate: ${settings.frameRate || "Unknown"}`);
        });

        if (isMounted) {
          setLocalStream(stream);
        } else {
          // Clean up stream if component was unmounted while getting media
          stream.getTracks().forEach((track) => {
            console.log(`Cleanup: Stopping ${track.kind} track during unmount`);
            track.stop();
          });
          streamRef.current = null;
        }
      } catch (err) {
        console.log("Failed to get local media", err);
        // If failed, try again with basic constraints
        if (!triedOnce) {
          triedOnce = true;
          // Add longer delay for retry on rejoin
          if (isRejoiningRef.current) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });
            console.log("Got fallback stream", fallbackStream);
            streamRef.current = fallbackStream;
            if (isMounted) {
              setLocalStream(fallbackStream);
            } else {
              fallbackStream.getTracks().forEach((track) => track.stop());
              streamRef.current = null;
            }
          } catch (fallbackErr) {
            console.log("Fallback also failed", fallbackErr);
            setStatus("Gagal menggakses kamera atau mikrofon");
          }
        } else {
          setStatus("Gagal menggakses kamera atau mikrofon");
        }
      }
    }

    getMediaWithRetry();

    return () => {
      isMounted = false;
      // Clean up current stream when effect unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          console.log(
            `Effect cleanup: Stopping ${track.kind} track: ${
              track.label || "Unknown"
            }`
          );
          track.stop();
        });
        console.log("Effect cleanup: All media tracks stopped");
        streamRef.current = null;
      }
    };
  }, []);

  // Set callerJoined to true when caller joins the room
  useEffect(() => {
    if (isCaller && callId) {
      updateDoc(doc(db, "calls", callId), { callerJoined: true }).catch(
        () => {}
      );
    }
  }, [isCaller, callId]);

  // 1. Setup Peer and Firestore signaling
  useEffect(() => {
    if (!localStream) return;

    let mounted = true;
    let peer: SimplePeer.Instance | null = null;
    let callDocRef: any = null;

    // Listen to joinerActive and joinerJoined for caller to update loading state in real-time
    if (isCaller && callId) {
      if (joinerActivityListenerRef.current) {
        joinerActivityListenerRef.current();
        joinerActivityListenerRef.current = undefined;
      }
      joinerActivityListenerRef.current = onSnapshot(
        doc(db, "calls", callId),
        async (snapshot) => {
          if (!snapshot.exists()) return;
          const data = snapshot.data();
          const nowJoinerActive = data.joinerActive === true;
          const nowJoinerJoined = data.joinerJoined === true;
          const nowCallerJoined = data.callerJoined === true;

          setJoinerActive(nowJoinerActive);
          setJoinerJoined(nowJoinerJoined);
          // Optionally, you can use nowCallerJoined in your UI or logic if needed

          // Show loading if joiner is not joined or not active
          if (!nowJoinerJoined) {
            setWaitingForJoiner(true);
            setStatus("Menunggu peserta untuk untuk masuk...");
          } else if (!nowJoinerActive) {
            setWaitingForJoiner(true);
            setStatus("Menunggu peserta untuk untuk bergabung kembali...");
          } else {
            setWaitingForJoiner(false);
            setStatus("Menghubungkan ke peserta...");
          }

          // Only refresh the caller page when joinerJoined is false AND status is "connected"
          if (isCaller && !nowJoinerJoined && data.status === "connected") {
            console.log(
              "Joiner rejoined, resending offer and refreshing page..."
            );
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }

          // Update status field in Firestore based on join state
          try {
            if (isCaller && callId) {
              if (nowJoinerJoined && nowCallerJoined) {
                // Both joined, set status to connected
                await updateDoc(doc(db, "calls", callId), {
                  status: "connected",
                });
              } else {
                // Only one joined, set status to waiting
                await updateDoc(doc(db, "calls", callId), {
                  status: "waiting",
                });
              }
            }
          } catch (e) {
            // Ignore update errors
          }
        }
      );
    }

    // Listen for call document deletion or caller leaving, so joiner also leaves
    if (!isCaller && callId) {
      if (joinerActivityListenerRef.current) {
        joinerActivityListenerRef.current();
        joinerActivityListenerRef.current = undefined;
      }
      joinerActivityListenerRef.current = onSnapshot(
        doc(db, "calls", callId),
        (snapshot) => {
          if (!snapshot.exists()) {
            // Call document deleted, end call for joiner
            navigate("/");
            return;
          }
          const data = snapshot.data();
          // If callerActive is false and callerJoined is false, caller has left, so joiner should leave
          if (data.callerActive === false && data.callerJoined === false) {
            // Reset all fields except id
            updateDoc(doc(db, "calls", callId), {
              offer: null,
              answer: null,
              callerActive: null,
              callerJoined: null,
              joinerActive: null,
              joinerJoined: null,
              status: null,
              lastCallerDisconnect: null,
              lastJoinerDisconnect: null,
            });
            navigate("/");
          }
        }
      );
    }

    const checkCallerActivityAndOffer = async () => {
      if (!callId || isCaller) return true; // Callers don't need to check

      try {
        console.log("Checking if caller is active and offer exists...");
        setWaitingForCaller(true);

        const callDocSnapshot = await getDoc(doc(db, "calls", callId));
        if (!callDocSnapshot.exists()) {
          console.error("Call document not found");
          setStatus("Call not found");
          return false;
        }

        const callData = callDocSnapshot.data();
        const isCallerActive = callData.callerActive === true;
        const hasOffer = !!callData.offer;

        setCallerActive(isCallerActive);
        setOfferReceived(hasOffer);

        if (!isCallerActive || !hasOffer) {
          console.log(
            `Caller status: active=${isCallerActive}, offer=${
              hasOffer ? "yes" : "no"
            }`
          );
          setStatus(
            !isCallerActive
              ? "Waiting for host to join the call..."
              : !hasOffer
              ? "Waiting for host to initialize connection..."
              : "Preparing connection..."
          );

          // Set up listener for caller activity AND offer changes
          callerActivityListenerRef.current = onSnapshot(
            doc(db, "calls", callId),
            (snapshot) => {
              if (!snapshot.exists()) {
                setStatus("Video call telah berakhir");
                return;
              }

              const data = snapshot.data();
              const nowCallerActive = data.callerActive === true;
              const nowHasOffer = !!data.offer;

              setCallerActive(nowCallerActive);
              setOfferReceived(nowHasOffer);

              if (nowCallerActive && !nowHasOffer) {
                setStatus("Host terhubung, menunggu inisialisasi panggilan...");
              }

              // Only proceed when both conditions are met
              if (nowCallerActive && nowHasOffer && mounted) {
                console.log(
                  "Caller is active and offer is available, proceeding with join"
                );
                setWaitingForCaller(false);
                setStatus("Bergabung dengan video call...");

                // Stop listening once conditions are met
                if (callerActivityListenerRef.current) {
                  callerActivityListenerRef.current();
                  callerActivityListenerRef.current = undefined;
                }

                // Trigger reconnection
                if (!peerRef.current && mounted) {
                  setupPeer(); // Call setupPeer again to establish connection
                }
              }
            }
          );

          return false;
        }

        setWaitingForCaller(false);
        return true;
      } catch (error) {
        console.error("Error checking caller activity:", error);
        setStatus("Terjadi kesalahan saat memeriksa status host");
        setWaitingForCaller(false);
        return false;
      }
    };

    const setupPeer = async (forceNewSetup = false) => {
      if (!mounted) return;

      // If this is a joiner, immediately set joinerJoined to true before any checks or loading states
      if (!isCaller && callId) {
        console.log("Joiner is setting joined status to true immediately");
        setJoinerJoined(true);

        // Update Firestore to indicate joiner has joined
        try {
          const callDocSnapshot = await getDoc(doc(db, "calls", callId));
          if (callDocSnapshot.exists()) {
            await updateDoc(doc(db, "calls", callId), {
              joinerJoined: true,
              joinerActive: false, // Initialize as false, this will be set to true later
            });
            console.log("Set joinerJoined to true in Firestore");
          } else {
            console.error("Call document not found when setting joiner status");
          }
        } catch (error) {
          console.error("Error updating joiner status:", error);
        }
      }

      // For joiners, check if caller is active AND offer exists before proceeding
      if (!isCaller) {
        const canProceed = await checkCallerActivityAndOffer();
        if (!canProceed) return; // Wait for caller to become active AND send offer
      }

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
            callerActive: true,
            joinerActive: false,
            callerVideo: true,
            callerMic: true,
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

          // Update activity status based on role
          if (isCaller) {
            await updateDoc(callDocRef, {
              callerActive: true,
              callerVideo: true,
              callerMic: true,
            });
          } else {
            await updateDoc(callDocRef, {
              joinerActive: true,
              joinerJoined: true,
              joinerVideo: true,
              joinerMic: true,
            });
            setJoinerJoined(true);
          }
        }

        // Ensure previous peer is completely destroyed before creating new one
        if (peerRef.current) {
          console.log("Destroying existing peer before creating new one");
          peerRef.current.destroy();
          peerRef.current = null;
          // Add small delay to ensure cleanup
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Create the peer instance with your ICE configuration
        peer = new SimplePeer({
          initiator: isCaller,
          trickle: false,
          stream: localStream,
          config: {
            iceServers: iceServers,
            // Enhanced configuration for better connectivity during rejoins
            iceCandidatePoolSize: 10,
            iceTransportPolicy: "all",
            bundlePolicy: "max-bundle",
            rtcpMuxPolicy: "require",
          },
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
            console.log(
              "Caller sending offer" + (forceNewSetup ? " (reconnection)" : "")
            );
            await setDoc(
              callDocRef,
              {
                offer: JSON.stringify(data),
                status: "waiting",
                callerActive: true, // Set callerActive to true after offer sent
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
          setStatus("Terkoneksi");
        });

        peerRef.current = peer;
      } catch (error) {
        console.error("Error in setupPeer:", error);
        if (mounted) cleanup();
      } finally {
        setupInProgressRef.current = false;
      }
    };

    setupPeer();

    // Cleanup function
    function cleanup() {
      if (!mounted) return;
      mounted = false;

      console.log("Starting peer cleanup...");

      // Stop local stream tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          console.log(
            `Stopping ${track.kind} track: ${track.label || "Unknown"}`
          );
          track.stop();
        });
        console.log("All local media tracks stopped and devices disconnected");
      }

      // Clear stream reference
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Clear video element sources to release browser permissions
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
        localVideoRef.current.load();
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
        remoteVideoRef.current.load();
      }

      // Destroy peer connection
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }

      // Remove Firestore listeners
      if (unsubSignal.current) {
        unsubSignal.current();
        unsubSignal.current = undefined;
      }

      // Remove caller activity listener
      if (callerActivityListenerRef.current) {
        callerActivityListenerRef.current();
        callerActivityListenerRef.current = undefined;
      }

      // Remove joiner activity listener
      if (joinerActivityListenerRef.current) {
        joinerActivityListenerRef.current();
        joinerActivityListenerRef.current = undefined;
      }

      console.log("Peer cleanup completed");
    }

    return cleanup;
  }, [localStream, isCaller, userId, callId, iceServers]); // Add iceServers dependency

  // 3. Attach streams to video elements with proper audio handling
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      // Ensure local video is muted to prevent feedback
      localVideoRef.current.muted = true;
      console.log("Local stream attached to video element");
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      // Remote video should NOT be muted to hear the other person
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.volume = 1.0;

      // Check remote audio tracks
      const remoteTracks = remoteStream.getAudioTracks();
      console.log("Remote audio tracks:", remoteTracks);
      remoteTracks.forEach((track) => {
        console.log(
          `Remote audio track enabled: ${track.enabled}, readyState: ${track.readyState}`
        );
      });

      console.log("Remote stream attached to video element");
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

  // 4. End call - Add activity status updates
  const handleEndCall = async () => {
    console.log("Starting call cleanup process...");

    // Set cleanup flag
    cleanupExecutedRef.current = true;

    // Clear video element sources first
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
      localVideoRef.current.load();
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
      remoteVideoRef.current.load();
    }

    // Stop all local media tracks before destroying peer
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        console.log(
          `Stopping ${track.kind} track: ${track.label || "Unknown"}`
        );
        track.stop();
      });
      console.log("All local media tracks stopped and devices disconnected");
      setLocalStream(null);
    }

    // Stop stream reference
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log(
          `Stopping stream ref ${track.kind} track: ${track.label || "Unknown"}`
        );
        track.stop();
      });
      streamRef.current = null;
    }

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // Remove Firestore listeners
    if (unsubSignal.current) {
      unsubSignal.current();
      unsubSignal.current = undefined;
    }

    // Only handle session end and appointment completion
    if (currentCallId) {
      try {
        const callDoc = await getDoc(doc(db, "calls", currentCallId));
        if (callDoc.exists()) {
          const callData = callDoc.data();

          // If session has ended naturally, mark appointment as completed and clean up
          if (hasSessionEnded()) {
            const appointmentId = callData.appointmentId;
            if (appointmentId) {
              await updateDoc(doc(db, "appointments", appointmentId), {
                status: "Selesai",
              });
            }
            // Delete the call document when session ends
            await deleteDoc(doc(db, "calls", currentCallId));
          } else {
            // Update active status based on role
            if (isCaller) {
              await updateDoc(doc(db, "calls", currentCallId), {
                callerActive: false,
                callerJoined: false, // Mark that caller has left
                lastCallerDisconnect: Date.now(),
              });
              console.log("Caller marked as inactive and left");
            } else {
              // When joiner leaves, set callerActive to false, answer to null, and refresh caller page
              await updateDoc(doc(db, "calls", currentCallId), {
                joinerActive: false,
                joinerJoined: false,
                callerActive: false, // Set callerActive to false
                answer: null, // Set answer to null
                lastJoinerDisconnect: Date.now(),
              });
              console.log(
                "Joiner marked as inactive and left, callerActive set to false, answer set to null"
              );
              // Notify the caller to refresh (simulate by reloading the page for both roles)
              if (!isCaller) {
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error updating call status:", error);
      }
    }

    console.log("Call cleanup completed");

    // Small delay to ensure cleanup is complete before navigation
    setTimeout(() => {
      const userType = localStorage.getItem("userType");
      if (onEnd) {
        onEnd();
      }
      if (userType === "psychiatrist") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }, 100);
  };

  // Toggle audio track with better handling
  const handleToggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !audioEnabled;
        console.log(`Audio track ${track.enabled ? "enabled" : "disabled"}`);
      });
      setAudioEnabled((prev) => !prev);
    }
  };

  // Toggle video track
  const handleToggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !videoEnabled;
        console.log(`Video track ${track.enabled ? "enabled" : "disabled"}`);
      });
      setVideoEnabled((prev) => !prev);
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

  // Add cleanup effect for component unmount and page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("Page unloading, cleaning up media and updating status...");

      if (currentCallId) {
        try {
          // Set active status to false based on role
          const updateData = isCaller
            ? {
                callerActive: false,
                callerJoined: false,
                lastCallerDisconnect: Date.now(),
              }
            : {
                joinerActive: false,
                joinerJoined: false, // Mark that joiner has left
                lastJoinerDisconnect: Date.now(),
              };

          // Use navigator.sendBeacon for more reliable updates during page unload
          const sessionEndpoint = `${window.location.origin}/api/update-call-status`;
          const blob = new Blob(
            [
              JSON.stringify({
                callId: currentCallId,
                ...updateData,
              }),
            ],
            { type: "application/json" }
          );

          navigator.sendBeacon(sessionEndpoint, blob);

          // Attempt Firestore update without await (it might not complete)
          updateDoc(doc(db, "calls", currentCallId), updateData).catch((err) =>
            console.log("Update may not complete before page unload")
          );
        } catch (error) {
          // Not much we can do during page unload
          console.error("Error updating status during page unload");
        }
      }

      if (localStream && !cleanupExecutedRef.current) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentCallId, isCaller, localStream]);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#E4DCCC] flex items-center justify-center z-50">
      {/* Mobile screen popup */}
      <div className="sm:hidden fixed inset-0 flex items-center justify-center bg-black/70 z-[100]">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-xs text-center">
          <div className="mb-4">
            <svg
              className="mx-auto mb-2"
              width="48"
              height="48"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" fill="#F87171" />
              <path
                d="M12 8v4"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="1" fill="#fff" />
            </svg>
            <span className="block text-lg font-semibold text-gray-800">
              Anda perlu berada pada mode desktop atau menggunakan
              komputer/laptop untuk menggunakan layanan video call
            </span>
          </div>
        </div>
      </div>
      {/* Main video */}
      <div className="absolute inset-0">
        <video
          ref={isSwapped ? localVideoRef : remoteVideoRef}
          autoPlay
          playsInline
          muted={isSwapped ? true : false} // Local is muted, remote is not
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
        className="absolute top-6 right-8 w-56 h-40 z-[2]"
        // onClick={handleSwapVideo}
      >
        <video
          ref={isSwapped ? remoteVideoRef : localVideoRef}
          autoPlay
          muted={isSwapped ? false : true} // Remote is not muted, local is muted
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
      {/* Show waiting message when waiting for caller */}
      {!isCaller && waitingForCaller && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {!callerActive
                ? "Waiting for host to join"
                : !offerReceived
                ? "Waiting for host to start call"
                : "Connecting to call..."}
            </h3>
            <p className="text-gray-600">
              {!callerActive
                ? "The host is currently not active in the call. We'll automatically connect you when they return."
                : !offerReceived
                ? "The host is online but hasn't started the call yet. Please wait a moment."
                : "Setting up your call connection..."}
            </p>
          </div>
        </div>
      )}
      {/* Show waiting message when caller is waiting for joiner */}
      {isCaller && waitingForJoiner && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {!joinerJoined
                ? "Waiting for participant to join"
                : !joinerActive
                ? "Waiting for participant to reconnect"
                : "Connecting to participant..."}
            </h3>
            <p className="text-gray-600">
              {!joinerJoined
                ? "Please share the invitation link with your participant. The call will connect automatically once they join."
                : !joinerActive
                ? "The participant is temporarily disconnected. We'll automatically reconnect when they return."
                : "Establishing connection with participant..."}
            </p>
          </div>
        </div>
      )}
      {/* Overlay for waiting for remote video - only show when not waiting for caller */}
      {!waitingForCaller && !remoteStream && (
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
      </div>
      {/* Countdown timer */}
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-30 bg-black/40 px-4 py-1 rounded-full">
        <p className="text-white font-['Josefin_Sans'] text-lg">
          Sesi berakhir dalam: {countdown}
        </p>
      </div>
      {/* Bottom bar with video/mic/leave controls */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-120">
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
