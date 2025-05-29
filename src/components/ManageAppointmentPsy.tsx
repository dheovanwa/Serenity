import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../config/firebase";
import Loading from "./Loading";
import { format } from "date-fns";
import AppointmentStatusUpdater from "../components/AppointmentStatusUpdater";

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
}

const STATUS_FILTER = ["Terjadwal", "Sedang berlangsung", "Selesai"];

const ManageAppointmentPsy = () => {
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
        if (!documentId) return;

        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          where("psychiatristId", "==", documentId),
          where("status", "in", STATUS_FILTER),
          orderBy("date", "asc")
        );
        const querySnapshot = await getDocs(q);

        let fetchedAppointments: Appointment[] = [];
        querySnapshot.forEach((doc) => {
          fetchedAppointments.push({
            id: doc.id,
            ...(doc.data() as Appointment),
          });
        });

        // Update status to "Sedang berlangsung" if Chat today or Video today and current time
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const todayStr = now.toLocaleDateString("id-ID");

        fetchedAppointments = fetchedAppointments.map((apt) => {
          const aptDate = new Date(apt.date);
          const aptDateStr = aptDate.toLocaleDateString("id-ID");
          let status = apt.status;

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
            }
          }
          return { ...apt, status };
        });

        // Sort: Chat first, then Video (by start time ascending)
        fetchedAppointments = fetchedAppointments.sort((a, b) => {
          if (a.method === b.method) {
            if (a.method === "Video" && b.method === "Video") {
              // Sort by start time (e.g. "09.00 - 10.00")
              const getStartMinutes = (time: string) => {
                if (!time) return 0;
                const [start] = time.split(" - ");
                const [h, m] = start.split(".").map(Number);
                return h * 60 + (m || 0);
              };
              return getStartMinutes(a.time) - getStartMinutes(b.time);
            }
            // If both are Chat, keep original order (by date)
            return 0;
          }
          // Chat comes before Video
          return a.method === "Chat" ? -1 : 1;
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
    <div className="min-h-screen bg-[#f5eee3] flex flex-col items-center justify-center px-6 py-10">
      <AppointmentStatusUpdater />
      {loading && <Loading />}
      <div className="w-full max-w-screen-xl mb-4 sm:mr-60">
        <h1 className="text-4xl font-bold text-[#5a4a2f]">Jadwal Sesi</h1>
      </div>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center text-gray-600">Belum ada jadwal sesi</div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="w-full max-w-screen-xl block md:hidden">
            {appointments.map((item) => (
              <div
                key={
                  item.id || `${item.psychiatristId}-${item.date}-${item.time}`
                }
                className="bg-[#E4DCCC] rounded-lg shadow-md p-4 mb-4 text-[#5a4a2f]"
              >
                <p className="font-semibold text-lg">{item.patientName}</p>
                <p className="text-sm">{item.method}</p>
                <p className="text-sm">{formatAppointmentDate(item)}</p>
                <p className="text-sm">{item.status}</p>
              </div>
            ))}
          </div>
          {/* Desktop View */}
          <div className="w-full max-w-screen-2xl bg-[#E4DCCC] rounded-lg p-6 sm:p-10 shadow-lg overflow-x-auto hidden md:block min-h-[600px] flex flex-col justify-between">
            <div className="min-w-[900px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-2xl border-b-2 border-black text-[#5a4a2f]">
                    <th className="py-3">Tanggal</th>
                    <th className="py-3">Pasien</th>
                    <th className="py-3">Metode</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments.map((item) => (
                    <tr
                      key={
                        item.id ||
                        `${item.psychiatristId}-${item.date}-${item.time}`
                      }
                      className="text-lg font-medium border-b border-black text-[#5a4a2f]"
                    >
                      <td className="py-4">{formatAppointmentDate(item)}</td>
                      <td className="py-4">{item.patientName}</td>
                      <td className="py-4">{item.method}</td>
                      <td className="py-4">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="w-full flex justify-between items-center mt-6 gap-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`bg-sky-700 text-white font-semibold px-4 py-2 rounded w-full sm:w-auto ${
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
                      currentPage === i + 1 ? "bg-gray-800" : "bg-gray-400"
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  ></span>
                ))}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`bg-sky-700 text-white font-semibold px-4 py-2 rounded w-full sm:w-auto ${
                  currentPage === totalPages ? "invisible" : "visible"
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
