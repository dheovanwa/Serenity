import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";
import Loading from "./Loading"; // Assuming this is dark mode aware
import { format } from "date-fns";
import AppointmentStatusUpdater from "../components/AppointmentStatusUpdater"; // Assuming this is dark mode aware
import { notificationScheduler } from "../utils/notificationScheduler";
import ProfilePic from "../assets/default_profile_image.svg"; // Pastikan path benar
import send from "../assets/send.svg"; // Pastikan path benar

interface Appointment {
  id?: string;
  psychiatristId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  gejala: string;
  method: string;
  date: string;
  time: string;
  dayName: string;
  price: number;
  status: string;
  createdAt?: number;
  psychiatristImage?: string; // Tambahkan ini agar bisa menampilkan gambar
}

const STATUS_FILTER = ["Terjadwal", "Sedang berlangsung", "Selesai"];

// Tambahkan prop isDarkMode ke ManageAppointmentPsy
interface ManageAppointmentPsyProps {
  isDarkMode: boolean;
}

const ManageAppointmentPsy: React.FC<ManageAppointmentPsyProps> = ({
  isDarkMode,
}) => {
  // Terima prop isDarkMode
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Pagination
  const indexOfLastAppointment = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstAppointment = indexOfLastAppointment - ITEMS_PER_PAGE;
  const currentAppointments = appointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const documentId = localStorage.getItem("documentId");
        if (!documentId) {
          setLoading(false); // Pastikan loading false jika tidak ada ID
          return;
        }

        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          where("psychiatristId", "==", documentId),
          where("status", "in", STATUS_FILTER),
          orderBy("date", "asc")
        );
        const querySnapshot = await getDocs(q);

        let fetchedAppointments: Appointment[] = [];
        for (const docSnap of querySnapshot.docs) {
          const aptData = docSnap.data();
          let patientName = aptData.patientName;
          let patientImage = ProfilePic;

          // Fetch patient photo
          if (aptData.patientId) {
            try {
              const patientDocRef = doc(db, "users", aptData.patientId);
              const patientDocSnap = await getDoc(patientDocRef);
              if (patientDocSnap.exists()) {
                const patientData = patientDocSnap.data();
                patientImage = patientData.profilePicture || ProfilePic;
              }
            } catch (error) {
              console.error("Error fetching patient photo:", error);
            }
          }

          fetchedAppointments.push({
            id: docSnap.id,
            ...(aptData as Appointment),
            patientName,
            patientPhoto: patientImage, // Tambahkan ini agar bisa di-render
          });
        }

        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const todayStr = now.toLocaleDateString("id-ID");

        fetchedAppointments = fetchedAppointments.map((apt) => {
          const aptDate = new Date(apt.date);
          const aptDateStr = aptDate.toLocaleDateString("id-ID");
          let status = apt.status;

          if (
            apt.method === "Chat" &&
            aptDateStr === todayStr &&
            status === "Terjadwal"
          ) {
            status = "Sedang berlangsung";
          } else if (
            apt.method === "Video" &&
            aptDateStr === todayStr &&
            apt.time &&
            status === "Terjadwal"
          ) {
            const [start, end] = apt.time.split(" - ");
            const [startH, startM] = start.split(".").map(Number);
            const [endH, endM] = end.split(".").map(Number);
            const startMinutes = startH * 60 + (startM || 0);
            const endMinutes = endH * 60 + (endM || 0);
            if (nowMinutes >= startMinutes && nowMinutes < endMinutes) {
              status = "Sedang berlangsung";
            }
          }
          return { ...apt, status };
        });

        fetchedAppointments = fetchedAppointments.sort((a, b) => {
          if (a.method === b.method) {
            if (a.method === "Video" && b.method === "Video") {
              const getStartMinutes = (time: string) => {
                if (!time) return 0;
                const [start] = time.split(" - ");
                const [h, m] = start.split(".").map(Number);
                return h * 60 + (m || 0);
              };
              return getStartMinutes(a.time) - getStartMinutes(b.time);
            }
            return 0;
          }
          return a.method === "Chat" ? -1 : 1;
        });

        setAppointments(fetchedAppointments);
        await notificationScheduler.restoreScheduledNotifications();
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const formatAppointmentDate = (item: Appointment) => {
    const date = new Date(item.date);
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
      <AppointmentStatusUpdater />{" "}
      {/* Pastikan ini adalah komponen React.FC yang di-render */}
      {loading && <Loading isDarkMode={isDarkMode} />}{" "}
      {/* Teruskan isDarkMode ke Loading */}
      {/* Judul */}
      <div className="w-full max-w-screen-xl mb-4 sm:mr-60">
        <h1 className="text-4xl font-bold text-[#5a4a2f] dark:text-[#E6E6E6]">
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
            {appointments.map((item) => (
              <div
                key={
                  item.id || `${item.psychiatristId}-${item.date}-${item.time}`
                }
                className="bg-[#E4DCCC] rounded-lg shadow-md p-4 mb-4 text-[#5a4a2f] dark:bg-gray-800 dark:text-[#E6E6E6]" // Mobile card
              >
                <p className="font-semibold text-lg">{item.patientName}</p>
                <p className="text-sm">{item.method}</p>
                <p className="text-sm">{formatAppointmentDate(item)}</p>
                <p className="text-sm">{item.status}</p>
                {/* Tambahkan tombol aksi jika diperlukan untuk mobile */}
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="w-full max-w-screen-2xl bg-[#E4DCCC] rounded-lg p-6 sm:p-10 shadow-lg overflow-x-auto hidden md:flex flex-col min-h-[600px] dark:bg-[#1A2947]">
            {" "}
            {/* Desktop table container */}
            <div className="min-w-[900px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-2xl border-b-2 border-black text-[#5a4a2f] dark:border-gray-600 dark:text-[#E6E6E6]">
                    {" "}
                    {/* Table header */}
                    <th className="py-3">Tanggal</th>
                    <th className="py-3">Pasien</th>
                    <th className="py-3">Metode</th>
                    <th className="py-3">Status</th>
                    {/* <th className="py-3 text-center">Aksi</th> Jika Anda ingin kolom aksi juga */}
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
                      <td className="py-4"></td>
                      <td className="py-4">{item.method}</td>
                      <td className="py-4">{item.status}</td>
                      {/* <td className="py-4 text-center">Aksi Buttons</td> Jika Anda ingin kolom aksi juga */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex grow"></div>
            {/* Pagination */}
            <div className="w-full flex justify-between items-center mt-6 gap-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`bg-sky-700 text-white font-semibold px-4 py-2 rounded w-full sm:w-auto
                            dark:bg-blue-700 dark:hover:bg-blue-800 ${
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
                        ? "bg-gray-800 dark:bg-white"
                        : "bg-gray-400 dark:bg-gray-600"
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  ></span>
                ))}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`bg-sky-700 text-white font-semibold px-4 py-2 rounded w-full sm:w-auto
                            dark:bg-blue-700 dark:hover:bg-blue-800 ${
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
    </div>
  );
};

export default ManageAppointmentPsy;
