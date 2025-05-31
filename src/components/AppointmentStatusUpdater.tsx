import { useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { notificationScheduler } from "../utils/notificationScheduler";

const AppointmentStatusUpdater = () => {
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

          if (appointmentDateStr === today) {
            if (
              appointment.method === "Video" &&
              appointment.time !== "today"
            ) {
              // Parse time range for video appointments
              const timeRange = appointment.time;
              const [startTime, endTime] = timeRange.split(" - ");

              if (startTime && endTime) {
                const [startHour, startMinute] = startTime
                  .split(".")
                  .map(Number);
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
                  // Cancel notification since appointment has started
                  await notificationScheduler.cancelScheduledNotification(
                    docSnap.id
                  );

                  // Update appointment status to "Sedang berlangsung"
                  await updateDoc(doc(db, "appointments", docSnap.id), {
                    status: "Sedang berlangsung",
                  });
                  console.log(
                    `Updated video appointment ${docSnap.id} to "Sedang berlangsung"`
                  );
                } else if (currentTotalMinutes > endTotalMinutes) {
                  // Cancel notification since appointment is finished
                  await notificationScheduler.cancelScheduledNotification(
                    docSnap.id
                  );

                  // Update to "Selesai" if current time is past the end time
                  await updateDoc(doc(db, "appointments", docSnap.id), {
                    status: "Selesai",
                  });
                  console.log(
                    `Updated video appointment ${docSnap.id} to "Selesai"`
                  );
                }
              }
            } else if (
              appointment.method === "Chat" &&
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
          } else if (appointmentDateStr < today) {
            // Handle past appointments - mark as completed
            if (appointment.method === "Chat") {
              await updateDoc(doc(db, "appointments", docSnap.id), {
                status: "Selesai",
              });
              console.log(
                `Updated past chat appointment ${docSnap.id} to "Selesai"`
              );
            } else if (appointment.method === "Video") {
              // Also handle past video appointments
              await updateDoc(doc(db, "appointments", docSnap.id), {
                status: "Selesai",
              });
              console.log(
                `Updated past video appointment ${docSnap.id} to "Selesai"`
              );
            }
          }
        }

        // Check "Sedang berlangsung" chat appointments from previous days
        const ongoingChatQuery = query(
          appointmentsRef,
          where("status", "==", "Sedang berlangsung"),
          where("method", "==", "Chat")
        );

        const ongoingChatSnapshot = await getDocs(ongoingChatQuery);

        for (const docSnap of ongoingChatSnapshot.docs) {
          const appointment = docSnap.data();
          const appointmentDate = new Date(appointment.date);
          const appointmentDateStr =
            appointmentDate.getFullYear() +
            "-" +
            String(appointmentDate.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(appointmentDate.getDate()).padStart(2, "0");

          // If chat appointment is from a previous day, mark as completed
          if (appointmentDateStr < today) {
            await updateDoc(doc(db, "appointments", docSnap.id), {
              status: "Selesai",
            });
            console.log(
              `Updated ongoing past chat appointment ${docSnap.id} to "Selesai"`
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

  return null; // This component doesn't render anything
};

export default AppointmentStatusUpdater;
