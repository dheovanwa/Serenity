import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Instagram from "../assets/instagram.png";
import Whatsapp from "../assets/whatsapp.png";
import email from "../assets/email.png";
import CancelAppointmentModal from "../components/Cancel";
import foto1 from "../assets/p1.png";
import foto2 from "../assets/p2.png";
import foto3 from "../assets/p3.png";
import foto4 from "../assets/p4.png";
import foto5 from "../assets/p5.png";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../config/firebase"; // Adjust the import based on your project structure
import { HomeController } from "../controllers/HomeController";
import AppointmentStatusUpdater from "../components/AppointmentStatusUpdater";

const DashboardPsychiatrist: React.FC = () => {
  // Add new state for dialog
  const [showEndedDialog, setShowEndedDialog] = useState(false);
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

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
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

        // Query appointments for this psychiatrist with status "Terjadwal", ascending order
        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          where("psychiatristId", "==", documentId),
          where("status", "==", "Terjadwal"),
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

        // Sort: Chat first, then Video (by start time ascending)
        const sortedAppointments = filteredAppointments.sort((a, b) => {
          if (a.method === b.method) {
            if (a.method === "Video" && b.method === "Video") {
              // Sort by start time (e.g. "09.00 - 10.00")
              const getStartMinutes = (time: string) => {
                if (!time) return 0;
                const [start] = time.split(" - ");
                const [h, m] = start.split(".").map(Number);
                return h * 60 + (m || 0);
              };
              return getStartMinutes(a.time) - getStartMinutes(b.time);
            }
            // If both are Chat, keep original order (by date)
            return 0;
          }
          // Chat comes before Video
          return a.method === "Chat" ? -1 : 1;
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
              action: "Kelola",
              status: apt.status,
            };
          });

        setUpcomingSchedule(formattedAppointments);
      } catch (error) {
        console.error("Error fetching upcoming appointments:", error);
      }
    };

    fetchUpcomingAppointments();
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

        // Fetch latest chat message for each active chat appointment from messages subcollection
        const chatMessages: any[] = [];
        for (const apt of filteredAppointments) {
          if (apt.method === "Chat") {
            const messagesColRef = collection(db, "chats", apt.id, "messages");
            const qMsg = query(
              messagesColRef,
              orderBy("timestamp", "desc"),
              limit(1)
            );
            const msgSnap = await getDocs(qMsg);
            if (!msgSnap.empty) {
              const lastMsgDoc = msgSnap.docs[0];
              const lastMsg = lastMsgDoc.data();
              let senderDisplayName = lastMsg.senderName;
              if (
                lastMsg.senderRole === "doctor" ||
                (lastMsg.senderName && lastMsg.senderName === psychiatristName)
              ) {
                senderDisplayName = "Kamu";
              }
              chatMessages.push({
                id: apt.id,
                from: apt.patientName,
                date: lastMsg.time || apt.date,
                content: `${senderDisplayName}: ${lastMsg.text}`,
                profileImage: apt.patientProfileImage || foto1,
                isRead: lastMsg.isRead || false,
              });
            }
          }
        }
        setMessages(chatMessages);
      } catch (error) {
        console.error("Error fetching active appointments or chats:", error);
      }
    };

    fetchActiveAppointmentsAndChats();

    // Set up interval to refresh active appointments every minute
    const interval = setInterval(fetchActiveAppointmentsAndChats, 60000);

    return () => clearInterval(interval);
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

  return (
    <>
      <div className="min-h-screen bg-[#F2EDE2] w-full bg-cover flex flex-col overflow-x-hidden">
        <AppointmentStatusUpdater />
        <div className="h-[370px] bg-white w-full bg-cover flex flex-col overflow-x-hidden">
          <h1 className="text-[#161F36] text-4xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center leading-snug mt-40 sm:mt-20 md:mt-32 lg:mt-40">
            Selamat datang,
            <br /> <span>{psychiatristName}</span>
          </h1>
        </div>

        {/* Konsultasi Mendatang */}
        <section className="w-full mt-30 mb-40">
          <h1 className="text-6xl text-[#161F36] font-bold mb-8 text-center">
            Konsultasi Mendatang
          </h1>
          {!isMobile && (
            <div className="bg-[#E4DCCC] bg-opacity-90 p-5 rounded-md shadow-lg w-[80%] max-w-7xl mx-auto">
              <div className="grid grid-cols-1 gap-4">
                {upcomingSchedule.length === 0 ? (
                  <div className="text-center text-gray-600 py-10">
                    Tidak ada konsultasi mendatang.
                  </div>
                ) : (
                  upcomingSchedule.map((appointment, index) => (
                    <div key={index} className="flex flex-row">
                      <div className="text-center w-[8%] bg-[#F9F1E0] pt-4 rounded-xs pb-2 flex flex-col">
                        <span className="font-medium text-sm sm:text-base md:text-lg text-[#161F36]">
                          {appointment.day}
                        </span>
                        <span className="text-5xl sm:text-4xl md:text-6xl font-medium text-[#161F36]">
                          {appointment.date}
                        </span>
                      </div>
                      <div className="ml-3 w-full bg-[#F9F1E0] rounded-xs grid grid-cols-3">
                        <div className="text-2xl grid grid-row ml-3 mt-4">
                          <span className="font-medium text-[#161F36]">
                            {appointment.patient}
                          </span>
                          <span className="font-medium text-[#161F36]">
                            {appointment.appointmentDate}
                          </span>
                        </div>
                        <div className="ml-20 flex flex-col justify-center items-center">
                          <span className="text-2xl">{appointment.time}</span>
                          <span className="text-lg">{appointment.service}</span>
                        </div>
                        <button className="text-2xl justify-end items-end text-end mr-20 text-[#161F36] rounded-md">
                          <span className="hover:cursor-pointer hover:text-[#187DA8] p-2 rounded-md">
                            {appointment.action}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Mobile Layout */}
          {isMobile && (
            <div className="bg-[#E4DCCC] bg-opacity-90 p-5 rounded-md shadow-lg w-[90%] max-w-md mx-auto">
              {upcomingSchedule.length === 0 ? (
                <div className="text-center text-gray-600 py-10">
                  Tidak ada konsultasi mendatang.
                </div>
              ) : (
                upcomingSchedule.map((appointment, index) => (
                  <div
                    key={index}
                    className="bg-[#F9F1E0] rounded-md p-4 mb-4 shadow-lg"
                  >
                    <div className="text-left flex flex-col">
                      <span className="font-medium text-[#161F36] text-lg">
                        {appointment.patient}
                      </span>
                      <div className="grid grid-cols-3">
                        <span className="text-md mt-1 mr-6">
                          {appointment.service}
                        </span>
                        <span className="text-md">{appointment.time}</span>
                        <button className="text-xl justify-end items-end text-end mr-1 text-[#161F36] rounded-md">
                          <span className="hover:cursor-pointer hover:text-[#187DA8] p-2 rounded-md">
                            {appointment.action}
                          </span>
                        </button>
                      </div>
                      <span className="font-medium text-[#161F36]">
                        {appointment.appointmentDate}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Upcoming Appointments */}
        <section className=" ml-4 mr-4 mb-30">
          <h1 className="text-6xl text-[#161F36] font-bold mb-8 text-center ">
            Sesi yang sedang Aktif
          </h1>
          <div className="bg-[#E4DCCC] bg-opacity-90 p-8 rounded-xl shadow-lg max-w-7xl mx-auto">
            {activeAppointments.length > 0 ? (
              isMobile ? (
                activeAppointments.map((apt, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F9F1E0] p-6 rounded-lg mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <h2 className="text-2xl font-semibold text-[#161F36]">
                      {apt.patientName}
                    </h2>
                    <p className="text-gray-800 text-sm">
                      Gejala: {apt.symptoms}
                    </p>
                    <p className="text-gray-800 text-sm">
                      Metode: {apt.service}
                    </p>
                    <p className="text-gray-800 text-sm">
                      {apt.date} {apt.time && `| ${apt.time}`}
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <button
                        className="px-6 py-2 bg-[#187DA8] text-white rounded-lg font-semibold hover:bg-[#5a7da1] transition-colors duration-300 w-full sm:w-auto"
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
                    className="bg-[#F9F1E0] p-6 rounded-lg mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex justify-between items-center"
                  >
                    <div className="flex flex-col text-left">
                      <h2 className="text-2xl font-semibold text-[#161F36]">
                        {apt.patientName}
                      </h2>
                      <p className="text-gray-800 text-sm">
                        Gejala: {apt.symptoms}
                      </p>
                      <p className="text-gray-800 text-sm">
                        Metode: {apt.service}
                      </p>
                      <p className="text-gray-800 text-sm">
                        {apt.date} {apt.time && `| ${apt.time}`}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        className="px-6 py-2 bg-[#187DA8] text-white rounded-lg font-semibold hover:bg-[#186ca8] transition-colors duration-300 w-auto"
                        onClick={() => handleJoinVideoCall(apt.id, apt.time)}
                      >
                        Gabung Sesi
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : (
              <p className="text-gray-700 text-lg">
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
          <h1 className="text-6xl text-[#161F36] font-semibold drop-shadow-md mb-8 text-center">
            Pesan
          </h1>
          <div className="bg-[#E4DCCC] bg-opacity-90 p-8 rounded-xl shadow-lg max-w-5xl mx-auto">
            {messages.length > 0 ? (
              messages.map((msg, index) => {
                // Find the correct appointment for this message by matching patientName, service === "Chat", and appointment date
                const apt = activeAppointments.find(
                  (a) =>
                    a.patientName === msg.from &&
                    a.service === "Chat" &&
                    a.id === msg.id
                );
                const chatId = apt?.id || "";
                return (
                  <div
                    key={index}
                    className="border-b border-gray-600 py-3 last:border-none hover:bg-[#e9e2d1] cursor-pointer transition"
                    onClick={() => handleOpenChat(chatId)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                        <img
                          src={msg.profileImage}
                          alt={msg.from}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex flex-col w-full">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-bold">{msg.from}</h3>
                            {!msg.isRead && (
                              <span className="p-2 rounded-full bg-red-500   mr-2 mx-auto" />
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{msg.date}</p>
                        </div>

                        {/* Message Content */}
                        <p className="text-black font-medium mt-1">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-700 text-lg">
                Anda tidak memiliki pesan baru.
              </p>
            )}
          </div>
        </section>

        <footer className="bg-[#453A2F] text-white pt-5">
          <div className="mx-auto ml-20 mr-20 mt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Left Section*/}
              <div className="text-left">
                <h2 className="text-5xl font-bold mb-6">Serenity</h2>
                <ul className="flex flex-col space-y-6">
                  <li className="flex items-center space-x-4">
                    <img
                      src={Instagram}
                      alt="Instagram"
                      className="w-10 h-10"
                    />
                    <span>@mentalhealth.id</span>
                  </li>
                  <li className="flex items-center space-x-4">
                    <img src={Whatsapp} alt="Whatsapp" className="w-10 h-10" />
                    <span>+628529320581</span>
                  </li>
                  <li className="flex items-center space-x-4">
                    <img src={email} alt="email" className="w-10 h-10" />
                    <span>mentalhealth@serenity.co.id</span>
                  </li>
                </ul>
              </div>

              {/* Middle Section*/}
              <div className="">
                <h3 className="text-3xl font-semibold mb-4">
                  Consumer Complaints Service
                </h3>
                <p className="text-sm">
                  PT Mental Health Corp <br />
                  Jl. Raya Kb. Jeruk No.27, RT.1/RW.9, Kemanggisan, Kec.
                  Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta
                  11530
                </p>
              </div>

              {/* Right Section: Site Map */}
              <div className="text-right">
                <h3 className="text-3xl font-semibold mb-4">Site Map</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2">
                  <li>
                    <a href="#" className="hover:opacity-75">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:opacity-75">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:opacity-75">
                      Terms & Condition
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:opacity-75">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:opacity-75">
                      Security
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:opacity-75">
                      Media
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:opacity-75">
                      Partnership
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:opacity-75">
                      Promotions
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* Bottom Section: Copyright */}
          <div className="mt-16 text-center bg-[#525252] py-2">
            <p className="text-sm font-bold">
              © 2024 - 2025 Mental Health J&D Sp. co.
            </p>
          </div>
        </footer>

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
      </div>
    </>
  );
};

export default DashboardPsychiatrist;
