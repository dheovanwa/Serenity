import React, { useState, useEffect, useRef } from "react";
import { Video, Search, Phone, Send, Menu, X } from "lucide-react";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  limit,
} from "firebase/firestore";
import axios from "axios";
import { useSearchParams } from "react-router-dom";


interface Message {
  id: string;
  text: string;
  time: string;
  sender: "me" | "them";
  senderId: string;
  senderName: string;
}

interface Appointment {
  id: string;
  psychiatristId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  method: string;
  status: string;
  doctorPhoto?: string; // add photo fields
  patientPhoto?: string;
}

const ChatPage: React.FC = () => {
  const [activeAppointment, setActiveAppointment] =
    useState<Appointment | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<"user" | "psychiatrist" | null>(
    null
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [appointments, setAppointments] = useState<Appointment[]>([]); // All chat appointments
  const [sidebarWidth, setSidebarWidth] = useState(288); // 72 * 4 = 288px (default w-72)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resizing = useRef(false);
  const [latestMessages, setLatestMessages] = useState<
    Record<string, { text: string; sender: "me" | "them" }>
  >({});
  const [isEnding, setIsEnding] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConfirmingEnd, setIsConfirmingEnd] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
 const [lastSeenMessageIds, setLastSeenMessageIds] = useState<Record<string, string>>({});
 const [latestTime, setLatestTime] = useState<Record<string, string>>({}); 
 const [searchQuery, setSearchQuery] = useState("");


  const handleEndConversationClick = () => {
    setIsConfirmingEnd(true); // Tampilkan pop-up konfirmasi
  };

  const confirmEndConversation = async () => {
    if (!activeAppointment) return;
    setIsEnding(true);
    try {
      await updateDoc(doc(db, "appointments", activeAppointment.id), {
        status: "Selesai",
      });
      const chatDocRef = doc(db, "chats", activeAppointment.id);
      await setDoc(chatDocRef, { hasEnded: true }, { merge: true });
      setActiveAppointment({ ...activeAppointment, status: "Selesai" });
      setHasEnded(true);
    } catch (e) {
      alert("Gagal menyelesaikan percakapan.");
    }
    setIsEnding(false);
    setIsConfirmingEnd(false); // Menutup pop-up konfirmasi setelah selesai
  };
  const cancelEndConversation = () => {
    setIsConfirmingEnd(false); // Menutup pop-up tanpa melakukan apapun
  };
  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Determine user type and id
  useEffect(() => {
    const type = localStorage.getItem("userType") as "user" | "psychiatrist";
    const id = localStorage.getItem("documentId");
    setUserType(type);
    setUserId(id);

    // Fetch user name
    if (id && type) {
      const col = type === "user" ? "users" : "psychiatrists";
      getDoc(doc(db, col, id)).then((snap) => {
        if (snap.exists()) {
          setUserName(snap.data().firstName || snap.data().name || "");
        }
      });
    }
  }, []);

  // Find active appointment (status "Sedang berlangsung", method "Chat")
  useEffect(() => {
    console.log("Fetching active appointment for userId:", userType);
    if (!userId || !userType) return;
    setLoading(true);

    const fetchActiveAppointment = async () => {
      let q;
      if (userType === "user") {
        q = query(
          collection(db, "appointments"),
          where("patientId", "==", userId),
          where("status", "==", "Sedang berlangsung"),
          where("method", "==", "Chat")
        );
      } else {
        q = query(
          collection(db, "appointments"),
          where("psychiatristId", "==", userId),
          where("status", "==", "Sedang berlangsung"),
          where("method", "==", "Chat")
        );
      }
      //   console.log("Active appointment query result:", q);
      const snap = await getDocs(q);
      if (!snap.empty) {
        const apt = snap.docs[0].data() as Appointment;
        setActiveAppointment({ ...apt, id: snap.docs[0].id });
        console.log("Active appointment found:", apt);
      } else {
        setActiveAppointment(null);
      }
      setLoading(false);
    };

    fetchActiveAppointment();
  }, [userId, userType]);

  // Fetch all chat appointments for sidebar
  useEffect(() => {
    if (!userId || !userType) return;

    const fetchAppointments = async () => {
      let q;
      if (userType === "user") {
        q = query(
          collection(db, "appointments"),
          where("patientId", "==", userId),
          where("method", "==", "Chat"),
          where("status", "in", ["Sedang berlangsung", "Selesai"])
        );
      } else {
        q = query(
          collection(db, "appointments"),
          where("psychiatristId", "==", userId),
          where("method", "==", "Chat"),
          where("status", "in", ["Sedang berlangsung", "Selesai"])
        );
      }
      const snap = await getDocs(q);
      const apts: Appointment[] = [];
      for (const docSnap of snap.docs) {
        const apt = docSnap.data() as Appointment;
        let doctorPhoto = "";
        let patientPhoto = "";
        // Fetch profile photos
        if (apt.psychiatristId) {
          const docRef = doc(db, "psychiatrists", apt.psychiatristId);
          const docData = await getDoc(docRef);
          const firestorePhoto = docData.exists()
            ? docData.data().photoURL
            : "";
          doctorPhoto =
            firestorePhoto && firestorePhoto.trim() !== ""
              ? firestorePhoto
              : "";
        }
        if (apt.patientId) {
          const docRef = doc(db, "users", apt.patientId);
          const docData = await getDoc(docRef);
          // Fetch from 'profilePicture' field instead of 'photoURL'
          const firestorePhoto = docData.exists()
            ? docData.data().profilePicture
            : "";
          patientPhoto =
            firestorePhoto && firestorePhoto.trim() !== ""
              ? firestorePhoto
              : "";
        }
        apts.push({ ...apt, id: docSnap.id, doctorPhoto, patientPhoto });
      }
      setAppointments(apts);

      // If no active selected, pick the first "Sedang berlangsung" or first available
      if (!activeAppointment && apts.length > 0) {
        const active =
          apts.find((a) => a.status === "Sedang berlangsung") || apts[0];
        setActiveAppointment(active);
      }
    };

    fetchAppointments();
    // eslint-disable-next-line
  }, [userId, userType]);

  // Fetch latest message for each "Sedang berlangsung" appointment
  useEffect(() => {
    // Only fetch for "Sedang berlangsung" appointments
    const runningApts = appointments.filter(
      (apt) => apt.status === "Sedang berlangsung"
    );
    if (runningApts.length === 0) {
      setLatestMessages({});
      return;
    }
    let unsubscribes: (() => void)[] = [];
    runningApts.forEach((apt) => {
      const chatRef = collection(db, "chats", apt.id, "messages");
      const qMsg = query(
        chatRef,
        orderBy("timestamp", "desc") /* only get the latest */
      );
      const unsub = onSnapshot(qMsg, (snap) => {
        if (!snap.empty) {
          const docMsg = snap.docs[0];
          const d = docMsg.data();
          setLatestMessages((prev) => ({
            ...prev,
            [apt.id]: {
              text: d.text,
              sender: d.senderId === userId ? "me" : "them",
            },
          }));
        }
      });
      unsubscribes.push(unsub);
    });
    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
    // eslint-disable-next-line
  }, [appointments, userId]);

  // Listen to chat messages for the active appointment and check hasEnded
  useEffect(() => {
    if (!activeAppointment) {
      setMessages([]);
      setHasEnded(false);
      return;
    }
    // Check hasEnded field in chat document
    const chatDocRef = doc(db, "chats", activeAppointment.id);
    getDoc(chatDocRef).then((snap) => {
      if (snap.exists() && snap.data().hasEnded) {
        setHasEnded(true);
      } else {
        setHasEnded(false);
      }
    });

    console.log("Listening to messages for appointment:", activeAppointment.id);
    const chatId = activeAppointment.id;
    const chatRef = collection(db, "chats", chatId, "messages");
    const q = query(chatRef, orderBy("timeCreated", "asc"));

    const unsub = onSnapshot(q, async (snap) => {
      const msgs: Message[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        msgs.push({
          id: doc.id,
          text: d.text,
          time: d.time || "",
          sender: d.senderId === userId ? "me" : "them",
          senderId: d.senderId,
          senderName: d.senderName,
        });
      });
      setMessages(msgs);

      if (msgs.length > 0) {
        const lastMsgId = msgs[msgs.length - 1].id;
        setLastSeenMessageIds(prev => ({
          ...prev,
          [activeAppointment.id]: lastMsgId,
        }));
      }
    });

    return () => unsub();
  }, [activeAppointment, userId, userType, userName]);

  // Summarize psychiatrist advice for the user (only when requested)
  const handleSummarize = async () => {
    if (userType === "user" && activeAppointment && messages.length > 0) {
      const adviceMessages = messages
        .filter(
          (msg) =>
            msg.sender === "them" &&
            msg.senderId !== userId &&
            msg.text &&
            msg.text.trim() !== ""
        )
        .map((msg) => msg.text);

      if (adviceMessages.length > 0) {
        try {
          // Use google/gemini-2.0-flash-exp:free from OpenRouter AI
          const openRouterApiKey =
            "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";
          const inputText = adviceMessages.join("\n\n");
          const prompt = `Berikut adalah pesan-pesan dari psikiater kepada pasien:\n\n${inputText}\n\nBuatlah ringkasan singkat dan jelas dari saran-saran tersebut untuk pasien.`;
          console.log(prompt);

          let summaryText = "";
          let errorMsg = "";

          try {
            const response = await axios.post(
              "https://openrouter.ai/api/v1/chat/completions",
              {
                model: "google/gemini-2.0-flash-exp:free",
                messages: [
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
                max_tokens: 512,
              },
              {
                headers: {
                  Authorization: `Bearer ${openRouterApiKey}`,
                  "Content-Type": "application/json",
                },
              }
            );
            summaryText =
              response.data?.choices?.[0]?.message?.content ||
              "Tidak ada ringkasan.";
          } catch (err: any) {
            if (err.response && err.response.status === 429) {
              errorMsg =
                "Layanan sedang sibuk atau batas penggunaan telah tercapai. Silakan coba beberapa saat lagi.";
            } else {
              errorMsg = "Gagal melakukan ringkasan.";
            }
          }

          setSummary(errorMsg ? errorMsg : summaryText);
        } catch (e) {
          setSummary("Gagal melakukan ringkasan.");
        }
      } else {
        setSummary("Tidak ada saran dari psikiater.");
      }
      setShowSummary(true);
    }
  };

  // Handler to end the conversation
  const handleEndConversation = async () => {
    if (!activeAppointment) return;
    setIsEnding(true);
    try {
      // Update appointment status to "Selesai"
      await updateDoc(doc(db, "appointments", activeAppointment.id), {
        status: "Selesai",
      });
      // Update or add hasEnded field in chat document
      const chatDocRef = doc(db, "chats", activeAppointment.id);
      // Use setDoc with merge to avoid errors if doc doesn't exist
      await setDoc(chatDocRef, { hasEnded: true }, { merge: true });
      setActiveAppointment({ ...activeAppointment, status: "Selesai" });
      setHasEnded(true);
    } catch (e) {
      alert("Gagal menyelesaikan percakapan.");
    }
    setIsEnding(false);
  };

  // Send message to Firestore
  const handleSendMessage = async () => {
    if (
      !newMessage.trim() ||
      !activeAppointment ||
      !userId ||
      !userType ||
      activeAppointment.status === "Selesai" ||
      hasEnded
    )
      return;
    const chatId = activeAppointment.id;
    const chatRef = collection(db, "chats", chatId, "messages");
    await addDoc(chatRef, {
      text: newMessage,
      senderId: userId,
      senderName: userName,
      timeCreated: serverTimestamp(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    setNewMessage("");
  };

  // Determine chat partner info
  const partnerName =
    userType === "user"
      ? activeAppointment?.doctorName
      : activeAppointment?.patientName;

  const partnerPhoto =
    userType === "user"
      ? activeAppointment?.doctorPhoto
      : activeAppointment?.patientPhoto;

  // Sidebar resize handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    resizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none"; // Prevent text selection
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      // Minimum 200px, maximum 500px
      setSidebarWidth(Math.max(200, Math.min(500, e.clientX)));
    };
    const handleMouseUp = () => {
      resizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = ""; // Restore text selection
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Set activeAppointment based on chatId param
   useEffect(() => {
    if (!appointments.length) return;
    const chatId = searchParams.get("chatId");
    if (chatId) {
      const found = appointments.find((apt) => apt.id === chatId);
      if (found) setActiveAppointment(found);
    } else if (!activeAppointment && appointments.length > 0) {
      // fallback to first available
      const active =
        appointments.find((a) => a.status === "Sedang berlangsung") ||
        appointments[0];
      setActiveAppointment(active);
       if (active) {
        setSearchParams({ chatId: active.id });
      }
    }
    // eslint-disable-next-line
  }, [appointments, searchParams, activeAppointment, setSearchParams]);


  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Jika beralih ke desktop, pastikan sidebar tidak tersembunyi
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); 

    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // Ganti useEffect notifikasi Anda dengan yang ini
  useEffect(() => {
  if (!userId || appointments.length === 0) return;

  const unsubscribes = appointments
    .filter(apt => apt.status === 'Sedang berlangsung')
    .map(apt => {
      const messagesRef = collection(db, "chats", apt.id, "messages");
      const q = query(
        messagesRef,
        where('senderId', '!=', userId),
        orderBy('timeCreated', 'desc')
      );

      const unsub = onSnapshot(q, (snapshot) => {
        if (activeAppointment?.id === apt.id) return;

        const lastSeenId = lastSeenMessageIds[apt.id];
        let newMessages = snapshot.docs;

        if (lastSeenId) {
          const index = newMessages.findIndex(doc => doc.id === lastSeenId);
          if (index !== -1) {
            newMessages = newMessages.slice(0, index);
          }
        }

        const newCount = newMessages.length;
        if (newCount > 0) {
          setUnreadCounts(prev => ({
            ...prev,
            [apt.id]: newCount,
          }));
        }
      });

      return unsub;
    });

      return () => unsubscribes.forEach(unsub => unsub());
    }, [appointments, userId, activeAppointment, lastSeenMessageIds]);



    
return (
  <div className="flex h-screen font-sans bg-[#FDFBF6] relative overflow-hidden"
    style={{ fontFamily: '"Josefin Sans", sans-serif' }}>
    {isMobile && isSidebarOpen && (
      <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-20"></div>
    )}

    {/* SIDEBAR */}
    <aside
      className={`bg-[#E0E7EF] border-r border-gray-200 flex flex-col transition-transform transform ${
        isMobile
          ? `fixed top-0 left-0 h-full z-30 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`
          : "relative"
      }`}
      style={{ width: isMobile ? '80vw' : sidebarWidth, maxWidth: isMobile ? '320px' : '500px' }}
    >
      <div className=" p-4 font-bold text-lg text-gray-700 border-b border-gray-300 flex justify-between items-center">
        <span>Chat Sessions</span>
        {isMobile && (
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-600 hover:text-gray-900">
            <X size={24} />
          </button>
        )}
      </div>
      <div className="p-3">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau sesi..."
              className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm "
            />
          </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {appointments.length === 0 && (
          <div className="p-4 text-gray-500">No chat sessions found.</div>
        )}

        {appointments.map((apt) => {
          const name = userType === "user" ? apt.doctorName : apt.patientName;
          const photo = userType === "user" ? apt.doctorPhoto : apt.patientPhoto;
          const showLatest = apt.status === "Sedang berlangsung" && latestMessages[apt.id];
          const unreadCount = unreadCounts[apt.id] || 0;

          return (
            <button
              key={apt.id}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-blue-100 transition ${
                activeAppointment?.id === apt.id ? "bg-blue-200 font-semibold" : ""
              }`}
              onClick={() => {
                setActiveAppointment(apt);
                setSearchParams({ chatId: apt.id });

                
                setUnreadCounts((prev) => ({ ...prev, [apt.id]: 0 }));

                
                const chatRef = collection(db, "chats", apt.id, "messages");
                const q = query(chatRef, orderBy("timeCreated", "desc"), limit(1));
                getDocs(q).then((snap) => {
                  if (!snap.empty) {
                    const lastId = snap.docs[0].id;
                    setLastSeenMessageIds((prev) => ({ ...prev, [apt.id]: lastId }));
                  }
                });

                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <div className="flex flex-row items-center space-x-3 w-full">
                {photo ? (
                  <img
                    src={photo}
                    alt={name}
                    className="w-9 h-9 rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-lg font-bold">
                    {name?.[0] || "?"}
                  </div>
                )}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate">{name}</span>
                  <span className="text-xs text-gray-500">{apt.status}</span>
                  {showLatest && (
                    <span
                      className={`text-xs truncate ${
                        unreadCount > 0 ? "text-black font-bold" : "text-gray-700"
                      }`}
                    >
                      {latestMessages[apt.id].sender === "me"
                        ? `Saya: ${latestMessages[apt.id].text}`
                        : latestMessages[apt.id].text}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <div className="flex flex-col items-center ml-2 mt-1 space-y-1">
                    <span className="text-[11px] text-gray-500 font-medium">
                      {latestTime[apt.id] || "19:45"}
                    </span>

                    {/* Badge notif */}
                    <div className="ml-2 bg-blue-500 text-white text-[11px] font-semibold rounded-full h-5 w-5 flex justify-center items-center">
                      {unreadCount}
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {!isMobile && (
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 8,
            height: "100%",
            cursor: "col-resize",
            zIndex: 10,
            background: "transparent",
          }}
          className="hover:bg-blue-200 transition"
        />
      )}
    </aside>

    
    <div className="flex flex-col flex-1 h-full">
      <header className="flex items-center justify-between p-4 bg-[#E0E7EF] border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(true)} className="mr-2 text-gray-700">
              <Menu size={24} />
            </button>
          )}
          {partnerPhoto ? (
            <img
              src={partnerPhoto}
              alt={partnerName || ""}
              className="w-10 h-10 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xl font-bold">
              {partnerName?.[0] || "?"}
            </div>
          )}
          <span className="font-semibold text-lg text-gray-800">{partnerName || ""}</span>
        </div>
        <div className="flex items-center space-x-2">
          {activeAppointment &&
            userType === "psychiatrist" &&
            activeAppointment.status !== "Selesai" &&
            !hasEnded && (
              <button
                onClick={handleEndConversationClick}
                disabled={isEnding}
                className="ml-4 px-3 py-2 text-sm md:px-4 md:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-60"
              >
                {isEnding ? "..." : "Selesaikan"}
              </button>
            )}
        </div>
      </header>

      {isConfirmingEnd && (
        <div className="fixed inset-0 bg-opacity-10 backdrop-brightness-10 backdrop-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80">
            <h3 className="text-xl font-semibold mb-4">Konfirmasi</h3>
            <p className="mb-6">Apakah Anda yakin ingin menyelesaikan percakapan?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelEndConversation}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 flex-1"
              >
                Batal
              </button>
              <button
                onClick={confirmEndConversation}
                className="px-4 py-2 bg-blue-200 text-black rounded-md hover:bg-blue-300"
              >
                Ya, Selesaikan
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <span>Loading chat...</span>
        </div>
      ) : !activeAppointment ? (
        <div className="flex items-center justify-center flex-1 text-center p-4">
          <span>
            Tidak ada sesi chat yang sedang berlangsung. <br /> Pilih sesi chat dari menu.
          </span>
        </div>
      ) : (
        <>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#FDFBF6]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-end max-w-[85%] md:max-w-md lg:max-w-lg ${
                    msg.sender === "me" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`py-2 px-4 rounded-2xl ${
                      msg.sender === "me"
                        ? "bg-[#D1DCEB] text-gray-800 rounded-br-none"
                        : "bg-[#E4DCCC] text-gray-800 rounded-tl-none"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 mx-2 self-end mb-1">{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </main>
          {userType === "user" && showSummary && summary && (
            <div className="p-4 bg-yellow-50 border-t border-b border-yellow-200 text-yellow-900">
              <div className="font-semibold mb-2">Ringkasan Saran Psikiater:</div>
              <div style={{ whiteSpace: "pre-line" }}>{summary}</div>
            </div>
          )}
          <div className="p-4 bg-[#F0EBE3] border-t border-gray-200 flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={
                activeAppointment.status === "Selesai" || hasEnded
                  ? "Percakapan telah selesai."
                  : "Ketik pesan Anda di sini..."
              }
              className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              disabled={activeAppointment.status === "Selesai" || hasEnded}
            />
            {activeAppointment.status !== "Selesai" && !hasEnded && (
              <button
                onClick={handleSendMessage}
                className="p-3 rounded-lg text-white bg-[#BACBD8] hover:bg-[#93A3AF] transition-colors"
              >
                <Send size={22} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  </div>
);
};

export default ChatPage;