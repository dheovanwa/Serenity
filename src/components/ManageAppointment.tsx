import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Button } from "@/components/ui/button"; // Assuming this Button component is dark mode aware
import { useLocation } from "react-router-dom";
import Loading from "./Loading"; // Assuming this Loading component is dark mode aware
import { generateInvoicePDF } from "../utils/invoiceGenerator";
import { format } from "date-fns";
import AppointmentStatusUpdater from "../components/AppointmentStatusUpdater"; // Assuming this component is dark mode aware

interface Appointment {
  id?: string;
  psychiatristId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  gejala: string;
  method: string;
  date: string; // This is a string representation of Unix timestamp
  time: string;
  dayName: string;
  price: number;
  status: string;
  tokenId?: string;
  createdAt?: number;
}

// Add isDarkMode prop interface
interface ManageAppointmentProps {
  isDarkMode: boolean;
}

const ManageAppointment = ({ isDarkMode }: ManageAppointmentProps) => {
  // Accept isDarkMode prop
  const [paymentTokens, setPaymentTokens] = useState<{ [key: string]: string }>(
    {}
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const location = useLocation();

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [loadingAppointmentId, setLoadingAppointmentId] = useState<
    string | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const handleOpenModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleConfirmCancel = async () => {
    if (selectedAppointment) {
      await handleCancel(selectedAppointment);
    }
    handleCloseModal();
  };

  const indexOfLastAppointment = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstAppointment = indexOfLastAppointment - ITEMS_PER_PAGE;
  const currentAppointments = appointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );

  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);

  const updateAppointmentStatus = useCallback(async () => {
    const params = new URLSearchParams(location.search);
    const transactionStatus = params.get("transaction_status");
    const orderId = params.get("order_id");

    console.log("Transaction Status:", transactionStatus);
    console.log("Order ID:", orderId);

    if (transactionStatus === "settlement" && orderId) {
      try {
        setStatusUpdateLoading(true);
        const appointmentRef = doc(db, "appointments", orderId);
        const appointmentSnap = await getDoc(appointmentRef);

        if (appointmentSnap.exists()) {
          await updateDoc(appointmentRef, {
            status: "Terjadwal",
          });

          console.log("Successfully updated appointment status");

          const documentId = localStorage.getItem("documentId");
          if (documentId) {
            const updatedSnapshot = await getDocs(
              query(
                collection(db, "appointments"),
                where("patientId", "==", documentId),
                orderBy("createdAt", "desc")
              )
            );

            const updatedAppointments: Appointment[] = [];
            updatedSnapshot.forEach((doc) => {
              updatedAppointments.push({
                id: doc.id,
                ...(doc.data() as Appointment),
              });
            });

            setAppointments(updatedAppointments);
          }
        } else {
          console.error("No appointment found with ID:", orderId);
        }
      } catch (error) {
        console.error("Error updating appointment status:", error);
      } finally {
        setStatusUpdateLoading(false);
      }
    }
  }, [location.search]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const documentId = localStorage.getItem("documentId");
        if (!documentId) return;

        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          where("patientId", "==", documentId),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);

        const fetchedAppointments: Appointment[] = [];
        querySnapshot.forEach((doc) => {
          fetchedAppointments.push({
            id: doc.id,
            ...(doc.data() as Appointment),
          });
        });
        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    if (location.search) {
      updateAppointmentStatus();
    }
  }, [location.search, updateAppointmentStatus]);

  const formatAppointmentDate = (item: Appointment) => {
    const date = new Date(Number(item.date)); // Convert Unix timestamp string to Date object
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const formattedDate = `${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`;
    const time = item.method === "Chat" ? "" : `, ${item.time}`;
    return `${item.dayName}, ${formattedDate}${time}`;
  };

  const handlePayment = async (appointment: Appointment) => {
    try {
      setLoadingAppointmentId(appointment.id || null);

      if (appointment.tokenId) {
        (window as any).snap.pay(appointment.tokenId, {
          onSuccess: async (result: any) => {
            setLoadingAppointmentId(null);
            if (appointment.id) {
              const appointmentRef = doc(db, "appointments", appointment.id);
              await updateDoc(appointmentRef, {
                status: "Terjadwal",
                tokenId: null,
              });

              setAppointments((prevAppointments) =>
                prevAppointments.map((apt) =>
                  apt.id === appointment.id
                    ? { ...apt, status: "Terjadwal", tokenId: null }
                    : apt
                )
              );
            }
          },
          onPending: (result: any) => {
            setLoadingAppointmentId(null);
          },
          onError: (result: any) => {
            setLoadingAppointmentId(null);
          },
          onClose: () => {
            setLoadingAppointmentId(null);
          },
        });
        return;
      }

      const response = await fetch(
        "https://midtrans-backend.onrender.com/api/payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
          credentials: "include",

          body: JSON.stringify({
            amount: appointment.price,
            email: "patient-email@example.com",
            firstName: appointment.patientName.split(" ")[0],
            lastName:
              appointment.patientName.split(" ").slice(1).join(" ") || " ",
            orderId: appointment.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.token) {
        if (appointment.id) {
          const appointmentRef = doc(db, "appointments", appointment.id);
          await updateDoc(appointmentRef, {
            tokenId: data.token,
          });

          setAppointments((prevAppointments) =>
            prevAppointments.map((apt) =>
              apt.id === appointment.id ? { ...apt, tokenId: data.token } : apt
            )
          );
        }

        if (!(window as any).snap) {
          const script = document.createElement("script");
          script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
          script.setAttribute(
            "data-client-key",
            "SB-Mid-client-r37KgcFHWMmxfN8H"
          );
          document.head.appendChild(script);

          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        setIsPaymentLoading(false);

        (window as any).snap.pay(data.token, {
          onSuccess: async (result: any) => {
            setLoadingAppointmentId(null);
            if (appointment.id) {
              const appointmentRef = doc(db, "appointments", appointment.id);
              await updateDoc(appointmentRef, {
                status: "Terjadwal",
                tokenId: null,
              });

              setAppointments((prevAppointments) =>
                prevAppointments.map((apt) =>
                  apt.id === appointment.id
                    ? { ...apt, status: "Terjadwal", tokenId: null }
                    : apt
                )
              );
            }
          },
          onPending: async (result: any) => {
            setLoadingAppointmentId(null);
          },
          onError: async (result: any) => {
            setLoadingAppointmentId(null);
            if (appointment.id) {
              const appointmentRef = doc(db, "appointments", appointment.id);
              await updateDoc(appointmentRef, {
                tokenId: null,
              });
            }
          },
          onClose: () => {
            setLoadingAppointmentId(null);
          },
        });
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to initiate payment. Please try again.");
      setLoadingAppointmentId(null);
    }
  };

  const handleCancel = async (appointment: Appointment) => {
    try {
      const appointmentRef = doc(db, "appointments", appointment.id!);
      const psychiatristRef = doc(
        db,
        "psychiatrists",
        appointment.psychiatristId
      );
      const dateStr = format(Number(appointment.date), "yyyy-MM-dd");

      const docSnap = await getDoc(psychiatristRef);
      if (!docSnap.exists()) {
        throw new Error("Psychiatrist not found");
      }

      const psychiatristData = docSnap.data();

      if (appointment.method === "Chat") {
        const currentBookedChat = psychiatristData?.bookedChat || {};
        const currentCount = currentBookedChat[dateStr] || 0;

        if (currentCount > 0) {
          await updateDoc(psychiatristRef, {
            bookedChat: {
              ...currentBookedChat,
              [dateStr]: currentCount - 1,
            },
          });
        }
      } else if (appointment.method === "Video") {
        const bookedVideo = psychiatristData?.bookedVideo || {};
        const dateBookings = bookedVideo[dateStr] || [];

        const [startTime, endTime] = appointment.time.split(" - ");
        const [startHour, startMinute] = startTime.split(".").map(Number);
        const [endHour, endMinute] = endTime.split(".").map(Number);
        const startMinutes = startHour * 60 + (startMinute || 0);
        const endMinutes = endHour * 60 + (endMinute || 0);

        for (let i = 0; i < dateBookings.length; i += 2) {
          if (
            dateBookings[i] === startMinutes &&
            dateBookings[i + 1] === endMinutes
          ) {
            dateBookings.splice(i, 2);
            break;
          }
        }

        await updateDoc(psychiatristRef, {
          bookedVideo: {
            ...bookedVideo,
            [dateStr]: dateBookings,
          },
        });
      }

      await updateDoc(appointmentRef, {
        status: "Dibatalkan",
      });

      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt.id === appointment.id ? { ...apt, status: "Dibatalkan" } : apt
        )
      );
    } catch (error) {
      console.error("Error canceling appointment:", error);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  const handleDownloadInvoice = (appointment: Appointment) => {
    const invoiceData = {
      id: appointment.id || "",
      date: appointment.date,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      method: appointment.method,
      time: appointment.time,
      price: appointment.price,
      status: appointment.status,
    };

    const doc = generateInvoicePDF(invoiceData);
    doc.save(`invoice-${appointment.id}.pdf`);
  };

  const CountdownTimer = ({
    appointment,
    onExpire,
  }: {
    appointment: Appointment;
    onExpire: () => void;
  }) => {
    const [hasExpired, setHasExpired] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
      const calculateTimeLeft = () => {
        if (!appointment.createdAt) return "00:00";

        const now = Date.now();
        const expiryTime = appointment.createdAt + 30 * 60 * 1000;
        const diff = expiryTime - now;

        if (diff <= 0) {
          setHasExpired(true);
          onExpire();
          return "00:00";
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
      };

      const timer = setInterval(() => {
        const timeRemaining = calculateTimeLeft();
        setTimeLeft(timeRemaining);

        if (timeRemaining === "00:00") {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }, [appointment.createdAt, onExpire]);

    return hasExpired ? null : (
      <span className="text-red-500">Bayar dalam: {timeLeft}</span>
    );
  };

  const handleExpiredPayment = async (appointment: Appointment) => {
    if (!appointment.id) return;

    try {
      const appointmentRef = doc(db, "appointments", appointment.id);
      await updateDoc(appointmentRef, {
        status: "Pembayaran tidak berhasil",
      });

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointment.id
            ? { ...apt, status: "Pembayaran tidak berhasil" }
            : apt
        )
      );

      const psychiatristRef = doc(
        db,
        "psychiatrists",
        appointment.psychiatristId
      );
      const dateStr = format(Number(appointment.date), "yyyy-MM-dd");

      const docSnap = await getDoc(psychiatristRef);
      if (!docSnap.exists()) return;

      const psychiatristData = docSnap.data();

      if (appointment.method === "Chat") {
        const currentBookedChat = psychiatristData?.bookedChat || {};
        await updateDoc(psychiatristRef, {
          chatPatientQuota: (psychiatristData?.chatPatientQuota || 0) + 1,
          bookedChat: {
            ...currentBookedChat,
            [dateStr]: Math.max(0, (currentBookedChat[dateStr] || 0) - 1),
          },
        });
      } else if (appointment.method === "Video") {
        const bookedVideo = psychiatristData?.bookedVideo || {};
        const dateBookings = bookedVideo[dateStr] || [];

        const [startTime, endTime] = appointment.time.split(" - ");
        const [startHour, startMinute] = startTime.split(".").map(Number);
        const [endHour, endMinute] = endTime.split(".").map(Number);
        const startMinutes = startHour * 60 + (startMinute || 0);
        const endMinutes = endHour * 60 + (endMinute || 0);

        const newBookings = dateBookings.filter((_, index, array) => {
          if (index % 2 === 0) {
            return (
              array[index] !== startMinutes || array[index + 1] !== endMinutes
            );
          }
          return true;
        });

        await updateDoc(psychiatristRef, {
          bookedVideo: {
            ...bookedVideo,
            [dateStr]: newBookings,
          },
        });
      }
    } catch (error) {
      console.error("Error handling expired payment:", error);
    }
  };

  const ActionButton = ({
    status,
    appointment,
  }: {
    status: string;
    appointment: Appointment;
  }) => {
    const isLoading = loadingAppointmentId === appointment.id;
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
      if (status === "Menunggu pembayaran" && appointment.createdAt) {
        const now = Date.now();
        const expiryTime = appointment.createdAt + 30 * 60 * 1000;
        setIsExpired(now > expiryTime);
      }
    }, [status, appointment.createdAt]);

    if (status === "Menunggu pembayaran") {
      if (isExpired) {
        return null;
      }

      return (
        <button
          className={`bg-[#187DA8] text-white px-3 py-1 rounded hover:bg-sky-600 relative
                      dark:bg-blue-700 dark:hover:bg-blue-800 ${
                        // Dark mode styles
                        isLoading ? "cursor-not-allowed opacity-70" : ""
                      }`}
          onClick={() => handlePayment(appointment)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="opacity-0">Bayar</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </>
          ) : (
            "Bayar"
          )}
        </button>
      );
    }
    if (status === "Terjadwal") {
      return (
        <button
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800" // Dark mode styles
          onClick={() => handleOpenModal(appointment)}
        >
          Batal
        </button>
      );
    }
    return null;
  };

  const InvoiceLink = ({
    status,
    appointment,
  }: {
    status: string;
    appointment: Appointment;
  }) => {
    const handleExpiredPayment = async () => {
      if (!appointment.id) return;

      try {
        const appointmentRef = doc(db, "appointments", appointment.id);
        const psychiatristRef = doc(
          db,
          "psychiatrists",
          appointment.psychiatristId
        );
        const dateStr = format(Number(appointment.date), "yyyy-MM-dd");

        const docSnap = await getDoc(psychiatristRef);
        if (!docSnap.exists()) return;

        const psychiatristData = docSnap.data();

        if (appointment.method === "Chat") {
          const currentBookedChat = psychiatristData?.bookedChat || {};
          await updateDoc(psychiatristRef, {
            chatPatientQuota: (psychiatristData?.chatPatientQuota || 0) + 1,
            bookedChat: {
              ...currentBookedChat,
              [dateStr]: Math.max(0, (currentBookedChat[dateStr] || 0) - 1),
            },
          });
        } else if (appointment.method === "Video") {
          const bookedVideo = psychiatristData?.bookedVideo || {};
          const dateBookings = bookedVideo[dateStr] || [];

          const [startTime, endTime] = appointment.time.split(" - ");
          const [startHour, startMinute] = startTime.split(".").map(Number);
          const [endHour, endMinute] = endTime.split(".").map(Number);
          const startMinutes = startHour * 60 + (startMinute || 0);
          const endMinutes = endHour * 60 + (endMinute || 0);

          const newBookings = dateBookings.filter((_, index, array) => {
            if (index % 2 === 0) {
              return (
                array[index] !== startMinutes || array[index + 1] !== endMinutes
              );
            }
            return true;
          });

          await updateDoc(psychiatristRef, {
            bookedVideo: {
              ...bookedVideo,
              [dateStr]: newBookings,
            },
          });
        }

        await updateDoc(appointmentRef, {
          status: "Dibatalkan",
        });

        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointment.id ? { ...apt, status: "Dibatalkan" } : apt
          )
        );
      } catch (error) {
        console.error("Error handling expired payment:", error);
      }
    };

    if (status === "Menunggu pembayaran") {
      return (
        <CountdownTimer
          appointment={appointment}
          onExpire={handleExpiredPayment}
        />
      );
    }

    if (
      status === "Menunggu pembayaran" ||
      status === "Dibatalkan" ||
      !appointment.id
    ) {
      return null;
    }

    return (
      <button
        onClick={() => handleDownloadInvoice(appointment)}
        className="text-[#187DA8] underline hover:text-sky-600 dark:text-blue-400 dark:hover:text-blue-300" // Dark mode styles
      >
        Lihat Struk
      </button>
    );
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-[#f5eee3] flex flex-col items-center justify-center px-6 py-10 dark:bg-[#161F36] transition-colors duration-300">
      {" "}
      {/* Main background */}
      <AppointmentStatusUpdater />
      {/* Judul */}
      <div className="w-full max-w-screen-xl mb-4 sm:mr-60">
        <h1 className="text-4xl font-bold text-[#5a4a2f] dark:text-white">
          Jadwal Sesi
        </h1>{" "}
        {/* Title */}
      </div>
      {loading ? (
        <div className="text-center text-gray-600 dark:text-gray-300">
          Loading...
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-300">
          Belum ada jadwal sesi
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="w-full max-w-screen-xl block md:hidden">
            {appointments.map((item) => {
              const isCanceled = item.status === "Dibatalkan";
              const isDone = item.status === "Selesai";
              const isScheduled = item.status === "Menunggu pembayaran";

              return (
                <div
                  key={
                    item.id ||
                    `${item.psychiatristId}-${item.date}-${item.time}`
                  }
                  className="bg-[#E4DCCC] rounded-lg shadow-md p-4 mb-4 text-[#5a4a2f] dark:bg-[#1A2947] dark:text-white" // Mobile card background and text
                >
                  <p className="font-semibold text-lg">{item.doctorName}</p>
                  <p className="text-sm">
                    {item.method === "Chat" ? "Chat" : item.method}
                  </p>
                  <p className="text-sm">{formatAppointmentDate(item)}</p>
                  <div className="flex justify-between items-center mt-2">
                    <ActionButton status={item.status} appointment={item} />
                    <InvoiceLink status={item.status} appointment={item} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View */}
          <div
            className="w-full max-w-screen-2xl rounded-lg p-6 sm:p-10 shadow-lg overflow-x-auto hidden md:flex flex-col min-h-[600px]
                          bg-[#E4DCCC] dark:bg-[#1A2947]"
          >
            {" "}
            {/* Desktop table container background */}
            {/* Table section */}
            <div className="min-w-[900px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-2xl border-b-2 border-black text-[#5a4a2f] dark:border-gray-600 dark:text-white">
                    {" "}
                    {/* Table header row */}
                    <th className="py-3">Tanggal</th>
                    <th className="py-3">Psikolog</th>
                    <th className="py-3">Metode</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-center">Aksi</th>
                    <th className="py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments.map((item) => (
                    <tr
                      key={
                        item.id ||
                        `${item.psychiatristId}-${item.date}-${item.time}`
                      }
                      className="text-lg font-medium border-b border-black text-[#5a4a2f] dark:border-gray-700 dark:text-gray-300" // Table row
                    >
                      <td className="py-4">{formatAppointmentDate(item)}</td>
                      <td className="py-4">{item.doctorName}</td>
                      <td className="py-4">{item.method}</td>
                      <td className="py-4">{item.status}</td>
                      <td className="py-4 text-center">
                        <ActionButton status={item.status} appointment={item} />
                      </td>
                      <td className="py-4 text-center">
                        <InvoiceLink status={item.status} appointment={item} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex grow"></div>
            <div className="w-full flex justify-between items-center mt-5 gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`bg-sky-700 text-white font-semibold px-4 py-2 rounded w-full sm:w-auto
                            dark:bg-[#86939c] dark:hover:bg-[#BACBD8] ${
                              // Dark mode for pagination buttons
                              currentPage === 1 ? "invisible" : "visible"
                            }`}
              >
                Sebelumnya
              </button>

              <div className="pagination-dots flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full cursor-pointer ${
                      currentPage === i + 1
                        ? "bg-gray-800 dark:bg-white" // Active dot
                        : "bg-gray-400 dark:bg-gray-600" // Inactive dot
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  ></span>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`bg-sky-700 text-white font-semibold px-4 py-2 rounded w-full sm:w-auto
                            dark:bg-[#86939c] dark:hover:bg-[#BACBD8] ${
                              // Dark mode for pagination buttons
                              currentPage === totalPages
                                ? "invisible"
                                : "visible"
                            }`}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </>
      )}
      {/* Modal Konfirmasi Pembatalan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent bg-opacity-10 backdrop-brightness-10 backdrop-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[300px] sm:w-[400px] dark:bg-gray-800 dark:text-white">
            {" "}
            {/* Modal background and text */}
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Konfirmasi Pembatalan
            </h2>
            <p className="mt-2 text-black dark:text-gray-300">
              Apakah Anda yakin ingin membatalkan jadwal ini?
            </p>
            <div className="mt-4 flex justify-end gap-4">
              <Button
                variant="outline"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 flex-1 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600" // Modal cancel button
                onClick={handleCloseModal}
              >
                Batal
              </Button>
              <Button
                className="px-4 py-2 bg-blue-200 text-black rounded-md hover:bg-blue-300 flex-1 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800" // Modal confirm button
                onClick={handleConfirmCancel}
              >
                Ya, Lanjutkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAppointment;
