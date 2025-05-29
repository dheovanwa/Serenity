import { useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const STATUS_FILTER = ["Terjadwal", "Sedang berlangsung", "Selesai"];

const AppointmentStatusUpdater = () => {
  useEffect(() => {
    const updateStatuses = async () => {
      const userType = localStorage.getItem("userType");
      const documentId = localStorage.getItem("documentId");
      if (!documentId) return;

      let q;
      if (userType === "psychiatrist") {
        q = query(
          collection(db, "appointments"),
          where("psychiatristId", "==", documentId),
          where("status", "in", STATUS_FILTER),
          orderBy("date", "asc")
        );
      } else {
        q = query(
          collection(db, "appointments"),
          where("patientId", "==", documentId),
          where("status", "in", STATUS_FILTER),
          orderBy("date", "asc")
        );
      }

      const querySnapshot = await getDocs(q);
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const todayStr = now.toLocaleDateString("id-ID");

      for (const docSnap of querySnapshot.docs) {
        const apt = docSnap.data();
        const aptDate = new Date(apt.date);
        const aptDateStr = aptDate.toLocaleDateString("id-ID");
        let status = apt.status;

        // Do not change status if already "Selesai"
        if (apt.status === "Selesai") continue;

        // Prevent changing status if chat hasEnded is true
        if (apt.method === "Chat") {
          // Check if chat document has hasEnded = true
          try {
            const chatDocRef = doc(db, "chats", docSnap.id);
            const chatDoc = await getDoc(chatDocRef);
            if (chatDoc.exists() && chatDoc.data().hasEnded) {
              continue; // Do not update status if chat ended
            }
          } catch (e) {
            // Ignore errors, fallback to normal logic
          }
        }

        if (apt.method === "Chat" && aptDateStr === todayStr) {
          status = "Sedang berlangsung";
        } else if (
          apt.method === "Video" &&
          aptDateStr === todayStr &&
          apt.time
        ) {
          // Parse time range "HH.MM - HH.MM"
          const [start, end] = apt.time.split(" - ");
          const [startH, startM] = start.split(".").map(Number);
          const [endH, endM] = end.split(".").map(Number);
          const startMinutes = startH * 60 + (startM || 0);
          const endMinutes = endH * 60 + (endM || 0);
          if (nowMinutes >= startMinutes && nowMinutes < endMinutes) {
            status = "Sedang berlangsung";
            console.log(
              `Updating appointment ${docSnap.id} to "Sedang berlangsung" due to current time`
            );
          }
        }

        if (status !== apt.status) {
          await updateDoc(doc(db, "appointments", docSnap.id), { status });
        }
      }
    };

    updateStatuses();
    // Optionally, run every minute to keep statuses up-to-date
    const interval = setInterval(updateStatuses, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
};

export default AppointmentStatusUpdater;
