import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { HomeController } from "../controllers/HomeController";
import { CarouselDemo } from "../components/RecommendedPsychiatrist";
import AppointmentStatusUpdater from "../components/AppointmentStatusUpdater";
import Footer from "../components/Footer";
import send from "../assets/send.svg";
import { db } from "../config/firebase";
import { Send } from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  limit,
  onSnapshot,
} from "firebase/firestore";
import ProfilePic from "../assets/default_profile_image.svg";
import { notificationScheduler } from "../utils/notificationScheduler";
import VideoRatingDialog from "../components/VideoRatingDialog";
import Loading from "../components/Loading";

const Homepage: React.FC<HomepageProps> = ({ isDarkMode }) => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [firstName, setFirstName] = useState<string>("Loading...");
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [showVideoRatingDialog, setShowVideoRatingDialog] = useState(false);
  const [pendingVideoRating, setPendingVideoRating] = useState<{
    id: string;
    psychiatristId: string;
    doctorName: string;
  } | null>(null);
  const [checkedAppointments, setCheckedAppointments] = useState<Set<string>>(
    new Set()
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCallEndedDialog, setShowCallEndedDialog] = useState(false);

  // Add ref at component level
  const navigatedCalls = useRef<Set<string>>(new Set());
  const recentlyEndedCalls = useRef<Set<string>>(new Set());

  const navigate = useNavigate();
  const controller = new HomeController();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const userId = localStorage.getItem("documentId");
      if (userId) {
        try {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFirstName(userData.firstName || "Pengguna");
            setUserName(userData.firstName || "Pengguna");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setFirstName("Pengguna");
        }
      }

      // Initialize notification scheduler
      await notificationScheduler.restoreScheduledNotifications();

      // Set recommended loading to false after a delay to simulate psychiatrist data loading
      setTimeout(() => {
        setLoadingRecommended(false);
      }, 1000);
    };

    checkAuthAndLoadData();
  }, [navigate]);

  // Check if all data has finished loading
  const isAllDataLoaded =
    !loadingChats &&
    !loadingUpcoming &&
    !loadingSessions &&
    !loadingRecommended &&
    firstName !== "Loading...";

  // Update isLoading based on all data loading states
  useEffect(() => {
    setIsLoading(!isAllDataLoaded);
  }, [isAllDataLoaded]);

  // Fetch active chat sessions for the user
  useEffect(() => {
    let unsubscribes: (() => void)[] = [];
    const fetchActiveChats = async () => {
      setLoadingChats(true);
      try {
        const userId = localStorage.getItem("documentId");
        if (!userId) {
          setActiveChats([]);
          setLoadingChats(false);
          return;
        }
        const appointmentsQ = query(
          collection(db, "appointments"),
          where("patientId", "==", userId),
          where("method", "==", "Chat"),
          where("status", "==", "Sedang berlangsung")
        );
        const appointmentsSnap = await getDocs(appointmentsQ);
        const chatSessions: any[] = [];
        let sessionsMap: Record<string, any> = {};

        // Prepare all chat sessions first
        for (const docSnap of appointmentsSnap.docs) {
          const apt = docSnap.data();
          const appointmentId = docSnap.id;
          let psychiatristName = "";
          let psychiatristImage = ProfilePic;
          if (apt.psychiatristId) {
            const psychiatristDoc = await getDoc(
              doc(db, "psychiatrists", apt.psychiatristId)
            );
            if (psychiatristDoc.exists()) {
              const psyData = psychiatristDoc.data();
              psychiatristName = psyData.name || "";
              psychiatristImage =
                psyData.image && psyData.image.trim() !== ""
                  ? psyData.image
                  : ProfilePic;
            }
          }
          // Set initial session data
          sessionsMap[appointmentId] = {
            id: appointmentId,
            psychiatristName,
            psychiatristImage,
            latestMessage: "Sesi chat dimulai",
            latestReceiverRead: true,
          };
        }

        // Set initial state so UI doesn't flicker
        setActiveChats(Object.values(sessionsMap));

        // Listen for latest message in each chat session
        for (const appointmentId of Object.keys(sessionsMap)) {
          const messagesQ = query(
            collection(db, "chats", appointmentId, "messages"),
            orderBy("timeCreated", "desc"),
            limit(1)
          );
          const unsubscribe =
            // @ts-ignore
            (await import("firebase/firestore")).onSnapshot(
              messagesQ,
              async (messagesSnap) => {
                let latestMessage = "Sesi chat dimulai";
                let latestReceiverRead = true;
                if (!messagesSnap.empty) {
                  const msgSnapshot = messagesSnap.docs[0];
                  const msgData = msgSnapshot.data();
                  let isUserSender = false;
                  if (msgData.senderId) {
                    try {
                      const senderDocRef = doc(db, "users", msgData.senderId);
                      const senderDoc = await getDoc(senderDocRef);
                      if (senderDoc.exists()) {
                        const currentUserId =
                          localStorage.getItem("documentId");
                        if (
                          senderDoc.id &&
                          currentUserId &&
                          senderDoc.id === currentUserId
                        ) {
                          isUserSender = true;
                        }
                      }
                    } catch (e) {
                      // ignore error, fallback to false
                    }
                  }
                  if (isUserSender) {
                    latestMessage = `Saya: ${msgData.text || ""}`;
                  } else {
                    latestMessage = msgData.text || "";
                  }
                  latestReceiverRead =
                    msgData.receiverRead !== undefined
                      ? msgData.receiverRead
                      : true;
                }
                // Update the session in state
                setActiveChats((prev) => {
                  const updated = prev.map((session) =>
                    session.id === appointmentId
                      ? {
                          ...session,
                          latestMessage,
                          latestReceiverRead,
                        }
                      : session
                  );
                  return updated;
                });
              }
            );
          unsubscribes.push(unsubscribe);
        }
        setLoadingChats(false);
      } catch (error) {
        setActiveChats([]);
        setLoadingChats(false);
      }
    };
    fetchActiveChats();

    return () => {
      unsubscribes.forEach((unsub) => unsub && unsub());
    };
  }, [userName]);

  // Fetch active video sessions for the user (as patient, only Video method)
  useEffect(() => {
    let unsubscribes: (() => void)[] = [];
    const fetchActiveSessions = async () => {
      setLoadingSessions(true);
      try {
        const userId = localStorage.getItem("documentId");
        if (!userId) {
          setActiveSessions([]);
          setLoadingSessions(false);
          return;
        }
        const appointmentsQ = query(
          collection(db, "appointments"),
          where("patientId", "==", userId),
          where("method", "==", "Video"),
          where("status", "==", "Sedang berlangsung")
        );
        const appointmentsSnap = await getDocs(appointmentsQ);
        const sessionsMap: Record<string, any> = {};

        for (const docSnap of appointmentsSnap.docs) {
          const apt = docSnap.data();
          const appointmentId = docSnap.id;
          // Fetch psychiatrist info
          let psychiatristName = "";
          let psychiatristImage = ProfilePic;
          if (apt.psychiatristId) {
            const psychiatristDoc = await getDoc(
              doc(db, "psychiatrists", apt.psychiatristId)
            );
            if (psychiatristDoc.exists()) {
              const psyData = psychiatristDoc.data();
              psychiatristName = psyData.name || "";
              psychiatristImage =
                psyData.image && psyData.image.trim() !== ""
                  ? psyData.image
                  : ProfilePic;
            }
          }
          sessionsMap[appointmentId] = {
            id: appointmentId,
            psychiatristName,
            psychiatristImage,
            method: apt.method || "",
            time: apt.time || "",
            date: apt.date || "",
            symptoms: apt.gejala || "",
          };
        }

        setActiveSessions(Object.values(sessionsMap));
        setLoadingSessions(false);
      } catch (error) {
        setActiveSessions([]);
        setLoadingSessions(false);
      }
    };
    fetchActiveSessions();

    return () => {
      unsubscribes.forEach((unsub) => unsub && unsub());
    };
  }, [userName]);

  // Fetch upcoming appointments for the user
  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      setLoadingUpcoming(true);
      try {
        const userId = localStorage.getItem("documentId");
        if (!userId) {
          setUpcomingAppointments([]);
          setLoadingUpcoming(false);
          return;
        }
        const appointmentsQ = query(
          collection(db, "appointments"),
          where("patientId", "==", userId),
          where("status", "==", "Terjadwal"),
          orderBy("date", "asc")
        );
        const appointmentsSnap = await getDocs(appointmentsQ);
        const appointments: any[] = [];
        for (const docSnap of appointmentsSnap.docs) {
          const apt = docSnap.data();
          const dateObj = new Date(apt.date);
          const dayNames = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
          const day = dayNames[dateObj.getDay()];
          const dateNum = dateObj.getDate().toString();
          const appointmentDate = `${dateObj.toLocaleDateString("id-ID", {
            weekday: "long",
          })}, ${dateObj.getDate()} ${dateObj.toLocaleDateString("id-ID", {
            month: "long",
          })} ${dateObj.getFullYear()}`;
          appointments.push({
            id: docSnap.id,
            day,
            date: dateNum,
            psychiatristName: apt.doctorName,
            appointmentDate,
            time: apt.time,
            method: apt.method,
            action: apt.method === "Video" ? "Bergabung" : "Kelola",
          });
        }
        setUpcomingAppointments(appointments);
      } catch (error) {
        setUpcomingAppointments([]);
      }
      setLoadingUpcoming(false);
    };
    fetchUpcomingAppointments();
  }, [userName]);

  // Check for completed video appointments that need rating
  useEffect(() => {
    const checkForCompletedVideoAppointments = async () => {
      const documentId = localStorage.getItem("documentId");
      const userType = localStorage.getItem("userType");

      if (!documentId || userType !== "user") return;

      try {
        // Get user's video appointments with "Selesai" status
        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          where("patientId", "==", documentId),
          where("method", "==", "Video"),
          where("status", "==", "Selesai")
        );

        const querySnapshot = await getDocs(q);

        for (const appointmentDoc of querySnapshot.docs) {
          const appointmentData = appointmentDoc.data();
          console.log(
            `Found completed video appointment: ${appointmentData.patientName}`
          );
          const appointmentId = appointmentDoc.id;

          // Skip if already checked this session
          if (checkedAppointments.has(appointmentId)) continue;
          console.log(`Checking appointment ${appointmentId} for video rating`);

          // Check if this appointment has already been rated
          const videoRatingRef = doc(db, "videoRatings", appointmentId);
          const existingRating = await getDoc(videoRatingRef);

          if (!existingRating.exists()) {
            // This appointment needs rating
            setPendingVideoRating({
              id: appointmentId,
              psychiatristId: appointmentData.psychiatristId,
              doctorName: appointmentData.doctorName,
            });
            setShowVideoRatingDialog(true);

            // Mark as checked to avoid showing again in this session
            setCheckedAppointments((prev) => new Set([...prev, appointmentId]));
            break; // Only show one dialog at a time
          } else {
            // Mark as checked since it's already rated
            setCheckedAppointments((prev) => new Set([...prev, appointmentId]));
          }
        }
      } catch (error) {
        console.error(
          "Error checking for completed video appointments:",
          error
        );
      }
    };

    // Check every 30 seconds for newly completed appointments
    const interval = setInterval(checkForCompletedVideoAppointments, 30000);

    // Also check immediately
    checkForCompletedVideoAppointments();

    return () => clearInterval(interval);
  }, [checkedAppointments]);

  // Add useEffect to check for call ended dialog
  useEffect(() => {
    // Check if user was redirected due to psychiatrist ending the call
    if (searchParams.get("callEnded") === "psychiatrist") {
      setShowCallEndedDialog(true);
      // Remove the query parameter from URL
      searchParams.delete("callEnded");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Add useEffect to listen for calls with matching appointmentId
  useEffect(() => {
    const documentId = localStorage.getItem("documentId");
    if (!documentId) return;

    let unsubscribe: (() => void) | undefined;

    const setupCallListener = () => {
      try {
        // Listen for calls collection changes
        const callsQuery = query(collection(db, "calls"));

        unsubscribe = onSnapshot(callsQuery, async (callSnapshot) => {
          callSnapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
              const callDoc = change.doc;
              const callData = callDoc.data();
              const callId = callDoc.id;

              // Skip if we've already navigated to this call
              if (navigatedCalls.current.has(callId)) {
                return;
              }

              // Skip if this call was recently ended by the user
              if (recentlyEndedCalls.current.has(callId)) {
                return;
              }

              // Check if this call's appointmentId matches any of user's active video sessions
              const matchingSession = activeSessions.find(
                (session) => session.id === callData.appointmentId
              );

              // Only navigate if:
              // 1. There's a matching session
              // 2. The call status is "waiting" or "connected" (not ended)
              // 3. User is not already in a video call page
              // 4. Call was created more than 2 seconds ago (to avoid immediate re-navigation)
              // 5. User explicitly clicked to join (removed automatic navigation)
              const callAge = Date.now() - (callData.createdAt || 0);

              if (
                matchingSession &&
                (callData.status === "waiting" ||
                  callData.status === "connected") &&
                !window.location.pathname.includes("/video-call/") &&
                callAge > 2000 // 2 second cooldown
              ) {
                console.log(
                  `Found matching active call for appointmentId: ${callData.appointmentId}, but not auto-navigating`
                );

                // Mark this call as seen but don't navigate automatically
                navigatedCalls.current.add(callId);
              }
            } else if (change.type === "removed") {
              // Remove from navigated calls when call is deleted
              const callId = change.doc.id;
              navigatedCalls.current.delete(callId);

              // Add to recently ended calls to prevent immediate re-navigation
              recentlyEndedCalls.current.add(callId);

              // Remove from recently ended after 10 seconds
              setTimeout(() => {
                recentlyEndedCalls.current.delete(callId);
              }, 10000);
            }
          });
        });
      } catch (error) {
        console.error("Error setting up call listener:", error);
      }
    };

    // Only setup listener if there are active sessions
    if (activeSessions.length > 0) {
      setupCallListener();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [navigate, activeSessions]);

  const handleCloseVideoRatingDialog = () => {
    setShowVideoRatingDialog(false);
    setPendingVideoRating(null);
  };

  const handleCloseCallEndedDialog = () => {
    setShowCallEndedDialog(false);
  };

  AppointmentStatusUpdater();

  // Show loading screen while any data is still loading
  if (isLoading) {
    return <Loading isDarkMode={isDarkMode} />;
  }

  return (
    <div
      className="min-h-screen w-full bg-cover flex flex-col overflow-x-hidden
                   bg-[#F2EDE2] dark:bg-[#161F36] transition-colors duration-300"
    >
      <AppointmentStatusUpdater />{" "}
      {/* Pastikan ini adalah komponen React.FC yang di-render */}
      <div className="p-4 sm:p-8 md:p-10 lg:p-15 text-center pt-10 sm:pt-16 md:pt-20">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 sm:mb-4 drop-shadow-md
                           text-[#161F36] dark:text-white"
        >
          Selamat datang,{" "}
          <span className="text-[#ce9d85] dark:text-blue-300">
            {firstName}!
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl font-medium text-[#161F36] dark:text-gray-300 px-4">
          Kami siap membantu perjalanan kesehatan mental Anda.
        </p>
      </div>
      {/* Sesi yang sedang Aktif (for user, only Video method) */}
      <div className="flex justify-center p-4 my-4 sm:my-8 flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-[#161F36] dark:text-[#E6E6E6] w-full max-w-sm sm:max-w-xl md:max-w-4xl xl:max-w-6xl text-center sm:text-left">
          Sesi yang sedang Aktif
        </h2>
        <div className="bg-[#E4DCCC] rounded-lg shadow-md p-4 sm:p-6 md:p-10 w-full max-w-sm sm:max-w-xl md:max-w-4xl xl:max-w-6xl mt-4 dark:bg-[#1A2947]">
          {loadingSessions ? (
            <div className="text-center text-gray-500 text-base sm:text-lg">
              Memuat sesi aktif...
            </div>
          ) : activeSessions.length === 0 ? (
            <div className="text-center text-gray-500 text-base sm:text-lg mt-4 sm:mt-8">
              Tidak ada sesi video yang sedang aktif.
            </div>
          ) : (
            activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col sm:flex-row items-center pb-4 sm:pb-6 mb-4 sm:mb-6 border-b last:border-b-0 last:mb-0 last:pb-0 cursor-pointer hover:bg-[#e9e3d6] transition dark:hover:bg-[#161F36]"
                onClick={() => {
                  // Store the appointmentId before navigating
                  localStorage.setItem("currentAppointmentId", session.id);
                  navigate(`/video-call`);
                }}
                tabIndex={0}
                role="button"
              >
                <img
                  src={session.psychiatristImage}
                  alt={session.psychiatristName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4 sm:mb-0 sm:mr-6 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ProfilePic;
                  }}
                />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start">
                    <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-[#E6E6E6]">
                      {session.psychiatristName}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-4 mt-1">
                    <span className="text-sm sm:text-base text-[#161F36] dark:text-[#E6E6E6]">
                      Video Call
                    </span>
                    <span className="text-sm sm:text-base text-[#161F36] dark:text-[#E6E6E6]">
                      {session.time}
                    </span>
                    <span className="text-sm sm:text-base text-[#161F36] dark:text-[#E6E6E6]">
                      {session.date
                        ? new Date(session.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                  </div>
                  <p className="text-sm sm:text-lg text-[#161F36] dark:text-[#E6E6E6] mt-2 sm:mt-0">
                    {session.symptoms ? `Gejala: ${session.symptoms}` : ""}
                  </p>
                </div>
                <button
                  className="flex items-center text-[#161F36] dark:text-white font-bold text-lg sm:text-2xl mt-4 sm:mt-0 sm:ml-6"
                  tabIndex={-1}
                  type="button"
                  style={{ pointerEvents: "none", opacity: 0.7 }}
                  aria-hidden="true"
                >
                  Gabung Sesi
                  <img
                    src={send}
                    alt="Send icon"
                    className="h-6 w-6 sm:h-8 sm:w-8 ml-1 sm:ml-2 object-contain dark:invert"
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex justify-center p-4 my-4 sm:my-8 flex-col items-center ">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-[#161F36] dark:text-[#E6E6E6] w-full max-w-sm sm:max-w-xl md:max-w-4xl xl:max-w-6xl text-center sm:text-left">
          Sesi chat yang sedang aktif
        </h2>
        <div className="bg-[#E4DCCC] rounded-lg shadow-md p-4 sm:p-6 md:p-10 w-full max-w-sm sm:max-w-xl md:max-w-4xl xl:max-w-6xl mt-4 dark:bg-[#1A2947]">
          {loadingChats ? (
            <div className="text-center text-gray-500 text-base sm:text-lg">
              Memuat sesi chat...
            </div>
          ) : activeChats.length === 0 ? (
            <div className="text-center text-gray-500 text-base sm:text-lg mt-4 sm:mt-8">
              Tidak ada sesi chat yang sedang aktif.
            </div>
          ) : (
            activeChats.map((chat) => (
              <div
                key={chat.id}
                className="flex flex-col sm:flex-row items-center pb-4 sm:pb-6 mb-4 sm:mb-6 border-b last:border-b-0 last:mb-0 last:pb-0 cursor-pointer hover:bg-[#e9e3d6] transition dark:hover:bg-[#161F36]"
                onClick={() => navigate(`/chat?chatId=${chat.id}`)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/chat?chatId=${chat.id}`);
                  }
                }}
              >
                <img
                  src={chat.psychiatristImage}
                  alt={chat.psychiatristName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4 sm:mb-0 sm:mr-6 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ProfilePic;
                  }}
                />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start">
                    <p className="text-lg sm:text-xl font-semibold text-[#161F36] dark:text-[#E6E6E6]">
                      {chat.psychiatristName}
                    </p>
                    {!chat.latestReceiverRead && (
                      <span
                        className="ml-2 inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-600"
                        title="Pesan belum dibaca"
                      ></span>
                    )}
                  </div>
                  <p className="text-sm sm:text-lg text-[#161F36] dark:text-[#E6E6E6] mt-2 sm:mt-0">
                    {chat.latestMessage}
                  </p>
                </div>
                <button
                  className="flex items-center text-[#161F36] dark:text-white font-bold text-lg sm:text-2xl mt-4 sm:mt-0 sm:ml-6"
                  tabIndex={-1}
                  type="button"
                  style={{ pointerEvents: "none", opacity: 0.7 }}
                  aria-hidden="true"
                >
                  Pergi
                  <img
                    src={send}
                    alt="Send icon"
                    className="h-6 w-6 sm:h-8 sm:w-8 ml-1 sm:ml-2 object-contain dark:invert"
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Pertemuan Mendatang Section */}
      <div className="flex justify-center p-4 my-4 sm:my-8 flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-[#161F36] dark:text-[#E6E6E6] w-full max-w-sm sm:max-w-xl md:max-w-4xl xl:max-w-6xl text-center sm:text-left">
          Sesi pertemuan mendatang
        </h2>
        <div className="bg-[#E4DCCC] rounded-lg shadow-md p-4 sm:p-6 md:p-10 w-full max-w-sm sm:max-w-xl md:max-w-4xl xl:max-w-6xl mt-4 dark:bg-[#1A2947]">
          {loadingUpcoming ? (
            <div className="text-center text-gray-500 text-base sm:text-lg">
              Memuat sesi pertemuan...
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center text-gray-500 text-base sm:text-lg mt-4 sm:mt-8">
              Tidak ada sesi pertemuan mendatang.
            </div>
          ) : (
            upcomingAppointments.map((apt) => (
              <div
                className="flex flex-col sm:flex-row items-center mb-4 last:mb-0"
                key={apt.id}
              >
                <div className="flex flex-col items-center justify-center rounded-lg p-2 sm:p-4 w-16 h-16 sm:w-21 sm:h-21 mb-4 sm:mb-0 sm:mr-4 shadow-sm bg-[#F9F1E0] dark:bg-[#293c63]">
                  <p className="text-xs sm:text-sm font-semibold text-[#161F36] dark:text-[#E6E6E6]">
                    {apt.day}
                  </p>
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-[#E6E6E6]">
                    {apt.date}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row flex-1 bg-[#F9F1E0] dark:bg-[#293c63] rounded-lg p-4 shadow-sm items-center w-full">
                  <div className="flex flex-col flex-1 text-center sm:text-left mb-2 sm:mb-0">
                    <p className="text-base sm:text-xl font-semibold text-gray-900 dark:text-[#E6E6E6]">
                      {apt.psychiatristName}
                    </p>
                    <p className="text-sm sm:text-base text-[#161F36] dark:text-[#E6E6E6]">
                      {apt.appointmentDate}
                    </p>
                  </div>
                  <div className="flex justify-end items-center text-right">
                    <div className="text-right">
                      {apt.method === "Video" && (
                        <p className="text-base sm:text-lg font-semibold text-[#161F36] dark:text-[#E6E6E6]">
                          {apt.time} WIB
                        </p>
                      )}
                      <p className="text-sm sm:text-base text-[#161F36] dark:text-[#E6E6E6]">
                        {apt.method}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Recommended Psychiatrist Section */}
      <div className="mt-10 sm:mt-20 ml-0 sm:ml-6 lg:ml-15 text-center sm:text-left">
        <div className="flex justify-center p-4 mt-4 sm:mt-8">
          <p className="text-xl sm:text-2xl font-semibold text-[#161F36] text-center dark:text-[#E6E6E6] max-w-sm sm:max-w-none">
            Berikut kami pilihkan psikolog pilihan kami
          </p>
        </div>
        <div className="flex justify-center items-center mb-10 px-4 sm:px-0">
          <div className="w-full" style={{ maxWidth: "1200px" }}>
            <CarouselDemo isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>
      <Footer isDarkMode={isDarkMode} />
      {/* Video Rating Dialog */}
      {showVideoRatingDialog && pendingVideoRating && (
        <VideoRatingDialog
          isOpen={showVideoRatingDialog}
          onClose={handleCloseVideoRatingDialog}
          appointment={pendingVideoRating}
          userId={localStorage.getItem("documentId") || ""}
          isDarkMode={false} // You can pass the actual dark mode state here
        />
      )}
      {/* Call Ended Dialog */}
      {showCallEndedDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold text-black dark:text-white mb-3 sm:mb-4">
              Video Call Berakhir
            </h2>
            <p className="text-sm sm:text-base text-black dark:text-gray-300 mb-4 sm:mb-6">
              Psikolog telah mengakhiri sesi video call. Jika ini adalah
              kesalahan, Anda dapat bergabung kembali atau menghubungi customer
              support.
            </p>
            <div className="flex justify-center">
              <button
                className="px-4 py-2 sm:px-6 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm sm:text-base"
                onClick={handleCloseCallEndedDialog}
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
