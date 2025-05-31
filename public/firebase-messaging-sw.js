// Import Firebase scripts for service worker
importScripts(
  "https://www.gstatic.com/firebasejs/11.4.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging-compat.js"
);

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAw8I6vOwo0Jqz3kpzFpVOVXANfm80y9hc",
  authDomain: "serenity-646e2.firebaseapp.com",
  projectId: "serenity-646e2",
  storageBucket: "serenity-646e2.firebasestorage.app",
  messagingSenderId: "1044339589442",
  appId: "1:1044339589442:web:b2386ca1f10ee691ea08db",
  measurementId: "G-9SWNQF1K9W",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle =
    payload.notification?.title ||
    (payload.data?.type === "video-reminder"
      ? "Pengingat Sesi Video Call"
      : "Pesan Baru dari Psikiater");

  const notificationOptions = {
    body:
      payload.notification?.body ||
      (payload.data?.type === "video-reminder"
        ? "Sesi video call Anda akan dimulai dalam 10 menit"
        : "Anda memiliki pesan baru"),
    icon: "/vite.svg",
    badge: "/vite.svg",
    tag: payload.data?.appointmentId || "chat-notification",
    data: {
      appointmentId: payload.data?.appointmentId,
      type: payload.data?.type,
      url:
        payload.data?.type === "video-reminder"
          ? "/manage-appointment"
          : payload.data?.url ||
            `/chat?appointmentId=${payload.data?.appointmentId}`,
    },
    actions: [
      {
        action: "view",
        title:
          payload.data?.type === "video-reminder"
            ? "Lihat Jadwal"
            : "Buka Chat",
      },
      {
        action: "close",
        title: "Tutup",
      },
    ],
    requireInteraction: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "view" || !event.action) {
    let urlToOpen = "/manage-appointment";

    // Handle different notification types
    if (event.notification.data?.url) {
      urlToOpen = event.notification.data.url;
    } else if (
      event.notification.data?.appointmentId &&
      (event.notification.tag?.includes("reminder") ||
        event.notification.data?.type === "video-reminder")
    ) {
      urlToOpen = "/manage-appointment";
    } else if (event.notification.data?.appointmentId) {
      urlToOpen = `/chat?appointmentId=${event.notification.data.appointmentId}`;
    }

    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window/tab open with the target URL
          for (const client of clientList) {
            if (
              (urlToOpen.includes("/chat") && client.url.includes("/chat")) ||
              (urlToOpen.includes("/manage-appointment") &&
                client.url.includes("/manage-appointment")) ||
              client.url === new URL(urlToOpen, self.location.origin).href
            ) {
              if ("focus" in client) {
                if (event.notification.data?.appointmentId) {
                  client.postMessage({
                    type: urlToOpen.includes("/chat")
                      ? "NAVIGATE_TO_CHAT"
                      : "NAVIGATE_TO_APPOINTMENT",
                    appointmentId: event.notification.data.appointmentId,
                  });
                }
                return client.focus();
              }
            }
          }

          // If no window/tab is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  } else if (event.action === "dismiss" || event.action === "close") {
    // Just close the notification - no action needed
    return;
  }
});

// Listen for messages from the main thread (for video reminders)
self.addEventListener("message", (event) => {
  if (event.data?.type === "SHOW_VIDEO_REMINDER") {
    const { data } = event.data;

    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/vite.svg",
      badge: "/vite.svg",
      tag: `video-reminder-${data.appointmentId}`,
      data: {
        appointmentId: data.appointmentId,
        type: "video-reminder",
        url: "/manage-appointment",
      },
      actions: [
        {
          action: "view",
          title: "Lihat Jadwal",
        },
        {
          action: "close",
          title: "Tutup",
        },
      ],
      requireInteraction: true,
    });
  }
});
