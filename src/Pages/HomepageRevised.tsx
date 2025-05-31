import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HomeController } from "../controllers/HomeController";
import { CarouselDemo } from "../components/RecommendedPsychiatrist";
import AppointmentStatusUpdater from "../components/AppointmentStatusUpdater"; // Ini asumsi sebagai komponen React.FC
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
} from "firebase/firestore";
import ProfilePic from "../assets/default_profile_image.svg";
import { notificationScheduler } from "../utils/notificationScheduler";

const Homepage: React.FC<HomepageProps> = ({ isDarkMode }) => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const controller = new HomeController();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      setUserName(name);
      setIsLoading(false);

      // Initialize notification scheduler
      await notificationScheduler.restoreScheduledNotifications();
    };

    checkAuthAndLoadData();
  }, [navigate]);

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

  AppointmentStatusUpdater();

  return (
    <div
      className="min-h-screen w-full bg-cover flex flex-col overflow-x-hidden
                 bg-[#F2EDE2] dark:bg-[#161F36] transition-colors duration-300"
    >
      <AppointmentStatusUpdater />{" "}
      {/* Pastikan ini adalah komponen React.FC yang di-render */}
      <div className="p-15 text-center pt-20">
        <h1
          className="text-6xl font-extrabold mb-4 drop-shadow-md
                       text-[#161F36] dark:text-white"
        >
          Selamat datang,{" "}
          <span className="text-[#ce9d85] dark:text-blue-300">{userName}!</span>
        </h1>
        <p className="text-xl font-medium text-[#161F36] dark:text-gray-300">
          Kami siap membantu perjalanan kesehatan mental Anda.
        </p>
      </div>
      {/* Sesi yang sedang Aktif (for user, only Video method) */}
      <div className="flex justify-center p-4 my-8 flex-col items-center">
        <h2 className="text-3xl font-semibold mb-4 text-[#161F36] dark:text-[#E6E6E6] w-full max-w-4xl xl:max-w-6xl">
          Sesi yang sedang Aktif
        </h2>
        <div className="bg-[#E4DCCC] rounded-lg shadow-md p-10 w-full max-w-4xl xl:max-w-6xl mt-4 dark:bg-[#1A2947]">
          {loadingSessions ? (
            <div className="text-center text-gray-500 text-lg">
              Memuat sesi aktif...
            </div>
          ) : activeSessions.length === 0 ? (
            <div className="text-center text-gray-500 text-lg mt-8">
              Tidak ada sesi video yang sedang aktif.
            </div>
          ) : (
            activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center pb-6 mb-6 border-b last:border-b-0 last:mb-0 last:pb-0 cursor-pointer hover:bg-[#e9e3d6] transition dark:hover:bg-[#161F36]"
                onClick={() => navigate(`/video-call/${session.id}`)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/video-call/${session.id}`);
                  }
                }}
              >
                <img
                  src={session.psychiatristImage}
                  alt={session.psychiatristName}
                  className="w-20 h-20 rounded-full mr-6 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ProfilePic;
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-gray-900 dark:text-[#E6E6E6]">
                      {session.psychiatristName}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-base text-[#161F36] dark:text-[#E6E6E6]">
                      Video Call
                    </span>
                    <span className="text-base text-[#161F36] dark:text-[#E6E6E6]">
                      {session.time}
                    </span>
                    <span className="text-base text-[#161F36] dark:text-[#E6E6E6]">
                      {session.date
                        ? new Date(session.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                  </div>
                  <p className="text-lg text-[#161F36] dark:text-[#E6E6E6]">
                    {session.symptoms ? `Gejala: ${session.symptoms}` : ""}
                  </p>
                </div>
                <button
                  className="flex items-center text-[#161F36] dark:text-white font-bold text-2xl ml-6"
                  tabIndex={-1}
                  type="button"
                  style={{ pointerEvents: "none", opacity: 0.7 }}
                  aria-hidden="true"
                >
                  Gabung Sesi
                  <img
                    src={send}
                    alt="Send icon"
                    className="h-8 w-8 ml-2 object-contain dark:invert"
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex justify-center p-4 my-8 flex-col items-center ">
        <h2 className="text-3xl font-semibold mb-4 text-[#161F36] dark:text-[#E6E6E6] w-full max-w-4xl xl:max-w-6xl">
          Sesi chat yang sedang aktif
        </h2>
        <div className="bg-[#E4DCCC] rounded-lg shadow-md p-10 w-full max-w-4xl xl:max-w-6xl mt-4 dark:bg-[#1A2947]">
          {loadingChats ? (
            <div className="text-center text-gray-500 text-lg">
              Memuat sesi chat...
            </div>
          ) : activeChats.length === 0 ? (
            <div className="text-center text-gray-500 text-lg mt-8">
              Tidak ada sesi chat yang sedang aktif.
            </div>
          ) : (
            activeChats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center pb-6 mb-6 border-b last:border-b-0 last:mb-0 last:pb-0 cursor-pointer hover:bg-[#e9e3d6] transition dark:hover:bg-[#161F36]"
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
                  className="w-20 h-20 rounded-full mr-6 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ProfilePic;
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-[#161F36] dark:text-[#E6E6E6]">
                      {chat.psychiatristName}
                    </p>
                    {!chat.latestReceiverRead && (
                      <span
                        className="ml-2 inline-block w-3 h-3 rounded-full bg-red-600"
                        title="Pesan belum dibaca"
                      ></span>
                    )}
                  </div>
                  <p className="text-lg text-[#161F36] dark:text-[#E6E6E6]">
                    {chat.latestMessage}
                  </p>
                </div>
                <button
                  className="flex items-center text-[#161F36] dark:text-white font-bold text-2xl ml-6"
                  tabIndex={-1}
                  type="button"
                  style={{ pointerEvents: "none", opacity: 0.7 }}
                  aria-hidden="true"
                >
                  Pergi
                  <img
                    src={send}
                    alt="Send icon"
                    className="h-8 w-8 ml-2 object-contain dark:invert"
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Pertemuan Mendatang Section */}
      <div className="flex justify-center p-4 my-8 flex-col items-center">
        <h2 className="text-3xl font-semibold mb-4 text-[#161F36] dark:text-[#E6E6E6] w-full max-w-4xl xl:max-w-6xl">
          Sesi pertemuan mendatang
        </h2>
        <div className="bg-[#E4DCCC] rounded-lg shadow-md p-10 w-full max-w-4xl xl:max-w-6xl mt-4 dark:bg-[#1A2947]">
          {loadingUpcoming ? (
            <div className="text-center text-gray-500 text-lg">
              Memuat sesi pertemuan...
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center text-gray-500 text-lg mt-8">
              Tidak ada sesi pertemuan mendatang.
            </div>
          ) : (
            upcomingAppointments.map((apt) => (
              <div className="flex items-center mb-4" key={apt.id}>
                <div className="flex flex-col items-center justify-center bg-[#F9F1E0] rounded-lg p-2 w-20 h-20 mr-6 shadow-sm">
                  <p className="text-sm font-semibold text-[#161F36] dark:text-[#E6E6E6]">
                    {apt.day}
                  </p>
                  <p className="text-4xl font-bold text-gray-900">{apt.date}</p>
                </div>
                <div className="flex flex-row flex-1 bg-[#F9F1E0] rounded-lg p-4 shadow-sm items-center">
                  <div className="flex flex-col flex-1">
                    <p className="text-xl font-semibold text-gray-900">
                      {apt.psychiatristName}
                    </p>
                    <p className="text-base text-[#161F36] dark:text-[#E6E6E6]">
                      {apt.appointmentDate}
                    </p>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <p className="text-lg font-semibold text-[#161F36] dark:text-[#E6E6E6]">
                      {apt.method === "Video" ? apt.time : ""}
                    </p>
                    {apt.method === "Video" ? (
                      <p className="text-base text-[#161F36] dark:text-[#E6E6E6]">
                        Video Call
                      </p>
                    ) : (
                      <p className="text-base text-[#161F36] dark:text-[#E6E6E6] text-center w-full">
                        Obrolan Chat
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end items-center flex-1">
                    <button
                      className="text-[#161F36] dark:text-[#E6E6E6] font-semibold py-3 px-4 text-xl"
                      onClick={() => {
                        if (apt.method === "Video") {
                          // Implement join video call logic here if needed
                        } else {
                          navigate(`/chat?chatId=${apt.id}`);
                        }
                      }}
                    >
                      {apt.action}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Recommended Psychiatrist Section */}
      <div className="mt-20 ml-6 sm:ml-15">
        <div className="flex justify-center p-4 mt-8">
          <p className="text-2xl font-semibold text-[#161F36] text-center dark:text-[#E6E6E6]">
            Berikut kami pilihkan psikiater pilihan kami
          </p>
        </div>
        <div className="flex justify-center items-center mb-10">
          <div className="w-full" style={{ maxWidth: "1200px" }}>
            <CarouselDemo isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
};

export default Homepage;
