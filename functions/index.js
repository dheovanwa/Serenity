const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendChatNotification = functions.firestore
  .document("chats/{appointmentId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    try {
      const messageData = snap.data();
      const appointmentId = context.params.appointmentId;

      // Get appointment details
      const appointmentDoc = await admin
        .firestore()
        .doc(`appointments/${appointmentId}`)
        .get();

      if (!appointmentDoc.exists) {
        console.log("Appointment not found");
        return null;
      }

      const appointmentData = appointmentDoc.data();
      const senderId = messageData.senderId;
      const patientId = appointmentData.patientId;
      const psychiatristId = appointmentData.psychiatristId;

      // Determine if message is from psychiatrist to patient or patient to psychiatrist
      let receiverId = null;
      let senderName = "Unknown";
      let receiverCollection = "";

      // Check if sender is psychiatrist
      const psychiatristDoc = await admin
        .firestore()
        .doc(`psychiatrists/${senderId}`)
        .get();

      if (psychiatristDoc.exists()) {
        // Message from psychiatrist to patient
        receiverId = patientId;
        receiverCollection = "users";
        senderName = psychiatristDoc.data().name || "Psikiater";
      } else {
        // Check if sender is patient
        const patientDoc = await admin
          .firestore()
          .doc(`users/${senderId}`)
          .get();

        if (patientDoc.exists()) {
          // Message from patient to psychiatrist
          receiverId = psychiatristId;
          receiverCollection = "psychiatrists";
          senderName =
            patientDoc.data().firstName || patientDoc.data().name || "Pasien";
        }
      }

      if (!receiverId) {
        console.log("Could not determine receiver");
        return null;
      }

      // Get receiver's FCM token
      const receiverDoc = await admin
        .firestore()
        .doc(`${receiverCollection}/${receiverId}`)
        .get();

      if (!receiverDoc.exists()) {
        console.log("Receiver not found");
        return null;
      }

      const receiverData = receiverDoc.data();
      const fcmToken = receiverData.fcmToken;

      if (!fcmToken) {
        console.log("No FCM token found for receiver");
        return null;
      }

      // Prepare notification payload
      const payload = {
        notification: {
          title: `Pesan baru dari ${senderName}`,
          body: messageData.text || "Anda memiliki pesan baru",
          icon: "/vite.svg",
          click_action: `https://your-domain.com/chat?appointmentId=${appointmentId}`,
        },
        data: {
          appointmentId: appointmentId,
          senderId: senderId,
          senderName: senderName,
          url: `/chat?appointmentId=${appointmentId}`,
        },
        token: fcmToken,
      };

      // Send notification
      const response = await admin.messaging().send(payload);
      console.log("Notification sent successfully:", response);

      return response;
    } catch (error) {
      console.error("Error sending notification:", error);
      return null;
    }
  });
