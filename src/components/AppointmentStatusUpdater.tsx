import { useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const AppointmentStatusUpdater = () => {
  useEffect(() => {
    const checkAndUpdateAppointments = async () => {
      try {
        // Get current time in minutes since start of day
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD format

        // Query active appointments for today
        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          where("status", "in", ["Terjadwal", "Sedang berlangsung"])
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (docSnap) => {
          const appointment = docSnap.data();
          const appointmentDate = new Date(appointment.date)
            .toISOString()
            .split("T")[0];

          // Only process today's appointments
          if (appointmentDate === todayStr) {
            // For Video appointments, check time frame
            if (appointment.method === "Video" && appointment.time) {
              const [timeRange] = appointment.time.split(" - ");
              const [endTime] = appointment.time.split(" - ")[1].split(".");
              const [endHour, endMinute] = endTime.split(".").map(Number);
              const [startHour, startMinute] = timeRange.split(".").map(Number);

              const startTimeMinutes = startHour * 60 + (startMinute || 0);
              const endTimeMinutes = endHour * 60 + (endMinute || 0);

              // Update to "Sedang berlangsung" if within time frame
              if (
                currentMinutes >= startTimeMinutes &&
                currentMinutes < endTimeMinutes
              ) {
                if (appointment.status !== "Sedang berlangsung") {
                  console.log(
                    `Updating appointment ${docSnap.id} to "Sedang berlangsung" due to current time`
                  );
                  await updateDoc(doc(db, "appointments", docSnap.id), {
                    status: "Sedang berlangsung",
                  });
                }
              }
              // Update to "Selesai" only if past end time
              else if (
                currentMinutes >= endTimeMinutes &&
                appointment.status !== "Selesai"
              ) {
                console.log(
                  `Updating appointment ${docSnap.id} to "Selesai" as time frame has ended`
                );
                await updateDoc(doc(db, "appointments", docSnap.id), {
                  status: "Selesai",
                });
              }
            }
            // For Chat appointments, only update to "Sedang berlangsung"
            else if (
              appointment.method === "Chat" &&
              appointment.status === "Terjadwal"
            ) {
              console.log(
                `Updating chat appointment ${docSnap.id} to "Sedang berlangsung"`
              );
              await updateDoc(doc(db, "appointments", docSnap.id), {
                status: "Sedang berlangsung",
              });
            }
          }
        });
      } catch (error) {
        console.error("Error updating appointment statuses:", error);
      }
    };

    // Run check immediately and then every minute
    checkAndUpdateAppointments();
    const interval = setInterval(checkAndUpdateAppointments, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default AppointmentStatusUpdater;
