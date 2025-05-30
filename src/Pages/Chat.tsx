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
  writeBatch,
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
  senderRead?: boolean;
  receiverRead?: boolean;
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
  const [lastSeenMessageIds, setLastSeenMessageIds] = useState<
    Record<string, string>
  >({});
  const [latestTime, setLatestTime] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [existingRating, setExistingRating] = useState<number | null>(null);

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
      await setDoc(
        chatDocRef,
        {
          appointmentId: activeAppointment.id, // Correctly reference the appointment ID
          hasEnded: true,
        },
        { merge: true }
      );
      setActiveAppointment({ ...activeAppointment, status: "Selesai" });
      setHasEnded(true);
    } catch (e) {
      alert("Gagal menyelesaikan percakapan.");
    }
    setIsEnding(false);
    setIsConfirmingEnd(false);
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
    console.log(
      "Fetching latest messages for running appointments:",
      runningApts
    );
    if (runningApts.length === 0) {
      setLatestMessages({});
      setLatestTime({});
      console.log("No ongoing appointments found.");
      return;
    }
    let unsubscribes: (() => void)[] = [];
    runningApts.forEach((apt) => {
      const chatRef = collection(db, "chats", apt.id, "messages");
      const qMsg = query(
        chatRef,
        orderBy("timeCreated", "desc"), // Changed from "timestamp" to "timeCreated"
        limit(1) // Add limit to only get the latest message
      );
      const unsub = onSnapshot(qMsg, (snap) => {
        if (!snap.empty) {
          const docMsg = snap.docs[0];
          const d = docMsg.data();
          console.log("Latest message for appointment:", apt.id, d);
          setLatestMessages((prev) => ({
            ...prev,
            [apt.id]: {
              text: d.text,
              sender: d.senderId === userId ? "me" : "them",
            },
          }));

          // Set the time for the latest message, ensure it's in WIB format
          const messageTime = d.time || "00:00";
          // If the time is not in proper format, convert it
          const formattedTime = messageTime.includes(":")
            ? messageTime
            : new Date().toLocaleTimeString("id-ID", {
                timeZone: "Asia/Jakarta",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });

          setLatestTime((prev) => ({
            ...prev,
            [apt.id]: formattedTime,
          }));
        } else {
          console.log("No messages found for appointment:", apt.id);
          // Clear the latest message for this appointment if no messages exist
          setLatestMessages((prev) => {
            const updated = { ...prev };
            delete updated[apt.id];
            return updated;
          });

          // Clear the latest time as well
          setLatestTime((prev) => {
            const updated = { ...prev };
            delete updated[apt.id];
            return updated;
          });
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

    // Mark messages as read when opening this chat
    markMessagesAsRead(activeAppointment.id);

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
          senderRead: d.senderRead,
          receiverRead: d.receiverRead,
        });
      });
      setMessages(msgs);

      if (msgs.length > 0) {
        const lastMsgId = msgs[msgs.length - 1].id;
        setLastSeenMessageIds((prev) => ({
          ...prev,
          [activeAppointment.id]: lastMsgId,
        }));
      }

      // Auto-mark new messages as read if user is currently viewing this chat
      if (snap.docChanges().length > 0) {
        const batch = writeBatch(db);
        let hasUpdates = false;

        snap.docChanges().forEach((change) => {
          if (change.type === "added") {
            const messageData = change.doc.data();
            // Only mark as read if it's from someone else and not already read
            if (
              messageData.senderId !== userId &&
              messageData.receiverRead === false
            ) {
              batch.update(change.doc.ref, { receiverRead: true });
              hasUpdates = true;
              console.log(`Auto-marking new message ${change.doc.id} as read`);
            }
          }
        });

        if (hasUpdates) {
          batch.commit().catch((error) => {
            console.error("Error auto-marking messages as read:", error);
          });
        }
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
      await setDoc(
        chatDocRef,
        {
          appointmentId: activeAppointment.id, // Correctly reference the appointment ID
          hasEnded: true,
        },
        { merge: true }
      );
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
    const chatId = activeAppointment.id; // This is actually the appointment ID
    const chatRef = collection(db, "chats", chatId, "messages");

    // Chat room should already exist, but check just in case
    const chatDocRef = doc(db, "chats", chatId);
    const chatDocSnapshot = await getDoc(chatDocRef);

    if (!chatDocSnapshot.exists()) {
      console.warn("Chat room doesn't exist, creating it now");
      // Create chat document with appointmentId reference
      await setDoc(chatDocRef, {
        appointmentId: activeAppointment.id, // Use the actual appointment ID
        createdAt: serverTimestamp(),
        hasEnded: false,
      });
    }

    // Create WIB time
    const wibTime = new Date().toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format
    });

    await addDoc(chatRef, {
      text: newMessage,
      senderId: userId,
      senderName: userName,
      timeCreated: serverTimestamp(),
      time: wibTime, // Use WIB 24-hour format
      senderRead: true, // Sender has read their own message
      receiverRead: false, // Receiver hasn't read it yet
    });
    setNewMessage("");
  };

  // Function to mark all messages in a chat as read
  const markMessagesAsRead = async (chatId: string) => {
    if (!userId || !userType) return;

    try {
      // Chat room should already exist, but ensure it exists with appointment reference
      const chatDocRef = doc(db, "chats", chatId);
      const chatDocSnapshot = await getDoc(chatDocRef);

      if (!chatDocSnapshot.exists()) {
        console.warn(
          "Chat room doesn't exist during mark as read, creating it"
        );
        // Create chat document with appointmentId reference
        // chatId here is actually the appointment ID since we use appointment.id as the chat document ID
        await setDoc(chatDocRef, {
          appointmentId: chatId, // chatId is the appointment ID in our system
          createdAt: serverTimestamp(),
          hasEnded: false,
        });
      }

      const messagesRef = collection(db, "chats", chatId, "messages");
      // Get ALL messages in the chat session
      const q = query(messagesRef);

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach((docSnapshot) => {
          const messageData = docSnapshot.data();

          // Only update receiverRead for messages we didn't send
          if (
            messageData.senderId !== userId &&
            messageData.receiverRead === false
          ) {
            batch.update(docSnapshot.ref, { receiverRead: true });
            console.log(`Marking message ${docSnapshot.id} as read`);
          }
        });
        await batch.commit();
        console.log(`Processed all messages in chat ${chatId}`);
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
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
      .filter((apt) => apt.status === "Sedang berlangsung")
      .map((apt) => {
        const messagesRef = collection(db, "chats", apt.id, "messages");
        const q = query(
          messagesRef,
          where("senderId", "!=", userId),
          where("receiverRead", "==", false), // Check receiverRead instead of read
          orderBy("timeCreated", "desc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
          if (activeAppointment?.id === apt.id) return;

          const unreadCount = snapshot.docs.length;
          if (unreadCount > 0) {
            setUnreadCounts((prev) => ({
              ...prev,
              [apt.id]: unreadCount,
            }));
          } else {
            setUnreadCounts((prev) => ({
              ...prev,
              [apt.id]: 0,
            }));
          }
        });

        return unsub;
      });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [appointments, userId, activeAppointment]);

  // Check if user has already rated this appointment when chat ends
  useEffect(() => {
    const checkExistingRating = async () => {
      if (!activeAppointment || userType !== "user") return;
      if (activeAppointment.status !== "Selesai" && !hasEnded) return;

      try {
        const chatDocRef = doc(db, "chats", activeAppointment.id);
        const chatDoc = await getDoc(chatDocRef);

        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          // Check if rating field exists and is not null
          if (
            chatData.rating !== null &&
            chatData.rating !== undefined &&
            typeof chatData.rating === "number"
          ) {
            setExistingRating(chatData.rating);
            setRating(chatData.rating);
            setHasRated(true);
            console.log(
              `Found existing rating: ${chatData.rating} - rating disabled`
            );
          } else {
            // Rating field is null, undefined, or doesn't exist - allow rating
            setExistingRating(null);
            setRating(0);
            setHasRated(false);
            console.log("No existing rating found - rating enabled");
          }
        } else {
          // Chat document doesn't exist - allow rating
          setExistingRating(null);
          setRating(0);
          setHasRated(false);
          console.log("Chat document doesn't exist - rating enabled");
        }
      } catch (error) {
        console.error("Error checking existing rating:", error);
        // On error, disable rating to be safe
        setHasRated(true);
      }
    };

    checkExistingRating();
  }, [activeAppointment, userType, hasEnded]);

  // Enhanced rating component with backend integration
  const StarRating = () => {
    const handleStarClick = async (starValue: number) => {
      // Prevent rating if already rated (rating field exists and is not null)
      if (hasRated || existingRating !== null) {
        console.log("Rating already exists, cannot rate again");
        return;
      }

      setRating(starValue);
      setIsSubmittingRating(true);

      try {
        if (!activeAppointment || !userId) {
          throw new Error("Missing appointment or user information");
        }

        // Double-check that rating doesn't exist before saving
        const chatDocRef = doc(db, "chats", activeAppointment.id);
        const chatDoc = await getDoc(chatDocRef);

        if (chatDoc.exists()) {
          const chatData = chatDoc.data();
          if (chatData.rating !== null && chatData.rating !== undefined) {
            throw new Error("Rating already exists for this session");
          }
        }

        // Save rating to chat session
        await setDoc(
          chatDocRef,
          {
            appointmentId: activeAppointment.id,
            rating: starValue,
            ratedAt: serverTimestamp(),
            ratedBy: userId,
          },
          { merge: true }
        );

        // Update psychiatrist's ratings array and calculate new average
        const psychiatristRef = doc(
          db,
          "psychiatrists",
          activeAppointment.psychiatristId
        );
        const psychiatristDoc = await getDoc(psychiatristRef);

        if (psychiatristDoc.exists()) {
          const psychiatristData = psychiatristDoc.data();
          const currentRatings = psychiatristData.ratings || [];

          // Add new rating to array
          const updatedRatings = [...currentRatings, starValue];

          // Calculate new average rating
          const averageRating =
            updatedRatings.reduce((sum, rating) => sum + rating, 0) /
            updatedRatings.length;
          const roundedAverage = Math.round(averageRating * 10) / 10; // Round to 1 decimal place

          // Update psychiatrist document
          await updateDoc(psychiatristRef, {
            ratings: updatedRatings,
            rating: roundedAverage,
          });

          console.log(
            `Updated psychiatrist rating: ${roundedAverage} (from ${updatedRatings.length} ratings)`
          );
        }

        setHasRated(true);
        setExistingRating(starValue);
        console.log(`User rated ${starValue} stars - saved to database`);
      } catch (error) {
        console.error("Error saving rating:", error);
        if (error.message === "Rating already exists for this session") {
          alert("Rating sudah ada untuk sesi ini.");
          // Refresh the rating state
          setHasRated(true);
        } else {
          alert("Gagal menyimpan rating. Silakan coba lagi.");
          setRating(existingRating || 0); // Reset to previous rating on error
        }
      } finally {
        setIsSubmittingRating(false);
      }
    };

    const handleStarHover = (starValue: number) => {
      // Only allow hover effects if rating hasn't been given
      if (!hasRated && existingRating === null) {
        setHoveredRating(starValue);
      }
    };

    const handleStarLeave = () => {
      // Only clear hover effects if rating hasn't been given
      if (!hasRated && existingRating === null) {
        setHoveredRating(0);
      }
    };

    // Check if rating is disabled (rating field exists and is not null)
    const isRatingDisabled = hasRated || existingRating !== null;

    return (
      <div className="flex flex-col items-center py-4 bg-yellow-50 border-t border-b border-yellow-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {isRatingDisabled
            ? "Rating Anda untuk sesi konsultasi ini"
            : "Beri rating untuk sesi konsultasi ini"}
        </h3>
        <div className="flex items-center space-x-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
              onMouseLeave={handleStarLeave}
              className={`focus:outline-none transition-transform ${
                isRatingDisabled
                  ? "cursor-default"
                  : "cursor-pointer hover:scale-110"
              }`}
              disabled={isRatingDisabled || isSubmittingRating}
            >
              <svg
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          ))}
        </div>

        {isSubmittingRating && (
          <p className="text-sm text-blue-600">Menyimpan rating...</p>
        )}

        {!isSubmittingRating && rating > 0 && (
          <p className="text-sm text-gray-600">
            {isRatingDisabled
              ? `Anda telah memberi rating ${rating} bintang. Terima kasih atas feedback Anda!`
              : `Anda akan memberi rating ${rating} bintang`}
          </p>
        )}

        {!isRatingDisabled && rating > 0 && !isSubmittingRating && (
          <button
            onClick={() => handleStarClick(rating)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            disabled={isSubmittingRating}
          >
            Konfirmasi Rating
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className="flex h-screen font-sans bg-[#FDFBF6] relative overflow-hidden"
      style={{ fontFamily: '"Josefin Sans", sans-serif' }}
    >
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`bg-[#E0E7EF] border-r border-gray-200 flex flex-col transition-transform transform ${
          isMobile
            ? `fixed top-0 left-0 h-full z-30 ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "relative"
        }`}
        style={{
          width: isMobile ? "80vw" : sidebarWidth,
          maxWidth: isMobile ? "320px" : "500px",
        }}
      >
        <div className=" p-4 font-bold text-lg text-gray-700 border-b border-gray-300 flex justify-between items-center">
          <span>Chat Sessions</span>
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              <X size={24} />
            </button>
          )}
        </div>
        <div className="p-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau balasan terakhir..."
              className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm "
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {appointments.length === 0 && (
            <div className="p-4 text-gray-500">No chat sessions found.</div>
          )}

          {appointments
            .filter((apt) => {
              if (!searchQuery.trim()) return true;

              const query = searchQuery.toLowerCase();
              const name =
                (userType === "user"
                  ? apt.doctorName
                  : apt.patientName
                )?.toLowerCase() || "";
              const latestMessage =
                latestMessages[apt.id]?.text?.toLowerCase() || "";

              // Prioritize name search first
              const nameMatch = name.includes(query);
              const messageMatch = latestMessage.includes(query);

              return nameMatch || messageMatch;
            })
            .sort((a, b) => {
              if (!searchQuery.trim()) return 0;

              const query = searchQuery.toLowerCase();
              const aName =
                (userType === "user"
                  ? a.doctorName
                  : a.patientName
                )?.toLowerCase() || "";
              const bName =
                (userType === "user"
                  ? b.doctorName
                  : b.patientName
                )?.toLowerCase() || "";

              const aNameMatch = aName.includes(query);
              const bNameMatch = bName.includes(query);

              // If both or neither match by name, maintain original order
              if (aNameMatch === bNameMatch) return 0;

              // Prioritize name matches
              return aNameMatch ? -1 : 1;
            })
            .map((apt) => {
              const name =
                userType === "user" ? apt.doctorName : apt.patientName;
              const photo =
                userType === "user" ? apt.doctorPhoto : apt.patientPhoto;
              const showLatest =
                apt.status === "Sedang berlangsung" && latestMessages[apt.id];
              const unreadCount = unreadCounts[apt.id] || 0;

              return (
                <button
                  key={apt.id}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-blue-100 transition ${
                    activeAppointment?.id === apt.id
                      ? "bg-blue-200 font-semibold"
                      : ""
                  }`}
                  onClick={() => {
                    setActiveAppointment(apt);
                    setSearchParams({ chatId: apt.id });

                    // Mark messages as read when selecting this chat
                    markMessagesAsRead(apt.id);

                    setUnreadCounts((prev) => ({ ...prev, [apt.id]: 0 }));

                    const chatRef = collection(db, "chats", apt.id, "messages");
                    const q = query(
                      chatRef,
                      orderBy("timeCreated", "desc"),
                      limit(1)
                    );
                    getDocs(q).then((snap) => {
                      if (!snap.empty) {
                        const lastId = snap.docs[0].id;
                        setLastSeenMessageIds((prev) => ({
                          ...prev,
                          [apt.id]: lastId,
                        }));
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
                      {apt.status === "Sedang berlangsung" &&
                      latestMessages[apt.id] ? (
                        <span
                          className={`text-xs truncate ${
                            unreadCount > 0
                              ? "text-black font-bold"
                              : "text-gray-700"
                          }`}
                        >
                          {latestMessages[apt.id].sender === "me"
                            ? `Saya: ${latestMessages[apt.id].text}`
                            : latestMessages[apt.id].text}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {apt.status}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end ml-2 space-y-1">
                      {/* Show time for latest message */}
                      {apt.status === "Sedang berlangsung" &&
                        latestTime[apt.id] && (
                          <span className="text-[11px] text-gray-500 font-medium">
                            {latestTime[apt.id]} WIB
                          </span>
                        )}
                      {/* Show unread badge if there are unread messages */}
                      {unreadCount > 0 && (
                        <div className="bg-blue-500 text-white text-[11px] font-semibold rounded-full h-5 w-5 flex justify-center items-center">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

          {/* Show no results message when search query exists but no matches */}
          {searchQuery.trim() &&
            appointments.filter((apt) => {
              const query = searchQuery.toLowerCase();
              const name =
                (userType === "user"
                  ? apt.doctorName
                  : apt.patientName
                )?.toLowerCase() || "";
              const latestMessage =
                latestMessages[apt.id]?.text?.toLowerCase() || "";
              return name.includes(query) || latestMessage.includes(query);
            }).length === 0 && (
              <div className="p-4 text-gray-500 text-center">
                <p>Tidak ada hasil untuk "{searchQuery}"</p>
                <p className="text-xs mt-1">Coba kata kunci lain</p>
              </div>
            )}
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
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="mr-2 text-gray-700"
              >
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
            <span className="font-semibold text-lg text-gray-800">
              {partnerName || ""}
            </span>
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
              <p className="mb-6">
                Apakah Anda yakin ingin menyelesaikan percakapan?
              </p>
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
              Tidak ada sesi chat yang sedang berlangsung. <br /> Pilih sesi
              chat dari menu.
            </span>
          </div>
        ) : (
          <>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#FDFBF6]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
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
                    <div
                      className={`mx-2 self-end mb-1 flex flex-col items-${
                        msg.sender === "me" ? "end" : "start"
                      }`}
                    >
                      {/* Show read status for sender's messages */}
                      {msg.sender === "me" && msg.receiverRead && (
                        <span className="text-xs text-blue-600 font-medium mb-1">
                          Read
                        </span>
                      )}
                      <p className="text-xs text-gray-500">{msg.time} WIB</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </main>
            {userType === "user" && showSummary && summary && (
              <div className="p-4 bg-yellow-50 border-t border-b border-yellow-200 text-yellow-900">
                <div className="font-semibold mb-2">
                  Ringkasan Saran Psikiater:
                </div>
                <div style={{ whiteSpace: "pre-line" }}>{summary}</div>
              </div>
            )}

            {/* Show rating component for users when chat session has ended */}
            {userType === "user" && activeAppointment.status === "Selesai" && (
              <StarRating />
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
