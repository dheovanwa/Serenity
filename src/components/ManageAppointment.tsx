import React from "react";

const appointments = [
  {
    id: 1,
    tanggal: "Senin, 21 Juli 2025",
    jam: "10:00 WIB",
    psikiater: "Titin Sulaiman",
    metode: "Video Call",
    status: "Terjadwal",
    aksi: "Batal",
  },
  {
    id: 2,
    tanggal: "Selasa, 1 Juli 2025",
    jam: "14:00 WIB",
    psikiater: "Titin Sulaiman",
    metode: "Video Call",
    status: "Terjadwal",
    aksi: "Batal",
  },
  {
    id: 3,
    tanggal: "Rabu, 12 Juni 2025",
    jam: "09:00 WIB",
    psikiater: "Titin Sulaiman",
    metode: "Video Call",
    status: "Canceled",
    aksi: "",
  },
  {
    id: 4,
    tanggal: "Kamis, 1 Maret 2025",
    jam: "11:00 WIB",
    psikiater: "Titin Sulaiman",
    metode: "Video Call",
    status: "Terjadwal",
    aksi: "Batal",
  },
  {
    id: 5,
    tanggal: "Minggu, 1 Februari 2025",
    psikiater: "Titin Sulaiman",
    metode: "Chat",
    status: "Selesai",
    aksi: "",
  },
];

const ManageAppointment = () => {
  return (
    <div className="min-h-screen bg-[#f5eee3] flex flex-col items-center justify-center px-6 py-10">
      {/* Judul */}
      <div className="w-full max-w-screen-xl mb-4 sm:mr-60">
        <h1 className="text-4xl font-bold text-[#5a4a2f]">Jadwal Sesi</h1>
      </div>

      {/* Mobile View */}
      <div className="w-full max-w-screen-xl block md:hidden">
        {appointments.map((item) => {
          const isCanceled = item.status === "Canceled";
          const isDone = item.status === "Selesai";
          const isScheduled = item.status === "Terjadwal";

          let statusLabel = null;
          if (isCanceled) statusLabel = "Dibatalkan";
          if (isDone) statusLabel = "Selesai";

          return (
            <div
              key={item.id}
              className="bg-[#E4DCCC] rounded-lg shadow-md p-4 mb-4 text-[#5a4a2f]"
            >
              <p className="font-semibold text-lg">{item.psikiater}</p>
              <p className="text-sm">
                {item.metode === "Chat" ? "Pesan" : item.metode}
              </p>
             <p className="text-sm">
              {item.metode === "Chat"
                ? item.tanggal
                : `${item.tanggal}, ${item.jam}`}
            </p>
              <div className="flex justify-between items-center mt-2">
                {isScheduled ? (
                  <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    Batal
                  </button>
                ) : (
                  <span
                    className={`text-sm font-semibold ${
                      isCanceled ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {statusLabel}
                  </span>
                )}
                {isDone && (
                  <button className="ml-2 text-blue-700 hover:underline text-sm font-semibold">
                    Unduh Resi
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View */}
      <div className="w-full max-w-screen-2xl bg-[#E4DCCC] rounded-lg p-6 sm:p-10 shadow-lg overflow-x-auto hidden md:block">
        <div className="min-w-[900px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-2xl border-b-2 border-black text-[#5a4a2f]">
                <th className="py-3">Tanggal</th>
                <th className="py-3">Psikiater</th>
                <th className="py-3">Metode</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((item) => (
                <tr
                  key={item.id}
                  className="text-lg font-medium border-b border-black text-[#5a4a2f]"
                >
                  <td className="py-4">
                    {item.metode === "Chat"
                      ? item.tanggal
                      : `${item.tanggal}, ${item.jam}`}
                  </td>

                  <td className="py-4">{item.psikiater}</td>
                  <td className="py-4">{item.metode}</td>
                  <td className="py-4">{item.status}</td>
                  <td className="py-4 flex gap-2 justify-center">
                    {item.aksi === "Batal" && (
                      <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                        Batal
                      </button>
                    )}
                    {item.status === "Selesai" && (
                      <button className="text-blue-700 hover:underline font-semibold text-sm">
                        Unduh Resi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 sm:gap-0">
          <button className="bg-sky-700 text-white font-semibold px-4 py-2 rounded w-full sm:w-auto">
            Sebelum
          </button>
          <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
            <div className="pagination-dots flex gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="w-2 h-2 bg-gray-800 rounded-full"></span>
            </div>
          </div>
          <button className="bg-sky-700 text-white font-semibold px-4 py-2 rounded w-full sm:w-auto">
            Berikut
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageAppointment;
