import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";

interface NotificationMessage {
  id: string;
  text: string;
  senderName: string;
  timeCreated: any;
  appointmentId: string;
}

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState<NotificationMessage[]>(
    []
  );
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const userId = localStorage.getItem("documentId");
  const userType = localStorage.getItem("userType") as "user" | "psychiatrist";
  const [unreadCountsByAppointment, setUnreadCountsByAppointment] = useState<{
    [appointmentId: string]: number;
  }>({});

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);

      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  // Function to show browser notification
  const showBrowserNotification = (message: NotificationMessage) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(
        `Pesan baru dari ${message.senderName}`,
        {
          body:
            message.text.length > 100
              ? `${message.text.substring(0, 100)}...`
              : message.text,
          icon: "/vite.svg",
          tag: message.appointmentId,
          requireInteraction: true,
        }
      );

      notification.onclick = () => {
        window.focus();
        window.location.href = `/chat?appointmentId=${message.appointmentId}`;
        notification.close();
      };

      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  };

  useEffect(() => {
    if (!userId || !userType) return;

    let unsubscribes: (() => void)[] = [];
    const processedMessageIds = new Set<string>();

    const fetchNotifications = async () => {
      try {
        // Get active chat appointments for current user
        let appointmentsQ;
        if (userType === "user") {
          appointmentsQ = query(
            collection(db, "appointments"),
            where("patientId", "==", userId),
            where("method", "==", "Chat"),
            where("status", "==", "Sedang berlangsung")
          );
        } else {
          appointmentsQ = query(
            collection(db, "appointments"),
            where("psychiatristId", "==", userId),
            where("method", "==", "Chat"),
            where("status", "==", "Sedang berlangsung")
          );
        }

        const appointmentsSnap = await getDocs(appointmentsQ);

        for (const docSnap of appointmentsSnap.docs) {
          const appointmentId = docSnap.id;
          const apt = docSnap.data();

          // Get sender name based on user type
          let senderName = "Unknown";
          if (userType === "user") {
            if (apt.psychiatristId) {
              const psychiatristDoc = await getDoc(
                doc(db, "psychiatrists", apt.psychiatristId)
              );
              if (psychiatristDoc.exists()) {
                const psyData = psychiatristDoc.data();
                senderName = psyData.name || "Psikiater";
              }
            }
          } else {
            if (apt.patientId) {
              const patientDoc = await getDoc(doc(db, "users", apt.patientId));
              if (patientDoc.exists()) {
                const patientData = patientDoc.data();
                senderName = patientData.firstName || "Pasien";
              }
            }
          }

          // Listen for unread messages
          const messagesQ = query(
            collection(db, "chats", appointmentId, "messages"),
            where("receiverRead", "==", false),
            orderBy("timeCreated", "desc"),
            limit(5)
          );

          const unsubscribe = onSnapshot(messagesQ, async (messagesSnap) => {
            let unreadInThisChat = 0;
            const chatMessages: NotificationMessage[] = [];

            for (const msgDoc of messagesSnap.docs) {
              const msgData = msgDoc.data();

              // Check if message is from the other party
              if (msgData.senderId) {
                try {
                  let isFromOtherParty = false;

                  if (userType === "user") {
                    // For users, check if sender is psychiatrist
                    const senderDocRef = doc(
                      db,
                      "psychiatrists",
                      msgData.senderId
                    );
                    const senderDoc = await getDoc(senderDocRef);
                    isFromOtherParty = senderDoc.exists();
                  } else {
                    // For psychiatrists, check if sender is patient
                    const senderDocRef = doc(db, "users", msgData.senderId);
                    const senderDoc = await getDoc(senderDocRef);
                    isFromOtherParty = senderDoc.exists();
                  }

                  if (isFromOtherParty) {
                    unreadInThisChat++;
                    const newMessage: NotificationMessage = {
                      id: msgDoc.id,
                      text: msgData.text || "",
                      senderName: senderName,
                      timeCreated: msgData.timeCreated,
                      appointmentId: appointmentId,
                    };

                    chatMessages.push(newMessage);

                    // Show browser notification for new messages
                    if (!processedMessageIds.has(msgDoc.id)) {
                      processedMessageIds.add(msgDoc.id);
                      showBrowserNotification(newMessage);
                    }
                  }
                } catch (e) {
                  console.error("Error checking sender:", e);
                }
              }
            }

            // Update unread counts by appointment
            setUnreadCountsByAppointment((prev) => ({
              ...prev,
              [appointmentId]: unreadInThisChat,
            }));

            setRecentMessages((prev) => {
              const filtered = prev.filter(
                (m) => m.appointmentId !== appointmentId
              );
              return [...filtered, ...chatMessages].slice(0, 10);
            });
          });

          unsubscribes.push(unsubscribe);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    return () => {
      unsubscribes.forEach((unsub) => unsub && unsub());
    };
  }, [userId, userType]);

  // Calculate total unread count whenever unreadCountsByAppointment changes
  useEffect(() => {
    const total = Object.values(unreadCountsByAppointment).reduce(
      (sum, count) => sum + count,
      0
    );
    setUnreadCount(total);
  }, [unreadCountsByAppointment]);

  return {
    unreadCount,
    recentMessages,
    notificationPermission,
  };
};
