import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Instagram from "../assets/instagram.png";
import Whatsapp from "../assets/whatsapp.png";
import email from "../assets/email.png";
import CancelAppointmentModal from "../components/Cancel";
import foto1 from "../assets/p1.png";
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
  setDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase"; // Adjust the import based on your project structure
import { HomeController } from "../controllers/HomeController";
import AppointmentStatusUpdater from "../components/AppointmentStatusUpdater";
import { notificationScheduler } from "../utils/notificationScheduler";
import Footer from "../components/Footer";

const DashboardPsychiatrist: React.FC = () => {
  // Add new state for dialog
  const [showEndedDialog, setShowEndedDialog] = useState(false);
  const [showPatientEndedDialog, setShowPatientEndedDialog] = useState(false);
  const [userName, setUserName] = useState<string>("Loading...");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<any>(null);
  const [psychiatristName, setPsychiatristName] =
    useState<string>("Loading...");
  const [psychiatristSpecialty, setPsychiatristSpecialty] =
    useState<string>("");
  const [upcomingSchedule, setUpcomingSchedule] = useState<any[]>([]);
  const [activeAppointments, setActiveAppointments] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const controller = new HomeController();

  useEffect(() => {
    const checkAuth = async () => {
      const documentId = localStorage.getItem("documentId");
      const isAuthenticated = await controller.checkAuthentication(documentId);

      if (!isAuthenticated) {
        navigate("/signin");
        return;
      }

      const name = await controller.fetchUserName(documentId);
      setUserName(name);

      const schedule = await controller.fetchTodaySchedule(documentId);
      const appointments = await controller.fetchUpcomingAppointments(
        documentId
      );
      const userMessages = await controller.fetchMessages(documentId);

      setTodaySchedule(schedule || []);
      setUpcomingAppointments(appointments || []);
      setMessages(userMessages || []);
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchPsychiatristData = async () => {
      try {
        const documentId = localStorage.getItem("documentId");
        if (!documentId) return;

        // Get psychiatrist data
        const psychiatristRef = doc(db, "psychiatrists", documentId);
        const psychiatristSnap = await getDoc(psychiatristRef);

        if (psychiatristSnap.exists()) {
          const data = psychiatristSnap.data();
          setPsychiatristName(data.name);
          setPsychiatristSpecialty(data.specialty);

          // Get appointments for this psychiatrist
          const appointmentsRef = collection(db, "appointments");
          const q = query(
            appointmentsRef,
            where("psychiatristId", "==", documentId)
          );
          const appointmentSnap = await getDocs(q);

          const appointments = appointmentSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Transform appointments data to match your state structure
          const formattedAppointments = appointments.map((apt) => {
            const date = new Date(apt.date);
            return {
              date: date.getDate().toString(),
              day: ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"][
                date.getDay()
              ],
              doctor: apt.patientName, // Show patient name instead of doctor
              appointmentDate: `${date.toLocaleDateString("id-ID", {
                weekday: "long",
              })}, ${date.getDate()} ${date.toLocaleDateString("id-ID", {
                month: "long",
              })} ${date.getFullYear()}`,
              service: apt.method,
              time: apt.time,
              action: "Kelola",
              status: apt.status,
            };
          });

          setTodaySchedule(formattedAppointments);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchPsychiatristData();
  }, []);

  // Replace this useEffect:
  /*
  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      // ...existing code...
    };
    fetchUpcomingAppointments();
  }, []);
  */
  // With this real-time listener:
  useEffect(() => {
    const documentId = localStorage.getItem("documentId");
    if (!documentId) return;

    // Get psychiatrist data (for name)
    let unsubscribe: (() => void) | undefined;
    let psychiatristName = "";

    const setupListener = async () => {
      const psychiatristRef = doc(db, "psychiatrists", documentId);
      const psychiatristSnap = await getDoc(psychiatristRef);
      if (psychiatristSnap.exists()) {
        const data = psychiatristSnap.data();
        psychiatristName = data.name;
      }

      const appointmentsRef = collection(db, "appointments");
      const q = query(
        appointmentsRef,
        where("psychiatristId", "==", documentId),
        where("status", "==", "Terjadwal"),
        orderBy("date", "asc")
      );

      unsubscribe = onSnapshot(q, (appointmentSnap) => {
        const appointments = appointmentSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Only include appointments where doctorName matches psychiatristName
        const filteredAppointments = appointments.filter(
          (apt) => apt.doctorName === psychiatristName
        );

        // Sort only by date ascending (nearest appointment first)
        const sortedAppointments = filteredAppointments.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });

        // Format for display and limit to 10
        const formattedAppointments = sortedAppointments
          .slice(0, 10)
          .map((apt) => {
            const date = new Date(apt.date);
            let time = apt.time;
            // Remove "today" for chat method
            if (apt.method === "Chat" && time === "today") {
              time = "";
            }
            return {
              date: date.getDate().toString(),
              day: ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"][
                date.getDay()
              ],
              patient: apt.patientName,
              appointmentDate: `${date.toLocaleDateString("id-ID", {
                weekday: "long",
              })}, ${date.getDate()} ${date.toLocaleDateString("id-ID", {
                month: "long",
              })} ${date.getFullYear()}`,
              service: apt.method,
              time,
              status: apt.status,
            };
          });

        setUpcomingSchedule(formattedAppointments);
      });
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchActiveAppointmentsAndChats = async () => {
      try {
        const documentId = localStorage.getItem("documentId");
        if (!documentId) return;

        // Get psychiatrist data (for name)
        const psychiatristRef = doc(db, "psychiatrists", documentId);
        const psychiatristSnap = await getDoc(psychiatristRef);
        let psychiatristName = "";
        if (psychiatristSnap.exists()) {
          const data = psychiatristSnap.data();
          psychiatristName = data.name;
        }

        // Query appointments for this psychiatrist with status "Sedang berlangsung"
        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          where("psychiatristId", "==", documentId),
          where("status", "==", "Sedang berlangsung"),
          orderBy("date", "asc")
        );
        const appointmentSnap = await getDocs(q);

        const appointments = appointmentSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Only include appointments where doctorName matches psychiatristName
        const filteredAppointments = appointments.filter(
          (apt) => apt.doctorName === psychiatristName
        );

        // Create chat rooms for Chat appointments that are "Sedang berlangsung"
        for (const apt of filteredAppointments) {
          if (apt.method === "Chat") {
            await createChatRoomForAppointment(apt.id);
          }
        }

        // For video appointments, check if they're currently active based on time
        const videoAppointments = filteredAppointments.filter((apt) => {
          if (apt.method !== "Video") return false;

          // Check if the video session is currently active
          return isVideoSessionActive(apt.date, apt.time);
        });

        // Format for display (Video only)
        const formattedAppointments = videoAppointments.map((apt) => {
          const date = new Date(apt.date);
          let time = apt.time;
          return {
            id: apt.id,
            patientName: apt.patientName,
            symptoms: apt.gejala,
            service: apt.method,
            date: date.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            time,
            patientProfileImage: apt.patientProfileImage || foto1, // fallback to foto1
          };
        });

        setActiveAppointments(formattedAppointments);

        // Set up real-time listener for chat messages
        const chatAppointments = filteredAppointments.filter(
          (apt) => apt.method === "Chat"
        );

        if (chatAppointments.length > 0) {
          const unsubscribeFunctions: (() => void)[] = [];

          chatAppointments.forEach((apt) => {
            const messagesColRef = collection(db, "chats", apt.id, "messages");
            const qMsg = query(
              messagesColRef,
              orderBy("timeCreated", "desc"),
              limit(1)
            );

            const unsubscribe = onSnapshot(qMsg, async (snapshot) => {
              // Fetch user profile picture
              let userProfilePicture = foto1; // default fallback
              try {
                if (apt.patientId) {
                  const userRef = doc(db, "users", apt.patientId);
                  const userSnap = await getDoc(userRef);
                  if (userSnap.exists()) {
                    const userData = userSnap.data();
                    userProfilePicture = userData.profilePicture || foto1;
                  }
                }
              } catch (error) {
                console.error("Error fetching user profile picture:", error);
              }

              if (!snapshot.empty) {
                const lastMsgDoc = snapshot.docs[0];
                const lastMsg = lastMsgDoc.data();
                let senderDisplayName = lastMsg.senderName;
                if (
                  lastMsg.senderRole === "doctor" ||
                  (lastMsg.senderName &&
                    lastMsg.senderName === psychiatristName)
                ) {
                  senderDisplayName = "Saya";
                }

                const newMessage = {
                  id: apt.id,
                  from: apt.patientName,
                  date: lastMsg.time || apt.date,
                  content: `${lastMsg.text}`,
                  profileImage: userProfilePicture,
                  isRead: lastMsg.receiverRead || false,
                };

                // Update messages state
                setMessages((prevMessages) => {
                  const existingIndex = prevMessages.findIndex(
                    (msg) => msg.id === apt.id
                  );
                  if (existingIndex >= 0) {
                    // Update existing message
                    const updatedMessages = [...prevMessages];
                    updatedMessages[existingIndex] = newMessage;
                    return updatedMessages;
                  } else {
                    // Add new message
                    return [...prevMessages, newMessage];
                  }
                });
              } else {
                // If no messages yet, still show the chat session
                const defaultMessage = {
                  id: apt.id,
                  from: apt.patientName,
                  date: new Date().toLocaleDateString(),
                  content: "Sesi chat dimulai",
                  profileImage: userProfilePicture,
                  isRead: true,
                };

                setMessages((prevMessages) => {
                  const existingIndex = prevMessages.findIndex(
                    (msg) => msg.id === apt.id
                  );
                  if (existingIndex < 0) {
                    return [...prevMessages, defaultMessage];
                  }
                  return prevMessages;
                });
              }
            });

            unsubscribeFunctions.push(unsubscribe);
          });

          // Return cleanup function for message listeners
          return () => {
            unsubscribeFunctions.forEach((unsub) => unsub());
          };
        }

        // Initialize notification scheduler
        await notificationScheduler.restoreScheduledNotifications();
      } catch (error) {
        console.error("Error fetching active appointments or chats:", error);
      }
    };

    const cleanup = fetchActiveAppointmentsAndChats();

    // Set up real-time listener for appointment status changes
    const documentId = localStorage.getItem("documentId");
    if (documentId) {
      const appointmentsRef = collection(db, "appointments");
      const statusQuery = query(
        appointmentsRef,
        where("psychiatristId", "==", documentId),
        where("method", "==", "Chat")
      );

      const unsubscribe = onSnapshot(statusQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "modified") {
            const appointmentData = change.doc.data();
            // Check if status changed to "Sedang berlangsung"
            if (appointmentData.status === "Sedang berlangsung") {
              createChatRoomForAppointment(change.doc.id);
            }
          }
        });
      });

      return () => {
        unsubscribe();
        if (cleanup && typeof cleanup.then === "function") {
          cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
        }
      };
    }
  }, []);

  // Add helper function to check if a video session is currently active
  const isVideoSessionActive = (appointmentDate: string, timeRange: string) => {
    if (!timeRange || timeRange === "today") return false;

    const now = new Date();
    const appointmentDateObj = new Date(appointmentDate);

    // Check if it's the same date
    const isSameDate =
      now.getDate() === appointmentDateObj.getDate() &&
      now.getMonth() === appointmentDateObj.getMonth() &&
      now.getFullYear() === appointmentDateObj.getFullYear();

    if (!isSameDate) return false;

    // Parse time range (e.g., "18.00 - 19.30")
    const [startTime, endTime] = timeRange.split(" - ");
    if (!startTime || !endTime) return false;

    const [startHour, startMinute] = startTime.split(".").map(Number);
    const [endHour, endMinute] = endTime.split(".").map(Number);

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Convert to minutes for easier comparison
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const startTotalMinutes = startHour * 60 + (startMinute || 0);
    const endTotalMinutes = endHour * 60 + (endMinute || 0);

    // Check if current time is within the appointment range
    return (
      currentTotalMinutes >= startTotalMinutes &&
      currentTotalMinutes <= endTotalMinutes
    );
  };

  const handleLogout = () => {
    controller.handleLogout();
    navigate("/signin");
  };
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const handleCancelAppointment = (appointment: any) => {
    setAppointmentToCancel(appointment);
    setIsModalOpen(true);
  };
  const handleConfirmCancel = () => {
    if (appointmentToCancel) {
      console.log("Appointment canceled:", appointmentToCancel);

      setUpcomingAppointments((prev) =>
        prev.filter((apt) => apt !== appointmentToCancel)
      );
    }
    setIsModalOpen(false);
    setAppointmentToCancel(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAppointmentToCancel(null);
  };

  // Handler for navigating to chat session
  const handleOpenChat = (chatId: string) => {
    console.log("Opening chat for appointment ID:", chatId);
    navigate(`/chat?chatId=${chatId}`);
  };

  // Update the hasSessionEnded function to be more precise
  const hasSessionEnded = (time: string) => {
    if (!time || time === "today") return false;

    const [, endTime] = time.split(" - ");
    if (!endTime) return false;

    const [endHour, endMinute] = endTime.split(".").map(Number);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return (
      currentHour > endHour ||
      (currentHour === endHour && currentMinute > (endMinute || 0))
    );
  };

  // Modify handleJoinVideoCall to check session time
  const handleJoinVideoCall = async (
    appointmentId: string,
    sessionTime: string
  ) => {
    if (hasSessionEnded(sessionTime)) {
      setShowEndedDialog(true);
      return;
    }

    try {
      const documentId = localStorage.getItem("documentId"); // Get psychiatrist ID
      if (!documentId) {
        throw new Error("No psychiatrist ID found");
      }

      // Check if there's already a call for this appointment
      const callsRef = collection(db, "calls");
      const q = query(callsRef, where("appointmentId", "==", appointmentId));
      const querySnapshot = await getDocs(q);

      let callId;
      if (querySnapshot.empty) {
        // Create new call document with psychiatrist ID as callerId
        const newCall = await addDoc(callsRef, {
          appointmentId: appointmentId,
          createdAt: Date.now(),
          status: "waiting",
          callerId: documentId, // Using psychiatrist's documentId
        });
        callId = newCall.id;
      } else {
        // Use existing call
        callId = querySnapshot.docs[0].id;
      }

      // Navigate to video call with the call ID
      navigate(`/video-call/${callId}`);
    } catch (error) {
      console.error("Error setting up video call:", error);
      alert("Failed to set up video call. Please try again.");
    }
  };

  // Add useEffect to check and update appointment statuses
  useEffect(() => {
    const checkAndUpdateAppointmentStatuses = async () => {
      try {
        const now = new Date();
        // Use local timezone date instead of UTC
        const today =
          now.getFullYear() +
          "-" +
          String(now.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(now.getDate()).padStart(2, "0");

        // Query all "Terjadwal" appointments
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, where("status", "==", "Terjadwal"));

        const querySnapshot = await getDocs(q);

        for (const docSnap of querySnapshot.docs) {
          const appointment = docSnap.data();
          const appointmentDate = new Date(appointment.date);

          // Check if appointment is today - use local timezone
          const appointmentDateStr =
            appointmentDate.getFullYear() +
            "-" +
            String(appointmentDate.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(appointmentDate.getDate()).padStart(2, "0");

          console.log(
            "Checking appointment:",
            docSnap.id,
            "Today:",
            today,
            "Appointment date:",
            appointmentDateStr
          );

          if (appointmentDateStr === today && appointment.time !== "today") {
            // Parse time range for video appointments
            const timeRange = appointment.time;
            const [startTime, endTime] = timeRange.split(" - ");

            if (startTime && endTime) {
              const [startHour, startMinute] = startTime.split(".").map(Number);
              const [endHour, endMinute] = endTime.split(".").map(Number);

              const currentHour = now.getHours();
              const currentMinute = now.getMinutes();

              // Convert to minutes for easier comparison
              const currentTotalMinutes = currentHour * 60 + currentMinute;
              const startTotalMinutes = startHour * 60 + (startMinute || 0);
              const endTotalMinutes = endHour * 60 + (endMinute || 0);

              // Check if current time is within appointment range
              if (
                currentTotalMinutes >= startTotalMinutes &&
                currentTotalMinutes <= endTotalMinutes
              ) {
                // Update appointment status to "Sedang berlangsung"
                await updateDoc(doc(db, "appointments", docSnap.id), {
                  status: "Sedang berlangsung",
                });
                console.log(
                  `Updated appointment ${docSnap.id} to "Sedang berlangsung"`
                );
              }
            }
          } else if (
            appointment.method === "Chat" &&
            appointmentDateStr === today &&
            appointment.time === "today"
          ) {
            // For chat appointments scheduled for today, immediately set to "Sedang berlangsung"
            await updateDoc(doc(db, "appointments", docSnap.id), {
              status: "Sedang berlangsung",
            });
            console.log(
              `Updated chat appointment ${docSnap.id} to "Sedang berlangsung"`
            );
          }
        }
      } catch (error) {
        console.error(
          "Error checking and updating appointment statuses:",
          error
        );
      }
    };

    // Run the check immediately
    checkAndUpdateAppointmentStatuses();

    // Set up interval to check every minute
    const statusCheckInterval = setInterval(
      checkAndUpdateAppointmentStatuses,
      60000
    );

    return () => {
      clearInterval(statusCheckInterval);
    };
  }, []);

  // Function to create chat room when appointment becomes active
  const createChatRoomForAppointment = async (appointmentId: string) => {
    try {
      const chatDocRef = doc(db, "chats", appointmentId);
      const chatDocSnapshot = await getDoc(chatDocRef);

      if (!chatDocSnapshot.exists()) {
        // Create chat document with appointmentId reference
        await setDoc(chatDocRef, {
          appointmentId: appointmentId,
          createdAt: serverTimestamp(),
          hasEnded: false,
        });
        console.log(`Chat room created for appointment: ${appointmentId}`);
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
  };

  // Add useEffect to check for call ended dialog
  useEffect(() => {
    // Check if psychiatrist was redirected due to patient ending the call
    if (searchParams.get("callEnded") === "patient") {
      setShowPatientEndedDialog(true);
      // Remove the query parameter from URL
      searchParams.delete("callEnded");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleClosePatientEndedDialog = () => {
    setShowPatientEndedDialog(false);
  };

  return (
    <>
      <div className="min-h-screen bg-[#F2EDE2] dark:bg-[#161F36] w-full bg-cover flex flex-col overflow-x-hidden">
        <AppointmentStatusUpdater />
        <div className="p-15 text-center pt-20">
          <h1
            className="text-6xl font-extrabold mb-4 drop-shadow-md
                       text-[#161F36] dark:text-white"
          >
            Selamat datang, <br />
            <span className="text-[#ce9d85] dark:text-blue-300">
              {psychiatristName}!
            </span>
          </h1>
          <p className="text-xl font-medium text-[#161F36] dark:text-gray-300">
            Siap mendampingi Anda dalam setiap langkah perjalanan kesehatan
            mental pasien.
          </p>
        </div>

        {/* Konsultasi Mendatang */}
        <section className="w-full mt-30 mb-40">
          <h1 className="text-6xl text-[#161F36] dark:text-[#E2E2E2] font-bold mb-8 text-center">
            Konsultasi Mendatang
          </h1>
          {!isMobile && (
            <div className="bg-[#E4DCCC] dark:bg-[#1A2947] bg-opacity-90 p-5 rounded-lg shadow-lg w-[80%] max-w-7xl mx-auto">
              <div className="grid grid-cols-1 gap-4">
                {upcomingSchedule.length === 0 ? (
                  <div className="text-center text-gray-600 dark:text[#E2E2E2] py-10">
                    Tidak ada konsultasi mendatang.
                  </div>
                ) : (
                  upcomingSchedule.map((appointment, index) => (
                    <div key={index} className="flex flex-row">
                      <div className="flex flex-col items-center justify-center rounded-lg p-4 w-21 h-21 mr-4 shadow-sm bg-[#F9F1E0] dark:bg-[#293c63]">
                        <span className="text-sm font-semibold text-[#161F36] dark:text-[#E6E6E6]">
                          {appointment.day}
                        </span>
                        <span className="text-4xl font-bold text-gray-900 dark:text-[#E6E6E6]">
                          {appointment.date}
                        </span>
                      </div>
                      <div className="ml-3 w-full bg-[#F9F1E0] dark:bg-[#293c63] rounded-lg grid grid-cols-3">
                        <div className="text-2xl grid grid-row ml-3 mt-4">
                          <span className="text-xl font-semibold text-gray-900 dark:text-[#E6E6E6]">
                            {appointment.patient}
                          </span>
                          <span className="text-base text-[#161F36] dark:text-[#E6E6E6]">
                            {appointment.appointmentDate}
                          </span>
                        </div>
                        {/* Empty column for spacing */}
                        <div />
                        {/* Move time and method to rightmost column */}
                        <div className="flex flex-col justify-center items-end mr-20">
                          <span className="text-lg font-semibold">
                            {appointment.time}
                          </span>
                          <span className="text-lg font-semibold">
                            {appointment.service}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Mobile Layout */}
          {isMobile && (
            <div className="bg-[#E4DCCC] dark:bg-[#1A2947] bg-opacity-90 p-5 rounded-md shadow-lg w-[90%] max-w-md mx-auto">
              {upcomingSchedule.length === 0 ? (
                <div className="text-center text-gray-600 py-10">
                  Tidak ada konsultasi mendatang.
                </div>
              ) : (
                upcomingSchedule.map((appointment, index) => (
                  <div
                    key={index}
                    className="bg-[#F9F1E0] dark:bg-[#293c63] rounded-md p-4 mb-4 shadow-lg"
                  >
                    <div className="text-left flex flex-col">
                      <span className="text-xl font-semibold text-gray-900 dark:text-[#E6E6E6]">
                        {appointment.patient}
                      </span>
                      <div className="flex flex-row justify-between items-center mt-1 mb-1">
                        <span className="text-base text-[#161F36] dark:text-[#E6E6E6]">
                          {appointment.appointmentDate}
                        </span>
                      </div>
                      {/* Move time and method to the right, no Kelola */}
                      <div className="flex flex-row justify-end items-center gap-2">
                        <span className="text-md">{appointment.time}</span>
                        <span className="text-md">{appointment.service}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Upcoming Appointments */}
        <section className=" ml-4 mr-4 mb-30">
          <h1 className="text-6xl text-[#161F36] dark:text-[#E2E2E2] font-bold mb-8 text-center ">
            Sesi yang sedang Aktif
          </h1>
          <div className="bg-[#E4DCCC] dark:bg-[#1A2947] bg-opacity-90 p-8 rounded-xl shadow-lg max-w-7xl mx-auto">
            {activeAppointments.length > 0 ? (
              isMobile ? (
                activeAppointments.map((apt, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F9F1E0] dark:bg-[#293c63] p-6 rounded-lg mb-6 shadow-lg transition-shadow duration-300"
                  >
                    <h2 className="text-2xl font-semibold text-[#161F36] dark:text-[#E6E6E6]">
                      {apt.patientName}
                    </h2>
                    <p className="text-gray-800 dark:text-[#E6E6E6] text-sm">
                      Gejala: {apt.symptoms}
                    </p>
                    <p className="text-gray-800 dark:text-[#E6E6E6] text-sm">
                      Metode: {apt.service}
                    </p>
                    <p className="text-gray-800 dark:text-[#E6E6E6] text-sm">
                      {apt.date} {apt.time && `| ${apt.time}`}
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <button
                        className="px-6 py-2 bg-[#187DA8] dark:bg-[#006894] text-white rounded-lg font-semibold hover:bg-[#186ca8] dark:hover:bg-[#2c5a96] transition-colors duration-300 w-full sm:w-auto"
                        onClick={() => handleJoinVideoCall(apt.id, apt.time)}
                      >
                        Gabung Sesi
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                activeAppointments.map((apt, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F9F1E0] dark:bg-[#293c63] p-6 rounded-lg mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex justify-between items-center"
                  >
                    <div className="flex flex-col text-left">
                      <h2 className="text-2xl font-semibold text-[#161F36] dark:text-[#E6E6E6]">
                        {apt.patientName}
                      </h2>
                      <p className="text-gray-800 dark:text-[#E6E6E6] text-sm">
                        Gejala: {apt.symptoms}
                      </p>
                      <p className="text-gray-800 dark:text-[#E6E6E6] text-sm">
                        Metode: {apt.service}
                      </p>
                      <p className="text-gray-800 dark:text-[#E6E6E6] text-sm">
                        {apt.date} {apt.time && `| ${apt.time}`}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        className="px-6 py-2 bg-[#187DA8] dark:bg-[#006894] text-white rounded-lg font-semibold hover:bg-[#186ca8] dark:hover:bg-[#2c5a96] transition-colors duration-300 w-auto"
                        onClick={() => handleJoinVideoCall(apt.id, apt.time)}
                      >
                        Gabung Sesi
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : (
              <p className="text-gray-700 dark:text-[#E6E6E6] text-lg">
                Belum ada janji temu yang sedang berlangsung
              </p>
            )}
          </div>
        </section>
        <CancelAppointmentModal
          isModalOpen={isModalOpen}
          appointmentToCancel={appointmentToCancel}
          handleConfirmCancel={handleConfirmCancel}
          handleCloseModal={handleCloseModal}
        />

        {/*Messages */}
        <section className="mt-10 ml-15 mr-15 mb-30 ">
          <h1 className="text-6xl text-[#161F36] dark:text-[#E6E6E6] font-semibold drop-shadow-md mb-8 text-center">
            Pesan
          </h1>
          <div className="bg-[#E4DCCC] dark:bg-[#1A2947] bg-opacity-90 p-8 rounded-xl shadow-lg max-w-5xl mx-auto">
            {messages.length > 0 ? (
              messages.map((msg, index) => {
                const chatId = msg.id;
                return (
                  <div
                    key={index}
                    className="border-b border-gray-600 py-3 last:border-none hover:bg-[#e9e2d1] dark:hover:bg-[#1e2e4e] cursor-pointer transition"
                    onClick={() => handleOpenChat(chatId)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                        <img
                          src={msg.profileImage}
                          alt={msg.from}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = foto1;
                          }}
                        />
                      </div>

                      <div className="flex flex-col w-full">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-bold">{msg.from}</h3>
                            {!msg.isRead && (
                              <span className="p-1 rounded-full bg-red-500   mr-2 mx-auto" />
                            )}
                          </div>
                          <p className="text-[#161F36] dark:text-[#E6E6E6] text-sm">
                            {msg.date} WIB
                          </p>
                        </div>

                        {/* Message Content */}
                        <p className="text-[#161F36] dark:text-[#E6E6E6] font-medium mt-1">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[#161F36] dark:text-[#E6E6E6] text-lg">
                Anda tidak memiliki pesan baru.
              </p>
            )}
          </div>
        </section>

        <Footer />

        {/* Add dialog for ended session */}
        {showEndedDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">
                Sesi Telah Berakhir
              </h3>
              <p className="mb-6">Waktu sesi konsultasi ini telah berakhir.</p>
              <button
                onClick={() => setShowEndedDialog(false)}
                className="w-full bg-[#187DA8] text-white py-2 px-4 rounded-lg hover:bg-[#1569a0] transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Patient Ended Call Dialog */}
        {showPatientEndedDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[300px] sm:w-[400px] max-w-md mx-4">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                Video Call Berakhir
              </h2>
              <p className="text-black dark:text-gray-300 mb-6">
                Pasien telah mengakhiri sesi video call. Sesi telah berakhir
                secara otomatis.
              </p>
              <div className="flex justify-center">
                <button
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  onClick={handleClosePatientEndedDialog}
                >
                  Saya Mengerti
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardPsychiatrist;
