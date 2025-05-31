import { db } from "../config/firebase";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

interface ScheduledNotification {
  id: string;
  appointmentId: string;
  timeoutId: number;
  scheduledTime: number;
  type: "video-reminder";
}

class NotificationScheduler {
  private scheduledNotifications: Map<string, ScheduledNotification> =
    new Map();

  // Schedule a video appointment reminder 10 minutes before start time
  async scheduleVideoAppointmentReminder(
    appointmentId: string,
    userId: string,
    doctorName: string,
    dateStr: string,
    timeRange: string
  ) {
    try {
      // Parse the time range (e.g., "09.00 - 10.00")
      const [startTime] = timeRange.split(" - ");
      const [hours, minutes] = startTime.split(".").map(Number);

      // Create appointment date-time
      const appointmentDate = new Date(dateStr);
      appointmentDate.setHours(hours, minutes || 0, 0, 0);

      // Calculate reminder time (10 minutes before)
      const reminderTime = new Date(appointmentDate.getTime() - 2 * 60 * 1000);
      const now = new Date();

      // Only schedule if reminder time is in the future
      if (reminderTime > now) {
        const delay = reminderTime.getTime() - now.getTime();

        // Cancel any existing notification for this appointment
        this.cancelScheduledNotification(appointmentId);

        const timeoutId = window.setTimeout(() => {
          this.sendVideoAppointmentReminder(
            appointmentId,
            doctorName,
            timeRange
          );
        }, delay);

        const notification: ScheduledNotification = {
          id: `video-reminder-${appointmentId}`,
          appointmentId,
          timeoutId,
          scheduledTime: reminderTime.getTime(),
          type: "video-reminder",
        };

        this.scheduledNotifications.set(appointmentId, notification);

        // Save to localStorage for persistence
        this.saveScheduledNotifications();

        console.log(
          `Scheduled video reminder for appointment ${appointmentId} at ${reminderTime.toLocaleString()}`
        );
      }
    } catch (error) {
      console.error("Error scheduling video appointment reminder:", error);
    }
  }

  // Send the actual video appointment reminder notification
  private sendVideoAppointmentReminder(
    appointmentId: string,
    doctorName: string,
    timeRange: string
  ) {
    try {
      // Remove from scheduled notifications
      this.scheduledNotifications.delete(appointmentId);
      this.saveScheduledNotifications();

      // Show browser notification if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification("Pengingat Sesi Video Call", {
          body: `Sesi video call dengan Dr. ${doctorName} akan dimulai dalam 10 menit (${timeRange}). Bersiaplah!`,
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

      // Also try to send via service worker for better reliability
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_VIDEO_REMINDER",
          data: {
            appointmentId,
            doctorName,
            timeRange,
            title: "Pengingat Sesi Video Call",
            body: `Sesi video call dengan Dr. ${doctorName} akan dimulai dalam 10 menit (${timeRange}). Bersiaplah!`,
          },
        });
      }
    } catch (error) {
      console.error("Error sending video appointment reminder:", error);
    }
  }

  // Cancel a scheduled notification
  async cancelScheduledNotification(appointmentId: string) {
    const notification = this.scheduledNotifications.get(appointmentId);
    if (notification) {
      clearTimeout(notification.timeoutId);
      this.scheduledNotifications.delete(appointmentId);
      this.saveScheduledNotifications();
      console.log(
        `Cancelled scheduled notification for appointment ${appointmentId}`
      );
    }
  }

  // Save scheduled notifications to localStorage
  private saveScheduledNotifications() {
    try {
      const serializable = Array.from(
        this.scheduledNotifications.entries()
      ).map(([key, notification]) => [
        key,
        {
          ...notification,
          timeoutId: 0, // Don't save timeout IDs
        },
      ]);
      localStorage.setItem(
        "scheduledNotifications",
        JSON.stringify(serializable)
      );
    } catch (error) {
      console.error("Error saving scheduled notifications:", error);
    }
  }

  // Restore scheduled notifications from localStorage
  async restoreScheduledNotifications() {
    try {
      const saved = localStorage.getItem("scheduledNotifications");
      if (!saved) return;

      const notifications = JSON.parse(saved) as [
        string,
        Omit<ScheduledNotification, "timeoutId">
      ][];
      const now = Date.now();

      for (const [appointmentId, notificationData] of notifications) {
        // Only restore if the scheduled time hasn't passed
        if (notificationData.scheduledTime > now) {
          const delay = notificationData.scheduledTime - now;

          const timeoutId = window.setTimeout(() => {
            // Get appointment details from the ID to send reminder
            this.sendVideoAppointmentReminder(
              appointmentId,
              "Psikiater",
              "Segera"
            );
          }, delay);

          this.scheduledNotifications.set(appointmentId, {
            ...notificationData,
            timeoutId,
          });
        }
      }

      // Clean up expired notifications
      this.saveScheduledNotifications();
    } catch (error) {
      console.error("Error restoring scheduled notifications:", error);
    }
  }

  // Get all scheduled notifications (for debugging)
  getScheduledNotifications() {
    return Array.from(this.scheduledNotifications.values());
  }
}

// Create singleton instance
export const notificationScheduler = new NotificationScheduler();
