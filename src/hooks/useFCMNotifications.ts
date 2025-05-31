import { useState, useEffect } from "react";
import { getFCMToken, onMessageListener } from "../config/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

interface FCMNotification {
  title: string;
  body: string;
  data?: any;
}

export const useFCMNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<FCMNotification | null>(
    null
  );
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if FCM is supported
    if ("serviceWorker" in navigator && "Notification" in window) {
      setIsSupported(true);
      initializeFCM();
    }
  }, []);

  const initializeFCM = async () => {
    try {
      // Register service worker
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        console.log("Service Worker registered:", registration);
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted");

        // Get FCM token
        const token = await getFCMToken();
        if (token) {
          setFcmToken(token);
          await saveFCMTokenToFirestore(token);
        }
      } else {
        console.log("Notification permission denied");
      }

      // Listen for foreground messages
      onMessageListener()
        .then((payload: any) => {
          console.log("Foreground message received:", payload);
          setNotification({
            title: payload.notification?.title || "New Message",
            body: payload.notification?.body || "You have a new message",
            data: payload.data,
          });

          // Show browser notification even in foreground
          if (Notification.permission === "granted") {
            const notif = new Notification(
              payload.notification?.title || "Pesan Baru dari Psikiater",
              {
                body: payload.notification?.body || "Anda memiliki pesan baru",
                icon: "/vite.svg",
                tag: payload.data?.appointmentId,
                data: payload.data,
              }
            );

            notif.onclick = () => {
              window.focus();
              if (payload.data?.appointmentId) {
                // Handle different notification types
                if (payload.data?.type === "video-reminder") {
                  window.location.href = "/manage-appointment";
                } else {
                  window.location.href = `/chat?appointmentId=${payload.data.appointmentId}`;
                }
              }
              notif.close();
            };
          }
        })
        .catch((error) =>
          console.error("Error listening for messages:", error)
        );
    } catch (error) {
      console.error("Error initializing FCM:", error);
    }
  };

  const saveFCMTokenToFirestore = async (token: string) => {
    try {
      const userId = localStorage.getItem("documentId");
      if (!userId) return;

      const userType = localStorage.getItem("userType");
      const collection =
        userType === "psychiatrist" ? "psychiatrists" : "users";

      const userDocRef = doc(db, collection, userId);

      // Check if document exists first
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          fcmToken: token,
          fcmTokenUpdatedAt: new Date(),
        });
        console.log("FCM token saved to Firestore");
      }
    } catch (error) {
      console.error("Error saving FCM token:", error);
    }
  };

  const clearNotification = () => {
    setNotification(null);
  };

  return {
    fcmToken,
    notification,
    isSupported,
    clearNotification,
  };
};
