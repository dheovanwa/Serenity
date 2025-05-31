import { db } from "../config/firebase";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

interface ScheduledNotification {
  id: string;
  appointmentId: string;
  userId: string;
  doctorName: string;
  date: string;
  time: string;
  timeoutId?: number;
}

class NotificationScheduler {
  private scheduledNotifications: Map<string, ScheduledNotification> =
    new Map();

  async scheduleVideoAppointmentReminder(
    appointmentId: string,
    userId: string,
    doctorName: string,
    date: string,
    time: string
  ) {
    try {
      // Parse the time string (e.g., "10.00 - 11.00")
      const [startTime] = time.split(" - ");
      const [hours, minutes] = startTime.split(".").map(Number);

      // Create appointment date
      const appointmentDate = new Date(date);
      appointmentDate.setHours(hours, minutes || 0, 0, 0);

      // Schedule notification 10 minutes before
      const notificationTime = new Date(
        appointmentDateTime.getTime() - 10 * 60 * 1000
      );
      const now = new Date();

      if (notificationTime > now) {
        const delay = notificationTime.getTime() - now.getTime();

        const timeoutId = window.setTimeout(() => {
          this.showVideoAppointmentReminder(appointmentId, doctorName, time);
          this.scheduledNotifications.delete(appointmentId);
        }, delay);

        const notification: ScheduledNotification = {
          id: appointmentId,
          appointmentId,
          userId,
          doctorName,
          date,
          time,
          timeoutId,
        };

        this.scheduledNotifications.set(appointmentId, notification);

        // Store in localStorage for persistence
        this.saveScheduledNotifications();

        console.log(
          `Scheduled notification for appointment ${appointmentId} at ${notificationTime}`
        );
      }
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  }

  async cancelScheduledNotification(appointmentId: string) {
    const notification = this.scheduledNotifications.get(appointmentId);
    if (notification && notification.timeoutId) {
      clearTimeout(notification.timeoutId);
      this.scheduledNotifications.delete(appointmentId);
      this.saveScheduledNotifications();
      console.log(`Cancelled notification for appointment ${appointmentId}`);
    }
  }

  private showVideoAppointmentReminder(
    appointmentId: string,
    doctorName: string,
    time: string
  ) {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("Pengingat Konsultasi Video", {
        body: `Konsultasi dengan Dr. ${doctorName} akan dimulai dalam 30 menit (${time})`,
        icon: "/vite.svg",
        tag: `video-reminder-${appointmentId}`,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = "/manage-appointment";
        notification.close();
      };

      setTimeout(() => {
        notification.close();
      }, 30000); // Auto close after 30 seconds
    }
  }

  private saveScheduledNotifications() {
    const notifications = Array.from(this.scheduledNotifications.values()).map(
      (notif) => ({
        ...notif,
        timeoutId: undefined, // Don't serialize timeout IDs
      })
    );
    localStorage.setItem(
      "scheduledNotifications",
      JSON.stringify(notifications)
    );
  }

  async restoreScheduledNotifications() {
    try {
      const stored = localStorage.getItem("scheduledNotifications");
      if (stored) {
        const notifications: ScheduledNotification[] = JSON.parse(stored);
        const now = new Date();

        for (const notif of notifications) {
          // Parse the time string
          const [startTime] = notif.time.split(" - ");
          const [hours, minutes] = startTime.split(".").map(Number);

          // Create appointment date
          const appointmentDate = new Date(notif.date);
          appointmentDate.setHours(hours, minutes || 0, 0, 0);

          // Schedule notification 30 minutes before
          const notificationTime = new Date(
            appointmentDate.getTime() - 30 * 60 * 1000
          );

          if (notificationTime > now) {
            // Reschedule if still in the future
            await this.scheduleVideoAppointmentReminder(
              notif.appointmentId,
              notif.userId,
              notif.doctorName,
              notif.date,
              notif.time
            );
          }
        }
      }
    } catch (error) {
      console.error("Error restoring scheduled notifications:", error);
    }
  }
}

export const notificationScheduler = new NotificationScheduler();
